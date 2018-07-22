from flask import jsonify, request

from cerberus import Validator

import mongoengine

from ..app import app
from .. import models
from .. import schemas
from .. import exceptions
from . import util


guide_args = Validator({
    'author': {
        'type': 'string',
    },
    'author_id': {
        'type': 'string',
    },
    'title': {
        'type': 'string',
    },
    'spoiler': {
        'type': 'boolean',
        'coerce': (str, lambda v: v.lower() == 'true'),
    },
    'class': {
        'type': 'string',
        'allowed': list(models.CLASS_TYPES | {''}),
    },
    'count': {
        'type': 'integer',
        'coerce': int,
    },
    'offset': {
        'type': 'integer',
        'coerce': int,
    },
}, purge_unknown=True)


def json_to_guide_item(data):
    type = data['type']
    if type == 'header':
        return models.GuideItemHeaderModel(
            type=data['type'],
            text=data['text'],
        )

    elif type == 'images':
        return models.GuideItemImagesModel(
            type=data['type'],
            spoiler=data.get('spoiler'),
            rows=data.get('rows'),
            align=data.get('align'),
            images=[
                {
                    'image': item['image'],
                    'spoiler': item.get('spoiler'),
                }
                for item in data['images']
            ],
        )

    elif type == 'comment':
        return models.GuideItemCommentModel(
            type=data['type'],
            spoiler=data.get('spoiler'),
            text=data['text'],
        )

    elif type == 'group':
        return models.GuideItemGroupModel(
            type=data['type'],
            spoiler=data.get('spoiler'),
            items=[
                json_to_guide_item(item)
                for item in data['items']
            ],
        )

    else:
        raise ValueError(type)


@app.route('/api/guides', methods=['GET', 'POST'])
def route_api_guides():
    if request.method == 'GET':
        args = guide_args.normalized({
            key: value
            for key, value in request.args.items()
        })
        if not guide_args.validate(args):
            raise exceptions.QueryValidationError(payload=guide_args.errors)

        guides = []
        try:
            query = models.GuideModel.objects()
            if 'author' in args:
                query = query.filter(author=models.UserModel.objects.filter(username=args['author']).get())
            if 'author_id' in args:
                query = query.filter(author=args['author_id'])
            if 'title' in args:
                query = query.filter(title__icontains=args['title'])
            if 'spoiler' in args:
                if args['spoiler']:
                    query = query.filter(spoiler__ne=None)
                else:
                    query = query.filter(spoiler=None)
            if 'class' in args:
                if args['class']:
                    query = query.filter(class_=args['class'])
                else:
                    query = query.filter(class_=None)
            query2 = query
            if 'offset' in args:
                query = query.skip(args['offset'])
            if 'count' in args:
                query = query.limit(args['count'])

            for guide in query:
                guides.append(guide)
        except RuntimeError as e:
            if str(e) != 'generator raised StopIteration':
                raise e

        respond = jsonify({
            'items': guides,
            'rows': len(guides),
            'offset': args.get('offset', 0),
            'total': query2.count(),
        })
        return respond

    elif request.method == 'POST':
        auth_token = util.auth_token_from_request()

        data = schemas.create_guide.normalized(request.get_json())
        if not schemas.create_guide.validate(data):
            raise exceptions.DataValidationError(payload={
                'fields': schemas.create_guide.errors
            })

        guide = models.GuideModel(
            author=auth_token.user,
            title=data['title'],
            class_=data.get('class'),
            spoiler=data.get('spoiler'),
            items=[
                json_to_guide_item(item)
                for item in data['items']
            ],
        )
        guide.save()

        return jsonify(guide)

    else:
        raise ValueError(request.method)


@app.route('/api/guides/<guide_id>', methods=['GET', 'PATCH', 'DELETE'])
def route_api_guides_id(guide_id):
    if request.method == 'GET':
        try:
            guide = models.GuideModel.objects(pk=guide_id).get()
        except (mongoengine.DoesNotExist, mongoengine.ValidationError) as e:
            raise exceptions.GuideNotFoundError(payload={'id': guide_id})

        return jsonify(guide)

    elif request.method == 'PATCH':
        auth_token = util.auth_token_from_request()

        try:
            guide = models.GuideModel.objects(pk=guide_id).get()
        except (mongoengine.DoesNotExist, mongoengine.ValidationError) as e:
            raise exceptions.GuideNotFoundError(payload={'id': guide_id})

        if guide.author != auth_token.user:
            raise exceptions.GuideAuthUserNotAuthorError()

        data = schemas.update_guide.normalized(request.get_json())
        if not schemas.update_guide.validate(data):
            raise exceptions.DataValidationError(payload={
                'fields': schemas.update_guide.errors
            })

        if 'title' in data:
            guide.title = data['title']
        if 'class' in data:
            guide.class_ = data['class']
        if 'spoiler' in data:
            guide.spoiler = data['spoiler']
        if 'items' in data:
            guide.items = [
                json_to_guide_item(item)
                for item in data['items']
            ]
        guide.save()

        return jsonify(guide)

    elif request.method == 'DELETE':
        auth_token = util.auth_token_from_request()

        try:
            guide = models.GuideModel.objects(pk=guide_id).get()
        except (mongoengine.DoesNotExist, mongoengine.ValidationError) as e:
            raise exceptions.GuideNotFoundError(payload={'id': guide_id})

        if guide.author != auth_token.user:
            raise exceptions.GuideAuthUserNotAuthorError()

        guide.delete()
        return jsonify(guide)

    else:
        raise ValueError(request.method)
