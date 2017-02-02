'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ensureArray = exports.normalizeEntity = exports.normalizeEntityField = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = normalize;

var _ramda = require('ramda');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var normalizeEntityField = exports.normalizeEntityField = (0, _ramda.curry)(function (entity, fieldDefinition, name) {
    return fieldDefinition.normalize(name, entity);
});

var normalizeEntity = exports.normalizeEntity = (0, _ramda.curry)((0, _ramda.compose)(function (schema, entity) {
    return (0, _ramda.mapObjIndexed)(normalizeEntityField(entity), schema.definition);
}));

var ensureArray = exports.ensureArray = function ensureArray(x) {
    return Array.isArray(x) ? x : [x];
};

function normalize(schema, _ref) {
    var data = _ref.data,
        _ref$included = _ref.included,
        included = _ref$included === undefined ? [] : _ref$included;

    var fieldSchemas = (0, _ramda.compose)(_ramda.fromPairs, (0, _ramda.map)(function (x) {
        return [x.jsonApiType, x];
    }), (0, _ramda.filter)(Boolean), (0, _ramda.map)(function (key) {
        return schema.definition[key].schema || null;
    }), (0, _ramda.filter)(function (key) {
        return (0, _ramda.hasIn)(key, schema.definition);
    }))(schema.include);

    var result = {
        result: {
            type: schema.type,
            id: Array.isArray(data) ? data.map(function (x) {
                return x.id;
            }) : data.id
        },
        entities: (0, _ramda.merge)(_defineProperty({}, schema.type, (0, _ramda.compose)(_ramda.fromPairs, (0, _ramda.map)((0, _ramda.compose)(function (x) {
            return [x.id, x];
        }, normalizeEntity(schema))), ensureArray)(data)), (0, _ramda.compose)(_ramda.fromPairs, (0, _ramda.map)(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                key = _ref3[0],
                value = _ref3[1];

            return [fieldSchemas[key].type, value];
        }), _ramda.toPairs, (0, _ramda.mapObjIndexed)(function (entities, type) {
            return (0, _ramda.compose)(_ramda.fromPairs, (0, _ramda.map)((0, _ramda.compose)(function (x) {
                return [x.id, x];
            }, normalizeEntity(fieldSchemas[type]))))(entities);
        }), (0, _ramda.groupBy)(function (entity) {
            return entity.type;
        }), (0, _ramda.filter)(function (entity) {
            return (0, _ramda.hasIn)(entity.type, fieldSchemas);
        }))(included))
    };

    return result;
}