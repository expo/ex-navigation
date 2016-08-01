/**
 * @providesModule ExNavigationStack
 * @flow
 */

import React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import _ from 'lodash';
import invariant from 'invariant';
import cloneReferencedElement from 'react-clone-referenced-element';
import PureComponent from 'PureComponent';
import { debounce } from 'core-decorators';

import Actions from 'ExNavigationActions';
import NavigationBar from 'ExNavigationBar';
import NavigationItem from 'ExNavigationStackItem';

import { getBackButtonManager } from 'ExNavigationBackButtonManager';
import { createNavigatorComponent } from 'ExNavigationComponents';
import ExNavigatorContext from 'ExNavigatorContext';
import * as NavigationStyles from 'ExNavigationStyles';
import * as Utils from 'ExNavigationUtils';

const {
  AnimatedView: NavigationAnimatedView,
} = require('VendoredNavigationExperimental');

import type { NavigationSceneRendererProps, NavigationScene } from 'NavigationTypeDefinition';
import type { ExNavigationRoute } from 'ExNavigationRouter';
import type ExNavigationContext from 'ExNavigationContext';
import type { ExNavigationConfig, ExNavigationState } from 'ExNavigationTypeDefinition';
import type { ExNavigationTabContext } from 'ExNavigationTab';

const DEFAULT_ROUTE_CONFIG: ExNavigationConfig = {
  styles: Platform.OS !== 'android' ? NavigationStyles.FloatHorizontal : NavigationStyles.Fade,
};

type Props = {
  id: string,
  navigatorUID: string,
  initialRoute?: ExNavigationRoute,
  initialStack?: Array<ExNavigationRoute>,
  navigation: ExNavigationContext,
  onRegisterNavigatorContext: (navigatorUID: string, navigatorContext: ExNavigationStackContext) => void,
  navigationState?: Object,
  defaultRouteConfig?: ExNavigationConfig,
};

type State = {
  id: string,
  navigatorUID: string,
  parentNavigatorUID: string,
  navigatingFromIndex: number,
  navigatingToIndex: number,
};

type Context = {
  headerComponent: mixed,
  parentNavigatorUID: string,
};

type ExNavigationSceneRendererProps = {
  route: ExNavigationRoute,
} & NavigationSceneRendererProps;

let ROUTE_LISTENER_INDEX = 0;

type ExNavigationStackInstance = ReactComponent<*, *, *> & { _useAnimation: boolean, _routeListeners: { [listenerId: string]: Function } };

declare var requestAnimationFrame: () => void;

export class ExNavigationStackContext extends ExNavigatorContext {
  type = 'stack';

  parentNavigatorUID: string;
  defaultRouteConfig: ExNavigationConfig;
  componentInstance: ExNavigationStackInstance;

  constructor(
    navigatorUID: string,
    parentNavigatorUID: string,
    navigatorId: string,
    navigationContext: ExNavigationContext,
    componentInstance: ExNavigationStackInstance,
  ) {
    super(navigatorUID, parentNavigatorUID, navigatorId, navigationContext);
    this.navigatorUID = navigatorUID;
    this.parentNavigatorUID = parentNavigatorUID;
    this.navigatorId = navigatorId;
    this.navigationContext = navigationContext;
    this.componentInstance = componentInstance;
  }

  @debounce(500, true)
  push(route: ExNavigationRoute) {
    invariant(route !== null && route.key, 'Route is null or malformed.');
    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).push(route);
    });
  }

  @debounce(500, true)
  pop() {
    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).pop();
    });
  }

  getCurrentRoute() {
    const navigatorState = this._getNavigatorState();
    if (!navigatorState) {
      throw new Error('Navigation state for this navigator does not exist.');
    }
    return navigatorState.routes[navigatorState.index];
  }

  getCurrentIndex() {
    const navigatorState = this._getNavigatorState();
    if (!navigatorState) {
      throw new Error('Navigation state for this navigator does not exist.');
    }
    return navigatorState.index;
  }

  addRouteListener(listener: Function) {
    let listenerId = String(ROUTE_LISTENER_INDEX++);
    this.componentInstance._routeListeners[listenerId] = listener;
    return {
      remove: () => {
        delete this.componentInstance._routeListeners[listenerId];
      },
    };
  }

  immediatelyResetStack(routes: Array<ExNavigationRoute>, index: number = 0) {
    this.componentInstance._useAnimation = false;

    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).immediatelyResetStack(routes, index);
    });

    requestAnimationFrame(() => {
      this.componentInstance._useAnimation = true;
    });
  }

  showLocalAlert = (message, options) => {
    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).showLocalAlert(message, options);
    });
  };

  hideLocalAlert = () => {
    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).hideLocalAlert();
    });
  }

  updateCurrentRouteParams(newParams: Object) {
    this.navigationContext.performAction(({ stacks }) => {
      stacks(this.navigatorUID).updateCurrentRouteParams(newParams);
    });
  }
}

