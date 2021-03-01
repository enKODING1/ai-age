
const URL = "https://teachablemachine.withgoogle.com/models/MbVPfeaJh/";
let model, webcam, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("maxPredictions: "+maxPredictions + "개"); //6개 값이 나옴
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
      var element =  labelContainer.appendChild(document.createElement("div"));
      element.className = "label-wrap";
    }
}

async function predict() {
    var image = document.getElementById("face-image");
    const prediction = await model.predict(image, false);
    prediction.sort((a,b)=>parseFloat(b.probability) - parseFloat(a.probability));
    console.log(prediction);
    var resultmessage, resultExplain;
    switch(prediction[0].className){
        case "baby":
            resultmessage = "귀여운 애기"
            resultExplain = "혹시 애기가 아니라면 그만큼 귀여우신가 봐요٩(ˊωˋ*)و✧"
            break;
        case "one":
            resultmessage = "꿈을 실현하는 것이 목표인 10대!!"
            resultExplain = "꿈을 기록하는 것이 목표가아닌 꿈을 실현하는 것이 나의 목표인 10대~!"
            break;
        case "two":
            resultmessage = "앞날이 밝고 무궁무진한 일들을 해낼 20대!"
            resultExplain = "상상할 수 없는 꿈을 꾸고 있다면 상상할 수 없는 노력을 하면 이뤄낼 수 있는 나이!"
            break;
        case "three":
            resultmessage = "최고의 경쟁력을 지닌 30대!"
            resultExplain = "최고의 경쟁력은 공부일수도 있지만 가장 중요한 열정을 가진 당신 ~!"
            break;
        case "four":
            resultmessage = "시간의 능력자 40대 ~!"
            resultExplain = "우리가 진정으로 소유하는 것은 시간 뿐이고 가진 것이 달리 아무 것도 없는 이에게도 시간은 있어요 당신은 시간을 가지고 놀 수 있는 사람입니다~!"
            break;
        case "five":
            resultmessage = "시작이 반 인 50대 ~~!"
            resultExplain = "애벌레가 세상이 끝났다고 생각하는 순간 나비로 변하는 순간~~!"
            break;
        default:
            resultmessage = "잘 모르겠습니다"
            resultExplain = "test7"
    }
    var title = "<div class='" + prediction[0].className + "-age-title'>"+ resultmessage + "</div>";
    var explain = "<div class='age-explain'>"+ resultExplain + "</div>";
    $('.result-message').html(title + explain);

    var barWidth;
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > 0.1) {
            barWidth = Math.round(prediction[i].probability.toFixed(2) * 100) + "%";
        } else if (prediction[i].probability.toFixed(2) >= 0.01) {
            barWidth = "4%"
        } else {
            barWidth = "2%"
        }
        var labelTitle;
        switch (prediction[i].className) {
            case "baby":
                labelTitle = "애기"
                break;
            case "one":
                labelTitle = "10대"
                break;
            case "two":
                labelTitle = "20대"
                break;
            case "three":
                labelTitle = "30대"
                break;
            case "four":
                labelTitle = "40대"
                break;
            case "five":
                labelTitle = "50대"
                break;
            default:
                labelTitle = "알수없음"
        }
      var label = "<div class='label-name' style='text-align:left;'>"+labelTitle+"</div>";
      var bar = "<div class='label-bar' style='height:30px'><div class='"+ prediction[i].className + "-label' style='height:30px; border-radius:5px; width:"+Math.round(prediction[i].probability.toFixed(2) * 100)+"%'; text-align:center;><span style='color:black;  position:relative; top:5px;'>"+Math.round(prediction[i].probability.toFixed(2) * 100)+"% </span></div></div>";
      labelContainer.childNodes[i].innerHTML = label + bar;
    }
}










// // <!--teachablemacine-->

// // <!-- <div id="webcam-container"></div> -->
// // <!-- 
// {/* <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js" defer></script>
// <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"
//   defer></script> */}

// // More API functions here:
// // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// // the link to your model provided by Teachable Machine export panel
// const URL = "https://teachablemachine.withgoogle.com/models/MbVPfeaJh/";

// let model, webcam, labelContainer, maxPredictions;

// // Load the image model and setup the webcam
// async function init() {
//     const modelURL = URL + "model.json";
//     const metadataURL = URL + "metadata.json";

//     // load the model and metadata
//     // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
//     // or files from your local hard drive
//     // Note: the pose library adds "tmImage" object to your window (window.tmImage)
//     model = await tmImage.load(modelURL, metadataURL);
//     maxPredictions = model.getTotalClasses();

//     /* 웹캠부분// Convenience function to setup a webcam
//      const flip = true; // whether to flip the webcam
//      webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
//      await webcam.setup(); // request access to the webcam
//      await webcam.play();
//      window.requestAnimationFrame(loop);
//      */
//     // append elements to the DOM
//     //document.getElementById("webcam-container").appendChild(webcam.canvas);
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }
// /* 웹캠부분
//     async function loop() {
//     webcam.update(); // update the webcam frame
//     await predict();
//     window.requestAnimationFrame(loop);
// }*/

// // run the webcam image through the image model
// async function predict() {
//     // predict can take in an image, video or canvas html element
//     var image = document.getElementById("face-image");
//     const prediction = await model.predict(image, false);
//     for (let i = 0; i < maxPredictions; i++) {
//         const classPrediction =
//             prediction[i].className + ": " + prediction[i].probability.toFixed(2);
//         labelContainer.childNodes[i].innerHTML = classPrediction;
//     }
// }





















