/**
 * @flow
 */

import { BackAndroid } from 'react-native';

import ExNavigationActions from './ExNavigationActions';

import type { ExNavigationStore } from './ExNavigationStore';

/**
 * Manages a global listener, as well as any custom listeners, on the
 * Android hardware back button.
 *
 * Rather than using the BackAnroid React Native module directly, use this
 * class to manage the any custom listeners or to enable or disable the
 * global back button listener.
 */
class ExNavigationBackButtonManager {
  _listeners = [];
  store: ExNavigationStore;
  _onHardwareBackPress: Function;

  constructor(store: ExNavigationStore) {
    this.store = store;
    this._listeners = [];
  }

  pushListener(listener: () => Promise<void>) {
    let newListeners = [...this._listeners];
    newListeners.push(listener);
    this._setListeners(newListeners);
  }

  popListener() {
    let newListeners = [...this._listeners];
    newListeners.pop();
    this._setListeners(newListeners);
  }

  ensureGlobalListener() {
    this._setListeners([
      this._onHardwareBackPress,
    ]);
  }

  disable() {
    this._listeners.forEach(listener => BackAndroid.removeEventListener('hardwareBackPress', listener));
    BackAndroid.addEventListener('hardwareBackPress', this._disabledBackButtonPress); // Don't let app be exited.
  }

  enable() {
    this._setListeners([...this._listeners]);
  }

  _setListeners(newListeners: Array<() => Promise<void>>) {
    this.disable();
    this._listeners = newListeners;
    BackAndroid.removeEventListener('hardwareBackPress', this._disabledBackButtonPress);
    BackAndroid.addEventListener('hardwareBackPress', this._listeners[this._listeners.length - 1]);
  }

  _onHardwareBackPress = async () => {
    const moreRoutes = await this.store.dispatch(ExNavigationActions.goBack());
    if (moreRoutes === false) {
      BackAndroid.exitApp();
    }
  };

  _disabledBackButtonPress = () => {
    return true;
  }
}

let manager;

export function createBackButtonManager(store: ExNavigationStore) {
  if (!manager) {
    manager = new ExNavigationBackButtonManager(store);
  }
  return manager;
}

export function getBackButtonManager() {
  return manager;
}
