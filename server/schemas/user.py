import re
from cerberus import Validator

username_regex = r'^[a-zA-Z0-9]+$'


def username_validator(field, value, error):
    if not re.match(username_regex, value):
        error(field, f'Username \'{value}\' contains invalid characters.')


register_user = Validator({
    'username': {
        'type': 'string',
        'required': True,
        'minlength': 4,
        'validator': username_validator,
    },
    'password': {
        'type': 'string',
        'required': True,
        'minlength': 8,
    },
    'invite_id': {
        'type': 'string',
        'required': True,
    },
}, purge_unknown=True)

login_user = Validator({
    'username': {
        'type': 'string',
        'required': True,
    },
    'password': {
        'type': 'string',
        'required': True,
    },
}, purge_unknown=True)

update_user = Validator({
    'password': {
        'type': 'string',
        'required': True,
        'minlength': 8,
    },
}, purge_unknown=True)
