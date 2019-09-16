import React, { Component } from 'react'
import axios from 'axios';
import jwt_decode from "jwt-decode";
import moment from "moment";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalHeader from "reactstrap/es/ModalHeader";
import Button from "react-bootstrap/Button";
import ModalFooter from "reactstrap/es/ModalFooter";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import ReactPaginate from 'react-paginate';
import {Nav, NavItem, NavLink} from "reactstrap";

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
             {props.errors.city.length > 0 ?
                <span className='error'>{props.errors.city}</span> :
                props.location_invalid > 0 ?
                        <span className='error'>This location is invalid</span> : <p/>}
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
                  content: 'This field is required',
                  title: 'This field is required',
              },
            postsFollowed:true,
            location_invalid:0
        }
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount(){
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        this.setState({current_user: decoded.identity.id});
        this._refreshPosts(this.state.current_page,this.state.postsFollowed);
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
        location_invalid: 0,
         errors: {
                  country: 'This field is required',
                  city: 'This field is required',
                  content: 'This field is required',
                  title: 'This field is required'
              }
    });
     this.setState({
         start_date: new Date(),
          end_date: new Date(),
          country:'',
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
                city: post.city,
                content: post.content,
                start_date: new Date(post.start_date),
                end_date: new Date(post.end_date),
                title: post.title,
                invalid: 0,
                location_invalid: 0,
                errors: {
                  country: '',
                  city: '',
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
                          city:'',
                          content:'',
                          title: '',
                          postToUpdate: 0,
                          postToDelete: 0,
                            invalid : 0,
                            location_invalid: 0,
                            errors: {
                              country: '',
                                city: '',
                                content: '',
                                title: ''
                          }
             });
        }
  }

  showFollowedUsers(e){
        e.preventDefault()
        this.setState({postsFollowed: true, current_page:1});
        this._refreshPosts(1,true)
  }

  showAllUsers(e){
        e.preventDefault()
        this.setState({postsFollowed: false,current_page:1});
        this._refreshPosts(1,false)

  }

  deletePost(){
         axios.defaults.withCredentials = true;
    axios.delete('http://127.0.0.1:5000/posts/'+this.state.postToDelete)
        .then((response) => {
            this._refreshPosts(1,this.state.postsFollowed);

      this.setState({
      deletePostModal: false,
          current_page:1
    });
    })

  }
     updatePost() {
        this.setState({invalid: 0,location_invalid:0});

        if (validateForm(this.state.errors)) {
            axios.defaults.withCredentials = true;
            axios.put('http://127.0.0.1:5000/posts/' + this.state.postToUpdate, {
                start_date: this.state.start_date,
                end_date: this.state.end_date,
                country: this.state.country,
                city: this.state.city,
                content: this.state.content,
                title: this.state.title
            })
                .then((response) => {
                    if (response.data=='Updated') {
                        this._refreshPosts(this.state.current_page, this.state.postsFollowed);
                        this.setState({
                            start_date: '',
                            end_date: '',
                            country: '',
                            city: '',
                            content: '',
                            title: '',
                            postToUpdate: 0,
                            postToDelete: 0,
                        });

                        this.setState({
                            updatePostModal: false
                        });
                    }
                    else{
                        this.setState({invalid:1, location_invalid:1});
                    }
                })
                .catch(err => {
                    console.log(err)
                    this.setState({invalid: 1});
                });
        }
        else{
            this.setState({invalid: 1});
        }
    }
   addPost() {
        this.setState({invalid: 0});
        this.setState({location_invalid: 0});

        if (validateForm(this.state.errors)) {
            axios.defaults.withCredentials = true;
            axios.post('http://127.0.0.1:5000/posts/new', {
                start_date: this.state.start_date,
                end_date: this.state.end_date,
                country: this.state.country,
                city: this.state.city,
                content: this.state.content,
                title: this.state.title
            })
                .then((response) => {
                    if (response.data=='Created') {
                        this._refreshPosts(1, this.state.postsFollowed);
                        this.setState({
                            start_date: '',
                            end_date: '',
                            country: '',
                            city: '',
                            content: '',
                            title: '',
                            postToUpdate: 0,
                            postToDelete: 0,
                            current_page: 1
                        });
                          this.setState({newPostModal: false});
                    }
                    else{
                        this.setState({invalid: 1});
                        this.setState({location_invalid: 1});

                    }

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

    _refreshPosts(page,flag) {
        if (!this.props.id) {
            if (!flag) {
                axios.defaults.withCredentials = true;
                axios.get('http://127.0.0.1:5000/posts/page/' + page).then((response) => {
                    this.setState({
                        posts: response.data.posts,
                        amount_of_posts: response.data.length
                    })
                }).catch(err => {
                    console.log(err)
                });
            }
            else {
                    axios.defaults.withCredentials = true;
                    axios.get('http://127.0.0.1:5000/followed_posts/page/' + page).then((response) => {
                        this.setState({
                            posts: response.data.posts,
                            amount_of_posts: response.data.length
                        })
                    }).catch(err => {
                        console.log(err)
                    });
                }
        }
        else{
             axios.defaults.withCredentials = true;
            axios.get('http://127.0.0.1:5000/users/posts?id='+this.props.id+"&page=" + page).then((response) => {
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
        this._refreshPosts(new_page,this.state.postsFollowed);
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
                            <p className="card-text"><b>Country:</b> {post.country}</p>
                            <p className="card-text"><b>City:</b> {post.city}</p>
                            <p className="card-text">{post.content}</p>
                            {this.isPostMine(post) && <Button className="my-3" variant="secondary" onClick={this.toggleUpdatePostModal.bind(this,post)}>Update</Button>}
                            <a> </a>
                            {this.isPostMine(post) && <Button className="my-3" variant="danger" onClick={this.toggleDeletePostModal.bind(this,post)}>Delete</Button>}
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
                        {(!this.props.id || this.props.id == this.state.current_user) &&<Button className="my-3" variant="dark" onClick={this.toggleNewPostModal.bind(this)}>Add Post</Button>}
                     {!this.props.id &&  <Nav tabs>
                          <NavItem>
                              <NavLink
                                href="#"
                                disabled={true}
                                onClick={null}>
                                Show posts from:
                            </NavLink>
                          </NavItem>
                         <NavItem>
                            <Button variant="outline-primary"
                                     disabled={this.state.postsFollowed}
                                    onClick={this.showFollowedUsers.bind(this)}>Followed Users </Button>
                          </NavItem>
                         <h4>&nbsp;</h4>
                          <NavItem>

                            <Button variant="outline-primary"
                                    disabled={!this.state.postsFollowed}
                                    onClick={this.showAllUsers.bind(this)}>All Users </Button>
                          </NavItem>
                        </Nav>}
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
                      forcePage={this.state.current_page - 1}
                    />
                 <Modal isOpen={this.state.deletePostModal} toggle={this.toggleDeletePostModal.bind(this)}>
                            <ModalHeader toggle={this.toggleDeletePostModal.bind(this)}>Delete Post</ModalHeader>
                            <ModalBody> Are you sure you want to delete this post?
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="primary" onClick={this.deletePost.bind(this)}>Yes</Button>{' '}
                                <Button variant="secondary" onClick={this.toggleDeletePostModal.bind(this)}>Cancel</Button>
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
                                 city={this.state.city}
                                 errors={this.state.errors}
                                 location_invalid={this.state.location_invalid}
                             />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="primary" onClick={this.updatePost.bind(this)}>Update Post</Button>{' '}
                            <Button variant="secondary" onClick={this.toggleUpdatePostModal.bind(this)}>Cancel</Button>
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
                                 city={this.state.city}
                                 errors={this.state.errors}
                                 location_invalid={this.state.location_invalid}
                             />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="primary" onClick={this.addPost.bind(this)}>Add Post</Button>{' '}
                            <Button variant="secondary" onClick={this.toggleNewPostModal.bind(this)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
            </div>

        );
    }
}

export default Posts