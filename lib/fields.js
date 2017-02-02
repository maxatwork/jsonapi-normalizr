'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.id = id;
exports.string = string;
exports.relationship = relationship;

var _ramda = require('ramda');

var attributeGetter = function attributeGetter(name, entity) {
    return (0, _ramda.path)(['attributes', name], entity);
};

var stringOrDefault = function stringOrDefault(name, defaultValue, value) {
    return value == null ? defaultValue : String(value);
};

var stringRequired = function stringRequired(name, value) {
    if (value == null) throw new Error('Field "' + name + '" required');
    return String(value);
};

var resourceObject = (0, _ramda.curry)(function (schema, resource) {
    return {
        type: schema.type,
        id: resource.id
    };
});

function id() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$valueGetter = _ref.valueGetter,
        valueGetter = _ref$valueGetter === undefined ? _ramda.prop : _ref$valueGetter;

    return {
        normalize: function normalize(name, entity) {
            return stringRequired(name, valueGetter(name, entity));
        }
    };
}

function string() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$fromName = _ref2.fromName,
        fromName = _ref2$fromName === undefined ? null : _ref2$fromName,
        _ref2$required = _ref2.required,
        required = _ref2$required === undefined ? false : _ref2$required,
        _ref2$valueGetter = _ref2.valueGetter,
        valueGetter = _ref2$valueGetter === undefined ? attributeGetter : _ref2$valueGetter,
        _ref2$defaultValue = _ref2.defaultValue,
        defaultValue = _ref2$defaultValue === undefined ? null : _ref2$defaultValue;

    return {
        normalize: function normalize(name, entity) {
            return required ? stringRequired(name, valueGetter(fromName || name, entity)) : stringOrDefault(name, defaultValue, valueGetter(fromName || name, entity));
        }
    };
}

function relationship(schema) {
    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref3$fromName = _ref3.fromName,
        fromName = _ref3$fromName === undefined ? null : _ref3$fromName,
        _ref3$many = _ref3.many,
        many = _ref3$many === undefined ? false : _ref3$many,
        _ref3$required = _ref3.required,
        required = _ref3$required === undefined ? false : _ref3$required,
        _ref3$defaultValue = _ref3.defaultValue,
        defaultValue = _ref3$defaultValue === undefined ? null : _ref3$defaultValue;

    return {
        schema: schema,
        normalize: function normalize(name, entity) {
            if (required && (!entity.relationships || entity.relationships[fromName || name] == null)) {
                throw new Error('Field ' + name + ' required');
            }

            if (!entity.relationships || entity.relationships[fromName || name] == null) {
                return defaultValue;
            }

            return many ? (0, _ramda.map)(resourceObject(schema), entity.relationships[fromName || name].data) : resourceObject(schema, entity.relationships[fromName || name].data);
        }
    };
}