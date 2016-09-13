/**
 * @providesModule PlaceDetail
 */

import React from 'react';
import {
  Animated,
  Easing,
  Dimensions,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  withNavigation,
  SharedElement,
  SharedElementGroup,
} from '@exponent/ex-navigation';

@withNavigation
export default class PlaceDetail extends React.Component {
  static route = {
    navigationBar: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      visible: false,
    },
  }

  render() {
    const { data } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.imageContainer}>
          <SharedElementGroup
            id="place-header"
            route={this.props.route}
            configureTransition={() => ({
              timing: Animated.timing,
              easing: Easing.inOut(Easing.ease),
              duration: 750,
            })}>
            <SharedElement id="image">
              {(animation) => (
                <Animated.View style={[styles.image, animation]}>
                  {
                    <Animated.Image
                      source={{ uri: data.image }}
                      style={{ flex: 1 }}
                    />
                  }
                </Animated.View>
              )}
            </SharedElement>
            <SharedElement id="price">
              {(animation) => (
                <Animated.View style={[styles.priceLabel, animation]}>
                  <Text style={styles.priceLabelText}>
                    ${data.price}
                  </Text>
                </Animated.View>
              )}
            </SharedElement>
          </SharedElementGroup>
          <TouchableOpacity onPress={this._goBack}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _goBack = () => {
    this.props.navigator.pop();
  }
}

const styles = StyleSheet.create({
  imageContainer: {

  },
  image: {
    width: Dimensions.get('window').width,
    height: 220,
  },
  priceLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, .75)',
    marginVertical: 16,
    marginLeft: 10,
    paddingVertical: 7.5,
    paddingHorizontal: 10,
  },
  priceLabelText: {
    fontSize: 19,
    color: 'white',
  },
  back: {
    marginLeft: 10,
  },
});
