import { RestRoute } from './routes.init'
import { initServe } from './serve.init'
import ContentTypeHead from '../contentTypeHead'
import { RestNoteConfig } from './definitions'
import * as fs from 'fs'
import path from 'path'

export function initUws(routes: RestRoute[], config: RestNoteConfig) {
  const instance = config.uwsApp
  routes.forEach(route => {
    console.log('listening route', route.type, route.pattern)
    const isPost = route.type == 'post'
    const listener = async (res, req) => {
      const inout = { res, req }
      const headers = {}
      req.forEach((k, v) => (headers[k.toLowerCase()] = v))
      const args = route.params?.length && route.params.map((v, i) => req.getParameter(i))

      let close = false
      res.onAborted(() => {
        close = true
        console.log('abort')
      })

      const writeHeader = h => res.writeHeader(h[0], h[1])
      if (route.headers) {
        route.headers.forEach(writeHeader)
      } else if (route.parent.headers) {
        route.parent.headers.forEach(writeHeader)
      }

      if (isPost) {
        const content = headers[ContentTypeHead.multipartFromData[0]]
        const isMultipartFromData = content.indexOf(ContentTypeHead.multipartFromData[1]) > -1
        if (isMultipartFromData) {
          const body = await res.formData()
          args.reverse()
          args.push(body)
          args.reverse()
        }
      }
      const result = route.handler.apply(Object.assign({}, inout, route.parent), args)

      if (result.then)
        result.then(v => {
          !close && res.end(v)
        })
      else res.end(result)
    }

    instance[route.type](route.pattern, listener)
    instance[route.type](route.pattern + '/', listener)
  })

  const port = config.port || 1080
  const { folders, files } = initServe(config.serveStatics)
  instance.folder &&
    Object.keys(folders).forEach(route => {
      // console.log('served folder', route, folders[route])
      instance.folder(route, folders[route])
    })
  instance.file &&
    Object.keys(files).forEach(route => {
      // console.log('served file', route, files[route])
      instance.file(route, files[route])
    })

  const obj = config.serveObjects
  obj &&
    Object.keys(obj).forEach(route => {
      const o = obj[route]
      instance.get(route, (res, req) => {
        res.writeHeader(...ContentTypeHead.applicationJson)
        res.end(JSON.stringify(o.data))
      })
    })

  instance.listen(port, token => {
    if (token) {
      console.log('"Rest in note" listening to port', port)
    } else {
      console.log('fall')
    }
  })
}
