import { decoContentHeaders } from './decorators'
import ContentTypeHead from '../contentTypeHead'

export type RestRoute = {
  name: string
  controllerName: string
  pattern: string
  openPattern: string
  params: string[]
  type: string
  handler: any
  parent: any
  contentHeader: string
  // headers?: string[]
}

enum Type {
  POST = 'post',
  GET = 'get',
}

const strBy = 'By'
const strAnd = 'And'

const parents = new Map()

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export function initRoutes(controllers) {
  const routes = []
  Object.keys(controllers).forEach(controllerKey => {
    const controllerClass = controllers[controllerKey] as any
    if (typeof controllerClass !== 'function') return
    const instance = new controllerClass()
    let protoOfInstance = Object.getPrototypeOf(instance)
    const parent = Object.getPrototypeOf(instance)
    !parents.has(parent) && parents.set(parent, new parent.constructor())
    const parentInstance = parents.get(parent)
    Object.getOwnPropertyNames(protoOfInstance).forEach(fieldName => {
      const type = parseType(fieldName)
      if (!type) return
      //const guard = decoGuards[fieldName] as GuardLevel
      const handler = instance[fieldName] as any

      let params = fieldName.split(type)
      if (params.length > 1) {
        params = params[1].split(strBy)
      }
      let name = camelToSnakeCase(params[0])
      if (name[0] == '-') name = name.slice(1)
      if (params.length > 1) {
        params = params[1].split(strAnd).map(s => s.toLocaleLowerCase())
      } else {
        params = []
      }
      let pattern = name ? '/' + name.toLowerCase() : ''
      let openPattern = pattern
      if (params.length >= 1) {
        params.forEach(p => {
          if (p.length) {
            pattern += '/:' + p
            openPattern += '/{' + p + '}'
          }
        })
      }
      // console.log({ params, pattern })
      const controllerName = controllerKey.split('Controller')[0].toLowerCase()
      if (controllerName != 'index') {
        pattern = '/' + controllerName + pattern
        openPattern = '/' + controllerName + openPattern
      }
      const instanceHeaders = decoContentHeaders.get(protoOfInstance)
      let h1 = instanceHeaders ? instanceHeaders[fieldName] : false
      const contentHeader = h1 ? h1 : ContentTypeHead.applicationJson
      routes.push({
        name: fieldName,
        controllerName,
        pattern,
        openPattern,
        params,
        handler,
        parent: parentInstance,
        type,
        contentHeader,
        // headers: [contentHeader],
      })
    })
  })

  return routes
}

function parseType(name): Type {
  if (name.indexOf(Type.GET) === 0) return Type.GET
  if (name.indexOf(Type.POST) === 0) return Type.POST
  if (name == 'constructor') return null
  return Type.GET
}
