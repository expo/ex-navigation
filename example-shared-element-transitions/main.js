import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import 'exponent';

import {
  NavigationProvider,
  StackNavigation,
  SharedElementOverlay,
} from '@exponent/ex-navigation';

import AppRouter from 'AppRouter';

class AppContainer extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor="#cccccc"
          barStyle="default"
          translucent={false}
        />
        <NavigationProvider router={AppRouter}>
          <SharedElementOverlay>
            <StackNavigation
              id="root"
              initialRoute={AppRouter.getRoute('placesList')}
            />
          </SharedElementOverlay>
        </NavigationProvider>
      </View>
    );
  }
}

AppRegistry.registerComponent('main', () => AppContainer);
