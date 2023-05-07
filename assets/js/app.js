function link(target){
    if(location.pathname === '/en/' ){
        if(target.value === 'en') location.href = './';
        if(target.value === 'kr') location.href = '../';
    }

    if(location.pathname === '/'){
        if(target.value === 'en') location.href = './en';
        if(target.value === 'kr') location.href = './';
    }
}
function createLoading() {

    const html = `
        <div id="loading" class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    `

    return html;
}

function createLabel(data) {
    const html =
        `
    <div class="label-wrap">
        <label for="label-bar">${data.labelTitle}</label>
        <div class="${data.className}"  id="label-bar">
            <div style="width:${data.score}%" class="progressbar">
                ${(data.score == 0) ? '' : data.score + '%'}
            </div>
        </div>
    </div>
    `

    return html;
}

function getImageURL(data) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(data);

        reader.onload = (e) => {
            resolve(e.target.result);
        }

        reader.onerror = reject;
    })
}


async function getModel(url) {
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    return model;
}

async function predict(model, image) {
    // const maxPredictions = model.getTotalClasses();
    const prediction = await model.predict(image, false);
    return prediction;
}



window.onload = async () => {
    const URL = "https://teachablemachine.withgoogle.com/models/MbVPfeaJh/";
    const fileUploadBox = document.querySelector('.file-upload');
    const upload = document.querySelector('.file-upload-input');
    const image = document.createElement('img');

    
    const predictWrapper = document.createElement('div');
    predictWrapper.className = 'predict-wrapper';
    
    const imageWrap = document.createElement('div');
    imageWrap.className = 'image-wrap';
    
    const description = document.createElement('div');
    description.className = 'description';
    
    const predictionAge = document.createElement('p');
    predictionAge.className = 'prediction-age';
    
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';

    

    const reload = document.createElement('reload');
    reload.className = 'reload';
    reload.onclick = () => {
        location.reload();
    }
    // reload.onclick = location.reload();
    
    let labelBars = '';
    let totalData = [];

    const kr_data = './assets/json/kr_data.json';
    const en_data = '../assets/json/en_data.json';
    let data_url = '';

    if(location.pathname === '/'){
        data_url = kr_data;
    }
    if(location.pathname === '/en/'){
        data_url = en_data;
    }

    const dataFile = await fetch(data_url)
        .then((res) => res.json())
        .catch((err) => console.log(err));

    

    // console.log(dataFile);
    upload.onchange = async (input) => {
        fileUploadBox.innerHTML = `<div class="analyzing">
                                    <p>
                                    ${location.pathname === '/' 
                                    ?"분석 중.."
                                    : "Analyzing.."}
                                    </p>
                                    ${createLoading()}</div>`;

        if (input.target.files && input.target.files[0]) {
            const imageURL = await getImageURL(input.target.files[0]).then((res) => res);
            image.src = imageURL;
            const model = await getModel(URL);
            const maxPredictions = model.getTotalClasses();
            const prediction = await predict(model, image);

 
            // console.log(prediction);

       

            for (let i = 0; i < maxPredictions; i++) {
                const predictionData = prediction[i];
                const labelData = dataFile[i];
                totalData.push({
                    "className": predictionData.className,
                    "probability":predictionData.probability, 
                    "labelTitle": labelData.labelTitle,
                    "resultMessage": labelData.resultMessage,
                    "resultExplain": labelData.resultExplain,
                    "age": labelData.age
                   
                })
            }

            totalData.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));

          

            for (let i = 0; i < maxPredictions; i++) {
                const data = totalData[i];
                totalData[i].score = (data.probability.toFixed(2) * 100);
                labelBars += createLabel(data);
            }
            
        
            const resultAge = Math.round(totalData[0].score * totalData[0].age / 100);
            console.log(resultAge);
            imageWrap.append(image)
            description.innerHTML = `<p>${totalData[0].resultMessage}</p><p>${totalData[0].resultExplain}</p> `
            predictionAge.innerText = location.pathname === '/' ? `대략 ${resultAge} 세` : `${resultAge} years old`
            labelContainer.innerHTML = labelBars;
            reload.innerHTML = `<img src="${location.pathname === '/' ? "./" : "../" }assets/img/reload.svg" alt="aige reload">`;

            predictWrapper.append(imageWrap);
            predictWrapper.append(imageWrap); 
            predictWrapper.append(description);
            predictWrapper.append(predictionAge);
            predictWrapper.append(labelContainer);
            predictWrapper.append(reload);

            fileUploadBox.innerHTML = '';
            fileUploadBox.append(predictWrapper);

      
            



        }
    }
}