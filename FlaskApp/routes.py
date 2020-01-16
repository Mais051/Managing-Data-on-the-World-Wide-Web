import datetime
import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from FlaskApp import app, db, bcrypt, login_manager, geolocator
from FlaskApp.models import User, Travel, Follow ,Notification,subscribers_table
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)
from flask_cors import CORS, cross_origin
import datetime
from sqlalchemy import desc

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn


@app.errorhandler(404)
def not_found(error):
    return make_response((jsonify({'error': 'Not Found'})), 404)


@app.errorhandler(400)
def bad_request(error):
    return make_response((jsonify({'error': 'Bad Request'})), 400)


@app.errorhandler(403)
def forbidden(error):
    return make_response((jsonify({'error': 'Forbidden'})), 403)


@app.route("/users/<int:user_id>", methods=['GET', 'PUT','DELETE','POST'])
def get_user(user_id):
    if request.method == 'GET':
        user = User.query.get_or_404(user_id)
        image_file = url_for('static', filename='profile_pics/' + user.image_file)

        return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
                    'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
                    'image_file': image_file, 'followers': len(user.followers.all()),
                    'followed': len(user.followed.all())})
    if request.method == 'PUT':
        data = request.get_json()
        check_user = User.query.filter_by(username=data['username']).first()
        if check_user:
            if check_user.id != user_id:
                return 'Username Taken'
        user = User.query.get_or_404(user_id)



        user = User.query.filter_by(username=data['username']).first()
        user.first_name=data['first_name']
        user.last_name=data['last_name']
        user.email=data['email']
        user.gender=data['gender']
        user.birth_date=data['birth_date']

        db.session.commit()
        return 'Updated'
    if request.method =='DELETE':
        data = request.get_json()
        #make a response like in the lecture with the headers and return it
        #user = User.query.filter_by(username=data['username']).first()
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        #db.session.delete(user)
        db.session.commit()
        return 'Deleted'

@app.route("/image/<int:user_id>", methods=['PUT'])
@login_required
def imageUpload (user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        image_file= data
        url = save_picture(image_file)
        user.image_file=url
        db.session.commit()
        return 'Updated Image'




@app.route("/follow/<int:user_id>", methods=['POST','DELETE'])
def follow(user_id):
    if request.method == 'POST':
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        follower_id=data['current_user']
        follower = User.query.get_or_404(follower_id)
        if not user:
            abort(404)
    #if data['isFollowing'] == False:
        User.follow(follower,user)
        return 'Followed'
    if request.method == 'DELETE':
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        follower_id=data['current_user']
        follower = User.query.get_or_404(follower_id)
        User.unfollow(follower,user)
        return 'UNFOLLOW'



@app.route("/followers/<int:user_id>", methods=['GET'])
def getfollowers(user_id):
    subq = db.session.query(Follow).filter_by(followed_id=user_id).subquery()
    followers_with_username = db.session.query(User).join((subq, subq.c.follower_id==User.id)).all()
    followers = []
    for foll in followers_with_username:
        followers.append({'id': foll.id, 'username': foll.username, 'image_file': foll.image_file})
    length = len(followers)
    return jsonify({'followers': followers, 'length': length})



@app.route("/following/<int:user_id>", methods=['GET'])
def getfollowing(user_id):
    subq = db.session.query(Follow).filter_by(follower_id=user_id).subquery()
    following_with_username = db.session.query(User).join((subq, subq.c.followed_id==User.id)).all()
    following = []
    for foll in following_with_username:
        following.append({'id': foll.id, 'username': foll.username, 'image_file': foll.image_file})
    length = len(following)
    return jsonify({'following': following, 'length': length})





@app.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})


@app.route("/user/new", methods=['POST'])
def register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()

    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    check_password=len(data['password'])>8
    if check_password:
        return 'Password Invalid'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=datetime.datetime.now(), email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return 'Created'


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        abort(404)
    user_data = request.get_json()
    if not user_data or not 'password' in user_data or not 'email' in user_data:
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password, user_data['password']):
        login_user(user, remember=True)
        access_token = create_access_token(identity={'id': user.id})
        result = access_token
    else:
        abort(400)

    return result


@app.route("/logout", methods=['GET'])
@login_required
def logout():
    print('logging out')
    logout_user()
    return 'Logged Out', 201



@app.route('/is_following/<int:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/',methods=['GET'])
def usersdic():
	res = User.query.all()
	list_users = [r.as_dict() for r in res]
	return jsonify(list_users)


