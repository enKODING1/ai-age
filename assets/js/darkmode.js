const moonPath =  "M31.5 50C31.5 77.6142 50 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C50 0 31.5 22.3858 31.5 50Z";
const sunPath  =  "M100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50Z";

const mode = document.querySelector('#darkMode');
const fileUpload = document.querySelector('.file-upload'); //#444444
const imageUploadWrap = document.querySelector('.image-upload-wrap');

let toggle = true;

function getPercentValue(x, percent){
    return x * (percent / 100);
}

mode.addEventListener('click',function(){
    // console.log(toggle)
    let duration = 400    
    const timeline = anime.timeline({
        duration: duration,
        // easing: "easeOutExpo"
        easing:"easeInOutCirc"

    });

    timeline
    .add({
        targets: '.sun',
        d: [
            {value: toggle? moonPath : sunPath}
        ],
        fill: toggle?'#fff' : 'rgb(255, 180, 112)'
    })
    .add({
        targets:"#darkMode",
        rotate:toggle ? 220 : 0
    },`-=${duration - getPercentValue(duration, 5)}`)
    .add({
        targets:"body",
        backgroundColor: toggle ? "rgba(22,22,22)" : "rgb(247, 248, 251)"
    },`-=${duration}`)
    .add({
        targets:".file-upload",
        backgroundColor: toggle ? "#444444" : "#ffffff"
    },`-=${duration}`)
    .add({
        targets: ".image-upload-wrap",
        backgroundColor: toggle ? "#363636" : "#ffffff"
    },`-=${duration}`)


    
    if(!toggle){
        toggle = true;
    }else {
        toggle = false;
    }
})

