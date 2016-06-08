/**
 * @providesModule ExNavigatorContext
 * @flow
 */

export default class ExNavigatorContext {
  isFocused() {
    return this.navigation.getCurrentNavigatorUID() === this.navigatorUID;
  }

  _getNavigatorState() {
    return this.navigation.navigationState && this.navigation.navigationState.navigators[this.navigatorUID];
  }
}
