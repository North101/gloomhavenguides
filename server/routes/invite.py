from flask import jsonify, request

from cerberus import Validator

import mongoengine

from ..app import app
from .. import models
from .. import schemas
from .. import exceptions
from . import util


invite_args = Validator({
    'count': {
        'type': 'integer',
        'coerce': int,
    },
    'offset': {
        'type': 'integer',
        'coerce': int,
    }
}, purge_unknown=True)


@app.route('/api/invites', methods=['GET', 'POST'])
def route_api_invites():
    if request.method == 'GET':
        auth_token = util.auth_token_from_request()
        if not auth_token.user.admin:
            raise exceptions.AuthUserNotAdminError()

        args = invite_args.normalized({
            key: value
            for key, value in request.args.items()
        })
        if not invite_args.validate(args):
            raise exceptions.QueryValidationError(payload=invite_args.errors)

        invites = []
        try:
            query = models.InviteModel.objects()
            query2 = query
            if 'offset' in args:
                query = query.skip(args['offset'])
            if 'count' in args:
                query = query.limit(args['count'])

            for invite in query:
                invites.append(invite)
        except RuntimeError as e:
            if str(e) != 'generator raised StopIteration':
                raise e

        respond = jsonify({
            'items': invites,
            'rows': len(invites),
            'offset': args.get('offset', 0),
            'total': query2.count(),
        })
        return respond

    elif request.method == 'POST':
        auth_token = util.auth_token_from_request()
        if not auth_token.user.admin:
            raise exceptions.AuthUserNotAdminError()

        invite = models.InviteModel()
        invite.save()

        return jsonify(invite)

    else:
        raise ValueError(request.method)


@app.route('/api/invites/<invite_id>', methods=['GET', 'DELETE'])
def route_api_invites_id(invite_id):
    if request.method == 'GET':
        auth_token = util.auth_token_from_request()
        if not auth_token.user.admin:
            raise exceptions.AuthUserNotAdminError()

        try:
            invite = models.InviteModel.objects(pk=invite_id).get()
        except (mongoengine.DoesNotExist, mongoengine.ValidationError) as e:
            raise exceptions.InviteNotFoundError(payload={'id': invite_id})

        return jsonify(invite)

    elif request.method == 'DELETE':
        auth_token = util.auth_token_from_request()
        if not auth_token.user.admin:
            raise exceptions.AuthUserNotAdminError()

        try:
            invite = models.InviteModel.objects(pk=invite_id).get()
        except (mongoengine.DoesNotExist, mongoengine.ValidationError) as e:
            raise exceptions.InviteNotFoundError(payload={'id': invite_id})

        if invite.user:
            raise exceptions.UserInvalidInviteError(payload={'id': invite_id})

        invite.delete()
        return jsonify(invite)

    else:
        raise ValueError(request.method)
