import React, { Component } from 'react';

import { Nav, NavItem, NavLink } from 'reactstrap';
import axios from "axios";
import {Posts} from "./Posts";
import {About} from "./About";

export class Profile extends Component{
    state={
        username: '',
        email: '',
        image_file: '',
        postsFlag: 1,
        aboutFlag:0,
        friendsFlag:0
    }
    showPosts(e) {
        e.preventDefault()
        this.setState({
                postsFlag: 1,
                aboutFlag: 0,
                friendsFlag: 0
            })
    }

    showAbout(){
        this.setState({postsFlag: 0,
        aboutFlag:1,
        friendsFlag:0})
    }

    showFriends(){
        this.setState({postsFlag: 0,
        aboutFlag:0,
        friendsFlag:1})
    }
    componentDidMount() {
        axios.get('http://127.0.0.1:5000/users/' + this.props.match.params.id).then((response) => {
                this.setState({
                   username: response.data.username,
                    image_file: response.data.image_file,
                  email: response.data.email
                })
            }).catch(err => {
                console.log(err)
            });
  }
   componentDidUpdate (prevProps) {
       if (prevProps.location.pathname !== this.props.location.pathname) {
           this.componentDidMount();
       }
   }

   updateMenuInfo(info){
        this.setState({
              username: info.username,
                email: info.email,
                // image_file: info.image_file
        });
   }
    render(){
        return( <div>
                    <div className="jumbotron-fluid mt-5" >
                      <div className="text-center">
                          <div className="media">
                                      <div className="media-body">
                                          <img className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.image_file}
                                               height="200" width="200"
                                          />
                                          <h1 className="account-heading">{this.state.username}</h1>
                                          <p className="text-secondary">{this.state.email}</p>
                                      </div>
                      </div>
                    </div>
                    </div>
                    <Nav tabs>
                          <NavItem>
                            <NavLink
                                href="#"
                                onClick={this.showPosts.bind(this)}>
                                Posts
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                                href="#"
                                onClick= {this.showAbout.bind(this)}>
                                About Me
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                                href="#"
                                onClick={this.showFriends.bind(this)}>
                                Friends
                            </NavLink>
                          </NavItem>
                        </Nav>

            {this.state.postsFlag ? <Posts id ={this.props.match.params.id}/> : <br/>}
            {this.state.aboutFlag ? <About id ={this.props.match.params.id} updateInfo={this.updateMenuInfo.bind(this)}/> : <br/>}
            {/*{this.state.friendsFlag && <Friends id ={this.state.user_id}/>}*/}

            </div>

        )
    }
}

export default Profile;