import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton, {IconToggle} from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {MuiThemeProvider,createMuiTheme} from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete'
import Modal from "react-bootstrap/Modal";
import FormContent from "./FormContent";
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';


const useStyles = makeStyles(theme => ({
    card: {
        maxWidth: 345,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },
    primary:{
        main: '#808080'
    },
    secondary:{
        main: '#ff0000'
    }
}
));


class PostItem extends Component{
    constructor(props){
        super(props);
        this.state = {
            item:props.item,
            subscribed :false,
            anchorEl: null,
            show: false
        }
    }
    subscribeToPost = (event) =>{
        axios.defaults.withCredentials = true;
        axios.post('http://127.0.0.1:5000/subscribe/' + this.props.current_user,{
            current_user: this.props.current_user,
            post_id:this.state.item['id'],
            subscribe_date:new Date()

        }).then((response) => {
            console.log("state: ",this.state.item.user_id);
            console.log("props: ",this.props.current_user);
            this.setState({
                subscribed:!this.state.subscribed
            })

        }).catch(err => {
            console.log(err)
        });
    };

    updatePost() {
        axios.get('http://127.0.0.1:5000/post/'+ this.state.item.id)
            .then(response => {
                this.state.item.title = response.data['title'];
                this.state.item.content = response.data['content'];
                this.state.item.country = response.data['address'];
                //this.state.item.city = response.data['city'];
                this.state.item.longitude = response.data['longitude'];
                this.state.item.latitude = response.data['latitude'];
                this.state.item.start_date  = response.data['start_date'];
                this.state.item.end_date = response.data['end_date'];
                this.setState({show:false});
            })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.updatePost();
    }

    handleClick = event => {
        this.setState({anchorEl:event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl:null});

    };
    handleCloseEdit = () =>{
        this.setState({show:false});
        this.componentDidMount();
    }
    showEditModal=()=>
    {
        this.handleClose();
        this.setState({show:true});

    }

    deletePost(e){
        this.handleClose();
        axios.defaults.withCredentials = true;
        return axios
            .delete('http://127.0.0.1:5000/post/'+this.state.item.id).then(response => {
                    console.log("response = ", response);
                    this.props.callbackFromParent(true);
                }
            );
    }

    myCallBack = (dataFromChild) => {
        if(dataFromChild){
            this.handleCloseEdit();
            this.componentDidMount();
        }
    };


    render(){
        return (
            <div className="container">
                <Modal show={this.state.show} onHide={this.handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit post</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><FormContent current_user={this.props.current_user} post={this.state.item}
                                             editPostFlag={true} callbackFromParent={this.myCallBack} edit={true}></FormContent></Modal.Body>
                </Modal>
            <Card className={useStyles.card}>
            <CardHeader
                avatar={
                <Avatar aria-label="recipe" className={useStyles.avatar}>
                    {((this.state.item.username).substring(0,1)).toUpperCase()}
                </Avatar>
            }

        action={
    <div>
        {this.props.current_user === this.state.item.user_id &&
        <IconButton aria-label="settings" aria-haspopup="true" onClick={this.handleClick}>
             <MoreVertIcon />
        </IconButton>}
    </div>
        }

        title={this.state.item.username}
        subheader={this.state.item.date_posted}
            />
                <Menu disableScrollLock={true}
                    id="settings"
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={this.showEditModal.bind(this)}><EditIcon/>Edit</MenuItem>
                    <MenuItem onClick={this.deletePost.bind(this)}><DeleteIcon/>Delete</MenuItem>
                </Menu>
            <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                    <b>Traveling to: {this.state.item.address}</b>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    <b>From:</b> {this.state.item.start_date}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    <b>To:</b> {this.state.item.end_date}
                </Typography><br/><br/>
            <Typography variant="body2" color="textSecondary" component="p">
                {this.state.item.content}
            </Typography>
            </CardContent>
            <CardActions disableSpacing>
                {this.props.current_user !== this.state.item.user_id &&
                    <IconButton aria-label="add to favorites" onClick={this.subscribeToPost.bind(this)}
                    >

                        <FavoriteBorderIcon className={useStyles.secondary}/>
                    </IconButton>}
            </CardActions>
            </Card>
            </div>
        )
    }
}

export default PostItem;