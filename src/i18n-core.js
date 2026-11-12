import * as OpenCC from 'opencc-js/t2cn';
import {messages} from './translations.js';
const simplified=OpenCC.Converter({from:'tw',to:'cn'});
const rows=new Map(messages.map(row=>[row[0],row]));
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=[...rows.values()].filter(row=>/\{\d+\}/.test(row[0])).sort((a,b)=>b[0].length-a[0].length).map(row=>{const indices=[];let pattern='',cursor=0;for(const match of row[0].matchAll(/\{(\d+)\}/g)){pattern+=escape(row[0].slice(cursor,match.index))+'(.+?)';indices.push(Number(match[1]));cursor=match.index+match[0].length;}pattern+=escape(row[0].slice(cursor));return {row,indices,re:new RegExp('^'+pattern+'$')};});
export function translate(value,locale='zh-TW',depth=0){if(value==null)return '';const original=String(value);if(locale==='zh-TW'||!original.trim())return original;if(locale==='zh-CN')return simplified(original);const trimmed=original.trim(),leading=original.slice(0,original.indexOf(trimmed)),trailing=original.slice(original.indexOf(trimmed)+trimmed.length),column={en:1,ja:2,ko:3}[locale]||1;const direct=rows.get(trimmed);if(direct&&!/\{\d+\}/.test(trimmed))return leading+direct[column]+trailing;
 if(depth<3){const arrow=trimmed.match(/^(.+?)\s*([↗↶↓→])$/);if(arrow){const base=translate(arrow[1],locale,depth+1);if(base!==arrow[1])return leading+base+' '+arrow[2]+trailing;}for(const {row,re,indices} of patterns){const match=re.exec(trimmed);if(!match)continue;const values={};indices.forEach((index,i)=>values[index]=translate(match[i+1],locale,depth+1));return leading+row[column].replace(/\{(\d+)\}/g,(_,index)=>values[index]??'')+trailing;}
 // Canvas titles compose a year or date range with a section name.
 for(const separator of ['・',' · '])if(trimmed.includes(separator)){const parts=trimmed.split(separator),translated=parts.map(part=>translate(part,locale,depth+1));if(parts.some((part,i)=>part!==translated[i]))return leading+translated.join(separator)+trailing;}
 }
 return original;
}
