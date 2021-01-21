import './index-7ebc6c63.js';
import { c as createWorker } from './honey-news-a4a60810.js';

const workerName = 'fetch-es6.worker';
const workerMsgId = 'stencil.fetch-es6.worker';
const workerPath = /*@__PURE__*/new URL('fetch-es6.worker-8e034de2.js', import.meta.url).href;
const blob = new Blob(['importScripts("' + workerPath + '")'], { type: 'text/javascript' });
const url = URL.createObjectURL(blob);
const worker = /*@__PURE__*/createWorker(url, workerName, workerMsgId);
URL.revokeObjectURL(url);

export { worker, workerMsgId, workerName, workerPath };