class ExNavigationStack extends PureComponent<any, Props, State> {
  props: Props;
  state: State;
  context: Context;
  _log: Function;
  _routeListeners: {
    [key: string]: Function
  };
  _useAnimation: boolean;

  static route: ExNavigationConfig = {
    __isNavigator: true,
  };

  static defaultProps = {
    defaultRouteConfig: DEFAULT_ROUTE_CONFIG,
  };

  static contextTypes = {
    parentNavigatorUID: React.PropTypes.string,
    headerComponent: React.PropTypes.func,
  };

  static childContextTypes = {
    parentNavigatorUID: React.PropTypes.string,
    navigator: React.PropTypes.instanceOf(ExNavigationStackContext),
    headerComponent: React.PropTypes.func,
  };

  getChildContext() {
    return {
      // Get the navigator actions instance for this navigator
      navigator: this._getNavigatorContext(),
      parentNavigatorUID: this.state.navigatorUID,
      headerComponent: this.props.headerComponent || this.context.headerComponent,
    };
  }

  constructor(props: Props, context: Context) {
    super(props, context);

    this.state = {
      id: props.id,
      navigatorUID: props.navigatorUID,
      parentNavigatorUID: context.parentNavigatorUID,
      navigatingFromIndex: -1,
      navigatingToIndex: 0,
    };

    this._routeListeners = {};
    this._useAnimation = true;

    this._log = Utils.createLogger('StackNavigation:' + this.state.navigatorUID);
  }

  render() {
    const navigationState: ?Object = this.props.navigationState;

    if (!navigationState) {
      return null;
    }

    return (
      <NavigationAnimatedView
        style={styles.container}
        applyAnimation={this._applyAnimation}
        navigationState={navigationState}
        onNavigate={this._onNavigate}
        renderOverlay={this._renderOverlay}
        renderScene={this._renderScene}
      />
    );
  }

  componentWillMount() {
    this._registerNavigatorContext();

    const { initialStack, initialRoute } = this.props;

    invariant(
      initialRoute || initialStack,
      `You must specify initialRoute or initialStack to initialize this StackNavigation.`
    );

    invariant(
      (initialRoute && !initialStack) || (!initialRoute && initialStack),
      `Only specify one of 'initialRoute' or 'initialStack' when initializing StackNavigation.`
    );

    let routes: Array<ExNavigationRoute> = [];
    if (initialStack) {
      routes = initialStack;
    } else if (initialRoute) {
      routes = [
        initialRoute,
      ];
    }

    let stack = routes;

    if (this.props.navigationState) {
      stack = [
        ...routes,
        ...this.props.navigationState.routes,
      ];
    }

    this.props.navigation.dispatch(Actions.setCurrentNavigator(
      this.state.navigatorUID,
      this.state.parentNavigatorUID,
      'stack',
      this._getDefaultRouteConfig(),
      stack,
      stack.length - 1,
    ));

    if (this.state.parentNavigatorUID) {
      const parentNavigator = this.props.navigation.getNavigatorByUID(this.state.parentNavigatorUID);
      if (parentNavigator.type === 'tab') {
        ((parentNavigator: any): ExNavigationTabContext).setNavigatorUIDForCurrentTab(this.state.navigatorUID);
      }
    }


    getBackButtonManager().ensureGlobalListener();
  }

