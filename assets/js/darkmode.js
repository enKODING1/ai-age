const moonPath =  "M31.5 50C31.5 77.6142 50 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C50 0 31.5 22.3858 31.5 50Z";
const sunPath  =  "M100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50Z";

const mode = document.querySelector('#darkMode');
const fileUpload = document.querySelector('.file-upload');
const imageUploadWrap = document.querySelector('.image-upload-wrap');
const navContainer = document.querySelector('.nav-container');
const navItems = document.querySelectorAll('.nav-item a');
const logo = document.querySelector('.logo');

let toggle = true;

function getPercentValue(x, percent){
    return x * (percent / 100);
}

mode.addEventListener('click',function(){
    let duration = 500;
    const timeline = anime.timeline({
        duration: duration,
        easing:"easeInOutCubic"
    });

    timeline
    .add({
        targets: '.sun',
        d: [
            {value: toggle? moonPath : sunPath}
        ],
        fill: toggle ? '#FFD93D' : '#ffffff',
        duration: duration * 0.6
    })
    .add({
        targets:"#darkMode",
        rotate: toggle ? 360 : 0,
        background: toggle ? 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        scale: [1, 1.1, 1],
        duration: duration
    },`-=${duration * 0.8}`)
    .add({
        targets:"body",
        background: toggle ? 
            "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)" : 
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: toggle ? "#e2e8f0" : "#2d3748",
        duration: duration
    },`-=${duration}`)
    .add({
        targets:".content-container",
        background: toggle ? 
            "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)" : 
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        duration: duration
    },`-=${duration}`)
    .add({
        targets:".nav-container",
        background: toggle ? 
            "rgba(26, 26, 26, 0.3)" : 
            "rgba(255, 255, 255, 0.1)",
        borderBottomColor: toggle ? 
            "rgba(255, 255, 255, 0.2)" : 
            "rgba(255, 255, 255, 0.2)",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".nav-item a",
        color: toggle ? "#e2e8f0" : "rgba(255, 255, 255, 0.9)",
        duration: duration * 0.8
    },`-=${duration * 0.8}`)
    .add({
        targets: ".logo",
        color: toggle ? "#e2e8f0" : "white",
        duration: duration * 0.8
    },`-=${duration * 0.8}`)
    .add({
        targets:".file-upload",
        backgroundColor: toggle ? "#2d3748" : "#ffffff",
        boxShadow: toggle ? 
            "rgb(0 0 0 / 20%) 0px 2px 8px 0px" : 
            "rgb(0 0 0 / 10%) 0px 2px 8px 0px",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".image-upload-wrap",
        backgroundColor: toggle ? "rgba(74, 85, 104, 0.95)" : "rgba(255, 255, 255, 0.95)",
        border: toggle ? "3px dashed rgba(102, 126, 234, 0.6)" : "3px dashed rgba(102, 126, 234, 0.3)",
        color: toggle ? "#e2e8f0" : "#4a5568",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".language-selected",
        background: toggle ? 
            "rgba(45, 55, 72, 0.3)" : 
            "rgba(255, 255, 255, 0.1)",
        borderColor: toggle ? 
            "rgba(255, 255, 255, 0.4)" : 
            "rgba(255, 255, 255, 0.3)",
        color: toggle ? "#e2e8f0" : "white",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".language-dropdown",
        background: toggle ? 
            "rgba(45, 55, 72, 0.95)" : 
            "rgba(255, 255, 255, 0.95)",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".language-option",
        color: toggle ? "#e2e8f0" : "#2d3748",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".content-bottom p",
        backgroundColor: toggle ? "rgba(255, 214, 214, 0.2)" : "rgba(255, 214, 214, 0.4)",
        color: toggle ? "rgb(250, 124, 124)" : "rgb(250, 124, 124)",
        duration: duration
    },`-=${duration}`)
    .add({
        targets: ".footer-container p",
        backgroundColor: toggle ? "#4a5568" : "#dceaff",
        color: toggle ? "#e2e8f0" : "#3e6fff",
        duration: duration
    },`-=${duration}`);

    // 저장된 상태를 업데이트
    localStorage.setItem('darkMode', toggle ? 'enabled' : 'disabled');
    
    toggle = !toggle;
    
    // 다크모드 상태를 localStorage에 저장
    if (toggle) {
        localStorage.setItem('darkMode', 'enabled');
        document.body.classList.add('dark');
    } else {
        localStorage.setItem('darkMode', 'disabled');
        document.body.classList.remove('dark');
    }
});

// 페이지 로드 시 저장된 다크모드 상태 복원
document.addEventListener('DOMContentLoaded', function() {
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode === 'enabled') {
        // 다크모드가 활성화된 상태로 설정
        toggle = false; // 클릭 이벤트에서 true로 변경되도록
        document.body.classList.add('dark');
        applyDarkModeInstantly();
    } else {
        // 라이트모드 상태 확실히 하기
        document.body.classList.remove('dark');
    }
});

