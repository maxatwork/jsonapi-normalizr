'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalize = exports.fields = exports.schema = undefined;

var _schema2 = require('./schema');

var _schema3 = _interopRequireDefault(_schema2);

var _fields2 = require('./fields');

var _fields = _interopRequireWildcard(_fields2);

var _normalize2 = require('./normalize');

var _normalize3 = _interopRequireDefault(_normalize2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.schema = _schema3.default;
exports.fields = _fields;
exports.normalize = _normalize3.default;