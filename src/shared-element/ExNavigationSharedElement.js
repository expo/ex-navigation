/**
 * @flow
 */

import React, { Children, PropTypes, cloneElement } from 'react';
import findNodeHandle from 'react/lib/findNodeHandle';
import {
  View,
  UIManager,
} from 'react-native';

type Props = {
  children: () => React.Element<*>,
}

export default class SharedElement extends React.Component {
  _el: ?React.Element<*> = null;
  _innerViewRef: ?React.Element<*> = null;

  static propTypes = {
    children: PropTypes.func.isRequired,
  }

  static contextTypes = {
    sharedElementStore: PropTypes.any,
    elementGroupUid: PropTypes.any,
  }

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.measure();
  }

  render() {
    const childFn = this.props.children;
    let animationStyle = {};
    // TODO: cleanup this check
    if (this.props.transitionProps && this.props.transitionProps.progress &&
        this.props.transitionProps.fromMetrics.width) {
      const { progress, fromMetrics, toMetrics } = this.props.transitionProps;
      animationStyle = this.getAnimationStyle(
        progress,
        fromMetrics,
        toMetrics,
      );
    }

    const childEl = childFn(animationStyle);

    return (
      <View ref={c => { this._innerViewRef = c; }}>
        {cloneElement(childEl, {
          ref: c => { this._el = c; },
          collapsable: false,
        })}
      </View>
    );
  }

  getAnimationStyle = (progress: any, fromMetrics: Object, toMetrics: Object) => {
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
        { translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            ((fromMetrics.width - toMetrics.width) / 2) + fromMetrics.x,
            toMetrics.x,
          ],
        }) },
        { translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            ((fromMetrics.height - toMetrics.height) / 2) + fromMetrics.y,
            toMetrics.y,
          ],
        }) },
        { scaleX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [initialScaleX, 1],
        }) },
        { scaleY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [initialScaleY, 1],
        }) },
      ],
    };
  }

  measure = () => {
    if (!this.context.elementGroupUid) {
      return;
    }

    UIManager.measureInWindow(
      findNodeHandle(this._el),
      (x, y, width, height) => {
        const store = this.context.sharedElementStore;
        store.dispatch({
          type: 'UPDATE_METRICS_FOR_ELEMENT',
          groupUid: this.context.elementGroupUid,
          id: this.props.id,
          metrics: { x, y, width, height },
        });
      }
    );
  }
}
