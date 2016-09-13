/**
 * @flow
 */

import React, {
  Children,
} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import PureComponent from '../utils/PureComponent';
import StaticContainer from 'react-static-container';

import invariant from 'invariant';
import _ from 'lodash';

import Actions from '../ExNavigationActions';
import ExNavigatorContext from '../ExNavigatorContext';
import ExNavigationBar from '../ExNavigationBar';
import ExNavigationSlidingTabItem from './ExNavigationSlidingTabItem';
import { ExNavigationTabContext } from '../tab/ExNavigationTab';
import { TabViewAnimated, TabViewPage, TabBarTop, TabBar } from 'react-native-tab-view';
import { createNavigatorComponent } from '../ExNavigationComponents';

import type ExNavigationContext from '../ExNavigationContext';

// TODO: Fill this in
type SlidingTabItem = {
  id: string,
  element: React.Element<any>,
  children: Array<React.Element<any>>,
};

type Props = {
  barBackgroundColor: ?string,
  indicatorStyle: any,
  initialTab: string,
  children: Array<React.Element<any>>,
  navigation: any,
  navigationState: any,
  position: "top" | "bottom",
  pressColor: ?string,
  renderBefore: () => ?ReactElement<any>,
  style: any,
  onRegisterNavigatorContext: () => any,
  tabBarStyle: any,
  tabStyle: any,
};

type State = {
  id: string,
  navigatorUID: string,
  tabItems: Array<SlidingTabItem>,
  parentNavigatorUID: string,
};

class ExNavigationSlidingTab extends PureComponent<any, Props, State> {
  props: Props;
  state: State;

  static route = {
    __isNavigator: true,
  };

  static navigationBarStyles = {
    borderBottomWidth: 0,
    elevation: 0,
  };

  static defaultProps = {
    barBackgroundColor: ExNavigationBar.DEFAULT_BACKGROUND_COLOR,
    indicatorStyle: {},
    position: 'top',
    pressColor: 'rgba(0,0,0,0.2)',
    tabStyle: {},
    renderBefore: () => null,
  };

  static contextTypes = {
    parentNavigatorUID: React.PropTypes.string,
  };

  static childContextTypes = {
    parentNavigatorUID: React.PropTypes.string,
    navigator: React.PropTypes.instanceOf(ExNavigationTabContext),
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      tabItems: [],
      id: props.id,
      navigatorUID: props.navigatorUID,
      parentNavigatorUID: context.parentNavigatorUID,
    };
  }

  getChildContext() {
    return {
      navigator: this._getNavigatorContext(),
      parentNavigatorUID: this.state.navigatorUID,
    };
  }

  componentWillMount() {
    let tabItems = this._parseTabItems(this.props);

    this._registerNavigatorContext();

    let routes = tabItems.map(i => ({key: i.id}));
    let routeKeys = routes.map(r => r.key);

    this.props.navigation.dispatch(Actions.setCurrentNavigator(
      this.state.navigatorUID,
      this.state.parentNavigatorUID,
      'slidingTab',
      {},
      routes,
      this.props.initialTab ? routeKeys.indexOf(this.props.initialTab) : 0,
    ));
  }

  componentWillUnmount() {
    this.props.navigation.dispatch(Actions.removeNavigator(this.state.navigatorUID));
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Should make it possible to dynamically add children after initial render?
    // if (nextProps.children && nextProps.children !== this.props.children) {
    //   this._parseTabItems(nextProps);
    // }
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


  render() {
    if (!this.props.children || !this.state.tabItems) {
      return null;
    }

    const navigationState: ?Object = this._getNavigationState();
    if (!navigationState) {
      return null;
    }

    if (this.state.tabItems.length !== navigationState.routes.length) {
      return null;
    }

    return (
      <TabViewAnimated
        style={[styles.container, this.props.style]}
        navigationState={navigationState}
        renderScene={this._renderPage}
        renderHeader={this._renderHeader}
        onRequestChangeTab={this._setActiveTab}
      />
    );
  }

  _renderPage = (props) => {
    return <TabViewPage {...props} renderScene={this._renderScene} />;
  }

  _renderScene = ({ route }) => {
    let tabItem = this.state.tabItems.find(i => i.id === route.key);
    if (tabItem) {
      return tabItem.element;
    } else {
      return null;
    }
  };

  _renderLabel = (options) => {
    let { route, focused, index } = options;
    let tabItem = this.state.tabItems.find(i => i.id === route.key);

    return tabItem && tabItem.renderLabel ? tabItem.renderLabel(options) : null;
  }

  _renderHeader = (props) => {
    const TabBarComponent = this.props.position === 'top' ? TabBarTop : TabBar;
    const tabBarProps = {
      pressColor: this.props.pressColor,
      indicatorStyle: this.props.indicatorStyle,
      tabStyle: this.props.tabStyle,
      style: [{backgroundColor: this.props.barBackgroundColor}, this.props.tabBarStyle],
    };

    return (
      <View>
        {this.props.renderBefore()}
        <TabBarComponent
          {...props}
          {...tabBarProps}
          renderLabel={this._renderLabel}
        />
      </View>
    );
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

  _parseTabItems(props) {
    const tabItems = Children.map(props.children, (child, index) => {
      invariant(
        child.type === ExNavigationSlidingTabItem,
        'All children of SlidingTabNavigation must be SlidingTabNavigationItems.',
      );

      const tabItemProps = child.props;

      let tabItem = {
        ..._.omit(tabItemProps, ['children']),
      };

      if (Children.count(tabItemProps.children) > 0) {
        tabItem.element = Children.only(tabItemProps.children);
      }

      // const tabItemOnPress = () => {
      //   this._setActiveTab(tabItemProps.id, index);
      // };

      // if (typeof tabItemProps.onPress === 'function') {
      //   tabItem.onPress = tabItem.onPress.bind(this, tabItemOnPress);
      // } else {
      //   tabItem.onPress = tabItemOnPress;
      // }

      return tabItem;
    });

    this.setState({
      tabItems,
    });

    return tabItems;
  }

  _setActiveTab = (i) => {
    let tabItem = this.state.tabItems[i];
    let key = tabItem.id;
    this._getNavigatorContext().jumpToTab(key);

    // if (typeof this.props.onTabPress === 'function') {
    //   this.props.onTabPress(key);
    // }
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
    const navigatorContext: any = this.props.navigation.getNavigatorByUID(this.state.navigatorUID);
    return (navigatorContext: ExNavigationTabContext);
  }
}

export default createNavigatorComponent(ExNavigationSlidingTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
