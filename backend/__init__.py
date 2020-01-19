from flask import Flask
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
from geopy.geocoders import Nominatim
import os

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

CORS(app, supports_credentials=True)


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://finalProject:withatwist@localhost:5432/FlyMeToTheMoon'
app.config['SECRET_KEY'] = 'qazxdrfvgyhnjik,lp'
app.config['JWT_SECRET_KEY'] = 'secret'
app.debug = True
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
geolocator = Nominatim(user_agent="FlaskApp")

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

from FlaskApp import routes
