import { initRoutes, RestRoute } from './routes.init'
import { initUws } from './uws'
import { openApiInit } from '../openapi/openApi.init'
import { RestNoteConfig } from './definitions'
// import { initFastify } from './fastify'

export function RestNote(config: RestNoteConfig) {
  const routes = initRoutes(config.controllers)
  const doc = openApiInit(routes, config)
  config.uwsApp && initUws(routes, config)
  // config.fastify && initFastify(routes, config)
}

export default RestNote
