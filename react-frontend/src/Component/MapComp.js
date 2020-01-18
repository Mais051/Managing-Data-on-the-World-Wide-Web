import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import React, { Component } from 'react';
import L from "leaflet";
import * as ELG from "esri-leaflet-geocoder";
import { Map, TileLayer, Marker, Popup }  from "react-leaflet";
//import "../Css/Map.css";
import Register from "./Register";



delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
});




class MapComp extends Component{
    state = {
        lat: 51.505,
        lng: -0.09,
        zoom: 13,
    }
    componentDidMount() {
        const map = this.leafletMap.leafletElement;
        map.setView([0, 0], 0);
        const searchControl = new ELG.Geosearch().addTo(map);
        const results = new L.LayerGroup().addTo(map);

        searchControl.on("results", function(data) {
            results.clearLayers();
            for (let i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });
    }


    render() {
        const position = [this.state.lat, this.state.lng]
        const center = [37.7833, -122.4167];
        return (
            <div className="container" style={{ height: '100vh', width: '100%' }}>
            <Map  style={{ height: '100vh', width: '100%' }}
                  center={center}
                 zoom="100"
                  ref={m => {
                      this.leafletMap = m;
                  }}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </Map>
            </div>
        )
    }
}
export default MapComp