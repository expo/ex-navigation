/**
 * @providesModule ExNavigationStore
 * @flow
 */

import {
  applyMiddleware,
  createStore,
  compose,
  combineReducers,
} from 'redux';

import ExNavigationReducer from 'ExNavigationReducer';
import createExNavigationMiddleware from 'ExNavigationMiddleware';

export type ExNavigatorState = {
  children: any,
  index: number,
  key: string,
  type: string,
};

export type ExNavigationState = {
  currentNavigatorUID: string,
  navigators: {
    [navigatorUID: string]: ExNavigatorState,
  }
};

export type ExNavigationStore = {
  __exNavigationStateKey: string,
  getState(): ?ExNavigationState,
  dispatch(action: mixed): any,
  subscribe(listener: () => void): () => void,
}

type Reducer = (state: mixed, action: mixed) => Object;
type StoreCreator = (reducer: Reducer, initialState: ?Object, enhancer?: Function) => ExNavigationStore;

const BATCH_ACTION = 'EX_NAVIGATION.BATCH';

export function batchNavigationActions(actions: Array<mixed>): mixed {
	return {type: BATCH_ACTION, payload: actions};
}

export function enableActionBatching(reduce: Reducer) {
  return function batchingReducer(state: any, action: any) {
    switch (action.type) {
      case BATCH_ACTION:
        return action.payload.reduce(batchingReducer, state);
      default:
        return reduce(state, action);
    }
  };
}

export function createNavigationEnabledStore({
  createStore: createStoreFn = createStore,
  navigationStateKey = 'navigation',
}: { createStore?: StoreCreator, navigationStateKey?: string } = {}): StoreCreator {
  return (reducer: Reducer, initialState: ?Object = {}, enhancer: ?Function = null) => { // eslint-disable-line space-infix-ops
    const reducerWithNav = enableActionBatching(reducer);

    let enhancerWithNav;
    if (typeof enhancer === 'function') {
      enhancerWithNav = compose(
        applyMiddleware(...createExNavigationMiddleware(navigationStateKey)),
        enhancer,
      );
    } else {
      enhancerWithNav = applyMiddleware(...createExNavigationMiddleware(navigationStateKey));
    }

    const store: ExNavigationStore = createStoreFn(reducerWithNav, initialState, enhancerWithNav);
    store.__exNavigationStateKey = navigationStateKey;
    return store;
  };
}

export default function createNavigationStore() {
  const reducers = {
    navigation: ExNavigationReducer,
  };
  return createNavigationEnabledStore()(combineReducers(reducers));
}
