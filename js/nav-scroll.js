document.addEventListener('scroll', function () {
    var currentScroll = document.documentElement.scrollTop;
 
    if (currentScroll > 40) {
        $(".nav-bar").fadeOut();

    } else if (currentScroll < 50) {
        $(".nav-bar").fadeIn();
    }
});