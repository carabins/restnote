import 'reflect-metadata'
import * as path from 'path'
import { RestRoute } from '../core/routes.init'
import { RestNoteConfig } from '../core/definitions'
import { ComponentsObject } from './spec'
import { ApiPropertyOptions, openApiProps, openApiRequests } from './decorators'
import { swaggerHtml } from './html.index'
import { decoContentHeaders } from '../core/decorators'
import ContentTypeHead from '../contentTypeHead'
import { RiDoc } from '../core'

export function getType(t, arrayType?) {
  const detectType = t.name || t
  // console.log({ detectType })
  switch (detectType) {
    case 'Array':
      return {
        type: 'array',
        items: getType(arrayType),
      }
    case 'Number':
      return {
        type: 'integer',
      }
    case 'String':
    case 'Boolean':
      return { type: detectType.toLowerCase() }
    case 'Any':
    case 'Object':
      return { type: detectType.toLowerCase() }
    default:
      return {
        $ref: '#/components/schemas/' + detectType,
      }
  }
}

function getPropSchema(i): any {
  const t = getType(i.type || i, i.options?.type)
  return t
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
  const doc: RiDoc = {
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
      if (route.params && route.params.length) {
        item.parameters = route.params.map(name => ({
          name,
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
        }))
      }

      if (spec.body) {
        const schema = getPropSchema(spec.body)
        // let schema
        // console.log(route)
        // if (spec.body.isArray) {
        //   schema = {
        //     type: 'array',
        //     items: item.type ? item.type : item,
        //   }
        // } else {
        //   schema = item
        // }
        item.requestBody = {
          content: {
            'application/json': {
              schema,
            },
          },
        }
      }
      const responses = {}
      if (spec.response) {
        const r = spec.response
        const schema = getPropSchema(r)
        const { description } = r
        responses['default'] = {
          description,
          content: {
            'application/json': {
              schema: r.isArray
                ? {
                    type: 'array',
                    items: schema.type,
                  }
                : schema,
            },
          },
        }
      }
      item.responses = responses
    }
  })

  // config.serveObjects = Object.assign({}, config.serveStatics, {
  //   '/openapi': path.resolve('node_modules/rinote/openapi'),
  // })

  if (config.swaggerDoc !== false) {
    let docUri = '/openapi'
    if (typeof config.swaggerDoc === 'string') {
      docUri = config.swaggerDoc
    }
    const jsonUri = docUri + '.json'
    config.serveObjects = Object.assign({}, config.serveObjects, {
      [jsonUri]: doc,
    })
    config.serveStrings = Object.assign({}, config.serveStrings, {
      [docUri]: {
        headers: [ContentTypeHead.textHtml],
        data: swaggerHtml(jsonUri),
      },
    })
  }
  return doc as RiDoc
}
