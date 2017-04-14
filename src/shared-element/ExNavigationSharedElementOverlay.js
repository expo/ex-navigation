/**
 * @flow
 */

import React, { cloneElement } from 'react';
import { View, StyleSheet, findNodeHandle } from 'react-native';

import { createStore } from 'redux';
import storeShape from 'react-redux/lib/utils/storeShape';

import SharedElementReducer from './ExNavigationSharedElementReducer';

type Props = {
  children?: ?React.Element<*>,
};

type State = {
  visible: boolean,
  elementGroups: Object,
  transitioningElementGroupFromUid: ?string,
  transitioningElementGroupToUid: ?string,
  progress: ?mixed,
};

const sharedElementStore = createStore(SharedElementReducer);

export default class SharedElementOverlay extends React.Component {
  static getStore() {
    return sharedElementStore;
  }

  static childContextTypes = {
    sharedElementStore: storeShape,
  };

  props: Props;
  state: State = {
    visible: false,
    elementGroups: {},
    transitioningElementGroupFromUid: null,
    transitioningElementGroupToUid: null,
    progress: null,
  };

  _innerViewRef: React.Element<*>;
  _store: Object;
  _unsubscribe: ?Function;

  constructor(props: Props) {
    super(props);

    this._store = SharedElementOverlay.getStore();
  }

  getChildContext() {
    return {
      sharedElementStore: this._store,
    };
  }

  componentDidMount() {
    this._unsubscribe = this._store.subscribe(() => {
      const state = this._store.getState();
      this.setState({
        ...state,
        visible: state.transitioningElementGroupFromUid &&
          state.transitioningElementGroupToUid &&
          state.toViewReady,
      });
    });

    this._store.dispatch({
      type: 'SET_OVERLAY_HANDLE',
      handle: findNodeHandle(this._innerViewRef),
    });
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
  }

  render() {
    let overlay = null;

    if (this.state.visible) {
      overlay = this._renderOverlay();
    }

    return (
      <View
        ref={c => {
          this._innerViewRef = c;
        }}
        style={{ flex: 1 }}>
        {this.props.children}
        {overlay}
      </View>
    );
  }

  _renderOverlay() {
    const transitioningFromElementGroup = this.state.elementGroups[
      this.state.transitioningElementGroupFromUid
    ];
    const transitioningToElementGroup = this.state.elementGroups[
      this.state.transitioningElementGroupToUid
    ];

    // Only transition elements that are present in both transition groups.
    const commonElements = transitioningToElementGroup.elements.filter(e1 =>
      transitioningFromElementGroup.elements.some(
        e2 => e1.props.id === e2.props.id
      )
    );

    return (
      <View style={styles.overlay}>
        {commonElements.map((e, i) => {
          const fromMetrics =
            transitioningFromElementGroup.elementMetrics[e.props.id];
          const toMetrics =
            transitioningToElementGroup.elementMetrics[e.props.id];
          if (!toMetrics) {
            throw new Error(
              `Cannot transition element with id '${e.props.id}'. No matching element found in next route.`
            );
          }
          return cloneElement(e, {
            key: i,
            transitionProps: {
              progress: this.state.progress,
              fromMetrics,
              toMetrics,
            },
          });
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
