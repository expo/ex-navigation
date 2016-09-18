import React, { PropTypes } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PureComponent from './utils/PureComponent';
import { unsupportedNativeView } from './ExUnsupportedNativeView';
import { withNavigation } from './ExNavigationComponents';

let Components;
if (global.__exponent) {
  Components = global.__exponent.Components;
} else {
  Components = {
    BlurView: unsupportedNativeView('BlurView'),
  };
}

// Exponent draws under the status bar on Android, but vanilla React Native does not.
// So we need to factor the status bar height in with Exponent but can ignore it with
// vanilla React Native
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : (global.__exponent ? 24 : 0);

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 55;
const BACKGROUND_COLOR = Platform.OS === 'ios' ? '#EFEFF2' : '#FFF';
const BORDER_BOTTOM_COLOR = 'rgba(0, 0, 0, .15)';
const BORDER_BOTTOM_WIDTH = Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0;
const BACK_BUTTON_HIT_SLOP = { top: 0, bottom: 0, left: 0, right: 20 };

class ExNavigationBarTitle extends PureComponent {
  render() {
    const { children, style, textStyle, tintColor } = this.props;

    return (
      <View style={[titleStyles.title, style]}>
        <Text style={[
          titleStyles.titleText,
          tintColor ? {color: tintColor} : null,
          textStyle,
        ]}>
          {children}
        </Text>
      </View>
    );
  }
}

const titleStyles = StyleSheet.create({
  title: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },

  titleText: {
    flex: 1,
    color: 'rgba(0, 0, 0, .9)',
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
      },
      android: {
        fontSize: 20,
        textAlign: 'left',
      },
    }),
  },
});

@withNavigation
class ExNavigationBarBackButton extends PureComponent {
  render() {
    const { tintColor } = this.props;

    return (
      <TouchableOpacity
        onPress={this._onPress}
        hitSlop={BACK_BUTTON_HIT_SLOP}
        style={buttonStyles.buttonContainer}
      >
        <Image
          style={[buttonStyles.button, tintColor ? {tintColor} : null]}
          source={require('./ExNavigationAssets').backIcon}
        />
      </TouchableOpacity>
    );
  }

  _onPress = () => this.props.navigator.pop();
}

class ExNavigationBarMenuButton extends PureComponent {
  render() {
    const { tintColor } = this.props;

    return (
      <TouchableOpacity style={buttonStyles.buttonContainer} onPress={() => this.props.navigator.toggleDrawer()}>
        <Image
          style={[buttonStyles.menuButton, tintColor ? {tintColor} : null]}
          source={require('./ExNavigationAssets').menuIcon}
        />
      </TouchableOpacity>
    );
  }
}

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    resizeMode: 'contain',
    ...Platform.select({
      ios: {
        height: 21,
        width: 13,
        marginLeft: 8,
        marginRight: 6,
      },
      android: {
        height: 24,
        width: 24,
        margin: 16,
      },
    }),
  },
  menuButton: {
    height: 26,
    width: 26,
    ...Platform.select({
      ios: {
        margin: 10,
      },
      android: {
        marginLeft: 23,
        marginTop: -1,
      },
    }),
    resizeMode: 'contain',
  },
});

export default class ExNavigationBar extends PureComponent {
  static defaultProps = {
    renderTitleComponent(props) {
      const { navigationState } = props;
      const title = String(navigationState.title || '');
      return <ExNavigationBarTitle>{title}</ExNavigationBarTitle>;
    },
    barHeight: APPBAR_HEIGHT,
    statusBarHeight: STATUSBAR_HEIGHT,
  };

  static propTypes = {
    renderLeftComponent: PropTypes.func,
    renderRightComponent: PropTypes.func,
    renderTitleComponent: PropTypes.func,
    barHeight: PropTypes.number.isRequired,
    statusBarHeight: PropTypes.number.isRequired,
    style: View.propTypes.style,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: props.visible,
      delta: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible && nextProps.visible) {
      this.setState({
        visible: true,
      });
    }

