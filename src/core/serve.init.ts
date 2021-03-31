import * as path from 'path'
import * as fs from 'fs'

export function initServe(paths) {
  const files = {}
  const folders = {}
  Object.keys(paths).forEach(url => {
    const p = paths[url]
    const pPath = path.resolve(p)
    const pStats = fs.statSync(pPath)
    if (pStats.isDirectory) {
      const pIndex = path.join(pPath, 'index.html')
      const hasIndex = fs.existsSync(pIndex)
      if (hasIndex) {
        files[url + '/'] = pIndex
      }
      folders[url] = pPath
    } else {
      files[url] = pPath
    }
  })
  return { files, folders }
}
