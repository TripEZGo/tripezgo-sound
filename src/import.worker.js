import {loadDemo} from './demo.js';
import {exploreRecords} from './explore.js';
import {Unzip,UnzipInflate,strFromU8} from 'fflate';
import {createAnalysis,ingest,serialize,filterAnalysis} from './analytics.js';
self.onmessage=async({data:payload})=>{
 const file=payload?.type==='import'?payload.file:payload;
 try {
 if(file?.type==='demo'){const analysis=loadDemo(file.buffer,progress=>self.postMessage({type:'progress',...progress}));self.postMessage({type:'done',analysis});return;}
 if(file?.type==='explore'){self.postMessage({type:'explored',items:exploreRecords(file.records,file.options)});return;}
 if(file?.type==='filter'){self.postMessage({type:'filtered',analysis:filterAnalysis(file.source,file.tracks,file.artists)});return;}
 const signature=new Uint8Array(await file.slice(0,4).arrayBuffer());
 if(signature[0]!==0x50||signature[1]!==0x4b||signature[2]!==3||signature[3]!==4)throw new Error('檔案內容不是有效的 ZIP，請勿只修改副檔名。');
 self.postMessage({type:'progress',phase:'已確認 ZIP 格式，正在解壓縮',records:0});
 const tail=new Uint8Array(await file.slice(Math.max(0,file.size-65557)).arrayBuffer());
 let end=-1;for(let i=tail.length-22;i>=0;i--){if(tail[i]===0x50&&tail[i+1]===0x4b&&tail[i+2]===5&&tail[i+3]===6&&i+22+(tail[i+20]|tail[i+21]<<8)===tail.length){end=i;break;}}
 if(end<0)throw new Error('ZIP 結構不完整，檔案可能尚未下載完成，請重新下載後再試。');
 const view=new DataView(tail.buffer,tail.byteOffset+end,22);
 if(view.getUint16(4,true)!==0||view.getUint16(6,true)!==0)throw new Error('目前不支援分卷 ZIP，請使用 Spotify 原始完整 ZIP。');
 if(view.getUint32(16,true)+view.getUint32(12,true)>file.size-tail.length+end)throw new Error('ZIP 目錄損毀，請重新下載後再試。');
 const options=payload?.options||{};
 if(options.minSeconds!=null&&(!Number.isFinite(options.minSeconds)||options.minSeconds<0||options.minSeconds>600))throw new Error('最低播放秒數需介於 0 到 600 秒。');
 const analysis=createAnalysis(options);let matched=0,totalExpanded=0;
 const unzip=new Unzip(entry=>{
 if(!/\.json$/i.test(entry.name)){entry.terminate();return;}
 // Each file is decompressed and aggregated independently, never retaining the whole archive.
 let chunks=[],size=0;
 entry.ondata=(err,chunk,final)=>{
 if(err)throw err;size+=chunk.length;totalExpanded+=chunk.length;
 if(size>64*1024*1024||totalExpanded>1024*1024*1024)throw new Error('解壓資料超過限制（單檔 64 MiB／總計 1 GiB）。');
 chunks.push(chunk);
 if(final){const bytes=new Uint8Array(size);let p=0;for(const c of chunks){bytes.set(c,p);p+=c.length;}chunks=[];
 let rows;try{rows=JSON.parse(strFromU8(bytes));}catch{throw new Error('ZIP 內的 JSON 無法解析，檔案可能損毀，請重新下載 Spotify 匯出資料。');}
 if(Array.isArray(rows)&&rows.some(r=>r&&'ms_played' in r&&'ts' in r)){ingest(analysis,rows);matched++;}
 self.postMessage({type:'progress',phase:'正在分析歌曲與聆聽時段',records:analysis.seen});}
 };entry.start();
 });unzip.register(UnzipInflate);
 if(file.size>256*1024*1024)throw new Error('ZIP 大於 256 MiB，請分批匯出後再試。');
 const reader=file.stream().getReader();let read=0;
 while(true){const {done,value}=await reader.read();if(done){unzip.push(new Uint8Array(),true);break;}read+=value.length;unzip.push(value,false);self.postMessage({type:'progress',percent:Math.min(99,Math.round(read/file.size*100)),records:analysis.seen});}
 if(!matched)throw new Error('找不到 Extended Streaming History JSON，請確認上傳 Spotify 延伸播放記錄 ZIP。');
 if(!analysis.all.count)throw new Error(`沒有符合匯入條件的歌曲（最低 ${analysis.filters.minSeconds} 秒），請調整條件後重新匯入。`);
 self.postMessage({type:'progress',phase:'正在整理排行與年度統計',percent:99,records:analysis.seen});
 self.postMessage({type:'done',analysis:serialize(analysis)});
 }catch(error){self.postMessage({type:'error',message:error.message||'無法讀取 ZIP，請確認檔案完整。'});}
};
