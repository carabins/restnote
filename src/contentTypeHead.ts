const ct = 'content-type'
export const ContentTypeHead = {
  textHtml: [ct, 'text/html; charset=utf-8'],
  applicationJson: [ct, 'application/json; charset=utf-8'],
  multipartFromData: [ct, 'multipart/form-data;'],
}

export default ContentTypeHead

export const CORS = [
  ['access-control-allow-origin', '*'],
  ['access-control-allow-methods', '*'],
  ['access-control-allow-headers', '*'],
]
