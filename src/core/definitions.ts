import { App } from '@sifrr/server'

export type LocalPatch = string
export type ServeSources = {
  [url: string]: LocalPatch
}
export type ServeString = {
  headers: string[][]
  data: any
}
export type ServeObjects = {
  [url: string]: string
}

export type ServeStrings = {
  [url: string]: ServeString
}

export interface RestNoteConfig {
  controllers: any[]
  cors?: boolean
  uwsApp?: any
  fastify: any
  serveStatics?: ServeSources
  serveObjects?: ServeObjects
  serveStrings?: ServeString
  info: any
  port?: number
  swaggerDoc?: boolean | string
}
