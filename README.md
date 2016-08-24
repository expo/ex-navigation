# ExNavigation

A route-centric, batteries-included navigation library for Exponent and
React Native that works seamlessly on Android and iOS.

### A few of our favorite features:

- Android back button handling (it just works, no need to do anything)
- Tab bar navigation
- Drawer navigation
- Sliding tab navigation
- Optional blurred translucent backgrounds in navigation and tab bar on iOS
- Alert bars
- Declarative configuration co-located with your routes
- Typed with Flow

## Installation

- `npm i @exponent/ex-navigation babel-preset-react-native-stage-0 --save`
- Change your `.babelrc` (if you have one, if not, then create one):
  ```
  {
    "presets": ["react-native-stage-0/decorator-support"]
  }
  ```

---

*__Note:__ Comprehensive documentation is coming soon! For now, check out the example project in `example/`. This lib is very much a work in progress.*


## How to run the example project

- `cd example/ExNavigationExample && npm install`
- [Install the Exponent client and XDE](https://docs.getexponent.com/versions/v8.0.0/introduction/installation.html)
- Open the project in XDE and open it in the Exponent client

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

import {
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';

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
component use `withNavigation` as a decorator on the component:

```javascript
import React from 'react';
import { Text } from 'react-native';
import { withNavigation } from '@exponent/ex-navigation';

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

## StackNavigation actions

As you saw above, you can `push` and `pop` routes. The following is a
full list of functions that can be called on StackNavigation navigators.

- `push`: add a route to the top of the stack
- `pop`: remove the route at the top of the stack
- `replace`: replace the current route with a given route
- `showLocalAlert`: show an alert bar with given text and styles
- `hideLocalAlert`: hide an active alert bar
- `immediatelyResetStack`: reset the current stack to the given stack
- `updateCurrentRouteParams`: update route params as in the above example
