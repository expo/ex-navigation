/**
 * @providesModule ExNavigationContext
 * @flow
 */

import invariant from 'invariant';

import Actions from 'ExNavigationActions';
import createNavigationStore, { batchNavigationActions } from 'ExNavigationStore';
// import ExNavigationVisibilityManager from 'ExNavigationVisibilityManager';

import type ExNavigatorContext from 'ExNavigatorContext';

import type {
  ExNavigationRoute,
  ExNavigationRouter,
} from 'ExNavigationRouter';

import type {
  ExNavigationStore,
  ExNavigationState,
} from 'ExNavigationStore';

/**
 * Represents
 */
export default class NavigationContext {
  _store: ExNavigationStore;
  _router: ExNavigationRouter<*>;
  _navigatorContexts: {
    [navigatorUID: string]: ExNavigatorContext<*>
  };
  // _visiblityManager: ExNavigationVisibilityManager;

  registerNavigatorContext: (navigatorUID: string, navigatorContext: ExNavigatorContext<*>) => void;

  constructor({ store, router }: { store?: ExNavigationStore, router: ExNavigationRouter<*> }) {
    if (store == null) {
      store = createNavigationStore();
    }

    this._store = store;
    this._router = router;
    this._navigatorContexts = {};

    this.registerNavigatorContext = this.registerNavigatorContext.bind(this);
  }

  getNavigator(navigatorId: string): ExNavigatorContext<*> {
    let navigatorContext;
    const contextKeys = Object.keys(this._navigatorContexts);
    contextKeys.forEach(contextKey => {
      let c = this._navigatorContexts[contextKey];
      if (c.navigatorId === navigatorId) {
        if (!navigatorContext) {
          navigatorContext = c;
        } else {
          throw new Error(`More than one navigator exists with id '${navigatorId}'. Please access the navigator context using 'getNavigatorByUID'.`);
        }
      }
    });

    invariant(navigatorContext, 'Navigator does not exist.');
    return navigatorContext;
  }

  /**
   * Returns the NavigatorContext for the specified navigator.
   */
  getNavigatorByUID(navigatorUID: string): ExNavigatorContext<*> {
    // return the NavigatorContext for navigatorId
    invariant(this._navigatorContexts[navigatorUID], 'Navigator does not exist.');
    return this._navigatorContexts[navigatorUID];
  }

  getCurrentNavigatorUID(): ?string {
    const state = this.navigationState;
    if (state) {
      return state.currentNavigatorUID;
    }
    return null;
  }

  getFocusedRoute(): ?ExNavigationRoute {
    if (!this.navigationState) {
      return null;
    }

    const currentNavigator = this.navigationState.navigators[this.navigationState.currentNavigatorUID];
    if (!currentNavigator) {
      return null;
    }

    return currentNavigator.routes[currentNavigator.index];
  }

  registerNavigatorContext(navigatorUID: string, navigatorContext: ExNavigatorContext<*>) {
    this._navigatorContexts[navigatorUID] = navigatorContext;
  }

  get store(): ExNavigationStore {
    return this._store;
  }

  get navigationStateKey(): string {
    return this._store.__exNavigationStateKey;
  }

  get dispatch(): (action: mixed) => any {
    if (!this._store) {
      throw new Error('Store is not set on navigation context.');
    }

    return this._store.dispatch;
  }

  get router(): ExNavigationRouter<*> {
    return this._router;
  }

  get navigationState(): ?ExNavigationState {
    const state = this._store.getState();
    if (state == null) {
      return null;
    }
    return state[this._store.__exNavigationStateKey];
  }

  performAction(actionFn: Function) {
    let actions = [];
    const stateUtils = {
      drawer: (uid) => ({
        jumpToItem: (itemId) => {
          actions.push(
            Actions.jumpToItem(uid, {
              key: itemId,
            })
          );
        },
        toggleDrawer: () => {
          actions.push(
            Actions.toggleDrawer(uid)
          );
        },
      }),
      tabs: (uid) => ({
        jumpToTab: (tabId) => {
          actions.push(
            Actions.jumpToTab(uid, {
              key: tabId,
            })
          );
        },
      }),
      stacks: (uid) => ({
        push: (route) => {
          actions.push(
            Actions.push(uid, route)
          );
        },
        pop: () => {
          actions.push(
            Actions.pop(uid)
          );
        },
        immediatelyResetStack: (routes, index) => {
          const mappedChildren = routes.map((route, i) => {
            invariant(route !== null && route.key, `Route at index ${i} is null or malformed.`);
            return route;
          });

          actions.push(
            Actions.immediatelyResetStack(uid, mappedChildren, index)
          );
        },
        updateCurrentRouteParams: (newParams) => {
          actions.push(
            Actions.updateCurrentRouteParams(uid, newParams)
          );
        },
        showLocalAlert: (message, options) => {
          actions.push(
            Actions.showLocalAlert(uid, message, options)
          );
        },
        hideLocalAlert: () => {
          actions.push(
            Actions.hideLocalAlert(uid)
          );
        },
      }),
    };
    actionFn(stateUtils);
    this.store.dispatch(batchNavigationActions(actions));
  }
}
