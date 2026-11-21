(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {tracks: [], scanner: null, active: false, last: '', lastAt: 0};
  const LIMIT = 200;
  const CARRIER = new Set(['flash', 'jnt', 'kex', 'thaipost', 'other']);
  const FORMAT = /^[A-Z0-9][A-Z0-9._-]{4,79}$/;
  const roundId = 'SCAN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
  $('round').textContent = roundId;
  $('date').textContent = new Date().toLocaleDateString('th-TH');
  function message(text, bad=false){const m=$('message');m.textContent=text;m.className='message show'+(bad?' bad':'');}
  function normal(raw){return String(raw||'').trim().toUpperCase().replace(/\s+/g,'');}
  function add(raw){
    const track=normal(raw);
    if (!FORMAT.test(track)){message('รูปแบบเลขแทรคไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่',true);return;}
    if(state.tracks.includes(track)){message('เลขแทรคซ้ำในรอบนี้: '+track,true);return;}
    if(state.tracks.length>=LIMIT){message('สูงสุด '+LIMIT+' บิลต่อรอบ',true);return;}
    state.tracks.push(track);$('track').value='';draw();
    if(navigator.vibrate)navigator.vibrate(40);
  }
  function draw(){
    const tb=$('rows');tb.replaceChildren();
    if(!state.tracks.length){const tr=tb.insertRow();const c=tr.insertCell();c.colSpan=4;c.className='empty';c.textContent='ยังไม่มีเลขแทรค';}
    state.tracks.forEach((track,i)=>{
      const tr=tb.insertRow();tr.insertCell().textContent=String(i+1);tr.insertCell().textContent=track;
      const status=tr.insertCell(),s=document.createElement('span');s.className='pill';s.textContent='สแกนแล้ว';status.append(s);
      const td=tr.insertCell(),b=document.createElement('button');b.className='remove';b.textContent='🗑';b.type='button';b.setAttribute('aria-label','ลบ '+track);b.addEventListener('click',()=>{state.tracks.splice(i,1);draw();});td.append(b);
    });
    const n=state.tracks.length;
    $('count').textContent='ทั้งหมด '+n+' บิล';$('total').textContent=String(n);
    $('ready').textContent=n?'✔ รับเลขแทรคแล้ว '+n+' รายการ (รอตรวจใน KL Tracking)':'○ สแกนรายการก่อนส่งไป KL Tracking';
    $('send').disabled=!(n && CARRIER.has($('carrier').value));
    $('send').textContent='⇧ ส่งรายการไป KL Tracking ('+n+' บิล)';
  }
  async function start(){
    if(state.active)return;
    if(!window.isSecureContext){message('ต้องเปิดผ่าน HTTPS (GitHub Pages) เพื่อใช้กล้อง',true);return;}
    if(!window.Html5Qrcode){message('โหลดไลบรารีกล้องไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ต หรือพิมพ์เลขแทรคแทน',true);return;}
    $('cameraArea').hidden=false;
    const formats = window.Html5QrcodeSupportedFormats;
    try{
      state.scanner = new Html5Qrcode('reader', {formatsToSupport: [formats.CODE_128,formats.CODE_39,formats.EAN_13,formats.QR_CODE],verbose:false});
      await state.scanner.start({facingMode:'environment'},{fps:8,qrbox:(w,h)=>({width:Math.min(Math.floor(w*.86),360),height:Math.min(Math.floor(h*.44),170)}),aspectRatio:1.333},decoded=>{
        const track=normal(decoded),now=Date.now();
        if(track===state.last && now-state.lastAt<2600)return;
        state.last=track;state.lastAt=now;add(track);
      },()=>{});
      state.active=true;$('start').textContent='▣ กล้องกำลังสแกน';message('เปิดกล้องแล้ว เล็งบาร์โค้ดทีละรายการ');
    }catch(e){state.active=false;$('cameraArea').hidden=true;state.scanner=null;message('เปิดกล้องไม่ได้: '+(e?.message||String(e))+' — กรุณาพิมพ์เลขแทรคแทน',true);}
  }
  async function stop(){
    if(!state.scanner)return;
    const s=state.scanner;state.scanner=null;
    try{if(state.active)await s.stop();await s.clear();}catch(e){}
    state.active=false;$('cameraArea').hidden=true;$('start').textContent='▣ เปิดกล้องสแกน';
  }
  async function copy(){
    if(!state.tracks.length){message('ยังไม่มีรายการให้คัดลอก',true);return;}
    const value=state.tracks.join('\n');
    try{await navigator.clipboard.writeText(value);message('คัดลอก '+state.tracks.length+' รายการแล้ว นำไปวางใน KL Tracking');}
    catch(e){const el=$('copyFallback');el.hidden=false;el.value=value;el.focus();el.select();message('เบราว์เซอร์ไม่อนุญาตคัดลอกอัตโนมัติ กรุณาคัดลอกข้อความจากช่องด้านล่าง',true);}
  }
  function allowedOrigin(origin){
    try{const u=new URL(origin);return u.protocol==='https:'&&(u.hostname==='script.google.com'||u.hostname==='script.googleusercontent.com'||u.hostname.endsWith('.googleusercontent.com'));}
    catch(e){return false;}
  }
  async function send(){
    if(!$('carrier').value||!state.tracks.length){message('กรุณาเลือกบริษัทขนส่งและสแกนรายการก่อน',true);return;}
    const q=new URLSearchParams(location.search),origin=q.get('openerOrigin');
    if(window.opener && origin && allowedOrigin(origin)){
      // Sends only scanned numbers; no authentication token, password, or privileged action.
      window.opener.postMessage({type:'KL_RG_SCANNER_BATCH',version:1,carrier:$('carrier').value,tracks:[...state.tracks],roundId},origin);
      message('ส่งเลขแทรคไปหน้าต่าง KL Tracking แล้ว โปรดกลับไปตรวจสอบสถานะและกดยืนยันส่งออกใน KL Tracking (ถ้าไม่ขึ้น ให้คัดลอกแทน)');
    } else {
      await copy();
      message('ยังไม่เชื่อมกับหน้าต่าง KL Tracking: คัดลอกเลขแทรคแล้ว ให้นำไปวางใน KL Tracking และกดยืนยันที่นั่น');
    }
  }
  $('manual').addEventListener('submit',ev=>{ev.preventDefault();add($('track').value);});
  $('start').addEventListener('click',start);
  $('stop').addEventListener('click',stop);
  $('carrier').addEventListener('change',draw);
  $('clear').addEventListener('click',()=>{if(state.tracks.length&&!confirm('ล้างรายการที่สแกนทั้งหมดในรอบนี้?'))return;state.tracks=[];draw();});
  $('copy').addEventListener('click',copy);
  $('send').addEventListener('click',send);
  window.addEventListener('pagehide',()=>{stop();});
  draw();
})();
