import {gunzipSync,strFromU8} from 'fflate';
import {createAnalysis,ingest,serialize} from './analytics.js';
export function loadDemo(buffer,onProgress=()=>{}){
 const bytes=new Uint8Array(buffer);const decoded=bytes[0]===0x1f&&bytes[1]===0x8b?gunzipSync(bytes):bytes;
 const data=JSON.parse(strFromU8(decoded));const analysis=createAnalysis();
 for(let i=0;i<data.plays.length;i+=5000){const rows=data.plays.slice(i,i+5000).map(([time,ms,index])=>{const [name,artist,uri,album]=data.tracks[index];return {ts:new Date(time).toISOString(),ms_played:ms,master_metadata_track_name:name,master_metadata_album_artist_name:artist,spotify_track_uri:uri,master_metadata_album_album_name:album};});ingest(analysis,rows);onProgress({records:analysis.seen,percent:Math.min(99,Math.round((i+rows.length)/data.plays.length*100))});}
 return serialize(analysis);
}
