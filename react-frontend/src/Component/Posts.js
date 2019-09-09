import React, { Component } from 'react'
import axios from 'axios';
import jwt_decode from "jwt-decode";
import moment from "moment";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalHeader from "reactstrap/es/ModalHeader";
import Button from "reactstrap/es/Button";
import ModalFooter from "reactstrap/es/ModalFooter";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import ReactPaginate from 'react-paginate';


export class Posts extends Component {
    constructor() {
        super()
        this.state = {
            posts: [],
            newPostModal: false,
            deletePostModal: false,
            updatePostModal: false,
            start_date: '',
            end_date: '',
            country: '',
            city: '',
            zip: '',
            content: '',
            title: '',
            invalid: 0,
            postToDelete: 0,
            postToUpdate: 0,
            pageCount: 0,
            current_page: 1,
            amount_of_posts: 0,
            current_user: 0
        }
        this.onChange = this.onChange.bind(this)
    }


    componentWillMount() {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        this.setState({current_user: decoded.identity.id});
        this._refreshPosts(this.state.current_page);
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
     this.setState({
         start_date: '',
          end_date: '',
          country:'',
          zip:'',
          city:'',
          content:'',
          title: '',
          postToUpdate: 0,
          postToDelete: 0,
        });
  }

  toggleDeletePostModal(post) {
    this.setState({
      deletePostModal: ! this.state.deletePostModal,
      postToDelete: post.id
    });
  }

  toggleUpdatePostModal(post) {
        const update = this.state.updatePostModal;
        this.setState({
                updatePostModal: !this.state.updatePostModal});

        if (!update) {
            this.setState({
                postToUpdate: post.id,
                country: post.country,
                zip: post.zip,
                city: post.city,
                content: post.content,
                start_date: new Date(post.start_date),
                end_date: new Date(post.end_date),
                title: post.title
            });
        }
        else{
             this.setState({
                          start_date: '',
                          end_date: '',
                          country:'',
                          zip:'',
                          city:'',
                          content:'',
                          title: '',
                          postToUpdate: 0,
                          postToDelete: 0,
             });
        }
  }

  deletePost(){
         axios.defaults.withCredentials = true;
    axios.delete('http://127.0.0.1:5000/posts/'+this.state.postToDelete)
        .then((response) => {
            this._refreshPosts(1);

      this.setState({
      deletePostModal: false
    });
    })

  }
     updatePost() {
        this.setState({invalid: 0});
        axios.defaults.withCredentials = true;
    axios.put('http://127.0.0.1:5000/posts/'+this.state.postToUpdate, {start_date: this.state.start_date,
            end_date: this.state.end_date,
            country: this.state.country,
            city: this.state.city,
            zip: this.state.zip,
            content: this.state.content,
            title: this.state.title
        })
        .then((response) => {
            this._refreshPosts(this.state.current_page);
            this.setState({
                start_date: '',
                end_date: '',
                country: '',
                zip: '',
                city: '',
                content: '',
                title: '',
                postToUpdate: 0,
                postToDelete: 0,
            });

            this.setState({
                updatePostModal: false
            });
        });
    }
   addPost() {
        this.setState({invalid: 0});
        axios.defaults.withCredentials = true;
    axios.post('http://127.0.0.1:5000/posts/new', {start_date: this.state.start_date,
            end_date: this.state.end_date,
            country: this.state.country,
            city: this.state.city,
            zip: this.state.zip,
            content: this.state.content,
            title: this.state.title
        })
        .then((response) => {
            this._refreshPosts(1);
      this.setState({
         start_date: '',
          end_date: '',
          country:'',
          zip:'',
          city:'',
          content:'',
          title: '',
          postToUpdate: 0,
          postToDelete: 0,
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

    _refreshPosts(page) {
        if (!this.props.id) {
            axios.get('http://127.0.0.1:5000/posts/page/' + page).then((response) => {
                this.setState({
                    posts: response.data.posts,
                    amount_of_posts: response.data.length
                })
            }).catch(err => {
                console.log(err)
            });
        }
        else{
            axios.get('http://127.0.0.1:5000/users?id='+this.props.id+"&page=" + page).then((response) => {
                this.setState({
                    posts: response.data.posts,
                    amount_of_posts: response.data.length
                })
            }).catch(err => {
                console.log(err)
            });
        }
    }

    handlePageClick = data => {
        const new_page = (data.selected+1);
          this.setState({
                current_page: new_page
            });
        this._refreshPosts(new_page);
  };
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
                    <div className="card text-center">
                        <div className="card-header">
                            Post by: <a href={"/users/"+post.user_id}>{post.username}</a>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">{post.title}</h5>
                            <p className="card-text">Start Date: {moment(post.start_date).format("LL")}</p>
                            <p className="card-text">End Date: {moment(post.end_date).format("LL")}</p>
                            <p className="card-text">Country: {post.country}</p>
                            <p className="card-text">City: {post.city}</p>
                            <p className="card-text">Zip: {post.zip}</p>
                            <p className="card-text">{post.content}</p>
                            {this.isPostMine(post) && <Button className="my-3" color="secondary" onClick={this.toggleUpdatePostModal.bind(this,post)}>Update</Button>}
                            <a> </a>
                            {this.isPostMine(post) && <Button className="my-3" color="danger" onClick={this.toggleDeletePostModal.bind(this,post)}>Delete</Button>}
                        </div>
                        <div className="card-footer text-muted">
                            Posted on {post.date_posted} </div>

                    </div>
                </div>

            );
        });
        return (
             <div>
                 <p className="m-md-4" align="center">
                        {(!this.props.id || this.props.id == this.state.current_user) &&<Button className="my-3" color="primary" onClick={this.toggleNewPostModal.bind(this)}>Add Post</Button>}
                    </p>
                {posts}

                 <ReactPaginate
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={Math.ceil(this.state.amount_of_posts/5)}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={this.handlePageClick}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      disabledClassName={'disabled'}
                      activeClassName={'active'}
                    />
                 <Modal isOpen={this.state.deletePostModal} toggle={this.toggleDeletePostModal.bind(this)}>
                            <ModalHeader toggle={this.toggleDeletePostModal.bind(this)}>Delete Post</ModalHeader>
                            <ModalBody> Are you sure you want to delete this post?
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={this.deletePost.bind(this)}>Yes</Button>{' '}
                                <Button color="secondary" onClick={this.toggleDeletePostModal.bind(this)}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                         <Modal isOpen={this.state.updatePostModal} toggle={this.toggleUpdatePostModal.bind(this)}>
                        <ModalHeader toggle={this.toggleUpdatePostModal.bind(this)}>Update your post</ModalHeader>
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
                            <Button color="primary" onClick={this.updatePost.bind(this)}>Update Post</Button>{' '}
                            <Button color="secondary" onClick={this.toggleUpdatePostModal.bind(this)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

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
    }
}

export default Posts