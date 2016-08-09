/**
 * @flow
 */

import React, { PropTypes } from 'react';

import UUID from 'uuid-js';

import { createSelector } from 'reselect';
import hoistStatics from 'hoist-non-react-statics';
import PureComponent from './utils/PureComponent';
import shallowEqual from 'fbjs/lib/shallowEqual';

import ExNavigationContext from './ExNavigationContext';
import connect from './ExNavigationConnect';

import type {
  ExNavigatorState,
} from './ExNavigationStore';

function getDisplayName(WrappedComponent: ReactClass<any>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type WrappedComponentProps = {
  navigatorUID: string,
  navigation: ExNavigationContext,
};

const getStateForNavigatorId = (state, props: WrappedComponentProps) => {
  const navigationState = state[props.navigation.navigationStateKey];
  return navigationState.navigators && props.navigatorUID && navigationState.navigators[props.navigatorUID];
};

const makeNavigatorStateSelector = () => {
  return createSelector(
    [getStateForNavigatorId],
    (navigationState) => navigationState,
  );
};

export function createNavigatorComponent(WrappedComponent: ReactClass<any>) {
  type Props = {
    id: ?string,
    navigation: ?ExNavigationContext,
    navigationState: ?ExNavigatorState,
  };

  type State = {
    navigatorUID: string,
  };

  type Context = {
    navigation: ExNavigationContext,
  };

  const makeMapStateToProps = () => {
    const navigatorStateSelector = makeNavigatorStateSelector();
    return (iState, iProps) => ({
      navigationState: navigatorStateSelector(iState, iProps),
    });
  };

  // Connect the wrapped component to the correct navigation state
  const ConnectedWrappedComponent = connect(
    makeMapStateToProps,
    null,
    null,
    { withRef: true },
  )(WrappedComponent);

  class ExNavigatorComponent extends React.Component {
    props: Props;
    state: State;
    context: Context;
    _wrappedInstance: ?ReactElement<{}>;
    _unsubscribe: ?() => void;

    static contextTypes = {
      navigation: PropTypes.instanceOf(ExNavigationContext),
    };

    static childContextTypes = {
      navigation: PropTypes.instanceOf(ExNavigationContext),
    };

    constructor(props: Props, context: Context) {
      super(props, context);
      this._wrappedInstance = null;

      let navigatorUID = UUID.create(4).toString();
      this.state = {
        navigatorUID,
      };
    }

    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: Context) {
      return !shallowEqual(this.props, nextProps) ||
         !shallowEqual(this.state, nextState) ||
         !shallowEqual(this.context, nextContext);
    }

    render(): ?ReactElement<any> {
      const navigation = this.getNavigationContext();

      return (
        <ConnectedWrappedComponent
          ref={this._wrappedInstanceRef}
          navigatorUID={this.state.navigatorUID}
          navigation={navigation}
          onRegisterNavigatorContext={navigation.registerNavigatorContext}
          {...this.props}
        />
      );
    }

    getChildContext() {
      return {
        navigation: this.getNavigationContext(),
      };
    }

    getWrappedInstance() {
      return this._wrappedInstance;
    }

    getNavigationContext(): ExNavigationContext {
      return this.props.navigation ||
        this.context.navigation;
    }

    _wrappedInstanceRef = (c: ReactElement<{}>) => {
      if (c == null) {
        this._wrappedInstance = null;
      } else {
        /* $FlowFixMe */
        this._wrappedInstance = c.refs.wrappedInstance;
      }
    }
  }

  ExNavigatorComponent.displayName = `ExNavigatorComponent(${getDisplayName(WrappedComponent)})`;

  return hoistStatics(ExNavigatorComponent, createFocusableComponent(WrappedComponent));
}

import { NavigationPropType, StackNavigatorContextType } from './ExNavigationPropTypes';

const NavigatorPropType = PropTypes.oneOfType([
  StackNavigatorContextType,
]);

