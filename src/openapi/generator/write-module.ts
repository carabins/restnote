import { Action, capitalize } from './Action'
import { parseType } from './makeDefinitions'
import * as prettier from 'prettier'
import { toCamelCased } from './utils'

export function makeSource(raw: any) {
  const modules = {}

  // @ts-ignore
  Object.values(raw).forEach((actions: Action[]) => {
    actions.forEach(a => {
      let args: any[] = []
      let params: any[] = []
      if (a.pathParams) {
        args = a.pathParams.map(p => `${p.name}:${p.schema ? parseType(p.schema) : 'string'}`)
        params = a.pathParams.map(p => p.name)
      }
      if (a.bodyType) {
        args.push(`body:${a.bodyType}`)
      }
      let moduleName = a.module
      const module = modules[moduleName] || (modules[moduleName] = [])
      module.push({
        args,
        params,
        body: !!a.bodyType,
        path: a.path,
        method: a.method,
        responseType: a.responseType,
        name: a.name.split('Controller').pop(),
      })
    })
  })
  let source = ` 
import exec from "./exec"; 
export const api = {`
  Object.keys(modules).forEach(moduleName => {
    source += `${moduleName}: {`
    const actions = modules[moduleName]
    actions.forEach(a => {
      const args = `${a.args.join(',')}`
      source += `\n${a.name}:(${args}):Promise<${a.responseType}> => exec("${a.path}", "${a.method}", {
params:{${a.params.join(',')}}
${a.body ? ',body' : ''}
}),`
    })
    source += '\n},'
  })
  source += '\n}'
  // return source
  return source
}
