const app = document.querySelector('#app');
const units = { m: 1, cm: .01, ft: .3048, in: .0254 };
const state = { active: 0, done: [false,false,false,false,false,false,false], photos: [null,null,null,null], location: {lat:40.7128,lng:-74.006}, depth: .3048, depthUnit: 'ft', shape: 'Circular', ellipseOrientation: 'Horizontal', moreShapes: false, width: 1.2192, height: 1.2192, geometryUnit: 'ft', description: 'Custom sewer cross-section', above: true, aligned: true, complete: false, view: 'Street' };
let map, miniMap, marker, geoRequested = false, previousProgress = 0;
const fmt = value => Number(value.toPrecision(10)).toString();
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function installation(dip = false) { return `<svg viewBox="0 0 480 370" role="img" aria-label="${dip ? 'A dipstick is lowered from the surface to measure water depth from the sewer floor.' : 'Surface-mounted pole suspends a sensor above water, with level sensing downward and flow sensing at 45 degrees.'}"><defs><linearGradient id="water" x2="0" y2="1"><stop stop-color="#85c9f5"/><stop offset="1" stop-color="#c2e5fa"/></linearGradient><pattern id="wall" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12L12 0" stroke="#d5e0e8" stroke-width="1"/></pattern></defs><path d="M30 80H140V290H30ZM340 80H450V290H340Z" fill="#e2eaf0"/><path d="M30 80H140V290H30ZM340 80H450V290H340Z" fill="url(#wall)"/><path d="M22 80H140M340 80H458" stroke="#8da4b5" stroke-width="4"/><text x="45" y="65" fill="#687f90" font-size="13">SURFACE</text><path d="M140 290 Q240 303 340 290V340H140Z" fill="url(#water)"/><path d="M140 340H340" stroke="#9eafbb" stroke-width="4"/>${dip ? `<g class="dipstick"><rect x="235" y="105" width="10" height="230" rx="3" fill="#c8a370"/><path d="M235 295V335H245V295" fill="#0876db"/><path d="M235 140h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6" stroke="#655b48"/></g><path d="M307 294v43m-5-43h10m-10 43h10" stroke="#0876db" stroke-width="2"/><text x="322" y="318" fill="#0876db" font-size="13">Water depth</text><g class="reading"><rect x="258" y="173" width="130" height="44" rx="10" fill="white"/><text x="270" y="200" font-size="13" fill="#0876db">Read the wet mark</text></g>` : `<rect x="121" y="70" width="238" height="13" rx="4" fill="#637f93"/><rect x="231" y="81" width="16" height="134" rx="3" fill="#9aafbd"/><path d="M209 211H279L256 239H209Z" fill="#263f53"/><rect x="220" y="219" width="25" height="6" rx="3" fill="#0876db"/><path class="beam" d="M227 239L208 290H246Z" fill="#0876db" opacity=".13"/><path d="M227 239V290M263 231L321 289" stroke="#0876db" stroke-width="2" stroke-dasharray="5 5"/><text x="150" y="262" fill="#0876db" font-size="12">60 GHz</text><text x="287" y="252" fill="#0876db" font-size="12">45°</text><text x="154" y="44" font-size="13" fill="#687f90">Extendable surface mount</text><path d="M272 158h47" stroke="#8da4b5"/><text x="280" y="148" fill="#687f90" font-size="12">Pole</text><g class="flow" stroke="#0876db" stroke-width="2" fill="none"><path d="M154 317h30l-7-5m7 5-7 5M210 317h30l-7-5m7 5-7 5M266 317h30l-7-5m7 5-7 5"/></g>`}</svg>`; }
function login() { app.innerHTML = `<main class="login"><section class="login-form"><img class="logo" src="assets/logo.jpg" alt="HydroRadar"><h1>Ready for the field.</h1><p>Log in to set up your HydroRadar.</p><form id="login" novalidate><label>Email<input type="email" name="email" autocomplete="off" placeholder="you@company.com" value="field@example.com"></label><label>Password<input type="password" name="password" autocomplete="off" placeholder="Enter your password" value="hydroradar"></label><button class="primary">Log in <span aria-hidden="true">↗</span></button></form></section><aside class="login-art">${installation()}<div class="eyebrow">Precision starts here</div><h2>A clear view.<br>From the surface.</h2><p>Locate, measure, and align.<br>Your installation, one step at a time.</p></aside></main>`; document.querySelector('#login').onsubmit = event => { event.preventDefault(); event.target.reset(); render(); }; }
function render() {
 const count = state.done.filter(Boolean).length;
 app.innerHTML = `<header class="topbar"><img class="logo" src="assets/logo.jpg" alt="HydroRadar"></header><main class="workspace"><section class="water-progress ${count===7 ? 'is-complete' : ''}" role="progressbar" aria-label="Deployment progress" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${count}" aria-valuetext="${count} of 7 steps complete"><div class="water-fill" style="width:${previousProgress}%"><div class="water-waves"></div></div><div class="water-progress-label"><h1>${count===7 ? 'Deployment complete' : 'Deployment'}</h1><span>${count} of 7 complete <strong>${Math.round(count / 7 * 100)}%</strong></span></div></section><div id="checklist"></div></main>`;
 const fill = document.querySelector('.water-fill');
 requestAnimationFrame(() => requestAnimationFrame(() => { if(fill.isConnected) fill.style.width = `${Math.round(count / 7 * 100)}%`; }));
 previousProgress = count / 7 * 100;
}
login();
const titles = ['Device location','Water depth','Pipe geometry',...placementStages.map(stage=>stage.title)];
const coords = () => state.location ? `${state.location.lat.toFixed(6)}, ${state.location.lng.toFixed(6)}` : '';
const height = () => state.shape==='Circular' ? state.width : state.height;
const conflict = () => state.depth !== null && height() !== null && state.depth > height() + 1e-10;
const measure = (v, unit) => v === null ? '—' : `${display(v, unit)} ${unit}`;
function summary(i) { return [coords(),`Water depth: ${measure(state.depth,state.depthUnit)}`,`${shapeName()}${state.shape==='Elliptical'?' ('+state.ellipseOrientation.toLowerCase()+')':''} · ${measure(state.width,state.geometryUnit)}${state.shape==='Circular'?' diameter':` × ${measure(state.height,state.geometryUnit)}`}`, ...placementStages.map((stage,j)=>stage.short+(state.photos[j]?' · Photo attached':''))][i]; }
const baseRender = render;
render = function() {
 if(map) { map.remove(); map = null; }
 if(miniMap) { miniMap.remove(); miniMap = null; }
 baseRender();
 const list = document.querySelector('#checklist');
 list.innerHTML = `${state.complete ? '<div class="share-actions"><a id="email-report" class="share-link">Share by email</a><button id="download-pdf" class="primary">Download PDF ↓</button><p id="export-status" role="status"></p></div>' : ''}${titles.map((title,i) => `<section class="step ${state.active === i ? 'active' : ''} ${state.done[i] ? 'done' : ''} ${!state.done[i] && state.active !== i ? 'upcoming' : ''}"><div class="step-header"><span class="step-number">${state.done[i] ? '✓' : String(i+1).padStart(2,'0')}</span><div class="step-heading"><h2>${title}</h2>${state.done[i] && state.active !== i ? `<p>${esc(summary(i))}</p>` : ''}</div>${i===0 && state.done[0] && state.active!==0 ? '<div id="mini-map" class="mini-map" aria-label="Installation location map preview"></div>' : ''}${state.done[i] && state.active !== i ? `<button class="text-button" data-edit="${i}" aria-label="Edit ${title}">Edit</button>` : ''}</div>${state.active===i ? `<div class="step-body" id="step-body">${body(i)}</div>` : ''}</section>`).join('')}`;
 document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => { state.active = Number(button.dataset.edit); state.done[state.active]=false; state.complete = false; render(); focusStep(); });
 if(state.complete) {
  document.querySelector('#email-report').href=emailLink();
  document.querySelector('#download-pdf').onclick=downloadPdf;
 }
 if(state.active === 0) initMap();
 if(state.active === 1) bindDepth();
 if(state.active === 2) bindGeometry();
 if(state.active >= 3) bindPlacement();
 if(document.querySelector('#mini-map') && window.maplibregl) {
  miniMap = new maplibregl.Map({container:'mini-map',style:mapStyle('Street'),center:state.location,zoom:13,interactive:false,attributionControl:false});
  miniMap.addControl(new maplibregl.AttributionControl({compact:true}));
  new maplibregl.Marker({color:'#0876db',scale:.5}).setLngLat(state.location).addTo(miniMap);
 }
};
function body(i) {
 if(i===0) return `<p>Pin the manhole location. Location access helps place your installation accurately.</p><div class="map-shell"><div id="map" aria-label="Installation map. Use arrow keys to pan, then select map center." tabindex="0"></div><div class="map-cross" aria-hidden="true">＋</div><div class="map-views"><button data-view="Street" class="${state.view==='Street'?'selected':''}" aria-pressed="${state.view==='Street'}">Street</button><button data-view="Satellite" class="${state.view==='Satellite'?'selected':''}" aria-pressed="${state.view==='Satellite'}">Satellite</button></div></div><p id="location-status" role="status" class="note">Tap or press and hold to place a pin. Use arrow keys to pan and select the map center.</p><div class="actions location-actions"><div class="location-tools"><button id="locate">◎ Use my location</button><button id="center">Select map center</button><button id="clear">Choose again</button></div><button id="confirm-location" class="primary" ${!state.location?'disabled':''}>Confirm location →</button></div>`;
 if(i===1) return `<div class="split"><div class="illustration">${installation(true)}<p>Lower to the floor. Withdraw. Read the wet mark.</p></div><div><h2>Measure the water.</h2><p style="margin:10px 0 24px">Use a dipstick from the surface to measure the water depth.</p><label for="depth">Water depth</label><div class="measurement"><input id="depth" type="number" min="0" step="any" inputmode="decimal" placeholder="0.32" value="${display(state.depth,state.depthUnit)}" aria-describedby="depth-error"><select id="depth-unit" aria-label="Water depth unit">${options(state.depthUnit)}</select></div><p id="depth-error" class="error" role="status"></p></div></div><div class="actions"><button id="confirm-depth" class="primary">Confirm water depth →</button></div>`;
 if(i===2) return geometryBody();
 return placementBody(i);
}
function display(value,unit) { return value === null ? '' : fmt(value / units[unit]); }
function options(selected) { return Object.keys(units).map(unit => `<option value="${unit}" ${unit===selected?'selected':''}>${{m:'Meters',cm:'Centimeters',ft:'Feet',in:'Inches'}[unit]} (${unit})</option>`).join(''); }
function focusStep() { const heading = document.querySelector('.active h2'); if(heading) { heading.tabIndex=-1; heading.focus({preventScroll:true}); heading.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); } }
function finish(i) { state.done[i]=true; state.complete=false; state.active=state.done.findIndex(done=>!done); if(state.active===-1) { state.complete=true; state.above=true; state.aligned=true; state.completedAt=new Date().toISOString(); } render(); focusStep(); }
function invalidate() { state.review=state.done[3] || state.review; state.complete=false; state.done.fill(false,3); state.above=false; state.aligned=false; updateProgress(); }
function mapStyle(view) {
 if(view !== 'Satellite') return 'https://tiles.openfreemap.org/styles/positron';
 return {version:8,sources:{satellite:{type:'raster',tiles:['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Tiles © Esri — Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'}},layers:[{id:'satellite',type:'raster',source:'satellite'}]};
}
function initMap() {
 const status = document.querySelector('#location-status');
 if(!window.maplibregl) { status.textContent='The map could not load. Check your connection and use a browser with WebGL enabled.'; return; }
 try { map = new maplibregl.Map({container:'map',style:mapStyle(state.view),center:state.location || [-74.006,40.7128],zoom:state.location?16:12,maxZoom:19,attributionControl:false}); } catch { status.textContent='The map could not start. Use a browser with WebGL enabled.'; return; }
 map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-left');
 map.addControl(new maplibregl.AttributionControl({compact:true}));
 map.dragRotate.disable(); map.touchZoomRotate.disableRotation();
 map.getCanvas().setAttribute('aria-label','Installation map. Use arrow keys to pan, then select map center.');
 marker=null; let locationRequest=0;
 const place = point => {
  locationRequest++; state.location={lat:point.lat,lng:((point.lng+180)%360+360)%360-180};
  if(marker) marker.setLngLat(state.location);
  else { marker=new maplibregl.Marker({draggable:true,color:'#0876db'}).setLngLat(state.location).addTo(map); marker.on('dragend',()=>place(marker.getLngLat())); }
  status.textContent=`Selected location: ${coords()}. Move the pin to adjust.`;
  document.querySelector('#confirm-location').disabled=false;
 };
 if(state.location) place(state.location);
 map.on('click',event=>{ if(!event.originalEvent.target.closest('.maplibregl-marker')) place(event.lngLat); });
 let hold, start;
 const container=map.getCanvasContainer();
 const shell=document.querySelector('.map-shell');
 const cancel=()=>{clearTimeout(hold);shell.classList.remove('holding');};
 container.addEventListener('pointerdown',event=>{
  if(event.target.closest('.maplibregl-marker')) return;
  start={x:event.clientX,y:event.clientY};
  const rect=map.getCanvas().getBoundingClientRect();
  const point=map.unproject([event.clientX-rect.left,event.clientY-rect.top]);
  shell.classList.add('holding');hold=setTimeout(()=>{place(point);cancel();},650);
 });
 container.addEventListener('pointermove',event=>{if(start && Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)cancel();});
 ['pointerup','pointercancel','pointerleave'].forEach(name=>container.addEventListener(name,cancel));
 map.on('remove',cancel);
 document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{
  state.view=button.dataset.view;map.setStyle(mapStyle(state.view));
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',b===button);});
 });
 document.querySelector('#center').onclick=()=>place(map.getCenter());
 document.querySelector('#clear').onclick=()=>{locationRequest++;if(marker)marker.remove();marker=null;state.location=null;document.querySelector('#confirm-location').disabled=true;status.textContent='Select another location on the map, or select the map center.';map.getCanvas().focus();};
 document.querySelector('#confirm-location').onclick=()=>{if(state.location)finish(0);};
 function locate() {
  if(!navigator.geolocation){status.textContent='Location is unavailable. Select the installation location on the map.';return;}
  const request=++locationRequest;status.textContent='Finding your location…';
  navigator.geolocation.getCurrentPosition(position=>{
   if(request!==locationRequest || !status.isConnected)return;
   const point={lat:position.coords.latitude,lng:position.coords.longitude};map.jumpTo({center:point,zoom:16});place(point);
  },()=>{if(request===locationRequest && status.isConnected)status.textContent='Location access is unavailable. Select the installation location on the map.';},{enableHighAccuracy:true,timeout:10000,maximumAge:0});
 }
 document.querySelector('#locate').onclick=locate;
 if(!geoRequested){geoRequested=true;locate();}
 map.on('error',()=>{status.textContent='Some map data could not load. Check your connection or switch map view.';});
}

