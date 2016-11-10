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
  renderHeader: () => React.Element<any>,
  width: number,
  children: React.Element<any>,
  drawerBackgroundColor: string,
  drawerPosition: 'left' | 'right',
  selectedItem: any,
};

type State = {
  isOpen: bool,
};

export default class ExNavigationDrawerLayout extends React.Component {
  props: Props;
  state: State = { isOpen: false };
  _component: DrawerLayout;

  render() {
    let { drawerPosition } = this.props;
    let position = drawerPosition[0].toUpperCase() + drawerPosition.substr(1);

    return (
      <DrawerLayout
        ref={component => { this._component = component; }}
        onDrawerClose={() => { this.setState({isOpen: false}) }}
        onDrawerOpen={() => { this.setState({isOpen: true}) }}
        drawerBackgroundColor={this.props.drawerBackgroundColor}
        drawerWidth={this.props.width}
        drawerPosition={DrawerLayout.positions[position]}
        renderNavigationView={this.props.renderNavigationView || this._renderNavigationView}>
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
      <View style={[styles.navigationViewContainer, this.props.style]}>
        <View>
          {this.props.renderHeader()}
        </View>

        <ScrollView contentContainerStyle={styles.navigationViewScrollableContentContainer}>
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
      let { drawerChildren, renderIcon, renderTitle, renderRight } = item;
      let isSelected = this.props.selectedItem === item.id;
      const icon = renderIcon && renderIcon(isSelected);
      const title = renderTitle && renderTitle(isSelected);
      const rightElement = renderRight && renderRight(isSelected);

      if (drawerChildren) {
        return React.createElement(View, {key: index}, drawerChildren);
      }

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
              {
                icon && <View style={[styles.elementContainer]}>{icon}</View>
              }
              {
                title && <View style={[styles.elementContainer]}>{title}</View>
              }
              {
                rightElement && <View style={[styles.elementContainer, styles.rightElementContainer]}>{rightElement}</View>
              }
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
              {
                icon && <View style={[styles.elementContainer]}>{icon}</View>
              }
              {
                title && <View style={[styles.elementContainer]}>{title}</View>
              }
              {
                rightElement && <View style={[styles.elementContainer, styles.rightElementContainer]}>{rightElement}</View>
              }
            </View>
          </TouchableWithoutFeedback>
        );
      }
    });
  }

  // TODO(brentvatne):
  // onPress and onLongPress should fire after close drawer!
  //
  _handlePress = (item: any) => {
    item.onPress();
    this._component.closeDrawer();
  }

  _handleLongPress = (item: any) => {
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  elementContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightElementContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  }
});
