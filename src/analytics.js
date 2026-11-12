export function bucket() { return {ms:0,count:0,months:Array(12).fill(0),monthCounts:Array(12).fill(0),heat:Array(168).fill(0),heatCounts:Array(168).fill(0),tracks:new Map(),artists:new Map(),days:new Set()}; }
export function createAnalysis(options={}) { return {all:bucket(),years:{},seen:0,short:0,other:0,invalid:0,skipped:0,ruleExcluded:0,filters:{minSeconds:30,skipSkipped:false,trackTerms:[],artistTerms:[],...options},records:[]}; }
function add(b,r,d) {
 b.ms+=r.ms_played; b.count++; b.months[d.getMonth()]+=r.ms_played;b.monthCounts[d.getMonth()]++;
 b.heat[((d.getDay()+6)%7)*24+d.getHours()]+=r.ms_played;b.heatCounts[((d.getDay()+6)%7)*24+d.getHours()]++;
 b.days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
 const artist=r.master_metadata_album_artist_name||'未知歌手', name=r.master_metadata_track_name;
 const key=trackKey(r);
 for(const [map,k,label,sub] of [[b.tracks,key,name,artist],[b.artists,artist,artist,'ARTIST']]) {
  const item=map.get(k)||{key:k,name:label,sub,ms:0,count:0}; item.ms+=r.ms_played;item.count++;map.set(k,item);
 }
}
export function ingest(a,rows) {
 if(!Array.isArray(rows)) throw new Error('JSON 必須是 Spotify 播放記錄陣列。');
 for(const r of rows) {
 a.seen++;
 if(!r||typeof r!=='object'){a.invalid++;continue;}
 if(!r.master_metadata_track_name||r.spotify_episode_uri||r.episode_name||r.episode_show_name||r.audiobook_uri){a.other++;continue;}
 if(typeof r.master_metadata_track_name!=='string'||(r.master_metadata_album_artist_name!=null&&typeof r.master_metadata_album_artist_name!=='string')){a.invalid++;continue;}
 const d=new Date(r.ts);
 if(typeof r.ts!=='string'||typeof r.ms_played!=='number'||!Number.isFinite(r.ms_played)||r.ms_played<0||!Number.isFinite(d.getTime())){a.invalid++;continue;}
 if(r.ms_played<a.filters.minSeconds*1000){a.short++;continue;}
 if(a.filters.skipSkipped&&r.skipped===true){a.skipped++;continue;}
 if(a.filters.trackTerms.some(t=>r.master_metadata_track_name.toLocaleLowerCase().includes(t.toLocaleLowerCase()))||a.filters.artistTerms.some(t=>(r.master_metadata_album_artist_name||'未知歌手').toLocaleLowerCase().includes(t.toLocaleLowerCase()))){a.ruleExcluded++;continue;}
 a.records.push({ts:r.ts,ms_played:r.ms_played,master_metadata_track_name:r.master_metadata_track_name,master_metadata_album_artist_name:r.master_metadata_album_artist_name,master_metadata_album_album_name:r.master_metadata_album_album_name,spotify_track_uri:r.spotify_track_uri});
 const y=d.getFullYear(); a.years[y]??=bucket();add(a.all,r,d);add(a.years[y],r,d);
 }
}
export function serialize(a) {
 const pack=b=>({...b,tracks:[...b.tracks.values()],artists:[...b.artists.values()],days:b.days.size});
 return {...a,all:pack(a.all),years:Object.fromEntries(Object.entries(a.years).map(([y,b])=>[y,pack(b)]))};
}
export function demo(options={}) {
 const a=createAnalysis(options); let seed=88; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const names=[['Midnight Signal','NOVA / DEMO'],['Ocean Drive','LOW TIDE / DEMO'],['After Hours','NEON ATLAS / DEMO'],['Stay in Motion','SOLAR / DEMO'],['Blue Horizon','LOW TIDE / DEMO'],['Into the Light','NOVA / DEMO'],['Electric Dreams','ORBIT / DEMO'],['Last Dance','SOLAR / DEMO']];
 const rows=[];for(let i=0;i<19000;i++){const y=2022+Math.floor(random()*4),m=Math.floor(random()*12),day=1+Math.floor(random()*28),hour=random()<.65?19+Math.floor(random()*5):Math.floor(random()*19),song=names[Math.floor(Math.pow(random(),1.5)*names.length)];rows.push({ts:new Date(y,m,day,hour,Math.floor(random()*60)).toISOString(),ms_played:60000+Math.floor(random()*280000),master_metadata_track_name:song[0],master_metadata_album_artist_name:song[1]});}ingest(a,rows);return serialize(a);
}

export function trackKey(r){return r.spotify_track_uri||JSON.stringify([r.master_metadata_track_name,r.master_metadata_album_artist_name||'未知歌手',r.master_metadata_album_album_name]);}
export function filterAnalysis(source,tracks=[],artists=[]){
 const t=new Set(tracks),ar=new Set(artists),a=createAnalysis(source.filters);
 ingest(a,source.records.filter(r=>!t.has(trackKey(r))&&!ar.has(r.master_metadata_album_artist_name||'未知歌手')));
 for(const y of Object.keys(source.years))a.years[y]??=bucket();
 const result=serialize(a);result.records=[];
 return {...result,seen:source.seen,short:source.short,other:source.other,invalid:source.invalid,skipped:source.skipped||0,ruleExcluded:source.ruleExcluded||0,filters:source.filters,excluded:source.all.count-result.all.count};
}
