from flask import jsonify

from server.app import app


class BaseError(Exception):
    status_code = None
    message = None

    def __init__(self, message=None, status_code=None, payload=None):
        Exception.__init__(self)
        if message is not None:
            self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def body(self):
        data = dict(self.payload or ())
        data.update({
            'type': self.__class__.__name__,
            'message': (
                self.message.format(**self.payload)
                if self.payload
                else self.message
            ),
        })
        return data


class BaseBadRequestError(BaseError):
    status_code = 400


class BaseUnauthorizedError(BaseError):
    status_code = 403


class BaseNotFoundError(BaseError):
    status_code = 404


class DataValidationError(BaseBadRequestError):
    message = "Invalid data."


class QueryValidationError(BaseBadRequestError):
    message = "Invalid query arguments."


@app.errorhandler(BaseError)
def handle_invalid_usage(error):
    response = jsonify(error.body())
    response.status_code = error.status_code
    return response
