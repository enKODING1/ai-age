var wide = document.querySelector('.pop-btn');
var mylist = document.querySelector("#mylist");


wide.addEventListener("mouseover",mouseOver);
wide.addEventListener("mouseout",mouseOut);



function mouseOver(){
    mylist.style.display = "block";
}
function mouseOut(){
   mylist.style.display = "none";
}

