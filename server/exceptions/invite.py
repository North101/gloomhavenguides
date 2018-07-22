from .base import *


class InviteNotFoundError(BaseNotFoundError):
    message = 'Invite \'{id}\' not found.'
