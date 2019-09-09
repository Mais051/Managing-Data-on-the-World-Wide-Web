import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import axios from "axios";
import jwt_decode from "jwt-decode";


class Navbar extends Component {
    state ={
        current_user: 0
    }

  logOut(e) {
      e.preventDefault()
      localStorage.removeItem('usertoken')
      this.props.history.push(`/`)
      axios.defaults.withCredentials = true;
      axios.get('http://127.0.0.1:5000/logout')
        .catch(err => {
          console.log(err)
        })
  }
   componentDidUpdate (prevProps) {
    if (prevProps.location.key !== this.props.location.key) {
        this.componentDidMount();
    }
     }
  componentDidMount() {
      const token = localStorage.usertoken;
      if (token) {
          const decoded = jwt_decode(token);
          this.setState({
              current_user: decoded.identity.id
          })
      }
  }

  render() {

    const loginRegLink = (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link">
            Register
          </Link>
        </li>
      </ul>
    )

    const userLink = (
      <ul className="navbar-nav">
       <li className="nav-item">
          <Link to="/posts" className="nav-link">
            Posts
          </Link>
        </li>
        <li className="nav-item">
          <Link to={"/profile/"+this.state.current_user} className="nav-link">
            User
          </Link>
        </li>
        <li className="nav-item">
          <a href="" onClick={this.logOut.bind(this)} className="nav-link">
            Logout
          </a>
        </li>
      </ul>
    )

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample10"
          aria-controls="navbarsExample10"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse justify-content-md-center"
          id="navbarsExample10"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
          </ul>
          {localStorage.usertoken ? userLink : loginRegLink}
        </div>
      </nav>
    )
  }
}

export default withRouter(Navbar)