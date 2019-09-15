import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import jwt_decode from "jwt-decode";
import axios from "axios";
import DatePicker from "react-datepicker";
import ModalBody from "reactstrap/es/ModalBody";
import Button from "react-bootstrap/Button";
import ModalFooter from "reactstrap/es/ModalFooter";
import moment from "moment";
import Alert from "reactstrap/es/Alert";

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
            <label htmlFor="name">Country</label>
            <input
                type="text"
                className="form-control"
                name="country"
                placeholder="Country"
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
                placeholder="City"
                value={props.city}
                onChange={props.onChange}
                noValidate
            />
            {props.errors.city.length > 0 ?
                <span className='error'>{props.errors.city}</span> :
                props.location_invalid > 0 ?
                    <span className='error'>This location is invalid<br/></span> : <p/>}
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
            errors: {
                country: 'This field is required',
                city: 'This field is required'

            },
            invalid: 0,
            location_invalid: 0,
            lat: 35.0015196,
            long: 30.8760272

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
             if (res.data == 'Bad Location'){
                 this.setState({location_invalid: 1});
                 this.setState({invalid: 1});
             }
             else{
                 this.setState({
                     posts: res.data.posts,
                     lat: res.data.latitude,
                     long: res.data.longitude
                 })
             }
             console.log(res.data.posts);
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
          let posts =  this.state.posts.map((post,idx) => {
            return (
                <Marker key={`marker-${idx}`} position={[post.latitude, post.longitude]}>
                  <Popup>
                      <div className="card text-center">
                        <div className="card-header">
                             <img  className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + post.image_file}
                                               height="60" width="60"
                            />
                             <a href={"/users/"+post.user_id}>{'     '+post.username}</a>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title"><b>{post.title}</b></h5>
                            <p className="card-text"><b>Start Date:</b> {moment(post.start_date).format("LL")}</p>
                            <p className="card-text"><b>End Date:</b> {moment(post.end_date).format("LL")}</p>
                            <p className="card-text">{post.content}</p>
                        </div>
                    </div>
                  </Popup>
                </Marker>

            );
        });
    return (
        <div id="wrapper"> <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css"/>
        <div class="right col-md-3 mt-4 mx-auto">
            <h1 className="h3 mb-3 font-weight-normal">Find Partners</h1>
              <div className="form-group">
                  {this.state.invalid >0 &&  <Alert color="danger">
                  Your search attempt is invalid. Please try again!
                </Alert> }
              </div>
                    <SearchForm
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
                             />
                         <Button variant="primary" onClick={this.onSubmit.bind(this)}>Search</Button>
        </div>
           <div className="col-md-10 mt-4 mx-auto left">
            <LeafletMap
                center={[this.state.lat, this.state.long]}
                zoom={6}
                maxZoom={10}
                attributionControl={true}
                zoomControl={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                dragging={true}
                animate={true}
                easeLinearity={0.35}
                enableHighAccuracy={false}
              >
                <TileLayer
                  url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />
                {posts}
              </LeafletMap>
           </div>
                </div>
    );
  }
}

export default Map