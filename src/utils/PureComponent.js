import { Component } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';

export default class PureComponent extends Component {}
PureComponent.prototype.shouldComponentUpdate = function(nextProps, nextState) {
  return (
    !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
  );
};
