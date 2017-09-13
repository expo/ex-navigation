/**
 * @flow
 */

import React, { Children } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import DrawerLayout from 'react-native-drawer-layout-polyfill';
import PureComponent from '../utils/PureComponent';
import StaticContainer from 'react-static-container';

import invariant from 'invariant';
import _ from 'lodash';

import Actions from '../ExNavigationActions';
import ExNavigatorContext from '../ExNavigatorContext';
import { createNavigatorComponent } from '../ExNavigationComponents';

import ExNavigationDrawerLayout from './ExNavigationDrawerLayout';
import ExNavigationDrawerItem from './ExNavigationDrawerItem';
import type ExNavigationContext from '../ExNavigationContext';

export class ExNavigationDrawerContext extends ExNavigatorContext {
  navigatorUID: string;
  navigatorId: string;
  dispatch: Function;
  _navigatorItemMap: Object = {};
  _getNavigatorState: any;
  type: string = 'drawer';

  setNavigatorUIDForCurrentItem(navigatorUID: string) {
    const navigatorState = this._getNavigatorState();
    if (!navigatorState) {
      return;
    }
    const currentItem = navigatorState.routes[navigatorState.index];
    this._navigatorItemMap[currentItem.key] = navigatorUID;
  }

  getNavigatorUIDForItemKey(itemKey: string) {
    return this._navigatorItemMap[itemKey];
  }

  jumpToItem(itemKey: string) {
    this.navigationContext.performAction(({ drawer }) => {
      drawer(this.navigatorUID).jumpToItem(itemKey);
    });
  }

  toggleDrawer() {
    this.options.toggleDrawer();
  }
}

type Props = {
  id: string,
  navigatorUID: string,
  initialItem: string,
  renderHeader: () => React.Element<any>,
  renderNavigationView: () => React.Element<any>,
  drawerBackgroundColor: string,
  drawerWidth: 300,
  drawerStyle: any,
  children: Array<React.Element<any>>,
  drawerPosition?: 'left' | 'right',
  navigation: ExNavigationContext,
  onRegisterNavigatorContext: (
    navigatorUID: string,
    navigatorContext: ExNavigationDrawerContext
  ) => void,
  onUnregisterNavigatorContext: (navigatorUID: string) => void,
  navigationState: Object,
};

type State = {
  id: string,
  navigatorUID: string,
  drawerItems: Array<ExNavigationDrawerItem>,
  parentNavigatorUID: string,
  renderedItemKeys: Array<string>,
};

class ExNavigationDrawer extends PureComponent<any, Props, State> {
  props: Props;
  state: State;
  _drawerLayout: ?ExNavigationDrawerLayout;

  static route = {
    __isNavigator: true,
  };

  static defaultProps = {
    drawerPosition: 'left',
    drawerBackgroundColor: '#fff',
    renderHeader() {
      return null;
    },
  };

  static contextTypes = {
    parentNavigatorUID: PropTypes.string,
  };

  static childContextTypes = {
    parentNavigatorUID: PropTypes.string,
    navigator: PropTypes.instanceOf(ExNavigationDrawerContext),
  };

