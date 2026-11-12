import {hasUISymbol,renderUISymbols} from './icons.js';
import {translate} from './i18n-core.js';
import {locales,resolveLocale,localeFromPath,origin} from './locales.js';
let preference=null;try{preference=globalThis.sessionStorage?.getItem('tripezgo-locale');}catch{}
let active=typeof location==='undefined'?'zh-TW':localeFromPath(location.pathname)||(locales[preference]?preference:null)||resolveLocale(navigator.languages||[navigator.language]);
const originals=new WeakMap(),attributes=new WeakMap();let observer=null,queued=false;
export const getLocale=()=>active;
export const t=value=>translate(value,active);
const preserve='[data-ui-symbols],.rank-name,.song-result b,.song-result small,.song-detail-top h4,[data-user-text],.language-links,script,style,textarea,code,.creator-badge';
export function localizeDOM(root=document.body){
 for(const el of root.querySelectorAll('[data-ui-symbols]')){const html=renderUISymbols(t(el.dataset.uiSymbols));if(el.innerHTML!==html)el.innerHTML=html;}
 const symbolNodes=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){if(node.parentElement?.closest(preserve))continue;const saved=originals.get(node);const source=saved&&node.data===saved.output?saved.source:node.data;const output=t(source);originals.set(node,{source,output});if(node.data!==output)node.data=output;if(hasUISymbol(source))symbolNodes.push([node,source,output]);}
 for(const [node,source,output] of symbolNodes){const span=document.createElement('span');span.dataset.uiSymbols=source;span.innerHTML=renderUISymbols(output);node.replaceWith(span);}
 for(const el of root.querySelectorAll('[aria-label],[placeholder],[title],[alt]')){if(el.closest('.language-links')||el.matches('.rank-name b,.song-detail-top h4'))continue;let saved=attributes.get(el);if(!saved){saved={};attributes.set(el,saved);}for(const name of ['aria-label','placeholder','title','alt']){if(!el.hasAttribute(name))continue;const value=el.getAttribute(name),previous=saved[name],source=previous&&value===previous.output?previous.source:value,output=t(source);saved[name]={source,output};if(output!==value)el.setAttribute(name,output);}}
 document.querySelectorAll('[data-locale]').forEach(link=>{link.setAttribute('aria-current',link.dataset.locale===active?'page':'false');});
}
function updateMeta(){const config=locales[active];document.documentElement.lang=config.html;document.title=config.title;document.querySelector('meta[name="description"]')?.setAttribute('content',config.description);document.querySelector('link[rel="canonical"]')?.setAttribute('href',origin+config.path);for(const property of ['og:title','twitter:title'])document.querySelector(`meta[property="${property}"],meta[name="${property}"]`)?.setAttribute('content',config.title);for(const property of ['og:description','twitter:description'])document.querySelector(`meta[property="${property}"],meta[name="${property}"]`)?.setAttribute('content',config.description);document.querySelector('meta[property="og:url"]')?.setAttribute('content',origin+config.path);document.querySelector('meta[property="og:locale"]')?.setAttribute('content',config.og);}
export function setLocale(locale,{navigate=true}={}){if(!locales[locale])return;active=locale;try{sessionStorage.setItem('tripezgo-locale',locale);}catch{}if(navigate)history.pushState({locale},'',locales[locale].path);updateMeta();localizeDOM();window.dispatchEvent(new CustomEvent('localechange',{detail:locale}));}
export function startI18n(){
 const footer=document.querySelector('footer');const nav=document.createElement('nav');nav.className='language-links';nav.setAttribute('aria-label','Language');nav.innerHTML=Object.entries(locales).map(([code,config])=>`<a href="${config.path}" lang="${config.html}" hreflang="${config.html}" data-locale="${code}">${config.name}</a>`).join('');footer.append(nav);
 nav.addEventListener('click',event=>{const link=event.target.closest('[data-locale]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setLocale(link.dataset.locale);});
 window.addEventListener('popstate',()=>setLocale(localeFromPath(location.pathname)||'zh-TW',{navigate:false}));
 if(location.pathname==='/'&&active!=='zh-TW')history.replaceState({locale:active},'',locales[active].path);
 updateMeta();localizeDOM();observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;observer.disconnect();localizeDOM();observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});});});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});
}
