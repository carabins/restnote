import ContentTypeHead from '../contentTypeHead'

export const decoGuards = {}
export const decoContentHeaders = new Map()

export enum GuardLevel {
  Base,
}

export const Guard = {
  base(ctx, name, ...props) {
    decoGuards[name] = GuardLevel.Base
  },
}

type LosFilterFlags<T> = {
  [Key in keyof T]: any
}

export const Content = new Proxy(ContentTypeHead, {
  get(target: any, p: string | symbol, receiver: any): any {
    const header = target[p]
    return (ctx, name, ...props) => {
      if (!decoContentHeaders.has(ctx)) {
        decoContentHeaders.set(ctx, { [name]: header })
      } else {
        decoContentHeaders.get(ctx)[name] = header
      }
    }
  },
}) as LosFilterFlags<typeof ContentTypeHead>
