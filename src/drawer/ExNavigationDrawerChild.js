import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import StaticContainer from 'react-static-container';

export type Props = {
  children: React.Element<any>,
  renderTo: 'drawer' | 'content',
  showsTouches: ?boolean,
  isSelected: boolean,
  selectedStyle: any,
};

export default class ExNavigationDrawerChild extends React.Component {
  props: Props;
  hasContent: boolean = false;

  renderDrawerItem() {
    let { children } = this.props;
    return React.createElement(View, null, children);
  }

  renderContent() {
    return null;
  }

  _renderContent() {
    const { isSelected } = this.props;
    let content = this.renderContent();

    if (content === null) {
      return null;
    }

    return (
      <View
        removeClippedSubviews={!isSelected}
        style={[styles.itemContentInner, {opacity: isSelected ? 1 : 0}]}
        pointerEvents={isSelected ? 'auto' : 'none'}>
        <StaticContainer shouldUpdate={isSelected}>
          {content}
        </StaticContainer>
      </View>
    );
  }

  render() {
    let { renderTo } = this.props;

    if (renderTo === 'drawer') {
      return this.renderDrawerItem();
    } else if (renderTo === 'content') {
      return this._renderContent();
    } else {
      console.warn('renderTo must be "drawer" or "content"');
      return null;
    }
  }
}

const styles = StyleSheet.create({
  itemContentOuter: {
    flex: 1,
  },
  itemContentInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
