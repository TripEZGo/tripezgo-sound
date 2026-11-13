import {getLocale} from './i18n.js';
import {locales,origin} from './locales.js';
export const measurementId='G-MPJNFS8ZQE';
const events=new Set(['demo_open','import_start','import_complete','import_error','history_search','grouping_change','share_click','image_download','language_change']);
let enabled=false;
// Accept event names only: listening data and user input never enter the payload.
export function track(name){if(enabled&&events.has(name))window.gtag('event',name,{send_to:measurementId,app_language:getLocale()});}
function pageview(){const config=locales[getLocale()];window.gtag('set',{page_location:origin+config.path,page_title:config.title,page_referrer:''});window.gtag('event','page_view',{send_to:measurementId,page_location:origin+config.path,page_title:config.title,page_referrer:''});}
export function startTracking(){
 if(location.hostname!=='sound.tripezgo.com'||enabled)return;
 enabled=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());window.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:origin+locales[getLocale()].path,page_referrer:''});
 pageview();const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;document.head.append(script);
 window.addEventListener('localechange',()=>{track('language_change');pageview();});
 document.addEventListener('submit',event=>{if(event.target.id==='explore-form')track('history_search');});
 document.addEventListener('change',event=>{if(event.target.id==='search-aggregation')track('grouping_change');});
 document.addEventListener('click',event=>{const el=event.target.closest('button,a');if(!el)return;if(el.id==='demo')track('demo_open');else if(el.closest('.share-card-actions'))track(el.matches('a[download]')?'image_download':'share_click');});
}
