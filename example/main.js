import Exponent, { Asset, Components } from 'exponent';
import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import DrawerNavigationExample from './components/DrawerNavigationExample';
import HomeScreen from './components/HomeScreen';
import AboutScreen from './components/AboutScreen';
import TabNavigationExample from './components/TabNavigationExample';
import SlidingTabNavigationExample from './components/SlidingTabNavigationExample';
import AlertBarsExample from './components/AlertBarsExample';
import TranslucentBarExample from './components/TranslucentBarExample';
import EventEmitterExample from './components/EventEmitterExample';
import CustomNavigationBarExample from './components/CustomNavigationBarExample';

import {
  createRouter,
  NavigationProvider,
} from '@exponent/ex-navigation';

const assets = [
  require('./assets/beetle.jpg'),
  require('./assets/cat.gif'),
  require('./assets/colorful-windows.jpg'),
  require('./assets/paintbrush.jpg'),
  require('./assets/space.jpg'),
  require('./assets/sparkles.jpg'),
];

/**
  * This is where we map route names to route components. Any React
  * component can be a route, it only needs to have a static `route`
  * property defined on it, as in HomeScreen below
  */
export const Router = createRouter(() => ({
  home: () => HomeScreen,
  about: () => AboutScreen,
  tabNavigationExample: () => TabNavigationExample,
  slidingTabNavigationExample: () => SlidingTabNavigationExample,
  alertBarsExample: () => AlertBarsExample,
  translucentBarExample: () => TranslucentBarExample,
  eventEmitterExample: () => EventEmitterExample,
  customNavigationBarExample: () => CustomNavigationBarExample,
}));

class App extends Component {

  state = {
    bootstrapped: false,
  };

  componentDidMount() {
    this._bootstrap();
  }

  _bootstrap = async () => {
    const promises = assets.map(module => Asset.fromModule(module).downloadAsync());
    await Promise.all(promises);
    this.setState({
      bootstrapped: true,
    });
  };

  render() {
    if (!this.state.bootstrapped) {
      return <Components.AppLoading />;
    }

    /**
      * NavigationProvider is only needed at the top level of the app,
      * similar to react-redux's Provider component. It passes down
      * navigation objects and functions through context to children.
      *
      * StackNavigation represents a single stack of screens, you can
      * think of a stack like a stack of playing cards, and each time
      * you add a screen it slides in on top. Stacks can contain
      * other stacks, for example if you have a tab bar, each of the
      * tabs has its own individual stack. This is where the playing
      * card analogy falls apart, but it's still useful when thinking
      * of individual stacks.
      */
    return (
      <NavigationProvider router={Router}>
        <StatusBar barStyle="light-content" />
        <DrawerNavigationExample />
      </NavigationProvider>
    );
  }
}

Exponent.registerRootComponent(App);
