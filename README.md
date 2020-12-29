# gatsby-node-helpers

Gatsby node helper functions to aid node creation. To be used when creating
[Gatsby source plugins](https://www.gatsbyjs.org/docs/create-source-plugin/).

- Automatically adds Gatsby's required node fields such as `contentDigest`
- Namespaces fields conflicting with Gatsby's reserved fields
- Creates portable functions for generating compliant type names and IDs

## Status

[![npm version](https://img.shields.io/npm/v/gatsby-node-helpers?style=flat-square)](https://www.npmjs.com/package/gatsby-node-helpers)
[![Build Status](https://img.shields.io/github/workflow/status/angeloashmore/gatsby-node-helpers/CI?style=flat-square)](https://github.com/angeloashmore/gatsby-node-helpers/actions?query=workflow%3ACI)

## Installation

```
npm install --save gatsby-node-helpers
```

## Quick Guide

Import the named module:

```typescript
import { createNodeHelpers } from 'gatsby-node-helpers'
```

Then call `createNodeHelpers` with options. You will need to pass functions
available in Gatsby's Node APIs, such as `sourceNodes` and
`createSchemaCustomization`.

The following example shows usage in `gatsby-node.js`'s `sourceNodes` API, but
it can be used elsewhere provided the appropriate helper functions are
available.

```typescript
// gatsby-node.ts

import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

export const sourceNodes: gatsby.GatsbyNode['sourceNodes'] = async (
  gatsbyArgs: gatsby.SourceNodesArgs,
  pluginOptions: gatsby.PluginOptions,
) => {
  const { createNodeId, createContentDigest } = gatsbyArgs

  const nodeHelpers = createNodeHelpers({
    typePrefix: 'Shopify',
    createNodeId,
    createContentDigest,
  })
}
```

The result of `createNodeHelpers` includes a factory function named
`createNodeFactory` that should be used to prepare an object just before calling
Gatsby's `createNode`.

The created function will automatically assign Gatsby's required fields, like
`internal` and `contentDigest`, while renaming any conflicting fields.

```typescript
const nodeHelpers = createNodeHelpers({
  typePrefix: 'Shopify',
  createNodeId: gatsbyArgs.createNodeId,
  createContentDigest: gatsbyArgs.createContentDigest,
})

const ProductNode = nodeHelpers.createNodeFactory('Product')
const ProductVariantNode = nodeHelpers.createNodeFactory('ProductVariant')
```

In the above example, we can now pass Product objects to `ProductNode` to
prepare the object for Gatsby's `createNode`.

```typescript
// gatsby-node.ts

import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

export const sourceNodes: gatsby.GatsbyNode['sourceNodes'] = async (
  gatsbyArgs: gatsby.SourceNodesArgs,
  pluginOptions: gatsby.PluginOptions,
) => {
  const { actions, createNodeId, createContentDigest } = gatsbyArgs
  const { createNodes } = actions

  const nodeHelpers = createNodeHelpers({
    typePrefix: 'Shopify',
    createNodeId,
    createContentDigest,
  })

  const ProductNode = nodeHelpers.createNodeFactory('Product')
  const ProductVariantNode = nodeHelpers.createNodeFactory('ProductVariant')

  // `getAllProducts` is an API function that returns all Shopify products.
  const products = await getAllProducts()

  for (const product of products) {
    const node = ProductNode(product)

    // `node` now contains all the fields required by `createNode`.

    createNode(node)
  }
}
```

## API

All functions and types are documented in the source files using
[TSDoc](https://github.com/microsoft/tsdoc) to provide documentation directly in
your editor.

If you editor does not have TSDoc integration, you can read all documentation by
viewing the source files.
