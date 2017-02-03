import {
    groupBy, hasIn, merge, filter, keys, curry, compose,
    map, mapObjIndexed, fromPairs, toPairs, pathOr,
    flatten
} from 'ramda'

export const normalizeEntityField = curry(
    (entity, fieldDefinition, name) => fieldDefinition.normalize(name, entity)
)

export const normalizeEntity = curry(
    compose(
        (schema, entity) => {
            return mapObjIndexed(
                normalizeEntityField(entity),
                schema.definition
            )
        }
    )
)

const ensureArray = (x) => Array.isArray(x) ? x : [x]
const getSchemaPath = (fieldName) => ['definition', fieldName, 'schema']

export default function normalize(schema, {data, included = []}) {
    const fieldSchemas = compose(
        fromPairs,
        map(x => [x.jsonApiType, x]),
        filter(Boolean),
        map(compose(
            fieldPath => pathOr(null, fieldPath, schema),
            fieldPath => flatten(map(getSchemaPath, fieldPath)),
            fieldName => fieldName.split('.')
        ))
    )(schema.include)

    const result = {
        result: {
            type: schema.type,
            id: Array.isArray(data) ? data.map(x => x.id) : data.id
        },
        entities: merge(
            {
                [schema.type]: compose(
                    fromPairs,
                    map(compose(
                        x => [x.id, x],
                        normalizeEntity(schema)
                    )),
                    ensureArray
                )(data)
            },
            compose(
                fromPairs,
                map(([key, value]) => [fieldSchemas[key].type, value]),
                toPairs,
                mapObjIndexed(
                    (entities, type) => compose(
                        fromPairs,
                        map(
                            compose(
                                x => [x.id, x],
                                normalizeEntity(fieldSchemas[type])
                            )
                        )
                    )(entities)
                ),
                groupBy(entity => entity.type),
                filter(entity => hasIn(entity.type, fieldSchemas))
            )(included)
        )
    }

    return result
}
