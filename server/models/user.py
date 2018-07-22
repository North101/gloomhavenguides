import datetime

import mongoengine

import jwt

from server import app
from .base import BaseModel, VersionedModel, update_versioned


@update_versioned.apply
class UserModel(VersionedModel):
    meta = {'allowed_fields': ['_id', 'username', 'admin']}

    username = mongoengine.StringField(required=True, unique=True)
    password = mongoengine.StringField(required=True)
    activated = mongoengine.BooleanField(required=True)
    admin = mongoengine.BooleanField(required=True, default=lambda: False)


@update_versioned.apply
class AuthTokenModel(VersionedModel):
    user = mongoengine.ReferenceField(UserModel, required=True)
    revoked = mongoengine.BooleanField(required=True, default=lambda: False)

    def encode_auth_token(self):
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
            'sub': str(self.pk)
        }
        return jwt.encode(
            payload,
            self.secret_key(),
            algorithm='HS256',
        ).decode('utf-8')

    @classmethod
    def decode_auth_token(cls, auth_token):
        payload = jwt.decode(auth_token, cls.secret_key())
        return payload['sub']

    @staticmethod
    def secret_key():
        return app.app.config['JWT_SECRET_KEY']
