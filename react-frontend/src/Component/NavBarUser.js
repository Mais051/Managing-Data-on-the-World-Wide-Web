import React, { Component } from 'react';

import { Nav, NavItem, NavLink } from 'reactstrap';
import axios from "axios";
export class NavBarUser extends Component{
    state={
        user_id: this.props.id,
        username: '',
        email: '',
        image_file: ''
    }
    componentDidMount() {
        axios.get('http://127.0.0.1:5000/users/' + this.props.id).then((response) => {
                this.setState({
                   username: response.data.username,
                    image_file: response.data.image_file,
                  email: response.data.email
                })
            }).catch(err => {
                console.log(err)
            });
  }
    render(){
        return( <div>
                    <div className="jumbotron mt-5">
                      <div className="text-center">
                          <div className="media">
                                      <div className="media-body">
                                          <img className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.image_file}/>
                                          <h1 className="account-heading">{this.state.username}</h1>
                                          <p className="text-secondary">{this.state.email}</p>
                                      </div>

                          {/*<img className="rounded-circle account-img small" src={"http://127.0.0.1:5000"+this.state.image_file}/>*/}
                          {/*<h1 className="display-3">{this.state.username}</h1>*/}
                          {/*<p className="lead">{this.state.email}</p>*/}
                      </div>
                    </div>
                    </div>
                    <Nav tabs>
                          <NavItem>
                            <NavLink href={"/users/"+this.state.user_id}>Posts</NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink href={"/users/about-me/"+this.state.user_id}>About Me</NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink href="#">Friends</NavLink>
                          </NavItem>
                        </Nav>

            </div>

        )
    }
}

export default NavBarUser;