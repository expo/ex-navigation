

## This library is no longer maintained

Please use ["react-navigation"](https://github.com/react-navigation/react-navigation), or [other alternatives](https://reactnavigation.org/docs/en/alternatives.html) instead.


# ExNavigation

A route-centric, batteries-included navigation library for Expo and
React Native that works seamlessly on Android and iOS.

### A few of our favorite features

- Android back button handling (it just works, no need to do anything)
- Tab bar navigation
- Drawer navigation
- Sliding tab navigation
- Optional blurred translucent backgrounds in navigation and tab bar on iOS
- Alert bars
- Declarative configuration co-located with your routes
- Typed with Flow

## Help / Support / Questions

We don't provide any realtime support for ExNavigation questions. If you
join the Expo Slack and ask a question there, we will direct you to
this section of the README. We suggest the following resources:

- Search the README.
- [Search the issues, then post an issue if nothing matches](https://github.com/expo/ex-navigation/issues).
- Search the code if nothing else works.
- Once you solve your problem, submit a pull request to add the solution to the README.

## Installation

As of version 1.9.0, ExNavigation only supports React Native versions >=
0.36.0 due to changes to the css-layout algorithm in React Native core.


- `npm i @expo/ex-navigation babel-preset-react-native-stage-0 --save`
- Change your `.babelrc` (if you have one, if not, then create one):

```
{
  "presets": ["react-native-stage-0/decorator-support"]
}
```

---

*__Note:__ Comprehensive documentation is coming soon! For now, check out the example project in `example/`. This lib is very much a work in progress.*


## How to run the example project

- `cd example && npm install`
- [Install the Expo client and XDE](https://docs.expo.io/versions/latest/introduction/installation.html)
- Open the project in XDE and open it in the Exponent client

or use this link in your mobile phone: https://expo.io/@community/ex-navigation-example

## How is this different from what is built into React Native?

`NavigationExperimental` ships with React Native, it is powerful and
flexible, and that comes at the cost of exposing some internals to the
app developer. ExNavigation is built on top of `NavigationExperimental`
with the aim of providing a more feature-rich out of the box experience.

## A minimal navigation set up

To give you an idea of what the required pieces of are, the following
includes only the minimal code necessary to get ExNavigation working.

```javascript
import React from 'react';
import {
  AppRegistry,
  Text,
  View,
} from 'react-native';

/**
 * If you're using Expo, uncomment the line below to import Exponent
 * BEFORE importing `@expo/ex-navigation`. This sets the status bar
 * offsets properly.
 */
// import Expo from 'expo';

import {
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@expo/ex-navigation';

/**
  * This is where we map route names to route components. Any React
  * component can be a route, it only needs to have a static `route`
  * property defined on it, as in HomeScreen below
  */
const Router = createRouter(() => ({
  home: () => HomeScreen,
}));

class App extends React.Component {
  render() {
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
        <StackNavigation initialRoute={Router.getRoute('home')} />
      </NavigationProvider>
    );
  }
}

class HomeScreen extends React.Component {
  /**
    * This is where we can define any route configuration for this
    * screen. For example, in addition to the navigationBar title we
    * could add backgroundColor.
    */
  static route = {
    navigationBar: {
      title: 'Home',
    }
  }

  render() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text>HomeScreen!</Text>
      </View>
    )
  }
}


AppRegistry.registerComponent('main', () => App);
```

## Push and popping routes

```diff
 const Router = createRouter(() => ({
   home: () => HomeScreen,
+  about: () => AboutScreen,
 }));

 class HomeScreen extends React.Component {
    render() {
     return (
       <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
         <Text>HomeScreen!</Text>
+        <Text onPress={this._goToAbout}>
+          Push about route
+        </Text>
       </View>
     )
   }
+
+  _goToAbout = () => {
+    this.props.navigator.push(Router.getRoute('about'));
+  }
 }

+ class AboutScreen extends React.Component {
+  static route = {
+    navigationBar: {
+      title: 'About',
+    }
+  }
+
+  render() {
+    return (
+      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
+        <Text>AboutScreen!</Text>
+        <Text onPress={this._goBackHome}>
+          Go back home
+        </Text>
+      </View>
+    )
+  }
+
+  _goBackHome = () => {
+    this.props.navigator.pop();
+  }
+}
```

In the above example you will see that we `push` and `pop` routes to and
from the stack by calling those functions on the `navigator` prop. This
is a prop that is passed into all components that you registered with
the router. If you need to access the `navigator` on a component that
is not a route, you can either pass it in manually from your route
component or use `withNavigation` as a decorator on the component:

```javascript
import React from 'react';
import { Text } from 'react-native';
import { withNavigation } from '@expo/ex-navigation';

@withNavigation
class BackButton extends React.Component {
  render() {
    return <Text onPress={this._goBack}>Go back</Text>
  }

  _goBack = () => {
    if (this.props.navigator.getCurrentIndex() > 0) {
      this.props.navigator.pop();
    }
  }
}
```

Alternatively, rather than importing `Router` each time, you may pass the
route's name directly:

```diff
_goToAbout = () => {
-  this.props.navigator.push(Router.getRoute('about'));
+  this.props.navigator.push('about');
}
```

… bearing in mind you will loose the ability to type check the route (if using
Flow).

## Passing params to a route

```diff
  class HomeScreen extends React.Component {

   _goToAbout = () => {
-    this.props.navigator.push(Router.getRoute('about'));
+    this.props.navigator.push(Router.getRoute('about', {name: 'Brent'}));
   }
 }

 class AboutScreen extends React.Component {
   static route = {
     navigationBar: {
-      title: 'About',
+      title(params) {
+        return `Greeting for ${params.name}`;
+      },
     }
   }

   render() {
     return (
       <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
-        <Text>AboutScreen!</Text>
+        <Text>AboutScreen! Hello {this.props.route.params.name}</Text>
         <Text onPress={this._goBackHome}>
           Go back home
         </Text>
```

## Updating route params

Sometimes you don't have all of the data that you need to set the
navigation bar title when you mount the route - for example, if you
navigate to a user profile screen by user id and need to fetch the
profile data before you know what the name is. In this case,
one solution is to use the `updateCurrentRouteParams` function available
on `StackNavigation` navigators.

```diff
 class AboutScreen extends React.Component {
   static route = {
     navigationBar: {
       title(params) {
-        return `Greeting for ${params.name}`;
+        if (typeof params.isCool === 'undefined') {
+          return '';
+        }
+
+        return params.isCool ? `Hey cool person!` : `zzz`;
       },
     }
   }

+  componentDidMount() {
+    setTimeout(() => {
+      this.props.navigator.updateCurrentRouteParams({
+        isCool: this.props.route.params.name === 'Brent'
+      })
+    }, 1000);
+  }
+
```

### Make navigation bar buttons update based on route or app state

See the following example for details on how to connect your buttons to
the navigator or Redux to perform actions: https://github.com/brentvatne/ex-navigation-conditional-buttons-example

## StackNavigation actions

As you saw above, you can `push` and `pop` routes. The following is a
full list of functions that can be called on StackNavigation navigators.

- `push`: add a route to the top of the stack
- `pop(n)`: remove n routes from the top of the stack, defaults to 1
- `popToTop`: remove all but the first route from the stack
- `replace`: replace the current route with a given route
- `showLocalAlert`: show an alert bar with given text and styles
- `hideLocalAlert`: hide an active alert bar
- `immediatelyResetStack`: reset the current stack to the given stack
- `updateCurrentRouteParams`: update route params as in the above example

## Working with the navigation bar

The navigation bar configuration exposes a set of useful options that
should allow you to do most things that you will want to do with it.

You specify the configuration for the `navigationBar` on the route
component, or on a `StackNavigation` component.

### On a route component

When you configure the `navigationBar` on a route component, the
configuration only applies to that specific component. This is
usually useful for specifying the title or components to render
on the left or right of the title.

```javascript

 class HomeScreen extends React.Component {
   _goToAbout = () => {
     this.props.navigator.push(Router.getRoute('about', {name: 'Brent'}));
   }
 }

 class AboutScreen extends React.Component {
   static route = {
     navigationBar: {
       title: 'Title goes here',
       renderRight: (route, props) => <SignOutButton name={route.params.name} />
     }
   }

   // ...
 }

 @connect()
 class SignOutButton extends React.Component {
   render() {
      return (
        <TouchableOpacity onPress={this.props.dispatch(Actions.signOut())}>
          <Text>Sign out {this.props.name}</Text>
        </TouchableOpacity>
      );
   }
 }
```

### On StackNavigation

You can configure the `defaultRouteConfig` for all routes within a
`StackNavigation` to save you needing to specify properties like
the `navigationBar` `backgroundColor` and `tintColor` (color to
use for the title and back button or drawer menu hamburger button).

```javascript
class App extends React.Component {
  render() {
    return (
      <NavigationProvider router={Router}>
        <StackNavigation
          defaultRouteConfig={{
            navigationBar: {
              backgroundColor: '#000',
              tintColor: '#fff',
            }
          }}
          initialRoute={Router.getRoute('home')}
        />
      </NavigationProvider>
    );
  }
}
```

### navigationBar properties

- `title` - a string or a function that returns a string. The function is provided with the route params as the first argument.
- `titleStyle` - Text.propTypes.style object to use for the title.
- `backgroundColor` - the background color to use for the
`navigationBar`.
- `tintColor` - the color to use for the title text and back button or
drawer button icons.
- `visible` - boolean that indicates whether the `navigationBar` should
be visible for this route.
- `translucent` - iOS and Expo only, use background blur on the
`navigationBar`, like in the Apple Podcasts app, for example.
- `borderBottomWidth` - the width of the bottom border
- `borderBottomColor` - the color of the bottom border
- `renderLeft` - a function that should return a React component that
will be rendered in the left position of the `navigationBar`.
- `renderTitle` - a function that should return a React component that
will be rendered in the title position of the `navigationBar`.
- `renderRight` - a function that should return a React component that
will be rendered in the right position of the `navigationBar`.
- `renderBackground` - a function that should return a React component that
will be rendered in the background of the `navigationBar`.

## TabNavigation

A minimal example using tabs:

```javascript
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem as TabItem,
} from '@expo/ex-navigation';


// Treat the TabScreen route like any other route -- you may want to set
// it as the initial route for a top-level StackNavigation
class TabScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  }

  render() {
    return (
      <TabNavigation
        id="main"
        navigatorUID="main"
        initialTab="home">
        <TabItem
          id="home"
          title="Home"
          selectedStyle={styles.selectedTab}
          renderIcon={(isSelected) => <Image source={require('./assets/images/home.png')} /> }>
          <StackNavigation
            id="home"
            navigatorUID="home"
            initialRoute={Router.getRoute('home')}
          />
        </TabItem>

        <TabItem
          id="posts"
          title="Posts"
          selectedStyle={styles.selectedTab}
          renderIcon={(isSelected) => <Image source={require('./assets/images/posts.png')} /> }>
          <StackNavigation
            id="posts"
            initialRoute={Router.getRoute('posts')}
          />
        </TabItem>

        <TabItem
          id="profile"
          title="Profile"
          selectedStyle={styles.selectedTab}
          renderIcon={(isSelected) => <Image source={require('./assets/images/profile.png')} /> }>
          <StackNavigation
            id="profile"
            initialRoute={Router.getRoute('profile')}
          />
        </TabItem>
      </TabNavigation>
    );
  }
}
```

See an example of TabNavigation in a real app
[here](https://github.com/expo/rnplay/blob/f4d29c4578fb57347afd0d507a036dd232ec6fdb/navigation/TabNavigationLayout.js).

If you'd like to switch tabs programmatically (eg: a notification
arrives and you want to jump to a notifications tab, or you tap on a
button to open your profile but within another tab) you can use
`jumpToTab`. For the code below to work, we need the `navigatorUID` prop
to be set on TabNavigator, as with the example above.

```javascript
<TouchableOpacity
  onPress={() => {
    this.props.navigation.performAction(({ tabs, stacks }) => {
      tabs('main').jumpToTab('profile');
      stacks('home').push(route);
    });
  }}
/>
```

## DrawerNavigation

A minimal example using the DrawerNavigation:

```javascript
import {
  StackNavigation,
  DrawerNavigation,
  DrawerNavigationItem,
} from '@expo/ex-navigation';

// Treat the DrawerNavigationLayout route like any other route -- you may want to set
// it as the intiial route for a top-level StackNavigation

class DrawerNavigationLayout extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  };

  render() {
    return (
      <DrawerNavigation
        id='main'
        initialItem='home'
        drawerWidth={300}
        renderHeader={this._renderHeader}
      >
        <DrawerNavigationItem
          id='home'
          selectedStyle={styles.selectedItemStyle}
          renderTitle={isSelected => this._renderTitle('Home', isSelected)}
        >
          <StackNavigation
            id='home'
            initialRoute={Router.getRoute('home')}
          />
        </DrawerNavigationItem>

        <DrawerNavigationItem
          id='about'
          selectedStyle={styles.selectedItemStyle}
          renderTitle={isSelected => this._renderTitle('About', isSelected)}
        >
          <StackNavigation
            id='about'
            initialRoute={Router.getRoute('about')}
          />
        </DrawerNavigationItem>

      </DrawerNavigation>
    );
  }

  _renderHeader = () => {
    return (
      <View style={styles.header}>
      </View>
    );
  };

  _renderTitle(text: string, isSelected: boolean) {
    return (
      <Text style={[styles.titleText, isSelected ? styles.selectedTitleText : {}]}>
        {text}
      </Text>
    );
  };
}

const styles = StyleSheet.create({
  header: {
    height: 20
  },

  selectedItemStyle: {
    backgroundColor: 'blue'
  },

  titleText: {
    fontWeight: 'bold'
  },

  selectedTitleText: {
    color: 'white'
  }
});
```


### Integrate with your existing Redux store

Behind the scenes ExNavigation manages your navigation state using
Redux in its own store. If you'd like to store the navigation state
on your app's store, you can use the `createStoreWithNavigation`
function when creating the store and then manually provide the
`NavigationContext`, initialized with your app's store.

```javascript
/* Your store definition, let's say state/Store.js */

import { createNavigationEnabledStore, NavigationReducer } from '@expo/ex-navigation';
import { combineReducers, createStore } from 'redux';

const createStoreWithNavigation = createNavigationEnabledStore({
  createStore,
  navigationStateKey: 'navigation',
});

const store = createStoreWithNavigation(
  /* combineReducers and your normal create store things here! */
  combineReducers({
    navigation: NavigationReducer,
    // other reducers
  })
);

export default store;
```

```javascript
/* Your routes, Router.js */

import { createRouter } from '@expo/ex-navigation';
import HomeScreen from './HomeScreen';

export const Router = createRouter(() => ({
  home: () => HomeScreen,
}));
```

```diff
 /* The top level of your app, often in main.js or index.[ios/android].js */

 import {
   NavigationContext,
   NavigationProvider,
   StackNavigation,
 } from '@expo/ex-navigation';

 import Store from './state/Store';
 import Router from './Router';

+const navigationContext = new NavigationContext({
+  router: Router,
+  store: Store,
+})

 return (
   <Provider store={Store}>
+    <NavigationProvider context={navigationContext}>
       <StackNavigation yourUsualPropsHere />
     </NavigationProvider>
   </Provider>
 )
```

### Perform navigation actions from outside of a component

You might be using some Redux middleware like saga, thunk, promise, or
effex (we recommend [effex](https://github.com/expo/redux-effex)
because we love `async/await`). Whatever you're using, you no longer
have access to `this.props.navigator` and the like. What to do?
Well as long as you include your navigation state inside of your Redux
store, you can dispatch a NavigationAction to it -- after all, this is
what `this.props.navigator.push` etc. do behind the scenes.

In the following example we call `getState` and `dispatch` directly on
your store -- feel free to change this to whatever the equivalent is
for your context (eg: if this was effex, `dispatch` and `getState` would
be passed in to the `goHome` function).

```javascript
import { NavigationActions } from '@expo/ex-navigation'
import Store from '../state/Store';
import Router from './Router'

export default function goHome() {
  let navigatorUID = Store.getState().navigation.currentNavigatorUID;
  Store.dispatch(NavigationActions.push(navigatorUID, Router.getRoute('home')))
}
```

### Screen Tracking / Analytics

You might want to do some screen tracking in your apps. Since the entire navigation state is in redux, screen tracking is as simple as writing a redux middleware. Below is a simple middleware that uses `routeName` as the screen name for tracking screens.

```javascript
import SegmentIO from 'react-native-segment-io-analytics';

const navigationStateKey = 'navigation';

// gets the current screen from navigation state
function getCurrentScreen(getStateFn) {
  const navigationState = getStateFn()[navigationStateKey];
  // navigationState can be null when exnav is initializing
  if (!navigationState) return null;

  const { currentNavigatorUID, navigators } = navigationState;
  if (!currentNavigatorUID) return null;

  const { index, routes } = navigators[currentNavigatorUID];
  const { routeName } = routes[index];
  return routeName;
}

const screenTracking = ({ getState }) => next => action => {
  if (!action.type.startsWith('EX_NAVIGATION')) return next(action);
  const currentScreen = getCurrentScreen(getState);
  const result = next(action);
  const nextScreen = getCurrentScreen(getState);
  if (nextScreen !== currentScreen) {
    SegmentIO.screen(nextScreen);
  }
  return result;
}

export default screenTracking;

```

### Android back button handling

React Native includes a global `BackHandler` module. Rather than using this module
directly, include the `AndroidBackButtonBehavior` component in routes where you'd
like to control the back button. `AndroidBackButtonBehavior` accepts
`isFocused` and `onBackButtonPress`. If `isFocused` is true, the `onBackButtonPress`
will fire when the user presses the back button. You need to make sure that `onBackButtonPress`
returns a promise that wraps the function you want to be called. Eg.

```
<AndroidBackButtonBehavior isFocused={someboolean}
   onBackButtonPress={()=>Promise.resolve(fireMeWhenSomeBooleanIsTrue)}>
   ...
</AndroidBackButtonBehavior>
```
