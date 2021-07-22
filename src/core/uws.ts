import { RestRoute } from './routes.init'
import { initServe } from './serve.init'
import ContentTypeHead, { CORS } from '../contentTypeHead'
import { RestNoteConfig } from './definitions'
import * as fs from 'fs'
import path from 'path'
import { Handler } from '@sifrr/server'

import { HttpResponse, HttpRequest } from 'uWebSockets.js'

export class ReqResController {
  res: HttpResponse
  req: HttpRequest
}

const isJsonHeader = v => v && v.indexOf('json') != -1

export function initUws(routes: RestRoute[], config: RestNoteConfig) {
  const instance = config.uwsApp
  routes.forEach(route => {
    console.log('listening route', route.type, route.pattern)

    // let isJsonRequest = isJsonHeader(route.contentHeader)

    const listener: Handler = async (res, req) => {
      // const inout = { res, req }
      const headers = {}
      req.forEach((k, v) => {
        headers[k.toLowerCase()] = v
        // if (k == 'content-type') {
        //   isJsonRequest = isJsonHeader(v)
        // }
      })
      const routeParams = route.params?.length && route.params.map((v, i) => req.getParameter(i))
      const args = routeParams ? routeParams : []

      let close = false
      res.onAborted(() => {
        close = true
        console.log('abort')
      })

      const writeHeader = h => res.writeHeader(h[0], h[1])
      config.cors && CORS.forEach(writeHeader)
      const addHeader = h => (responseHeaders[h[0]] = h[1])
      const responseHeaders = {}
      // route.parent.headers && route.parent.headers.forEach(addHeader)
      writeHeader(route.contentHeader)
      Object.entries(responseHeaders).forEach(writeHeader)
      const isJsonResponse = isJsonHeader(route.contentHeader[1])
      const method = req.getMethod()
      if (method == 'post') {
        let body
        body = await res.body()
        body = JSON.parse(body)
        args.reverse()
        args.push(body)
        args.reverse()
      }

      const ctx = Object.assign({ req, res }, route.parent)
      // console.log({ args }, { ctx })

      // console.log({ isJsonRequest, isJsonResponse, responseHeaders, result })
      if (method.toLowerCase() === 'options') {
        res.writeStatus('200')
        res.end()
      } else {
        const result = route.handler.apply(ctx, args)

        const formatReply = v => (isJsonResponse ? JSON.stringify(v) : v)
        if (result.then)
          result.then(v => {
            !close && res.end(formatReply(v))
          })
        else res.end(formatReply(result))
      }
    }
    instance.options(route.pattern, listener)
    instance[route.type](route.pattern, listener)
    instance[route.type](route.pattern + '/', listener)
  })

  const port = config.port || 1080
  if (config.serveStatics) {
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
  }

  const obj = config.serveObjects
  obj &&
    Object.keys(obj).forEach(route => {
      const o = obj[route]
      instance.get(route, (res, req) => {
        res.writeHeader(...ContentTypeHead.applicationJson)
        res.end(JSON.stringify(o))
      })
    })

  config.serveStrings &&
    Object.keys(config.serveStrings).forEach(route => {
      const o = config.serveStrings[route]
      const oHeads = o.headers || [ContentTypeHead.applicationJson]
      instance.get(route, (res, req) => {
        oHeads.forEach(h => res.writeHeader(...h))
        res.end(o.data)
      })
    })

  return new Promise(done => {
    instance.listen(port, token => {
      if (token) {
        console.log('"Rest in note" listening to port', port)
      } else {
        console.log('fall')
      }
      done(port)
    })
  })
}
