const placementStages = [
 {title:'Fit the cradle',short:'Cradle fitted · Both lip mounts supported',copy:'Adjust the cradle to the opening width so its two lip-edge mounts rest securely on opposite edges of the sewer rim. The cradle sits below the rim, supported by both mounts.',detail:'Work from the surface · Secure contact at both ends',confirm:'Confirm cradle fit'},
 {title:'Assemble the sensor',short:'Cradle, pole, and sensor assembled',copy:'Attach the pole to the cradle, then connect the radar sensor to the lower end of the pole. Check that both connections are secure.',detail:'Two connections · One stable assembly',confirm:'Confirm assembly'},
 {title:'Lower into position',short:'Both lip mounts seated · Sensor above water',copy:'Lower the assembly from the surface until both lip-edge mounts rest fully on the sewer rim, supporting the cradle below the opening. Keep the radar above the water, with its angled face pointing into the approaching flow.',detail:'Water flows toward the angled face',confirm:'Confirm position'},
 {title:'Align with the flow',short:'Radar centered on the flow axis',copy:'Looking down from the surface, gently twist the pole until the radar’s sensing axis follows the center of the flow. Secure the pole in this position.',detail:'Top view · Align the radar with the channel',confirm:'Complete deployment'}
];
function placementArt(stage) {
 const id=`precision-${stage}`;
 const cradleBase=`<rect x="190" y="121" width="180" height="12" rx="3" fill="#8fa8b9"/><rect x="267" y="120" width="26" height="20" rx="4" fill="#334e61"/><circle cx="280" cy="129" r="3" fill="#a8c1d0"/>`;
 const left=`<path d="M143 95H165V127H243" fill="none" stroke="#668496" stroke-width="9" stroke-linejoin="round"/><rect x="126" y="92" width="35" height="8" rx="2" fill="#20394b"/>`;
 const right=`<path d="M417 95H395V127H317" fill="none" stroke="#668496" stroke-width="9" stroke-linejoin="round"/><rect x="399" y="92" width="35" height="8" rx="2" fill="#20394b"/>`;
 const mount=`${left}${right}${cradleBase}`;
 const pole=`<rect x="273" y="137" width="14" height="141" rx="4" fill="#8fa8b9"/>`;
 const sensor=`<path d="M247 273H328Q334 273 330 279L303 310Q300 314 295 314H247Q240 314 240 307V280Q240 273 247 273Z" fill="#243e52"/><path d="M329 282L306 307" stroke="#8ec7e6" stroke-width="3"/><rect x="253" y="291" width="24" height="5" rx="2.5" fill="#3bb3f2"/>`;
 const walls=`<path d="M44 102H160V326Q160 334 152 334H52Q44 334 44 326ZM400 102H516V326Q516 334 508 334H408Q400 334 400 326Z" fill="#e5edf2"/><path d="M44 102H160M400 102H516" stroke="#b0c2ce" stroke-width="3"/>`;
 const flow=`<g clip-path="url(#${id}-channel)"><rect x="32" y="353" width="496" height="66" fill="#e0f0f9"/><path class="precision-current" d="M-280 355Q-210 349-140 355T0 355T140 355T280 355T420 355T560 355T700 355T840 355" fill="none" stroke="#69bae7" stroke-width="2"/><path d="M32 387H528" stroke="#c8e2f0" stroke-width="1"/><g class="precision-horizontal-arrows" stroke="#258cc9" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">${[-80,60,200,340,480,620,760].map(x=>`<path d="M${x+32} 387H${x}m7-6-7 6 7 6"/>`).join('')}</g></g>`;
 let art;
 if(stage===0) art=`${walls}<g class="precision-fit-left">${left}</g><g class="precision-fit-right">${right}</g>${cradleBase}<path d="M176 66H384m-208 0 6-4m-6 4 6 4m202-4-6-4m6 4-6 4" stroke="#288fce" stroke-width="1.5" fill="none" stroke-linecap="round"/><g class="precision-contact" fill="#269b78"><circle cx="144" cy="103" r="3"/><circle cx="416" cy="103" r="3"/></g>`;
 if(stage===1) art=`<g class="precision-connect-top">${mount}</g>${pole}<g class="precision-connect-bottom">${sensor}</g><g class="precision-connection" fill="none" stroke="#2c9cce" stroke-width="1.5"><circle cx="280" cy="142" r="11"/><circle cx="280" cy="271" r="11"/></g>`;
 if(stage===2) art=`${walls}${flow}<g class="precision-lower">${mount}${pole}${sensor}<path d="M262 315V351M319 301L367 349" stroke="#238ece" stroke-width="1.5" stroke-dasharray="3 5" fill="none"/><path d="M311 308L351 354H379Z" fill="#138dd3" opacity=".055"/></g><path d="M128 104H157M402 104H431" stroke="#54a58f" stroke-width="1.5"/>`;
 if(stage===3) art=`<rect x="151" y="40" width="258" height="361" rx="28" fill="#e9f4fa"/><path d="M152 64V377M408 64V377" stroke="#d1e6f2" stroke-width="2"/><g clip-path="url(#${id}-top)"><path d="M197 40V401M363 40V401" stroke="#c8e2f0" stroke-width="1"/><path d="M280 53V388" stroke="#a2cfe8" stroke-width="1" stroke-dasharray="3 6"/><g class="precision-flow-arrows" fill="none" stroke="#3999ce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${[197,363].map(x=>[-100,20,140,260,380,500].map(y=>`<path d="M${x} ${y}v30m-6-7 6 7 6-7"/>`).join('')).join('')}</g></g><g class="precision-align"><g transform="rotate(180 280 214)"><path d="M261 248L238 355H322L299 248Z" fill="#1089d1" opacity=".07"/><rect x="249" y="164" width="62" height="100" rx="12" fill="#294558"/><rect x="254" y="169" width="52" height="82" rx="8" fill="#49687e"/><rect x="269" y="252" width="22" height="4" rx="2" fill="#36b1ef"/><circle cx="280" cy="203" r="10" fill="#273f51"/><circle cx="280" cy="203" r="5" fill="#6f8fa4"/></g></g><path d="M230 140Q280 111 330 140" fill="none" stroke="#508eaf" stroke-width="1.5" stroke-linecap="round" marker-start="url(#${id}-rotation-tip)" marker-end="url(#${id}-rotation-tip)"/>`;
 return `<svg class="precision-art precision-art-${stage}" viewBox="0 0 560 440" role="img" aria-label="${placementStages[stage].title}"><defs><marker id="${id}-rotation-tip" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M1 1L7 5L1 9" fill="none" stroke="#508eaf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker><clipPath id="${id}-channel"><rect x="32" y="345" width="496" height="74" rx="12"/></clipPath><clipPath id="${id}-top"><rect x="151" y="40" width="258" height="361" rx="28"/></clipPath></defs>${art}</svg>`;
}
function placementBody(index) {
 const stage=index-3,data=placementStages[stage],photo=state.photos[stage];
 return `<div class="placement-layout"><div class="installation-scene">${stage===3?'<div class="scene-label">TOP VIEW</div>':''}${placementArt(stage)}</div><div class="placement-copy"><h3>${['Adjust until flush with the edge','Ensure the assembly is straight','Set it in place.','Rotate to center with the flow'][stage]}</h3><p>${data.copy}</p><div class="photo-slot">${photo?`<img class="evidence-photo" src="${photo}" alt="Photo for ${data.title}"><div class="photo-controls"><label class="photo-button" tabindex="0">Replace photo<input id="stage-photo" type="file" accept="image/*" capture="environment"></label><button id="remove-photo" class="text-button">Remove</button></div>`:`<label class="photo-button" tabindex="0"><span class="camera-icon" aria-hidden="true">＋</span><span>Take or attach a photo<small>Optional installation record</small></span><input id="stage-photo" type="file" accept="image/*" capture="environment"></label>`}<p id="photo-status" role="status"></p></div><div class="actions"><button id="confirm-placement" class="primary">${data.confirm} ${stage===3?'✓':'→'}</button></div></div></div>`;
}
function bindPlacement() {
 const index=state.active,stage=index-3;
 document.querySelector('#confirm-placement').onclick=()=>{if(state.done.slice(0,index).every(Boolean)&&!conflict()){finish(index);if(state.complete){const bar=document.querySelector('.water-progress');bar.tabIndex=-1;bar.focus();}}};
 const input=document.querySelector('#stage-photo'),label=input.closest('label');
 label.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();input.click();}};
 input.onchange=async()=>{
  const file=input.files[0];if(!file)return;
  const status=document.querySelector('#photo-status');
  if(!file.type.startsWith('image/')||file.size>20*1024*1024){status.textContent='Choose an image smaller than 20 MB.';return;}
  status.textContent='Preparing photo…';document.querySelector('#confirm-placement').disabled=true;
  try {
   const bitmap=await loadPhoto(file),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
   canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);state.photos[stage]=canvas.toDataURL('image/jpeg',.85);
   if(state.active===index)render();
  }catch{status.textContent='This image could not be opened. Try a JPEG or PNG.';if(state.active===index)document.querySelector('#confirm-placement').disabled=false;}
 };
 const remove=document.querySelector('#remove-photo');if(remove)remove.onclick=()=>{state.photos[stage]=null;render();};
}

function loadPhoto(file) {
 return new Promise((resolve,reject)=>{
  const reader=new FileReader(),image=new Image();
  const timer=setTimeout(()=>reject(new Error('Photo timed out')),15000);
  const fail=()=>{clearTimeout(timer);reject(new Error('Cannot read photo'));};
  reader.onerror=fail;image.onerror=fail;
  image.onload=()=>{clearTimeout(timer);resolve(image);};
  reader.onload=()=>{image.src=reader.result;};reader.readAsDataURL(file);
 });
}
