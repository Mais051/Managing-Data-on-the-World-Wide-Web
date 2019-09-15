import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from FlaskApp import app, db, bcrypt, login_manager, geolocator
from FlaskApp.models import User, Travel, Follow
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)


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


@app.route("/users/<int:user_id>", methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    image_file = url_for('static', filename='profile_pics/' + user.image_file)

    return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
                    'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
                    'image_file': image_file, 'followers': len(user.followers.all()), 'followed': len(user.followed.all())})


@app.route("/users/posts", methods=['GET'])
def get_user_posts():
    user_id = int(request.args.get('id', 1))
    page = int(request.args.get('page', 1))
    if not user_id or not page:
        abort(400)

    user = User.query.get_or_404(user_id)
    posts = user.travels.order_by(Travel.date_posted.desc()).paginate(page=page, per_page=5)
    res = []
    image_file = url_for('static', filename='profile_pics/' + user.image_file)

    for post in posts.items:
        res.append({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                       'end_date': post.end_date, 'country': post.country, 'city': post.city,
                    'content': post.content, 'username': post.traveler.username,
                    'user_id': post.traveler.id, 'id': post.id, 'image_file': image_file })

    result = sorted(res, key=lambda d: d['id'], reverse=True)
    return jsonify({'posts': result, 'length': len(user.travels.all())})


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
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=data['birth_date'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return 'Created'


@app.route("/image/<int:user_id>", methods=['PUT'])
@login_required
def user_img_update(user_id):
    file = request.files['file']
    user = User.query.get_or_404(user_id)
    if current_user != user or not file:
        abort(400)
    path = save_picture(file)
    current_user.image_file = path
    db.session.commit()
    return jsonify({'image_file': url_for('static', filename='profile_pics/' + path)})


@app.route("/users/<int:user_id>", methods=['PUT'])
@login_required
def user_update(user_id):
    user_data = request.get_json()
    user = User.query.get_or_404(user_id)
    if current_user != user or not user_data:
        abort(400)
    if not 'username' in user_data or not 'first_name' in user_data \
            or not 'last_name' in user_data or not 'gender' in user_data or not 'birth_date' in user_data or not 'email' in user_data:
        abort(400)
    check_user = User.query.filter_by(email=user_data['email']).first()
    if check_user and (check_user != current_user):
        return 'Email Taken'
    check_user = User.query.filter_by(username=user_data['username']).first()
    if check_user and (check_user != current_user):
        return 'Username Taken'

    current_user.username = user_data['username']
    current_user.first_name = user_data['first_name']
    current_user.last_name = user_data['last_name']
    current_user.gender = user_data['gender']
    current_user.birth_date = user_data['birth_date']
    current_user.email = user_data['email']
    db.session.commit()
    return 'Updated'


@app.route("/posts/<int:travel_id>", methods=['GET'])
def travel(travel_id):
    post = Travel.query.get_or_404(travel_id)
    image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)

    return jsonify({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                    'end_date': post.end_date, 'country': post.country, 'city': post.city,
                    'content': post.content, 'username': post.traveler.username, 'user_id': post.traveler.id,
                    'id': post.id, 'image_file': image_file})


@app.route("/posts/page/<int:page>", methods=['GET'])
def get_posts(page):
    res = []
    all_posts = Travel.query.all()
    posts = Travel.query.order_by(Travel.date_posted.desc()).paginate(page=page, per_page=5)

    for post in posts.items:
        image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)
        res.append({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                    'end_date': post.end_date, 'country': post.country, 'city': post.city,
                   'content': post.content, 'username': post.traveler.username,
                    'user_id': post.traveler.id, 'id': post.id, 'image_file': image_file})

    result = sorted(res, key=lambda d: d['id'], reverse=True)
    return jsonify({'posts': result, 'length': len(all_posts)})


@app.route("/posts/new", methods=['POST'])
@login_required
def new_travel():
    data = request.get_json()
    if not data or not 'start_date' in data or not 'end_date' in data or not 'country' in data \
            or not 'city' in data or not 'content' in data or not 'title' in data:
        abort(400)

    location = geolocator.geocode(data['city'] + ' '+data['country'])
    if location is None:
        return 'Bad Location'
    travel = Travel(start_date=data['start_date'], end_date=data['end_date'], country=data['country'],
                    city=data['city'], latitude=location.latitude, longitude=location.longitude, content=data['content'], traveler=current_user,
                    title=data['title'])
    db.session.add(travel)
    db.session.commit()
    return 'Created'


