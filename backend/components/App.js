import React, { PropTypes } from 'react';
import {Map, View, Feature, source, layer, geom} from 'ol-react';

export default class App extends React.Component {

    static propTypes = {

    };

    render() {
        return (
            <Map view=<View resolution={10000} center={[0, 0]}/>>
                <layer.Tile>
                    <source.OSM />
                </layer.Tile>
                <layer.Vector>
                    <source.Vector>
                        <Feature style={{stroke: {color: [255, 0, 0, 1]}}}>
                            <geom.LineString>
                                {[[0, 0], [100000, 0], [100000, 100000], [0, 100000]]}
                            </geom.LineString>
                        </Feature>
                    </source.Vector>
                </layer.Vector>
            </Map>
        );
    }
}
