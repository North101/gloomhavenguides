from .base import *


class UserNotFoundError(BaseNotFoundError):
    message = 'User \'{id}\' not found.'


class UserUsernameAlreadyExists(BaseBadRequestError):
    message = 'Username \'{username}\' already exists.'


class UserInvalidInviteError(BaseBadRequestError):
    message = 'Invalid invite code.'


class UserInvalidUsernameOrPasswordError(BaseUnauthorizedError):
    message = 'Invalid username or password.'
