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
    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split('/').pop() || 'index.html';
    
    if (value === 'kr') {
        // 한국어 페이지로 이동 (루트)
        if (currentPath.includes('/en/') || currentPath.includes('/zh/') || currentPath.includes('/ja/') || 
            currentPath.includes('/th/') || currentPath.includes('/vi/') || currentPath.includes('/hi/')) {
            window.location.href = '../' + currentFileName;
        }
    } else if (value === 'en') {
        // 영어 페이지로 이동
        if (currentPath.includes('/zh/') || currentPath.includes('/ja/') || 
            currentPath.includes('/th/') || currentPath.includes('/vi/') || currentPath.includes('/hi/')) {
            window.location.href = '../en/' + currentFileName;
        } else if (!currentPath.includes('/en/')) {
            window.location.href = './en/' + currentFileName;
        }
    } else if (value === 'zh') {
        // 중국어 페이지로 이동
        if (currentPath.includes('/en/') || currentPath.includes('/ja/') || 
            currentPath.includes('/th/') || currentPath.includes('/vi/') || currentPath.includes('/hi/')) {
            window.location.href = '../zh/' + currentFileName;
        } else if (!currentPath.includes('/zh/')) {
            window.location.href = './zh/' + currentFileName;
        }
    } else if (value === 'ja') {
        // 일본어 페이지로 이동
        if (currentPath.includes('/en/') || currentPath.includes('/zh/') || 
            currentPath.includes('/th/') || currentPath.includes('/vi/') || currentPath.includes('/hi/')) {
            window.location.href = '../ja/' + currentFileName;
        } else if (!currentPath.includes('/ja/')) {
            window.location.href = './ja/' + currentFileName;
        }
    } else if (value === 'th') {
        // 태국어 페이지로 이동
        if (currentPath.includes('/en/') || currentPath.includes('/zh/') || currentPath.includes('/ja/') || 
            currentPath.includes('/vi/') || currentPath.includes('/hi/')) {
            window.location.href = '../th/' + currentFileName;
        } else if (!currentPath.includes('/th/')) {
            window.location.href = './th/' + currentFileName;
        }
    } else if (value === 'vi') {
        // 베트남어 페이지로 이동
        if (currentPath.includes('/en/') || currentPath.includes('/zh/') || currentPath.includes('/ja/') || 
            currentPath.includes('/th/') || currentPath.includes('/hi/')) {
            window.location.href = '../vi/' + currentFileName;
        } else if (!currentPath.includes('/vi/')) {
            window.location.href = './vi/' + currentFileName;
        }
    } else if (value === 'hi') {
        // 힌디어 페이지로 이동
        if (currentPath.includes('/en/') || currentPath.includes('/zh/') || currentPath.includes('/ja/') || 
            currentPath.includes('/th/') || currentPath.includes('/vi/')) {
            window.location.href = '../hi/' + currentFileName;
        } else if (!currentPath.includes('/hi/')) {
            window.location.href = './hi/' + currentFileName;
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
    } else if (currentPath.includes('/zh/')) {
        // 중국어 페이지
        flagSpan.textContent = '🇨🇳';
        textSpan.textContent = '中文';
    } else if (currentPath.includes('/ja/')) {
        // 일본어 페이지
        flagSpan.textContent = '🇯🇵';
        textSpan.textContent = '日本語';
    } else if (currentPath.includes('/th/')) {
        // 태국어 페이지
        flagSpan.textContent = '🇹🇭';
        textSpan.textContent = 'ไทย';
    } else if (currentPath.includes('/vi/')) {
        // 베트남어 페이지
        flagSpan.textContent = '🇻🇳';
        textSpan.textContent = 'Tiếng Việt';
    } else if (currentPath.includes('/hi/')) {
        // 힌디어 페이지
        flagSpan.textContent = '🇮🇳';
        textSpan.textContent = 'हिन्दी';
    } else {
        // 한국어 페이지
        flagSpan.textContent = '🇰🇷';
        textSpan.textContent = '한국어';
    }
}); 