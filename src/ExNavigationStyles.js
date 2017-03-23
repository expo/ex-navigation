import {
  Animated,
  Easing,
  I18nManager,
} from 'react-native';
import NavigationExperimental from './navigation-experimental';

const {
  CardStackStyleInterpolator,
  CardStackPanResponder,
} = NavigationExperimental.Card;

import type { ExNavigationStyles } from './ExNavigationTypeDefinition';

let useNativeDriver = false;

export function setUseNativeDriverExperimental(use: boolean) {
  useNativeDriver = use;
}

const configureTimingTransition = (transitionProps, previousTransitionProps) => ({
  timing: Animated.timing,
  easing: Easing.inOut(Easing.linear),
  duration: 150,
  useNativeDriver,
});

const configureSpringTransition = (transitionProps, previousTransitionProps) => {
  let speed = 15;
  let restSpeedThreshold = 0.001;
  let restDisplacementThreshold = 0.001;

  // Popping should be faster than pushing
  if (previousTransitionProps.navigationState.index >= transitionProps.navigationState.index) {
    speed = 40;
    restSpeedThreshold = 0.2;
    restDisplacementThreshold = 0.15;
  }

  return {
    timing: Animated.spring,
    bounciness: 0,
    speed,
    restSpeedThreshold,
    restDisplacementThreshold,
    useNativeDriver,
  };
};

const configureNoopTransition = (transitionProps, previousTransitionProps) => ({
  timing: Animated.timing,
  duration: 1,
  useNativeDriver,
});

/**
 * Render the initial style when the initial layout isn't measured yet.
 */
function forInitial(props: NavigationSceneRendererProps): Object {
  const {
    navigationState,
    scene,
  } = props;

  const focused = navigationState.index === scene.index;
  const opacity = focused ? 1 : 0;
  // If not focused, move the scene to the far away.
  const translate = focused ? 0 : 1000000;
  return {
    opacity,
    transform: [
      { translateX: translate },
      { translateY: translate },
    ],
  };
}

function customForHorizontal(props: NavigationSceneRendererProps): Object {
  const {
    layout,
    position,
    scene,
  } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }

  const index = scene.index;
  const inputRange = [index - 1, index, index + 1];
  const width = layout.initWidth;

  let outputRange;
  if (I18nManager && I18nManager.isRTL) {
    outputRange = [-width, 0, 100];
  } else {
    outputRange = [width, 0, -100];
  }

  const opacity = position.interpolate({
    inputRange,
    outputRange: ([1, 1, 0.3]: Array<number>),
  });

  const translateY = 0;
  const translateX = position.interpolate({
    inputRange,
    outputRange,
  });

  return {
    opacity,
    transform: [
      { translateX },
      { translateY },
    ],
  };
}

export const SlideHorizontalIOS: ExNavigationStyles = {
  configureTransition: configureSpringTransition,
  sceneAnimations: customForHorizontal,
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


export const SlideHorizontalFixedNav: ExNavigationStyles = {
  configureTransition: configureSpringTransition,
  sceneAnimations: customForHorizontal,
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
    gestures: CardStackPanResponder.forHorizontal,
  },
};

export const SlideHorizontal: ExNavigationStyles = {
  configureTransition: configureSpringTransition,
  sceneAnimations: customForHorizontal,
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
          inputRange: [index - 1, index - 0.3, index, index + 0.3, index + 1],
          outputRange: [
            0,
            barVisibleForSceneIndex(scenes, index) ? 0.05 : 0,
            barVisibleForSceneIndex(scenes, index) ? 1 : 0,
            barVisibleForSceneIndex(scenes, index) ? 0.3 : 0,
            0,
          ],
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
          inputRange: [index - 1, index - 0.3, index, index + 0.3, index + 1],
          outputRange: [
            0,
            barVisibleForSceneIndex(scenes, index) ? 0.1 : 0,
            barVisibleForSceneIndex(scenes, index) ? 1 : 0,
            barVisibleForSceneIndex(scenes, index) ? 0.3 : 0,
            0,
          ],
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
          inputRange: [index - 1, index - 0.3, index, index + 0.3, index + 1],
          outputRange: [
            0,
            barVisibleForSceneIndex(scenes, index) ? 0.05 : 0,
            barVisibleForSceneIndex(scenes, index) ? 1 : 0,
            barVisibleForSceneIndex(scenes, index) ? 0.3 : 0,
            0,
          ],
        }),
      };
    },
  },
  gestures: CardStackPanResponder.forHorizontal,
};

// TODO: this will become the Android style horizontal float transition (see
// the Twitter Android app for an example)
//
// We can bump minor version and indicate breaking change when we implement
// this, but no need to do that yet.
export const FloatHorizontal = SlideHorizontal;

function customForVertical(props: NavigationSceneRendererProps): Object {
  const {
    layout,
    position,
    scene,
  } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }

  const index = scene.index;
  const inputRange = [index - 1, index, index + 1];
  const height = layout.initHeight;

  const translateX = 0;
  const translateY = position.interpolate({
    inputRange,
    outputRange: ([height, 0, 0]: Array<number>),
  });

  return {
    transform: [
      { translateX },
      { translateY },
    ],
  };
}

export const SlideVertical: ExNavigationStyles = {
  configureTransition: configureSpringTransition,
  sceneAnimations: customForVertical,
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

export const FloatVertical: ExNavigationStyles = {
  configureTransition: configureSpringTransition,
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
  configureTransition: configureTimingTransition,
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
  configureTransition: configureNoopTransition,
};

/**
 * Helpers
 */

function barVisibleForSceneIndex(scenes, sceneIndex) {
  const sceneForIndex = scenes[sceneIndex];
  if (!sceneForIndex) {
    return true;
  }
  const { route } = sceneForIndex;
  const navBarState = route.config.navigationBar;
  return navBarState && navBarState.visible !== false;
}
