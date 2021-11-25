const navbar = document.querySelector(".nav-bar");
let wheel = 0;


window.document.onmousewheel = (e)=>{

    wheel += e.deltaY * -0.01;
    wheel = Math.min(Math.max(wheel,-2.5),0);
    if(wheel == 0){
      
        navbar.style.transform = `translate(0px,0px)`;
    }else if(wheel == -2.5){
        navbar.style.transform = `translate(0px,-60px)`;
       
    }

}