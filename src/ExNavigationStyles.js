/**
 * @providesModule ExNavigationStyles
 */

import {
  Animated,
  Easing,
} from 'react-native';

const {
  CardStackStyleInterpolator,
  CardStackPanResponder,
} = require('VendoredNavigationExperimental').Card;

import type { ExNavigationStyles } from 'ExNavigationTypeDefinition';

const applyTimingAnimation = (position, navigationState) => {
  Animated.timing(
    position,
    {
      easing: Easing.inOut(Easing.linear),
      toValue: navigationState.index,
      duration: 150,
    }
  ).start();
};

const applySpringAnimation = (position, navigationState) => {
  Animated.spring(
    position,
    {
      bounciness: 0,
      speed: 12,
      toValue: navigationState.index,
    }
  ).start();
};

const applyAnimationNoop = (position, navigationState) => {
  position.setValue(navigationState.index);
};

export const FloatHorizontal: ExNavigationStyles = {
  applyAnimation: applySpringAnimation,
  sceneAnimations: CardStackStyleInterpolator.forHorizontal,
  navigationBarAnimations: {
    forContainer: (props, delta) => {
      const {
        layout,
        position,
        scene,
        scenes,
      } = props;

      const index = scene.index;

      const meVisible = barVisibleForSceneIndex(scenes, index);
      let offset = layout.initWidth;
      if (delta === 0) {
        // default state
        offset = meVisible ? offset : -offset;
      } else {
        // if we're pushing, get the previous scenes' visibility. If we're popping, get the scene ahead
        const prevVisible = barVisibleForSceneIndex(scenes, index + (delta > 0 ? -1 : 1));
        if (!prevVisible && meVisible) {
          // when showing, if a push, move from right to left, otherwise if pop, move from left to right
          offset = delta > 0 ? offset : -offset;
        } else {
          // when hiding, if a push, move from left to right, otherwise if a pop, move from right to left
          offset = delta > 0 ? -offset : offset;
        }
      }

      return {
        transform: [
          {
            translateX: position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [
                barVisibleForSceneIndex(scenes, index - 1) ? 0 : offset,
                barVisibleForSceneIndex(scenes, index) ? 0 : offset,
                barVisibleForSceneIndex(scenes, index + 1) ? 0 : offset,
              ],
            }),
          },
        ],
      };
    },
    /**
     * Crossfade the left view
     */
    forLeft: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
    /**
     * Crossfade the title
     */
    forCenter: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
        transform: [
          {
            translateX: position.interpolate({
              inputRange: [index - 1, index + 1],
              outputRange: [200, -200],
            }),
          },
        ],
      };
    },
    /**
     * Crossfade the right view
     */
    forRight: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
  },
  gestures: CardStackPanResponder.forHorizontal,
};

export const FloatVertical: ExNavigationStyles = {
  applyAnimation: applySpringAnimation,
  sceneAnimations: CardStackStyleInterpolator.forVertical,
  navigationBarAnimations: {
    forContainer: (props, delta) => {
      const {
        layout,
        position,
        scene,
        scenes,
      } = props;

      const index = scene.index;

      const meVisible = barVisibleForSceneIndex(scenes, index);

      let offset = layout.initHeight;
      let fadeOffset = 0;
      if (delta === 0) {
        // default state
        offset = meVisible ? offset : 0;
        fadeOffset = meVisible ? 1 : 0;
      } else {
        const prevVisible = barVisibleForSceneIndex(scenes, index + (delta > 0 ? -1 : 1));
        if (!prevVisible && meVisible) {
          // if pushing, slide, no fade. If popping, no slide, fade
          offset = delta > 0 ? offset : 0;
          fadeOffset = delta > 0 ? 1 : 0;
        } else {
          // if pushing, no slide, just fade. If popping, slide, no fade
          offset = delta > 0 ? 0 : offset;
          fadeOffset = delta > 0 ? 0 : 1;
        }
      }

      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [
            barVisibleForSceneIndex(scenes, index - 1) ? 1 : fadeOffset,
            barVisibleForSceneIndex(scenes, index) ? 1 : fadeOffset,
            barVisibleForSceneIndex(scenes, index + 1) ? 1 : fadeOffset,
          ],
        }),
        transform: [
          {
            translateY: position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [
                barVisibleForSceneIndex(scenes, index - 1) ? 0 : offset,
                barVisibleForSceneIndex(scenes, index) ? 0 : offset,
                barVisibleForSceneIndex(scenes, index + 1) ? 0 : offset,
              ],
            }),
          },
        ],
      };
    },
    /**
     * Crossfade the left view
     */
    forLeft: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
    /**
     * Crossfade the title
     */
    forCenter: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
    /**
     * Crossfade the right view
     */
    forRight: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
  },
  gestures: CardStackPanResponder.forVertical,
};

export const Fade: ExNavigationStyles = {
  applyAnimation: applyTimingAnimation,
  sceneAnimations: (props) => {
    const {
      position,
      scene,
    } = props;

    const index = scene.index;
    const inputRange = [index - 1, index, index + 1];

    const opacity = position.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    return {
      opacity,
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { scale: 1 },
      ],
    };
  },
  navigationBarAnimations: {
    forContainer: (props, delta) => {
      const {
        position,
        scene,
        scenes,
      } = props;

      const index = scene.index;

      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [
            barVisibleForSceneIndex(scenes, index - 1) ? 1 : 0,
            barVisibleForSceneIndex(scenes, index) ? 1 : 0,
            barVisibleForSceneIndex(scenes, index + 1) ? 1 : 0,
          ],
        }),
      };
    },
    /**
     * Crossfade the left view
     */
    forLeft: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
    /**
     * Crossfade the title
     */
    forCenter: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
    /**
     * Crossfade the right view
     */
    forRight: (props) => {
      const {position, scene, scenes} = props;
      const {index} = scene;
      return {
        opacity: position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, barVisibleForSceneIndex(scenes, index) ? 1 : 0, 0],
        }),
      };
    },
  },
  gestures: null,
};

export const NoAnimation: ExNavigationStyles = {
  ...Fade,
  applyAnimation: applyAnimationNoop,
};

/**
 * Helpers
 */

function barVisibleForSceneIndex(scenes, sceneIndex) {
  const sceneForIndex = scenes[sceneIndex];
  if (!sceneForIndex) {
    return true;
  }
  const { navigationState } = sceneForIndex;
  const navBarState = navigationState.config.navigationBar;
  let visible = false;
  if (navBarState) {
    visible = navBarState.visible;
  }
  return visible;
}
