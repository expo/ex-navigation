/**
 * @providesModule ExNavigationTab
 * @flow
 */

import React, {
  Children,
} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import PureComponent from 'PureComponent';
import StaticContainer from 'react-static-container';

import invariant from 'invariant';
import _ from 'lodash';

import Actions from 'ExNavigationActions';
import ExNavigatorContext from 'ExNavigatorContext';
import ExNavigationTabBar from 'ExNavigationTabBar';
import ExNavigationTabItem from 'ExNavigationTabItem';
import { createNavigatorComponent } from 'ExNavigationComponents';

import type ExNavigationContext from 'ExNavigationContext';

export class ExNavigationTabContext extends ExNavigatorContext {
  navigatorUID: string;
  navigatorId: string;
  navigation: ExNavigationContext;
  dispatch: Function;
  _navigatorTabMap: Object = {};
  type: string = 'tab';

  setNavigatorUIDForCurrentTab(navigatorUID: string) {
    const navigatorState = this._getNavigatorState();
    if (!navigatorState) {
      return;
    }
    const currentTab = navigatorState.routes[navigatorState.index];
    this._navigatorTabMap[currentTab.key] = navigatorUID;
  }

  getNavigatorUIDForTabKey(tabKey: string) {
    return this._navigatorTabMap[tabKey];
  }

  jumpToTab(tabKey: string) {
    this.navigation.performAction(({ tabs }) => {
      tabs(this.navigatorUID).jumpToTab(tabKey);
    });
  }
}

type TabItem = {
  id: string,
  renderIcon?: Function,
  tabContent?: React.Element,
};

type Props = {
  id: string,
  navigatorUID: string,
  initialTab: string,
  renderTabBar: (props: Object) => React.Element,
  children: Array<React.Element>,
  navigation: ExNavigationContext,
  onRegisterNavigatorContext: (navigatorUID: string, navigatorContext: ExNavigationTabContext) => void,
  navigationState: Object,
};

type State = {
  id: string,
  navigatorUID: string,
  tabItems: Array<TabItem>,
  parentNavigatorUID: string,
  renderedTabKeys: Array<string>,
};

class ExNavigationTab extends PureComponent<any, Props, State> {
  props: Props;
  state: State;

  static navigation = {
    __isNavigator: true,
  };

  static defaultProps = {
    renderTabBar(props) {
      return <ExNavigationTabBar {...props} />;
    },
  };

  static contextTypes = {
    parentNavigatorUID: React.PropTypes.string,
  };

  static childContextTypes = {
    parentNavigatorUID: React.PropTypes.string,
    navigator: React.PropTypes.instanceOf(ExNavigationTabContext),
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
      tabItems: [],
      id: props.id,
      navigatorUID: props.navigatorUID,
      parentNavigatorUID: context.parentNavigatorUID,
      renderedTabKeys: [],
    };
  }

  render() {
    if (!this.props.children || !this.state.tabItems) {
      return null;
    }

    const navigationState: ?Object = this._getNavigationState();
    if (!navigationState) {
      return null;
    }

    const tabBarProps = {
      selectedTab: navigationState.routes[navigationState.index].key,
      items: this.state.tabItems,
    };

    const tabBar = this.props.renderTabBar(tabBarProps);
    const TabBarComponent = tabBar.type;
    const tabBarHeight = TabBarComponent.height || 0; // Get the tab bar's height from a static property on the class.

    return (
      <View style={styles.container}>
        <View style={{ flex: 1, marginBottom: tabBarHeight }}>
          {this.renderTabs()}
        </View>
        {tabBar}
      </View>
    );
  }

  renderTabs() {
    const tabs = this.state.renderedTabKeys.map(key =>
      this.state.tabItems.find(i => i.id === key)
    );
    return (
      <View style={styles.tabContent}>
        {tabs.map(tab => this.renderTab(tab))}
      </View>
    );
  }

  renderTab(tabItem: Object) {
    if (!tabItem.element) {
      return null;
    }

    const navState = this._getNavigationState();
    const selectedChild = navState.routes[navState.index];

    const isSelected = tabItem.id === selectedChild.key;

    return (
      <View
        key={tabItem.id}
        removeClippedSubviews={!isSelected}
        style={[styles.tabContentInner, {opacity: isSelected ? 1 : 0}]}
        pointerEvents={isSelected ? 'auto' : 'none'}>
        <StaticContainer shouldUpdate={isSelected}>
          {tabItem.element}
        </StaticContainer>
      </View>
    );
  }

  componentWillMount() {
    this._parseTabItems(this.props);

    this._registerNavigatorContext();

    this.props.navigation.dispatch(Actions.setCurrentNavigator(
      this.state.navigatorUID,
      this.state.parentNavigatorUID,
      'tab',
      {},
      [{
        key: this.props.initialTab,
      }],
    ));
  }

  componentWillUnmount() {
    this.props.navigation.dispatch(Actions.removeNavigator(this.state.navigatorUID));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children && nextProps.children !== this.props.children) {
      this._parseTabItems(nextProps);
    }

    if (nextProps.navigationState !== this.props.navigationState) {
      this.setState({
        renderedTabKeys: this._updateRenderedTabKeys(nextProps, this.state.renderedTabKeys),
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
      const currentTabKey = navigationState.routes[navigationState.index].key;
      const navigatorUIDForTabKey = this._getNavigatorContext().getNavigatorUIDForTabKey(currentTabKey);
      if (navigatorUIDForTabKey) {
        this.props.navigation.dispatch(
          Actions.setCurrentNavigator(navigatorUIDForTabKey)
        );
      }
    }
  }

  _updateRenderedTabKeys(props, currentRenderedTabKeys) {
    const navState = this._getNavigationState(props);
    const currentTabItems = navState.routes.map(c => c.key);
    const selectedChild = navState.routes[navState.index];

    return [
      ..._.uniq(_.without([...currentRenderedTabKeys, ...currentTabItems], selectedChild.key)),
      selectedChild.key,
    ];
  }

  _onNavigate = () => {};

  _parseTabItems(props) {
    const tabItems = Children.map(props.children, (child, index) => {
      invariant(
        child.type === ExNavigationTabItem,
        'All children of TabNavigation must be TabNavigationItems.',
      );

      const tabItemProps = child.props;

      let tabItem = {
        ..._.omit(tabItemProps, ['children']),
      };

      if (Children.count(tabItemProps.children) > 0) {
        tabItem.element = Children.only(tabItemProps.children);
      }

      const tabItemOnPress = () => {
        this._setActiveTab(tabItemProps.id, index);
      };

      if (typeof tabItemProps.onPress === 'function') {
        tabItem.onPress = tabItem.onPress.bind(this, tabItemOnPress);
      } else {
        tabItem.onPress = tabItemOnPress;
      }

      return tabItem;
    });

    this.setState({
      tabItems,
    });
  }

  _setActiveTab(id, index) {
    this._getNavigatorContext().jumpToTab(id);
    if (typeof this.props.onTabPress === 'function') {
      this.props.onTabPress(id);
    }
  }

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
      new ExNavigationTabContext(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        this.state.id,
        this.props.navigation,
      )
    );
  }

  _getNavigatorContext(): ExNavigationTabContext {
    return this.props.navigation.getNavigatorByUID(this.state.navigatorUID);
  }
}

export default createNavigatorComponent(ExNavigationTab);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  tabContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  tabContentInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
});
