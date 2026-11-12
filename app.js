const menuButton=document.querySelector('.menu-trigger'),nav=document.querySelector('.nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',open);menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');menuButton.querySelector('use').setAttribute('href',open?'#i-close':'#i-menu')});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú');menuButton.querySelector('use').setAttribute('href','#i-menu')}));
const tabs=[...document.querySelectorAll('.doc-tab')],panels=[...document.querySelectorAll('.doc-panel')];
function activateTab(tab){tabs.forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',active);item.tabIndex=active?0:-1});panels.forEach(panel=>{const active=panel.id==='panel-'+tab.dataset.tab;panel.hidden=!active;panel.classList.toggle('active',active)})}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateTab(tab));tab.addEventListener('keydown',e=>{let n=index;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(n+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(n-1+tabs.length)%tabs.length;else return;e.preventDefault();activateTab(tabs[n]);tabs[n].focus()})});
const overlay=document.getElementById('search-overlay'),input=document.getElementById('site-search'),results=document.getElementById('search-results');
let catalog=[];
fetch('./catalog.json?v=4',{cache:'no-store'}).then(r=>r.json()).then(items=>{catalog=items;const count=document.getElementById('document-count');if(count)count.textContent=items.length.toLocaleString('es-MX')}).catch(()=>{});
const pages=[
{title:'Servicios del Tribunal',group:'PORTAL',url:'#servicios'},
{title:'Noticias y avisos',group:'PORTAL',url:'#actualidad'},
{title:'Solicitar cita',group:'SERVICIOS',url:'https://tjan.gob.mx/citastja/registro.php'},
{title:'Organigrama',group:'EL TRIBUNAL',url:'./estructura.html#organigrama'},
{title:'Directorio de funcionarias y funcionarios',group:'EL TRIBUNAL',url:'./estructura.html#directorio'},
{title:'Salas e integrantes',group:'EL TRIBUNAL',url:'./estructura.html#salas'},
{title:'Acuerdos del Pleno',group:'DOCUMENTOS',url:'./documentos.html?categoria=Acuerdos'},
{title:'Marco normativo',group:'DOCUMENTOS',url:'./documentos.html?categoria=Normatividad'},
{title:'Informes',group:'DOCUMENTOS',url:'./documentos.html?categoria=Informes'},
{title:'Avisos',group:'DOCUMENTOS',url:'./documentos.html?categoria=Avisos'},
{title:'Transparencia',group:'PORTAL',url:'#transparencia'}];
const norm=s=>String(s).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function render(){const q=norm(input.value.trim());const matches=q?[...pages.filter(p=>norm(p.title+' '+p.group).includes(q)),...catalog.filter(d=>norm(d.title+' '+d.category+' '+d.year).includes(q)).slice(0,7).map(d=>({title:d.title,group:d.category+(d.year?' · '+d.year:''),url:'./documentos.html?ver='+d.id}))]:pages.slice(0,6);results.replaceChildren();if(!matches.length){const p=document.createElement('p');p.textContent='No hay resultados. Prueba otra palabra.';results.append(p);return}matches.slice(0,10).forEach(item=>{const a=document.createElement('a'),span=document.createElement('span');a.href=item.url;a.textContent=item.title;span.textContent=item.group;a.append(span);results.append(a)})}
function openSearch(){overlay.hidden=false;document.body.classList.add('no-scroll');render();requestAnimationFrame(()=>input.focus())}
function closeSearch(){overlay.hidden=true;document.body.classList.remove('no-scroll');input.value=''}
document.querySelectorAll('.search-trigger,#open-search-top').forEach(b=>b.addEventListener('click',openSearch));document.getElementById('close-search').addEventListener('click',closeSearch);document.querySelector('.search-backdrop').addEventListener('click',closeSearch);input.addEventListener('input',render);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeSearch();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden?openSearch():closeSearch()}});

const heroForm=document.getElementById('hero-search-form');heroForm?.addEventListener('submit',event=>{event.preventDefault();const query=document.getElementById('hero-query').value.trim();if(!query){document.getElementById('hero-query').focus();return}location.href='./documentos.html?buscar='+encodeURIComponent(query)});
