import createNodeHelpers, { __RewireAPI__ as RewireAPI } from './index'

// Get non-exported functions.
const digest = RewireAPI.__GetDependency__(`digest`)
const withDigest = RewireAPI.__GetDependency__(`withDigest`)

describe(`digest`, () => {
  test(`creates an MD5 hash from a string`, () => {
    const str = `The quick brown fox jumps over the lazy dog`
    const md5 = `9e107d9d372bb6826bd81d3542a419d6`

    expect(digest(str)).toBe(md5)
  })
})

describe(`withDigest`, () => {
  test(`sets internal.contentDigest key of an object to the object's MD5 hash`, () => {
    const obj = { key: `value` }
    const md5 = `a7353f7cddce808de0032747a0b7be50`

    expect(withDigest(obj)).toEqual({
      ...obj,
      internal: {
        contentDigest: md5,
      },
    })
  })
})

describe(`createNodeHelpers`, () => {
  const options = {
    sourceId: `sourceId`,
    typePrefix: `TypePrefix`,
    conflictFieldPrefix: `typePrefix`,
  }
  const type = `Type`
  const id = `id`

  test(`throws error when sourceId is provided and not a string`, () => {
    expect(() => {
      createNodeHelpers({ ...options, sourceId: () => {} })
    }).toThrow()
  })

  test(`throws error when typePrefix is not provided`, () => {
    expect(() => {
      createNodeHelpers({ ...options, typePrefix: undefined })
    }).toThrow()
  })

  test(`throws error when typePrefix is provided and not a string`, () => {
    expect(() => {
      createNodeHelpers({ ...options, typePrefix: () => {} })
    }).toThrow()
  })

  test(`throws error when conflictFieldPrefix is provided and not a string`, () => {
    expect(() => {
      createNodeHelpers({ ...options, conflictFieldPrefix: () => {} })
    }).toThrow()
  })

  test(`returns an object with the necessary keys`, () => {
    const helpers = createNodeHelpers(options)

    expect(createNodeHelpers(options)).toMatchObject({
      createNodeFactory: expect.any(Function),
      generateNodeId: expect.any(Function),
      generateTypeName: expect.any(Function),
    })
  })

  describe(`createNodeFactory`, () => {
    const { createNodeFactory } = createNodeHelpers(options)

    test(`returns a function`, () => {
      expect(createNodeFactory(type)).toBeInstanceOf(Function)
    })
  })

  describe(`generateNodeId`, () => {
    const { generateNodeId } = createNodeHelpers(options)

    test(`returns a string`, () => {
      expect(typeof generateNodeId(type, id)).toBe(`string`)
    })
  })

  describe(`generateTypeName`, () => {
    const { generateTypeName } = createNodeHelpers(options)

    test(`returns a string`, () => {
      expect(typeof generateTypeName(type)).toBe(`string`)
    })
  })
})
