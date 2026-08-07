"use strict";

const screens=[...document.querySelectorAll(".screen")];
const steps=[...document.querySelectorAll(".progress-step")];
const previous=document.querySelector("#previous");
const next=document.querySelector("#next");
const position=document.querySelector("#position");
let current=0;

const names={
  0:"Welcome",
  1:"Regions: events",2:"Regions: climate",3:"Regions: activity",4:"Regions: question",
  5:"Seasons: events",6:"Seasons: climate",7:"Seasons: activity",8:"Seasons: question",
  9:"Over time: trends",10:"Over time: question",11:"Wrap-up"
};

const correct={regions:"b",seasons:"a",time:"a"};
const answerMessages={
  regions:"Yes. Extreme weather can differ across regions, and long-term patterns in those extremes are part of climate.",
  seasons:"Yes. A region can experience different seasonal extremes, and climate change does not affect every hazard in the same way.",
  time:"Yes. Climate trends emerge from changes in frequency, intensity, duration, or timing measured over many years."
};

function activeGroup(target){
  return (
    (target===1 && current>=1 && current<=4) ||
    (target===5 && current>=5 && current<=8) ||
    (target===9 && current>=9 && current<=10)
  );
}

function show(index){
  current=Math.max(0,Math.min(index,screens.length-1));
  screens.forEach((screen,i)=>screen.classList.toggle("active",i===current));
  steps.forEach(step=>{
    const target=Number(step.dataset.go);
    step.classList.toggle("active",target===current || activeGroup(target));
    step.classList.toggle("complete",target<current && !activeGroup(target));
  });
  previous.disabled=current===0;
  next.disabled=current===screens.length-1;
  position.textContent=`${names[current]} · ${current+1} of ${screens.length}`;
  window.scrollTo({top:0,behavior:"smooth"});
}

steps.forEach(step=>step.addEventListener("click",()=>show(Number(step.dataset.go))));
document.querySelector(".begin").addEventListener("click",()=>show(1));
previous.addEventListener("click",()=>show(current-1));
next.addEventListener("click",()=>show(current+1));

document.querySelectorAll(".reveal-step").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const text=btn.nextElementSibling;
    const expanded=btn.getAttribute("aria-expanded")==="true";
    btn.setAttribute("aria-expanded",String(!expanded));
    text.hidden=expanded;
  });
});

document.querySelectorAll(".check-answer").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const fieldset=btn.closest("fieldset");
    const id=fieldset.dataset.question;
    const selected=fieldset.querySelector(`input[name="${id}"]:checked`);
    const feedback=fieldset.querySelector(".feedback");
    if(!selected){
      feedback.className="feedback incorrect";
      feedback.textContent="Choose an answer before checking.";
      return;
    }
    const ok=selected.value===correct[id];
    feedback.className=`feedback ${ok?"correct":"incorrect"}`;
    feedback.textContent=ok?answerMessages[id]:"Not quite. Review the previous page and think about the pattern rather than a single event.";
  });
});

/* Accessible drag/drop: drag with mouse, OR click a card then click a destination. */
let selectedCard=null;

function selectCard(card){
  document.querySelectorAll(".drag-card.selected").forEach(c=>c.classList.remove("selected"));
  selectedCard=card;
  card.classList.add("selected");
}

document.querySelectorAll(".drag-card").forEach(card=>{
  card.addEventListener("click",()=>selectCard(card));
  card.addEventListener("dragstart",e=>{
    selectCard(card);
    e.dataTransfer.setData("text/plain",card.dataset.id);
  });
});

function cardHome(card){
  return card.closest(".card-bank");
}

function makePlaced(card){
  const item=document.createElement("span");
  item.className="placed-item";
  item.textContent=card.textContent.trim();
  item.dataset.id=card.dataset.id;
  if(card.dataset.order) item.dataset.order=card.dataset.order;
  if(card.dataset.answer) item.dataset.answer=card.dataset.answer;
  return item;
}

