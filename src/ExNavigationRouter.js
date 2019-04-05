/**
 * @flow
 */
/* eslint-disable react/display-name */

import React from 'react';
import UUID from 'uuid-js';

import { EventEmitter } from 'fbemitter';
import invariant from 'invariant';
import warning from 'warning';
import _ from 'lodash';

import NavigationBar from './ExNavigationBar';

import {
  withNavigation,
  createFocusableComponent,
} from './ExNavigationComponents';

import type {
  ExNavigationState,
  ExNavigationConfig,
} from './ExNavigationTypeDefinition';

type ExNavigationRouteDefinition =
  | ReactClass<any>
  | ((state: ExNavigationState) => ReactClass<any>)
  | {
      render: (state: ExNavigationState) => ReactElement<any>,
      config?: (
        routeConfig: ExNavigationConfig,
        routeParams: Object
      ) => ExNavigationConfig,
    };

type RouteRenderer = (x: ExNavigationState) => ReactElement<{}>;

type RouteConfig = {
  key: string,
  routeName: string,
  params: Object,
  config: Object,
  _renderRoute: RouteRenderer,
};

export class ExNavigationRoute {
  key: string;
  routeName: string;
  params: Object;
  config: ExNavigationConfig;
  _renderRoute: RouteRenderer;

  render: () => ReactElement<{}>;
  getTitle: Function;
  getTitleStyle: Function;
  getBarStyle: Function;
  getBarHeight: Function;
  getBarElevation: Function;
  getBarBorderBottomColor: Function;
  getBarBorderBottomWidth: Function;
  getBarBackgroundColor: Function;
  getBarTintColor: Function;

  constructor({ key, routeName, params, config, _renderRoute }: RouteConfig) {
    this.key = key;
    this.routeName = routeName;
    this.params = params;
    this.config = config;
    this._renderRoute = _renderRoute;
  }

  render = () => this._renderRoute(this);

  getTitle = () => {
    const title = _.get(this.config, 'navigationBar.title');
    if (typeof title === 'function') {
      return title(this.params, this.config);
    }
    return title;
  };

  getBarStyle = () => {
    let result = {};
    let height = this.getBarHeight();
    let elevation = this.getBarElevation();
    let borderBottomWidth = this.getBarBorderBottomWidth();
    let borderBottomColor = this.getBarBorderBottomColor();
    let backgroundColor = this.getBarBackgroundColor();

    if (backgroundColor) {
      if (
        __DEV__ &&
        this.getTranslucent() &&
        !backgroundColor.match(/rgba|#([0-9a-fA-F]{2}){4}/)
      ) {
        console.warn(
          'Using translucent navigation bar and specifying a solid background color, please use rgba or the bar will not be translucent.'
        );
      }

      result.backgroundColor = backgroundColor;
    }

    if (_.isNumber(elevation)) {
      result.elevation = elevation;
    }

    if (_.isNumber(height)) {
      result.height = height;
    }

    if (_.isNumber(borderBottomWidth)) {
      result.borderBottomWidth = borderBottomWidth;
    }

    if (borderBottomColor) {
      result.borderBottomColor = borderBottomColor;
    }

    return result;
  };

  getTranslucent = () => {
    return _.get(this.config, 'navigationBar.translucent');
  };

  getTranslucentTint = () => {
    return _.get(this.config, 'navigationBar.translucentTint');
  };

  getBarElevation = () => {
    return _.get(this.config, 'navigationBar.elevation');
  };

  getBarHeight = () => {
    return _.get(this.config, 'navigationBar.height');
  };

  getBarBorderBottomWidth = () => {
    return _.get(this.config, 'navigationBar.borderBottomWidth');
  };

  getBarBorderBottomColor = () => {
    return _.get(this.config, 'navigationBar.borderBottomColor');
  };

  getBarBackgroundColor = () => {
    const backgroundColor = _.get(this.config, 'navigationBar.backgroundColor');
    if (typeof backgroundColor === 'function') {
      return backgroundColor(this.params, this.config);
    }
    return backgroundColor;
  };

  getBarTintColor = () => {
    const tintColor = _.get(this.config, 'navigationBar.tintColor');
    if (typeof tintColor === 'function') {
      return tintColor(this.params, this.config);
    }
    return tintColor;
  };

  getTitleStyle = () => {
    return _.get(this.config, 'navigationBar.titleStyle');
  };

  getEventEmitter = () => {
    return this.config.eventEmitter;
  };

  getTabBarInset = () => {
    return _.get(this.config, '__tabBarInset');
  };

  getContentContainerStyle = () => {
    return this.getContentInsetsStyle();
  };

  getContentInsetsStyle = () => {
    let result = {};

    if (this.getTranslucent()) {
      // In order to not break sticky section headers we need to use marginTop
      // instead of paddingTop, even though it's not desirable because the
      // scrollbar appears to go underneath the navbar.
      result.marginTop = NavigationBar.DEFAULT_HEIGHT;
    }

    if (this.getTabBarInset()) {
      result.paddingBottom = this.getTabBarInset();
    }

    return result;
  };

  clone() {
    return new ExNavigationRoute({
      key: this.key,
      routeName: this.routeName,
      params: this.params,
      config: this.config,
      _renderRoute: this._renderRoute,
    });
  }
}

export class ExNavigationRouter<RC: RouteCreator> {
  _routes: { [routeName: string]: () => ExNavigationRouteDefinition };
  _routesCreator: Function;
  _routesCreated: boolean;
  _ignoreSerializableWarnings: boolean;

