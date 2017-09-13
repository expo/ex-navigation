/**
 * @flow
 */

import _ from 'lodash';
import React, { cloneElement, Children, Component } from 'react';
import { Animated, Easing, View } from 'react-native';
import PropTypes from 'prop-types';

import UUID from 'uuid-js';

import * as ExNavigationStyles from '../ExNavigationStyles';
import SharedElementOverlay from './ExNavigationSharedElementOverlay';

import type {
  NavigationTransitionProps,
  NavigationTransitionSpec,
  NavigationSceneRendererProps,
} from '../navigation-experimental/NavigationTypeDefinition';

const DEFAULT_TRANSITION = {
  timing: Animated.timing,
  easing: Easing.inOut(Easing.ease),
  duration: 400,
};

type TransitionFn = (
  transitionProps: NavigationTransitionProps,
  prevTransitionProps: NavigationTransitionProps
) => void;

type State = {
  visible: boolean,
  elementStyles: Object,
  transitioningElementGroupToUid: ?string,
  transitioningElementGroupFromUid: ?string,
};

type Props = {
  id: string,
  children?: React.Element<*>,
  configureTransition?: ?(
    a: NavigationTransitionProps,
    b: ?NavigationTransitionProps
  ) => NavigationTransitionSpec,
  sceneAnimations?: ?(props: NavigationSceneRendererProps) => Object,
  navigationBarAnimations?: ?(props: NavigationSceneRendererProps) => Object,
  onTransitionStart?: ?TransitionFn,
  onTransitionEnd?: ?TransitionFn,
};

export default class SharedElementGroup extends Component {
  static getRouteStyle(transitionGroupEl) {
    const state = SharedElementOverlay.getStore().getState();
    return {
      ...state.elementGroups[transitionGroupEl._uid].style,
    };
  }

  static contextTypes = {
    sharedElementStore: PropTypes.any,
    scene: PropTypes.object,
  };

  static childContextTypes = {
    elementGroupUid: PropTypes.string,
  };

  props: Props;
  state: State = {
    visible: false,
    elementStyles: {},
    transitioningElementGroupToUid: null,
    transitioningElementGroupFromUid: null,
  };

  _elements: { [key: string]: React.Element<*> } = {};
  _isMounted: boolean = true;
  _store = this.context.sharedElementStore;
  _uid = UUID.create(1).toString();
  _unsubscribe: any;
  _sceneIndex = this.context.scene.index;

  getChildContext() {
    return {
      elementGroupUid: this._uid,
    };
  }

  componentWillMount() {
    this._unsubscribe = this._store.subscribe(() => {
      const storeState = this._store.getState();
      if (
        storeState.transitioningElementGroupFromUid ===
          this.state.transitioningElementGroupFromUid &&
        storeState.transitioningElementGroupToUid ===
          this.state.transitioningElementGroupToUid
      ) {
        return;
      }
      if (!this._isMounted) {
        return;
      }
      this.setState({
        transitioningElementGroupToUid: storeState.transitioningElementGroupToUid,
        transitioningElementGroupFromUid: storeState.transitioningElementGroupFromUid,
      });
    });

    if (this.state.transitioningElementGroupToUid === null) {
      this.setState({
        visible: true,
      });
    }
  }

