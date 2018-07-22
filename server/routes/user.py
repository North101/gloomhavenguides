from flask import jsonify, request

import mongoengine

from cerberus import Validator

import jwt

from ..app import app
from .. import models
from .. import schemas
from .. import exceptions
from . import util

import bcrypt


@app.route('/api/register', methods=['POST'])
def route_api_register():
    data = schemas.register_user.normalized(request.get_json())
    if not schemas.register_user.validate(data):
        raise exceptions.DataValidationError('', payload={
            'fields': schemas.register_user.errors,
        })

    try:
        invite = models.InviteModel.objects(pk=data['invite_id']).get()
    except (mongoengine.DoesNotExist, mongoengine.errors.ValidationError) as e:
        raise exceptions.UserInvalidInviteError(payload={
            'invite_id': data['invite_id'],
        })

    if invite.user:
        raise exceptions.UserInvalidInviteError(payload={
            'invite_id': data['invite_id'],
        })

    if models.UserModel.objects(username=data['username']).first():
        raise exceptions.UserUsernameAlreadyExists(payload={
            'username': data['username'],
        })

    user = models.UserModel(
        username=data['username'],
        password=bcrypt.hashpw(data['password'], bcrypt.gensalt()),
        activated=True,
    )
    user.save()

    auth_token = models.AuthTokenModel(
        user=user,
    )
    auth_token.save()

    invite.user = user
    invite.save()

    return jsonify({
        'user': user,
        'auth_token': auth_token.encode_auth_token(),
    })


@app.route('/api/login', methods=['POST'])
def route_api_login():
    data = schemas.login_user.normalized(request.get_json())
    if not schemas.login_user.validate(data):
        raise exceptions.DataValidationError('', payload={
            keys: schemas.login_user.errors,
        })

    try:
        user = models.UserModel.objects(username=data['username']).get()
    except mongoengine.DoesNotExist as e:
        raise exceptions.UserInvalidUsernameOrPasswordError()

    try:
        correct_password = bcrypt.checkpw(data['password'], user.password)
    except ValueError as e:
        correct_password = False

    if not correct_password:
        raise exceptions.UserInvalidUsernameOrPasswordError()

    if not user.activated:
        raise exceptions.AuthUserDeactivatedError()

    auth_token = models.AuthTokenModel(
        user=user,
    )
    auth_token.save()

    return jsonify({
        'user': user,
        'auth_token': auth_token.encode_auth_token(),
    })


@app.route('/api/logout', methods=['POST'])
def route_api_logout():
    auth_token = util.auth_token_from_request()

    auth_token.revoked = True
    auth_token.save()

    return ''


@app.route('/api/me', methods=['GET', 'PATCH', 'DELETE'])
def route_api_me():
    if request.method == 'GET':
        auth_token = util.auth_token_from_request()

        user = auth_token.user
        return jsonify(user)

    elif request.method == 'PATCH':
        auth_token = util.auth_token_from_request()

        data = schemas.update_user.normalized(request.get_json())
        if not schemas.update_user.validate(data):
            raise exceptions.DataValidationError(payload={
                'fields': schemas.update_user.errors
            })

        user = auth_token.user
        if 'password' in data:
            user.password = data['password']
        user.save()

        return jsonify(user)

    elif request.method == 'DELETE':
        auth_token = util.auth_token_from_request()

        user = auth_token.user
        user.activated = False
        user.save()

        return jsonify(user)
