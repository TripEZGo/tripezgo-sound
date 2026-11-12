import {parentPort} from 'node:worker_threads';
globalThis.self={postMessage:value=>parentPort.postMessage(value)};
await import('../src/import.worker.js');
parentPort.on('message',bytes=>self.onmessage({data:new File([bytes],'test.zip',{type:'application/zip'})}));
