import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";

export class Profile extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      birth_date: '',
      email: '',
      errors: {}
    }
  }

  componentDidMount() {
    if (!this.props.id) {
      const token = localStorage.usertoken
      const decoded = jwt_decode(token)
      this.setState({
        username: decoded.identity.username,
        first_name: decoded.identity.first_name,
        last_name: decoded.identity.last_name,
        gender: decoded.identity.gender,
        birth_date: decoded.identity.birth_date,
        email: decoded.identity.email
      })
    }
    else {
        axios.get('http://127.0.0.1:5000/users/' + this.props.id).then((response) => {
                this.setState({
                   username: response.data.username,
                  first_name: response.data.first_name,
                  last_name: response.data.last_name,
                  gender: response.data.gender,
                  birth_date: response.data.birth_date,
                  email: response.data.email
                })
            }).catch(err => {
                console.log(err)
            });
    }
  }

  render() {
    return (
      <div className="container">
        <div className="jumbotron mt-5">
          <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td>Username</td>
                <td>{this.state.username}</td>
              </tr>
              <tr>
                <td>First Name</td>
                <td>{this.state.first_name}</td>
              </tr>
              <tr>
                <td>Last Name</td>
                <td>{this.state.last_name}</td>
              </tr>
              <tr>
                <td>Gender</td>
                <td>{this.state.gender}</td>
              </tr>
              <tr>
                <td>Birth Date</td>
                <td>{moment(this.state.birth_date).format("LL")}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{this.state.email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}


export default Profile