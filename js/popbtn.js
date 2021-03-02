var wide = document.querySelector('.pop-btn');
var mylist = document.querySelector("#mylist");
// var Body_1 = document.querySelector('body');

wide.addEventListener("mouseover",mouseOver);
wide.addEventListener("mouseout",mouseOut);
// Body_1.addEventListener("click",onClick);


function mouseOver(){
    mylist.style.display = "block";
}
function mouseOut(){
    mylist.style.display = "none";
} 
// function onClick(){
//     mylist.style.display = "none";
// }

// document.addEventListener("scroll",function(){
//    var currentScroll = document.documentElement.scrollTop;
//    console.log("current scroll: "+ currentScroll);
//    if(currentScroll == true){
//        mylist.style.display = "none";
//    }
  
// })
