/**
 * @providesModule ExNavigationMiddleware
 */

import _ from 'lodash';
import invariant from 'invariant';

import ExNavigationActionTypes from 'ExNavigationActionTypes';
import ExNavigationActions from 'ExNavigationActions';

export default (navigationStateKey) => ([
  ({ getState, dispatch }) => check(
    ExNavigationActionTypes.GO_BACK,
    (next, action) => {
      const navState = getState()[navigationStateKey];

      const currentNavigatorState = navState.navigators[navState.currentNavigatorUID];
      if (currentNavigatorState.index === 0) {
        const { parentNavigatorUID } = currentNavigatorState;
        if (parentNavigatorUID) {
          dispatch(ExNavigationActions.pop(parentNavigatorUID));
        }
      } else {
        dispatch(ExNavigationActions.pop(navState.currentNavigatorUID));
      }

      const { navigation: newNavState } = getState();
      return navState !== newNavState;
    }
  ),
  ({ getState, dispatch }) => check(
    ExNavigationActionTypes.UPDATE_CURRENT_ROUTE_PARAMS,
    (next, { navigatorUID, newParams }) => {
      const navState = getState()[navigationStateKey];

      invariant(navState.navigators[navigatorUID], 'Navigator does not exist.');
      const navigatorState = navState.navigators[navigatorUID];

      const currentIndex = navigatorState.index;
      const currentRouteAtIndex = navigatorState.routes[currentIndex];

      // Check for equal params -- if it's the same, don't update the state (avoids unnecessary component updates)
      if (_.isEqual(newParams, currentRouteAtIndex.params)) {
        return;
      }

      const newRoute = currentRouteAtIndex.clone();
      newRoute.params = {
        ...newRoute.params,
        ...newParams,
      };

      dispatch({
        type: ExNavigationActionTypes.UPDATE_ROUTE_AT_INDEX,
        navigatorUID,
        index: currentIndex,
        newRoute,
      });

      return;
    }
  ),
]);

// Check whether a specific middleware is of a certain type.
const check = (actionType, nextFn) => next => action => {
  if (action.type === 'EX_NAVIGATION.BATCH') {
    action.payload.forEach(batchedAction => {
      if (batchedAction.type === actionType) {
        nextFn(next, batchedAction);
      }
    });
    return next(action);
  }
  return action.type !== actionType ? next(action) : nextFn(next, action);
};
