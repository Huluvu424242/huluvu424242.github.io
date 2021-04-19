import { c as createWorker } from './fetch-es6.worker-3eaebeac.js';
import './index-4e2e0b0d.js';

const workerName = 'fetch-es6.worker';
const workerMsgId = 'stencil.fetch-es6.worker';
const workerPath = /*@__PURE__*/new URL('fetch-es6.worker-68144bd3.js', import.meta.url).href;
const blob = new Blob(['importScripts("' + workerPath + '")'], { type: 'text/javascript' });
const url = URL.createObjectURL(blob);
const worker = /*@__PURE__*/createWorker(url, workerName, workerMsgId);
URL.revokeObjectURL(url);

export { worker, workerMsgId, workerName, workerPath };
