import './index-79c6be8f.js';
import { c as createWorker } from './honey-news-518b3d2f.js';

const workerName = 'proxy.worker';
const workerMsgId = 'stencil.proxy.worker';
const workerPath = /*@__PURE__*/new URL('proxy.worker-e0db1d7a.js', import.meta.url).href;
const blob = new Blob(['importScripts("' + workerPath + '")'], { type: 'text/javascript' });
const url = URL.createObjectURL(blob);
const worker = /*@__PURE__*/createWorker(url, workerName, workerMsgId);
URL.revokeObjectURL(url);

export { worker, workerMsgId, workerName, workerPath };
