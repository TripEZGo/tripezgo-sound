import {t} from './i18n.js';
import {toCanvas} from 'html-to-image';
let previewUrl=null,busy=false,generation=0;
const excluded=node=>node instanceof Element&&(node.classList.contains('section-share')||node.classList.contains('no-capture'));
export async function shareSection(target,title,scope='',options={}){
 if(!target||busy)return;busy=true;const ticket=++generation;const notice=document.querySelector('#share-notice');notice.hidden=false;notice.textContent='正在產生分享圖片…';
 try{
 const width=Math.ceil(target.scrollWidth),height=Math.ceil(target.scrollHeight);
 const screenshot=await toCanvas(target,{backgroundColor:'#17120f',pixelRatio:options.portrait?2:Math.min(2,4096/Math.max(width,height)),skipFonts:true,filter:node=>!excluded(node),style:{margin:'0',animation:'none',transition:'none',...(options.portrait?{position:'static',left:'auto',top:'auto'}:{})}});
 const canvas=document.createElement('canvas');canvas.width=screenshot.width;const scale=canvas.width/width;const head=82*scale,foot=65*scale;canvas.height=screenshot.height+head+foot;const c=canvas.getContext('2d');c.fillStyle='#17120f';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#5cc6c3';c.font=`bold ${Math.max(16,18*scale)}px sans-serif`;c.fillText('TripEZGo / '+title,25*scale,33*scale);c.fillStyle='#c7bcb1';c.font=`${Math.max(11,11*scale)}px sans-serif`;c.fillText(scope,25*scale,59*scale);c.drawImage(screenshot,0,head);c.strokeStyle='#382f27';c.beginPath();c.moveTo(25*scale,canvas.height-foot+12*scale);c.lineTo(canvas.width-25*scale,canvas.height-foot+12*scale);c.stroke();c.fillStyle='#7ad7d4';c.font=`${Math.max(11,12*scale)}px sans-serif`;c.fillText('我的聆聽宇宙 · TripEZGo',25*scale,canvas.height-22*scale);c.textAlign='right';c.fillText('tripezgo.com',canvas.width-25*scale,canvas.height-22*scale);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(ticket!==generation){notice.hidden=true;return;}if(!blob)throw new Error('無法產生圖片');
 const file=new File([blob],`tripezgo-listening-${Date.now()}.png`,{type:'image/png'});
 if(options.portrait){openPreview(blob,file,title);notice.hidden=true;return;}
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:`TripEZGo · ${t(title)}`});notice.hidden=true;return;}catch(error){if(error.name==='AbortError'){notice.hidden=true;return;}/* A second explicit click can restore user activation. */}}
 openPreview(blob,file,title);notice.hidden=true;
 }catch(error){notice.textContent='圖片產生失敗，請稍後重試，或使用瀏覽器截圖。';}finally{busy=false;}
}
function openPreview(blob,file,title){
 const dialog=document.querySelector('#share-dialog');if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);
 dialog.querySelector('h2').textContent=t(title);dialog.querySelector('img').src=previewUrl;
 const native=dialog.querySelector('#native-share');native.hidden=!navigator.canShare?.({files:[file]});
 dialog.querySelector('#share-help').textContent=native.hidden?'此瀏覽器不支援系統圖片分享，可下載 PNG 後分享。':'圖片已準備好，按下「開啟系統分享」選擇分享對象。';
 native.onclick=async()=>{try{await navigator.share({files:[file],title:`TripEZGo · ${t(title)}`});}catch(error){if(error.name!=='AbortError')dialog.querySelector('#share-help').textContent='系統分享無法開啟，請改為下載 PNG。';}};
 dialog.querySelector('#download-share').onclick=()=>{const a=document.createElement('a');a.href=previewUrl;a.download=file.name;a.click();};
 dialog.querySelector('#close-share').onclick=()=>dialog.close();dialog.showModal();
}

export function clearSharePreview(){generation++;busy=false;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}const dialog=document.querySelector('#share-dialog');dialog?.close();dialog?.querySelector('img').removeAttribute('src');const notice=document.querySelector('#share-notice');if(notice)notice.hidden=true;}

export async function shareImage(blob,title){const file=new File([blob],`tripezgo-${Date.now()}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:`TripEZGo · ${t(title)}`});return;}catch(error){if(error.name==='AbortError')return;}}openPreview(blob,file,title);}