export function withNavigation<T>(WrappedComponent: ReactClass<T>) {
  class WithNavigation extends PureComponent {
    _wrappedInstance: ReactElement<T>;

    static contextTypes = {
      navigation: NavigationPropType,
      navigator: NavigatorPropType,
    };

    static childContextTypes = {
      navigation: NavigationPropType,
      navigator: NavigatorPropType,
    };

    render() {
      return (
        <WrappedComponent
          ref={(c) => { this._wrappedInstance = c; }}
          navigation={this.getNavigationContext()}
          navigator={this.getCurrentNavigator()}
          {...this.props}
        />
      );
    }

    getChildContext() {
      return {
        navigation: this.getNavigationContext(),
        navigator: this.getCurrentNavigator(),
      };
    }

    getWrappedInstance() {
      return this._wrappedInstance;
    }

    getNavigationContext() {
      return this.props.navigation || this.context.navigation;
    }

    getCurrentNavigator() {
      return this.props.navigator || this.context.navigator;
    }
  }

  WithNavigation.displayName = `WithNavigation(${getDisplayName(WrappedComponent)})`;

  return hoistStatics(WithNavigation, WrappedComponent);
}

export const createFocusableComponent = (WrappedComponent: ReactClass<any>) => {
  class FocusableComponent extends PureComponent {
    _unsubcribeFromStore: ?Function;

    static childContextTypes = {
      isFocused: React.PropTypes.bool,
    };

    getChildContext() {
      return {
        isFocused: this.state.isFocused,
      };
    }

    constructor(props, context) {
      super(props, context);

      let _prevNavState = null;
      this._unsubcribeFromStore = this.props.navigation.store.subscribe(() => {
        try {
          const navState = this.props.navigation.navigationState;
          if (navState === _prevNavState || !navState || !navState.currentNavigatorUID) {
            return;
          }

          const focusedRoute = this.props.navigation.getFocusedRoute();
          const focusedNavigatorUID = this.props.navigation.getCurrentNavigatorUID();

          let isFocused = false;

          const componentIsNavigator = WrappedComponent.navigation && WrappedComponent.navigation.__isNavigator;
          if (componentIsNavigator) {
            isFocused = focusedNavigatorUID === this.props.navigatorUID;
            if (isFocused && isFocused !== this.state.isFocused) {
              // console.log('focused navigator: ', this.props.id, this.props.navigatorUID);
            } else if (!isFocused && isFocused !== this.state.isFocused) {
              // console.log('unfocused navigator: ', this.props.id, this.props.navigatorUID);
            }
          } else if (this.props.route) {
            isFocused = this.props.route === focusedRoute;
            if (isFocused && isFocused !== this.state.isFocused) {
              // console.log('focused screen: ', this.props.route);
            } else if (!isFocused && isFocused !== this.state.isFocused) {
              // console.log('unfocused screen: ', this.props.route);
            }
          }

          if (isFocused !== this.state.isFocused) {
            this.setState({
              isFocused,
            });
          }

          _prevNavState = navState;
        } catch (e) {
          throw e;
        }
      });

      this.state = {
        isFocused: false,
      };
    }

    componentWillUnmount() {
      this._unsubcribeFromStore && this._unsubcribeFromStore();
    }

    render() {
      return (
        <WrappedComponent {...this.props} isFocused={this.state.isFocused} />
      );
    }
  }

  return hoistStatics(withNavigation(FocusableComponent), WrappedComponent);
};

export const createFocusAwareComponent = (WrappedComponent: ReactClass<any>) => {
  class FocusAwareComponent extends React.Component {
    static contextTypes = {
      isFocused: React.PropTypes.bool,
    };

    static childContextTypes = {
      isFocused: React.PropTypes.bool,
    };

    getChildContext() {
      return {
        isFocused: this._getIsFocused(),
      };
    }

    render() {
      return (
        <WrappedComponent {...this.props} isFocused={this._getIsFocused()} />
      );
    }

    _getIsFocused = () => {
      return this.props.isFocused || this.context.isFocused;
    };
  }

  return hoistStatics(FocusAwareComponent, WrappedComponent);
};
