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

const validIntRegex =
  RegExp(/^[0-9\b]+$/);

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
}
function PostForm(props){
    return (
        <form noValidate onSubmit={props.onSubmit}>
            <label htmlFor="name">Post title</label>
            <input
                type="text"
                className="form-control"
                name="title"
                placeholder="Enter your title"
                value={props.title}
                onChange={props.onChange}
                noValidate
            />
             {props.errors.title.length > 0 &&
                <span className='error'>{props.errors.title}</span>}
                <br/>
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
                {props.errors.city.length > 0 &&
                <span className='error'>{props.errors.city}</span>}
                <br/>
            <label htmlFor="name">Zip</label>
            <input
                type="text"
                className="form-control"
                name="zip"
                placeholder="Enter zip code"
                value={props.zip}
                onChange={props.onChange}
                noValidate
            />
                {props.errors.zip.length > 0 &&
                <span className='error'>{props.errors.zip}</span>}
                <br/>
            <label htmlFor="name">Content</label>
            <textarea
                type="text"
                className="form-control"
                name="content"
                placeholder="Enter your post content"
                value={props.content}
                onChange={props.onChange}
                noValidate
                textarea/>
                    {props.errors.content.length > 0 &&
                <span className='error'>{props.errors.content}</span>}
        </form>
    );
}

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
            current_user: 0,
              errors: {
                  country: 'This field is required',
                  city: 'This field is required',
                  zip: 'This field is required',
                  content: 'This field is required',
                  title: 'This field is required'
              }
        }
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount(){
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        this.setState({current_user: decoded.identity.id});
        this._refreshPosts(this.state.current_page);
    }

    componentDidUpdate (prevProps) {
       if (prevProps.id !== this.props.id) {
           this.componentDidMount();
       }
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
    toggleNewPostModal() {
    this.setState({
      newPostModal: ! this.state.newPostModal,
        invalid: 0,
         errors: {
                  country: 'This field is required',
                  city: 'This field is required',
                  zip: 'This field is required',
                  content: 'This field is required',
                  title: 'This field is required'
              }
    });
     this.setState({
         start_date: new Date(),
          end_date: new Date(),
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
                title: post.title,
                invalid: 0,
                errors: {
                  country: '',
                  city: '',
                  zip: '',
                  content: '',
                  title: ''
              }
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
                            invalid : 0,
                            errors: {
                              country: '',
                                city: '',
                                zip: '',
                                content: '',
                                title: ''
                          }
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

        if (validateForm(this.state.errors)) {
            axios.defaults.withCredentials = true;
            axios.put('http://127.0.0.1:5000/posts/' + this.state.postToUpdate, {
                start_date: this.state.start_date,
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
                })
                .catch(err => {
                    console.log(err)
                    this.setState({invalid: 1});
                });;
        }
        else{
            this.setState({invalid: 1});
        }
    }
   addPost() {
        this.setState({invalid: 0});

        if (validateForm(this.state.errors)) {
            axios.defaults.withCredentials = true;
            axios.post('http://127.0.0.1:5000/posts/new', {
                start_date: this.state.start_date,
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
                        country: '',
                        zip: '',
                        city: '',
                        content: '',
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
        else {
            this.setState({invalid: 1});
        }
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
         let errors = this.state.errors;
        const { name, value } = e.target;

        switch (name) {
            case 'title':
                errors.title =
                  value.length < 1
                    ? 'This field is required'
                    : '';
                break;
            case 'zip':
                errors.zip =
                  validIntRegex.test(value)  && value.length >=1
                    ? ''
                    : 'Zip code must be a valid number';
                break;
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
                case 'content':
                errors.content =
                  value.length < 1
                    ? 'This field is required'
                    : '';
                break;
              default:
                break;
        }
        this.setState({errors, [name]: value});

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
                             <PostForm
                                 onChange={this.onChange}
                                 handleChangeStart={this.handleChangeStart}
                                 handleChangeEnd={this.handleChangeEnd}
                                 onSubmit={this.onSubmit}
                                 content={this.state.content}
                                 title={this.state.title}
                                 start_date={this.state.start_date}
                                 end_date={this.state.end_date}
                                 country={this.state.country}
                                 zip={this.state.zip}
                                 city={this.state.city}
                                 errors={this.state.errors}
                             />
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
                            <PostForm
                                 onChange={this.onChange}
                                 handleChangeStart={this.handleChangeStart}
                                 handleChangeEnd={this.handleChangeEnd}
                                 onSubmit={this.onSubmit}
                                 content={this.state.content}
                                 title={this.state.title}
                                 start_date={this.state.start_date}
                                 end_date={this.state.end_date}
                                 country={this.state.country}
                                 zip={this.state.zip}
                                 city={this.state.city}
                                 errors={this.state.errors}
                             />
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