  getChildContext() {
    return {
      // Get the navigator actions instance for this navigator
      navigator: this._getNavigatorContext(),
      parentNavigatorUID: this.state.navigatorUID,
    };
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      drawerItems: [],
      id: props.id,
      navigatorUID: props.navigatorUID,
      parentNavigatorUID: context.parentNavigatorUID,
      renderedItemKeys: [],
    };
  }

  render() {
    if (!this.props.children || !this.state.drawerItems) {
      return null;
    }

    const navigationState: ?Object = this._getNavigationState();
    if (!navigationState) {
      return null;
    }

    const drawerLayoutProps = {
      children: this.renderContent(),
      renderHeader: this.props.renderHeader,
      selectedItem: navigationState.routes[navigationState.index].key,
      items: this.state.drawerItems,
      drawerBackgroundColor: this.props.drawerBackgroundColor,
      drawerPosition: this.props.drawerPosition,
      width: this.props.drawerWidth,
      renderNavigationView: this.props.renderNavigationView,
      style: [this.props.drawerStyle],
    };

    return (
      <ExNavigationDrawerLayout
        ref={component => {
          this._drawerLayout = component;
        }}
        {...drawerLayoutProps}
      />
    );
  }

  renderContent = () => {
    const items = this.state.renderedItemKeys.map(key => {
      return this.state.drawerItems.find(i => i.id === key);
    });

    return (
      <View style={styles.itemContentOuter}>
        {items.map(item => this.renderItemContent(item))}
      </View>
    );
  };

  renderItemContent(drawerItem: Object) {
    if (!drawerItem.element) {
      return null;
    }

    const navState = this._getNavigationState();
    const selectedChild = navState.routes[navState.index];
    const isSelected = drawerItem.id === selectedChild.key;

    return (
      <View
        key={drawerItem.id}
        removeClippedSubviews={!isSelected}
        style={[styles.itemContentInner, { opacity: isSelected ? 1 : 0 }]}
        pointerEvents={isSelected ? 'auto' : 'none'}>
        <StaticContainer shouldUpdate={isSelected}>
          {drawerItem.element}
        </StaticContainer>
      </View>
    );
  }

  componentWillMount() {
    this._parseDrawerItems(this.props);

    this._registerNavigatorContext();

    this.props.navigation.dispatch(
      Actions.setCurrentNavigator(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        'drawer',
        {},
        [
          {
            key: this.props.initialItem,
          },
        ]
      )
    );
  }

  componentWillUnmount() {
    this.props.navigation.dispatch(
      Actions.removeNavigator(this.state.navigatorUID)
    );
    this.props.onUnregisterNavigatorContext(this.state.navigatorUID);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children && nextProps.children !== this.props.children) {
      this._parseDrawerItems(nextProps);
    }

    if (nextProps.navigationState !== this.props.navigationState) {
      this.setState({
        renderedItemKeys: this._updateRenderedItemKeys(
          nextProps,
          this.state.renderedItemKeys
        ),
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.navigation.dispatch !== this.props.navigation.dispatch) {
      this._registerNavigatorContext();
    }

    // When we're changing tabs, let's make sure we set the current navigator to be the controlled navigator,
    // if it exists.
    if (prevProps.navigationState !== this.props.navigationState) {
      const navigationState = this.props.navigationState;
      const currentItemKey = navigationState.routes[navigationState.index].key;
      const navigatorUIDForItemKey = this._getNavigatorContext().getNavigatorUIDForItemKey(
        currentItemKey
      );
      if (navigatorUIDForItemKey) {
        this.props.navigation.dispatch(
          Actions.setCurrentNavigator(navigatorUIDForItemKey)
        );
      }
    }
  }

  _updateRenderedItemKeys(props, currentRenderedItemKeys) {
    const navState = this._getNavigationState(props);
    const currentDrawerItems = navState.routes.map(c => c.key);
    const selectedChild = navState.routes[navState.index];

    return [
      ..._.uniq(
        _.without(
          [...currentRenderedItemKeys, ...currentDrawerItems],
          selectedChild.key
        )
      ),
      selectedChild.key,
    ];
  }

  _parseDrawerItems(props) {
    const drawerItems = Children.map(props.children, (child, index) => {
      if (!child) {
        return null;
      }

      invariant(
        child.type === ExNavigationDrawerItem,
        'All children of DrawerNavigation must be DrawerNavigationItems.'
      );

      const drawerItemProps = child.props;

      let drawerItem = {
        ..._.omit(drawerItemProps, ['children']),
      };

      if (Children.count(drawerItemProps.children) > 0) {
        drawerItem.element = Children.only(drawerItemProps.children);
      }

      const drawerItemOnPress = () => {
        this._setActiveItem(drawerItemProps.id, index);
      };

      if (typeof drawerItemProps.onPress === 'function') {
        drawerItem.onPress = drawerItem.onPress.bind(this, drawerItemOnPress);
      } else {
        drawerItem.onPress = drawerItemOnPress;
      }

      drawerItem.onLongPress = drawerItemProps.onLongPress;

      return drawerItem;
    });

    this.setState({
      drawerItems,
    });
  }

  _setActiveItem(id, index) {
    this._getNavigatorContext().jumpToItem(id);
    if (typeof this.props.onPress === 'function') {
      this.props.onPress(id);
    }
  }

  toggleDrawer = () => {
    this._drawerLayout && this._drawerLayout.toggle();
  };

  _getNavigationState(props: ?Props): Object {
    if (!props) {
      props = this.props;
    }
    const { navigationState } = props;
    return navigationState;
  }

  _registerNavigatorContext() {
    this.props.onRegisterNavigatorContext(
      this.state.navigatorUID,
      new ExNavigationDrawerContext(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        this.state.id,
        this.props.navigation,
        {
          toggleDrawer: this.toggleDrawer,
          drawerPosition: this.props.drawerPosition,
        }
      )
    );
  }

  // TODO: use a proper flow type annotation
  _getNavigatorContext(): any {
    return this.props.navigation.getNavigatorByUID(this.state.navigatorUID);
  }
}

export default createNavigatorComponent(ExNavigationDrawer);

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
