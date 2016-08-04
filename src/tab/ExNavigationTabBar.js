import React from 'react';

import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Text,
  View,
} from 'react-native';

import { Components } from 'exponent';

import TabBadge from '../ExNavigationBadge';

const DEFAULT_TAB_BAR_HEIGHT = 56;

export default class ExNavigationTabBar extends React.Component {
  static defaultHeight = DEFAULT_TAB_BAR_HEIGHT;

  render() {
    const height = this.props.height || DEFAULT_TAB_BAR_HEIGHT;
    let isTranslucent = this.props.translucent;
    let backgroundColor = isTranslucent ? 'rgba(255,255,255,0.5)' : '#fefefe';

    return (
      <View style={[styles.container, {height}]}>
        {isTranslucent &&
          <Components.BlurView style={[styles.translucentUnderlay, {height}]} />}

        <View style={[styles.innerContainer, {backgroundColor}, this.props.style]}>
          <View style={styles.itemContainer}>
            {this.renderTabItems()}
          </View>
        </View>
      </View>
    );
  }

  renderTabItems() {
    if (!this.props.items) {
      return null;
    }

    return this.props.items.map((item, index) => {
      let title = null;
      if (item.title) {
        title = <Text>{item.title}</Text>;
      }

      let { renderIcon } = item;
      let isSelected = this.props.selectedTab === item.id;

      const icon = renderIcon && renderIcon(isSelected);

      let badge = null;
      if (item.badgeText) {
        badge = (
          <TabBadge style={styles.badge}>{item.badgeText}</TabBadge>
        );
      }

      if (item.showsTouches) {
        return (
          <TouchableNativeFeedback
            key={index}
            onPress={item.onPress}
            onLongPress={item.onPress}
            delayPressIn={0}
            style={[styles.tabItem, isSelected ? item.selectedStyle : item.style]}
            background={item.nativeFeedbackBackground}>
            {title}
            {icon}
            {badge}
          </TouchableNativeFeedback>
        );
      } else {
        return (
          <TouchableWithoutFeedback key={index} onPress={item.onPress}>
            <View style={[styles.tabItem, isSelected ? item.selectedStyle : item.style]}>
              {title}
              {icon}
              {badge}
            </View>
          </TouchableWithoutFeedback>
        );
      }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  translucentUnderlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopColor: '#b2b2b2',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 18,
    backgroundColor: 'black',
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
