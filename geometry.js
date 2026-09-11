const pipeShapes = [
 {id:'Circular',label:'Circular',alias:'Round',primary:true},
 {id:'Rectangular',label:'Rectangular',alias:'Box / square',primary:true},
 {id:'Egg',label:'Egg-shaped',alias:'Ovoid',primary:true},
 {id:'Elliptical',label:'Elliptical',alias:'Oval'},
 {id:'Arch',label:'Arch',alias:'Arched crown'},
 {id:'Horseshoe',label:'Horseshoe',alias:'Rounded invert'},
 {id:'Other',label:'Other',alias:'Custom section'}
];
function shapeName() { return pipeShapes.find(shape=>shape.id===state.shape).label; }
function shapeOutline(shape, icon=false) {
 if(shape==='Circular')return '<circle cx="50" cy="50" r="44"/>';
 if(shape==='Rectangular')return '<rect x="6" y="15" width="88" height="70" rx="3"/>';
 if(shape==='Egg')return '<path d="M50 94C34 94 6 51 6 35C6-4 94-4 94 35C94 51 66 94 50 94Z"/>';
 if(shape==='Elliptical')return state.ellipseOrientation==='Vertical'?'<ellipse cx="50" cy="50" rx="32" ry="44"/>':'<ellipse cx="50" cy="50" rx="44" ry="32"/>';
 if(shape==='Arch')return '<path d="M6 90V53C6-10 94-10 94 53V90Z"/>';
 if(shape==='Horseshoe')return '<path d="M18 89C-8 57 8 6 50 6S108 57 82 89Q50 101 18 89Z"/>';
 return '<path d="M9 81L15 32Q19 13 42 10L78 18Q96 26 91 48L83 87L44 94Z"/>';
}
function shapeCard(shape) {
 return `<button class="shape-card pipe-shape ${state.shape===shape.id?'selected':''}" data-shape="${shape.id}" aria-pressed="${state.shape===shape.id}"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">${shapeOutline(shape.id,true)}</g></svg><span>${shape.label}<small>${shape.alias}</small></span><span class="shape-selected" aria-hidden="true">${state.shape===shape.id?'✓':''}</span></button>`;
}
function geometryBody() {
 const extraSelected=!pipeShapes.find(shape=>shape.id===state.shape).primary;
 return `<p>Select the pipe’s internal cross-section.</p><div class="shape-grid primary-shapes" role="group" aria-label="Common pipe shapes">${pipeShapes.filter(shape=>shape.primary).map(shapeCard).join('')}</div><details class="more-shapes" ${state.moreShapes||extraSelected?'open':''}><summary>More shapes<span>Oval, arch, horseshoe & custom</span></summary><div class="shape-grid extra-shapes" role="group" aria-label="More pipe shapes">${pipeShapes.filter(shape=>!shape.primary).map(shapeCard).join('')}</div></details><div class="split"><div class="illustration">${geometryDiagram()}</div><div class="fields">${state.shape==='Elliptical'?`<label>Ellipse orientation<select id="ellipse-orientation"><option ${state.ellipseOrientation==='Horizontal'?'selected':''}>Horizontal</option><option ${state.ellipseOrientation==='Vertical'?'selected':''}>Vertical</option></select></label>`:''}<label>Measurement unit<select id="geometry-unit">${options(state.geometryUnit)}</select></label><label>${state.shape==='Circular'?'Internal diameter':'Maximum internal width'}<input id="width" type="number" min="0" step="any" inputmode="decimal" value="${display(state.width,state.geometryUnit)}"></label>${state.shape!=='Circular'?`<label>Internal height<input id="height" type="number" min="0" step="any" inputmode="decimal" value="${display(state.height,state.geometryUnit)}"></label>`:''}${state.shape==='Other'?`<label>Description (optional)<textarea id="description" rows="2" maxlength="300">${esc(state.description)}</textarea></label>`:''}<p id="geometry-error" class="error" role="status">${conflict()?'Water depth exceeds the internal height. Correct the dimensions or edit water depth.':''}</p></div></div><div class="actions"><button id="confirm-geometry" class="primary">Confirm geometry →</button></div>`;
}
function geometryDiagram() {
 const outline=shapeOutline(state.shape),level=Math.max(0,Math.min(1,(state.depth||0)/(height()||1)));
 const bottom=state.shape==='Rectangular'?85:state.shape==='Elliptical'&&state.ellipseOrientation==='Horizontal'?82:94;
 const span=state.shape==='Rectangular'?70:state.shape==='Elliptical'&&state.ellipseOrientation==='Horizontal'?64:88;
 return `<svg viewBox="0 0 400 280" role="img" aria-label="${shapeName()} cross-section with water and internal dimensions"><defs><clipPath id="pipe-section">${outline}</clipPath></defs><g transform="translate(105 22) scale(1.9)"><g fill="white" stroke="#91a8ba" stroke-width="3">${outline}</g><g clip-path="url(#pipe-section)"><g transform="translate(0 ${bottom-level*span})"><path class="pipe-water" d="M-100 0Q-75-4-50 0T0 0T50 0T100 0T150 0T200 0V120H-100Z" fill="#9cd5f2"/><path class="pipe-water pipe-water-back" d="M-100 3Q-75 7-50 3T0 3T50 3T100 3T150 3T200 3V120H-100Z" fill="#51b5e6" opacity=".35"/></g></g></g><text x="200" y="230" text-anchor="middle" fill="#0876db" font-size="14">${state.shape==='Circular'?'Diameter':'Width'}: ${display(state.width,state.geometryUnit)||'—'} ${state.geometryUnit}${state.shape!=='Circular'?` · Height: ${display(state.height,state.geometryUnit)||'—'} ${state.geometryUnit}`:''}</text><text x="200" y="256" text-anchor="middle" font-size="13" fill="#687f90">${shapeName()}${state.shape==='Elliptical'?' · '+state.ellipseOrientation.toLowerCase():''} cross-section</text></svg>`;
}
