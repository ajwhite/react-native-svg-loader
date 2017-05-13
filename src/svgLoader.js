'use strict';

import React from 'react';
import {View} from 'react-native';

import {parseSvgDocument, parseStylesheet, buildComponentTree} from './parser';
export class SvgContainer extends React.Component {
  state = {
    document: null,
    styles: null
  };

  constructor (props) {
    super(props);

    if (props.svg) {
      this.state.document = parseSvgDocument(props.svg);
      this.state.styles = parseStylesheet(this.state.document);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.svg !== nextProps.svg) {
      let document = parseSvgDocument(nextProps.svg);
      let styles = parseStylesheet(document);
      this.setState({document, styles});
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.props !== nextProps && this.state !== nextState;
  }

  render() {
    var {svg, style, ...props} = this.props;

    if (this.state.document) {
      return (
        <View style={style}>
          {React.cloneElement(buildComponentTree(this.state.document.documentElement, this.state.styles), props)}
        </View>
      );
    }
  }
}

export default class SvgLoader extends React.Component {

  constructor (props) {
    super(props);
  }

  componentWillMount () {

  }

  componentWillReceiveProps (nextProps) {
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state !== nextState || this.props !== nextProps;
  }

  render() {
    return (
      <SvgContainer {...this.props} svg={this.props.svg} />
    );
  }
}
