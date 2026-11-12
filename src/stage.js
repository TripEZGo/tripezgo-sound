import {t,getLocale} from './i18n.js';
import * as THREE from 'three';
export function mountStage(host,reduced){
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});}catch{host.classList.add('fallback');return()=>{};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(0,2.6,12);camera.lookAt(0,0,0);
 const group=new THREE.Group();scene.add(group);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.35,.028,12,180),new THREE.MeshBasicMaterial({color:0x5cc6c3}));group.add(ring);
 const inner=new THREE.Mesh(new THREE.TorusGeometry(2.12,.008,8,180),new THREE.MeshBasicMaterial({color:0x7ad7d4}));group.add(inner);
 const geo=new THREE.BoxGeometry(.035,1,.035),lime=new THREE.MeshBasicMaterial({color:0x5cc6c3}),blue=new THREE.MeshBasicMaterial({color:0x2f918e});
 const bars=[];for(let i=0;i<150;i++){const angle=i/150*Math.PI*2;const b=new THREE.Mesh(geo,i%6===0?blue:lime);b.position.set(Math.cos(angle)*2.7,Math.sin(angle)*2.7,0);b.rotation.z=angle-Math.PI/2;b.scale.y=.12+Math.pow(Math.sin(i*9.4),4)*1.2;group.add(b);bars.push(b);}
 group.rotation.x=-.2;group.rotation.y=-.35;group.rotation.z=-.25;
 const positions=new Float32Array(650*3);for(let i=0;i<positions.length;i++)positions[i]=(Math.random()-.5)*24;
 const particles=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3)),new THREE.PointsMaterial({color:0xc7bcb1,size:.018,transparent:true,opacity:.55}));scene.add(particles);
 const floor=new THREE.GridHelper(35,35,0x3a3930,0x28231e);floor.position.y=-3.8;scene.add(floor);
 let frame=0,t=0,px=0,py=0;const labels=[];
 function labelTexture(canvas){const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
 function clearLabels(){for(const sprite of labels){group.remove(sprite);sprite.material.map.dispose();sprite.material.dispose();}labels.length=0;}
 function setData(data){clearLabels();if(data){const entries=[...data.tracks.slice(0,3).map((r,i)=>({name:r.name,sub:`TRACK 0${i+1} · ${r.count.toLocaleString(getLocale())} 次`})),...data.artists.slice(0,3).map((r,i)=>({name:r.name,sub:`ARTIST 0${i+1} · ${r.count.toLocaleString(getLocale())} 次`}))];entries.forEach((r,i)=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=150;const c=canvas.getContext('2d');c.fillStyle='#17120f';c.fillRect(0,0,640,150);c.strokeStyle='#5cc6c3';c.lineWidth=3;c.strokeRect(1.5,1.5,637,147);c.fillStyle='#7ad7d4';c.font='24px sans-serif';c.fillText(t(r.sub),24,43);c.fillStyle='#f3ede5';c.font='bold 44px sans-serif';let text=r.name;while(c.measureText(text).width>584&&text.length>1)text=text.slice(0,-1);if(text!==r.name)text=text.slice(0,-1)+'…';c.fillText(text,24,105);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(canvas),depthTest:false}));const angle=Math.PI/2-i/6*Math.PI*2;sprite.position.set(Math.cos(angle)*2.35,Math.sin(angle)*2.35,.3);sprite.scale.set(2.45,.57,1);sprite.renderOrder=10;group.add(sprite);labels.push(sprite);});}render();}

 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();};
 const render=()=>renderer.render(scene,camera);
 const move=e=>{px=(e.clientX/innerWidth-.5)*.3;py=(e.clientY/innerHeight-.5)*.15;};
 function animate(){if(document.hidden){frame=requestAnimationFrame(animate);return;}t+=.009;group.rotation.y+=((-.35+px)-group.rotation.y)*.02;group.rotation.x+=((-.2+py)-group.rotation.x)*.02;group.rotation.z=-.25+Math.sin(t*.3)*.06;bars.forEach((b,i)=>b.scale.y=.14+Math.pow(Math.sin(i*9.4+t*(1+i%3)),4)*(.7+.4*Math.sin(i)));particles.rotation.y=t*.015;render();frame=requestAnimationFrame(animate);}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();if(!reduced){window.addEventListener('pointermove',move);animate();}
 const dispose=()=>{clearLabels();cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('pointermove',move);scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});renderer.dispose();renderer.domElement.remove();};
 dispose.setData=setData;return dispose;
}
