from flask import Flask
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
from geopy.geocoders import Nominatim

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:12345678@localhost/postgres'
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
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
