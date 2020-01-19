import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup }  from "react-leaflet";
//import { ReactLeaflet } from 'react-leaflet'
import ReactDOM from 'react-dom'
import 'leaflet/dist/leaflet.css'
import axios from "axios";
import L from 'leaflet';
import LocationSearch from './LocationSearch';


import PostItem from "./PostItem";
import jwt_decode from "jwt-decode";
import FormContent from "./FormContent";
import DatePicker from "react-datepicker";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

class MapComp extends Component {
    constructor() {
        super()
        this.state = {
            latitude: 51.505,
            longitude: -0.09,
            address:'',
            zoom: 13,
            posts:[],
            all_posts:[],
            search: false,
            start_date: new Date(),
            end_date: new Date(),
            radius: 0,
            current_user:0,
            isDates:0
        }
    }
    handleChange_start = date => {
        this.setState({
            start_date: date
        });
    };
    handleChange_end = date => {
        this.setState({
            end_date: date
        });
    };

    onChangeRadius(e){
        this.setState({radius:e.target.value});
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    onSubmit(e){
        e.preventDefault();
        this.setState({search: true});

    }

    componentDidMount() {
        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.setState({
                current_user: decoded.identity.id
            });
        }
        axios.get('http://127.0.0.1:5000/posts/'+ this.props.match.params.id)
            .then(response => {
                this.setState({posts: response.data.posts}, () => {
                })
            })
            .catch(err => console.log(err));
        axios.get('http://127.0.0.1:5000/all_posts/'+ this.props.match.params.id)
            .then(response => {
                this.setState({all_posts: response.data.posts}, () => {
                })
            })
            .catch(err => console.log(err));
    }
    myCallBack = (dataFromChild,address) => {
        console.log("dataFromChild = ",dataFromChild);
        this.setState({latitude: dataFromChild['lat'],longitude: dataFromChild['lng']});
        this.setState({address:address})
    };

    clearSearch(e){
        this.setState({search:false,radius: 0,isDates:false});
    }

    toRad(num){
        return num * Math.PI / 180;
    }

    checkRadius(post) {
        if(this.state.radius === 0)
            return true;
        console.log("post.longitude = ", post.longitude);
        console.log("this.state.lng = ", this.state.longitude);
        const R = 6371e3; // metres
        const lat1Rad = this.toRad(this.state.latitude);
        const lat2Rad = this.toRad(post.latitude);

        const latDeltRad = this.toRad(post.latitude-this.state.latitude);
        const lngDeltRad = this.toRad(post.longitude-this.state.longitude);

        const a = Math.sin(latDeltRad/2) * Math.sin(latDeltRad/2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(lngDeltRad/2) * Math.sin(lngDeltRad/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R * c;

        console.log("distance = ", d);
        if(d <= this.state.radius)
            return true;
        return false;
    }

    checkDates(post){
        if(!this.state.isDates)
            return true;
        console.log("post by title: ", post.title);
        const this_start_date = new Date(this.state.start_date).getTime();
        const this_end_date = new Date(this.state.end_date).getTime();
        const post_end_date = new Date(post.end_date).getTime();
        const post_start_date = new Date(post.start_date).getTime();
        if(this_start_date <= post_end_date) {
            return this_end_date >= post_start_date;
        }
        return false;
    }

    render() {
        const markers = this.state.posts.map((post, i) => {
            if(this.props.match.params.id != post.user_id){
                return(

                    <Marker key={post.id} position={[post.latitude,post.longitude]}>
                        <Popup>
                            <span>{post.title}<br/>{post.address}<br/>From: {post.start_date}<br/>Until: {post.end_date}</span>
                        </Popup>
                    </Marker>
                )
            }
        });
        const searchedMarkers = this.state.all_posts.map((post,i)=>{
            console.log("post title = ", post.title);
           if(this.state.search && this.props.match.params.id != post.user_id &&
               this.checkRadius(post) && this.checkDates(post)) {
               return(
                   <Marker key={post.id} position={[post.latitude,post.longitude]}>
                       <Popup>
                           <span>{post.title}<br/>{post.address}<br/>From: {post.start_date}<br/>Until: {post.end_date}</span>
                       </Popup>
                   </Marker>
               )
           }
        });

        const position = [this.state.latitude, this.state.longitude];

        return (
            <div>
                <h1>Search for a partner</h1>
                <LocationSearch callbackFromParent={this.myCallBack}></LocationSearch>

                <form noValidate onSubmit={this.onSubmit.bind(this)}>
                    <div className="form-group">
                    <label>
                        Search dates:
                        <input
                            name="isDates"
                            type="checkbox"
                            checked={this.state.isDates}
                            onChange={this.handleInputChange.bind(this)} />
                    </label>
                    </div>
                    {this.state.isDates && <div className="form-group">
                        <label htmlFor="name">Start Date</label><br/>
                        <DatePicker
                            name="start_date"
                            selected={this.state.start_date}
                            onChange={this.handleChange_start}
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>}
                    {this.state.isDates && <div className="form-group">
                        <label htmlFor="name">End Date</label><br/>
                        <DatePicker
                            name="end_date"
                            selected={this.state.end_date}
                            onChange={this.handleChange_end}
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>}
                    <div className="form-group">
                        <label htmlFor="longitude">Radius</label>
                        <input
                            type="number"
                            step="any"
                            className="form-control"
                            name="radius"
                            placeholder="Radius"
                            value={this.state.radius}
                            onChange={this.onChangeRadius.bind(this)}
                            noValidate
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-lg btn-primary btn-block"
                    >
                        Search!
                    </button>
                </form>

                <button onClick={this.clearSearch.bind(this)}>Clear Search</button>
                <Map center={position} zoom={this.state.zoom}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    {markers}
                    {searchedMarkers}
                </Map>
            </div>
        );
    }
}


//ReactDOM.render(<MapComp />, document.getElementById('container'));
export default MapComp