import React, { Component } from 'react';
import MapComp from "./MapComp";
import 'leaflet/dist/leaflet.css'

const divStyle = {
    height:'20px',
    width:'20px',
    display: "block"
};


class MapContainer extends Component {

    render() {
        return(
            <div >
                <h1>Search for a partner</h1>
                <MapComp></MapComp>

            </div>

        )
    }
}

export default MapContainer