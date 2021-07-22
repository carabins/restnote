import { makeDefinitions, parseType } from './makeDefinitions';
import { Action } from './Action';
import { makeSource } from './write-module';

import * as fs from 'fs';

import * as path from 'path';
import * as http from 'http';
import { RiDoc } from '../../core';

export function generateApiLib(data: RiDoc, targetDir) {
  // console.log(data);
  // return "zs";
  const definitions = makeDefinitions(data.components.schemas);
  const jsonHead = 'application/json';
  // console.log(definitions);
  // return "";
  const modules = {};
  Object.keys(data.paths).forEach(path => {
    const actionData = data.paths[path];
    Object.keys(actionData).forEach(method => {
      const actionObject = actionData[method];
      // // console.log(JSON.stringify(actionObject,null, 2));
      const action = new Action();
      action.path = path;
      action.method = method;
      if (!actionObject.operationId || !actionObject.responses) return;

      action.setInfo(actionObject.operationId, actionObject.summary);
      Object.keys(actionObject.responses).forEach(code => {
        const v = actionObject.responses[code];
        if (parseInt(code) < 400) {
          if (!v.content) return;
          const { schema } = v.content[jsonHead];
          if (schema) action.responseType = parseType(schema);
          else action.responseType = 'any';
        }
      });

      if (actionObject.requestBody?.content) {
        const { schema } = actionObject.requestBody.content['application/json'];
        action.bodyType = parseType(schema);
      }
      if (actionObject.parameters)
        actionObject.parameters.forEach(param => {
          switch (param.in) {
            case 'header':
              break;
            case 'path':
              action.pathParams.push(param);
              break;
            case 'query':
              action.queryParams.push(param);
              break;
          }
        });

      action.init();
      let m = modules[action.module];
      if (!m) m = modules[action.module] = [];
      m.push(action);
    });
  });

  const apiDir = path.join(path.resolve(targetDir), 'api');
  let sources = definitions + '\n' + makeSource(modules);
  //@ts-ignore
  const prettier = require('prettier');
  if (prettier) {
    sources = prettier.format(sources);
  }
  fs.writeFileSync(path.join(apiDir, 'index.ts'), sources);
  return true;
}
