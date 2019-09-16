import React, { Component } from 'react'
import {Map as LeafletMap, TileLayer, Marker, Popup, MapControl, withLeaflet} from 'react-leaflet';
import axios from "axios";
import DatePicker from "react-datepicker";
import Button from "react-bootstrap/Button";
import moment from "moment";
import Alert from "reactstrap/es/Alert";
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

class SearchMap extends MapControl {

    createLeafletElement() {
      return GeoSearchControl({
        provider: new OpenStreetMapProvider(),
        style: 'bar',
        showMarker: false,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: true,
        animateZoom: true,
        keepResult: false,
        searchLabel: 'search'
      });
    }
}

function SearchForm(props) {
    return (
        <form noValidate onSubmit={props.onSubmit}>

            <div className="form-group">
                <label htmlFor="name"><b>Start date</b></label><br/>
                <DatePicker
                    name="start_date"
                    selected={props.start_date}
                    onChange={props.handleChangeStart}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                />
            </div>
            <div className="form-group">
                <label htmlFor="name"><b>End date</b></label><br/>
                <DatePicker
                    name="end_date"
                    selected={props.end_date}
                    onChange={props.handleChangeEnd}
                    dateFormat="dd/MM/yyyy"
                    minDate={props.start_date}
                />
            </div>
        </form>
    );
}

    class Map extends Component {
    constructor(props) {
        super()
        this.state = {
            posts: [],
            start_date: new Date(),
            end_date: new Date(),
            invalid: 0,
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
        const { name, value } = e.target;
        this.setState({[name]: value});

    }

     componentDidMount() {
         this.setState({invalid: 0});
                  axios.defaults.withCredentials = true;
                  axios.put('http://127.0.0.1:5000/followed_posts',
                      {
                          start_date: this.state.start_date,
                          end_date: this.state.end_date
                        })
         .then(res => {
                 this.setState({
                     posts: res.data.posts
                 })
             console.log(res.data.posts);
         }) .catch(err => {
                    console.log(err)
                    this.setState({invalid: 1});
                });
  }

  onSubmit(e) {
      e.preventDefault();
      this.componentDidMount();
  }
  render() {
         const SearchBar = withLeaflet(SearchMap);
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
       <link  href="https://unpkg.com/leaflet-geosearch@latest/assets/css/leaflet.css" rel="stylesheet" />
        <div class="right col-md-3 mt-4 mx-auto">
            <h1 className="h3 mb-3 font-weight-normal"><b>Find Partners</b></h1>
            {/*<p className="h8 mb-3 font-weight-normal">When are you planning on traveling?</p>*/}
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
                             />
                         <Button variant="primary" onClick={this.onSubmit.bind(this)}>Submit</Button>
            <br/><br/>
            <h10 className="h8 mb-3 font-weight-normal">Submit your start and end dates, and then look for your wanted locations on the map.</h10>

        </div>
           <div className="col-md-10 mt-4 mx-auto left">
            <LeafletMap
                center={[this.state.lat, this.state.long]}
                zoom={6}
                maxZoom={20}
                attributionControl={true}
                zoomControl={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                dragging={true}
                animate={true}
                easeLinearity={0.35}
                enableHighAccuracy={true}
              >
                        <SearchBar />
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