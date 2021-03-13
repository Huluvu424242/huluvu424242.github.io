import './index-c4e79617.js';
import { c as createWorker } from './honey-news-c341cb82.js';

const workerName = 'fetch-es6.worker';
const workerMsgId = 'stencil.fetch-es6.worker';
const workerPath = /*@__PURE__*/new URL('fetch-es6.worker-9745bd51.js', import.meta.url).href;
const blob = new Blob(['importScripts("' + workerPath + '")'], { type: 'text/javascript' });
const url = URL.createObjectURL(blob);
const worker = /*@__PURE__*/createWorker(url, workerName, workerMsgId);
URL.revokeObjectURL(url);

export { worker, workerMsgId, workerName, workerPath };
