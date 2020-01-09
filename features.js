const Ajv = require('ajv')
const {existsSync, readJsonSync, writeJsonSync} = require('fs-extra')
const {identity: id, mergeWith} = require('lodash')
const {join} = require('path')
const FN_FEATURES_JSON = 'features.json'
const SCHEMA = require('./features.json')
const {forEach} = require('./iterate')

function walkFeatureSchema(
  {onPath, onObject = id, onArray = id, onAllOf = id, onFeature = id, onUnknown = id, onPathDone = id}
) {
  const walker = (pkg) => {
    function traverse(scope, path) {
      let result = onPath(pkg, scope, path, traverse)
      if (scope.properties) {
        result = onObject(result, scope, path, traverse)
      } else if (scope.type === 'array' || scope.items) {
        result = onArray(result, scope, path, traverse)
      } else if (scope.allOf) {
        result = onAllOf(result, scope, path, traverse)
      } else if (scope.$ref === '#feature') {
        result = onFeature(result, scope, path, traverse)
      } else {
        console.error('unknown @', path.join('.'), ':', Object.keys(scope))
        result = onUnknown(result, scope, path, traverse)
      }
      return onPathDone(result, scope, path, traverse)
    }
    return traverse
  }
  return (pkg, scope = SCHEMA, path = []) => walker(pkg)(scope, path)
}

const templateVisitor = {
  onPath: function (pkg, scope, path/*, traverse*/) {
    let result = {}
    if (path.length === 0) {
      result = {
        $schema: SCHEMA.$id,
        $comment: `Features available in package '${pkg}'.`
      }
    } else if (scope.description) {
      result.$comment = scope.description
    }
    return result
  },
  onObject: function (value, scope, path, traverse) {
    return Object.entries(scope.properties).reduce(
      (acc, [prop, next]) => ({...acc, ...traverse(next, [...path, prop])}),
      value
    )
  },
  onArray: function (/*value, scope, path, traverse*/) {
    return []
  },
  onAllOf: function (value, scope, path, traverse) {
    const currentProp = path[path.length - 1]
    return scope.allOf.reduce(
      (acc, item) => ({...acc, ...traverse(item, path)[currentProp]}),
      value
    )
  },
  onFeature: function (value/*, scope, path, traverse*/) {
    return value
  },
  onUnknown: function (value, scope/*, path, traverse*/) {
    return {...value, ...scope}
  },
  onPathDone: function (value, scope, path/*, traverse*/) {
    const currentProp = path[path.length - 1]
    return currentProp ? {[currentProp]: value} : value
  }
}

const createFeatureTemplate = walkFeatureSchema(templateVisitor)

const updateFeatureTemplate = (validateJson) => (pkg) => {
  let existing = {}
  let existingErrors
  const featuresFile = join(__dirname, pkg, FN_FEATURES_JSON)
  if (existsSync(featuresFile)) {
    existing = readJsonSync(featuresFile)
    validateJson(existing)
    existingErrors = validateJson.errors || []
  }

  const updated = mergeWith(
    createFeatureTemplate(pkg, SCHEMA),
    existing,
    (treeV, existingV, key) => {
      // always update comments to the latest
      if (key === '$comment') return treeV
      // If `customizer` returns `undefined`, merging is done as usual.
    }
  )
  if (!validateJson(updated)) {
    console.log(JSON.stringify(updated, null, 2))
    console.error('the updated JSON is not valid according to the schema')
    validateJson.errors.forEach(console.error)
    if (existingErrors.length > 0) {
      console.error('(the existing JSON is also not valid)')
      validateJson.errors.forEach(console.error)
      throw new Error(`${featuresFile} is not valid`)
    }
    throw new Error(`${featuresFile} would not be valid after sync`)
  }
  writeJsonSync(featuresFile, updated, {spaces: 2})
  console.error('synced', featuresFile)
}

function createValidator (schema = SCHEMA, ajvOpts = {allErros: true}) {
  try {
    return new Ajv(ajvOpts).compile(SCHEMA)
  } catch (err) {
    console.error('invalid schema in', join(__dirname, FN_FEATURES_JSON))
    throw err
  }
}

async function run (...args) {
  return forEach(updateFeatureTemplate(createValidator()), args)
}

module.exports = {
  createValidator, FN_FEATURES_JSON, run, walkFeatureSchema, SCHEMA
}
