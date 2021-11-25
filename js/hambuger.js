const btn = document.querySelector(".hambuger");
const bg_item = document.querySelectorAll(".buger_item");
const navbar = document.querySelector('.mnav-bar');

let count = false;

btn.onclick = ()=>{
   hambuger();
   if(count === true){
    navbar.style.transform = `translate(0px,0px)`;
   }else if(count === false){
    navbar.style.transform = `translate(0px,-300px)`;
   }
}

function hambuger(){
    if(count == false){
        bg_item[0].style.transform = `translateY(12px)`;
        bg_item[2].style.transform = `translateY(-11px)`;
        bg_item[1].style.transform = `rotateZ(90deg)`;
        btn.style.transform = `rotateZ(45deg)`;
        count = true;
       }else if(count === true){
        bg_item[0].style.transform = `translateY(0px)`;
        bg_item[2].style.transform = `translateY(0px)`;
        bg_item[1].style.transform = `rotateZ(0deg)`;
        btn.style.transform = `rotateZ(0deg)`;
        count = false;
       }
}