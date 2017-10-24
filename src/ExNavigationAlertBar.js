/* @flow */

import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { decorate as reactMixin } from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import exNavConnect from './ExNavigationConnect';

type AlertState = {
  options: {
    container: Object | number,
    text: Object | number,
  },
  message: string,
};

type Props = {
  alertState: ?AlertState,
  navigatorUID: any,
};

type State = {
  isVisible: boolean,
  yOffset: any,
  currentAlertState: ?AlertState,
};

const ALERT_DISPLAY_TIME_MS = 6000;
const ALERT_TEXT_VERTICAL_MARGIN = 12;
const ALERT_TEXT_HORIZONTAL_MARGIN = 8;

@exNavConnect((data, props) => ExNavigationAlertBar.getDataProps(data, props))
@reactMixin(TimerMixin)
export default class ExNavigationAlertBar extends React.Component {
  _textContainerRef: View;
  requestAnimationFrame: () => void;
  setTimeout: () => number;
  clearTimeout: (timerId: number) => void;
  _timeout: number;

  static getDataProps(data: any, props: Props) {
    let { alerts } = data.navigation;
    let alertState = alerts[props.navigatorUID];

    return {
      alertState,
    };
  }

  state: State = {
    isVisible: false,
    yOffset: new Animated.Value(-500),
    currentAlertState: null,
  };

  componentWillReceiveProps(nextProps: Props) {
    // note(brentvatne): we save this in state so that when the store updates
    // to hide the alert we don't have to do some janky shouldComponentUpdate
    // business to make sure that the text/styles remain the same until
    // the animation is completed
    if (
      (!this.props.alertState && nextProps.alertState) ||
      (this.props.alertState &&
        nextProps.alertState &&
        this.props.alertState !== nextProps.alertState)
    ) {
      this.setState({ currentAlertState: nextProps.alertState });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.alertState && this.props.alertState) {
      this._show();
    } else if (prevProps.alertState && !this.props.alertState) {
      this._hide();
    } else if (prevProps.alertState !== this.props.alertState) {
      this._maybeRestartTimeout();
    } else {
      // No changes that we need to concern ourselves with
    }
  }

  render() {
    if (!this.state.isVisible) {
      return <View />;
    }

    let { currentAlertState } = this.state;
    let containerStyleOptions, textStyleOptions, message;

    if (currentAlertState) {
      let { options } = currentAlertState;
      containerStyleOptions = options.container;
      textStyleOptions = options.text;
      message = currentAlertState.message;
    }

    return (
      <View style={styles.overflowContainer}>
        <TouchableWithoutFeedback onPress={this._dispatchHide}>
          <Animated.View
            style={[
              { transform: [{ translateY: this.state.yOffset }] }, // Animated styles
              styles.alertBar, // Default styles
              this.props.style, // This is necessary to take into account the appbar visibility
              containerStyleOptions, // Configurable styles when presenting the alert
            ]}>
            <View
              style={styles.alertBarInnerContainer}
              onLayout={this._onLayout}
              ref={view => {
                this._textContainerRef = view;
              }}>
              <Text style={[styles.alertText, textStyleOptions]}>
                {message}
              </Text>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _onLayout = (e: any) => {
    /* a bug in react-native causes measure results to be undefined
     * if we don't call onLayout, but we don't actually need to do
     * anything with these results */
  };

  _show = () => {
    const { currentAlertState } = this.state;
    const { options } = currentAlertState;
    const duration = options.duration || ALERT_DISPLAY_TIME_MS;

    this.setState({ isVisible: true }, () => {
      this.requestAnimationFrame(() => {
        this._textContainerRef &&
          this._textContainerRef.measure((l, t, w, height) => {
            this._animateIn(height);
            this._timeout = this.setTimeout(this._dispatchHide, duration);
          });
      });
    });
  };

  _hide = () => {
    if (!this._textContainerRef || !this._textContainerRef.measure) {
      return;
    }

    if (this._timeout) {
      this.clearTimeout(this._timeout);
    }

    // Sometimes textHeight is incorrect here, so measure again.
    this._textContainerRef.measure((l, t, w, height) => {
      this._animateOut(height);
    });
  };

  _maybeRestartTimeout = () => {
    if (this._timeout) {
      this.clearTimeout(this._timeout);
    }

    this._timeout = this.setTimeout(this._dispatchHide, ALERT_DISPLAY_TIME_MS);
  };

  _dispatchHide = () => {
    if (this._textContainerRef) {
      this.props.getNavigatorContext().hideLocalAlert();
    }
  };

  _animateIn(textHeight: number) {
    textHeight += ALERT_TEXT_VERTICAL_MARGIN * 2;

    Animated.timing(this.state.yOffset, {
      fromValue: -textHeight,
      toValue: 0,
      easing: Easing.inOut(Easing.linear),
      duration: 200,
    }).start();
  }

  _animateOut(textHeight: number) {
    textHeight += ALERT_TEXT_VERTICAL_MARGIN * 2;

    Animated.timing(this.state.yOffset, {
      toValue: -textHeight,
      easing: Easing.inOut(Easing.linear),
      duration: 150,
    }).start(result => {
      this.setState({ isVisible: false });
    });
  }
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  overflowContainer: {
    overflow: 'hidden',
    elevation: 0,
  },
  alertBar: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  alertBarInnerContainer: {
    paddingVertical: ALERT_TEXT_VERTICAL_MARGIN,
  },
  alertText: {
    marginHorizontal: ALERT_TEXT_HORIZONTAL_MARGIN,
    width: WINDOW_WIDTH - ALERT_TEXT_HORIZONTAL_MARGIN * 2,
    color: '#fff',
    textAlign: 'center',
  },
});
