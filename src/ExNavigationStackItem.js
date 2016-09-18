import React, { PropTypes } from 'react';
import {
  Animated,
  StyleSheet,
} from 'react-native';

import PureComponent from './utils/PureComponent';

import * as NavigationStyles from './ExNavigationStyles';

class SceneView extends React.Component<any, SceneViewProps, any> {

  static propTypes = {
    sceneRenderer: PropTypes.func.isRequired,
    // sceneRendererProps: NavigationPropTypes.SceneRenderer,
  };

  shouldComponentUpdate(nextProps: SceneViewProps, nextState: any): boolean {
    return (
      nextProps.sceneRendererProps.scene.route !==
        this.props.sceneRendererProps.scene.route
    );
  }

  render(): ?ReactElement<any> {
    return this.props.sceneRenderer(this.props.sceneRendererProps);
  }
}

export default class ExNavigationStackItem extends PureComponent {
  render() {
    let {
      sceneAnimations,
      gestures,
      renderScene,
      style,
      navigationState,
      scene,
      ...props,
    } = this.props;

    if (sceneAnimations === undefined) {
      // fall back to default style.
      sceneAnimations = NavigationStyles.SlideHorizontal.sceneAnimations(this.props);
    } else {
      sceneAnimations = sceneAnimations(this.props);
    }
    if (gestures === undefined) {
      // fall back to default pan handlers.
      gestures = NavigationStyles.SlideHorizontal.gestures && NavigationStyles.SlideHorizontal.gestures(this.props);
    } else if (typeof gestures === 'function') {
      gestures = gestures(this.props);
    }

    const interactive = navigationState.index === scene.index && !scene.isStale;
    const pointerEvents = interactive ? 'auto' : 'none';

    return (
      <Animated.View
        {...gestures}
        needsOffscreenAlphaCompositing
        style={[styles.main, style, sceneAnimations]}
        pointerEvents={pointerEvents}>
        <SceneView
          sceneRenderer={renderScene}
          sceneRendererProps={{ ...props, scene }}
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    top: 0,
  },
});
