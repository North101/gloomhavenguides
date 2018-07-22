import datetime

import mongoengine


def handler(event):
    """Signal decorator to allow use of callback functions as class decorators."""

    def decorator(fn):
        def apply(cls):
            event.connect(fn, sender=cls)
            return cls

        fn.apply = apply
        return fn

    return decorator


@handler(mongoengine.signals.pre_save)
def update_versioned(sender, document):
    if document.pk is None:
        document.version = 0
    else:
        document.version = (document.version or 0) + 1
    document.modified = datetime.datetime.utcnow()


class BaseModel(mongoengine.Document):
    meta = {
        'abstract': True,
    }


class VersionedModel(BaseModel):
    meta = {
        'abstract': True,
        'ordering': ['-modified'],
    }

    version = mongoengine.IntField(required=True, default=0)
    created = mongoengine.DateTimeField(required=True, default=lambda: datetime.datetime.utcnow())
    modified = mongoengine.DateTimeField(required=True, default=lambda: datetime.datetime.utcnow())
