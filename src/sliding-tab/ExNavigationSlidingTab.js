/**
 * @flow
 */

import React, { Children } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import PureComponent from '../utils/PureComponent';
import StaticContainer from 'react-static-container';

import invariant from 'invariant';
import _ from 'lodash';

import Actions from '../ExNavigationActions';
import ExNavigatorContext from '../ExNavigatorContext';
import ExNavigationBar from '../ExNavigationBar';
import ExNavigationSlidingTabItem from './ExNavigationSlidingTabItem';
import { ExNavigationTabContext } from '../tab/ExNavigationTab';
import {
  TabViewAnimated,
  TabViewPagerAndroid,
  TabViewPagerScroll,
  TabBar,
} from 'react-native-tab-view';
import { createNavigatorComponent } from '../ExNavigationComponents';

import type ExNavigationContext from '../ExNavigationContext';

const TabViewPagerComponent = Platform.OS === 'ios'
  ? TabViewPagerScroll
  : TabViewPagerAndroid;

// TODO: Fill this in
type SlidingTabItem = {
  id: string,
  element: React.Element<any>,
  children: Array<React.Element<any>>,
};

type Props = {
  barBackgroundColor?: string,
  children: Array<React.Element<any>>,
  indicatorStyle?: any,
  initialTab: string,
  lazy?: boolean,
  navigation: any,
  navigationState: any,
  onRegisterNavigatorContext: () => any,
  onChangeTab: (key: string) => any,
  onUnregisterNavigatorContext: (navigatorUID: string) => void,
  position: 'top' | 'bottom',
  pressColor?: string,
  renderIndicator: () => ?React.Element<any>,
  renderBefore: () => ?React.Element<any>,
  renderHeader?: (props: any) => ?React.Element<any>,
  renderFooter?: (props: any) => ?React.Element<any>,
  renderLabel?: (routeParams: any) => ?React.Element<any>,
  getRenderLabel?: (props: any) => (routeParams: any) => ?React.Element<any>,
  style?: any,
  swipeEnabled?: boolean,
  tabBarStyle?: any,
  tabStyle?: any,
  labelStyle?: any,
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

    let routes = tabItems.map(({ id, title }) => ({ title, key: id }));
    let routeKeys = routes.map(r => r.key);

    this.props.navigation.dispatch(
      Actions.setCurrentNavigator(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        'slidingTab',
        {},
        routes,
        this.props.initialTab ? routeKeys.indexOf(this.props.initialTab) : 0
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
      const navigatorUIDForTabKey = this._getNavigatorContext().getNavigatorUIDForTabKey(
        currentTabKey
      );
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
        lazy={this.props.lazy}
        style={[styles.container, this.props.style]}
        navigationState={navigationState}
        renderScene={this._renderScene}
        renderPager={this._renderPager}
        renderHeader={
          this.props.renderHeader ||
            (this.props.position !== 'bottom' ? this._renderTabBar : undefined)
        }
        renderFooter={
          this.props.renderFooter ||
            (this.props.position === 'bottom' ? this._renderTabBar : undefined)
        }
        onRequestChangeTab={this._setActiveTab}
      />
    );
  }

  _renderPager = props => {
    return (
      <TabViewPagerComponent
        {...props}
        swipeEnabled={this.props.swipeEnabled}
      />
    );
  };

  _renderScene = ({ route }) => {
    let tabItem = this.state.tabItems.find(i => i.id === route.key);
    if (tabItem) {
      return tabItem.element;
    } else {
      return null;
    }
  };

  _renderTabBar = props => {
    const TabBarComponent = TabBar;
    const renderLabelFn = this.props.getRenderLabel
      ? this.props.getRenderLabel(props)
      : this.props.renderLabel;

    const tabBarProps = {
      pressColor: this.props.pressColor,
      indicatorStyle: this.props.indicatorStyle,
      renderIndicator: this.props.renderIndicator,
      tabStyle: this.props.tabStyle,
      labelStyle: this.props.labelStyle,
      renderLabel: renderLabelFn,
      style: [
        { backgroundColor: this.props.barBackgroundColor },
        this.props.tabBarStyle,
      ],
    };

    return (
      <View>
        {this.props.renderBefore()}
        <TabBarComponent {...props} {...tabBarProps} />
      </View>
    );
  };

  _updateRenderedTabKeys(props, currentRenderedTabKeys) {
    const navState = this._getNavigationState(props);
    const currentTabItems = navState.routes.map(c => c.key);
    const selectedChild = navState.routes[navState.index];

    return [
      ..._.uniq(
        _.without(
          [...currentRenderedTabKeys, ...currentTabItems],
          selectedChild.key
        )
      ),
      selectedChild.key,
    ];
  }

  _parseTabItems(props) {
    const tabItems = Children.map(props.children, (child, index) => {
      invariant(
        child.type === ExNavigationSlidingTabItem,
        'All children of SlidingTabNavigation must be SlidingTabNavigationItems.'
      );

      const tabItemProps = child.props;

      let tabItem = {
        ..._.omit(tabItemProps, ['children']),
      };

      invariant(
        !tabItem.renderLabel,
        'renderLabel should be passed to SlidingTabNavigation instead of SlidingTabNavigationItem.'
      );

      if (Children.count(tabItemProps.children) > 0) {
        tabItem.element = Children.only(tabItemProps.children);
      }

      return tabItem;
    });

    this.setState({
      tabItems,
    });

    return tabItems;
  }

  _setActiveTab = i => {
    let tabItem = this.state.tabItems[i];
    let key = tabItem.id;
    this._getNavigatorContext().jumpToTab(key);

    if (typeof this.props.onChangeTab === 'function') {
      this.props.onChangeTab(key);
    }
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
      new ExNavigationTabContext(
        this.state.navigatorUID,
        this.state.parentNavigatorUID,
        this.state.id,
        this.props.navigation
      )
    );
  }

  _getNavigatorContext(): ExNavigationTabContext {
    const navigatorContext: any = this.props.navigation.getNavigatorByUID(
      this.state.navigatorUID
    );
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
