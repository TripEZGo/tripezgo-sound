import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasUISymbol,renderUISymbols} from '../src/icons.js';
import {translate} from '../src/i18n-core.js';
test('UI symbols render as decorative SVG rather than platform emoji',()=>{
 for(const symbol of ['↗','→','←','↓','↥','↶','▣']){
  const html=renderUISymbols(symbol);assert.ok(html.includes('<svg'));assert.ok(html.includes('aria-hidden="true"'));assert.ok(!html.includes(symbol));
 }
 assert.equal(hasUISymbol('分享 ↗'),true);assert.equal(hasUISymbol('TripEZGo'),false);
 assert.ok(renderUISymbols('<script> ↗').startsWith('&lt;script&gt;'));
});
test('icon rendering retains translated labels in every locale',()=>{
 for(const locale of ['zh-TW','en','zh-CN','ja','ko']){
  const label=translate('分享 ↗',locale),html=renderUISymbols(label);
  assert.ok(html.includes('<svg'));assert.ok(html.startsWith(label.split('↗')[0]));
 }
});
