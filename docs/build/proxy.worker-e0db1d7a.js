(()=>{

'use strict';


const exports = {};
const workerMsgId = 'stencil.proxy.worker';
const workerMsgCallbackId = workerMsgId + '.cb';
const getTransferables = (value) => {
  if (!!value) {
  if (value instanceof ArrayBuffer) {
    return [value];
  }
  if (value.constructor === Object) {
    return [].concat(...Object.keys(value).map(k => getTransferables(value[k])))
  }
  if (typeof value === 'object') {
    return getTransferables(value.buffer);
  }
  }
  return [];
};
addEventListener('message', async ({data}) => {
  if (data && data[0] === workerMsgId) {
  let id = data[1];
  let method = data[2];
  let args = data[3];
  let i = 0;
  let argsLen = args.length;
  let value;
  let err;

  try {
    for (; i < argsLen; i++) {
    if (Array.isArray(args[i]) && args[i][0] === workerMsgCallbackId) {
      const callbackId = args[i][1];
      args[i] = (...cbArgs) => {
      postMessage(
        [workerMsgCallbackId, callbackId, cbArgs]
      );
      };
    }
    }
    
    value = exports[method](...args);
    if (!value || !value.then) {
    throw new Error('The exported method "' + method + '" does not return a Promise, make sure it is an "async" function');
    }
    value = await value;
    

  } catch (e) {
    value = null;
    if (e instanceof Error) {
    err = {
      isError: true,
      value: {
      message: e.message,
      name: e.name,
      stack: e.stack,
      }
    };
    } else {
    err = {
      isError: false,
      value: e
    };
    }
    value = undefined;
  }

  const transferables = getTransferables(value);
  if (transferables.length > 0) console.debug('Transfering', transferables);

  postMessage(
    [workerMsgId, id, value, err],
    transferables
  );
  }
});


async function loadData(request) {
  const response = await fetch(request);
  const data = {
    status: null, statusText: null, json: null, text: null
  };
  try {
    data.status = response.status;
    data.statusText = response.statusText;
    data.text = await response.text();
    data.json = JSON.parse(data.text);
  }
  catch (ex) {
    // expect to failed if no body
    console.warn("Error during read data of response " + ex);
  }
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return data;
}

exports.loadData = loadData;
})();
