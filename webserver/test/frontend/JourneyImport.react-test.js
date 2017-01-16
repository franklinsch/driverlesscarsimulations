import React from 'react';
import JourneyImport from '../../frontend/components/Main/ControlPanel/JourneySettings/JourneyImport';
import renderer from 'react-test-renderer';

test('Valid journeys can be imported', () => {
  const component = renderer.create(
    <JourneyImport/>
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  
  var journeys = [{
    objectID: 0,
    origin: {
      lat: 0,  
      lng: 0
    },
    destination: {
      lat: 0,
      lng: 0
    }
  }, {
    objectID: 0,
    origin: {
      lat: 0,  
      lng: 0
    },
    destination: {
      lat: 0,
      lng: 0
    }
  }]

  expect(_toJourneys(journeys)).to.not.throw(Error);
})
