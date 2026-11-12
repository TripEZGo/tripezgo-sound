import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {gzipSync,strToU8} from 'fflate';
const source=process.argv[2];if(!source)throw new Error('Usage: node scripts/build-demo.mjs <export-directory>');
const tracks=[],keys=new Map(),plays=[];let excluded=0;
for(const filename of (await readdir(source)).filter(name=>name.endsWith('.json')).sort()){
 const rows=JSON.parse(await readFile(join(source,filename),'utf8'));if(!Array.isArray(rows))continue;
 for(const r of rows){if(!r?.master_metadata_track_name||r.spotify_episode_uri||r.episode_name||r.episode_show_name)continue;
 if(r.master_metadata_track_name.trim().toLocaleLowerCase()==='stuck with u (with justin bieber)'){excluded++;continue;}
 const time=Date.parse(r.ts);if(!Number.isFinite(time)||!Number.isFinite(r.ms_played)||r.ms_played<0)continue;
 const track=[r.master_metadata_track_name,r.master_metadata_album_artist_name||'未知歌手',r.spotify_track_uri||null,r.master_metadata_album_album_name||null];const key=JSON.stringify(track);
 let index=keys.get(key);if(index===undefined){index=tracks.length;keys.set(key,index);tracks.push(track);}
 plays.push([time,r.ms_played,index]);
 }
}
const bytes=gzipSync(strToU8(JSON.stringify({version:1,tracks,plays})),{level:9});await writeFile(new URL('../public/demo-history.json.gz',import.meta.url),bytes);
console.log(JSON.stringify({tracks:tracks.length,plays:plays.length,excluded,compressedBytes:bytes.length}));
