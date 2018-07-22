from flask import request, abort, Response

import json
import jwt

from .. import exceptions
from .. import models


def auth_token_from_request():
    auth_token = request.headers.get('Authorization')
    if auth_token is None:
        raise exceptions.AuthTokenNotSetError()

    try:
        auth_token_id = models.AuthTokenModel.decode_auth_token(auth_token)
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthTokenExpiredError()
    except jwt.InvalidTokenError:
        raise exceptions.AuthTokenInvalidError()

    auth_token = models.AuthTokenModel.objects.with_id(auth_token_id)
    if not auth_token or auth_token.revoked:
        raise exceptions.AuthTokenInvalidError()

    elif not auth_token.user or not auth_token.user.activated:
        raise exceptions.AuthUserDeactivatedError()

    return auth_token