    if (this.props.navigationState.index !== nextProps.navigationState.index) {
      this.setState({
        delta: nextProps.navigationState.index - this.props.navigationState.index,
      });
    } else {
      this.setState({
        delta: 0,
      });
    }
  }

  componentWillUnmount() {
    this.props.position.removeListener(this._positionListener);
  }

  render() {
    if (!this.state.visible) {
      return null;
    }

    const { scenes, style } = this.props;

    const scenesProps = scenes.map(scene => {
      const props = extractSceneRendererProps(this.props);
      props.scene = scene;
      return props;
    });

    // TODO: this should come from the latest scene config
    const height = this.props.barHeight + this.props.statusBarHeight;

    let styleFromRouteConfig = this.props.latestRoute.getBarStyle();
    let isTranslucent = !!this.props.latestRoute.getTranslucent();
    let backgroundStyle = isTranslucent ? styles.appbarTranslucent : styles.appbarSolid;
    let containerStyle = [styles.appbar, backgroundStyle, style, {height}, styleFromRouteConfig];

    if (this.props.overrideStyle) {
      containerStyle = [style];
    }

    containerStyle.push(this.props.interpolator.forContainer(this.props, this.state.delta));

    let leftComponents = scenesProps.map(this._renderLeft, this);
    let rightComponents = scenesProps.map(this._renderRight, this);
    let titleComponents = scenesProps.map((props, i) => {
      return this._renderTitle(props, {
        hasLeftComponent: leftComponents && !!leftComponents[i],
        hasRightComponent: rightComponents && !!rightComponents[i],
      });
    });

    return (
      <View pointerEvents={this.props.visible ? 'auto' : 'none'} style={styles.wrapper}>
        {isTranslucent && <Components.BlurView style={[styles.translucentUnderlay, {height}]} />}

        <Animated.View style={containerStyle}>
          <View style={[styles.appbarInnerContainer, {top: this.props.statusBarHeight}]}>
            {titleComponents}
            {leftComponents}
            {rightComponents}
          </View>
        </Animated.View>
      </View>
    );
  }

  _renderLeft(props) {
    return this._renderSubView(
      props,
      'left',
      this.props.renderLeftComponent,
      this.props.interpolator.forLeft,
    );
  }

  _renderTitle(props, options) {
    return this._renderSubView(
      props,
      'title',
      this.props.renderTitleComponent,
      this.props.interpolator.forCenter,
      options,
    );
  }

  _renderRight(props) {
    return this._renderSubView(
      props,
      'right',
      this.props.renderRightComponent,
      this.props.interpolator.forRight,
    );
  }

  _renderSubView(
    props,
    name,
    renderer,
    styleInterpolator,
    options = {},
  ) {
    const {
      scene,
      navigationState,
    } = props;

    const {
      index,
      isStale,
      key,
    } = scene;

    const offset = navigationState.index - index;

    if (Math.abs(offset) > 2) {
      // Scene is far away from the active scene. Hides it to avoid unnecessary
      // rendering.
      return null;
    }

    const subView = renderer(props);
    if (subView === null) {
      return null;
    }

    let layoutStyle;
    if (name === 'title' && Platform.OS === 'android') {
      layoutStyle = {};

      if (options.hasLeftComponent) {
        layoutStyle.left = APPBAR_HEIGHT;
      }
      if (options.hasRightComponent) {
        layoutStyle.right = APPBAR_HEIGHT;
      }
    }

    const pointerEvents = offset !== 0 || isStale ? 'none' : 'box-none';
    return (
      <Animated.View
        pointerEvents={pointerEvents}
        key={name + '_' + key}
        style={[
          styles[name],
          layoutStyle,
          styleInterpolator(props),
        ]}>
        {subView}
      </Animated.View>
    );
  }
}


ExNavigationBar.DEFAULT_HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
ExNavigationBar.DEFAULT_HEIGHT_WITHOUT_STATUS_BAR = APPBAR_HEIGHT;
ExNavigationBar.DEFAULT_BACKGROUND_COLOR = BACKGROUND_COLOR;
ExNavigationBar.DEFAULT_BORDER_BOTTOM_COLOR = BORDER_BOTTOM_COLOR;
ExNavigationBar.DEFAULT_BORDER_BOTTOM_WIDTH = BORDER_BOTTOM_WIDTH;
ExNavigationBar.Title = ExNavigationBarTitle;
ExNavigationBar.BackButton = ExNavigationBarBackButton;
ExNavigationBar.MenuButton = ExNavigationBarMenuButton;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: ExNavigationBar.DEFAULT_HEIGHT,
    // TODO(brentvatne): come up with a better solution for making the
    // elevation show up properly on Android
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
  },

  wrapperWithoutAppbar: {
    paddingTop: 0,
  },

  translucentUnderlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  appbar: {
    alignItems: 'center',
    borderBottomColor: ExNavigationBar.DEFAULT_BORDER_BOTTOM_COLOR,
    borderBottomWidth: ExNavigationBar.DEFAULT_BORDER_BOTTOM_WIDTH,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  appbarSolid: {
    backgroundColor: ExNavigationBar.DEFAULT_BACKGROUND_COLOR,
  },
  appbarTranslucent: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  appbarInnerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    // NOTE(brentvatne): these hard coded values must change!
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },

  left: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },

  right: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

function extractSceneRendererProps(props) {
  return {
    layout: props.layout,
    navigationState: props.navigationState,
    onNavigate: props.onNavigate,
    position: props.position,
    scene: props.scene,
    scenes: props.scenes,
  };
}
