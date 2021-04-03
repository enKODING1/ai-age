
//숨기기$(".nav-bar").fadeOut();
//보이기$(".nav-bar").fadeIn();

document.addEventListener('scroll', function () {
    var currentScroll = document.documentElement.scrollTop;
    console.log(currentScroll);
    if (currentScroll > 40) {
        $(".nav-bar").fadeOut();
        currentScroll+11;
    } else if (currentScroll < 50) {
        $(".nav-bar").fadeIn();
    }
});