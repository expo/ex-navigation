/**
 * @providesModule PlacesList
 */

import React from 'react';
import findNodeHandle from 'react/lib/findNodeHandle';
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
  UIManager,
  LayoutAnimation,
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
  },
  {
    title: `Studio sleeps four at Napa's finest resort`,
    rating: 5,
    numberOfRatings: 9,
    type: 'Entire Home',
    price: 130,
    image: 'https://unsplash.it/350/220/?image=1051',
  },
  {
    title: `LOVELY HOME DOWNTOWN NAPA, POOL and BIKES!`,
    rating: 0,
    numberOfRatings: 1,
    type: 'Private Room',
    price: 179,
    image: 'https://unsplash.it/350/220/?image=1040',
  },
  {
    title: `New - Great Location! Affordable`,
    rating: 5,
    numberOfRatings: 46,
    type: 'Entire Home',
    price: 160,
    image: 'https://unsplash.it/350/220/?image=985',
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
  }

  constructor(props, context) {
    super(props, context);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      dataSource: ds.cloneWithRows(INITIAL_DATA),
    };
    this._cellElements = {};
    this._placeHeaderGroups = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          ref={c => { this._listView = c; }}
          contentContainerStyle={styles.contentContainer}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator}
        />
      </View>
    );
  }

  _renderRow = (rowData, sectionId, rowId) => {
    return (
      <TouchableWithoutFeedback
        key={sectionId + rowId}
        ref={c => { this._cellElements[rowId] = c; }}
        onPress={this._onListItemPress.bind(this, rowData, sectionId, rowId)}>
        <View style={styles.listItem}>
          <SharedElementGroup
            id="place-header"
            route={this.props.route}
            ref={g => { this._placeHeaderGroups[rowId] = g; }}
            configureTransition={() => ({
              timing: Animated.timing,
              easing: Easing.inOut(Easing.ease),
              duration: 750,
            })}
            sceneAnimations={({ position, scene }) => {
              const index = scene.index;
              const inputRange = [index - 1, index, index + 1];

              const opacity = position.interpolate({
                inputRange,
                outputRange: [0, 1, 0],
              });

              return {
                opacity,
              };
            }}>
            <SharedElement id="image">
              {(animation) => (
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
              {(animation) => (
                <Animated.View style={[styles.priceLabel, animation]}>
                  <Text style={styles.priceLabelText}>
                    ${rowData.price}
                  </Text>
                </Animated.View>
              )}
            </SharedElement>
          </SharedElementGroup>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _renderSeparator = (rowData, sectionId, rowId) => {
    return <View key={sectionId + rowId} style={styles.listItemBorder} />;
  };

  _onListItemPress = (rowData, sectionId, rowId) => {
    this.props.navigator.push(
      AppRouter.getRoute('placeDetail', {
        data: rowData,
      }), {
        transitionGroup: this._placeHeaderGroups[rowId],
      }
    );
  };

  _rowsWithPressedRow(rowId) {
    const rowData = this._getRowData();
    return this.state.dataSource.cloneWithRows(rowData.map((r, i) => {
      let newR = { ...r };
      if (i === parseInt(rowId, 10)) {
        newR = { ...newR, isSelected: true };
      }
      return newR;
    }));
  }

  _getRowData() {
    return INITIAL_DATA;
  }

  _heightForRowAtPath = (sectionId, rowId) => {
    return 216;
  }
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
