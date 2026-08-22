(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var carousels = document.querySelectorAll("[data-carousel]");

  for (var c = 0; c < carousels.length; c++) {
    setup(carousels[c]);
  }

  function setup(root) {
    var slides = root.querySelectorAll("[data-slide]");
    var dots = root.querySelectorAll("[data-carousel-dot]");
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var delay = parseInt(root.getAttribute("data-interval"), 10) || 3500;
    var index = 0;
    var timer = null;

    function show(n) {
      index = (n + slides.length) % slides.length;
      for (var i = 0; i < slides.length; i++) {
        var on = i === index;
        slides[i].classList.toggle("is-active", on);
        slides[i].setAttribute("aria-hidden", on ? "false" : "true");
        if (dots[i]) {
          if (on) dots[i].setAttribute("aria-current", "true");
          else dots[i].removeAttribute("aria-current");
        }
      }
    }

    function start() {
      if (reduce || timer || slides.length < 2) return;
      timer = window.setInterval(function () { show(index + 1); }, delay);
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    function restart() {
      stop();
      start();
    }

    if (prev) prev.addEventListener("click", function () { show(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { show(index + 1); restart(); });
    for (var d = 0; d < dots.length; d++) {
      (function (n) {
        dots[n].addEventListener("click", function () { show(n); restart(); });
      })(d);
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    start();
  }
})();
