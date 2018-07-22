from .base import BaseUnauthorizedError


class AuthTokenNotSetError(BaseUnauthorizedError):
    message = 'Authorization not set. Please log in again.'


class AuthTokenNotSetError(BaseUnauthorizedError):
    message = 'Signature expired. Please log in again.'


class AuthTokenInvalidError(BaseUnauthorizedError):
    message = 'Invalid token. Please log in again.'


class AuthTokenExpiredError(AuthTokenInvalidError):
    pass


class AuthTokenRevokedError(AuthTokenInvalidError):
    pass


class AuthUserDeactivatedError(BaseUnauthorizedError):
    message = 'Deactivated user.'


class AuthUserNotAdminError(BaseUnauthorizedError):
    message = 'Authenticated user is not an admin.'
