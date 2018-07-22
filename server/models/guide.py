import mongoengine

from .base import BaseModel, VersionedModel, update_versioned
from .user import UserModel


CLASS_TYPE_01 = 'class_01'
CLASS_TYPE_02 = 'class_02'
CLASS_TYPE_03 = 'class_03'
CLASS_TYPE_04 = 'class_04'
CLASS_TYPE_05 = 'class_05'
CLASS_TYPE_06 = 'class_06'
CLASS_TYPE_07 = 'class_07'
CLASS_TYPE_08 = 'class_08'
CLASS_TYPE_09 = 'class_09'
CLASS_TYPE_10 = 'class_10'
CLASS_TYPE_11 = 'class_11'
CLASS_TYPE_12 = 'class_12'
CLASS_TYPE_13 = 'class_13'
CLASS_TYPE_14 = 'class_14'
CLASS_TYPE_15 = 'class_15'
CLASS_TYPE_16 = 'class_16'
CLASS_TYPE_17 = 'class_17'

CLASS_TYPES = {
    CLASS_TYPE_01,
    CLASS_TYPE_02,
    CLASS_TYPE_03,
    CLASS_TYPE_04,
    CLASS_TYPE_05,
    CLASS_TYPE_06,
    CLASS_TYPE_07,
    CLASS_TYPE_08,
    CLASS_TYPE_09,
    CLASS_TYPE_10,
    CLASS_TYPE_11,
    CLASS_TYPE_12,
    CLASS_TYPE_13,
    CLASS_TYPE_14,
    CLASS_TYPE_15,
    CLASS_TYPE_16,
    CLASS_TYPE_17,
}


class GuideItemModel(mongoengine.EmbeddedDocument):
    meta = {
        'abstract': True,
        'allow_inheritance': True
    }


class GuideItem2Model(GuideItemModel):
    meta = {
        'abstract': True,
        'allow_inheritance': True
    }


class GuideItemGroupModel(GuideItemModel):
    type = mongoengine.StringField(required=True, choices=['group'])
    spoiler = mongoengine.StringField(null=True, default=lambda: None)
    items = mongoengine.ListField(mongoengine.EmbeddedDocumentField(GuideItem2Model), required=False)


class GuideItemHeaderModel(GuideItem2Model):
    type = mongoengine.StringField(required=True, choices=['header'])
    text = mongoengine.StringField(required=True)


class GuideItemImageModel(mongoengine.EmbeddedDocument):
    spoiler = mongoengine.StringField(null=True, default=lambda: None)
    image = mongoengine.StringField(required=False)


class GuideItemImagesModel(GuideItem2Model):
    type = mongoengine.StringField(required=True, choices=['images'])
    spoiler = mongoengine.StringField(null=True, default=lambda: None)
    rows = mongoengine.IntField(null=True, default=lambda: None)
    align = mongoengine.StringField(null=True, cboices=['left', 'center', 'right'], default=lambda: None)
    images = mongoengine.ListField(mongoengine.EmbeddedDocumentField(GuideItemImageModel), required=False)


class GuideItemCommentModel(GuideItem2Model):
    type = mongoengine.StringField(required=True, choices=['comment'])
    text = mongoengine.StringField(required=True)
    spoiler = mongoengine.StringField(null=True, default=lambda: None)


@update_versioned.apply
class GuideModel(VersionedModel):
    title = mongoengine.StringField(required=True)
    class_ = mongoengine.StringField(null=True, default=lambda: None, db_field='class', choices=CLASS_TYPES)
    spoiler = mongoengine.StringField(null=True, default=lambda: None)
    author = mongoengine.ReferenceField(UserModel, required=True)
    items = mongoengine.ListField(mongoengine.EmbeddedDocumentField(GuideItemModel), required=False)
