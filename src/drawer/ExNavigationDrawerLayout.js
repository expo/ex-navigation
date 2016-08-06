/**
 * @flow
 */

import React from 'react';
import {
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DrawerLayout from 'react-native-drawer-layout';
import TouchableNativeFeedbackSafe from '@exponent/react-native-touchable-native-feedback-safe';

type Props = {
  renderHeader: () => React.Element,
};

type State = {
  isOpen: bool,
};

export default class ExNavigationDrawerLayout extends React.Component {
  props: Props;
  state: State = { isOpen: false };

  render() {
    return (
      <DrawerLayout
        ref={component => { this._component = component; }}
        onDrawerClose={() => { this.setState({isOpen: false}) }}
        onDrawerOpen={() => { this.setState({isOpen: true}) }}
        drawerWidth={this.props.width}
        renderNavigationView={this._renderNavigationView}>
        {this.props.children}
      </DrawerLayout>
    );
  }

  toggle() {
    if (this.state.isOpen) {
      this._component.closeDrawer();
    } else {
      this._component.openDrawer();
    }
  }

  _renderNavigationView = () => {
    return (
      <View style={styles.navigationViewContainer}>
        <View style={styles.navigationViewHeader}>
          {this.props.renderHeader()}
        </View>

        <ScrollView style={styles.navigationViewScrollable} contentContainerStyle={styles.navigationViewScrollableContentContainer}>
          {this._renderDrawerItems()}
        </ScrollView>
      </View>
    );
  }

  _renderDrawerItems = () => {
    if (!this.props.items) {
      return null;
    }

    return this.props.items.map((item, index) => {
      let { renderIcon, renderTitle } = item;
      let isSelected = this.props.selectedItem === item.id;
      const icon = renderIcon && renderIcon(isSelected);
      const title = renderTitle && renderTitle(isSelected);

      if (item.showsTouches !== false) {
        return (
          <TouchableNativeFeedbackSafe
            key={index}
            onPress={() => { this._handlePress(item); }}
            onLongPress={() => { this._handleLongPress(item); }}
            delayPressIn={0}
            style={[isSelected ? item.selectedStyle : item.style]}
            background={item.nativeFeedbackBackground}>
            <View style={styles.buttonContainer}>
              {icon}
              {title}
            </View>
          </TouchableNativeFeedbackSafe>
        );
      } else {
        return (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => { this._handlePress(item); }}
            onLongPress={() => { this._handleLongPress(item); }}>
            <View style={[styles.buttonContainer, isSelected ? item.selectedStyle : item.style]}>
              {icon}
              {title}
            </View>
          </TouchableWithoutFeedback>
        );
      }
    });
  }

  // TODO(brentvatne):
  // onPress and onLongPress should fire after close drawer!
  //
  _handlePress = (item) => {
    item.onPress();
    this._component.closeDrawer();
  }

  _handleLongPress = (item) => {
    if (!item.onLongPress) {
      return;
    }

    item.onLongPress();
    this._component.closeDrawer();
  }
}

const styles = StyleSheet.create({
  navigationViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigationViewScrollableContentContainer: {
    paddingTop: 8,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});
