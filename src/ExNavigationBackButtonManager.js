/**
 * @flow
 */

import { BackAndroid, BackHandler } from 'react-native';

import ExNavigationActions from './ExNavigationActions';

import type { ExNavigationStore } from './ExNavigationStore';

const Handler = BackHandler ? BackHandler : BackAndroid;

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
  _store: ?ExNavigationStore;
  _onHardwareBackPress: Function;

  constructor() {
    this._listeners = [];
  }

  setStore(store: ExNavigationStore) {
    this._store = store;
  }

  unsetStore(store: ExNavigationStore) {
    if (this._store === store) {
      this._store = null;
    }
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
    this._setListeners([this._onHardwareBackPress]);
  }

  disable() {
    this._listeners.forEach(listener =>
      Handler.removeEventListener('hardwareBackPress', listener)
    );
    Handler.addEventListener(
      'hardwareBackPress',
      this._disabledBackButtonPress
    ); // Don't let app be exited.
  }

  enable() {
    this._setListeners([...this._listeners]);
  }

  _setListeners(newListeners: Array<() => Promise<void>>) {
    this.disable();
    this._listeners = newListeners;
    Handler.removeEventListener(
      'hardwareBackPress',
      this._disabledBackButtonPress
    );
    Handler.addEventListener(
      'hardwareBackPress',
      this._listeners[this._listeners.length - 1]
    );
  }

  _onHardwareBackPress = async () => {
    if (!this._store) {
      return;
    }
    const moreRoutes = await this._store.dispatch(ExNavigationActions.goBack());
    if (moreRoutes === false) {
      Handler.exitApp();
    }
  };

  _disabledBackButtonPress = () => {
    return true;
  };
}

let manager;

export function createBackButtonManager() {
  if (!manager) {
    manager = new ExNavigationBackButtonManager();
  }
  return manager;
}

export function getBackButtonManager() {
  return manager;
}
