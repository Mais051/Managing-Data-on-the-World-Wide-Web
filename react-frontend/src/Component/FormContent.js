
import FormModal from "./FormModal";
import {Link} from "react-router-dom";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import React, { Component } from 'react'

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
            city: '',
            country: '',
            start_date: new Date(),
            end_date: new Date(),
            content: '',
            errors: {
                title: '',
                city: '',
                country: ''
            },
            invalid: 0,
            missing_city:0,
            missing_country:0,
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
            case 'country':
                this.setState({missing_country: 0});
                errors.country =
                    value.length < 1
                        ? 'Please insert Country!'
                        : '';
                break;
            case 'city':
                this.setState({missing_city: 0});
                errors.city =
                    value.length < 1
                        ? 'Please insert City!'
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
            data: {'title': editedPost.title,'country':editedPost.country,'city':editedPost.city,'content':editedPost.content,'id': this.props.post.id}
        }).then(response => {
            return response.data;
        });
    }

    // addNoti(editedPost){
    //     return axios.request({
    //         method:'post',
    //         url:'http://127.0.0.1:5000/noti/'+ this.props.current_user,
    //         data: {'title': editedPost.title,'country':editedPost.country,'city':editedPost.city,'content':editedPost.content,'id': this.props.post.id}
    //     }).then(response => {
    //         return response.data;
    //     });
    //
    // }

    onSubmit(e){
        const newPost = {
            title: this.state.title,
            city: this.state.city,
            country: this.state.country,
            start_date:this.state.start_date,
            end_date:this.state.end_date,
            content:this.state.content
        }
        if (!this.props.editPostFlag) {
            this.addPost(newPost).then(res => {
                if (res != 'Added') {
                    this.setState({invalid: 1});
                    if (res == 'missing_city')
                        this.setState({missing_city: 1});

                    if (res == 'missing_country')
                        this.setState({missing_country: 1})
                    if (res == 'missing_title')
                        this.setState({missing_title: 1})
                    if (res == 'invalid_date')
                        this.setState({invalid_date: 1})
                } else {
                    this.props.callbackFromParent(true);
                }
            });
        }else{
            this.editPost(newPost).then(res => {
                if(res != 'Updated'){
                    console.log("res is: ", res);
                    //this.addNoti(newPost);
                    this.setState({invalid:1});

                    if (res == 'missing_city')
                        this.setState({missing_city:1});

                    if (res =='missing_country')
                        this.setState({missing_country:1})
                    if (res =='missing_title')
                        this.setState({missing_title:1})
                    if (res =='invalid_date')
                        this.setState({invalid_date:1})
                }else{
                    this.props.callbackFromParent(true);
                }
            });
        }

        e.preventDefault();
    }

    componentDidMount(){
        if(this.props.editPostFlag) {
            this.setState({
                title: this.props.post.title,
                city: this.props.post.city,
                country: this.props.post.country,
                content: this.props.post.content
            })
        }
    }

    render() {
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
                                <label htmlFor="name">Country</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="country"
                                    placeholder="Country"
                                    value={this.state.country}
                                    onChange={this.onChange}
                                    noValidate
                                />
                                {this.state.errors.country.length > 0 &&
                                <span className='error'>{this.state.errors.country}</span>}
                                {this.state.missing_country > 0 &&
                                <span className='error'>Please insert country!</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="city"
                                    placeholder="City"
                                    value={this.state.city}
                                    onChange={this.onChange}
                                    noValidate
                                />
                                {this.state.errors.city.length > 0 &&
                                <span className='error'>{this.state.errors.city}</span>}
                                {this.state.missing_city > 0 &&
                                <span className='error'>Please insert city!</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Start Date</label><br></br>
                                <DatePicker
                                    name="start_date"
                                    selected={this.state.start_date}
                                    onChange={this.handleChange_start}
                                    dateFormat="dd/MM/yyyy"
                                />
                                {this.state.date_invalid > 0 &&
                                <span className='error'>Please insert correct dates!</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">End Date</label><br></br>
                                <DatePicker
                                    name="end_date"
                                    selected={this.state.end_date}
                                    onChange={this.handleChange_end}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
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