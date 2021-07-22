import 'reflect-metadata'
import { SchemaObject } from './spec'
import { symlink } from 'fs'

export const openApiProps = new Map()
export const openApiRequests = {} as {
  [key: string]: OpenApiBodyRes
}

export interface OpenResponse {
  type: any
  code?: number
  isArray?: boolean
  description?: string
}

export type OpenApiBodyRes = {
  response?: OpenResponse
  body?: any
  description?: string
}

export interface ApiPropertyOptions extends Omit<SchemaObject, 'type' | 'required'> {
  type?: any
  isArray?: boolean
  required?: boolean
  name?: string
  enumName?: string
}

export function ApiProperty(options?: ApiPropertyOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    let type = Reflect.getMetadata('design:type', target, propertyKey)
    if (!openApiProps.has(target)) {
      openApiProps.set(target, {
        $ref: target.constructor.name,
        [propertyKey]: { type, options },
      })
    } else {
      openApiProps.get(target)[propertyKey] = { type, options }
    }
  }
}

export function OpenApi(options: OpenApiBodyRes) {
  return (ctx, name, props) => {
    openApiRequests[name] = options
  }
}
