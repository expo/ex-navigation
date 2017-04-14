/**
 * @flow
 */

import React from 'react';

import {
  withNavigation,
  createFocusAwareComponent,
} from './ExNavigationComponents';
import { getBackButtonManager } from './ExNavigationBackButtonManager';

type Props = {
  isFocused: boolean,
  onBackButtonPress: () => void,
  children: Array<React.Element<any>>,
};

type State = {
  enabled: boolean,
};

@createFocusAwareComponent
@withNavigation
export default class ExNavigationAndroidBackButtonBehavior
  extends React.Component {
  state: State = {
    enabled: false,
  };

  componentDidMount() {
    if (this.props.isFocused) {
      this.enable();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isFocused && !this.props.isFocused) {
      //becomes focused
      this.enable();
    } else if (!nextProps.isFocused && this.props.isFocused) {
      //becomes unfocused
      this.disable();
    }
  }

  componentWillUnmount() {
    this.disable();
  }

  render() {
    return this.props.children;
  }

  enable() {
    if (this.state.enabled) {
      return;
    }

    const buttonManager = getBackButtonManager();
    buttonManager.pushListener(() => {
      return this.props.onBackButtonPress();
    });

    this.setState({
      enabled: true,
    });
  }

  disable() {
    if (!this.state.enabled) {
      return;
    }

    const buttonManager = getBackButtonManager();
    buttonManager.ensureGlobalListener();

    this.setState({
      enabled: false,
    });
  }
}