  componentWillUnmount() {
    this.props.navigation.dispatch(Actions.removeNavigator(this.state.navigatorUID));
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevNavigationState: ?Object = this.props.navigationState;
    const nextNavigationState: ?Object = nextProps.navigationState;
    if (prevNavigationState && nextNavigationState && prevNavigationState.index !== nextNavigationState.index) {
      _.forEach(this._routeListeners, (listener) => {
        listener(prevNavigationState, nextNavigationState);
      });

      this.setState({
        navigatingFromIndex: prevNavigationState.index,
        navigatingToIndex: nextNavigationState.index,
      });
    }
  }

  _applyAnimation = (position, nextState, prevState) => {
    if (!this._useAnimation) {
      position.setValue(nextState.index);
      return;
    }

    // Gross...should figure out a way to make this stuff better TODO @skevy
    // In general though, we're getting route config (and thus, animation config) from the latest
    // scene, so that we know how to apply the animation.
    const navigationState: ?Object = this.props.navigationState;
    if (!navigationState) {
      return null;
    }

    const latestRoute = navigationState.routes[navigationState.routes.length - 1];
    const latestRouteConfig = latestRoute.config;
    const { applyAnimation } = latestRouteConfig.styles || {};

    if (typeof applyAnimation === 'function') {
      applyAnimation(position, nextState, prevState);
    }
  };

  _registerNavigatorContext() {
    this.props.onRegisterNavigatorContext(this.state.navigatorUID,
      new ExNavigationStackContext(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        this.state.id,
        this.props.navigation,
        this,
      )
    );
  }

  _onNavigate = ({ type } = {}) => {
    if (type === 'back' || type === 'BackAction') {
      this._getNavigatorContext().pop();
    }
  };

  _renderOverlay = (props: ExNavigationSceneRendererProps) => {
    // Determine animation styles based on the most recent scene in the stack.
    const latestRoute = this._getRouteAtIndex(props.scenes, props.scenes.length - 1);
    const latestRouteConfig: ExNavigationConfig = latestRoute.config;
    props = { ...props, latestRouteConfig, latestRoute };

    if (typeof this.props.renderOverlay === 'function') {
      return this.props.renderOverlay(props);
    }

    let interpolator = null;
    if (latestRouteConfig.styles) {
      interpolator = latestRouteConfig.styles.navigationBarAnimations;
      if (latestRouteConfig.navigationBar && latestRouteConfig.navigationBar.styles) {
        interpolator = latestRouteConfig.navigationBar.styles;
      }
    }

    // Get HeaderComponent from props/context
    const HeaderComponent = this.props.headerComponent || this.context.headerComponent || NavigationBar;
    const navigationBarIsVisible =
      latestRouteConfig.navigationBar &&
      latestRouteConfig.navigationBar.visible !== false;

    // TODO: add height and statusBarHeight options here

    return (
      <HeaderComponent
        {...props}
        getNavigatorContext={this._getNavigatorContext}
        navigatorUID={this.state.navigatorUID}
        visible={navigationBarIsVisible}
        interpolator={interpolator}
        renderLeftComponent={this._renderLeftComponentForHeader}
        renderTitleComponent={this._renderTitleComponentForHeader}
        renderRightComponent={this._renderRightComponentForHeader}
      />
    );
  };

  _drawerNavigatorParent = () => {
    let result;
    let currentNavigator = this._getNavigatorContext();

    while (currentNavigator) {
      try {
        currentNavigator = currentNavigator.getParentNavigator();
      } catch (e) {
        break;
      }

      if (currentNavigator.type === 'drawer') {
        result = currentNavigator;
        break;
      }
    }

    return result;
  }

  _renderLeftComponentForHeader = (props) => { //eslint-disable-line react/display-name
    const { scene: { route } } = props;
    const routeConfig = route.config;

    if (typeof routeConfig.navigationBar.renderLeft === 'function') {
      return routeConfig.navigationBar.renderLeft(route, props);
    }

    const drawerNavigatorParent = this._drawerNavigatorParent();
    if (props.scene.index === 0 && !!drawerNavigatorParent) {
      return (
        <NavigationBar.MenuButton
          navigator={drawerNavigatorParent}
          tintColor={route.getBarTintColor()}
        />
      );
    }
    if (props.scene.index > 0) {
      return (
        <NavigationBar.BackButton tintColor={route.getBarTintColor()} />
      );
    } else {
      return null;
    }
  };

