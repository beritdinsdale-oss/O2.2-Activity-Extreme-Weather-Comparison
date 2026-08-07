"use strict";
const screens=[...document.querySelectorAll(".screen")],steps=[...document.querySelectorAll(".progress-step")],previous=document.querySelector("#previous"),next=document.querySelector("#next"),position=document.querySelector("#position");let current=0;
const correct={regions:"b",seasons:"a",time:"a"};
const messages={regions:"Correct. The year and season stayed the same, while the region and type of extreme weather changed.",seasons:"Correct. The region and year stayed the same, while the season and type of extreme weather changed.",time:"Correct. Long-term records reveal changes in frequency or intensity that cannot be seen from one event."};
const names={0:"Start",1:"Regions: stories",2:"Regions: comparison",3:"Regions: question",4:"Seasons: stories",5:"Seasons: comparison",6:"Seasons: question",7:"Time: evidence",8:"Time: comparison",9:"Time: question",10:"Summary"};
function show(i){current=Math.max(0,Math.min(i,screens.length-1));screens.forEach((s,n)=>s.classList.toggle("active",n===current));steps.forEach(step=>{const t=Number(step.dataset.go);const group=(t===1&&current>=1&&current<=3)||(t===4&&current>=4&&current<=6)||(t===7&&current>=7&&current<=9);step.classList.toggle("active",t===current||group);step.classList.toggle("complete",t<current)});previous.disabled=current===0;next.disabled=current===screens.length-1;position.textContent=`${names[current]} · ${current+1} of ${screens.length}`;window.scrollTo({top:0,behavior:"smooth"})}
steps.forEach(s=>s.addEventListener("click",()=>show(Number(s.dataset.go))));document.querySelector(".begin").addEventListener("click",()=>show(1));previous.addEventListener("click",()=>show(current-1));next.addEventListener("click",()=>show(current+1));
document.querySelectorAll(".check-answer").forEach(btn=>btn.addEventListener("click",()=>{const f=btn.closest("fieldset"),id=f.dataset.question,sel=f.querySelector(`input[name="${id}"]:checked`),fb=f.querySelector(".feedback");if(!sel){fb.className="feedback incorrect";fb.textContent="Choose an answer before checking.";return}const ok=sel.value===correct[id];fb.className=`feedback ${ok?"correct":"incorrect"}`;fb.textContent=ok?messages[id]:"Not quite. Review the comparison on the previous page and try again."}));
document.querySelector(".restart").addEventListener("click",()=>{document.querySelectorAll('input[type="radio"]').forEach(i=>i.checked=false);document.querySelectorAll(".feedback").forEach(f=>{f.textContent="";f.className="feedback"});show(0)});
document.querySelectorAll(".mechanism-button").forEach(button=>{
  button.setAttribute("aria-expanded","false");
  button.addEventListener("click",()=>{
    const target=document.getElementById(button.dataset.detail);
    const expanded=button.getAttribute("aria-expanded")==="true";
    button.setAttribute("aria-expanded",String(!expanded));
    target.hidden=expanded;
  });
});


let selectedDragCard = null;

function setupDragCard(card){
  card.addEventListener("click",()=>{
    document.querySelectorAll(".drag-card.selected").forEach(c=>c.classList.remove("selected"));
    selectedDragCard = card;
    card.classList.add("selected");
  });
  card.addEventListener("dragstart",e=>{
    selectedDragCard = card;
    e.dataTransfer.setData("text/plain",card.dataset.card);
  });
}

document.querySelectorAll(".drag-card").forEach(setupDragCard);

function placeInZone(card, zone){
  if(!card || card.classList.contains("placed")) return;
  const label=document.createElement("span");
  label.className="placed-item";
  label.textContent=card.textContent.trim();
  label.dataset.card=card.dataset.card;
  if(card.dataset.answer) label.dataset.answer=card.dataset.answer;
  if(card.dataset.order) label.dataset.order=card.dataset.order;
  zone.querySelector(".drop-items").appendChild(label);
  card.classList.add("placed");
  card.classList.remove("selected");
  selectedDragCard=null;
}

