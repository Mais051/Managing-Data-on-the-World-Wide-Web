import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from FlaskApp import app, db, bcrypt
from FlaskApp.models import User, Travel
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)


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
                    'image_file': image_file})


@app.route("/users/<int:user_id>/posts", methods=['GET'])
def get_user_posts(user_id):
    user = User.query.get_or_404(user_id)
    posts = Travel.query.filter_by(traveler=user)
    result = []
    for post in posts:
        result.append({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                       'end_date': post.end_date, 'country': post.country, 'city': post.city,
                       'zip': post.zip, 'content': post.content})
    return jsonify({'posts': result})


@app.route("/user/new", methods=['POST'])
def register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()
    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        abort(400)
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=data['birth_date'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return 'Created', 201


@app.route("/users/<int:user_id>", methods=['PUT'])
@login_required
def user_update(user_id):
    user_data = request.get_json()
    user = User.query.get_or_404(user_id)
    if current_user != user or not user_data:
        abort(400)
    if not 'password' in user_data or not 'username' in user_data or not 'first_name' in user_data \
            or not 'last_name' in user_data or not 'gender' in user_data or not 'birth_date' in user_data or not 'email' in user_data:
        abort(400)
    if 'image_file' in user_data:
        picture_file = save_picture(user_data['image_file'])
        current_user.image_file = picture_file
    current_user.username = user_data['username']
    current_user.first_name = user_data['first_name']
    current_user.last_name = user_data['last_name']
    current_user.gender = user_data['gender']
    current_user.birth_date = user_data['birth_date']
    current_user.email = user_data['email']
    db.session.commit()

    access_token = create_access_token(identity={'id': user.id, 'username': user.username,
                                                 'first_name': user.first_name,
                                                 'last_name': user.last_name, 'email': user.email,
                                                 'birth_date': user.birth_date, 'gender': user.gender,
                                                 'image_file': user.image_file})
    return access_token


@app.route("/posts/<int:travel_id>", methods=['GET'])
def travel(travel_id):
    post = Travel.query.get_or_404(travel_id)
    return jsonify({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                    'end_date': post.end_date, 'country': post.country, 'city': post.city, 'zip': post.zip,
                    'content': post.content, 'username': post.traveler.username, 'user_id': post.traveler.id})


@app.route("/posts", methods=['GET'])
def get_posts():
    res = []
    posts = Travel.query.all()
    for post in posts:
        res.append({'title': post.title, 'date_posted': post.date_posted, 'start_date': post.start_date,
                    'end_date': post.end_date, 'country': post.country, 'city': post.city,
                    'zip': post.zip, 'content': post.content, 'username': post.traveler.username,
                    'user_id': post.traveler.id})
    return jsonify({'posts': res})


@app.route("/posts/new", methods=['POST'])
@login_required
def new_travel():
    data = request.get_json()
    if not data or not 'start_date' in data or not 'end_date' in data or not 'country' in data \
            or not 'city' in data or not 'zip' in data or not 'content' in data:
        abort(400)
    travel = Travel(start_date=data['start_date'], end_date=data['end_date'], country=data['country'],
                    city=data['city'], zip=data['zip'], content=data['content'], traveler=current_user,
                    title=data['title'])
    db.session.add(travel)
    db.session.commit()
    return 'Created', 201


@app.route("/posts/<int:travel_id>", methods=['PUT'])
@login_required
def update_travel(travel_id):
    data = request.get_json()
    post = Travel.query.get_or_404(travel_id)
    if post.traveler != current_user:
        abort(403)

    if not data or not 'start_date' in data or not 'end_date' in data or not 'country' in data \
            or not 'city' in data or not 'zip' in data or not 'content' in data:
        abort(400)

    post.start_date = data['start_date']
    post.end_date = data['end_date']
    post.country = data['country']
    post.city = data['city']
    post.zip = data['zip']
    post.content = data['content']
    db.session.commit()
    return 'Updated', 201


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
        access_token = create_access_token(identity={'id': user.id, 'username': user.username,
                                                     'first_name': user.first_name,
                                                     'last_name': user.last_name, 'email': user.email,
                                                     'birth_date': user.birth_date, 'gender': user.gender,
                                                     'image_file': user.image_file})
        result = access_token
    else:
        abort(400)

    return result


@app.route("/logout", methods=['GET'])
def logout():
    logout_user()
    return 'Logged Out', 201
