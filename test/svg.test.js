import {shallow, mount} from 'enzyme';
import React from 'react';
import {SvgContainer} from '../src/svgLoader';
import Svg, {Circle} from 'react-native-svg';

test('svg string to components', () => {
  const svgString = `
    <svg height="100" width="100">
      <circle cx="50px" cy="50px" r="40px" stroke="green" stroke-width="4" />
    </svg>
  `;

  const component = shallow(<SvgContainer svg={svgString} />);

  expect(component.children(Svg).props()).toMatchObject({
    height: '100',
    width: '100'
  });

  expect(component.children(Svg).children(Circle).props()).toMatchObject({
    cx: '50px',
    cy: '50px',
    r: '40px',
    stroke: 'green',
    strokeWidth: '4'
  });
});

test('interpet styles', () => {
  const svgString = `
    <svg width="100" height="100">
      <defs>
        <style>
          #circle {fill: blue; }
          #circle {stroke-width: 5px;}
          .circle {fill: orange; }
        </style>
      </defs>
      <circle id="circle" class="a circle" cx="50px" cy="50" r="40px" stroke="green" stroke-width="4"  />
    </svg>
  `;

  const component = shallow(<SvgContainer svg={svgString} />);

  expect(component.children(Svg).children(Circle).props()).toMatchObject({
    fill: 'orange'
  });

});
