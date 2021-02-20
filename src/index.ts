import * as gatsby from 'gatsby'
import * as pc from 'pascal-case'
import * as cc from 'camel-case'

/**
 * Converts a collection of strings to a single Pascal cased string.
 *
 * @param parts Strings to convert into a single Pascal cased string.
 *
 * @return Pascal cased string version of `parts`.
 */
const pascalCase = (...parts: (string | null | undefined)[]): string =>
  pc.pascalCase(parts.filter((p) => p != null).join(' '), {
    transform: pc.pascalCaseTransformMerge,
  })

/**
 * Converts a collection of strings to a single camel cased string.
 *
 * @param parts Strings to convert into a single camel cased string.
 *
 * @return Camel cased string version of `parts`.
 */
const camelCase = (...parts: (string | null | undefined)[]): string =>
  cc.camelCase(parts.filter((p) => p != null).join(' '), {
    transform: cc.camelCaseTransformMerge,
  })

/**
 * Reserved fields for Gatsby nodes.
 */
const RESERVED_GATSBY_NODE_FIELDS = [
  'id',
  'internal',
  'fields',
  'parent',
  'children',
] as const

interface CreateNodeHelpersParams {
  /** Prefix for all nodes. Used as a namespace for node type names. */
  typePrefix: string
  /**
   * Prefix for field names. Used as a namespace for fields that conflict with
   * Gatsby's reserved field names.
   * */
  fieldPrefix?: string
  /** Gatsby's `createNodeId` helper. */
  createNodeId: gatsby.SourceNodesArgs['createNodeId']
  /** Gatsby's `createContentDigest` helper. */
  createContentDigest: gatsby.SourceNodesArgs['createContentDigest']
}

/**
 * A value that can be converted to a string using `toString()`.
 */
export interface Stringable {
  toString(): string
}

/**
 * A record that can be globally identified using its `id` field.
 */
export interface IdentifiableRecord {
  id: Stringable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Gatsby node helper functions to aid node creation.
 */
export interface NodeHelpers {
  /**
   * Creates a namespaced type name in Pascal case. Nodes created using a
   * `createNodeFactory` function will automatically be namespaced using this
   * function.
   *
   * @param parts Parts of the type name. If more than one string is provided,
   * they will be concatenated in Pascal case.
   *
   * @return Namespaced type name.
   */
  createTypeName: (...parts: string[]) => string

  /**
   * Creates a namespaced field name in camel case. Nodes created using a
   * `createNodeFactory` function will automatically have namespaced fields
   * using this function ONLY if the name conflicts with Gatsby's reserved
   * fields.
   *
   * @param parts Parts of the field name. If more than one string is provided,
   * they will be concatenated in camel case.
   *
   * @return Namespaced field name.
   */
  createFieldName: (...parts: string[]) => string

  /**
   * Creates a deterministic node ID based on the `typePrefix` option provided
   * to `createNodeHelpers` and the provided `parts` argument. Providing the
   * same `parts` will always return the same result.
   *
   * @param parts Strings to globally identify a node within the domain of the
   * node helpers.
   *
   * @return Node ID based on the provided `parts`.
   */
  createNodeId: (...parts: string[]) => string

  /**
   * Creates a function that will convert an identifiable record (one that has
   * an `id` and `type` field) to a valid input for Gatsby's `createNode`
   * action.
   *
   * @param nameParts Parts of the type name for the resulting factory. All
   * records called with the resulting function will have a type name based on
   * this parameter.
   *
   * @return A function that converts an identifiable record to a valid input
   * for Gatsby's `createNode` action.
   */
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifiableRecord) => gatsby.NodeInput
}

/**
 * Creates Gatsby node helper functions to aid node creation.
 */
export const createNodeHelpers = ({
  typePrefix,
  fieldPrefix = typePrefix,
  createNodeId: gatsbyCreateNodeId,
  createContentDigest: gatsbyCreateContentDigest,
}: CreateNodeHelpersParams): NodeHelpers => {
  const createTypeName = (...parts: string[]): string =>
    pascalCase(typePrefix, ...parts)

  const createFieldName = (...parts: string[]): string =>
    camelCase(fieldPrefix, ...parts)

  const createNodeId = (...parts: string[]): string =>
    gatsbyCreateNodeId(
      [typePrefix, ...parts].filter((p) => p != null).join(' '),
    )

  const createNodeFactory = (...nameParts: string[]) => (
    node: IdentifiableRecord,
  ): gatsby.NodeInput => {
    const res = {
      ...node,
      id: createNodeId(...nameParts, node.id.toString()),
      internal: {
        type: createTypeName(...nameParts),
        contentDigest: gatsbyCreateContentDigest(node),
      },
    } as gatsby.NodeInput

    for (const reservedField of RESERVED_GATSBY_NODE_FIELDS) {
      if (reservedField in node) {
        res[createFieldName(reservedField)] = node[reservedField]
      }
    }

    return res
  }

  return {
    createTypeName,
    createFieldName,
    createNodeId,
    createNodeFactory,
  }
}
