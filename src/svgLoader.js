'use strict';

import React from 'react';
import {View} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Use,
  Defs,
  Stop
} from 'react-native-svg';
import xmldom from 'xmldom';
import camelCase from 'lodash.camelcase';

const SvgComponentMap = {
  circle: Circle,
  eelipse: Ellipse,
  g: G,
  linearGradient: LinearGradient,
  radialGradient: RadialGradient,
  line: Line,
  path: Path,
  polygon: Polygon,
  polyline: Polyline,
  rect: Rect,
  svg: Svg,
  symbol: Symbol,
  use: Use,
  defs: Defs,
  stop: Stop
};

function parseSvgDocument (svgString) {
  var cleanedSvgString = svgString.substr(svgString.toLowerCase().indexOf('<svg '), svgString.toLowerCase().indexOf('</svg>') + 6);
  return new xmldom.DOMParser().parseFromString(cleanedSvgString);
}

var uid = 0;

function sanitizeValue (nodeName, value) {
  return value;
}

function styleToAttributes (style) {
  let rules = style.trim().split(';');
  return rules.reduce((styles, rule) => {
    if (rule) {
      let [key, value] = rule.split(':');
      if (key && value) {
        styles[camelCase(key)] = value;
      }
    }
    return styles;
  }, {});
}

function parseNodeAttributes (node) {
  return Array.from(node.attributes).reduce((attributes, {nodeName, nodeValue}) => {
    if (nodeName === 'style') {
      return {
        ...attributes,
        ...styleToAttributes(nodeValue)
      };
    }

    attributes[camelCase(nodeName)] = sanitizeValue(nodeName, nodeValue);
    return attributes;
  }, {});
}

function buildComponentTree (node) {
  const Component = SvgComponentMap[node.nodeName];
  if (!Component) {
    return null;
  }

  return React.createElement(SvgComponentMap[node.nodeName], {
    ...parseNodeAttributes(node),
    key: ++uid,
    children: node.childNodes ? Array.from(node.childNodes).map(buildComponentTree) : null
  });
}

export class SvgContainer extends React.Component {
  state = {
    document: null
  };

  constructor (props) {
    super(props);

    if (props.svg) {
      this.state.document = parseSvgDocument(props.svg);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.svg !== nextProps.svg) {
      this.setState({document: parseSvgDocument(nextProps.svg)});
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
          {React.cloneElement(buildComponentTree(this.state.document.documentElement), props)}
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
