import { createHash } from 'crypto'
import {
  assoc,
  camelCase,
  cloneDeep,
  identity,
  isPlainObject,
  lowerFirst,
  upperFirst,
} from 'lodash/fp'
import isPromise from 'p-is-promise'
import stringify from 'json-stringify-safe'

// Default parent ID for all nodes.
const DEFAULT_PARENT_ID = `__SOURCE__`

// Node fields used internally by Gatsby.
const RESTRICTED_NODE_FIELDS = [
  `id`,
  `children`,
  `parent`,
  `fields`,
  `internal`,
]

// Generates an MD5 hash from a string.
const digest = str =>
  createHash(`md5`)
    .update(str)
    .digest(`hex`)

// Generates an MD5 hash of an object and assign it to the internal.contentDigest key.
const withDigest = obj =>
  assoc([`internal`, `contentDigest`], digest(stringify(obj)), obj)

/**
 * Returns node helpers for creating new nodes.
 * @param {{sourceId?: string, typePrefix?: string, conflictFieldPrefix?: string}} [options={}]
 */
const createNodeHelpers = (options = {}) => {
  if (!isPlainObject(options))
    throw new Error(
      `Options must be an object. An argument of type ${typeof options} was provided.`,
    )

  if (
    typeof options.sourceId !== `undefined` &&
    typeof options.sourceId !== `string`
  )
    throw new Error(
      `options.sourceId must be a string. A value of type ${typeof options.sourceId} was provided.`,
    )

  if (typeof options.typePrefix !== `string`)
    throw new Error(
      `options.typePrefix must be a string. A value of type ${typeof options.typePrefix} was provided.`,
    )

  if (
    typeof options.conflictFieldPrefix !== `undefined` &&
    typeof options.conflictFieldPrefix !== `string`
  )
    throw new Error(
      `options.conflictFieldPrefix must be a string. A value of type ${typeof options.conflictFieldPrefix} was provided.`,
    )

  const {
    sourceId = DEFAULT_PARENT_ID,
    typePrefix,
    conflictFieldPrefix = lowerFirst(typePrefix),
  } = options

  /**
   * Generates a node ID from a given type and node ID.
   * @param {string} type
   * @param {string} id
   */
  const generateNodeId = (type, id) =>
    `${typePrefix}__${upperFirst(camelCase(type))}__${id}`

  /**
   * Generates a node type name from a given type.
   * @param {string} type
   */
  const generateTypeName = type =>
    upperFirst(camelCase(`${typePrefix} ${type}`))

  // Prefixes conflicting node fields.
  const prefixConflictingKeys = obj => {
    Object.keys(obj).forEach(key => {
      if (RESTRICTED_NODE_FIELDS.includes(key)) {
        obj[conflictFieldPrefix + upperFirst(key)] = obj[key]
        delete obj[key]
      }
    })

    return obj
  }

  /**
   * Creates a node factory with a given type and middleware processor.
   * @param {string} type
   * @param {(node: Object) => Object | Promise<Object>} [middleware]
   * @returns {(obj: Object, overrides?: Object) => Object | Promise<Object>}
   */
  const createNodeFactory = (type, middleware = identity) => (
    obj,
    overrides = {},
  ) => {
    // if (!isPlainObject(obj))
    //   throw new Error(
    //     `The source object must be a plain object. An argument of type "${typeof obj}" was provided.`,
    //   )

    // if (!isPlainObject(overrides))
    //   throw new Error(
    //     `Node overrides must be a plain object. An argument of type "${typeof overrides}" was provided.`,
    //   )

    const clonedObj = cloneDeep(obj)
    const safeObj = prefixConflictingKeys(clonedObj)

    let node = {
      ...safeObj,
      id: generateNodeId(type, obj.id),
      parent: sourceId,
      children: [],
      internal: {
        type: generateTypeName(type),
      },
    }

    node = middleware(node)

    if (isPromise(node))
      return node.then(resolvedNode =>
        withDigest({
          ...resolvedNode,
          ...overrides,
        }),
      )

    return withDigest({
      ...node,
      ...overrides,
    })
  }

  return {
    createNodeFactory,
    generateNodeId,
    generateTypeName,
  }
}

export default createNodeHelpers