@app.route("/posts/<int:travel_id>", methods=['PUT'])
@login_required
def update_travel(travel_id):
    data = request.get_json()
    post = Travel.query.get_or_404(travel_id)
    if post.traveler != current_user:
        abort(403)

    if not data or not 'start_date' in data or not 'end_date' in data or not 'country' in data \
            or not 'city' in data or not 'content' in data:
        abort(400)

    location = geolocator.geocode(data['city']+' '+data['country'])
    if location is None:
        return 'Bad Location'

    post.start_date = data['start_date']
    post.end_date = data['end_date']
    post.country = data['country']
    post.city = data['city']
    post.latitude = location.latitude
    post.longitude = location.longitude
    post.content = data['content']
    post.title = data['title']
    db.session.commit()
    return 'Updated'


@app.route("/posts/<int:travel_id>", methods=['DELETE'])
@login_required
def delete_post_user(travel_id):
    post = Travel.query.get_or_404(travel_id)
    if post.traveler != current_user:
        abort(403)
    db.session.delete(post)
    db.session.commit()
    return 'Deleted', 201


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
    logout_user()
    return 'Logged Out', 201


@app.route('/follow/<int:user_id>', methods=['POST'])
@login_required
def follow(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        abort(400)

    current_user.follow(user)
    db.session.commit()

    return 'Followed', 200


@app.route('/follow/<int:user_id>', methods=['DELETE'])
@login_required
def unfollow(user_id):
    user = User.query.get_or_404(user_id)

    if not current_user.is_following(user):
        abort(400)

    current_user.unfollow(user)
    db.session.commit()

    return 'Unfollowed', 200


@app.route('/followers/<int:user_id>', methods=['GET'])
def followers(user_id):
    user = User.query.get_or_404(user_id)

    page = request.args.get('page', 1, type=int)
    pagination = user.followers.order_by(Follow.timestamp.desc()).paginate(page, per_page=5)
    res = []

    for item in pagination.items:
        image_file = url_for('static', filename='profile_pics/' + item.follower.image_file)
        res.append({'id': item.follower.id, 'username': item.follower.username, 'image_file': image_file,
                    'timestamp': item.timestamp})

    result = sorted(res, key=lambda d: d['timestamp'], reverse=True)
    return jsonify({'followers': result, 'length': len(user.followers.all())})


@app.route('/following/<user_id>', methods=['GET'])
def followed_by(user_id):
    user = User.query.get_or_404(user_id)
    page = request.args.get('page', 1, type=int)

    pagination = user.followed.order_by(Follow.timestamp.desc()).paginate(page, per_page=5)
    res = []

    for item in pagination.items:
        image_file = url_for('static', filename='profile_pics/' + item.followed.image_file)
        res.append({'id': item.followed.id, 'username': item.followed.username, 'image_file': image_file,
                    'timestamp': item.timestamp})

    result = sorted(res, key=lambda d: d['timestamp'], reverse=True)
    return jsonify({'following': result, 'length': len(user.followed.all())})


@app.route('/is_following/<int:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/is_following_me/<int:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)

    if user.is_following(current_user):
        return 'True'
    return 'False'

#posts written by current user and the people he follows only
@app.route('/followed_posts/page/<int:page>', methods=['GET'])
@login_required
def followed_posts(page):
    res = []
    followed_users_posts = Travel.query.join(Follow, Follow.followed_id == Travel.user_id) \
        .filter(Follow.follower_id == current_user.id)
    user_posts = current_user.travels
    all_posts = user_posts.union(followed_users_posts).order_by(Travel.date_posted.desc())
    posts = all_posts.paginate(page=page, per_page=5)
    for post in posts.items:
        image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)
        res.append({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                    'end_date': post.end_date, 'country': post.country, 'city': post.city,
                   'content': post.content, 'username': post.traveler.username,
                    'user_id': post.traveler.id, 'id': post.id, 'image_file': image_file})

    result = sorted(res, key=lambda d: d['id'], reverse=True)
    return jsonify({'posts': result, 'length': len(all_posts.all())})