function placeCard(card,slot){
  if(!card || card.classList.contains("placed")) return;
  const placeholder=slot.querySelector(":scope > span:not(.placed-item)");
  if(placeholder) placeholder.style.display="none";
  slot.appendChild(makePlaced(card));
  card.classList.add("placed");
  card.classList.remove("selected");
  selectedCard=null;
}

function handleDropTarget(slot){
  slot.addEventListener("dragover",e=>e.preventDefault());
  slot.addEventListener("drop",e=>{
    e.preventDefault();
    const id=e.dataTransfer.getData("text/plain");
    const card=document.querySelector(`.drag-card[data-id="${id}"]`);
    placeCard(card,slot);
  });
  slot.addEventListener("click",()=>{
    if(selectedCard) placeCard(selectedCard,slot);
  });
}

document.querySelectorAll(".drop-slot,.sort-slot").forEach(handleDropTarget);

function resetChallenge(challenge){
  challenge.querySelectorAll(".placed-item").forEach(item=>item.remove());
  challenge.querySelectorAll(".drop-slot>span,.sort-slot>span").forEach(s=>s.style.display="block");
  challenge.querySelectorAll(".drag-card").forEach(card=>card.classList.remove("placed","selected"));
  const feedback=challenge.querySelector(".challenge-feedback");
  feedback.textContent="";
  feedback.className="challenge-feedback";
  selectedCard=null;
}

document.querySelectorAll(".reset-challenge").forEach(btn=>{
  btn.addEventListener("click",()=>resetChallenge(btn.closest(".sequence-challenge,.sort-challenge")));
});

function checkSequence(challenge){
  const slots=[...challenge.querySelectorAll(".drop-slot")];
  const cards=challenge.querySelectorAll(".drag-card");
  if(challenge.querySelectorAll(".placed-item").length<cards.length) return null;
  return slots.every(slot=>{
    const item=slot.querySelector(".placed-item");
    return item && item.dataset.order===slot.dataset.position;
  });
}

function checkSort(challenge){
  const slots=[...challenge.querySelectorAll(".sort-slot")];
  const cards=challenge.querySelectorAll(".drag-card");
  if(challenge.querySelectorAll(".placed-item").length<cards.length) return null;
  return slots.every(slot=>
    [...slot.querySelectorAll(".placed-item")].every(item=>item.dataset.answer===slot.dataset.zone)
  );
}

document.querySelectorAll(".check-challenge").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const challenge=btn.closest(".sequence-challenge,.sort-challenge");
    const feedback=challenge.querySelector(".challenge-feedback");
    const result=challenge.classList.contains("sort-challenge")?checkSort(challenge):checkSequence(challenge);
    if(result===null){
      feedback.className="challenge-feedback incorrect";
      feedback.textContent="Place all of the cards before checking.";
      return;
    }
    feedback.className=`challenge-feedback ${result?"correct":"incorrect"}`;
    if(result){
      feedback.textContent=challenge.classList.contains("sort-challenge")
        ?"Nice work. You separated what scientists understand well from the question that is still being studied."
        :"Nice work. You built the climate connection in the correct order.";
    }else{
      feedback.textContent=challenge.classList.contains("sort-challenge")
        ?"Not quite. Think about the difference between understanding how freezing rain forms and predicting how often regional ice storms will occur."
        :"Not quite. Start with the long-term climate change, then follow what it changes next.";
    }
  });
});

document.querySelector(".restart").addEventListener("click",()=>{
  document.querySelectorAll('input[type="radio"]').forEach(i=>i.checked=false);
  document.querySelectorAll(".feedback").forEach(f=>{f.textContent="";f.className="feedback"});
  document.querySelectorAll(".sequence-challenge,.sort-challenge").forEach(resetChallenge);
  document.querySelectorAll(".reveal-step").forEach(btn=>{
    btn.setAttribute("aria-expanded","false");
    btn.nextElementSibling.hidden=true;
  });
  show(0);
});

show(0);
