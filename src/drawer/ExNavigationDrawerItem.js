import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from 'react-native';
import TouchableNativeFeedbackSafe from '@exponent/react-native-touchable-native-feedback-safe';
import ExNavigationDrawerChild from './ExNavigationDrawerChild';
import type { Props } from './ExNavigationDrawerChild';

function _set(self, name, fn) {
  // Stop use of `get` from interfering with `renderTitle => ...` in subclasses
  Object.defineProperty(self, name, {
    value: fn,
  });
}

export default class ExNavigationDrawerItem extends ExNavigationDrawerChild {
  props: Props;

  get showsTouches() { return this.props.showsTouches; }
  get renderIcon() { return this.props.renderIcon; }
  get renderTitle() { return this.props.renderTitle; }
  get renderRight() { return this.props.renderRight; }
  get onPress() { return this.props.onPress; }
  get onLongPress() { return this.props.onLongPress; }
  get children() { return this.props.children; }
  set showsTouches(fn) { _set(this, 'showsTouches', fn); }
  set renderIcon(fn) { _set(this, 'renderIcon', fn); }
  set renderTitle(fn) { _set(this, 'renderTitle', fn); }
  set renderRight(fn) { _set(this, 'renderRight', fn); }
  set onPress(fn) { _set(this, 'onPress', fn); }
  set onLongPress(fn) { _set(this, 'onLongPress', fn); }
  set children(fn) { _set(this, 'children', fn); }

  renderDrawerItem() {
    let { isSelected } = this.props;
    let { showsTouches, renderIcon, renderTitle, renderRight, onPress, onLongPress } = this;
    const icon = renderIcon && renderIcon(isSelected);
    const title = renderTitle && renderTitle(isSelected);
    const rightElement = renderRight && renderRight(isSelected);

    if (showsTouches !== false) {
      return (
        <TouchableNativeFeedbackSafe
          onPress={onPress}
          onLongPress={onLongPress}
          delayPressIn={0}
          style={[isSelected ? this.props.selectedStyle : this.props.style]}
          background={this.props.nativeFeedbackBackground}>
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
          onPress={onPress}
          onLongPress={onLongPress}>
          <View style={[styles.buttonContainer, isSelected ? this.props.selectedStyle : this.props.style]}>
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
  }

  renderContent() {
    const children = this.children;
    if (React.Children.count(children) > 0) {
      return React.Children.only(children);
    }

    return null;
  }
}

const styles = StyleSheet.create({
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
    justifyContent: 'flex-end',
  },
});
