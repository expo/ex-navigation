/**
 * @flow
 */

import ExNavigationContext from './ExNavigationContext';

export default class ExNavigatorContext<T> {
  type: T;

  navigatorUID: string;
  parentNavigatorUID: string;
  navigatorId: string;
  navigationContext: ExNavigationContext;
  options: Object;

  constructor(
    navigatorUID: string,
    parentNavigatorUID: string,
    navigatorId: string,
    navigationContext: Object,
    options: ?Object
  ) {
    this.navigatorUID = navigatorUID;
    this.navigatorId = navigatorId;
    this.navigationContext = navigationContext;
    this.options = options || {};
  }

  getParentNavigator() {
    return this.navigationContext.getNavigatorByUID(this.parentNavigatorUID);
  }

  isFocused() {
    return this.navigationContext.getCurrentNavigatorUID() === this.navigatorUID;
  }

  _getNavigatorState() {
    return this.navigationContext.navigationState && this.navigationContext.navigationState.navigators[this.navigatorUID];
  }
}
