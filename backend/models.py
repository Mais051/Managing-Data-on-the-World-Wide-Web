from datetime import datetime
from backend import db, login_manager
from flask_login import UserMixin


class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
   # timestamp = db.Column(db.Date)

    def __repr__(self):
        return f"Follow('{self.timestamp}')"

subscribers_table = db.Table('subscribers',
    db.Column('post_id', db.Integer, db.ForeignKey('travel.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('subscribe_date',db.Date)
)

notification_delete_table = db.Table('notification_delete',
    db.Column('notification_id', db.Integer, db.ForeignKey('notification.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)




class Travel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    address=db.Column(db.Text,nullable=False)
    #country = db.Column(db.Text, nullable=False)
    #city = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    content = db.Column(db.Text, nullable=False)
    notifications=db.relationship('Notification',backref=db.backref('travel'),cascade='all, delete-orphan') #maybe change it to post


    def __repr__(self):
        return f"Travel('{self.date_posted}')"

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(20))
    gender = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date())
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    travels = db.relationship('Travel', backref=('traveler'), foreign_keys=[Travel.user_id], lazy='dynamic', cascade='all, delete-orphan')
    followed = db.relationship('Follow', foreign_keys=[Follow.follower_id], backref=db.backref('follower', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    followers = db.relationship('Follow',
                                foreign_keys=[Follow.followed_id],
                                backref=db.backref('followed', lazy='joined'),
                                lazy='dynamic',
                                cascade='all, delete-orphan')
    subposts = db.relationship(
            "Travel",
            secondary=subscribers_table,
            backref=db.backref('subscribers',lazy='dynamic'))

    deletenotification = db.relationship(
                    "Notification",
                    secondary=notification_delete_table,
                    backref=db.backref('notification_delete',lazy='dynamic'))


    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.image_file}')"

    def is_subscribed(self, post):
        if post.id is None:
            return False

        return db.session.query(self.subposts).filter(
                post_id==post.id).first() is not None

    def subscribe(self,post):
        if not self.is_subscribed(post):
            user.subposts.append(post)
            db.session.commit()
    def unsubscribe(self, post):
        s = db.session.query(subscribers_table).filter(subscribers_table.c.post_id==post.id).first()
        self.subposts.remove(s)
        db.session.commit()
        if s:
            db.session.delete(s)
            db.session.commit()

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower=self, followed=user)
            db.session.add(f)
            db.session.commit()

    def unfollow(self, user):
        f = self.followed.filter_by(followed_id=user.id).first()
        if f:
            db.session.delete(f)
            db.session.commit()

    def is_following(self, user):
        if user.id is None:
            return False

        return self.followed.filter_by(
            followed_id=user.id).first() is not None

    def is_followed_by(self, user):
        if user.id is None:
            return False

        return self.followers.filter_by(
            follower_id=user.id).first() is not None

    def as_dict(self):
    		return {'username': self.username}






class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id=db.Column(db.Integer, db.ForeignKey('travel.id'),nullable=False) #change here to Post.id
    action = db.Column(db.Integer, nullable=False) #0 edited #1 deleted
    notification_date = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f"Notification('{self.notification_date}')"
