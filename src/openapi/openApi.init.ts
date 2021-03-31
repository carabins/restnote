import 'reflect-metadata'
import * as path from 'path'
import { RestRoute } from '../core/routes.init'
import { RestNoteConfig } from '../core/definitions'
import { ComponentsObject } from './spec'
import { ApiPropertyOptions, openApiProps, openApiRequests } from './decorators'

function getPropSchema(i): any {
  let type = 'object'
  if (i.isArray) {
    type = getPropSchema(i.type)
    return {
      type: 'array',
      items: {
        type,
      },
    }
  }
  const detectType = i.type?.name || i.name
  switch (detectType) {
    case 'Array':
      if (i.options?.type) {
        type = getPropSchema(i.options.type)
      }
      return {
        type: 'array',
        items: {
          type,
        },
      }
    case 'Number':
      return {
        type: 'integer',
      }
    case 'String':
    case 'Boolean':
      return { type: detectType.toLowerCase() }
    default:
      return {
        $ref: '#/components/schemas/' + detectType,
      }
  }
}

export function openApiInit(routes: RestRoute[], config: RestNoteConfig) {
  const schemas = {}
  openApiProps.forEach((o: ApiPropertyOptions) => {
    const name = o['$ref']
    delete o['$ref']
    // const ref = '#/components/schemas/' + name
    const properties = {}
    Object.keys(o).forEach(key => {
      properties[key] = getPropSchema(o[key])
    })

    // console.log(o)
    // console.log(properties)
    schemas[name] = {
      type: 'object',
      properties,
    }
  })
  const doc: any = {
    openapi: '3.0.0',
    info: config.info,
    paths: {},
    components: { schemas },
  }
  routes.forEach(route => {
    const spec = openApiRequests[route.name]
    if (spec) {
      let point = doc.paths[route.pattern]
      if (!point) point = doc.paths[route.openPattern] = {}
      const item: any = (point[route.type] = {}) as ComponentsObject
      item.operationId = route.name
      item.tags = [route.controllerName]
      item.parameters = route.params.map(name => ({
        name,
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      }))
      const responses = {}
      if (spec.responses) {
        spec.responses.forEach(r => {
          const schema = getPropSchema(r)
          const { description } = r
          responses[r.code || 200] = {
            description,
            content: {
              'application/json': {
                schema,
              },
            },
          }
        })
        item.responses = responses
      }
    }
  })

  config.serveStatics = Object.assign({}, config.serveStatics, {
    '/openapi': path.resolve('node_modules/rinote/openapi'),
  })
  config.serveObjects = Object.assign({}, config.serveObjects, {
    '/openapi.json': {
      data: doc,
    },
  })
  return doc
}
