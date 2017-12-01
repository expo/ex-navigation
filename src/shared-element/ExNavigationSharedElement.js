/**
 * @flow
 */

import React, { Component, cloneElement } from 'react';
import { UIManager, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';
import invariant from 'invariant';

import type {
  TransitionProps,
  Metrics,
} from './ExNavigationSharedElementReducer';

type Props = {
  children?: () => React.Element<*>,
  id: string,

  // This is not part of the public API and is used by the overlay to pass down
  // transition info used by the animation.
  transitionProps?: ?TransitionProps,
};

export default class SharedElement extends Component {
  static contextTypes = {
    sharedElementStore: PropTypes.any,
    elementGroupUid: PropTypes.any,
  };

  props: Props;
  _el: ?React.Element<*> = null;

  render() {
    const childFn = this.props.children;
    let animationStyle = {};
    // If transitionProps is set it means this is being rendered from the overlay
    // for the animation so pass down animation styles.
    if (
      this.props.transitionProps &&
      this.props.transitionProps.progress &&
      this.props.transitionProps.fromMetrics &&
      this.props.transitionProps.toMetrics
    ) {
      const { progress, fromMetrics, toMetrics } = this.props.transitionProps;
      animationStyle = this.getAnimationStyle(progress, fromMetrics, toMetrics);
    }

    invariant(childFn, 'Must pass a function as a child to `SharedElement`.');
    const childEl = childFn(animationStyle);

    return cloneElement(childEl, {
      ref: c => {
        this._el = c;
      },
      collapsable: false,
      onLayout: this.measure,
    });
  }

  getAnimationStyle = (
    progress: any,
    fromMetrics: Metrics,
    toMetrics: Metrics
  ) => {
    const initialScaleX = fromMetrics.width / toMetrics.width;
    const initialScaleY = fromMetrics.height / toMetrics.height;

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: null,
      bottom: null,
      width: toMetrics.width,
      height: toMetrics.height,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0,
      transform: [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              (fromMetrics.width - toMetrics.width) / 2 + fromMetrics.x,
              toMetrics.x,
            ],
          }),
        },
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              (fromMetrics.height - toMetrics.height) / 2 + fromMetrics.y,
              toMetrics.y,
            ],
          }),
        },
        {
          scaleX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [initialScaleX, 1],
          }),
        },
        {
          scaleY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [initialScaleY, 1],
          }),
        },
      ],
    };
  };

  measure = () => {
    return new Promise(resolve => {
      // If there is no element group uid it means this is being rendered from the
      // overlay so we don't do any measurement.
      if (!this.context.elementGroupUid) {
        resolve();
        return;
      }

      UIManager.measure(
        findNodeHandle(this._el),
        (origX, origY, width, height, x, y) => {
          const store = this.context.sharedElementStore;
          store.dispatch({
            type: 'UPDATE_METRICS_FOR_ELEMENT',
            groupUid: this.context.elementGroupUid,
            id: this.props.id,
            metrics: { x, y, width, height },
          });
          resolve();
        }
      );
    });
  };
}
