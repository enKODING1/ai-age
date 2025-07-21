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
    if (value === 'en') {
        // 현재 페이지가 루트에 있는지 en 폴더에 있는지 확인
        const currentPath = window.location.pathname;
        if (currentPath.includes('/en/')) {
            // 이미 영어 페이지에 있으면 그대로 유지
            return;
        } else {
            // 한국어 페이지에서 영어 페이지로 이동
            if (currentPath.includes('about.html')) {
                window.location.href = './en/about.html';
            } else if (currentPath.includes('info.html')) {
                window.location.href = './en/info.html';
            } else {
                window.location.href = './en/index.html';
            }
        }
    } else if (value === 'kr') {
        // 현재 페이지가 en 폴더에 있는지 확인
        const currentPath = window.location.pathname;
        if (currentPath.includes('/en/')) {
            // 영어 페이지에서 한국어 페이지로 이동
            if (currentPath.includes('about.html')) {
                window.location.href = '../about.html';
            } else if (currentPath.includes('info.html')) {
                window.location.href = '../info.html';
            } else {
                window.location.href = '../index.html';
            }
        } else {
            // 이미 한국어 페이지에 있으면 그대로 유지
            return;
        }
    }
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
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const selected = document.querySelector('.language-selected');
    
    if (!selected) return;
    
    const flagSpan = selected.querySelector('.flag');
    const textSpan = selected.querySelector('.language-text');
    
    if (currentPath.includes('/en/')) {
        // 영어 페이지
        flagSpan.textContent = '🇺🇸';
        textSpan.textContent = 'English';
    } else {
        // 한국어 페이지
        flagSpan.textContent = '🇰🇷';
        textSpan.textContent = '한국어';
    }
}); 