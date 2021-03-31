// import { RestRoute } from './routes.init'
// import { initServe } from './serve.init'
// import headers from '../headers'
// import { RestNoteConfig } from './definitions'
// import * as fs from 'fs'
// import path from 'path'
//
// export function initFastify(routes: RestRoute[], config: RestNoteConfig) {
//   const instance = config.uwsApp
//   routes.forEach(route => {
//     log('listening route', route.type, route.pattern)
//     const isPost = route.type == 'post'
//     const listener = (res, req) => {
//       const inout = { res, req }
//       log(isPost, res.formData)
//
//       const args = route.params?.length && route.params.map((v, i) => req.getParameter(i))
//
//       let close = false
//       res.onAborted(() => {
//         close = true
//         log('abort')
//       })
//       if (isPost) {
//         log('+')
//         // res.writeHeader(...headers.multipartFromData)
//         // res.write('+')
//         res
//           .formData({
//             options: {
//               tmpDir: path.resolve('./tmpDir'),
//             },
//           })
//           .then(data => {
//             console.log({ data })
//             console.log(data.toString())
//           })
//           .catch(e => {
//             console.log({ e })
//           })
//       } else {
//         const writeHeader = h => res.writeHeader(h[0], h[1])
//         if (route.headers) {
//           route.headers.forEach(writeHeader)
//         } else if (route.parent.headers) {
//           route.parent.headers.forEach(writeHeader)
//         }
//         const result = route.handler.apply(Object.assign({}, inout, route.parent), args)
//         if (result.then)
//           result.then(v => {
//             !close && res.end(v)
//           })
//         res.end(result)
//       }
//     }
//
//     instance[route.type](route.pattern, listener)
//     instance[route.type](route.pattern + '/', listener)
//   })
//
//   const port = config.port || 1080
//   const { folders, files } = initServe(config.serveStatics)
//   instance.folder &&
//     Object.keys(folders).forEach(route => {
//       // console.log('served folder', route, folders[route])
//       instance.folder(route, folders[route])
//     })
//   instance.file &&
//     Object.keys(files).forEach(route => {
//       // console.log('served file', route, files[route])
//       instance.file(route, files[route])
//     })
//
//   const obj = config.serveObjects
//   obj &&
//     Object.keys(obj).forEach(route => {
//       const o = obj[route]
//       instance.get(route, (res, req) => {
//         res.writeHeader(...headers.applicationSson)
//         res.end(JSON.stringify(o.data))
//       })
//     })
//
//   instance.listen(port, token => {
//     if (token) {
//       console.log('"Rest in note" listening to port', port)
//     } else {
//       console.log('fall')
//     }
//   })
// }
