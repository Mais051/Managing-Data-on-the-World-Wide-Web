import React, { Component } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import LocationSearch from "./LocationSearch";


class AddPost extends Component{
    constructor() {
        super()
        this.state = {
            latitude: 0,
            longitude: 0,
            address: ''

        };
    }
    addPost(newPost){
        axios.request({
            method:'post',
            url:'http://127.0.0.1:5000/posts/'+ this.state.current_user,
            data: newPost
        }).then(response => {
            this.props.history.push('/');
        }).catch(err => console.log(err));
    }

    onSubmit(e){
        const newPost = {
            title: this.refs.title.value,
            address:this.state.address,
            longitude: this.state.longitude,
            latitude: this.state.latitude,
            //city: this.refs.city.value,
            //country: this.refs.country.value,
            date_posted: new Date(),
            user_id:this.refs.user_id.value,
            start_date:this.refs.start_date.value,
            end_date:this.refs.end_date.value,

        }
        console.log("start_date in AddPost:",newPost.start_date);
        this.addPost(newPost);
        e.preventDefault();
    }
    myCallBack = (dataFromChild,address) => {
        console.log("dataFromChild = ",dataFromChild);
        this.setState({latitude: dataFromChild['lat'],longitude: dataFromChild['lng']});
        this.setState({address:address})
    };

    render(){
        return (
            <div>
                <br />
                <Link className="btn grey" to="/">Back</Link>
                <h1>Add Post</h1>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <div className="input-field">
                        <input type="text" name="title" ref="title" />
                        <label htmlFor="title">Title</label>
                    </div>
                    <div className="input-field">
                        <h1>Enter Address</h1>
                        <LocationSearch callbackFromParent={this.myCallBack}></LocationSearch>
                    </div>
                    {/*<div className="input-field">*/}
                    {/*    <input type="text" name="city" ref="city" />*/}
                    {/*    <label htmlFor="city">City</label>*/}
                    {/*</div>*/}
                    {/*<div className="input-field">*/}
                    {/*    <input type="text" name="country" ref="country" />*/}
                    {/*    <label htmlFor="country">Country</label>*/}
                    {/*</div>*/}
                    <div className="input-field">
                        <input type="text" name="date_posted" ref="date_posted" />
                        <label htmlFor="date_posted">Date Posted</label>
                    </div>
                    <div className="input-field">
                        <input type="text" name="start_date" ref="start_date" />
                        <label htmlFor="start_date">Start Date</label>
                    </div>
                    <div className="input-field">
                        <input type="text" name="end_date" ref="end_date" />
                        <label htmlFor="end_date">End Date</label>
                    </div>
                    <input type="submit" value="Save" className="btn" />
                </form>
            </div>
        )
    }
}

export default AddPost;