  _renderTitleComponentForHeader = (props) => { //eslint-disable-line react/display-name
    const { scene: { route } } = props;
    const routeConfig = route.config;
    if (typeof routeConfig.navigationBar.renderTitle === 'function') {
      return routeConfig.navigationBar.renderTitle(route, props);
    }
    return (
      <NavigationBar.Title textStyle={route.getTitleStyle()} tintColor={route.getBarTintColor()}>
        {route.getTitle()}
      </NavigationBar.Title>
    );
  };

  _renderRightComponentForHeader = (props) => {
    const { scene: { route } } = props;
    const routeConfig = route.config;
    return routeConfig.navigationBar.renderRight && routeConfig.navigationBar.renderRight(route, props);
  };

  _renderScene = (props: ExNavigationSceneRendererProps) => {
    // Determine gesture and animation styles based on the most recent scene in the stack,
    // not based on the scene we're rendering in this method.
    const latestRoute = this._getRouteAtIndex(props.scenes, props.scenes.length - 1);

    const latestRouteConfig = latestRoute.config;
    const { sceneAnimations, gestures } = latestRouteConfig.styles || {};

    const scene: any = props.scene;
    const routeForScene = scene.route;

    return (
      <NavigationItem
        {...props}
        key={props.scene.key}
        route={routeForScene}
        sceneAnimations={sceneAnimations}
        gestures={gestures}
        renderScene={this._renderRoute}
      />
    );
  };

  _renderRoute = (props: ExNavigationSceneRendererProps) => {
    const route: ExNavigationRoute = props.route;
    const routeElement = route.render();

    let routeElementProps = {};

    const routeConfig = route.config;

    routeElementProps = {
      route,
    };

    let style = [
      styles.routeInnerContainer,
    ];

    if (routeConfig.navigationBar && routeConfig.navigationBar.visible !== false) {
      let customHeight = 0;
      let isTranslucent = !!routeConfig.navigationBar.translucent;

      if (_.isNumber(routeConfig.navigationBar.height)) {
        customHeight += routeConfig.height;
      }
      if (_.isNumber(routeConfig.navigationBar.statusBarHeight)) {
        customHeight += routeConfig.statusBarHeight;
      }

      if (_.isNumber(routeConfig.height) || _.isNumber(routeConfig.statusBarHeight)) {
        style = [...style, {marginTop: customHeight}];
      } else {
        style = [...style, isTranslucent ? styles.withNavigationBarTranslucent : styles.withNavigationBarOpaque];
      }
    } else {
      style = [...style, styles.withoutNavigationBar];
    }

    if (routeConfig.sceneStyle) {
      style = [...style, routeConfig.sceneStyle || styles.defaultSceneStyle];
    }

    return (
      <View style={styles.routeContainer}>
        <Animated.View style={style}>
          <View style={{ flex: 1 }}>
            {cloneReferencedElement(routeElement, routeElementProps)}
          </View>
        </Animated.View>
      </View>
    );
  };

  _getRouteAtIndex(scenes: Array<NavigationScene>, index: number): ExNavigationRoute {
    const scene: any = scenes[index];
    const latestRoute: ExNavigationState = scene.route;
    return latestRoute;
  }

  _getDefaultRouteConfig(props) {
    if (!props) {
      props = this.props;
    }
    return _.merge({}, DEFAULT_ROUTE_CONFIG, props.defaultRouteConfig);
  }

  _getNavigatorContext = (): ExNavigationStackContext => {
    return this.props.navigation.getNavigatorByUID(this.state.navigatorUID);
  }
}

export default createNavigatorComponent(ExNavigationStack);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  defaultSceneStyle: {
    backgroundColor: '#fff',
  },
  routeContainer: {
    flex: 1,
  },
  routeInnerContainer: {
    flex: 1,
  },
  withoutNavigationBar: {
    marginTop: 0,
  },
  withNavigationBarTranslucent: {
    paddingTop: 0,
  },
  withNavigationBarOpaque: {
    // TODO: needs to be dynamic based off of current navbar height
    paddingTop: NavigationBar.DEFAULT_HEIGHT,
  },
});
