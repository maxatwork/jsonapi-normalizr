import {compose, curry, map, prop, path} from 'ramda'

const attributeGetter = (name, entity) => path(['attributes', name], entity)

const stringOrDefault = (name, defaultValue, value) => value == null
    ? defaultValue
    : String(value)

const stringRequired = (name, value) => {
    if (value == null) throw new Error(`Field "${name}" required`)
    return String(value)
}

const resourceObject = curry(
    (schema, resource) => ({
            type: schema.type,
            id: resource.id
    })
)

export function id({valueGetter = prop} = {}) {
    return {
        normalize: (name, entity) => stringRequired(name, valueGetter(name, entity))
    }
}

export function string({
    fromName = null,
    required = false,
    valueGetter = attributeGetter,
    defaultValue = null
} = {}) {
    return {
        normalize: (name, entity) => required
            ? stringRequired(name, valueGetter(fromName || name, entity))
            : stringOrDefault(name, defaultValue, valueGetter(fromName || name, entity))
    }
}

export function relationship(
    schema,
    {
        fromName = null,
        many = false,
        required = false,
        defaultValue = null
    } = {}
) {
    return {
        schema: schema,
        normalize: (name, entity) => {
            const valueIsNull = !entity.relationships ||
                entity.relationships[fromName || name] == null ||
                entity.relationships[fromName || name].data == null

            if (required && valueIsNull) {
                throw new Error(`Field ${name} required`)
            }

            if (valueIsNull) {
                return defaultValue
            }

            return many
                ? map(resourceObject(schema), entity.relationships[fromName || name].data)
                : resourceObject(schema, entity.relationships[fromName || name].data)
        }
    }
}

const getDateOrNull = (date) => date == null ? null : new Date(date)

export function date(
    {
        fromName = null,
        required = false,
        valueGetter = compose(getDateOrNull, attributeGetter),
        defaultValue = null
    } = {}
) {
    return {
        normalize: (name, entity) => valueGetter(fromName || name, entity)
    }
}
