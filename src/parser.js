import React from 'react';
import xmldom from 'xmldom';
import cssJson from 'cssjson';
import camelCase from 'lodash.camelcase';


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


const maybe = obj => obj ? obj : {};

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

const getIdAttribute = node => Array.from(node.attributes).find(attribute => attribute.nodeName === 'id');

const getAttributeValue = (node, attributeName) => maybe(Array.from(node.attributes).find(attribute => attribute.nodeName === attributeName)).nodeValue;

const getNodeId = node => getAttributeValue(node, 'id');
const getNodeClass = node => getAttributeValue(node, 'class');

function stylesForNode (node, styles) {
  if (!styles) {
    return {};
  }
  return Object.keys(styles.children).filter(selector => {
    if (selector.indexOf('#') === 0) {
      return getNodeId(node) === selector.substr(1);
    } else if (selector.indexOf('.') === 0) {
      let classNames = getNodeClass(node);
      if (classNames) {
        let classes = classNames.split(' ');
        return classes.filter(className => className.trim() === selector.substr(1));
      }
    }
    return false;
  }).reduce((rules, selector) => {
    var rule = Object.keys(styles.children[selector].attributes).reduce((style, prop) => {
      style[camelCase(prop)] = styles.children[selector].attributes[prop];
      return style
    }, {});

    return {
      ...rules,
      ...rule
    }
  }, {})
}

function findNodeType (node, target) {
  if (node.nodeName === target) {
    return node;
  }

  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      let child = findNodeType(node.childNodes[i], target);
      if (child) {
        return child;
      }
    }
  }

  return null;
}

export function parseSvgDocument (svgString) {
  var cleanedSvgString = svgString.substr(svgString.toLowerCase().indexOf('<svg '), svgString.toLowerCase().indexOf('</svg>') + 6);
  return new xmldom.DOMParser().parseFromString(cleanedSvgString);
}

export function buildComponentTree (node, styles) {
  const Component = SvgComponentMap[node.nodeName];
  if (!Component) {
    return null;
  }

  console.log('node', node.nodeName, stylesForNode(node, styles))

  return React.createElement(SvgComponentMap[node.nodeName], {
    ...stylesForNode(node, styles),
    ...parseNodeAttributes(node),
    key: ++uid,
    children: node.childNodes ? Array.from(node.childNodes).map(child => buildComponentTree(child, styles)) : null
  });
}

export function parseStylesheet (document) {
  var styleDocument = findNodeType(document, 'style');
  if (styleDocument) {
    return cssJson.toJSON(styleDocument.firstChild.nodeValue);
  }
  return null;
}
