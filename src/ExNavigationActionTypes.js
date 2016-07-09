/**
 * @providesModule ExNavigationActionTypes
 */

import mirror from 'mirror-creator';

export default mirror([
  'INITIALIZE',
  'SET_CURRENT_NAVIGATOR',
  'REMOVE_NAVIGATOR',
  'PUSH',
  'POP',
  'IMMEDIATELY_RESET_STACK',
  'UPDATE_CURRENT_ROUTE_PARAMS',
  'UPDATE_ROUTE_AT_INDEX',
  'JUMP_TO_TAB',
  'JUMP_TO_ITEM',
  'TOGGLE_DRAWER',
  'GO_BACK',
], { prefix: 'EX_NAVIGATION.'});
