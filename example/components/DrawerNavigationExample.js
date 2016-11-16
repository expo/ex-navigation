import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import {
  StackNavigation,
  DrawerNavigation,
  DrawerNavigationItem,
  DrawerNavigationChild,
} from '@exponent/ex-navigation';
import { Ionicons } from '@exponent/vector-icons';
import { Router } from '../main';

class Heading extends DrawerNavigationChild {
  renderDrawerItem() {
    return (
      <Text style={styles.headingText}>{this.props.title}</Text>
    );
  }
}

class DrawerItem extends DrawerNavigationItem {
  renderIcon = (isSelected: bool) => {
    let extraStyle = {marginTop: 2};
    if (this.props.icon === 'md-alert') {
      extraStyle = {...extraStyle, marginLeft: -3};
    }
    return (
      <Ionicons
        style={[styles.icon, isSelected ? styles.selectedText : null, extraStyle]}
        name={this.props.icon}
        size={24}
      />
    );
  };

  renderTitle = (isSelected: bool) => {
    return (
      <Text style={[styles.buttonTitleText, isSelected ? styles.selectedText : null]}>
        {this.props.title}
      </Text>
    );
  };

  get selectedItemStyle() {
    return styles.selectedItemStyle;
  }

  get children() {
    let { defaultRouteConfig } = this.props;

    return (
      <StackNavigation
        id="root"
        defaultRouteConfig={defaultRouteConfig}
        initialRoute={Router.getRoute('home')}
      />
    );
  }
}

export default class DrawerNavigationExample extends Component {
  renderHeader = () => {
    return (
      <View style={{height: 180, width: 300}}>
        <Image source={require('../assets/sparkles.jpg')} style={styles.header} />
      </View>
    );
  };

  render() {
    return (
      <DrawerNavigation
        drawerPosition="right"
        renderHeader={this.renderHeader}
        drawerWidth={300}
        initialItem="home">
        <DrawerItem
          id="home"
          icon="md-apps"
          title="Examples"
          defaultRouteConfig={{
            navigationBar: {
              backgroundColor: '#0084FF',
              tintColor: '#fff',
            },
          }}
          stack={{
            id: 'root',
            initialRoute: Router.getRoute('home'),
          }}
        />
        <Heading title="Meta" />
        <DrawerItem
          id="another"
          icon="md-alert"
          title="About"
          defaultRouteConfig={{
            navigationBar: {
              backgroundColor: '#0084FF',
              tintColor: '#fff',
            },
          }}
          stack={{
            id: 'root',
            initialRoute: Router.getRoute('about'),
          }}
        />
      </DrawerNavigation>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    height: 180,
    width: null,
    resizeMode: 'cover',
  },
  headingText: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#777',
    fontWeight: 'bold',
  },
  buttonTitleText: {
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 18,
  },
  icon: {
    color: '#999',
  },
  selectedText: {
    color: '#0084FF',
  },
  selectedItemStyle: {
    backgroundColor: "#E8E8E8",
  },
});
