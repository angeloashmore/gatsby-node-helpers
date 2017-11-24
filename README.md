# gatsby-node-helpers

Gatsby node helper functions to aid node creation. To be used when creating
[Gatsby source plugins][gatsby-source-plugins].

## Status

[![npm version](https://badge.fury.io/js/gatsby-node-helpers.svg)](http://badge.fury.io/js/gatsby-node-helpers)
[![Build Status](https://secure.travis-ci.org/angeloashmore/gatsby-node-helpers.svg?branch=master)](http://travis-ci.org/angeloashmore/gatsby-node-helpers?branch=master)

## Installation

```sh
npm install --save gatsby-node-helpers
```

## Quick Guide

### Import

Import the default module:

```js
import createNodeHelpers from 'gatsby-node-helpers'
```

### Create node helpers

Call `createNodeHelpers` with options.

```js
import createNodeHelpers from 'gatsby-node-helpers'

const {
  createNodeFactory,
  generateNodeId,
  generateTypeName,
} = createNodeHelpers({
  typePrefix: `Shopify`,
})
```

### Create a node factory

Call `createNodeFactory` with a type name.

```js
import createNodeHelpers from 'gatsby-node-helpers'

const {
  createNodeFactory,
  generateNodeId,
  generateTypeName,
} = createNodeHelpers({
  typePrefix: `Shopify`,
})

export const ProductNode = createNodeFactory(`Product`)
```

### Use the node factory in your `gatsby-node.js`

`ProductNode` accepts an object and returns a new object to be passed to
Gatsby's `createNode` action creator.

It handles setting up Gatsby's internal fields, including the content digest
and node type.

```js
// gatsby-node.js

import { ProductNode } from './nodes'
import { getAllDocuments } from './api'

exports.sourceNodes = async ({ boundActionCreators }) => {
  const { createNode } = boundActionCreators

  const products = await getAllProducts()

  products.forEach(product => {
    const node = ProductNode(product)
    createNode(node)
  })
}
```

## API

Coming soon...

[gatsby-source-plugins]: https://www.gatsbyjs.org/docs/create-source-plugin/
