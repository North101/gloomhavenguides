from .base import *


class GuideNotFoundError(BaseNotFoundError):
    message = 'Guide \'{id}\' not found.'


class GuideAuthUserNotAuthorError(BaseUnauthorizedError):
    message = 'Authenticated user is not the author.'
