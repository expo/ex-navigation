/**
 * @providesModule ExNavigationPropTypes
 */

import { PropTypes } from 'react';

export const NavigationPropType = PropTypes.shape({
  getNavigator: PropTypes.func.isRequired,
});

export const StackNavigatorContextType = PropTypes.shape({
  push: PropTypes.func.isRequired,
  pop: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
});
