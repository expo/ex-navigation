import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Router } from '../App';
import ListItem from './ListItem';

const window = Dimensions.get('window');

export default class CustomNavigationBarExample extends Component {
  /**
    * This is where we can define any route configuration for this
    * screen. For example, in addition to the navigationBar title we
    * could add backgroundColor.
    */
  static route = {
    navigationBar: {
      title: 'Custom NavigationBar',
      tintColor: '#FFF',
      renderBackground: props => (
        <Image
          style={styles.bgImage}
          source={{
            uri: 'http://il9.picdn.net/shutterstock/videos/3951179/thumb/1.jpg',
          }}
          resizeMode={'cover'}
        />
      ),
    },
  };

  _goToScreen = name => () => {
    this.props.navigator.push(Router.getRoute(name));
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Examples</Text>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    margin: 8,
  },
  version: {
    fontSize: 18,
  },
  bgImage: {
    flex: 1,
  },
});
