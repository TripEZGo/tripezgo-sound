import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('src/tracking.js','utf8').replace(/^import .*;$/gm,'').replaceAll('export ','');
function setup(host){const scripts=[],listeners={};const context={location:{hostname:host},getLocale:()=> 'en',locales:{en:{path:'/en/',title:'TripEZGo'}},origin:'https://sound.tripezgo.com',window:{addEventListener(){}},document:{createElement:()=>({}),head:{append:s=>scripts.push(s)},addEventListener:(n,f)=>listeners[n]=f}};vm.createContext(context);vm.runInContext(source+';startTracking();',context);return {context,scripts,listeners};}
test('GA4 loads only on production and sends no search or listening payload',()=>{
 assert.equal(setup('127.0.0.1').scripts.length,0);
 const {context,scripts,listeners}=setup('sound.tripezgo.com');assert.equal(scripts.length,1);
 assert.ok(scripts[0].src.includes('G-MPJNFS8ZQE'));
 listeners.submit({target:{id:'explore-form',value:'private song'}});
 vm.runInContext("track('history_search', {query:'private artist',date:'2026-01-01'});track('private_song');",context);
 const payload=JSON.stringify(context.window.dataLayer);
 assert.ok(!payload.includes('private'));assert.ok(!payload.includes('2026-01-01'));assert.ok(payload.includes('history_search'));
 const commands=Array.from(context.window.dataLayer,x=>Array.from(x));
 assert.equal(commands.filter(x=>x[1]==='page_view').length,1);
 assert.equal(commands.find(x=>x[0]==='config')[2].send_page_view,false);
 assert.equal(commands.find(x=>x[1]==='page_view')[2].page_location,'https://sound.tripezgo.com/en/');
});
