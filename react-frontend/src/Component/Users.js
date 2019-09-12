import React, { Component } from 'react'
import axios from "axios";
import ReactPaginate from "react-paginate";

export class Users extends Component{
    constructor() {
        super()
        this.state = {
            current_page: 1,
            amount:0,
            users:[]
        }
    }

    componentDidMount() {
        this.refresh_users(this.state.current_page);
    }

    refresh_users(page){
        if (this.props.type == 1) {
            axios.defaults.withCredentials = true;
            axios.get('http://127.0.0.1:5000/followers/' + this.props.id + "?page=" + page).then((response) => {
                this.setState({
                    users: response.data.followers,
                    amount: response.data.length
                })
            }).catch(err => {
                console.log(err)
            });
        }
        else{
             axios.defaults.withCredentials = true;
            axios.get('http://127.0.0.1:5000/following/' + this.props.id + "?page=" + page).then((response) => {
                this.setState({
                    users: response.data.following,
                    amount: response.data.length
                })
            }).catch(err => {
                console.log(err)
            });
        }
    }
     handlePageClick = data => {
        const new_page = (data.selected+1);
          this.setState({
                current_page: new_page
            });
        this.refresh_users(new_page);
  };

    componentWillReceiveProps(){
        this.componentDidMount();
    }

    render(){
         let users =  this.state.users.map((user) => {
            return (
                <div>

                    <div className="card text-center"  class="col-sm-6 mx-auto align-content-center">
                        <div className="card-header">
                             <img  className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + user.image_file}
                                               height="60" width="60"
                            />
                             <a href={"/users/"+user.id}>{'     '+user.username}</a>
                        </div><br/>

                    </div>
                </div>

            );
        });

         return (
             <div>
                 {users}
                  <ReactPaginate
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={Math.ceil(this.state.amount/5)}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={this.handlePageClick}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      disabledClassName={'disabled'}
                      activeClassName={'active'}
                    />
             </div>
         )

    }
}