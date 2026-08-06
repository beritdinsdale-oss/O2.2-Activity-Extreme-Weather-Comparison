"use strict";

const screens=[...document.querySelectorAll(".screen")];
const steps=[...document.querySelectorAll(".progress-step")];
const previous=document.querySelector("#previous");
const next=document.querySelector("#next");
const position=document.querySelector("#position");
let current=0;

const correct={regions:"b",seasons:"a",time:"a"};
const messages={
  regions:"Correct. The comparison holds the year and season constant and shows regional variation in extreme weather.",
  seasons:"Correct. The comparison holds the year and region constant and shows seasonal variation in extreme weather.",
  time:"Correct. Long-term records reveal changes in frequency or intensity that cannot be identified from one event."
};

function show(index){
  current=Math.max(0,Math.min(index,screens.length-1));
  screens.forEach((screen,i)=>screen.classList.toggle("active",i===current));
  steps.forEach((step,i)=>{
    step.classList.toggle("active",i===current);
    step.classList.toggle("complete",i<current);
  });
  previous.disabled=current===0;
  next.disabled=current===screens.length-1;
  position.textContent=`${steps[current].textContent}: ${current+1} of ${screens.length}`;
  window.scrollTo({top:0,behavior:"smooth"});
}

steps.forEach((step,i)=>step.addEventListener("click",()=>show(i)));
document.querySelector(".begin").addEventListener("click",()=>show(1));
previous.addEventListener("click",()=>show(current-1));
next.addEventListener("click",()=>show(current+1));

document.querySelectorAll(".check-answer").forEach(button=>{
  button.addEventListener("click",()=>{
    const fieldset=button.closest("fieldset");
    const id=fieldset.dataset.question;
    const selected=fieldset.querySelector(`input[name="${id}"]:checked`);
    const feedback=fieldset.querySelector(".feedback");
    if(!selected){
      feedback.className="feedback incorrect";
      feedback.textContent="Choose an answer before checking.";
      return;
    }
    const isCorrect=selected.value===correct[id];
    feedback.className=`feedback ${isCorrect?"correct":"incorrect"}`;
    feedback.textContent=isCorrect
      ? messages[id]
      : "Not quite. Review what stayed the same and what changed, then try again.";
  });
});

document.querySelector(".restart").addEventListener("click",()=>{
  document.querySelectorAll('input[type="radio"]').forEach(input=>input.checked=false);
  document.querySelectorAll(".feedback").forEach(feedback=>{
    feedback.textContent="";
    feedback.className="feedback";
  });
  show(0);
});

show(0);
