import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from 'react-native';
import TouchableNativeFeedbackSafe from '@exponent/react-native-touchable-native-feedback-safe';
import ExNavigationDrawerChild from './ExNavigationDrawerChild';
import type { Props } from './ExNavigationDrawerChild';

export default class ExNavigationDrawerItem extends ExNavigationDrawerChild {
  props: Props;

  renderDrawerItem() {
    let { showsTouches, isSelected, renderIcon, renderTitle, renderRight, onPress, onLongPress } = this.props;
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
    if (React.Children.count(this.props.children) > 0) {
      return React.Children.only(this.props.children);
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
