import React, { Component } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { TabNavigation, TabNavigationItem } from '@expo/ex-navigation';
import { Ionicons } from '@expo/vector-icons';

function getColor(isSelected) {
  return isSelected ? '#fff' : '#000';
}

export default class TranslucentBarExample extends Component {
  static route = {
    navigationBar: {
      title: 'Translucent Bars',
      backgroundColor: 'rgba(255,255,255,0.5)',
      tintColor: '#222',
      translucent: true,
    },
  };

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
            renderTitle={this._renderTitle}
            renderIcon={isSelected => (
              <Ionicons
                name="ios-boat-outline"
                size={24}
                color={getColor(isSelected)}
              />
            )}>
            <Image
              source={require('../assets/colorful-windows.jpg')}
              style={styles.image}
            />
          </TabNavigationItem>
          <TabNavigationItem
            id="second"
            title="Second"
            selectedStyle={styles.selectedTab}
            renderTitle={this._renderTitle}
            renderIcon={isSelected => (
              <Ionicons
                name="ios-bulb-outline"
                size={24}
                color={getColor(isSelected)}
              />
            )}>
            <Image
              source={require('../assets/beetle.jpg')}
              style={styles.image}
            />
          </TabNavigationItem>
          <TabNavigationItem
            id="third"
            title="Third"
            selectedStyle={styles.selectedTab}
            renderTitle={this._renderTitle}
            renderIcon={isSelected => (
              <Ionicons
                name="ios-bowtie-outline"
                size={24}
                color={getColor(isSelected)}
              />
            )}>
            <Image
              source={require('../assets/paintbrush.jpg')}
              style={styles.image}
            />
          </TabNavigationItem>
        </TabNavigation>
      </View>
    );
  }

  _renderTitle = (isSelected, title) => {
    return (
      <Text style={{ color: getColor(isSelected) }}>
        {title}
      </Text>
    );
  };
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
    backgroundColor: 'rgba(0,0,255, 0.4)',
  },
});
