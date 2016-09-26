import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
  View,
  StatusBar,
} from 'react-native';
import {
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';
import { Ionicons } from '@exponent/vector-icons';

export default class TranslucentBarExample extends Component {
  static route = {
    navigationBar: {
      title: 'Translucent Bars',
      backgroundColor: 'rgba(255,255,255,0.5)',
      tintColor: '#222',
      translucent: true,
    },
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />
        <TabNavigation
          translucent
          id="translucent-tabs"
          navigatorUID="translucent-tabs"
          initialTab="first">
          <TabNavigationItem
            id="first"
            title="First"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-boat-outline" size={24} />}>
            <Image source={require('../assets/colorful-windows.jpg')} style={styles.image} />
          </TabNavigationItem>
          <TabNavigationItem
            id="second"
            title="Second"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-bulb-outline" size={24} />}>
            <Image source={require('../assets/beetle.jpg')} style={styles.image} />
          </TabNavigationItem>
          <TabNavigationItem
            id="third"
            title="Third"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-bowtie-outline" size={24} />}>
            <Image source={require('../assets/paintbrush.jpg')} style={styles.image} />
          </TabNavigationItem>
        </TabNavigation>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  image: {
    flex: 1,
    height: null,
    width: null,
    resizeMode: 'cover',
  },

  selectedTab: {
    backgroundColor: '#0084FF',
  },
});
