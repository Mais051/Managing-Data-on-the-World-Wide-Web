
import FormModal from "./FormModal";
import {Link} from "react-router-dom";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import React, { Component } from 'react'
import L from  'leaflet';
import esri from 'esri-leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import { Map, TileLayer } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import LocationSearch from "./LocationSearch";
//import "../Css/Map.css";

// // import marker icons
// delete L.Icon.Default.prototype._getIconUrl;
//
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl:
//         "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
//     iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
// });

const validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
        (val) => val.length > 0 && (valid = false)
    );
    return valid;
}


class FormContent extends Component {

    constructor() {
        super()
        this.state = {
            title: '',
            //city: '',
            address: '',
            longitude: 0,
            latitude: 0,
            start_date: new Date(),
            end_date: new Date(),
            content: '',
            errors: {
                title: '',
                //city: '',
                address: '',
                longitude:'',
                latitude:''
            },
            invalid: 0,
            //missing_city:0,
            missing_address:0,
            missing_longitude:0,
            missing_latitude:0,
            missing_title:0,
            date_invalid:0
        }
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }
    componentWillReceiveProps(){
        this.componentDidMount()
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

    onChange(e) {
        //  e.preventDefault()
        let errors = this.state.errors;
        const { name, value } = e.target;
        console.log("e.target.name = ",e.target.name);
        console.log("e.target.value = ",e.target.value);
        this.setState({ [e.target.name]: e.target.value });

        switch (name) {
            case 'title':
                this.setState({missing_title: 0});
                errors.title =
                    value.length < 1
                        ? 'Please insert Title!'
                        : '';
                break;
            case 'address':
                this.setState({missing_address: 0});
                errors.address =
                    value.length < 1
                        ? 'Please insert Address!'
                        : '';
                break;
            // case 'city':
            //     this.setState({missing_city: 0});
            //     errors.city =
            //         value.length < 1
            //             ? 'Please insert City!'
            //             : '';
            //     break;
            case 'longitude':
                this.setState({missing_longitude: 0});
                errors.longitude =
                    value.length < 1
                        ? 'Please insert Longitude!'
                        : '';
                break;
            case 'latitude':
                this.setState({missing_latitude: 0});
                errors.latitude =
                    value.length < 1
                        ? 'Please insert Latitude!'
                        : '';
                break;
            default:
                break;
        }
        this.setState({errors, [name]: value});
    }

    addPost(newPost){
        return axios.request({
            method:'post',
            url:'http://127.0.0.1:5000/posts/'+ this.props.current_user,
            data: newPost
        }).then(response => {
            return response.data;
        });
    }
    editPost(editedPost){
        return axios.request({
            method:'put',
            url:'http://127.0.0.1:5000/posts/'+ this.props.current_user,
            data: {'title': editedPost.title,'address':editedPost.address,'start_date':editedPost.start_date,'end_date':editedPost.end_date,
                'longitude':editedPost.longitude,'latitude':editedPost.latitude,'content':editedPost.content,'id': this.props.post.id,'notification_date':new Date()}
        }).then(response => {
            return response.data;
        });
    }

    onSubmit(e){
        const newPost = {
            title: this.state.title,
            //city: this.state.city,
            address: this.state.address,
            longitude: this.state.longitude,
            latitude: this.state.latitude,
            start_date:this.state.start_date,
            end_date:this.state.end_date,
            content:this.state.content,
            date_posted: new Date()
        };
        if(this.state.end_date<this.state.start_date)
        {
           // this.setState({i
            // alid:1});
            console.log("hola");
        }
        else {
            if (!this.props.editPostFlag) {
                if(this.state.end_date<this.state.start_date){
                    this.setState({invalid: 1});
                }else {
                    this.addPost(newPost).then(res => {
                        if (res != 'Added') {
                            this.setState({invalid: 1});
                            // if (res == 'missing_city')
                            //     this.setState({missing_city: 1});

                            if (res == 'missing_address')
                                this.setState({missing_address: 1});
                            if (res == 'missing_title')
                                this.setState({missing_title: 1});
                            if (res == 'invalid_date')
                                this.setState({invalid_date: 1});
                            if (res == 'missing_longitude')
                                this.setState({missing_longitude: 1});
                            if (res == 'missing_latitude')
                                this.setState({missing_latitude: 1});
                        } else {
                            this.props.callbackFromParent(true);
                        }
                    });
                }

            } else {
                this.editPost(newPost).then(res => {
                    if (res != 'Updated') {
                        console.log("res is: ", res);
                        //this.addNoti(newPost);
                        this.setState({invalid: 1});
                        // if (res == 'missing_city')
                        //     this.setState({missing_city:1});
                        if (res == 'missing_address')
                            this.setState({missing_address: 1});
                        if (res == 'missing_title')
                            this.setState({missing_title: 1});
                        if (res == 'invalid_date')
                            this.setState({invalid_date: 1});
                        if (res == 'missing_longitude')
                            this.setState({missing_longitude: 1});
                        if (res == 'missing_latitude')
                            this.setState({missing_latitude: 1});
                    } else {
                        this.props.callbackFromParent(true);
                    }
                });
            }
        }

        e.preventDefault();
    }

    componentDidMount(){
        if(this.props.editPostFlag) {
            this.setState({
                title: this.props.post.title,
                //city: this.props.post.city,
                address: this.props.post.address,
                longitude: this.props.post.longitude,
                latitude: this.props.post.latitude,
                start_date:this.props.post.start_date,
                end_date:this.props.post.end_date,
                content: this.props.post.content
            })
        }
    }
    myCallBack = (dataFromChild,address) => {
        console.log("dataFromChild = ",dataFromChild);
        this.setState({latitude: dataFromChild['lat'],longitude: dataFromChild['lng']});
        this.setState({address:address})
    };


    render() {
        const center = [37.7833, -122.4167];
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mt-5 mx-auto">
                        <form noValidate onSubmit={this.onSubmit}>
                            <div className="form-group">
                                {this.state.invalid >0 &&  <Alert color="danger">
                                    Your Post is invalid. Please try again!
                                </Alert> }
                                <label htmlFor="name">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    placeholder="Title"
                                    value={this.state.title}
                                    onChange={this.onChange}
                                    noValidate
                                />
                                {this.state.errors.title.length > 0 &&
                                <span className='error'>{this.state.errors.title}</span>}
                                {this.state.missing_title > 0 &&
                                <span className='error'>Please insert title!</span>}
                            </div>
                            <div className="form-group">
                                <label>Insert Address</label>
                                <LocationSearch callbackFromParent={this.myCallBack}></LocationSearch>
                                {this.state.errors.address.length > 0 &&
                                <span className='error'>{this.state.errors.address}</span>}
                                {this.state.missing_address > 0 &&
                                <span className='error'>Please insert country!</span>}
                            </div>
                            {/*<div className="form-group">*/}
                            {/*    <label htmlFor="name">City</label>*/}
                            {/*    <input*/}
                            {/*        type="text"*/}
                            {/*        className="form-control"*/}
                            {/*        name="city"*/}
                            {/*        placeholder="City"*/}
                            {/*        value={this.state.city}*/}
                            {/*        onChange={this.onChange}*/}
                            {/*        noValidate*/}
                            {/*    />*/}
                            {/*    {this.state.errors.city.length > 0 &&*/}
                            {/*    <span className='error'>{this.state.errors.city}</span>}*/}
                            {/*    {this.state.missing_city > 0 &&*/}
                            {/*    <span className='error'>Please insert city!</span>}*/}
                            {/*</div>*/}
                            {/*<div className="form-group">*/}
                            {/*    <label htmlFor="longitude">Longitude</label>*/}
                            {/*    <input*/}
                            {/*        type="number"*/}
                            {/*        step="any"*/}
                            {/*        className="form-control"*/}
                            {/*        name="longitude"*/}
                            {/*        placeholder="Longitude"*/}
                            {/*        value={this.state.longitude}*/}
                            {/*        onChange={this.onChange}*/}
                            {/*        noValidate*/}
                            {/*    />*/}
                            {/*    {this.state.errors.longitude.length > 0 &&*/}
                            {/*    <span className='error'>{this.state.errors.longitude}</span>}*/}
                            {/*    {this.state.missing_longitude > 0 &&*/}
                            {/*    <span className='error'>Please insert longitude!</span>}*/}
                            {/*</div>*/}
                            {/*<div className="form-group">*/}
                            {/*    <label htmlFor="latitude">Latitude</label>*/}
                            {/*    <input*/}
                            {/*        type="number"*/}
                            {/*        step="any"*/}
                            {/*        className="form-control"*/}
                            {/*        name="latitude"*/}
                            {/*        placeholder="Latitude"*/}
                            {/*        value={this.state.latitude}*/}
                            {/*        onChange={this.onChange}*/}
                            {/*        noValidate*/}
                            {/*    />*/}
                            {/*    {this.state.errors.latitude.length > 0 &&*/}
                            {/*    <span className='error'>{this.state.errors.latitude}</span>}*/}
                            {/*    {this.state.missing_latitude > 0 &&*/}
                            {/*    <span className='error'>Please insert latitude!</span>}*/}
                            {/*</div>*/}
                            {!this.props.edit && <div className="form-group">
                                <label htmlFor="name">Start Date</label><br></br>
                                <DatePicker
                                    name="start_date"
                                    selected={this.state.start_date}
                                    onChange={this.handleChange_start}
                                    dateFormat="dd/MM/yyyy"
                                />
                                {this.state.date_invalid > 0 &&
                                <span className='error'>Please insert correct dates!</span>}
                            </div>}
                            {!this.props.edit && <div className="form-group">
                                <label htmlFor="name">End Date</label><br></br>
                                <DatePicker
                                    name="end_date"
                                    selected={this.state.end_date}
                                    onChange={this.handleChange_end}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>}
                            <div className="form-group">
                                <label htmlFor="content">Content</label>
                                <input
                                    type="text"
                                    style={{height: 400, width:300}}
                                    className="form-control"
                                    name="content"
                                    placeholder="Content"
                                    value={this.state.content}
                                    onChange={this.onChange}
                                    noValidate
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-lg btn-primary btn-block"
                            >
                                Submit!
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default FormContent;