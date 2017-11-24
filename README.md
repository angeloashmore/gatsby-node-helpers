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

```js
import createNodeHelpers from 'gatsby-node-helpers'

const {
  createNodeFactory,
  generateNodeId,
  generateTypeName,
} = createNodeHelpers({
  typePrefix: `Shopify`,
})

export const DocumentNode = createNodeFactory('DocumentNode')
```

### Use the node factory in your `gatsby-node.js`

```js
// gatsby-node.js

import { DocumentNode } from './nodes'
import { getAllDocuments } from './api'

const documents = getAllDocuments()

exports.sourceNodes = async ({ boundActionCreators }) => {
  const { createNode } = boundActionCreators

  const documents = await getAllDocuments()

  documents.forEach(document => {
    const node = DocumentNode(document)
    createNode(node)
  })
}
```

## API

Coming soon...
