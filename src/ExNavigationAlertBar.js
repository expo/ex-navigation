/**
 * @providesModule ExNavigationAlertBar
 */

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

const ALERT_DISPLAY_TIME_MS = 6000;
const ALERT_TEXT_VERTICAL_MARGIN = 12;
const ALERT_TEXT_HORIZONTAL_MARGIN = 8;

@reactMixin(TimerMixin)
export default class ExNavigationAlertBar extends React.Component {
  state = {
    isVisible: false,
    yOffset: new Animated.Value(-500),
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.alertState && this.props.alertState) {
      console.log({exNavigationAlertBar: true, alertState: this.props.alertState});
      this._show();
    } else if (prevProps.alertState && !this.props.alertState) {
      console.log({exNavigationAlertBar: true, alertState: prevProps.alertState});
      this._hide();
    } else if (prevProps.alertState !== this.props.alertState) {
      this._maybeRestartTimeout();
      console.log({exNavigationAlertBar: true, message: 'change text'});
    } else {
      console.log({exNavigationAlertBar: true, message: 'no alert state changes'});
    }
  }

  render() {
    if (!this.state.isVisible) {
      return <View />;
    }

    let backgroundColor, message;
    let { alertState } = this.props;

    if (!alertState) {
      backgroundColor = 'black';
      message = '';
    } else {
      let { options } = alertState;
      backgroundColor = options.backgroundColor || 'black';
      message = alertState.message;
    }

    let dynamicStyles = {
      backgroundColor,
      transform: [{translateY: this.state.yOffset}],
    };

    return (
      <TouchableWithoutFeedback onPress={this._hide}>
        <Animated.View style={[styles.alertBar, dynamicStyles, this.props.style]}>
          <View
            style={styles.alertBarInnerContainer}
            onLayout={this._onLayout}
            ref={view => { this._textContainerRef = view; }}>
            <Text style={styles.alertText}>
              {message}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  _onLayout = (e) => {
    /* a bug in react-native causes measure results to be undefined
     * if we don't call onLayout, but we don't actually need to do
     * anything with these results */
  }

  _show = () => {
    this.setState({isVisible: true}, () => {
      this.requestAnimationFrame(() => {
        this._textContainerRef && this._textContainerRef.measure((l, t, w, height) => {
          this._animateIn(height);
          this._timeout = this.setTimeout(this._dispatchHide, ALERT_DISPLAY_TIME_MS);
        });
      });
    });
  }

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
  }

  _maybeRestartTimeout = () => {
    if (this._timeout) {
      this.clearTimeout(this._timeout);
    }

    this._timeout = this.setTimeout(this._dispatchHide, ALERT_DISPLAY_TIME_MS);
  }

  _dispatchHide = () => {
    this.props.getNavigatorContext().hideLocalAlert();
  }

  _animateIn(textHeight) {
    textHeight += ALERT_TEXT_VERTICAL_MARGIN * 2;

    Animated.timing(this.state.yOffset, {
      fromValue: -textHeight,
      toValue: 0,
      easing: Easing.inOut(Easing.linear),
      duration: 200,
    }).start();
  }

  _animateOut(textHeight) {
    textHeight += ALERT_TEXT_VERTICAL_MARGIN * 2;

    Animated.timing(this.state.yOffset, {
      toValue: -textHeight,
      easing: Easing.inOut(Easing.linear),
      duration: 150,
    }).start(result => {
      this.setState({isVisible: false});
    });
  }
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  alertBar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
