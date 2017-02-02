import {compose, concat, toPairs, fromPairs} from 'ramda'
import * as fields from './fields'

export default function schema(type, definition, options = {}) {
    const schemaFactory = ({include = [], jsonApiType = type} = options) => ({
        type,
        jsonApiType,
        include,
        definition: compose(
            fromPairs,
            concat([['id', fields.id()]]),
            toPairs
        )(definition)
    })

    const defaultSchema = schemaFactory()
    return Object.keys(defaultSchema).reduce(
        (a, x) => {
            a[x] = defaultSchema[x]
            return a
        },
        schemaFactory
    )
}
