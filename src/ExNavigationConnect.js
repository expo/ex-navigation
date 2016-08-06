/**
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';

function getDisplayName(WrappedComponent: ReactClass<*>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function exNavConnect(...args: any) {
  return function wrap(WrappedComponent: ReactClass<*>) {
    const ConnectedComponent = connect(...args)(WrappedComponent);
    const connectDisplayName = `ExNavConnect(${getDisplayName(WrappedComponent)})`;

    class ExNavConnect extends React.Component {
      navigationStore: Object;

      constructor(props, context) {
        super(props, context);
        this.navigationStore = props.navigationStore || context.navigationStore;

        invariant(this.navigationStore,
          `Could not find "navigationStore" in either the context or ` +
          `props of "${connectDisplayName}". ` +
          `Either wrap the root component in a <Provider>, ` +
          `or explicitly pass "store" as a prop to "${connectDisplayName}".`
        );
      }

      static contextTypes = {
        navigationStore: storeShape,
      };

      render() {
        return (
          <ConnectedComponent store={this.navigationStore} {...this.props} />
        );
      }
    }

    return hoistStatics(ExNavConnect, ConnectedComponent);
  };
}
