import datetime

import mongoengine

import jwt

from .base import BaseModel, VersionedModel, update_versioned
from .user import UserModel


@update_versioned.apply
class InviteModel(VersionedModel):
    user = mongoengine.ReferenceField(UserModel, null=True, default=lambda: None)
