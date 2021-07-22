import { toCamelCased } from './utils'

interface QueryParam {
  name
  type
  minimum
}

interface PathParam {
  name
  schema
  description
}

interface BodyParam {
  name
  type
  required
  schema
}

export class Action {
  path: string
  method: string
  responseType: string
  queryParams: QueryParam[] = []
  pathParams: PathParam[] = []
  bodyType: string
  module: string
  type: string
  // namePath: string;
  name: string
  operationId: string
  summary: string

  init() {
    const n = this.path.split('/')
    this.module = n[1] ? n[1] : this.method
  }

  setInfo(operationId, summary) {
    this.operationId = operationId
    this.summary = summary
    const s = operationId.replace(this.method, '')
    this.name = s.length > 0 ? toCamelCased(s) : this.method
  }
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
