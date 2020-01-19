import React, { Component } from 'react'
import axios from 'axios';
import {Link} from 'react-router-dom';
import jwt_decode from "jwt-decode";
import PostItem from './PostItem'
import Button from "react-bootstrap/Button";
import FormModal from './FormModal'
import Modal from "react-bootstrap/Modal";
import FormContent from './FormContent';


class Landing extends Component {
    state= {
        users: [],
        posts:[],
        current_user:0,
        show: false,
        addPostFlag:false
    }
    componentWillReceiveProps(){
        this.componentDidMount()
    }
    refreshAddflag = () =>
        this.setState({addPostFlag: !this.state.addPostFlag})



    componentDidMount(){
        const token = localStorage.usertoken;
        console.log("token = ",token);
        if (token) {
            console.log("token in if = ",token);
            const decoded = jwt_decode(token);
            console.log("current_user = ", decoded.identity.id);
            this.setState({
                current_user: decoded.identity.id
            }, () => {console.log("current_user after = ", this.state.current_user);
                this.getPosts();});
        }

    }

    getPosts(){
        console.log("i am getting posts : ", this.state.current_user);
        axios.get('http://127.0.0.1:5000/posts/'+ this.state.current_user)
            .then(response => {
                this.setState({posts: response.data.posts}, () => {
                    console.log("res is ",response.data.posts);
                })
            })
            .catch(err => console.log(err));
    }

    handleShow = (event) =>{
        this.setState({show:true});
    };

    handleClose = (event) =>{
        this.setState({show:false});
        this.componentDidMount();
    };

    myCallBack = (dataFromChild) => {
        console.log("dataFromChild = ",dataFromChild);
        if(dataFromChild){
            console.log("hi");
            this.handleClose();
        }
    };

    postItemCallBack = (deleted) => {
        if(deleted){
            this.componentDidMount();
        }
    };

  render() {
      const postsItems = this.state.posts.map((post, i) => {
          return(
              <PostItem key={post.id} item={post} current_user={this.state.current_user} callbackFromParent={this.postItemCallBack}/>
          )
      });
    return (

      <div className="container">
        <div className="jumbotron mt-4">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">WELCOME</h1>
          </div>
        </div>
          <Button variant="primary" onClick={this.handleShow}>
              Create Post
          </Button>

          <Modal show={this.state.show} onHide={this.handleClose}>
              <Modal.Header closeButton>
                  <Modal.Title>Create post</Modal.Title>
              </Modal.Header>
              <Modal.Body><FormContent current_user={this.state.current_user} props={this.props}
                                       callbackFromParent={this.myCallBack} refresh={this.refreshAddflag}></FormContent></Modal.Body>
          </Modal>
          <div>
              <ul className="collection">
                  {postsItems}
              </ul>
          </div>

      </div>

    )
  }
}

export default Landing