/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createRouter,
  withNavigation,
  NavigationProvider,
  StackNavigation,
  NavigationStyles,
  TabNavigation,
  TabNavigationItem as TabItem,
} from '../../';

const AppRouter = createRouter(() => ({
  modal: () => ModalContainer,
  landing: () => LandingScreen,
  another: () => AnotherRouteScreen,
  nestedNav: () => NestedNavigationScreen,
  tabLanding: () => TabLandingScreen,
}));

@AppRouter.makeRoute()
@withNavigation
class LandingScreen extends Component {
  static navigation = {
    navigationBar: {
      title: 'Landing',
    },
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.onPressForward} style={{ height: 20, width: 150, backgroundColor: 'red' }}>
          <Text>Go forward</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressBack} style={{ height: 20, width: 150, backgroundColor: 'blue' }}>
          <Text>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressOpenModal} style={{ height: 20, width: 150, backgroundColor: 'pink' }}>
          <Text>Open a modal (that has tabs)!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onPressForward = () => {
    this.props.navigator.push(
      AppRouter.getRoute('another', {
        text: 'Some dynamic text!',
      })
    );
  }

  onPressBack = () => {
    try {
      const parentNavigator = this.props.navigator.getParentNavigator();
      parentNavigator.pop();
    } catch (e) {}
  }

  onPressOpenModal = () => {
    const rootNavigator = this.props.navigation.getNavigator('root');
    rootNavigator.push(AppRouter.getRoute('modal', {
      initialRoute: 'tabLanding',
    }));
  }
}

@AppRouter.makeRoute(
  /* mapParamsToProps */
  ({ text }) => ({ text })
)
@withNavigation
class AnotherRouteScreen extends Component {
  static navigation = {
    navigationBar: {
      title: 'Another Route',
    },
  }

  state = {
    otherText: '',
  }

  componentDidMount() {
    const ee = this.props.navigator
      .getCurrentRoute()
      .getEventEmitter();

    this.listener = ee.addListener('hello', () => {
      this.setState({
        otherText: 'some other text',
      });
    });

    setTimeout(() => {
      ee.emit('hello');
    }, 5000);
  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.otherText}
        </Text>
        <Text style={styles.welcome}>
          {this.props.text}
        </Text>
        <TouchableOpacity onPress={this.onPressForward} style={{ height: 20, width: 150, backgroundColor: 'green' }}>
          <Text>Go forward</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressBack} style={{ height: 20, width: 150, backgroundColor: 'yellow' }}>
          <Text>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressReset} style={{ height: 20, width: 150, backgroundColor: 'purple' }}>
          <Text>Reset!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onPressForward = () => {
    this.props.navigator.push(
      AppRouter.getRoute('nestedNav')
    );
  }

  onPressBack = () => {
    this.props.navigator.pop();
  }

  onPressReset = () => {
    this.props.navigation.getNavigator('root').immediatelyResetStack([
      AppRouter.getRoute('landing'),
    ]);
  }
}

@AppRouter.makeRoute()
@withNavigation
class NestedNavigationScreen extends Component {
  static navigation = {
    navigationBar: {
      visible: false,
    },
  }

  render() {
    return (
      <StackNavigation
        id="nested-nav"
        defaultRouteConfig={{
          navigationBar: {
            visible: true,
          },
        }}
        initialRoute={AppRouter.getRoute('landing')}
      />
    );
  }
}

@AppRouter.makeRoute(({ initialRoute }) => ({ initialRoute }))
@withNavigation
class ModalContainer extends Component {
  static navigation = {
    styles: NavigationStyles.FloatVertical,
    navigationBar: {
      visible: false,
    },
  }

  render() {
    return (
      <StackNavigation
        id="modal"
        defaultRouteConfig={{
          navigationBar: {
            visible: false,
          },
        }}
        initialRoute={AppRouter.getRoute(this.props.initialRoute)}
      />
    );
  }
}

@AppRouter.makeRoute()
@withNavigation
class TabLandingScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TabNavigation
          id="tab-navigator"
          initialTab="home">
          <TabItem
            id="home"
            title="Home Tab">
            <StackNavigation
              id="home"
              initialRoute={AppRouter.getRoute('landing')}
            />
          </TabItem>
          <TabItem
            id="other"
            title="Other Tab">
            <StackNavigation
              id="other"
              initialRoute={AppRouter.getRoute('another', { text: `I'm in a tab!`})}
            />
          </TabItem>
        </TabNavigation>
      </View>
    );
  }
}

class App extends Component {
  render() {
    return (
      <StackNavigation
        id="root"
        initialRoute={AppRouter.getRoute('landing')}
      />
    );
  }
}

export default class AppContainer extends Component {
  render() {
    return (
      <NavigationProvider router={AppRouter}>
        <App />
      </NavigationProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
