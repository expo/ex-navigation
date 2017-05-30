/**
 * @flow
 */

import ActionTypes from './ExNavigationActionTypes';

export default class ExNavigationActions {
  static initialize() {
    return { type: ActionTypes.INITIALIZE };
  }

  static setCurrentNavigator(
    navigatorUID,
    parentNavigatorUID,
    navigatorType,
    defaultRouteConfig,
    routes,
    index = 0
  ) {
    return {
      type: ActionTypes.SET_CURRENT_NAVIGATOR,
      navigatorUID,
      parentNavigatorUID,
      navigatorType,
      defaultRouteConfig,
      routes,
      index,
    };
  }

  static removeNavigator(navigatorUID) {
    return {
      type: ActionTypes.REMOVE_NAVIGATOR,
      navigatorUID,
    };
  }

  static push(navigatorUID, child) {
    return {
      type: ActionTypes.PUSH,
      navigatorUID,
      child,
    };
  }

  static pop(navigatorUID) {
    return {
      type: ActionTypes.POP,
      navigatorUID,
    };
  }

  static popN(navigatorUID, n) {
    return {
      type: ActionTypes.POP_N,
      navigatorUID,
      n,
    };
  }

  static popToTop(navigatorUID) {
    return {
      type: ActionTypes.POP_TO_TOP,
      navigatorUID,
    };
  }

  static replace(navigatorUID, child) {
    return {
      type: ActionTypes.REPLACE,
      navigatorUID,
      child,
    };
  }

  static immediatelyResetStack(navigatorUID, routes, index) {
    return {
      type: ActionTypes.IMMEDIATELY_RESET_STACK,
      navigatorUID,
      routes,
      index,
    };
  }

  static updateCurrentRouteParams(navigatorUID, newParams) {
    return {
      type: ActionTypes.UPDATE_CURRENT_ROUTE_PARAMS,
      navigatorUID,
      newParams,
    };
  }

  static jumpToTab(navigatorUID, tab, index) {
    return {
      type: ActionTypes.JUMP_TO_TAB,
      navigatorUID,
      tab,
      index,
    };
  }

  static jumpToItem(navigatorUID, item) {
    return {
      type: ActionTypes.JUMP_TO_ITEM,
      navigatorUID,
      item,
    };
  }

  static toggleDrawer(navigatorUID) {
    return {
      type: ActionTypes.TOGGLE_DRAWER,
      navigatorUID,
    };
  }

  static goBack() {
    return {
      type: ActionTypes.GO_BACK,
    };
  }

  static showLocalAlert(navigatorUID, message, options) {
    return {
      type: ActionTypes.SHOW_LOCAL_ALERT_BAR,
      navigatorUID,
      message,
      options,
    };
  }

  static hideLocalAlert(navigatorUID) {
    return {
      type: ActionTypes.HIDE_LOCAL_ALERT_BAR,
      navigatorUID,
    };
  }
}
