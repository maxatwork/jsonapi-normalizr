import {expect} from 'chai'
import {normalize, schema, fields} from '../src'
import {normalizeEntity, normalizeEntityField} from '../src/normalize'

describe('src/normalize.js', () => {
    const foos = [
        {
            id: 'foo1',
            type: 'foos',
            attributes: {foo: 'bar', bar: 'baz'},
            relationships: {
                baz: {data: {id: 'baz1', type: 'bazs'}},
                quxs: {
                    data: [
                        {id: 'qux1', type: 'quxs'},
                        {id: 'qux2', type: 'quxs'}
                    ]
                }
            }
        },
        {
            id: 'foo2',
            type: 'foos',
            attributes: {foo: 'baz', bar: 'qux'}
        }
    ]

    const bazs = [
        {
            id: 'baz1',
            type: 'bazs',
            attributes: {baz: 'baz'}
        },
        {
            id: 'baz2',
            type: 'bazs',
            attributes: {baz: 'bazz'}
        },
        {
            id: 'baz3',
            type: 'bazs',
            attributes: {baz: 'bazzz'}
        }
    ]

    const quxs = [
        {
            id: 'qux1',
            type: 'quxs',
            attributes: {qux: 'qux'},
            relationships: {
                baz: {data: {id: 'baz2', type: 'bazs'}}
            }
        },
        {
            id: 'qux2',
            type: 'quxs',
            attributes: {qux: 'quux'}
        }
    ]

    const bazSchema = schema('bazs', {})
    const quxSchema = schema('quxs', {
        qux: fields.string()
    })

    const fooSchema = schema('foos', {
        foo: fields.string(),
        bar: fields.string({required: true}),
        baz: fields.relationship(bazSchema),
        quxs: fields.relationship(quxSchema, {many: true})
    })

    describe('normalizeEntityField()', () => {
        it('must return value of specified field using field definition', () => {
            expect(normalizeEntityField(foos[0], fields.string(), 'foo'))
                .to.equal('bar')
        })
    })

    describe('normalizeEntity()', () => {
        it('must return normalized entity', () => {
            expect(normalizeEntity(fooSchema, foos[0])).to.be.deep.equal({
                id: 'foo1',
                foo: 'bar',
                bar: 'baz',
                baz: {type: 'bazs', id: 'baz1'},
                quxs: [{type: 'quxs', id: 'qux1'}, {type: 'quxs', id: 'qux2'}]
            })
        })
    })

    describe('normalize()', () => {
        it('must normalize JSON API structure for one entity', () => {
            const actual = normalize(
                fooSchema({include: ['quxs']}),
                {
                    data: foos[0],
                    included: quxs
                }
            )

            const expected = {
                result: {type: 'foos', id: 'foo1'},
                entities: {
                    foos: {
                        'foo1': {
                            id: 'foo1',
                            foo: 'bar',
                            bar: 'baz',
                            baz: {type: 'bazs', id: 'baz1'},
                            quxs: [{type: 'quxs', id: 'qux1'}, {type: 'quxs', id: 'qux2'}]
                        },
                    },
                    quxs: {
                        'qux1': {
                            id: 'qux1',
                            qux: 'qux'
                        },
                        'qux2': {
                            id: 'qux2',
                            qux: 'quux'
                        }
                    }
                }
            }

            expect(actual).to.deep.equal(expected)
        })

        it('must normalize JSON API structure for several entities', () => {
            const actual = normalize(fooSchema, {
                data: foos
            })

            const expected = {
                result: {type: 'foos', id: ['foo1', 'foo2']},
                entities: {
                    foos: {
                        'foo1': {
                            id: 'foo1',
                            foo: 'bar',
                            bar: 'baz',
                            baz: {type: 'bazs', id: 'baz1'},
                            quxs: [{type: 'quxs', id: 'qux1'}, {type: 'quxs', id: 'qux2'}]
                        },
                        'foo2': {
                            id: 'foo2',
                            foo: 'baz',
                            bar: 'qux',
                            baz: null,
                            quxs: null
                        }
                    }
                }
            }

            expect(actual).to.deep.equal(expected)
        })

        it('must normalize JSON API data with different JSON API and schema types', () => {
            const bazSchema = schema('bazs', {}, {jsonApiType: 'baz_s'})
            const quxSchema = schema('quxs', {
                qux: fields.string()
            }, {jsonApiType: 'qux_s'})

            const fooSchema = schema('foos', {
                foo: fields.string(),
                bar: fields.string({required: true}),
                baz: fields.relationship(bazSchema, {fromName: 'bazz'}),
                quxs: fields.relationship(quxSchema, {many: true, fromName: 'quxss'})
            }, {jsonApiType: 'foo_s'})

            const quxs = [
                {
                    id: 'qux1',
                    type: 'qux_s',
                    attributes: {qux: 'qux'},
                    relationships: {
                        baz: {data: {id: 'baz2', type: 'bazs'}}
                    }
                },
                {
                    id: 'qux2',
                    type: 'qux_s',
                    attributes: {qux: 'quux'}
                }
            ]

            const foos = [
                {
                    id: 'foo1',
                    type: 'foo_s',
                    attributes: {foo: 'bar', bar: 'baz'},
                    relationships: {
                        bazz: {data: {id: 'baz1', type: 'baz_s'}},
                        quxss: {
                            data: [
                                {id: 'qux1', type: 'qux_s'},
                                {id: 'qux2', type: 'qux_s'}
                            ]
                        }
                    }
                },
                {
                    id: 'foo2',
                    type: 'foo_s',
                    attributes: {foo: 'baz', bar: 'qux'}
                }
            ]

            const actual = normalize(fooSchema({include: ['quxs']}), {
                data: foos,
                included: quxs
            })

            const expected = {
                result: {type: 'foos', id: ['foo1', 'foo2']},
                entities: {
                    foos: {
                        foo1: {
                            id: 'foo1',
                            foo: 'bar',
                            bar: 'baz',
                            baz: {type: 'bazs', id: 'baz1'},
                            quxs: [{type: 'quxs', id: 'qux1'}, {type: 'quxs', id: 'qux2'}]
                        },
                        foo2: {
                            id: 'foo2',
                            foo: 'baz',
                            bar: 'qux',
                            baz: null,
                            quxs: null
                        }
                    },
                    quxs: {
                        qux1: {
                            id: 'qux1',
                            qux: 'qux'
                        },
                        qux2: {
                            id: 'qux2',
                            qux: 'quux'
                        }
                    }
                }
            }

            expect(actual).to.deep.equal(expected)
        })
    })
})