function bindDepth() {
 const input=document.querySelector('#depth'), error=document.querySelector('#depth-error');
 input.oninput=()=>{const previous=state.depth;state.depth=input.value!=='' && Number.isFinite(input.valueAsNumber)?input.valueAsNumber*units[state.depthUnit]:null;if(previous!==state.depth){state.done[1]=false;invalidate();if(conflict())state.done[2]=false;}error.textContent='';};
 document.querySelector('#depth-unit').onchange=event=>{state.depthUnit=event.target.value;input.value=display(state.depth,state.depthUnit);};
 document.querySelector('#confirm-depth').onclick=()=>{if(state.depth===null || state.depth<0){error.textContent='Enter a water depth of zero or greater.';input.focus();return;}if(conflict()){state.done[2]=false;state.done[1]=true;state.active=2;render();focusStep();return;}finish(1);};
}
function bindGeometry() {
 const details=document.querySelector('.more-shapes');details.ontoggle=()=>{state.moreShapes=details.open;};
 const orientation=document.querySelector('#ellipse-orientation');if(orientation)orientation.onchange=()=>{state.ellipseOrientation=orientation.value;state.done[2]=false;invalidate();render();};
 const updateDiagram=()=>{document.querySelector('.illustration').innerHTML=geometryDiagram();document.querySelector('#geometry-error').textContent=conflict()?'Water depth exceeds the internal height. Correct the dimensions or edit water depth.':'';};
 document.querySelectorAll('[data-shape]').forEach(button=>button.onclick=()=>{if(state.shape!==button.dataset.shape){state.shape=button.dataset.shape;state.done[2]=false;invalidate();render();}});
 ['width','height'].forEach(key=>{const input=document.querySelector(`#${key}`);if(input)input.oninput=()=>{state[key]=input.value!==''&&Number.isFinite(input.valueAsNumber)?input.valueAsNumber*units[state.geometryUnit]:null;state.done[2]=false;invalidate();updateDiagram();};});
 document.querySelector('#geometry-unit').onchange=event=>{state.geometryUnit=event.target.value;render();};
 const description=document.querySelector('#description');if(description)description.oninput=()=>{state.description=description.value;};
 document.querySelector('#confirm-geometry').onclick=()=>{const error=document.querySelector('#geometry-error');if(!(state.width>0)||!(height()>0)){error.textContent='Enter positive internal dimensions.';return;}if(conflict()){error.textContent='Water depth exceeds the internal height. Correct the dimensions or edit water depth.';return;}finish(2);};
}
if(document.modelContext?.registerTool) {
 try { Promise.resolve(document.modelContext.registerTool({name:'read_deployment_progress',description:'Read the current checklist completion status without changing the installation.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({steps:titles.map((title,i)=>({title,complete:state.done[i]})),complete:state.complete})})).catch(()=>{}); } catch {}
}

function updateProgress() {
 const bar=document.querySelector('.water-progress');if(!bar)return;
 const count=state.done.filter(Boolean).length,percent=Math.round(count/7*100);
 bar.setAttribute('aria-valuenow',count);bar.setAttribute('aria-valuetext',`${count} of 7 steps complete`);bar.classList.toggle('is-complete',count===7);
 bar.querySelector('h1').textContent=count===7?'Deployment complete':'Deployment';
 bar.querySelector('.water-progress-label span').innerHTML=`${count} of 7 complete <strong>${percent}%</strong>`;
 bar.querySelector('.water-fill').style.width=percent+'%';previousProgress=percent;
 document.querySelectorAll('.step').forEach((step,i)=>{if(!state.done[i]){step.classList.remove('done');step.querySelector('.step-number').textContent=String(i+1).padStart(2,'0');}});
}
