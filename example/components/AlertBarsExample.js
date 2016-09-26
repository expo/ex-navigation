import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';

export default class TranslucentBarExample extends Component {
  static route = {
    navigationBar: {
      title: 'Alert Bars',
    },
  }

  _showAlert = () => {
    this.props.navigator.showLocalAlert('Tap on me to close!', {
      text: { color: '#000' },
      container: { backgroundColor: '#FFEB3B' },
    });
  };

  _showAnotherAlert = () => {
    this.props.navigator.showLocalAlert('You love alert bars, huh?', {
      text: { color: '#fff' },
      container: { backgroundColor: '#F44336' },
    });
  };

  _goBack = () => {
    this.props.navigator.pop();
  };

  render() {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/sparkles.jpg')} style={styles.cover} />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={this._showAlert}>
            <Text style={styles.buttonText}>SHOW ALERT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this._showAnotherAlert}>
            <Text style={styles.buttonText}>SHOW ANOTHER ALERT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this._goBack}>
            <Text style={styles.buttonText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  cover: {
    height: 160,
    resizeMode: 'cover',
    backgroundColor: '#131F2B',
  },

  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },

  button: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E91E63',
    borderRadius: 24,
    margin: 6,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 12,
  },
});
