/**
 * @providesModule ExNavigatorContext
 * @flow
 */

import ExNavigationContext from 'ExNavigationContext';

export default class ExNavigatorContext {
  navigatorUID: string;
  parentNavigatorUID: string;
  navigatorId: string;
  navigationContext: ExNavigationContext;
  type: string;

  constructor(
    navigatorUID: string,
    parentNavigatorUID: string,
    navigatorId: string,
    navigationContext: Object
  ) {
    this.navigatorUID = navigatorUID;
    this.navigatorId = navigatorId;
    this.navigationContext = navigationContext;
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
