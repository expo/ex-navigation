import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';
import { Ionicons } from '@exponent/vector-icons';

export default class TabNavigationExample extends Component {
  static route = {
    navigationBar: {
      title: 'Tab Navigation',
    },
  }

  render() {
    return (
      <View style={styles.container}>
        <TabNavigation
          id="tab-navigation"
          navigatorUID="tab-navigation"
          initialTab="first">
          <TabNavigationItem
            id="first"
            title="First"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-boat-outline" size={24} />}>
            <View style={styles.images}>
              <Image style={styles.image} source={require('../assets/beetle.jpg')} />
              <Image style={styles.image} source={require('../assets/colorful-windows.jpg')} />
              <Image style={styles.image} source={require('../assets/paintbrush.jpg')} />
              <Image style={styles.image} source={require('../assets/sparkles.jpg')} />
            </View>
          </TabNavigationItem>
          <TabNavigationItem
            id="second"
            title="Second"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-bulb-outline" size={24} />}>
            <Image style={styles.gif} source={require('../assets/cat.gif')} />
          </TabNavigationItem>
          <TabNavigationItem
            id="third"
            title="Third"
            selectedStyle={styles.selectedTab}
            renderIcon={(isSelected) => <Ionicons name="ios-bowtie-outline" size={24} />}>
            <ScrollView>
              <Image style={styles.cover} source={require('../assets/space.jpg')} />
              <View style={styles.article}>
                <Text style={styles.heading}>The Hitchhiker's Guide to the Galaxy</Text>
                <Text style={styles.body}>For instance, on the planet Earth, man had always assumed that he was more intelligent than dolphins because he had achieved so much—the wheel, New York, wars and so on—whilst all the dolphins had ever done was muck about in the water having a good time. But conversely, the dolphins had always believed that they were far more intelligent than man—for precisely the same reasons.</Text>
              </View>
            </ScrollView>
          </TabNavigationItem>
        </TabNavigation>
      </View>
    );
  }
}

const IMAGE_SIZE = Dimensions.get('window').width / 2 - 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },

  image: {
    flex: 0.5,
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    resizeMode: 'cover',
    margin: 4,
    borderRadius: 3,
  },

  cover: {
    flex: 1,
    height: 160,
    width: null,
    resizeMode: 'cover',
  },

  article: {
    padding: 20,
  },

  heading: {
    margin: 4,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 32,
  },

  body: {
    margin: 4,
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },

  gif: {
    flex: 1,
    height: null,
    width: null,
    backgroundColor: '#CCC',
  },

  selectedTab: {
    backgroundColor: '#0084FF',
  },
});
