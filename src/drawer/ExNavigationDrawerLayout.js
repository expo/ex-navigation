/**
 * @flow
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DrawerLayout from 'react-native-drawer-layout';

type NavigationViewOptions = {
  renderHeader: () => React.Element<any>,
  renderDrawerItems: (items: Array<React.Element<any>>) => Array<React.Element<any>>,
  items: Array<React.Element<any>>,
  containerStyle: Array<any>,
  scrollableContentContainerStyle: Array<any>,
};

type Props = {
  renderHeader: () => React.Element<any>,
  renderNavigationView: (options:NavigationViewOptions) => React.Element<any>,
  width: number,
  items: Array<React.Element<any>>,
  children: React.Element<any>,
  drawerBackgroundColor: string,
  drawerPosition: 'left' | 'right',
  selectedItem: any,
  setActiveItem: (id: string) => void,
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
    const renderNavigationView = this.props.renderNavigationView || this.renderNavigationView;
    return renderNavigationView({
      renderHeader: this.props.renderHeader,
      renderDrawerItems: this.renderDrawerItems,
      items: this.props.items,
      containerStyle: [styles.navigationViewContainer, this.props.style],
      scrollableContentContainerStyle: [styles.navigationViewScrollableContentContainer],
    });
  }

  renderNavigationView = ({renderHeader, renderDrawerItems, items, containerStyle, scrollableContentContainerStyle}:NavigationViewOptions) => {
    return (
      <View style={containerStyle}>
        <View>
          {renderHeader()}
        </View>

        <ScrollView contentContainerStyle={scrollableContentContainerStyle}>
          {renderDrawerItems(items)}
        </ScrollView>
      </View>
    );
  }

  renderDrawerItems = (items: Array<React.Element<any>>) => {
    if (!items) {
      return [];
    }

    return items.map((item, index) => {
      let isSelected = this.props.selectedItem === item.props.id;

      return React.cloneElement(item, {
        key: index,
        isSelected,
        onPress: () => { this._handlePress(item.props); },
        onLongPress: () => { this._handleLongPress(item.props); },
        renderTo: 'drawer',
      });
    });
  }

  // TODO(brentvatne):
  // onPress and onLongPress should fire after close drawer!
  //
  _handlePress = (item: any) => {
    if (item.onPress) {
      item.onPress();
    } else {
      this.props.setActiveItem(item.id);
    }
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
});
