const topButton=document.querySelector('.back-to-top');
let ticking=false;
function updateScrollUI(){topButton?.classList.toggle('visible',window.scrollY>500);ticking=false}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScrollUI);ticking=true}},{passive:true});updateScrollUI();
topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
const revealTargets=[...document.querySelectorAll('.intro-grid,.section-heading,.service-card,.statement-grid,.news-feature,.news-side article,.notice-row,.docs-layout,.archive-cta,.transparency-grid,.help-grid,.metrics-grid>div')];
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  revealTargets.forEach((element,index)=>{element.classList.add('reveal');if(element.classList.contains('service-card'))element.classList.add('delay-'+(index%4))});
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  revealTargets.forEach(element=>observer.observe(element));
}
const navLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
if('IntersectionObserver' in window&&navLinks.length){const sections=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);const sectionObserver=new IntersectionObserver(entries=>{entries.filter(entry=>entry.isIntersecting).forEach(entry=>{navLinks.forEach(link=>link.removeAttribute('aria-current'));const active=navLinks.find(link=>link.getAttribute('href')==='#'+entry.target.id);active?.setAttribute('aria-current','location')})},{rootMargin:'-100px 0px -68% 0px'});sections.forEach(section=>sectionObserver.observe(section))}

