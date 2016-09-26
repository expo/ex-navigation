import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {
  SlidingTabNavigation,
  SlidingTabNavigationItem,
} from '@exponent/ex-navigation';

export default class SlidingTabNavigationExample extends Component {
  static route = {
    navigationBar: {
      title: 'Sliding Tab Navigation',
      ...SlidingTabNavigation.navigationBarStyles,
    },
  }

  _renderLabel = (title: string) => {
    return <Text style={styles.tabLabel}>{title.toUpperCase()}</Text>;
  };

  render() {
    return (
      <View style={styles.container}>
        <SlidingTabNavigation
          id="tab-navigation"
          navigatorUID="tab-navigation"
          initialTab="first"
          barBackgroundColor="#0084FF"
          indicatorStyle={styles.tabIndicator}>
          <SlidingTabNavigationItem
            id="first"
            renderLabel={() => this._renderLabel('First')}>
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarks}>“</Text>
              <Text style={styles.quoteText}>R2D2, you know better than to trust a strange computer!</Text>
              <Text style={styles.quoteAuthor}>C3PO</Text>
            </View>
          </SlidingTabNavigationItem>
          <SlidingTabNavigationItem
            id="second"
            renderLabel={() => this._renderLabel('Second')}>
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarks}>“</Text>
              <Text style={styles.quoteText}>The best thing about a boolean is even if you are wrong, you are only off by a bit.</Text>
              <Text style={styles.quoteAuthor}>Bryan</Text>
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

  selectedTab: {
    backgroundColor: '#0084FF',
  },
});
