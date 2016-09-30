/**
 * @flow
 */

import React, { cloneElement } from 'react';
import findNodeHandle from 'react/lib/findNodeHandle';
import {
  View,
  StyleSheet,
} from 'react-native';

import { createStore } from 'redux';
import storeShape from 'react-redux/lib/utils/storeShape';

import SharedElementReducer from './ExNavigationSharedElementReducer';

type Props = {};

type State = {
  visible: boolean,
  elementGroups: Object,
  transitioningElementGroupFromUid: ?string,
  transitioningElementGroupToUid: ?string,
  progress: ?mixed,
};

const store = createStore(SharedElementReducer);

export default class SharedElementOverlay extends React.Component {
  state: State = {
    visible: false,
    elementGroups: {},
    transitioningElementGroupFromUid: null,
    transitioningElementGroupToUid: null,
    progress: null,
  };

  _innerViewRef: React.Element<*>;

  static getStore() {
    return store;
  }

  _store: Object;

  static childContextTypes = {
    sharedElementStore: storeShape,
  }

  constructor(props: Props) {
    super(props);
    this._store = SharedElementOverlay.getStore();
    this._store.subscribe(() => {
      const state = this._store.getState();
      this.setState({
        ...state,
        visible: state.transitioningElementGroupFromUid && state.transitioningElementGroupToUid,
      });
    });
  }

  getChildContext() {
    return {
      sharedElementStore: this._store,
    };
  }

  componentDidMount() {
    this._store.dispatch({
      type: 'SET_OVERLAY_HANDLE',
      handle: findNodeHandle(this._innerViewRef),
    });
  }

  render() {
    let overlay = null;

    if (this.state.visible) {
      overlay = this._renderOverlay();
    }

    return (
      <View ref={c => { this._innerViewRef = c; }} style={{ flex: 1 }}>
        {this.props.children}
        {overlay}
      </View>
    );
  }

  _renderOverlay() {
    const transitioningFromElementGroup = this.state.elementGroups[this.state.transitioningElementGroupFromUid];
    const transitioningToElementGroup = this.state.elementGroups[this.state.transitioningElementGroupToUid];

    return (
      <View style={styles.overlay}>
        {transitioningToElementGroup.elements.map((e, i) => {
          const fromMetrics = transitioningFromElementGroup.elementMetrics[e.props.id];
          const toMetrics = transitioningToElementGroup.elementMetrics[e.props.id];
          if (!toMetrics) {
            throw new Error(`Cannot transition element with id '${e.props.id}'. No matching element found in next route.`);
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