  constructor(routesCreator: Function, options: Object = {}) {
    this._routesCreator = routesCreator;
    this._routes = {};
    this._routesCreated = false;
    this._ignoreSerializableWarnings = !!options.ignoreSerializableWarnings;
  }

  getRoute(routeName: $Keys<RC>, routeParams: Object = {}): ExNavigationRoute {
    this._ensureRoute(routeName);

    if (__DEV__ && !this._ignoreSerializableWarnings) {
      warning(
        _isSerializable(routeParams),
        'You passed a non-serializable value as route parameters. This may prevent navigation state ' +
          'from being saved and restored properly. This is only relevant if you would like to be able to' +
          'save and reload your navigation state. You can ignore this error with ignoreSerializableWarnings.'
      );
    }

    return this._createRoute(routeName, this._routes[routeName], routeParams);
  }

  updateRouteWithParams(route: ExNavigationRoute, newParams: Object) {
    return this._createRoute(route.routeName, this._routes[route.routeName], {
      ...route.params,
      ...newParams,
    });
  }

  _makeRoute(RouteComponent: ReactClass<{}>): RouteRenderer {
    const FocusAwareRouteComponent = createFocusableComponent(
      withNavigation(RouteComponent)
    );
    return ({ params, config }: ExNavigationState): ReactElement<{}> => (
      <FocusAwareRouteComponent
        {...(config && config.defaultParams ? config.defaultParams : {})}
        {...params}
      />
    );
  }

  _createRoute(
    routeName: string,
    routeDefinitionThunk: (routeParams: Object) => ExNavigationRouteDefinition,
    routeParams: Object = {}
  ): ExNavigationRoute {
    const routeDefinitionOrComponent = routeDefinitionThunk(routeParams);

    let routeDefinition;
    let renderRoute;
    if (typeof routeDefinitionOrComponent === 'function') {
      routeDefinition = this._makeRoute(routeDefinitionOrComponent);
      renderRoute = routeDefinition;
    } else if (typeof routeDefinitionOrComponent.render === 'function') {
      routeDefinition = routeDefinitionOrComponent;
      renderRoute = routeDefinitionOrComponent.render;
    } else {
      throw new Error(
        'Route definition must either be a function that returns a ReactElement, or an object with a `render` function.'
      );
    }

    const _eventEmitter = new EventEmitter();
    const _renderRoute = renderRoute;

    let routeConfig = {
      eventEmitter: _eventEmitter,
    };

    if (routeDefinition.config) {
      if (typeof routeDefinition.config === 'function') {
        routeConfig = {
          ...routeConfig,
          ...routeDefinition.config(routeConfig, routeParams),
        };
      } else {
        routeConfig = {
          ...routeConfig,
          ...routeDefinition.config,
        };
      }
    }

    const route: ExNavigationRoute = new ExNavigationRoute({
      key: UUID.create(4).toString(),
      routeName,
      params: routeParams,
      config: routeConfig,
      _routeDefinition: routeDefinition,
      _renderRoute,
    });

    const routeElement: ReactElement<{}> = route.render();
    const ComponentClass = routeElement.type;

    const componentRouteConfig = ComponentClass.route;
    if (componentRouteConfig) {
      route.config = _.merge({}, route.config, componentRouteConfig);
    }

    return route;
  }

  _ensureRoute(routeName: string) {
    if (!this._routesCreated) {
      this._routes = { ...this._routes, ...this._routesCreator() };
      this._routesCreated = true;
    }
    invariant(this._routes[routeName], `Route '${routeName}' does not exist.`);
  }
}

type RouteCreator = {
  [key: string]: () => ExNavigationRouteDefinition,
};

export function createRouter<RC: RouteCreator>(
  routesCreator: () => RC,
  options?: Object
): ExNavigationRouter<RC> {
  return new ExNavigationRouter(routesCreator, options);
}

const _isSerializable = (obj) => {
  if (
    _.isUndefined(obj) ||
    _.isNull(obj) ||
    _.isBoolean(obj) ||
    _.isNumber(obj) ||
    _.isString(obj)
  ) {
    return true;
  }

  if (!_.isPlainObject(obj) && !_.isArray(obj)) {
    return false;
  }

  for (var key in obj) {
    if (!_isSerializable(obj[key])) {
      return false;
    }
  }

  return true;
};
