import { initRoutes, RestRoute } from './routes.init'
import { initUws } from './uws'
import { openApiInit } from '../openapi/openApi.init'
import { RestNoteConfig } from './definitions'

export type RiDoc = any

interface RestInNoteInstance {
  doc: RiDoc
  routes: RestRoute[]
}

export async function RestNote(config: RestNoteConfig): Promise<RestInNoteInstance> {
  const routes = initRoutes(config.controllers) as RestRoute[]
  const doc = openApiInit(routes, config)
  config.uwsApp && (await initUws(routes, config))
  return {
    doc,
    routes,
  }
}

export default RestNote
