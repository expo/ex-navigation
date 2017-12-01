import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

/*
 * This component is listening to the route's event emitter, so if you emit a
 * 'selection' event then you can update the state accordingly
 * and re-render the component. This is useful if you want to keep the validation
 * inside of your component rather than Redux. Eg: maybe all you need to do
 * is scroll to the bottom of a massive terms of service agreement before you
 * can press next, in this case it probably makes sense to use this instead of
 * Redux.
 **/
class SelectionBadge extends Component {
  state = {
    count: 0,
  };

  componentWillMount() {
    this._subscription = this.props.emitter.addListener(
      'selection',
      this._handleToggle
    );
  }

  componentWillUnmount() {
    this._subscription.remove();
  }

  _handleToggle = (count: number) => {
    this.setState({
      count,
    });
  };

  _handlePress = () => {
    this.props.emitter.emit('reset');
  };

  render() {
    return (
      <TouchableOpacity
        onPress={this._handlePress}
        style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{this.state.count}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default class TranslucentBarExample extends Component {
  static route = {
    navigationBar: {
      title: route => {
        if (route.selectionCount) {
          return 'Selecting…';
        } else {
          return 'Event Emitter';
        }
      },
      renderRight: ({ config: { eventEmitter } }) => (
        <SelectionBadge emitter={eventEmitter} />
      ),
    },
  };

  state = {
    buttons: Array.from({ length: 9 }).map((x, i) => ({
      key: String(i),
      selected: false,
    })),
  };

  componentWillMount() {
    this._subscription = this.props.route
      .getEventEmitter()
      .addListener('reset', this._handleReset);
  }

  componentWillUnmount() {
    this._subscription.remove();
  }

  componentDidUpdate() {
    const count = this.state.buttons.filter(button => button.selected).length;
    this.props.route.getEventEmitter().emit('selection', count);
    this.props.navigator.updateCurrentRouteParams({
      selectionCount: count,
    });
  }

  _handleReset = () => {
    const buttons = this.state.buttons.map(button => {
      return { ...button, selected: false };
    });
    this.setState({ buttons });
  };

  _toggleButton = (key: string) => {
    const buttons = this.state.buttons.map(button => {
      if (button.key === key) {
        return { ...button, selected: !button.selected };
      }
      return button;
    });
    this.setState({ buttons });
  };

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <View style={styles.row}>
          {this.state.buttons.map(button => (
            <TouchableWithoutFeedback
              key={button.key}
              onPress={() => this._toggleButton(button.key)}>
              <View
                style={[styles.button, button.selected && styles.selected]}
              />
            </TouchableWithoutFeedback>
          ))}
        </View>
        <Text style={styles.description}>
          Tap on the boxes to select them and notice the title and count change in the navigation bar.
        </Text>
        <Text style={styles.description}>
          Tap on the badge in the navigation bar to reset selection.
        </Text>
      </ScrollView>
    );
  }
}

const BUTTON_SIZE = (Dimensions.get('window').width - 40) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  content: {
    padding: 4,
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },

  button: {
    margin: 4,
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    backgroundColor: '#CCC',
    borderRadius: 3,
  },

  selected: {
    backgroundColor: '#E91E63',
  },

  badgeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    backgroundColor: '#fff',
    height: 28,
    width: 28,
    borderRadius: 14,
    margin: 8,
    justifyContent: 'center',
  },

  badgeText: {
    backgroundColor: 'transparent',
    marginTop: -1,
    color: '#0084FF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  description: {
    margin: 8,
    color: '#222',
    fontSize: 16,
    lineHeight: 24,
  },
});
