/**
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';

import UUID from 'uuid-js';

import invariant from 'invariant';
import { createSelector } from 'reselect';
import hoistStatics from 'hoist-non-react-statics';
import PureComponent from './utils/PureComponent';
import shallowEqual from 'fbjs/lib/shallowEqual';

import ExNavigationContext from './ExNavigationContext';
import connect from './ExNavigationConnect';

import type { ExNavigatorState } from './ExNavigationStore';

function getDisplayName(WrappedComponent: ReactClass<any>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type WrappedComponentProps = {
  navigatorUID: string,
  navigation: ExNavigationContext,
};

const getStateForNavigatorId = (state, props: WrappedComponentProps) => {
  const navigationState = state[props.navigation.navigationStateKey];
  return (
    navigationState.navigators &&
    props.navigatorUID &&
    navigationState.navigators[props.navigatorUID]
  );
};

const makeNavigatorStateSelector = () => {
  return createSelector(
    [getStateForNavigatorId],
    navigationState => navigationState
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
  const ConnectedWrappedComponent = connect(makeMapStateToProps, null, null, {
    withRef: true,
  })(createFocusableComponent(WrappedComponent));

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

    shouldComponentUpdate(
      nextProps: Props,
      nextState: State,
      nextContext: Context
    ) {
      return (
        !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState) ||
        !shallowEqual(this.context, nextContext)
      );
    }

    render(): ?ReactElement<any> {
      const navigation = this.getNavigationContext();

      return (
        <ConnectedWrappedComponent
          ref={this._wrappedInstanceRef}
          navigatorUID={this.state.navigatorUID}
          navigation={navigation}
          onRegisterNavigatorContext={navigation.registerNavigatorContext}
          onUnregisterNavigatorContext={navigation.unregisterNavigatorContext}
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
      return this.props.navigation || this.context.navigation;
    }

    _wrappedInstanceRef = (c: ReactElement<{}>) => {
      if (c == null) {
        this._wrappedInstance = null;
      } else {
        /* $FlowFixMe */
        this._wrappedInstance = c.refs.wrappedInstance;
      }
    };
  }

  const C = hoistStatics(ExNavigatorComponent, ConnectedWrappedComponent);
  C.displayName = `ExNavigatorComponent(${getDisplayName(C)})`;
  return C;
}

import {
  NavigationPropType,
  StackNavigatorContextType,
} from './ExNavigationPropTypes';

const NavigatorPropType = PropTypes.object;

export function withNavigation<T>(
  WrappedComponent: ReactClass<T>,
  { withRef } = {}
) {
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
          ref={withRef ? this.setWrappedInstance : undefined}
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
      if (__DEV__) {
        invariant(
          withRef,
          'To access the wrapped instance, you need to specify ' +
            '{ withRef: true } in the options argument of withNavigation call.'
        );
      }
      return this._wrappedInstance;
    }

    setWrappedInstance = (ref) => {
      this._wrappedInstance = ref;
    }

    getNavigationContext() {
      return this.props.navigation || this.context.navigation;
    }

    getCurrentNavigator() {
      return this.props.navigator || this.context.navigator;
    }
  }

  const C = hoistStatics(WithNavigation, WrappedComponent);
  C.displayName = `WithNavigation(${getDisplayName(WrappedComponent)})`;
  return C;
}

export const createFocusableComponent = (WrappedComponent: ReactClass<any>) => {
  const _componentIsNavigator =
    WrappedComponent.route && WrappedComponent.route.__isNavigator;

  class FocusableComponent extends PureComponent {
    _unsubcribeFromStore: ?Function;
    _prevNavState: ?Object;
    _wrappedInstance: ReactElement<T>;

    static childContextTypes = {
      isFocused: PropTypes.bool,
    };

    getChildContext() {
      return {
        isFocused: this.state.isFocused,
      };
    }

    constructor(props, context) {
      super(props, context);

      this._prevNavState = null;
      this.state = {
        isFocused: false,
      };
    }

    componentWillMount() {
      this._handleStateUpdate();
    }

    componentDidMount() {
      this.subscribeToStore();
    }

    componentWillUnmount() {
      this._unsubcribeFromStore && this._unsubcribeFromStore();
    }

    subscribeToStore() {
      this._unsubcribeFromStore = this.props.navigation.store.subscribe(() => {
        this._handleStateUpdate();
      });
    }

    render() {
      return (
        <WrappedComponent
          ref={c => {
            this._wrappedInstance = c;
          }}
          {...this.props}
          isFocused={this.state.isFocused}
        />
      );
    }

    getWrappedInstance() {
      return this._wrappedInstance;
    }

    _handleStateUpdate = () => {
      try {
        const state = this.props.navigation.store.getState();
        const navState = { ...state.navigation };
        if (
          navState === this._prevNavState ||
          !navState ||
          !navState.currentNavigatorUID
        ) {
          return;
        }

        const focusedRoute = this.props.navigation.getFocusedRoute();
        const focusedNavigatorUID = this.props.navigation.getCurrentNavigatorUID();

        let isFocused = false;

        if (_componentIsNavigator) {
          isFocused = focusedNavigatorUID === this.props.navigatorUID;
        } else if (this.props.route) {
          isFocused = this.props.route === focusedRoute;
        }

        if (isFocused !== this.state.isFocused) {
          this.setState({
            isFocused,
          });
        }

        this._prevNavState = navState;
      } catch (e) {
        throw e;
      }
    };
  }

  const C = hoistStatics(withNavigation(FocusableComponent), WrappedComponent);
  C.displayName = `FocusableComponent(${getDisplayName(WrappedComponent)})`;
  return C;
};

export const createFocusAwareComponent = <T>(
  WrappedComponent: ReactClass<T>
) => {
  class FocusAwareComponent extends React.Component {
    static contextTypes = {
      isFocused: PropTypes.bool,
    };

    static childContextTypes = {
      isFocused: PropTypes.bool,
    };

    _wrappedInstance: ReactElement<T>;

    getChildContext() {
      return {
        isFocused: this._getIsFocused(),
      };
    }

    render() {
      return (
        <WrappedComponent
          ref={c => {
            this._wrappedInstance = c;
          }}
          {...this.props}
          isFocused={this._getIsFocused()}
        />
      );
    }

    _getIsFocused = () => {
      return this.props.isFocused || this.context.isFocused;
    };

    getWrappedInstance() {
      return this._wrappedInstance;
    }
  }

  const C = hoistStatics(FocusAwareComponent, WrappedComponent);
  C.displayName = `FocusAwareComponent(${getDisplayName(C)})`;
  return C;
};
