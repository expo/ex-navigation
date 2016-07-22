/**
 * @providesModule ExNavigationBar
 */

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
import PureComponent from 'PureComponent';

import ExNavigationAlertBar from 'ExNavigationAlertBar';
import { withNavigation } from 'ExNavigationComponents';

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 55;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 24;

class ExNavigationBarTitle extends PureComponent {
  render() {
    const { children, style, textStyle, tintColor } = this.props;

    return (
      <View style={[titleStyles.title, style]}>
        <Text style={[
          titleStyles.titleText,
          tintColor ? {color: tintColor} : null,
          textStyle
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
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, .9)',
    textAlign: Platform.OS === 'ios' ? 'center' : 'left',
  },
});

@withNavigation
class ExNavigationBarBackButton extends PureComponent {
  render() {
    const { tintColor } = this.props;

    return (
      <TouchableOpacity style={buttonStyles.buttonContainer} onPress={this._onPress}>
        <Image
          style={[buttonStyles.button, tintColor ? {tintColor} : null]}
          source={require('ExNavigationAssets').backIcon} />
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
          source={require('ExNavigationAssets').menuIcon} />
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
    height: 24,
    width: 24,
    margin: Platform.OS === 'ios' ? 10 : 16,
    resizeMode: 'contain',
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

// @withNavigation
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
      return (
        <View style={[styles.wrapper, styles.wrapperWithoutAppbar]}>
          <ExNavigationAlertBar
            {...this.props}
            alertState={this.props.navigationState.alert}
            style={styles.alertBarWithoutAppbar}
          />
        </View>
      );
    }

    const { scenes, style } = this.props;

    const scenesProps = scenes.map(scene => {
      const props = extractSceneRendererProps(this.props);
      props.scene = scene;
      return props;
    });

    const height = this.props.barHeight + this.props.statusBarHeight;
    let containerStyle = [styles.appbar, style, {height}];
    if (this.props.overrideStyle) {
      containerStyle = [style];
    }
    containerStyle.push(this.props.interpolator.forContainer(this.props, this.state.delta));

    let backgroundColor = this.props.latestRoute.getBarBackgroundColor();
    if (backgroundColor) {
      containerStyle.push({backgroundColor});
    }

    return (
      <View
        pointerEvents={this.props.visible ? 'auto' : 'none'}
        style={styles.wrapper}>
        <ExNavigationAlertBar
          {...this.props}
          alertState={this.props.navigationState.alert}
        />

        <Animated.View
          style={containerStyle}>
          <View style={[styles.appbarInnerContainer, {top: this.props.statusBarHeight}]}>
            {scenesProps.map(this._renderLeft, this)}
            {scenesProps.map(this._renderTitle, this)}
            {scenesProps.map(this._renderRight, this)}
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

  _renderTitle(props) {
    return this._renderSubView(
      props,
      'title',
      this.props.renderTitleComponent,
      this.props.interpolator.forCenter,
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

    const pointerEvents = offset !== 0 || isStale ? 'none' : 'auto';
    return (
      <Animated.View
        pointerEvents={pointerEvents}
        key={name + '_' + key}
        style={[
          styles[name],
          styleInterpolator(props),
        ]}>
        {subView}
      </Animated.View>
    );
  }
}

ExNavigationBar.DEFAULT_HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
ExNavigationBar.DEFAULT_HEIGHT_WITHOUT_STATUS_BAR = APPBAR_HEIGHT;
ExNavigationBar.DEFAULT_BACKGROUND_COLOR = Platform.OS === 'ios' ? '#EFEFF2' : '#FFF';
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
  },

  wrapperWithoutAppbar: {
    paddingTop: 0,
  },

  alertBarWithoutAppbar: {
    paddingTop: STATUSBAR_HEIGHT,
  },

  appbar: {
    alignItems: 'center',
    backgroundColor: ExNavigationBar.DEFAULT_BACKGROUND_COLOR,
    borderBottomColor: 'rgba(0, 0, 0, .15)',
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    left: 0,
    marginBottom: 16, // This is needed for elevation shadow
    position: 'absolute',
    right: 0,
    top: 0,
  },
  appbarInnerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  title: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    // NOTE(brentvatne): these hard coded values must change!
    left: APPBAR_HEIGHT,
    right: APPBAR_HEIGHT,
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
