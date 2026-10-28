// 언어별 UI 문구 (키는 <html lang> 값)
const UI_TEXT = {
    ko: { analyzing: '분석 중..', age: (n) => `대략 ${n} 세`, error: '이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.' },
    en: { analyzing: 'Analyzing..', age: (n) => `${n} years old`, error: 'An error occurred while processing the image. Please try again.' },
    zh: { analyzing: '分析中..', age: (n) => `大约 ${n} 岁`, error: '处理图片时发生错误。请重试。' },
    ja: { analyzing: '分析中..', age: (n) => `約 ${n} 歳`, error: '画像処理中にエラーが発生しました。もう一度お試しください。' },
    th: { analyzing: 'กำลังวิเคราะห์..', age: (n) => `ประมาณ ${n} ปี`, error: 'เกิดข้อผิดพลาดในการประมวลผลภาพ กรุณาลองใหม่อีกครั้ง' },
    vi: { analyzing: 'Đang phân tích..', age: (n) => `Khoảng ${n} tuổi`, error: 'Đã xảy ra lỗi khi xử lý hình ảnh. Vui lòng thử lại.' },
    hi: { analyzing: 'विश्लेषण कर रहे हैं..', age: (n) => `लगभग ${n} साल`, error: 'छवि प्रसंस्करण में त्रुटि हुई। कृपया पुनः प्रयास करें।' }
};

// 결과 문구 데이터 파일 (한국어만 파일명이 kr)
const DATA_FILE = {
    ko: 'kr', en: 'en', zh: 'zh', ja: 'ja', th: 'th', vi: 'vi', hi: 'hi'
};

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

// 이미지 디코딩이 끝난 뒤에 예측해야 빈 이미지로 추론하지 않는다
function loadImage(image, src) {
    return new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = src;
    })
}

async function getModel(url) {
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";
    return tmImage.load(modelURL, metadataURL);
}

async function predict(model, image) {
    const prediction = await model.predict(image, false);
    return prediction;
}



window.onload = async () => {
    const URL = "https://teachablemachine.withgoogle.com/models/MbVPfeaJh/";
    const lang = UI_TEXT[document.documentElement.lang] ? document.documentElement.lang : 'ko';
    const text = UI_TEXT[lang];
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
    reload.innerHTML = `<img src="/assets/img/reload.svg" alt="aige reload">`;
    reload.onclick = () => {
        location.reload();
    }

    const dataFile = await fetch(`/assets/json/${DATA_FILE[lang]}_data.json`)
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

    // 모델 클래스명(baby, one, two...)으로 결과 문구를 찾는다
    const labels = {};
    dataFile.forEach((label) => {
        labels[label.className] = label;
    });

    upload.onchange = async (input) => {
        if (!input.target.files || !input.target.files[0]) return;

        try {
            fileUploadBox.innerHTML = `<div class="analyzing">
                                        <p>${text.analyzing}</p>
                                        ${createLoading()}</div>`;

            const imageURL = await getImageURL(input.target.files[0]);
            await loadImage(image, imageURL);
            const model = await getModel(URL);
            const prediction = await predict(model, image);

            // 데이터 파일이 제대로 로드되었는지 확인
            if (dataFile.length === 0) {
                throw new Error('데이터 파일을 로드할 수 없습니다.');
            }

            const totalData = prediction
                .filter((p) => labels[p.className])
                .map((p) => ({
                    ...labels[p.className],
                    probability: p.probability,
                    score: Math.round(p.probability * 100)
                }));

            totalData.sort((a, b) => b.probability - a.probability);

            // 각 연령대 대표 나이를 확률로 가중평균한 값이 예상 나이
            const totalProbability = totalData.reduce((sum, data) => sum + data.probability, 0);
            const resultAge = Math.round(
                totalData.reduce((sum, data) => sum + data.probability * data.age, 0) / totalProbability
            );

            imageWrap.append(image)
            description.innerHTML = `<p>${totalData[0].resultMessage}</p><p>${totalData[0].resultExplain}</p>`
            predictionAge.innerText = text.age(resultAge);
            labelContainer.innerHTML = totalData.map(createLabel).join('');

            predictWrapper.append(imageWrap);
            predictWrapper.append(description);
            predictWrapper.append(predictionAge);
            predictWrapper.append(labelContainer);
            predictWrapper.append(reload);

            fileUploadBox.innerHTML = '';
            fileUploadBox.append(predictWrapper);
        } catch (error) {
            console.error('이미지 업로드 처리 중 오류:', error);

            fileUploadBox.innerHTML = `<div class="error-message">
                                        <p>${text.error}</p>
                                      </div>`;
            fileUploadBox.querySelector('.error-message').append(reload);
        }
    }
}
