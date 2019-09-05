import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Landing from './components/Landing'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'


// import {
//   Container, Col, Form,
//   FormGroup, Label, Input,
//   Button, Card, CardImg, CardText, CardBody,
//   CardTitle, CardSubtitle
// } from 'reactstrap';
// import axios from 'axios';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/profile" component={Profile} />
          </div>
        </div>
      </Router>
    )
  }
}
//
//     state = {
//         posts: []
//     }
//     componentWillMount() {
//         this._refreshPosts();
//     }
//
//     _refreshPosts(){
//         axios.get('http://localhost:5000/posts').then((response) => {
//             this.setState({
//             posts: response.data.posts
//
//           })
//         });
//     }
//
//     render() {
//         let posts =  this.state.posts.map((post) => {
//             return (
//                 <Card>
//                         <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
//                         <CardBody>
//                           <CardTitle>{post.title}</CardTitle>
//                           <CardSubtitle>{post.username}</CardSubtitle>
//                           <CardText>{post.content}</CardText>
//                           <Button>Button</Button>
//                         </CardBody>
//                 </Card>
//             )
//         });
//         return (
//             <div>
//                 {posts}
//             </div>
//
//         );
//     }
// }

export default App;
