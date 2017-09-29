import PropTypes from 'prop-types';

export const NavigationPropType = PropTypes.shape({
  getNavigator: PropTypes.func.isRequired,
});

export const StackNavigatorContextType = PropTypes.shape({
  push: PropTypes.func.isRequired,
  pop: PropTypes.func.isRequired,
  popToTop: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
});