document.querySelectorAll(".drop-zone,.sequence-zone").forEach(zone=>{
  zone.addEventListener("dragover",e=>e.preventDefault());
  zone.addEventListener("drop",e=>{
    e.preventDefault();
    const id=e.dataTransfer.getData("text/plain");
    const card=document.querySelector(`.drag-card[data-card="${id}"]`);
    placeInZone(card,zone);
  });
  zone.addEventListener("click",()=>{
    if(selectedDragCard) placeInZone(selectedDragCard,zone);
  });
});

document.querySelectorAll(".reset-sort").forEach(btn=>btn.addEventListener("click",()=>{
  const quiz=btn.closest(".sort-quiz");
  quiz.querySelectorAll(".placed-item").forEach(i=>i.remove());
  quiz.querySelectorAll(".drag-card").forEach(c=>{c.classList.remove("placed","selected")});
  quiz.querySelector(".sort-feedback").textContent="";
  quiz.querySelector(".sort-feedback").className="sort-feedback";
  selectedDragCard=null;
}));

document.querySelectorAll(".check-sort").forEach(btn=>btn.addEventListener("click",()=>{
  const quiz=btn.closest(".sort-quiz");
  const zones=[...quiz.querySelectorAll(".drop-zone")];
  const placed=quiz.querySelectorAll(".placed-item");
  const feedback=quiz.querySelector(".sort-feedback");
  if(placed.length<quiz.querySelectorAll(".drag-card").length){
    feedback.className="sort-feedback incorrect";
    feedback.textContent="Place all three statements before checking.";
    return;
  }
  let ok=true;
  zones.forEach(zone=>{
    zone.querySelectorAll(".placed-item").forEach(item=>{
      if(item.dataset.answer!==zone.dataset.zone) ok=false;
    });
  });
  feedback.className=`sort-feedback ${ok?"correct":"incorrect"}`;
  feedback.textContent=ok
    ?"You sorted the evidence correctly. Some aspects of winter weather are well understood, while future regional ice-storm frequency is still being studied."
    :"Not quite. Think about the difference between how freezing rain forms and predicting how often regional ice storms will occur in a changing climate.";
}));

document.querySelectorAll(".reset-sequence").forEach(btn=>btn.addEventListener("click",()=>{
  const quiz=btn.closest(".sequence-quiz");
  quiz.querySelectorAll(".placed-item").forEach(i=>i.remove());
  quiz.querySelectorAll(".drag-card").forEach(c=>{c.classList.remove("placed","selected")});
  quiz.querySelector(".sequence-feedback").textContent="";
  quiz.querySelector(".sequence-feedback").className="sequence-feedback";
  selectedDragCard=null;
}));

document.querySelectorAll(".check-sequence").forEach(btn=>btn.addEventListener("click",()=>{
  const quiz=btn.closest(".sequence-quiz");
  const zones=[...quiz.querySelectorAll(".sequence-zone")];
  const placed=quiz.querySelectorAll(".placed-item");
  const feedback=quiz.querySelector(".sequence-feedback");
  if(placed.length<quiz.querySelectorAll(".drag-card").length){
    feedback.className="sequence-feedback incorrect";
    feedback.textContent="Place all three cards before checking.";
    return;
  }
  let ok=true;
  zones.forEach(zone=>{
    const item=zone.querySelector(".placed-item");
    if(!item || item.dataset.order!==zone.dataset.position) ok=false;
  });
  feedback.className=`sequence-feedback ${ok?"correct":"incorrect"}`;
  feedback.textContent=ok
    ?"You built the climate connection correctly: warming shifts the baseline, which changes the odds of extreme heat."
    :"Not quite. Start with the long-term climate change, then think about how that changes the starting point for hot weather.";
}));

show(0);