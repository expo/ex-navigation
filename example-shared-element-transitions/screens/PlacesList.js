/**
 * @providesModule PlacesList
 */

import React from 'react';
import {
  Animated,
  Easing,
  Dimensions,
  View,
  ListView,
  StyleSheet,
  Image,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  SharedElement,
  SharedElementGroup,
  withNavigation,
} from '@exponent/ex-navigation';

import AppRouter from 'AppRouter';

const INITIAL_DATA = [
  {
    title: 'Napa Valley Home near Yountville',
    rating: 5,
    numberOfRatings: 89,
    type: 'Entire Home',
    price: 299,
    image: 'https://unsplash.it/350/220/?image=1057',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum maximus sapien felis, eu vestibulum enim maximus id. Phasellus ac lorem id elit laoreet bibendum id ut quam. Nam ligula urna, dapibus nec posuere quis, volutpat vitae ligula. Nunc sed ex tortor. Vivamus in convallis odio, nec dictum turpis. Nulla et turpis non dui sollicitudin faucibus at rhoncus augue. Morbi quis malesuada nisi. Integer non pretium turpis. Nullam vel arcu id lorem dapibus lobortis. Pellentesque volutpat enim sed eros consectetur gravida.\n\nNulla feugiat nisl ligula, at porttitor odio gravida ut. Maecenas congue interdum mauris, id dapibus elit commodo ut. Donec tellus felis, mollis quis faucibus vel, ultrices eget ipsum. Proin sit amet felis accumsan, sollicitudin lacus ut, tempor nulla. Integer eget urna consectetur, condimentum lectus sit amet, convallis sem. Duis nulla sem, pretium non est vitae, varius viverra neque. Vivamus vitae metus vel tortor interdum auctor sit amet et dui. Fusce pellentesque consectetur lobortis. Sed vestibulum placerat rutrum. Quisque molestie leo nec pellentesque interdum. Duis malesuada sapien convallis ante laoreet, quis imperdiet ipsum dictum. Curabitur a ante commodo, dapibus justo in, laoreet odio. Praesent mi diam, aliquet ac magna non, aliquet porta arcu. Fusce ut nulla lorem. Fusce in quam ac ligula feugiat vulputate et vitae nibh. Quisque in finibus arcu.\n\nFusce dignissim nec sem id ullamcorper. Pellentesque accumsan sem vestibulum, cursus est at, consequat ligula. Nulla convallis arcu in suscipit auctor. Duis nulla orci, aliquam sit amet iaculis nec, posuere a nisi. Phasellus congue dapibus libero, ac ullamcorper lectus fringilla in. Curabitur gravida interdum lectus, nec condimentum lectus tristique a. Nunc hendrerit a nunc id fermentum. Praesent ut turpis a ipsum vulputate eleifend. Aenean mollis ipsum nec pretium suscipit. Aliquam erat volutpat.',
  },
  {
    title: `Studio sleeps four at Napa's finest resort`,
    rating: 5,
    numberOfRatings: 9,
    type: 'Entire Home',
    price: 130,
    image: 'https://unsplash.it/350/220/?image=1051',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum maximus sapien felis, eu vestibulum enim maximus id. Phasellus ac lorem id elit laoreet bibendum id ut quam. Nam ligula urna, dapibus nec posuere quis, volutpat vitae ligula. Nunc sed ex tortor. Vivamus in convallis odio, nec dictum turpis. Nulla et turpis non dui sollicitudin faucibus at rhoncus augue. Morbi quis malesuada nisi. Integer non pretium turpis. Nullam vel arcu id lorem dapibus lobortis. Pellentesque volutpat enim sed eros consectetur gravida.\n\nNulla feugiat nisl ligula, at porttitor odio gravida ut. Maecenas congue interdum mauris, id dapibus elit commodo ut. Donec tellus felis, mollis quis faucibus vel, ultrices eget ipsum. Proin sit amet felis accumsan, sollicitudin lacus ut, tempor nulla. Integer eget urna consectetur, condimentum lectus sit amet, convallis sem. Duis nulla sem, pretium non est vitae, varius viverra neque. Vivamus vitae metus vel tortor interdum auctor sit amet et dui. Fusce pellentesque consectetur lobortis. Sed vestibulum placerat rutrum. Quisque molestie leo nec pellentesque interdum. Duis malesuada sapien convallis ante laoreet, quis imperdiet ipsum dictum. Curabitur a ante commodo, dapibus justo in, laoreet odio. Praesent mi diam, aliquet ac magna non, aliquet porta arcu. Fusce ut nulla lorem. Fusce in quam ac ligula feugiat vulputate et vitae nibh. Quisque in finibus arcu.\n\nFusce dignissim nec sem id ullamcorper. Pellentesque accumsan sem vestibulum, cursus est at, consequat ligula. Nulla convallis arcu in suscipit auctor. Duis nulla orci, aliquam sit amet iaculis nec, posuere a nisi. Phasellus congue dapibus libero, ac ullamcorper lectus fringilla in. Curabitur gravida interdum lectus, nec condimentum lectus tristique a. Nunc hendrerit a nunc id fermentum. Praesent ut turpis a ipsum vulputate eleifend. Aenean mollis ipsum nec pretium suscipit. Aliquam erat volutpat.',
  },
  {
    title: `LOVELY HOME DOWNTOWN NAPA, POOL and BIKES!`,
    rating: 0,
    numberOfRatings: 1,
    type: 'Private Room',
    price: 179,
    image: 'https://unsplash.it/350/220/?image=1040',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum maximus sapien felis, eu vestibulum enim maximus id. Phasellus ac lorem id elit laoreet bibendum id ut quam. Nam ligula urna, dapibus nec posuere quis, volutpat vitae ligula. Nunc sed ex tortor. Vivamus in convallis odio, nec dictum turpis. Nulla et turpis non dui sollicitudin faucibus at rhoncus augue. Morbi quis malesuada nisi. Integer non pretium turpis. Nullam vel arcu id lorem dapibus lobortis. Pellentesque volutpat enim sed eros consectetur gravida.\n\nNulla feugiat nisl ligula, at porttitor odio gravida ut. Maecenas congue interdum mauris, id dapibus elit commodo ut. Donec tellus felis, mollis quis faucibus vel, ultrices eget ipsum. Proin sit amet felis accumsan, sollicitudin lacus ut, tempor nulla. Integer eget urna consectetur, condimentum lectus sit amet, convallis sem. Duis nulla sem, pretium non est vitae, varius viverra neque. Vivamus vitae metus vel tortor interdum auctor sit amet et dui. Fusce pellentesque consectetur lobortis. Sed vestibulum placerat rutrum. Quisque molestie leo nec pellentesque interdum. Duis malesuada sapien convallis ante laoreet, quis imperdiet ipsum dictum. Curabitur a ante commodo, dapibus justo in, laoreet odio. Praesent mi diam, aliquet ac magna non, aliquet porta arcu. Fusce ut nulla lorem. Fusce in quam ac ligula feugiat vulputate et vitae nibh. Quisque in finibus arcu.\n\nFusce dignissim nec sem id ullamcorper. Pellentesque accumsan sem vestibulum, cursus est at, consequat ligula. Nulla convallis arcu in suscipit auctor. Duis nulla orci, aliquam sit amet iaculis nec, posuere a nisi. Phasellus congue dapibus libero, ac ullamcorper lectus fringilla in. Curabitur gravida interdum lectus, nec condimentum lectus tristique a. Nunc hendrerit a nunc id fermentum. Praesent ut turpis a ipsum vulputate eleifend. Aenean mollis ipsum nec pretium suscipit. Aliquam erat volutpat.',
  },
  {
    title: `New - Great Location! Affordable`,
    rating: 5,
    numberOfRatings: 46,
    type: 'Entire Home',
    price: 160,
    image: 'https://unsplash.it/350/220/?image=985',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum maximus sapien felis, eu vestibulum enim maximus id. Phasellus ac lorem id elit laoreet bibendum id ut quam. Nam ligula urna, dapibus nec posuere quis, volutpat vitae ligula. Nunc sed ex tortor. Vivamus in convallis odio, nec dictum turpis. Nulla et turpis non dui sollicitudin faucibus at rhoncus augue. Morbi quis malesuada nisi. Integer non pretium turpis. Nullam vel arcu id lorem dapibus lobortis. Pellentesque volutpat enim sed eros consectetur gravida.\n\nNulla feugiat nisl ligula, at porttitor odio gravida ut. Maecenas congue interdum mauris, id dapibus elit commodo ut. Donec tellus felis, mollis quis faucibus vel, ultrices eget ipsum. Proin sit amet felis accumsan, sollicitudin lacus ut, tempor nulla. Integer eget urna consectetur, condimentum lectus sit amet, convallis sem. Duis nulla sem, pretium non est vitae, varius viverra neque. Vivamus vitae metus vel tortor interdum auctor sit amet et dui. Fusce pellentesque consectetur lobortis. Sed vestibulum placerat rutrum. Quisque molestie leo nec pellentesque interdum. Duis malesuada sapien convallis ante laoreet, quis imperdiet ipsum dictum. Curabitur a ante commodo, dapibus justo in, laoreet odio. Praesent mi diam, aliquet ac magna non, aliquet porta arcu. Fusce ut nulla lorem. Fusce in quam ac ligula feugiat vulputate et vitae nibh. Quisque in finibus arcu.\n\nFusce dignissim nec sem id ullamcorper. Pellentesque accumsan sem vestibulum, cursus est at, consequat ligula. Nulla convallis arcu in suscipit auctor. Duis nulla orci, aliquam sit amet iaculis nec, posuere a nisi. Phasellus congue dapibus libero, ac ullamcorper lectus fringilla in. Curabitur gravida interdum lectus, nec condimentum lectus tristique a. Nunc hendrerit a nunc id fermentum. Praesent ut turpis a ipsum vulputate eleifend. Aenean mollis ipsum nec pretium suscipit. Aliquam erat volutpat.',
  },
];

