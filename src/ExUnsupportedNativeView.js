import React from 'react';
import { View } from 'react-native';

export function unsupportedNativeView(name) {
  return class ExUnsupportedNativeView extends React.Component {
    componentWillMount() {
      if (__DEV__) {
        console.log(
          `Attempted to use native ${name}, this isn't supported outside of Exponent`
        );
        console.log(
          `If you would like to make it work, submit a PR to: https://github.com/exponent/ex-navigation`
        );
        console.log(
          `If you are using Exponent, make sure that you have imported the \`exponent\` module in your app`
        );
      }
    }

    render() {
      return null;
    }
  };
}
