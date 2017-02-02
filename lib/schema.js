'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = schema;

var _ramda = require('ramda');

var _fields = require('./fields');

var fields = _interopRequireWildcard(_fields);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function schema(type, definition) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var schemaFactory = function schemaFactory() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options,
            _ref$include = _ref.include,
            include = _ref$include === undefined ? [] : _ref$include,
            _ref$jsonApiType = _ref.jsonApiType,
            jsonApiType = _ref$jsonApiType === undefined ? type : _ref$jsonApiType;

        return {
            type: type,
            jsonApiType: jsonApiType,
            include: include,
            definition: (0, _ramda.compose)(_ramda.fromPairs, (0, _ramda.concat)([['id', fields.id()]]), _ramda.toPairs)(definition)
        };
    };

    var defaultSchema = schemaFactory();
    return Object.keys(defaultSchema).reduce(function (a, x) {
        a[x] = defaultSchema[x];
        return a;
    }, schemaFactory);
}