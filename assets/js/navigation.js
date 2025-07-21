// 모바일 네비게이션 메뉴 기능
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item a');

    // 햄버거 버튼 클릭 이벤트
    mobileMenuToggle.addEventListener('click', function() {
        toggleMobileMenu();
    });

    // 모바일 메뉴 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mobileMenuToggle.contains(event.target) || mobileMenu.contains(event.target);
        if (!isClickInsideNav && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // 모바일 메뉴 링크 클릭 시 메뉴 닫기
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // 창 크기 변경 시 메뉴 상태 리셋
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });

    // ESC 키로 메뉴 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // 메뉴가 열릴 때 body 스크롤 방지
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMobileMenu() {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}); 