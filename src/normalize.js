import {
    groupBy, hasIn, merge, filter, keys, curry, compose,
    map, mapObjIndexed, fromPairs, toPairs
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

export const ensureArray = (x) => Array.isArray(x) ? x : [x]

export default function normalize(schema, {data, included = []}) {
    const fieldSchemas = compose(
        fromPairs,
        map(x => [x.jsonApiType, x]),
        filter(Boolean),
        map(key => schema.definition[key].schema || null),
        filter((key) => hasIn(key, schema.definition)),
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
