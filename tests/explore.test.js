import {test} from 'node:test';import assert from 'node:assert/strict';import {exploreRecords} from '../src/explore.js';
const row=(year,month,day,hour,track='A',artist='Artist',ms=30000)=>({ts:new Date(year,month-1,day,hour).toISOString(),ms_played:ms,master_metadata_track_name:track,master_metadata_album_artist_name:artist,spotify_track_uri:`uri:${track}`});
const records=[row(2023,1,1,2),row(2024,5,2,1),row(2024,5,2,23),row(2024,5,3,0),row(2024,5,2,12,'B','Other',60000)];
test('search title or artist and aggregate full yearly history with first/last timestamps',()=>{const r=exploreRecords(records,{query:'a',mode:'track'});assert.equal(r.length,1);assert.equal(r[0].count,4);assert.equal(r[0].years[2023].count,1);assert.equal(r[0].years[2024].count,3);assert.equal(r[0].first,new Date(records[0].ts).getTime());assert.equal(r[0].last,new Date(records[3].ts).getTime());assert.equal(exploreRecords(records,{query:'OTHER',mode:'artist'})[0].name,'B');});
test('date range includes end-day late evening and excludes next midnight',()=>{const r=exploreRecords(records,{from:'2024-05-02',to:'2024-05-02'});assert.equal(r.length,2);assert.equal(r.find(x=>x.name==='A').count,2);assert.equal(r.find(x=>x.name==='A').first,new Date(records[1].ts).getTime());});
test('excluded songs/artists never appear, invalid range and empty results handled',()=>{assert.equal(exploreRecords(records,{tracks:['uri:A']}).length,1);assert.equal(exploreRecords(records,{artists:['Artist']})[0].name,'B');assert.deepEqual(exploreRecords(records,{query:'missing'}),[]);assert.throws(()=>exploreRecords(records,{from:'2025-01-02',to:'2024-01-01'}),/開始日期/);});

import {summarizeArtist} from '../src/explore.js';
test('artist details combine songs and years with first and last listening',()=>{const items=exploreRecords([...records,row(2024,5,2,3,'C','Artist',90000)]);const summary=summarizeArtist(items,'Artist');assert.equal(summary.songs.length,2);assert.equal(summary.count,5);assert.equal(summary.ms,210000);assert.equal(summary.years[2024].count,4);assert.equal(summary.first,new Date(records[0].ts).getTime());assert.equal(summary.last,new Date(records[3].ts).getTime());assert.equal(summarizeArtist(items,'Missing'),null);});
test('exact artist filter avoids similarly named artists and respects date range',()=>{const rows=[...records,row(2024,5,2,3,'C','Artist Remix')];const items=exploreRecords(rows,{query:'Artist',mode:'artist',artistExact:'Artist',from:'2024-05-02',to:'2024-05-02'});assert.equal(items.length,1);assert.equal(items[0].count,2);assert.equal(summarizeArtist(items,'Artist').count,2);});
test('ungrouped plays keep repeated tracks and sort newest first',()=>{
 const events=exploreRecords(records,{aggregation:'none'});
 assert.equal(events.length,5);assert.equal(events.filter(r=>r.name==='A').length,4);
 assert.equal(events[0].first,new Date(records[3].ts).getTime());assert.ok(events.every(r=>r.count===1));
 for(let i=1;i<events.length;i++)assert.ok(events[i-1].first>=events[i].first);
});
test('local datetime bounds include exact endpoints and filter within a day',()=>{
 const options={from:'2024-05-02T12:00',to:'2024-05-02T23:00'};
 const events=exploreRecords(records,{...options,aggregation:'none'});
 assert.equal(events.length,2);assert.equal(events[0].name,'A');assert.equal(events[1].name,'B');
 const exact=exploreRecords(records,{aggregation:'none',from:'2024-05-02T12:00',to:'2024-05-02T12:00'});assert.equal(exact.length,1);
 assert.equal(exploreRecords(records,{...options,aggregation:'track'}).reduce((n,r)=>n+r.count,0),events.length);
 assert.throws(()=>exploreRecords(records,{from:'2024-05-02T23:01',to:'2024-05-02T23:00'}));
});