@withNavigation
export default class PlacesList extends React.Component {
  static route = {
    navigationBar: {
      title: 'Napa',
      backgroundColor: 'rgba(255, 255, 255, .5)',
      visible: false,
    },
  };

  _placeHeaderGroups = {};
  _rowAnimations = {};

  constructor(props, context) {
    super(props, context);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      dataSource: ds.cloneWithRows(INITIAL_DATA),
      selectedId: 0,
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          contentContainerStyle={styles.contentContainer}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
        />
      </View>
    );
  }

  _renderRow = (rowData, sectionId, rowId) => {
    this._rowAnimations[rowId] = new Animated.Value(0);
    const rowStyle = {
      transform: [
        {
          translateY: this._rowAnimations[rowId].interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-200, 0, 200],
          }),
        },
      ],
    };
    return (
      <TouchableWithoutFeedback
        key={sectionId + rowId}
        onPress={this._onListItemPress.bind(this, rowData, sectionId, rowId)}>
        <Animated.View style={[styles.listItem, rowStyle]}>
          <SharedElementGroup
            id="place-header"
            ref={g => {
              this._placeHeaderGroups[rowId] = g;
            }}
            configureTransition={() => ({
              timing: Animated.timing,
              easing: Easing.inOut(Easing.ease),
              duration: 500,
            })}
            onTransitionStart={(transitionProps, prevTransitionProps) => {
              const inverse =
                transitionProps.scene.index < prevTransitionProps.scene.index;
              const animations = [];
              const rowInt = parseInt(rowId, 10);
              for (let i = rowInt - 2; i <= rowInt + 2; i++) {
                if (i === rowInt) {
                  continue;
                }
                const anim = this._rowAnimations[i];
                if (anim) {
                  animations.push(
                    Animated.timing(anim, {
                      toValue: inverse ? 0 : i < rowInt ? -1 : 1,
                      duration: 500,
                      useNativeDriver: true,
                    })
                  );
                }
              }

              Animated.parallel(animations).start();
            }}>
            <SharedElement id="image">
              {animation => (
                <Animated.View style={[styles.listImage, animation]}>
                  {
                    <Animated.Image
                      source={{ uri: rowData.image }}
                      style={{ flex: 1 }}
                    />
                  }
                </Animated.View>
              )}
            </SharedElement>
            <SharedElement id="price">
              {animation => (
                <Animated.View style={[styles.priceLabel, animation]}>
                  <Text style={styles.priceLabelText}>
                    ${rowData.price}
                  </Text>
                </Animated.View>
              )}
            </SharedElement>
          </SharedElementGroup>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  _onListItemPress = (rowData, sectionId, rowId) => {
    this.props.navigator.push(
      AppRouter.getRoute('placeDetail', {
        data: rowData,
      }),
      {
        transitionGroup: this._placeHeaderGroups[rowId],
      }
    );
  };

  _getRowData() {
    return INITIAL_DATA;
  }

  _heightForRowAtPath = (sectionId, rowId) => {
    return 216;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 40,
  },
  listItem: {
    paddingBottom: 15,
    alignSelf: 'center',
  },
  listItemBorder: {
    width: Dimensions.get('window').width - 30,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, .25)',
    alignSelf: 'center',
    marginBottom: 15,
  },
  listImage: {
    width: Dimensions.get('window').width - 30,
    height: 201,
  },
  priceLabel: {
    position: 'absolute',
    left: 0,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, .75)',
    paddingVertical: 7.5,
    paddingHorizontal: 10,
  },
  priceLabelText: {
    fontSize: 19,
    textAlign: 'right',
    color: 'white',
  },
});
