import React, { Component } from 'react'
import axios from 'axios';
import jwt_decode from "jwt-decode";
import moment from "moment";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalHeader from "reactstrap/es/ModalHeader";
import Label from "reactstrap/es/Label";
import FormGroup from "reactstrap/es/FormGroup";
import Input from "reactstrap/es/Input";
import Button from "reactstrap/es/Button";
import ModalFooter from "reactstrap/es/ModalFooter";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";



class Posts extends Component {
    constructor() {
        super()
        this.state = {
            posts: [],
            newPostModal: false,
            start_date: '',
            end_date: '',
            country: '',
            city: '',
            zip: '',
            content: '',
            title: '',
            invalid: 0
        }
        this.onChange = this.onChange.bind(this)
    }

    componentWillMount() {
        this._refreshPosts();
    }

    handleChangeStart = date => {
    this.setState({start_date: date}
    );
  };
    handleChangeEnd = date => {
    this.setState({end_date: date}
    );
  };
    toggleNewPostModal() {
    this.setState({
      newPostModal: ! this.state.newPostModal
    });
  }

   addPost() {
        this.setState({invalid: 0});
    axios.post('http://127.0.0.1:5000/posts/new', { start_date: this.state.start_date,
            end_date: this.state.end_date,
            country: this.state.country,
            city: this.state.city,
            zip: this.state.zip,
            content: this.state.content,
            title: this.state.title
        })
        .then((response) => {
      let  posts_up  = this.state.posts;
      posts_up.push(response.data);
      this.setState({
         start_date: '',
          end_date: '',
          country:'',
          zip:'',
          city:'',
          content:'',
          title: ''
        });
      this.setState({
      posts: posts_up
    });
      this.setState({
      newPostModal: false
    });
    })
    .catch(err => {
      console.log(err)
       this.setState({invalid: 1});
    });
  }
    _refreshPosts(){
        axios.get('http://localhost:5000/posts').then((response) => {
            this.setState({
            posts: response.data.posts

          })
        });
    }

    isPostMine(post){
        const token = localStorage.usertoken
        const decoded = jwt_decode(token)
        const id = decoded.identity.id
        return (post.user_id==id);
    }

      onChange(e) {
      //  e.preventDefault()
          const { name, value } = e.target;
          this.setState({[name]: value});

    }

    render() {
        let posts =  this.state.posts.map((post) => {
            return (
                <div>
                    <p className="m-md-4" align="center">
                        <Button className="my-3" color="primary" onClick={this.toggleNewPostModal.bind(this)}>Add Post</Button>
                    </p>
                    <div className="card text-center">
                        <div className="card-header">
                            Post by: <a href="#">{post.username}</a>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">{post.title}</h5>
                            <p className="card-text">Start Date: {moment(post.start_date).format("LL")}.</p>
                            <p className="card-text">End Date: {moment(post.end_date).format("LL")}.</p>
                            <p className="card-text">Country: {post.country}.</p>
                            <p className="card-text">City: {post.city}.</p>
                            <p className="card-text">Zip: {post.zip}.</p>
                            <p className="card-text">{post.content}.</p>
                            {this.isPostMine(post) && <a href="#" className="btn btn-secondary">Update</a>}
                            <a> </a>
                            {this.isPostMine(post) && <a href="#" className="btn btn-danger">Delete</a>}
                        </div>
                        <div className="card-footer text-muted">
                            Posted on {post.date_posted} </div>
                    </div>

                    <Modal isOpen={this.state.newPostModal} toggle={this.toggleNewPostModal.bind(this)}>
                        <ModalHeader toggle={this.toggleNewPostModal.bind(this)}>Add a new post</ModalHeader>
                        <ModalBody>
                             {this.state.invalid >0 &&  <Alert color="danger">
                              Your post is invalid. Please try again!
                            </Alert> }
                             <form noValidate onSubmit={this.onSubmit}>
                                 <label htmlFor="name">Post title</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="title"
                                      placeholder="Enter your title"
                                      value={this.state.title}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                                  <div className="form-group">
                                      <label htmlFor="name">Start date</label><br></br>
                                    <DatePicker
                                     name="start_date"
                                     selected={this.state.start_date}
                                     onChange={this.handleChangeStart}
                                     dateFormat="dd/MM/yyyy"
                                    />
                                  </div>
                                   <div className="form-group">
                                      <label htmlFor="name">End date</label><br></br>
                                    <DatePicker
                                     name="end_date"
                                     selected={this.state.end_date}
                                     onChange={this.handleChangeEnd}
                                     dateFormat="dd/MM/yyyy"
                                    />
                                  </div>
                                 <label htmlFor="name">Country</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="country"
                                      placeholder="Enter country name"
                                      value={this.state.country}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                                    <label htmlFor="name">City</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="city"
                                      placeholder="Enter city name"
                                      value={this.state.city}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                                      <label htmlFor="name">Zip</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="zip"
                                      placeholder="Enter zip code"
                                      value={this.state.zip}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                                    <label htmlFor="name">Content</label>
                                    <textarea
                                      type="text"
                                      className="form-control"
                                      name="content"
                                      placeholder="Enter your post content"
                                      value={this.state.content}
                                      onChange={this.onChange}
                                      noValidate
                                    textarea/>
                                </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.addPost.bind(this)}>Add Post</Button>{' '}
                            <Button color="secondary" onClick={this.toggleNewPostModal.bind(this)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </div>

            );
        });
        return (
             <div>
                {posts}
            </div>

        );
    }
}

export default Posts