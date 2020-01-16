import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import axios from "axios";
import jwt_decode from "jwt-decode";
import { ListGroup, ListGroupItem } from 'reactstrap'
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';

class Navbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: '',
            current_user: 0,
            username:'',
            anchorEl: null,
            search_msg:'Search for a user',
            noti:[]
        };
    }
    static defaultProperty={
        suggestions: ['Aseel']
    };
    get_user(){
        this.setState({search_msg:'Search for a user'});
         axios.defaults.withCredentials = true;
        console.log("username:",this.state.username);
        axios.get('http://127.0.0.1:5000/user/'+this.state.username).then((response) => {
                this.setState({username:'',
                    activeSuggestion: 0,
                    filteredSuggestions: [],
                    showSuggestions: false});
                this.props.history.push(`/users/`+response.data.id)
            }).catch(err => {
                this.setState({username:'',search_msg:'User not found',
                    activeSuggestion: 0,
                    filteredSuggestions: [],
                    showSuggestions: false});

            });
    }

    onClick(e){
        axios.defaults.withCredentials = true;
        let input = e.target.innerText;
        axios.get('http://127.0.0.1:5000/user/'+input).then((response) => {
            this.setState({username:'',
                activeSuggestion: 0,
                filteredSuggestions: [],
                showSuggestions: false});
            this.props.history.push(`/users/`+response.data.id)
        }).catch(err => {
            this.setState({username:'',search_msg:'User not found',
                activeSuggestion: 0,
                filteredSuggestions: [],
                showSuggestions: false});
        });
    }

    onChange(e){
        const userInput = e.target.value;
        console.log("usertInput = ",userInput);
        let sugg = [];
        axios.get('http://127.0.0.1:5000/').then((res) => {
            console.log('res is: ',res.data);

            for(let i=0; i < res.data.length; i++){
                console.log(res.data[i]['username']);
                sugg.push(res.data[i]['username']);
            }
            const filteredSuggestions = sugg.filter(
                (suggestion) =>
                    suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
            );
            //console.log('filtered: ', filteredSuggestions);
           // console.log("e.target = ", e.target.innerText);
            this.setState({username: userInput, search_msg:'Search for a user',activeSuggestion: 0,
                filteredSuggestions,
                showSuggestions: true,
                userInput});
        });
    }

  logOut(e) {
      e.preventDefault()
      axios.defaults.withCredentials = true;
      axios.get('http://127.0.0.1:5000/logout').then(response => {
          localStorage.removeItem('usertoken')
          this.props.history.push(`/`)
      })
        .catch(err => {
          console.log(err)
        })
  }
   componentDidUpdate (prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
        this.componentDidMount();
    }
     }
  componentDidMount() {
      const token = localStorage.usertoken;
      if (token) {
          const decoded = jwt_decode(token);
          this.setState({
              current_user: decoded.identity.id
          });
          //this.getNotifications();
      }

  }
  getNotifications= event => {
          axios.get('http://127.0.0.1:5000/noti/'+ this.state.current_user)
              .then(response => {
                  this.setState({noti: response.data.notifications}, () => {
                      console.log("res is ",response.data.notifications);
                  })
              })
              .catch(err => console.log(err));
      };
  handleClickNoti = event => {
        this.getNotifications();
        console.log("his.state.noti.length()",this.state.noti.length)
        this.setState({anchorEl:event.currentTarget});
        this.componentDidMount();
  };
  handleCloseNoti = () => {
        this.setState({anchorEl:null});

  };


  render() {
      const NotificationItems =
          this.state.noti.map((noti, i) => {
          return(
              <MenuItem ><AirplanemodeActiveIcon/>The post "{noti.title}"<br/>by {noti.username}<br/>was edited on {noti.notification_date}
              </MenuItem>

          )
      });
      let suggestionsListComponent=[];
      if (this.state.showSuggestions && this.state.userInput) {
          if (this.state.filteredSuggestions.length) {
              suggestionsListComponent = (
                  <ListGroup>
                      {this.state.filteredSuggestions.map((suggestion, index) => {

                          return (
                              <ListGroupItem key={suggestion}  onClick={this.onClick.bind(this)}>
                                  {suggestion}
                              </ListGroupItem>
                          );
                      })}
                  </ListGroup>
              );
          } else {
              suggestionsListComponent = (
                  <div class="no-suggestions">
                      <em>No suggestions!</em>
                  </div>
              );
          }
      }



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
          <Link to={"/users/"+this.state.current_user} className="nav-link">
            User
          </Link>
        </li>
        <li className="nav-item">
            <IconButton aria-label="notification" aria-haspopup="true" onClick={this.handleClickNoti} >
                <NotificationsActiveIcon />

            </IconButton>

            <Menu disableScrollLock={true}
                  id="settings"
                  anchorEl={this.state.anchorEl}
                  keepMounted
                  open={Boolean(this.state.anchorEl)}
                  onClose={this.handleCloseNoti}
            >
                <div>

                        {NotificationItems}
                </div>
            </Menu>


         </li>


                <Form inline onSubmit={e => { e.preventDefault(); this.get_user() }}>
                    <a className="navbar-brand" href="">
                    </a>
              <FormControl type="text" placeholder={this.state.search_msg} onChange={this.onChange.bind(this)}

                value={this.state.username} className="mr-md-1"/>



              <Button variant="outline-secondary"
                      onClick={this.get_user.bind(this)}
                    >Search</Button>
              </Form>
        <li className="nav-item">
          <a href="" onClick={this.logOut.bind(this)} className="nav-link">
           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Logout
          </a>
        </li>
      </ul>

    )
    const notloggedin=(
          <div className="container">
              <div className="jumbotron mt-4">
                  <div className="col-sm-8 mx-auto">
                      <h1 className="text-center">WELCOME</h1>
                  </div>
              </div>
          </div>
    )
    const userHomePage=(
          <div className="container">
              <div className="jumbotron mt-4">
                  <div className="col-sm-8 mx-auto">
                      <h1 className="text-center">I AM USER</h1>
                  </div>
              </div>
          </div>
    )






    return (
      <div><nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded">
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
          className="collapse navbar-collapse justify-content-md-center col-md-12 "
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
          {suggestionsListComponent}
          </div>
    )
  }
}

export default withRouter(Navbar)