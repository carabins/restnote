export const refToName = v => v.split('/').pop() as string
export const parseType = v => {
  if (v['$ref']) {
    const type = refToName(v['$ref'])
    return type //refToName(v['$ref'])
  }
  if (v.type) {
    switch (v.type) {
      case 'object':
      case 'file':
        return 'any'
      case 'integer':
        return 'number'
      case 'Time':
        return 'string'
      case 'array':
        // console.log(':::', v)
        return `${parseType(v.items)}[]`
      default:
        return v.type
    }
  } else {
    return 'any'
  }
}
export const makeDefinitions = definitions => {
  let source = ''
  const imap = {}
  const types = []
  // console.log('---', definitions)
  Object.keys(definitions).forEach(name => {
    const def = definitions[name]

    imap[name] = true
    switch (def.type) {
      case 'string':
        if (def.enum) {
          source += `
enum ${name} {
${def.enum.map(v => '\t' + v + " = '" + v).join("',\n")}',
}`
        } else {
          source += `
type ${name} = string`
        }
        break
      case 'array':
        if (def.items.type === 'integer')
          source += `
type ${name} = number[]`
        break
      case 'object':
        writeObj(def)
        break
      default:
        if (def.allOf) {
          const refs: string[] = []
          let o
          def.allOf.forEach(i => {
            if (i['$ref']) refs.push(refToName(i['$ref']))
            else o = i
          })
          writeObj(o, refs)
        } else {
          console.log('not enaft code, need more write for makeDefinitions()')
          throw 'need more code'
        }
    }

    function writeObj(v, ext?) {
      if (v.properties) {
        const p = Object.keys(v.properties).map(c => {
          const prop = v.properties[c]
          const type = parseType(prop)
          return c + ':' + type
        })
        source += `
export interface ${name} ${ext ? 'extends ' + ext.join(',') : ''} {
  ${p.join(',\n  ')}
}`
      } else {
        source += `export type ${name} = any`
        // console.log("not enaft code, need more write for writeObj()")
        // throw "need more code"
      }
    }
  })
  return source
}
