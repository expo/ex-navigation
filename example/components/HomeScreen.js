import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import ListItem from './ListItem';
import { Router } from '../main';

export default class HomeScreen extends Component {
  /**
    * This is where we can define any route configuration for this
    * screen. For example, in addition to the navigationBar title we
    * could add backgroundColor.
    */
  static route = {
    navigationBar: {
      title: 'Examples',
    },
  };

  _goToScreen = name => () => {
    this.props.navigator.push(Router.getRoute(name));
  };

  render() {
    return (
      <View style={styles.container}>
        <ListItem
          title="Tab Navigation"
          description="iOS style tab bar based navigation"
          onPress={this._goToScreen('tabNavigationExample')}
        />
        <ListItem
          title="Sliding Tab Navigation"
          description="Material design style swipeable tab navigation"
          onPress={this._goToScreen('slidingTabNavigationExample')}
        />
        <ListItem
          title="Alert Bars"
          description="Local alert bars for showing temporary messages"
          onPress={this._goToScreen('alertBarsExample')}
        />
        <ListItem
          title="Translucent Bars"
          description="Blurred translucent navigation and tab bar on iOS"
          onPress={this._goToScreen('translucentBarExample')}
        />
        <ListItem
          title="Event Emitter"
          description="Communication with navigation bar using events"
          onPress={this._goToScreen('eventEmitterExample')}
        />
        <ListItem
          title="Custom NavigationBar"
          description="Custom Navigationbar background using renderBackground"
          onPress={this._goToScreen('customNavigationBarExample')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});
