import React, { Component } from 'react';
import { Posts } from './Posts.js'
import {NavBarUser} from './NavBarUser'

export class UserProfile extends Component{
    state={
        user_id: this.props.match.params.id
    }
    componentWillReceiveProps(){
         this.setState({user_id: this.props.match.params.id});
    }
    render(){
        return( <div>
                <NavBarUser id = {this.state.user_id}/>
                <Posts id ={this.state.user_id}/>
            </div>

        )
    }
}

export default UserProfile;