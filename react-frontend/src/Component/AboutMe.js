import React, { Component } from 'react';
import { Profile } from './Profile.js'
import {NavBarUser} from './NavBarUser'

export class AboutMe extends Component{
    state={
        user_id: this.props.match.params.id
    }
    render(){
        return( <div>
                <NavBarUser id = {this.state.user_id}/>
                <Profile id ={this.state.user_id}/>
            </div>

        )
    }
}

export default AboutMe;