  componentDidMount() {
    const { sharedElementStore: store, scene } = this.context;

    store.dispatch({
      type: 'REGISTER_GROUP',
      uid: this._uid,
      id: this.props.id,
      routeKey: scene.route.key,
      sceneIndex: scene.index,
      style: {
        configureTransition: this._configureTransition,
        sceneAnimations: this.props.sceneAnimations ||
          ExNavigationStyles.Fade.sceneAnimations,
        gestures: null,
        navigationBarAnimations: this.props.navigationBarAnimations ||
          ExNavigationStyles.Fade.navigationBarAnimations,
        onTransitionStart: this._onTransitionStart,
        onTransitionEnd: this._onTransitionEnd,
      },
      elements: Children.map(this.props.children, child => {
        if (__DEV__ && child.type.name !== 'SharedElement') {
          throw new Error(
            'All children of a SharedElementGroup must be SharedElements.'
          );
        }
        return child;
      }),
    });
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (
      this.state.transitioningElementGroupToUid !==
        nextState.transitioningElementGroupToUid ||
      this.state.transitioningElementGroupFromUid !==
        nextState.transitioningElementGroupFromUid
    ) {
      if (
        this._uid === nextState.transitioningElementGroupToUid ||
        this._uid === nextState.transitioningElementGroupFromUid
      ) {
        // TODO: Ugh, need to add enough delay to prevent image flicker on iOS.
        // Might want to try to fix image loading to it is sync if the image is
        // cached.
        setTimeout(() => {
          this.setState({
            visible: false,
          });
        }, 100);
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

    // TODO: Figure out why it doesnt work without this.
    requestAnimationFrame(() => {
      store.dispatch({
        type: 'UNREGISTER_GROUP',
        uid: this._uid,
      });
    });
  }

  render() {
    const style = {
      opacity: this.state.visible ? 1 : 0,
    };

    return (
      <View style={style}>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            ref: c => {
              this._elements[child.props.id] = c;
            },
          })
        )}
      </View>
    );
  }

  _onTransitionStart = (
    transitionProps: NavigationTransitionProps,
    prevTransitionProps: NavigationTransitionProps,
    isTransitionTo?: boolean = false
  ): void => {
    if (!this._isMounted) {
      return;
    }

    const { scene } = transitionProps;
    const { scene: prevScene } = prevTransitionProps;

    if (
      scene.index !== this._sceneIndex && prevScene.index !== this._sceneIndex
    ) {
      return;
    }

    requestAnimationFrame(() => {
      const store = this.context.sharedElementStore;

      // TODO: We want some way for the target transition group to be notified that
      // it is being transitioned to so that it can animated things using hooks like
      // onTransitionStart and onTransitionEnd. Right now I'm just calling onTransitionStart
      // on the target group too but we might want to make it a different prop or pass
      // something to know if the view is being transitioned to or from.
      if (isTransitionTo) {
        // $FlowFixMe
        Promise.all(
          Object.values(this._elements).map(e => e.measure())
        ).then(() => {
          store.dispatch({
            type: 'TRANSITION_TO_VIEW_READY',
          });
        });

        if (this.props.onTransitionStart) {
          this.props.onTransitionStart(transitionProps, prevTransitionProps);
        }
        return;
      }

      const state = store.getState();

      let possibleOtherGroups;
      if (scene.index > prevScene.index) {
        // pushing
        possibleOtherGroups = _.filter(
          state.elementGroups,
          group =>
            group.routeKey === scene.route.key &&
            group.sceneIndex === scene.index
        );
      } else {
        possibleOtherGroups = _.filter(
          state.elementGroups,
          group =>
            group.routeKey === prevScene.route.key &&
            group.sceneIndex === prevScene.index
        );
      }
      const otherGroup = _.find(
        possibleOtherGroups,
        group => group.id === this.props.id
      );
      if (!otherGroup) {
        return;
      }

      if (this.props.onTransitionStart) {
        this.props.onTransitionStart(transitionProps, prevTransitionProps);
      }
      if (otherGroup.style.onTransitionStart) {
        otherGroup.style.onTransitionStart(
          transitionProps,
          prevTransitionProps,
          true
        );
      }

      // $FlowFixMe
      Promise.all(
        Object.values(this._elements).map(e => e.measure())
      ).then(() => {
        store.dispatch({
          type: 'START_TRANSITION_FOR_ELEMENT_GROUPS',
          fromUid: scene.index > prevScene.index ? this._uid : otherGroup.uid,
          toUid: scene.index > prevScene.index ? otherGroup.uid : this._uid,
          progress: transitionProps.progress,
        });
      });
    });
  };

  _onTransitionEnd = (
    transitionProps: NavigationTransitionProps,
    prevTransitionProps: NavigationTransitionProps,
    isTransitionTo?: boolean = false
  ) => {
    const { scene } = transitionProps;
    const { scene: prevScene } = prevTransitionProps;

    if (
      scene.index !== this._sceneIndex && prevScene.index !== this._sceneIndex
    ) {
      return;
    }

    if (isTransitionTo) {
      if (this.props.onTransitionEnd) {
        this.props.onTransitionEnd(transitionProps, prevTransitionProps);
      }
      return;
    }

    const store = this.context.sharedElementStore;
    const state = store.getState();
    const otherUid = scene.index > prevScene.index
      ? this.state.transitioningElementGroupToUid
      : this.state.transitioningElementGroupFromUid;
    const otherGroup = state.elementGroups[otherUid];
    if (!otherGroup) {
      return;
    }

    store.dispatch({
      type: 'END_TRANSITION_FOR_ELEMENT_GROUPS',
    });

    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(transitionProps, prevTransitionProps);
    }
    if (otherGroup.style.onTransitionEnd) {
      otherGroup.style.onTransitionEnd(
        transitionProps,
        prevTransitionProps,
        true
      );
    }
  };

  _configureTransition = (
    a: NavigationTransitionProps,
    b: ?NavigationTransitionProps
  ): NavigationTransitionSpec => {
    const userTransition = this.props.configureTransition
      ? this.props.configureTransition(a, b)
      : DEFAULT_TRANSITION;
    const { timing: userTiming } = userTransition;

    const timing = (...timingArgs) => {
      const timingFn = userTiming
        ? userTiming(...timingArgs)
        : Animated.timing(...timingArgs);
      return {
        start: cb => {
          // TODO: Figure out properly how this work and maybe wait for overlay
          // elements to be rendered before starting the animation.
          setTimeout(() => timingFn.start(cb), 100);
        },
        stop: () => {
          timingFn.stop();
        },
      };
    };

    return {
      ...userTransition,
      timing,
    };
  };
}
