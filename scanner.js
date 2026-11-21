(()=>{'use strict';
const $=id=>document.getElementById(id);
const ORIGIN='https://k199235.github.io';
const FORMAT=/^[A-Z0-9][A-Z0-9._-]{4,79}$/;
let scanner=null,starting=false,active=false,last='',lastAt=0,count=0,audio=null;
const allowedOrigins=new Set(['https://script.google.com']);
function allowedAppOrigin(origin){try{let u=new URL(origin);return u.protocol==='https:'&&(u.hostname==='script.google.com'||u.hostname==='script.googleusercontent.com'||u.hostname.endsWith('.googleusercontent.com'));}catch{return false;}}
const query=new URLSearchParams(location.search);
const fromApp=query.get('openerOrigin')||'';
const linked=!!(window.opener&&allowedAppOrigin(fromApp));
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
function beep(ok){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio=audio||new AC();audio.resume().catch(()=>{});let o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.frequency.value=ok?1000:300;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.13);}}catch{}try{navigator.vibrate?.(ok?40:100)}catch{}}
function decoded(value){let track=String(value||'').trim().toUpperCase().replace(/\s+/g,'');const now=Date.now();if(track===last&&now-lastAt<2800)return;if(!FORMAT.test(track)){status('รูปแบบบาร์โค้ดไม่ตรงกับเลขแทรคที่รองรับ',true);beep(false);return;}last=track;lastAt=now;count++;$('latest').textContent=track;$('count').textContent='อ่านแล้ว '+count+' ครั้งในหน้านี้';beep(true);
if(linked){try{window.opener.postMessage({type:'KL_RG_PUBLIC_CAMERA_SCAN',version:1,track},fromApp);status('อ่าน '+track+' แล้ว · ส่งกลับ KL Tracking เพื่อตรวจสอบ');}catch{status('ส่งกลับ KL Tracking ไม่สำเร็จ',true);}}
else status('อ่าน '+track+' แล้ว · หากต้องการบันทึกส่งออก ให้เปิดจาก KL Tracking ที่ล็อกอินอยู่');}
function errorMessage(e){const x=String(e?.message||e);if(/permission|denied|notallowed|security|policy/i.test(x))return 'กล้องถูกปฏิเสธสิทธิ์ ตรวจการอนุญาตกล้องของเว็บไซต์นี้';if(/notfound|device not found/i.test(x))return 'ไม่พบกล้องในอุปกรณ์';return 'เปิดกล้องไม่สำเร็จ: '+x;}
async function start(){if(starting||active)return;if(!window.isSecureContext){status('ต้องเปิดหน้าเว็บผ่าน HTTPS',true);return;}if(!navigator.mediaDevices?.getUserMedia){status('อุปกรณ์หรือเบราว์เซอร์ไม่รองรับกล้องผ่านเว็บ',true);return;}if(!window.Html5Qrcode){status('ไม่สามารถโหลดไลบรารีสแกน',true);return;}starting=true;$('start').disabled=true;$('placeholder').hidden=true;
try{const f=window.Html5QrcodeSupportedFormats;scanner=new Html5Qrcode('reader',{formatsToSupport:[f.CODE_128,f.CODE_39],verbose:false});const opts={fps:18,qrbox:(w,h)=>({width:Math.max(100,Math.min(Math.floor(w*.88),400)),height:Math.max(75,Math.min(Math.floor(h*.34),150))}),disableFlip:true};try{await scanner.start({facingMode:'environment'},opts,decoded,()=>{});}catch(first){let cams=await Html5Qrcode.getCameras().catch(()=>[]);if(!cams.length)throw first;let cam=cams.find(c=>/back|rear|environment|หลัง/i.test(c.label||''))||cams[cams.length-1];await scanner.start(cam.id,opts,decoded,()=>{});}active=true;$('stop').disabled=false;status('กล้องสดพร้อมสแกนต่อเนื่อง');}
catch(e){status(errorMessage(e),true);const s=scanner;scanner=null;if(s){try{await s.stop()}catch{}try{await s.clear()}catch{}}$('placeholder').hidden=false;}
finally{starting=false;$('start').disabled=false;}}
async function stop(){const s=scanner;scanner=null;active=false;$('stop').disabled=true;if(s){try{await s.stop()}catch{}try{await s.clear()}catch{}}$('placeholder').hidden=false;status('ปิดกล้องแล้ว');}
$('start').addEventListener('click',start);$('stop').addEventListener('click',stop);window.addEventListener('pagehide',()=>{stop()});
})();