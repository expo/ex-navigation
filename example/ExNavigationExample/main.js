import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Exponent from 'exponent';

import {
  createRouter,
  NavigationProvider,
  StackNavigation,
  NavigationStyles,
  TabNavigation,
  TabNavigationItem as TabItem,
} from '@exponent/ex-navigation';

const AppRouter = createRouter(() => ({
  modal: () => ModalContainer,
  landing: () => LandingScreen,
  another: () => AnotherRouteScreen,
  nestedNav: () => NestedNavigationScreen,
  tabLanding: () => TabLandingScreen,
}));

class LandingScreen extends Component {
  static route = {
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

class AnotherRouteScreen extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  };

  static route = {
    navigationBar: {
      title: 'Another Route',
    },
  }

  state = {
    otherText: '',
  }

  componentDidMount() {
    const ee = this.props.route.getEventEmitter();

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
        <TouchableOpacity onPress={this.onPressReplace} style={{ height: 20, width: 150, backgroundColor: 'pink' }}>
          <Text>Replace</Text>
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

  onPressReplace = () => {
    this.props.navigator.replace(AppRouter.getRoute('tabLanding'));
  }

  onPressReset = () => {
    this.props.navigation.getNavigator('root').immediatelyResetStack([
      AppRouter.getRoute('landing'),
    ]);
  }
}

class NestedNavigationScreen extends Component {
  static route = {
    navigationBar: {
      visible: false,
    },
  }

  render() {
    return (
      <StackNavigation
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

class ModalContainer extends Component {
  static propTypes = {
    initialRoute: PropTypes.string.isRequired,
  };

  static route = {
    styles: NavigationStyles.FloatVertical,
    navigationBar: {
      visible: false,
    },
  }

  render() {
    return (
      <StackNavigation
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

class TabLandingScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TabNavigation
          initialTab="home">
          <TabItem
            id="home"
            selectedStyle={styles.selectedTab}
            title="Home Tab">
            <StackNavigation
              initialRoute={AppRouter.getRoute('landing')}
            />
          </TabItem>
          <TabItem
            id="other"
            selectedStyle={styles.selectedTab}
            title="Other Tab">
            <StackNavigation
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
  selectedTab: {
    backgroundColor: '#eee',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('main', () => AppContainer);