function applyDarkModeInstantly() {
    // 애니메이션 없이 즉시 다크모드 적용
    document.body.classList.add('dark');
    document.body.style.background = "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)";
    document.body.style.color = "#e2e8f0";
    
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
        contentContainer.style.background = "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)";
    }
    
    if (navContainer) {
        navContainer.style.background = "rgba(26, 26, 26, 0.3)";
        navContainer.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
    }
    
    navItems.forEach(item => {
        item.style.color = "#e2e8f0";
    });
    
    if (logo) {
        logo.style.color = "#e2e8f0";
    }
    
    if (fileUpload) {
        fileUpload.style.backgroundColor = "#2d3748";
        fileUpload.style.boxShadow = "rgb(0 0 0 / 20%) 0px 2px 8px 0px";
    }
    
    if (imageUploadWrap) {
        imageUploadWrap.style.backgroundColor = "rgba(74, 85, 104, 0.95)";
        imageUploadWrap.style.border = "3px dashed rgba(102, 126, 234, 0.6)";
        imageUploadWrap.style.color = "#e2e8f0";
    }
    
    const languageSelected = document.querySelector('.language-selected');
    if (languageSelected) {
        languageSelected.style.background = "rgba(45, 55, 72, 0.3)";
        languageSelected.style.borderColor = "rgba(255, 255, 255, 0.4)";
        languageSelected.style.color = "#e2e8f0";
    }
    
    const languageDropdown = document.querySelector('.language-dropdown');
    if (languageDropdown) {
        languageDropdown.style.background = "rgba(45, 55, 72, 0.95)";
    }
    
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.style.color = "#e2e8f0";
    });
    
    const contentBottomP = document.querySelector('.content-bottom p');
    if (contentBottomP) {
        contentBottomP.style.backgroundColor = "rgba(255, 214, 214, 0.2)";
    }
    
    const footerPs = document.querySelectorAll('.footer-container p');
    footerPs.forEach(p => {
        p.style.backgroundColor = "#4a5568";
        p.style.color = "#e2e8f0";
    });
    
    // 아이콘도 다크모드로 변경
    const sunPath = document.querySelector('.sun');
    if (sunPath) {
        sunPath.setAttribute('d', moonPath);
        sunPath.setAttribute('fill', '#FFD93D');
    }
    
    if (mode) {
        mode.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
}

function applyLightModeInstantly() {
    const body = document.body;
    const contentContainer = document.querySelector('.content-container');
    const navContainer = document.querySelector('.nav-container');
    const navItems = document.querySelectorAll('.nav-item a');
    const logo = document.querySelector('.logo');
    const fileUpload = document.querySelector('.file-upload');
    const imageUploadWrap = document.querySelector('.image-upload-wrap');
    
    // 라이트모드 스타일 즉시 적용
    if (body) {
        body.classList.remove('dark');
        body.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
    
    if (contentContainer) {
        contentContainer.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
    
    if (navContainer) {
        navContainer.style.background = "rgba(255, 255, 255, 0.1)";
        navContainer.style.boxShadow = "rgb(0 0 0 / 10%) 0px 2px 8px 0px";
    }
    
    navItems.forEach(item => {
        item.style.color = "rgba(255, 255, 255, 0.9)";
    });
    
    if (logo) {
        logo.style.color = "white";
    }
    
    if (fileUpload) {
        fileUpload.style.backgroundColor = "";
        fileUpload.style.boxShadow = "";
    }
    
    if (imageUploadWrap) {
        imageUploadWrap.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
        imageUploadWrap.style.border = "3px dashed rgba(102, 126, 234, 0.3)";
        imageUploadWrap.style.color = "#4a5568";
    }
    
    const languageSelected = document.querySelector('.language-selected');
    if (languageSelected) {
        languageSelected.style.background = "rgba(255, 255, 255, 0.1)";
        languageSelected.style.borderColor = "rgba(255, 255, 255, 0.3)";
        languageSelected.style.color = "white";
    }
    
    const languageDropdown = document.querySelector('.language-dropdown');
    if (languageDropdown) {
        languageDropdown.style.background = "rgba(255, 255, 255, 0.95)";
    }
    
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.style.color = "#2d3748";
    });
    
    const contentBottomP = document.querySelector('.content-bottom p');
    if (contentBottomP) {
        contentBottomP.style.backgroundColor = "rgba(255, 214, 214, 0.4)";
    }
    
    const footerPs = document.querySelectorAll('.footer-container p');
    footerPs.forEach(p => {
        p.style.backgroundColor = "";
        p.style.color = "";
    });
}

