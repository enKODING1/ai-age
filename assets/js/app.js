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

    

    const reload = document.createElement('div');
    reload.className = 'reload';
    reload.onclick = () => {
        location.reload();
    }
    // reload.onclick = location.reload();
    
    let labelBars = '';
    let totalData = [];

    let data_url = '';

    
    if(location.pathname === '/en/' || location.pathname.includes('/en/')){
        data_url = '/assets/json/en_data.json';
    }
    else if(location.pathname === '/zh/' || location.pathname.includes('/zh/')){
        data_url = '/assets/json/zh_data.json';
        console.log("this is chinese");
    }
    else if(location.pathname === '/ja/' || location.pathname.includes('/ja/')){
        data_url = '/assets/json/ja_data.json';
    }
    else if(location.pathname === '/th/' || location.pathname.includes('/th/')){
        data_url = '/assets/json/th_data.json';
    }
    else if(location.pathname === '/vi/' || location.pathname.includes('/vi/')){
        data_url = '/assets/json/vi_data.json';
    }
    else if(location.pathname === '/hi/' || location.pathname.includes('/hi/')){
        data_url = '/assets/json/hi_data.json';
    }
    else {
        data_url = '/assets/json/kr_data.json'; // 기본값
    }
    const dataFile = await fetch(data_url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .catch((err) => {
            console.error('데이터 파일 로드 오류:', err);
            return [];
        });

    

    // console.log(dataFile);
    upload.onchange = async (input) => {
        try {
            // 변수 초기화
            labelBars = '';
            totalData = [];
            
            let analyzingText = "분석 중.."; // 기본값 (한국어)
            if(location.pathname.includes('/en/')) {
                analyzingText = "Analyzing..";
            } else if(location.pathname.includes('/zh/')) {
                analyzingText = "分析中..";
            } else if(location.pathname.includes('/ja/')) {
                analyzingText = "分析中..";
            } else if(location.pathname.includes('/th/')) {
                analyzingText = "กำลังวิเคราะห์..";
            } else if(location.pathname.includes('/vi/')) {
                analyzingText = "Đang phân tích..";
            } else if(location.pathname.includes('/hi/')) {
                analyzingText = "विश्लेषण कर रहे हैं..";
            }

            fileUploadBox.innerHTML = `<div class="analyzing">
                                        <p>${analyzingText}</p>
                                        ${createLoading()}</div>`;

            if (input.target.files && input.target.files[0]) {
                const imageURL = await getImageURL(input.target.files[0]).then((res) => res);
                image.src = imageURL;
                const model = await getModel(URL);
                const maxPredictions = model.getTotalClasses();
                const prediction = await predict(model, image);

     
                // console.log(prediction);

           

                // 데이터 파일이 제대로 로드되었는지 확인
                if (!dataFile || dataFile.length === 0) {
                    throw new Error('데이터 파일을 로드할 수 없습니다.');
                }
                for (let i = 0; i < maxPredictions; i++) {
                    const predictionData = prediction[i];
                    const labelData = dataFile[i];
                    
                    if (!labelData) {
                        console.warn(`인덱스 ${i}에 대한 레이블 데이터가 없습니다.`);
                        continue;
                    }
                    
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
                let ageText = `대략 ${resultAge} 세`; // 기본값 (한국어)
                if(location.pathname.includes('/en/')) {
                    ageText = `${resultAge} years old`;
                } else if(location.pathname.includes('/zh/')) {
                    ageText = `大约 ${resultAge} 岁`;
                } else if(location.pathname.includes('/ja/')) {
                    ageText = `約 ${resultAge} 歳`;
                } else if(location.pathname.includes('/th/')) {
                    ageText = `ประมาณ ${resultAge} ปี`;
                } else if(location.pathname.includes('/vi/')) {
                    ageText = `Khoảng ${resultAge} tuổi`;
                } else if(location.pathname.includes('/hi/')) {
                    ageText = `लगभग ${resultAge} साल`;
                }
                predictionAge.innerText = ageText
                labelContainer.innerHTML = labelBars;
                reload.innerHTML = `<img src="${location.pathname === '/' ? "./" : "../" }assets/img/reload.svg" alt="aige reload">`;

                predictWrapper.append(imageWrap);
                predictWrapper.append(description);
                predictWrapper.append(predictionAge);
                predictWrapper.append(labelContainer);
                predictWrapper.append(reload);

                fileUploadBox.innerHTML = '';
                fileUploadBox.append(predictWrapper);

          
                



            }
        } catch (error) {
            console.error('이미지 업로드 처리 중 오류:', error);
            
            let errorText = "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요."; // 기본값 (한국어)
            if(location.pathname.includes('/en/')) {
                errorText = "An error occurred while processing the image. Please try again.";
            } else if(location.pathname.includes('/zh/')) {
                errorText = "处理图片时发生错误。请重试。";
            } else if(location.pathname.includes('/ja/')) {
                errorText = "画像処理中にエラーが発生しました。もう一度お試しください。";
            } else if(location.pathname.includes('/th/')) {
                errorText = "เกิดข้อผิดพลาดในการประมวลผลภาพ กรุณาลองใหม่อีกครั้ง";
            } else if(location.pathname.includes('/vi/')) {
                errorText = "Đã xảy ra lỗi khi xử lý hình ảnh. Vui lòng thử lại.";
            } else if(location.pathname.includes('/hi/')) {
                errorText = "छवि प्रसंस्करण में त्रुटि हुई। कृपया पुनः प्रयास करें।";
            }

            fileUploadBox.innerHTML = `<div class="error-message">
                                        <p>${errorText}</p>
                                      </div>`;
        }
    }
}