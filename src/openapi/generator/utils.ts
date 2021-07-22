const replace = new RegExp(/-([a-z])/g)
export const toCamelCased = (s) => {
  return (
    s &&
    s.replace(replace, function (g) {
      return g[1].toUpperCase()
    })
  )
}

// import { createHash } from "crypto";

// function generateChecksum(str, algorithm?, encoding?) {
//   return createHash(algorithm || 'md5')
//     .update(str, 'utf8')
//     .digest(encoding || 'hex');
// }
//
