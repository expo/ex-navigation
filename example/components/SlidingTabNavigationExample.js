import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  SlidingTabNavigation,
  SlidingTabNavigationItem,
} from '@expo/ex-navigation';
import { Ionicons } from '@expo/vector-icons';

export default class SlidingTabNavigationExample extends Component {
  static route = {
    navigationBar: {
      title: 'Sliding Tab Navigation',
      ...SlidingTabNavigation.navigationBarStyles,
    },
  };

  _goToFirstTab = () => {
    this.props.navigation.performAction(({ tabs, stacks }) => {
      tabs('sliding-tab-navigation').jumpToTab('first');
    });
  };

  _goToSecondTab = () => {
    this.props.navigation.performAction(({ tabs, stacks }) => {
      tabs('sliding-tab-navigation').jumpToTab('second');
    });
  };

  _renderLabel = ({ route }) => {
    let title;
    if (route.key === 'first') {
      title = 'First';
    } else if (route.key === 'second') {
      title = 'Second';
    }

    return <Text style={styles.tabLabel}>{title.toUpperCase()}</Text>;
  };

  render() {
    return (
      <View style={styles.container}>
        <SlidingTabNavigation
          id="sliding-tab-navigation"
          navigatorUID="sliding-tab-navigation"
          initialTab="first"
          renderLabel={this._renderLabel}
          barBackgroundColor="#0084FF"
          indicatorStyle={styles.tabIndicator}>
          <SlidingTabNavigationItem id="first">
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarks}>“</Text>
              <Text style={styles.quoteText}>
                R2D2, you know better than to trust a strange computer!
              </Text>
              <Text style={styles.quoteAuthor}>C3PO</Text>
              <TouchableOpacity onPress={this._goToSecondTab}>
                <Ionicons
                  name="md-arrow-forward"
                  size={16}
                  style={styles.button}
                />
              </TouchableOpacity>
            </View>
          </SlidingTabNavigationItem>
          <SlidingTabNavigationItem id="second">
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarks}>“</Text>
              <Text style={styles.quoteText}>
                The best thing about a boolean is even if you are wrong, you are only off by a bit.
              </Text>
              <Text style={styles.quoteAuthor}>Bryan</Text>
              <TouchableOpacity onPress={this._goToFirstTab}>
                <Ionicons
                  name="md-arrow-back"
                  size={16}
                  style={styles.button}
                />
              </TouchableOpacity>
            </View>
          </SlidingTabNavigationItem>
        </SlidingTabNavigation>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  tabLabel: {
    margin: 8,
    fontSize: 13,
    color: '#fff',
  },

  tabIndicator: {
    backgroundColor: '#FFEB3B',
  },

  quoteContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  quoteMarks: {
    alignSelf: 'flex-start',
    color: '#E91E63',
    fontSize: 36,
    left: -8,
    bottom: -42,
    marginTop: -64,
  },

  quoteText: {
    color: '#222',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    margin: 8,
  },

  quoteAuthor: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },

  button: {
    margin: 16,
    color: '#0084FF',
  },

  selectedTab: {
    backgroundColor: '#0084FF',
  },
});
