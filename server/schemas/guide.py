import os
from cerberus import Validator


def is_directory_traversal(directory, filename):
    current_directory = os.path.abspath(os.curdir)
    requested_path = os.path.relpath(filename, start=current_directory)
    requested_path = os.path.abspath(requested_path)
    common_prefix = os.path.commonprefix([requested_path, current_directory])
    return common_prefix != current_directory


def image_validator(field, value, error):
    directory = os.path.abspath('./client/images')
    filename = value + '.jpg'
    if is_directory_traversal(directory, filename) or not os.path.exists(os.path.join(directory, filename)):
        error(field, "Invalid image")


guide_item_header = {
    'schema': {
        'type': {
            'type': 'string',
            'allowed': ['header'],
            'required': True,
        },
        'text': {
            'type': 'string',
            'required': True,
        },
    },
}

guide_item_images = {
    'schema': {
        'type': {
            'type': 'string',
            'allowed': ['images'],
            'required': True,
        },
        'images': {
            'type': 'list',
            'required': True,
            #'minlength': 1,
            'schema': {
                'type': 'dict',
                'required': True,
                'schema': {
                    'image': {
                        'type': 'string',
                        'required': True,
                        'validator': image_validator,
                    },
                    'spoiler': {
                        'type': 'string',
                        'nullable': True,
                    },
                },
            },
        },
        'rows': {
            'type': 'integer',
            'min': 1,
            'nullable': True,
        },
        'align': {
            'type': 'string',
            'allowed': [None, 'left', 'center', 'right'],
            'nullable': True,
        },
        'spoiler': {
            'type': 'string',
            'nullable': True,
        },
    }
}

guide_item_comment = {
    'schema': {
        'type': {
            'type': 'string',
            'allowed': ['comment'],
            'required': True,
        },
        'text': {
            'type': 'string',
            'required': True,
        },
        'spoiler': {
            'type': 'string',
            'nullable': True,
        },
    },
}

guide_item_group = {
    'schema': {
        'type': {
            'type': 'string',
            'allowed': ['group'],
            'required': True,
        },
        'spoiler': {
            'type': 'string',
            'nullable': True,
        },
        'items': {
            'type': 'list',
            'required': True,
            #'minlength': 1,
            'schema': {
                'type': 'dict',
                'required': True,
                'anyof': [
                    guide_item_header,
                    guide_item_images,
                    guide_item_comment,
                ],
            },
        },
    },
}

guides_items = {
    'type': 'list',
    'required': True,
    #'minlength': 1,
    'schema': {
        'type': 'dict',
        'required': True,
        'anyof': [
            guide_item_group,
            guide_item_header,
            guide_item_images,
            guide_item_comment,
        ]
    }
}

create_guide = Validator({
    'title': {
        'type': 'string',
        'required': True,
    },
    'spoiler': {
        'type': 'string',
        'nullable': True,
    },
    'class': {
        'type': 'string',
        'nullable': True,
    },
    'items': guides_items,
}, purge_unknown=True)

update_guide = Validator({
    'title': {
        'type': 'string',
    },
    'spoiler': {
        'type': 'string',
        'nullable': True,
    },
    'class': {
        'type': 'string',
        'nullable': True,
    },
    'items': guides_items,
}, purge_unknown=True)
