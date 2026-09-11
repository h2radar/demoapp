function deploymentReport() {
 return {
  completed: new Date(state.completedAt).toLocaleString(),
  location: coords(),
  mapUrl: `https://www.openstreetmap.org/?mlat=${state.location.lat}&mlon=${state.location.lng}#map=18/${state.location.lat}/${state.location.lng}`,
  rows: [
   ['Installation location', coords()],
   ['Water depth', measure(state.depth,state.depthUnit)],
   ['Pipe geometry', summary(2)],
   ...(state.shape==='Other' && state.description.trim() ? [['Geometry description',state.description.trim()]] : []),
   ...placementStages.map((stage,j)=>[stage.title,summary(j+3)])
  ]
 };
}
function emailLink() {
 const report=deploymentReport();
 const body=['HydroRadar - Deployment complete',`Completed: ${report.completed}`,'',...report.rows.map(([label,value])=>`${label}: ${value}`),'',`View location: ${report.mapUrl}`].join('\n');
 return `mailto:?subject=${encodeURIComponent('HydroRadar deployment report')}&body=${encodeURIComponent(body)}`;
}
async function createDashboardPdf() {
 const root=document.createElement('div');
 root.className='pdf-dashboard';
 root.setAttribute('aria-hidden','true');root.inert=true;
 root.innerHTML=titles.map((title,i)=>`<article class="pdf-page"><header class="topbar"><img class="logo" src="assets/logo.jpg" alt="HydroRadar"></header><main class="workspace"><section class="water-progress is-complete"><div class="water-fill" style="width:100%"><div class="water-waves"></div></div><div class="water-progress-label"><h1>Deployment complete</h1><span>7 of 7 complete <strong>100%</strong></span></div></section><section class="step active done"><div class="step-header"><span class="step-number">✓</span><div class="step-heading"><h2>${title}</h2><p>${esc(summary(i))}</p></div></div><div class="step-body">${body(i)}</div></section><footer>Completed ${esc(new Date(state.completedAt).toLocaleString())} · ${i+1} / ${titles.length}</footer></main></article>`).join('');
 root.querySelectorAll('.actions,.location-tools,.map-views,.map-cross,#location-status,.error,.photo-button,.photo-controls,#photo-status').forEach(el=>el.remove());
 root.querySelector('#map').id='pdf-map';
 root.querySelectorAll('.more-shapes').forEach(el=>{el.open=true;});
 root.querySelectorAll('input,select,textarea').forEach(el=>{
  if(el.type==='checkbox') return;
  const value=document.createElement('div');value.className='pdf-value';
  value.textContent=el.tagName==='SELECT'?el.selectedOptions[0].textContent:el.value;
  el.replaceWith(value);
 });
 document.body.append(root);
 let exportMap;
 try {
  await Promise.all([...root.querySelectorAll('img')].map(img=>img.decode()));
  exportMap=new maplibregl.Map({container:'pdf-map',style:mapStyle(state.view),center:state.location,zoom:16,interactive:false,attributionControl:false,canvasContextAttributes:{preserveDrawingBuffer:true}});
  new maplibregl.Marker({color:'#0876db'}).setLngLat(state.location).addTo(exportMap);
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(new Error('Map loading timed out')),25000);
   exportMap.once('idle',()=>{clearTimeout(timeout);resolve();});
  });
  const mapImage=document.createElement('img');mapImage.src=exportMap.getCanvas().toDataURL('image/png');await mapImage.decode();
  const mapElement=root.querySelector('#pdf-map');
  // The canvas excludes the DOM marker; retain a centered pin in the exported map.
  exportMap.remove();exportMap=null;
  mapElement.replaceChildren(mapImage);
  const pin=document.createElement('span');pin.className='pdf-map-pin';pin.textContent='●';mapElement.append(pin);
  const attribution=document.createElement('p');attribution.className='pdf-attribution';
  attribution.textContent=state.view==='Satellite'?'Tiles © Esri — Esri, Maxar, Earthstar Geographics, and the GIS User Community':'OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors';
  mapElement.after(attribution);
  const pdf=new jspdf.jsPDF({unit:'mm',format:'letter'});
  pdf.setProperties({title:'HydroRadar expanded deployment dashboard',creator:'HydroRadar'});
  for(const [i,page] of [...root.querySelectorAll('.pdf-page')].entries()) {
   const canvas=await html2canvas(page,{scale:1.6,useCORS:true,backgroundColor:'#f4f7fa',logging:false,windowWidth:1000});
   if(i)pdf.addPage();
   const width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight();
   const scale=Math.min(width/canvas.width,height/canvas.height);
   pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(width-canvas.width*scale)/2,0,canvas.width*scale,canvas.height*scale);
  }
  return pdf;
 } finally {if(exportMap)exportMap.remove();root.remove();}
}
let reportPreviewUrl;
async function downloadPdf() {
 if(!state.complete)return;
 const button=document.querySelector('#download-pdf'),status=document.querySelector('#export-status');
 button.disabled=true;status.textContent='Preparing your expanded dashboard…';
 try {
  const pdf=await createDashboardPdf();pdf.save('HydroRadar-deployment.pdf');
  if(reportPreviewUrl)URL.revokeObjectURL(reportPreviewUrl);
  reportPreviewUrl=URL.createObjectURL(pdf.output('blob'));
  status.textContent='Your PDF is ready. ';
  const preview=document.createElement('a');preview.href=reportPreviewUrl;preview.target='_blank';preview.rel='noopener';preview.textContent='Open PDF';status.append(preview);
 } catch(error) {console.error(error);status.textContent='The PDF could not be created. Check your connection and try again.';}
 finally {button.disabled=false;}
}
