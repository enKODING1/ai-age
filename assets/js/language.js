// Language Selector Functions
let isDropdownOpen = false;

function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    const selected = document.querySelector('.language-selected');
    
    isDropdownOpen = !isDropdownOpen;
    
    if (isDropdownOpen) {
        dropdown.classList.add('show');
        selected.classList.add('active');
    } else {
        dropdown.classList.remove('show');
        selected.classList.remove('active');
    }
}

function selectLanguage(value, flag, text) {
    const selected = document.querySelector('.language-selected');
    const flagSpan = selected.querySelector('.flag');
    const textSpan = selected.querySelector('.language-text');
    
    // Update selected display
    flagSpan.textContent = flag;
    textSpan.textContent = text;
    
    // Close dropdown
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.remove('show');
    selected.classList.remove('active');
    isDropdownOpen = false;
    
    // Navigate to appropriate page
    // 한국어(kr)는 루트, 나머지 언어는 /{언어}/ 하위 경로
    const currentLanguage = document.documentElement.lang === 'ko' ? 'kr' : document.documentElement.lang;
    if (value === currentLanguage) return;

    const fileName = window.location.pathname.split('/').pop();
    const page = /\.html$/.test(fileName) && fileName !== 'index.html' ? fileName : '';
    window.location.href = (value === 'kr' ? '/' : '/' + value + '/') + page;
}

// 클릭 외부 영역 감지하여 드롭다운 닫기
document.addEventListener('click', function(event) {
    const languageSelector = document.querySelector('.language-selector');
    
    if (languageSelector && !languageSelector.contains(event.target)) {
        const dropdown = document.getElementById('languageDropdown');
        const selected = document.querySelector('.language-selected');
        
        if (dropdown && selected) {
            dropdown.classList.remove('show');
            selected.classList.remove('active');
            isDropdownOpen = false;
        }
    }
});

// ESC 키로 드롭다운 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isDropdownOpen) {
        const dropdown = document.getElementById('languageDropdown');
        const selected = document.querySelector('.language-selected');
        
        if (dropdown && selected) {
            dropdown.classList.remove('show');
            selected.classList.remove('active');
            isDropdownOpen = false;
        }
    }
});

// 키보드 네비게이션 지원
document.addEventListener('keydown', function(event) {
    if (!isDropdownOpen) return;
    
    const options = document.querySelectorAll('.language-option');
    let currentIndex = -1;
    
    // 현재 포커스된 옵션 찾기
    options.forEach((option, index) => {
        if (option.classList.contains('focused')) {
            currentIndex = index;
        }
    });
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        currentIndex = (currentIndex + 1) % options.length;
        updateFocus(options, currentIndex);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        updateFocus(options, currentIndex);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentIndex >= 0) {
            options[currentIndex].click();
        }
    }
});

function updateFocus(options, index) {
    options.forEach(option => option.classList.remove('focused'));
    if (index >= 0 && index < options.length) {
        options[index].classList.add('focused');
    }
}

// 페이지 로드 시 현재 언어에 맞게 초기화
const LANGUAGE_LABELS = {
    ko: ['🇰🇷', '한국어'],
    en: ['🇺🇸', 'English'],
    zh: ['🇨🇳', '中文'],
    ja: ['🇯🇵', '日本語'],
    th: ['🇹🇭', 'ไทย'],
    vi: ['🇻🇳', 'Tiếng Việt'],
    hi: ['🇮🇳', 'हिन्दी']
};

document.addEventListener('DOMContentLoaded', function() {
    const selected = document.querySelector('.language-selected');

    if (!selected) return;

    const [flag, text] = LANGUAGE_LABELS[document.documentElement.lang] || LANGUAGE_LABELS.ko;
    selected.querySelector('.flag').textContent = flag;
    selected.querySelector('.language-text').textContent = text;
});
