/**
 * @flow
 */

import _ from 'lodash';
import React, { cloneElement, Children, PropTypes } from 'react';
import findNodeHandle from 'react/lib/findNodeHandle';
import {
  Animated,
  View,
  UIManager,
} from 'react-native';

import UUID from 'uuid-js';

import * as ExNavigationStyles from '../ExNavigationStyles';
import SharedElementOverlay from './ExNavigationSharedElementOverlay';

type State = {
  visible: boolean,
  elementStyles: Object,
  transitioningElementGroupToUid: ?string,
};

type Props = {
  id: string,
};

// TODO: Fix flow errors all over this file.

export default class SharedElementGroup extends React.Component {
  _uid: string;
  _elements: Object;
  _innerViewRef: React.Element<*>;
  _store: any;
  state: State;

  static getRouteStyle(transitionGroupEl) {
    const state = SharedElementOverlay.getStore().getState();
    return {
      ...state.elementGroups[transitionGroupEl._uid].style,
    };
  }

  static contextTypes = {
    sharedElementStore: PropTypes.any,
  };

  static childContextTypes = {
    elementGroupUid: PropTypes.string,
  }

  constructor(props: Props, context: any) {
    super(props);
    this._uid = UUID.create(1).toString();
    this._elements = {};
    this.state = {
      visible: false,
      elementStyles: {},
      transitioningElementGroupToUid: null,
    };
    this._store = context.sharedElementStore;
    this._isMounted = true;
    this._unsubscribe = this._store.subscribe(() => {
      const state = this._store.getState();
      if (state.transitioningElementGroupFromUid === this.state.transitioningElementGroupFromUid &&
          state.transitioningElementGroupToUid === this.state.transitioningElementGroupToUid) {
        return;
      }
      if (!this._isMounted) {
        return;
      }
      this.setState({
        transitioningElementGroupToUid: state.transitioningElementGroupToUid,
        transitioningElementGroupFromUid: state.transitioningElementGroupFromUid,
      });
    });
  }

  getChildContext() {
    return {
      elementGroupUid: this._uid,
    };
  }

  componentDidMount() {
    this.measure(() => {
      _.forEach(this._elements, el => el.measure());
    });

    if (this.state.transitioningElementGroupToUid === null) {
      this.setState({
        visible: true,
      });
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (this.state.transitioningElementGroupToUid !== nextState.transitioningElementGroupToUid ||
        this.state.transitioningElementGroupFromUid !== nextState.transitioningElementGroupFromUid) {
      if (this._uid === nextState.transitioningElementGroupToUid ||
        this._uid === nextState.transitioningElementGroupFromUid) {
        // TODO: Figure out a better way to avoid flicker on iOS
        requestAnimationFrame(() => {
          this.setState({
            visible: false,
          });
        });
      } else {
        this.setState({
          visible: true,
        });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    const store = this.context.sharedElementStore;
    requestAnimationFrame(() => {
      store.dispatch({
        type: 'UNREGISTER_GROUP',
        uid: this._uid,
      });
    });
  }

  getInnerViewNode() {
    return findNodeHandle(this._innerViewRef);
  }

  render() {
    const style = {
      opacity: this.state.visible ? 1 : 0,
    };

    return (
      <View ref={c => { this._innerViewRef = c; }} style={style}>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            ref: c => { this._elements[child.props.id] = c; },
          })
        )}
      </View>
    );
  }

  _onTransitionStart = (transitionProps, prevTransitionProps) => {
    this.measure(() => {
      const store = this.context.sharedElementStore;

      const { scene } = transitionProps;
      const { scene: prevScene } = prevTransitionProps;

      let possibleOtherGroups;
      if (scene.index > prevScene.index) { //pushing
        possibleOtherGroups = _.filter(store.getState().elementGroups, group => group.routeKey === scene.route.key);
      } else {
        possibleOtherGroups = _.filter(store.getState().elementGroups, group => group.routeKey === prevScene.route.key);
      }

      const otherGroup = _.find(possibleOtherGroups, group => group.id === this.props.id);
      if (!otherGroup) {
        throw new Error(`Cannot transition this group with id '${this.props.id}'. No matching group found in next route.`);
      }

      _.forEach(this._elements, el => el.measure());

      requestAnimationFrame(() => {
        store.dispatch({
          type: 'START_TRANSITION_FOR_ELEMENT_GROUPS',
          fromUid: scene.index > prevScene.index ? this._uid : otherGroup.uid,
          toUid: scene.index > prevScene.index ? otherGroup.uid : this._uid,
          progress: transitionProps.progress,
        });
      });
    });

    if (this.props.onTransitionStart) {
      this.props.onTransitionStart(transitionProps, prevTransitionProps);
    }
  }

  _onTransitionEnd = (transitionProps, prevTransitionProps) => {
    const store = this.context.sharedElementStore;
    store.dispatch({
      type: 'END_TRANSITION_FOR_ELEMENT_GROUPS',
    });
  }

  measure = (cb: () => void) => {
    UIManager.measureInWindow(
      findNodeHandle(this._innerViewRef),
      (x, y, width, height) => {
        const store = this.context.sharedElementStore;
        store.dispatch({
          type: 'REGISTER_GROUP',
          uid: this._uid,
          id: this.props.id,
          routeKey: this.props.route.key,
          style: {
            configureTransition: this._configureTransition,
            sceneAnimations: this.props.sceneAnimations,
            gestures: ExNavigationStyles.FloatVertical.gestures,
            navigationBarAnimations: ExNavigationStyles.Fade.navigationBarAnimations,
            onTransitionStart: this._onTransitionStart,
            onTransitionEnd: this._onTransitionEnd,
          },
          metrics: { x, y, width, height },
          elements: Children.map(this.props.children, (child) => {
            if (child.type.name !== 'SharedElement') {
              throw new Error('All children of a SharedElementGroup must be SharedElements.');
            }
            return child;
          }),
        });

        if (cb) {
          cb();
        }
      }
    );
  }

  _configureTransition = (...args) => {
    const userTransition = this.props.configureTransition(...args);
    const { timing: userTiming } = userTransition;

    const timing = (...timingArgs) => {
      const timingFn = userTiming(...timingArgs);
      let startCb;
      return {
        start: (cb) => {
          startCb = cb;
          // TODO: Figure out properly how this work and maybe wait for overlay
          // elements to be rendered before starting the animation.
          requestAnimationFrame(() => timingFn.start(startCb));
        },
        ready: () => {
          return timingFn.start(startCb);
        },
        stop: () => {
          startCb = null;
          return timingFn.stop();
        },
      };
    };

    return {
      ...userTransition,
      timing,
    };
  }
}
