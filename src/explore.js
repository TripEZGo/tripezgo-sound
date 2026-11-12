import {trackKey} from './analytics.js';
export function exploreRecords(records,{query='',mode='all',from='',to='',tracks=[],artists=[],artistExact=''}={}){
 const start=from?new Date(`${from}T00:00:00`).getTime():-Infinity;
 let end=Infinity;if(to){const date=new Date(`${to}T00:00:00`);date.setDate(date.getDate()+1);end=date.getTime();}
 if(Number.isNaN(start)||Number.isNaN(end)||start>=end)throw new Error('請確認日期格式，開始日期不能晚於結束日期。');
 const excludedTracks=new Set(tracks),excludedArtists=new Set(artists),needle=query.trim().toLocaleLowerCase(),result=new Map();
 for(const r of records){const artist=r.master_metadata_album_artist_name||'未知歌手',key=trackKey(r),date=new Date(r.ts),time=date.getTime();
 if((artistExact&&artist!==artistExact)||time<start||time>=end||excludedTracks.has(key)||excludedArtists.has(artist))continue;
 const hay=mode==='track'?r.master_metadata_track_name:mode==='artist'?artist:`${r.master_metadata_track_name} ${artist}`;
 if(needle&&!hay.toLocaleLowerCase().includes(needle))continue;
 let item=result.get(key);if(!item){item={key,name:r.master_metadata_track_name,artist,count:0,ms:0,first:time,last:time,years:{}};result.set(key,item);}
 item.count++;item.ms+=r.ms_played;item.first=Math.min(item.first,time);item.last=Math.max(item.last,time);const y=date.getFullYear();item.years[y]??={count:0,ms:0};item.years[y].count++;item.years[y].ms+=r.ms_played;
 }
 return [...result.values()].sort((a,b)=>b.count-a.count||b.ms-a.ms||a.name.localeCompare(b.name));
}

export function summarizeArtist(items,name){
 const songs=items.filter(item=>item.artist===name);if(!songs.length)return null;
 const summary={name,count:0,ms:0,first:Infinity,last:-Infinity,years:{},songs};
 for(const song of songs){summary.count+=song.count;summary.ms+=song.ms;summary.first=Math.min(summary.first,song.first);summary.last=Math.max(summary.last,song.last);for(const [year,value] of Object.entries(song.years)){summary.years[year]??={count:0,ms:0};summary.years[year].count+=value.count;summary.years[year].ms+=value.ms;}}
 return summary;
}
