import { createContentDigest } from 'gatsby-core-utils'

import { createNodeHelpers } from '../src'

const createNodeId = (input: string): string => `createNodeId(${input})`

const createConfig = () => ({
  typePrefix: 'typePrefix',
  fieldPrefix: 'fieldPrefix',
  createNodeId,
  createContentDigest,
})

const node = {
  // Required ID field
  id: 'id',

  // Arbitrary data field
  foo: 'bar',

  // Reserved Gatsby fields
  internal: 'internal',
  fields: 'fields',
  parent: 'parent',
  children: 'children',
}

test('creates node helpers', () => {
  const config = createConfig()
  const helpers = createNodeHelpers(config)

  expect(Object.keys(helpers)).toEqual([
    'createTypeName',
    'createFieldName',
    'createNodeId',
    'createNodeFactory',
  ])
})

describe('createTypeName', () => {
  test('creates pascalcase name with prefix', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createTypeName('typeName')).toBe('TypePrefixTypeName')
  })

  test('handles numbers and spaces correctly', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createTypeName('123')).toBe('TypePrefix123')
    expect(helpers.createTypeName('1 2 3')).toBe('TypePrefix123')
    expect(helpers.createTypeName('Foo_Bar')).toBe('TypePrefixFooBar')
    expect(helpers.createTypeName('Foo Bar')).toBe('TypePrefixFooBar')
  })

  test('supports array input', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createTypeName(['foo', 'bar'])).toBe('TypePrefixFooBar')
  })
})

describe('createFieldName', () => {
  test('creates camelcase name with prefix', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createFieldName('fieldName')).toBe('fieldPrefixFieldName')
  })

  test('handles numbers and spaces correctly', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createFieldName('123')).toBe('fieldPrefix123')
    expect(helpers.createFieldName('1 2 3')).toBe('fieldPrefix123')
    expect(helpers.createFieldName('Foo_Bar')).toBe('fieldPrefixFooBar')
    expect(helpers.createFieldName('Foo Bar')).toBe('fieldPrefixFooBar')
  })

  test('supports array input', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createFieldName(['foo', 'bar'])).toBe('fieldPrefixFooBar')
  })
})

describe('createNodeId', () => {
  test('creates typePrefix namespaced ID using provided createNodeId function', () => {
    const config1 = createConfig()
    config1.typePrefix = 'type1'
    const helpers1 = createNodeHelpers(config1)

    const config2 = createConfig()
    config2.typePrefix = 'type2'
    const helpers2 = createNodeHelpers(config2)

    expect(helpers1.createNodeId('foo')).toBe('createNodeId(type1 foo)')
    expect(helpers2.createNodeId('foo')).toBe('createNodeId(type2 foo)')
  })

  test('supports array input', () => {
    const config = createConfig()
    const helpers = createNodeHelpers(config)

    expect(helpers.createNodeId(['foo', 'bar'])).toBe(
      'createNodeId(typePrefix foo bar)',
    )
  })
})

describe('createNodeFactory', () => {
  const config = createConfig()
  const helpers = createNodeHelpers(config)
  const fn = helpers.createNodeFactory('TypeName')
  const nodeInput = fn(node)

  test('modifies id field using createNodeId', () => {
    expect(nodeInput.id).toBe(`createNodeId(typePrefix TypeName ${node.id})`)
  })

  test('accepts non-string node IDs', () => {
    const modifiedNode = { ...node, id: [1, 2, 3] }
    const modifiedNodeInput = fn(modifiedNode)

    expect(modifiedNodeInput.id).toBe(
      `createNodeId(typePrefix TypeName ${modifiedNode.id})`,
    )
    expect(modifiedNodeInput.fieldPrefixId).toBe(modifiedNode.id)
  })

  test('identifying an id as globally unique does not namespace id', () => {
    const modifiedFn = helpers.createNodeFactory('TypeName', {
      idIsGloballyUnique: true,
    })
    const modifiedNodeInput = modifiedFn(node)

    expect(modifiedNodeInput.id).toBe(`createNodeId(typePrefix ${node.id})`)
  })

  test('adds internal field with required Gatsby fields', () => {
    expect(nodeInput.internal).toEqual({
      type: 'TypePrefixTypeName',
      contentDigest: expect.any(String),
    })
  })

  test('namespaces conflicting reserved fields', () => {
    expect(nodeInput.fieldPrefixId).toBe(node.id)
    expect(nodeInput.fieldPrefixInternal).toBe(node.internal)
    expect(nodeInput.fieldPrefixFields).toBe(node.fields)
    expect(nodeInput.fieldPrefixParent).toBe(node.parent)
    expect(nodeInput.fieldPrefixChildren).toBe(node.children)
  })

  test('supports array input', () => {
    const modifiedFn = helpers.createNodeFactory(['foo', 'bar'])
    const modifiedNodeInput = modifiedFn(node)

    expect(modifiedNodeInput.internal.type).toBe('TypePrefixFooBar')
  })
})