@app.route('/is_following_me/<int:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)

    if user.is_following(current_user):
        return 'True'
    return 'False'

def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False


@app.route('/posts/<int:user_id>', methods=['GET','POST','PUT'])
def get_posts(user_id):
    if(request.method == 'GET'):
        user = User.query.get_or_404(user_id)
        subq = db.session.query(Follow).filter_by(follower_id=user_id).subquery()
        posts_following = db.session.query(Travel,subq).filter(subq.c.followed_id==Travel.user_id).subquery()

       #User.username,posts_following.id.label("post_id"),posts_following,title,
       #         posts_following,date_posted,posts_following.start_date,posts_following.end_date,posts_following.country,
        #        posts_following.city,posts_following.content
        posts_following_username=db.session.query(posts_following.c.id.label('post_id'),User.id.label('user_user_id'),
        User.username,posts_following.c.title, posts_following.c.date_posted,posts_following.c.start_date,
        posts_following.c.end_date,posts_following.c.country,posts_following.c.city,posts_following.c.content
        ).filter(User.id==posts_following.c.user_id).all()
        posts = []

        for post in posts_following_username:
            posts.append({'id':post.post_id,'username': post.username, 'title': post.title,'date_posted':post.date_posted,
            'start_date':post.start_date,'end_date':post.end_date,'country':post.country,'city':post.city,
            'content':post.content,'user_id':post.user_user_id})
        user_posts = db.session.query(Travel).filter_by(user_id=user_id).all()
        for post in user_posts:
            posts.append({'id':post.id,'username': 'You', 'title': post.title,'date_posted':post.date_posted,
                    'start_date':post.start_date,'end_date':post.end_date,'country':post.country,'city':post.city,
                    'content':post.content,'user_id':post.user_id})

        length = len(posts)
        return jsonify({'posts': posts, 'length': length})

    if(request.method == 'POST'):
        data = request.get_json()
        if not data:
            abort(400)
        if data['title'] == '':
            return 'missing_title'
        if data['country'] == '' :
             return 'missing_country'
        if data['city'] == '':
             return 'missing_city'


        post= Travel(title=data['title'],country=data['country'],city=data['city'],date_posted=datetime.datetime.now(),
        start_date=datetime.datetime.now(),end_date=datetime.datetime.now(),content=data['content'],
        user_id=user_id,latitude=0,longitude=0)
        db.session.add(post)
        db.session.commit()
        return 'Added'
    if(request.method == 'PUT'):
        data = request.get_json()
        if not data:
            abort(400)
        if data['title'] == '':
            return 'missing_title'
        if data['country'] == '' :
             return 'missing_country'
        if data['city'] == '':
             return 'missing_city'

        post= Travel.query.filter_by(id=data['id']).first()
        post.title=data['title']
        post.city=data['city']
        post.country=data['country']
        post.content=data['content']
        noti=Notification(post_id=data['id'],action=1,notification_date=datetime.datetime.now())
        db.session.add(noti)
        db.session.commit()
        return 'Updated'
    return 'Ok'

@app.route('/noti/<int:user_id>', methods=['GET'])
def getnoti(user_id):
    posts_id_subscribed=db.session.query(subscribers_table.c.post_id,subscribers_table.c.subscribe_date).filter(subscribers_table.c.user_id==user_id).subquery()
    posts_subscribed=db.session.query(Travel.title,Travel.user_id,posts_id_subscribed).filter(posts_id_subscribed.c.post_id==Travel.id).subquery()
    post_subscribed_username=db.session.query(User.username,posts_subscribed).filter(User.id==posts_subscribed.c.user_id).subquery()

    notifications_subscribed=db.session.query(post_subscribed_username,Notification.notification_date).join((Notification,
    post_subscribed_username.c.post_id==Notification.post_id)).subquery()

    notifications_al=db.session.query(notifications_subscribed.c.title,notifications_subscribed.c.username,
    notifications_subscribed.c.post_id,notifications_subscribed.c.notification_date,notifications_subscribed.c.user_id
    ).order_by(desc(notifications_subscribed.c.notification_date)).all()

    notifications=[]

    for notification in notifications_al:
        notifications.append({'post_id':notification.post_id,
        'username':notification.username,'title':notification.title,'notification_date':notification.notification_date,
        'user_id':notification.user_id})
    length = len(notifications)
    return jsonify({'notifications': notifications, 'length': length})



@app.route("/post/<int:post_id>", methods=['GET','DELETE'])
def getPost(post_id):
    if request.method == 'GET':
        travel = Travel.query.get_or_404(post_id)
        return jsonify({'id': travel.id, 'title':travel.title,'country':travel.country,'city':travel.city,'content':travel.content})
    if request.method == 'DELETE':
        travel = Travel.query.get_or_404(post_id)
        db.session.delete(travel)
        db.session.commit()
        return 'DELETED'
    return 'OK'


@app.route("/subscribe/<int:user_id>", methods=['POST','DELETE'])
def subscribe(user_id):
    if request.method == 'POST':
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        post_id=data['post_id']
        post=Travel.query.filter_by(id=data['post_id']).first()
        user.subposts.append(post)
        db.session.add(user)
        db.session.commit()

        #if not post :
         #   'Post does not exist'
       # check_post = subscribers.query.filter_by(post_id=data['post_id'] ).filter_by(user_id=data['current_user']).first()
        #if check_post:
        #   return 'Already subscribed'
        #else:
        return 'Subscribed'
    return 'yes we can'








