import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navbar from './Component/Navbar'
import Landing from './Component/Landing'
import Map from './Component/Map'
import Login from './Component/Login'
import Register from './Component/Register'
import Profile from './Component/Profile'
import Posts from './Component/Posts'
import {Redirect} from "react-router-dom";


function isLoggedIn() {
  if (localStorage.usertoken) {
    return true
  }
  return false
}

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" render={(props) => (
                !isLoggedIn() ? (
                    <Register {...props} />) : (<Redirect to="/profile"/> )
            )}/>
            <Route exact path="/login" render={(props) => (
                !isLoggedIn() ? (
                    <Login {...props} />) : (<Redirect to="/profile"/> )
            )}/>
            {/*<Route exact path="/profile/" render={(props) => (*/}
            {/*    isLoggedIn() ? (*/}
            {/*        <UserProfile {...props} />) : (<Redirect to="/login"/> )*/}
            {/*)}/>*/}
             <Route exact path="/posts" render={(props) => (
                isLoggedIn() ? (
                    <Posts {...props} />) : (<Redirect to="/login"/> )
            )}/>
             <Route exact path="/users/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/profile/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>

            <Route exact path="/map" render={(props) => (
                isLoggedIn() ? (
                    <Map {...props} />) : (<Redirect to="/login"/> )
            )}/>
          </div>
        </div>
      </Router>
    )
  }
}


export default App;
