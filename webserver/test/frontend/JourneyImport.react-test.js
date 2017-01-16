import React from 'react';
import JourneyImport from '../../frontend/components/Main/ControlPanel/JourneySettings/JourneyImport';
import renderer from 'react-test-renderer';

test('Valid journeys can be imported', () => {
  const component = renderer.create(
    <JourneyImport/>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  
  const journeys = [{
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

test('Journeys with invalid properties cannot be imported', () => {
  const component = render.create(
    <JourneyImport/>
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const journeys = [{
    objectID: 0,
    foo: {
      lat: 2,
      lng: 2
    }
  }]

  expect(_toJourneys(journeys)).to.throw(Error);
})

test('Journeys with missing origin cannot be imported', () => {
  const component = render.create(
    <JourneyImport/>
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const journeys = [{
    objectID: 0,
    destination: {
      lat: 2,
      lng: 2
    }
  }]

  expect(_toJourneys(journeys)).to.throw(Error);
})

test('Journeys with missing destination cannot be imported', () => {
  const component = render.create(
    <JourneyImport/>
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const journeys = [{
    objectID: 0,
    origin: {
      lat: 2,
      lng: 2
    }
  }]

  expect(_toJourneys(journeys)).to.throw(Error);
})
