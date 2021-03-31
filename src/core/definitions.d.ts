export type LocalPatch = string
export type ServeSources = {
  [url: string]: LocalPatch
}
export type ServeObject = {
  data: any
}
export type ServeObjects = {
  [url: string]: ServeObject
}

export interface RestNoteConfig {
  controllers: any[]
  uwsApp?: any
  fastify: any
  serveStatics?: ServeSources
  serveObjects?: ServeObjects
  info: any
  port?: number
}
