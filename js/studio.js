window.addEventListener("scroll",()=>{
document.getElementById("nav")
.classList.toggle("scrolled",window.scrollY > 0);
});

document.querySelectorAll("[data-scroll]").forEach((button)=>{
button.addEventListener("click",()=>{
const target=document.querySelector(button.dataset.scroll);
if(target){
target.scrollIntoView({behavior:"smooth"});
}
});
});

const filterButtons=document.querySelectorAll("[data-filter]");
const galleryCards=document.querySelectorAll(".grid .card");

filterButtons.forEach((button)=>{
button.addEventListener("click",()=>{
filterButtons.forEach((item)=>item.classList.remove("active"));
button.classList.add("active");

const filter=button.dataset.filter;
galleryCards.forEach((card)=>{
const shouldShow=filter==="all" || card.dataset.category===filter;
card.style.display=shouldShow ? "block" : "none";
});

document.querySelector("#portafolio").scrollIntoView({behavior:"smooth"});
});
});
