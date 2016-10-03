/**
 * @providesModule PlaceDetail
 */

import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  state = {
    contentAnimation: new Animated.Value(0),
    navbarAnimation: new Animated.Value(0),
  };

  render() {
    const { data } = this.props;

    const contentTranslateY = this.state.contentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [200, 0],
    });

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.imageContainer}>
            <SharedElementGroup
              id="place-header"
              route={this.props.route}
              configureTransition={() => ({
                timing: Animated.timing,
                easing: Easing.inOut(Easing.ease),
                duration: 500,
                useNativeDriver: true,
              })}
              onTransitionStart={(transitionProps, prevTransitionProps) => {
                const inverse = transitionProps.scene.index < prevTransitionProps.scene.index;
                Animated.timing(this.state.contentAnimation, {
                  toValue: inverse ? 0 : 1,
                  duration: 500,
                  useNativeDriver: true,
                }).start();
              }}
              onTransitionEnd={() => {
                Animated.timing(this.state.navbarAnimation, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}>
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
            <Animated.View style={[styles.navbar, { opacity: this.state.navbarAnimation }]}>
              <TouchableOpacity onPress={this._goBack} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Image
                  style={styles.backButton}
                  source={{ uri: 'https://www.android.com/static/img/map/back-arrow.png' }}
                />
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{data.title}</Text>
              <View style={styles.placeholder} />
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: contentTranslateY }]}}>
              <Text style={styles.descriptionText}>{data.description}</Text>
            </Animated.View>
          </View>
        </ScrollView>
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
  navbar: {
    position: 'absolute',
    top: Platform.select({
      android: 25,
      ios: 20,
    }),
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    tintColor: 'white',
    width: 20,
    height: 20,
    marginLeft: 16,
  },
  title: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 10,
  },
  placeholder: {
    width: 20,
    height: 20,
    marginRight: 16,
  },
  descriptionText: {
    paddingHorizontal: 10,
    marginBottom: 200,
  },
});
