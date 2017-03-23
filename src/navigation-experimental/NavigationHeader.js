/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Facebook, Inc. ("Facebook") owns all right, title and interest, including
 * all intellectual property and other proprietary rights, in and to the React
 * Native CustomComponents software (the "Software").  Subject to your
 * compliance with these terms, you are hereby granted a non-exclusive,
 * worldwide, royalty-free copyright license to (1) use and copy the Software;
 * and (2) reproduce and distribute the Software as part of your own software
 * ("Your Software").  Facebook reserves all rights not expressly granted to
 * you in this license agreement.
 *
 * THE SOFTWARE AND DOCUMENTATION, IF ANY, ARE PROVIDED "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES (INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE) ARE DISCLAIMED.
 * IN NO EVENT SHALL FACEBOOK OR ITS AFFILIATES, OFFICERS, DIRECTORS OR
 * EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @flow
 */
'use strict';

const NavigationHeaderBackButton = require('./NavigationHeaderBackButton');
const NavigationHeaderStyleInterpolator = require('./NavigationHeaderStyleInterpolator');
const NavigationHeaderTitle = require('./NavigationHeaderTitle');
const NavigationPropTypes = require('./NavigationPropTypes');
const React = require('react');
const ReactNative = require('react-native');
const ReactComponentWithPureRenderMixin = require('react-addons-pure-render-mixin');

const {
  Animated,
  Platform,
  StyleSheet,
  TVEventHandler,
  View,
} = ReactNative;

import type  {
  NavigationSceneRendererProps,
  NavigationStyleInterpolator,
} from './NavigationTypeDefinition';

type SubViewProps = NavigationSceneRendererProps & {
  onNavigateBack: ?Function,
};

type SubViewRenderer = (subViewProps: SubViewProps) => ?React.Element<any>;

type DefaultProps = {
  renderLeftComponent: SubViewRenderer,
  renderRightComponent: SubViewRenderer,
  renderTitleComponent: SubViewRenderer,
  statusBarHeight: number | Animated.Value,
};

type Props = NavigationSceneRendererProps & {
  onNavigateBack: ?Function,
  renderLeftComponent: SubViewRenderer,
  renderRightComponent: SubViewRenderer,
  renderTitleComponent: SubViewRenderer,
  style?: any,
  viewProps?: any,
  statusBarHeight: number | Animated.Value,
};

type SubViewName = 'left' | 'title' | 'right';

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const {PropTypes} = React;

class NavigationHeader extends React.Component<DefaultProps, Props, any> {
  props: Props;

  static defaultProps = {

    renderTitleComponent: (props: SubViewProps) => {
      const title = String(props.scene.route.title || '');
      return <NavigationHeaderTitle>{title}</NavigationHeaderTitle>;
    },

    renderLeftComponent: (props: SubViewProps) => {
      if (props.scene.index === 0 || !props.onNavigateBack) {
        return null;
      }
      return (
        <NavigationHeaderBackButton
          onPress={props.onNavigateBack}
        />
      );
    },

    renderRightComponent: (props: SubViewProps) => {
      return null;
    },

    statusBarHeight: STATUSBAR_HEIGHT,
  };

  static propTypes = {
    ...NavigationPropTypes.SceneRendererProps,
    onNavigateBack: PropTypes.func,
    renderLeftComponent: PropTypes.func,
    renderRightComponent: PropTypes.func,
    renderTitleComponent: PropTypes.func,
    style: View.propTypes.style,
    statusBarHeight: PropTypes.number,
    viewProps: PropTypes.shape(View.propTypes),
  };

  shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
    return ReactComponentWithPureRenderMixin.shouldComponentUpdate.call(
      this,
      nextProps,
      nextState
    );
  }

  _tvEventHandler: TVEventHandler;

  componentDidMount(): void {
    this._tvEventHandler = new TVEventHandler();
    this._tvEventHandler.enable(this, function(cmp, evt) {
      if (evt && evt.eventType === 'menu') {
        cmp.props.onNavigateBack && cmp.props.onNavigateBack();
      }
    });
  }

  componentWillUnmount(): void {
    if (this._tvEventHandler) {
      this._tvEventHandler.disable();
      delete this._tvEventHandler;
    }
  }

  render(): React.Element<any> {
    const { scenes, style, viewProps } = this.props;

    const scenesProps = scenes.map(scene => {
      const props = NavigationPropTypes.extractSceneRendererProps(this.props);
      props.scene = scene;
      return props;
    });

    const barHeight = (this.props.statusBarHeight instanceof Animated.Value)
      ? Animated.add(this.props.statusBarHeight, new Animated.Value(APPBAR_HEIGHT))
      : APPBAR_HEIGHT + this.props.statusBarHeight;

    return (
      <Animated.View style={[
          styles.appbar,
          { height: barHeight },
          style
        ]}
        {...viewProps}
      >
        {scenesProps.map(this._renderLeft, this)}
        {scenesProps.map(this._renderTitle, this)}
        {scenesProps.map(this._renderRight, this)}
      </Animated.View>
    );
  }

  _renderLeft = (props: NavigationSceneRendererProps): ?React.Element<any> => {
    return this._renderSubView(
      props,
      'left',
      this.props.renderLeftComponent,
      NavigationHeaderStyleInterpolator.forLeft,
    );
  };

  _renderTitle = (props: NavigationSceneRendererProps): ?React.Element<any> => {
    return this._renderSubView(
      props,
      'title',
      this.props.renderTitleComponent,
      NavigationHeaderStyleInterpolator.forCenter,
    );
  };

  _renderRight = (props: NavigationSceneRendererProps): ?React.Element<any> => {
    return this._renderSubView(
      props,
      'right',
      this.props.renderRightComponent,
      NavigationHeaderStyleInterpolator.forRight,
    );
  };

  _renderSubView(
    props: NavigationSceneRendererProps,
    name: SubViewName,
    renderer: SubViewRenderer,
    styleInterpolator: NavigationStyleInterpolator,
  ): ?React.Element<any> {
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

    const subViewProps = {...props, onNavigateBack: this.props.onNavigateBack};
    const subView = renderer(subViewProps);
    if (subView === null) {
      return null;
    }

    const pointerEvents = offset !== 0 || isStale ? 'none' : 'box-none';
    return (
      <Animated.View
        pointerEvents={pointerEvents}
        key={name + '_' + key}
        style={[
          styles[name],
          { marginTop: this.props.statusBarHeight },
          styleInterpolator(props),
        ]}>
        {subView}
      </Animated.View>
    );
  }

  static HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
  static Title = NavigationHeaderTitle;
  static BackButton = NavigationHeaderBackButton;

}

const styles = StyleSheet.create({
  appbar: {
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#EFEFF2' : '#FFF',
    borderBottomColor: 'rgba(0, 0, 0, .15)',
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  title: {
    bottom: 0,
    left: APPBAR_HEIGHT,
    position: 'absolute',
    right: APPBAR_HEIGHT,
    top: 0,
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

module.exports = NavigationHeader;
