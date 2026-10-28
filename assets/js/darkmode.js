const moonPath =  "M31.5 50C31.5 77.6142 50 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C50 0 31.5 22.3858 31.5 50Z";
const sunPath  =  "M100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50Z";

const mode = document.querySelector('#darkMode');
const modeIcon = document.querySelector('#darkMode .sun');

function getSavedDarkMode() {
    try {
        return localStorage.getItem('darkMode');
    } catch (e) {
        return null;
    }
}

function saveDarkMode(enabled) {
    try {
        localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
    } catch (e) {
        // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 현재 페이지에만 적용
    }
}

function applyDarkMode(enabled, animate) {
    document.body.classList.toggle('dark', enabled);

    if (!modeIcon) return;

    if (animate && window.anime) {
        anime({
            targets: modeIcon,
            d: [{ value: enabled ? moonPath : sunPath }],
            duration: 400,
            easing: 'easeInOutCubic'
        });
        anime({
            targets: '#darkMode svg',
            rotate: enabled ? 360 : 0,
            duration: 500,
            easing: 'easeInOutCubic'
        });
    } else {
        modeIcon.setAttribute('d', enabled ? moonPath : sunPath);
    }
}

// 저장된 설정이 없으면 시스템 설정을 따른다
const savedDarkMode = getSavedDarkMode();
applyDarkMode(
    savedDarkMode ? savedDarkMode === 'enabled' : window.matchMedia('(prefers-color-scheme: dark)').matches,
    false
);

if (mode) {
    mode.setAttribute('role', 'button');
    mode.setAttribute('tabindex', '0');
    mode.setAttribute('aria-label', 'Toggle dark mode');

    const toggleDarkMode = () => {
        const enabled = !document.body.classList.contains('dark');
        applyDarkMode(enabled, true);
        saveDarkMode(enabled);
    };

    mode.addEventListener('click', toggleDarkMode);
    mode.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDarkMode();
        }
    });
}
