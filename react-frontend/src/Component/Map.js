import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import jwt_decode from "jwt-decode";
import axios from "axios";
import DatePicker from "react-datepicker";
import ModalBody from "reactstrap/es/ModalBody";
import Button from "react-bootstrap/Button";
import ModalFooter from "reactstrap/es/ModalFooter";

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
}

function SearchForm(props) {
    return (
        <form noValidate onSubmit={props.onSubmit}>

            <div className="form-group">
                <label htmlFor="name">Start date</label><br></br>
                <DatePicker
                    name="start_date"
                    selected={props.start_date}
                    onChange={props.handleChangeStart}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                />
            </div>
            <div className="form-group">
                <label htmlFor="name">End date</label><br></br>
                <DatePicker
                    name="end_date"
                    selected={props.end_date}
                    onChange={props.handleChangeEnd}
                    dateFormat="dd/MM/yyyy"
                    minDate={props.start_date}
                />
            </div>
            <br/>
            <label htmlFor="name">Country</label>
            <input
                type="text"
                className="form-control"
                name="country"
                placeholder="Enter country name"
                value={props.country}
                onChange={props.onChange}
                noValidate
            />
            {props.errors.country.length > 0 &&
            <span className='error'>{props.errors.country}</span>}
            <br/>
            <label htmlFor="name">City</label>
            <input
                type="text"
                className="form-control"
                name="city"
                placeholder="Enter city name"
                value={props.city}
                onChange={props.onChange}
                noValidate
            />
            {props.errors.city.length > 0 ?
                <span className='error'>{props.errors.city}</span> :
                props.location_invalid > 0 ?
                    <span className='error'>This location is invalid</span> : <p/>}
            <br/>
        </form>
    );
}

    class Map extends Component {
    constructor(props) {
        super()
        this.state = {
            posts: [],
            city: '',
            country: '',
            start_date: new Date(),
            end_date: new Date(),
            map_flag: false,
            errors: {
                country: 'This field is required',
                city: 'This field is required'

            },
            invalid: 0,
            location_invalid: 0,
            lat: 0,
            long: 0

        }
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)

    }
     handleChangeStart = date => {
        this.setState({start_date: date});
        if (date > this.state.end_date)
            this.setState({end_date: date});
  };
    handleChangeEnd = date => {
    this.setState({end_date: date}
    );
  };

     onChange(e) {
         let errors = this.state.errors;
        const { name, value } = e.target;

        switch (name) {
              case 'country':
                errors.country =
                  value.length < 1
                    ? 'This field is required'
                    : '';
                break;
                case 'city':
                errors.city =
                  value.length < 1
                    ? 'This field is required'
                    : '';
                break;
              default:
                break;
        }
        this.setState({errors, [name]: value});

    }

     componentDidMount() {
  }

  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});
    this.setState({location_invalid: 0});


     if (validateForm(this.state.errors)) {
                  axios.defaults.withCredentials = true;
                  axios.put('http://127.0.0.1:5000/followed_posts',
                      {country: this.state.country,
                          city: this.state.city,
                          start_date: this.state.start_date,
                          end_date: this.state.end_date
                        })
         .then(res => {
             if (res == 'Bad Location'){
                 this.setState({location_invalid: 1});
                 this.setState({invalid: 1});
             }
             else{
                 this.setState({
                     posts:res.data.posts,
                     map_flag: true,
                     lat: res.data.latitude,
                     long: res.data.longitude
                 })
             }
         }) .catch(err => {
                    console.log(err)
                    this.setState({invalid: 1});
                });
     }
     else{
         this.setState({invalid: 1});
     }
  }

  render() {
    return (
        <div className="col-md-10 mt-4 mx-auto"> <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css"/>
            {!this.state.map_flag &&   <SearchForm
                                 onChange={this.onChange}
                                 handleChangeStart={this.handleChangeStart}
                                 handleChangeEnd={this.handleChangeEnd}
                                 onSubmit={this.onSubmit}
                                 start_date={this.state.start_date}
                                 end_date={this.state.end_date}
                                 country={this.state.country}
                                 city={this.state.city}
                                 errors={this.state.errors}
                                 location_invalid={this.state.location_invalid}
                             />}
                              {!this.state.map_flag &&   <Button variant="primary" onClick={this.onSubmit.bind(this)}>Search</Button>}

            {this.state.map_flag && <LeafletMap
        center={[50, 10]}
        zoom={6}
        maxZoom={10}
        attributionControl={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        animate={true}
        easeLinearity={0.35}
      >
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <Marker position={[50, 10]}>
          <Popup>
            Popup for any custom information.
          </Popup>
        </Marker>
      </LeafletMap>}
        </div>
    );
  }
}

export default Map