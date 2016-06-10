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

import {
  createNavigatorComponent,
  withNavigation,
} from 'ExNavigationComponents';

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;

class ExNavigationBarTitle extends PureComponent {
  render() {
    const { children, style, textStyle } = this.props;
    return (
      <View style={[titleStyles.title, style]}>
        <Text style={[titleStyles.titleText, textStyle]}>{children}</Text>
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
    return (
      <TouchableOpacity style={backButtonStyles.buttonContainer} onPress={() => this.props.navigator.pop()}>
        <Image style={backButtonStyles.button} source={require('ExNavigationAssets').backIcon} />
      </TouchableOpacity>
    );
  }
}

const backButtonStyles = StyleSheet.create({
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
});

// @withNavigation
export default class ExNavigationBar extends PureComponent {
  static defaultProps = {
    renderTitleComponent(props) {
      const { navigationState } = props;
      const title = String(navigationState.title || '');
      return <ExNavigationBarTitle>{title}</ExNavigationBarTitle>;
    },

    renderLeftComponent(props) {
      return props.scene.index > 0 ? <ExNavigationBarBackButton /> : null;
    },

    renderRightComponent(props) {
      return null;
    },
  };

  static propTypes = {
    renderLeftComponent: PropTypes.func,
    renderRightComponent: PropTypes.func,
    renderTitleComponent: PropTypes.func,
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
      props.route = scene.navigationState;
      return props;
    });

    let containerStyle = [styles.appbar, style];
    if (this.props.overrideStyle) {
      containerStyle = [style];
    }
    containerStyle.push(this.props.interpolator.forContainer(this.props, this.state.delta));

    return (
      <Animated.View
        pointerEvents={this.props.visible ? 'auto' : 'none'}
        style={containerStyle}>
        {scenesProps.map(this._renderLeft, this)}
        {scenesProps.map(this._renderTitle, this)}
        {scenesProps.map(this._renderRight, this)}
      </Animated.View>
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

const styles = StyleSheet.create({
  appbar: {
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#EFEFF2' : '#FFF',
    borderBottomColor: 'rgba(0, 0, 0, .15)',
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    elevation: 2,
    flexDirection: 'row',
    height: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
    justifyContent: 'flex-start',
    left: 0,
    marginBottom: 16, // This is needed for elevation shadow
    position: 'absolute',
    right: 0,
    top: 0,
  },

  title: {
    bottom: 0,
    left: APPBAR_HEIGHT,
    marginTop: STATUSBAR_HEIGHT,
    position: 'absolute',
    right: APPBAR_HEIGHT,
    top: 0,
  },

  left: {
    bottom: 0,
    left: 0,
    marginTop: STATUSBAR_HEIGHT,
    position: 'absolute',
    top: 0,
  },

  right: {
    bottom: 0,
    marginTop: STATUSBAR_HEIGHT,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

ExNavigationBar.HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
ExNavigationBar.Title = ExNavigationBarTitle;
ExNavigationBar.BackButton = ExNavigationBarBackButton;

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
