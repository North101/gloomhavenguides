import datetime
import os
from dotenv import load_dotenv
from functools import wraps, update_wrapper

from flask import Flask, abort, jsonify, make_response, render_template, request, Response, send_from_directory
from flask.json import JSONEncoder
from flask_compress import Compress
from flask_cors import CORS

import json
import mongoengine
from os import listdir
from os.path import isfile, join

from bson.objectid import ObjectId

from . import models
from . import schemas


load_dotenv()


def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.datetime.now()
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)


class ModelJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, (mongoengine.Document, mongoengine.EmbeddedDocument)):
            return {
                obj._translate_field_name(field): getattr(obj, field)
                for field in obj._fields_ordered
                if not field.startswith('_') and ('allowed_fields' not in obj._meta or obj._translate_field_name(field) in obj._meta['allowed_fields'])
            }
        elif isinstance(obj, (datetime.date, datetime.datetime, datetime.time)):
            return obj.isoformat()

        return super().default(obj)


app = Flask(__name__, static_folder='./client')
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']
app.json_encoder = ModelJSONEncoder
CORS(app)
Compress(app)

app.mongo = mongoengine.connect(host=os.environ['MONGODB_URI'])


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@nocache
def serve(path):
    if path.startswith('node_modules'):
        pass
    elif path.startswith('images'):
        pass
    elif path != "":
        path = 'dist/' + path
    else:
        path = 'index.html'

    if not os.path.exists(os.path.join(os.path.abspath('./client'), path)):
        path = 'index.html'

    return send_from_directory(os.path.abspath('./client'), path)
