/**
 * @providesModule ExNavigationBadge
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class Badge extends React.Component {
  static propTypes = Text.propTypes;

  constructor(props, context) {
    super(props, context);

    this._handleLayout = this._handleLayout.bind(this);
  }

  state = {
    computedSize: null,
  };

  render() {
    let { computedSize } = this.state;
    let style = {};
    if (!computedSize) {
      style.opacity = 0;
    } else {
      style.width = Math.max(computedSize.height, computedSize.width);
      style.borderRadius = style.width / 2.0;
    }

    return (
      <View
        {...this.props}
        onLayout={this._handleLayout}
        style={[styles.container, this.props.style, style]}>
        <Text
          numberOfLines={1}
          style={[styles.textStyle, this.props.textStyle]}>
          {this.props.children}
        </Text>
      </View>
    );
  }

  _handleLayout(event) {
    let { width, height } = event.nativeEvent.layout;
    let { computedSize } = this.state;
    if (computedSize && computedSize.height === height &&
      computedSize.width === width) {
      return;
    }

    this.setState({
      computedSize: { width, height },
    });

    if (this.props.onLayout) {
      this.props.onLayout(event);
    }
  }
}

let styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(0, 122, 255)',
    borderWidth: 1 + StyleSheet.hairlineWidth,
    borderColor: '#fefefe',
    borderRadius: 17 / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  textStyle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 2,
  },
});
