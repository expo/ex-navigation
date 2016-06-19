/**
 * @providesModule ExNavigatorContext
 * @flow
 */

import ExNavigationContext from 'ExNavigationContext';

export default class ExNavigatorContext {
  navigatorUID: string;
  parentNavigatorUID: string;
  navigatorId: string;
  navigation: ExNavigationContext;
  type: string;

  constructor(
    navigatorUID: string,
    parentNavigatorUID: string,
    navigatorId: string,
    navigation: Object
  ) {
    this.navigatorUID = navigatorUID;
    this.navigatorId = navigatorId;
    this.navigation = navigation;
  }

  getParentNavigator() {
    return this.navigation.getNavigatorByUID(this.parentNavigatorUID);
  }

  isFocused() {
    return this.navigation.getCurrentNavigatorUID() === this.navigatorUID;
  }

  _getNavigatorState() {
    return this.navigation.navigationState && this.navigation.navigationState.navigators[this.navigatorUID];
  }
}
