(function() {
	"use strict";

    //Preloader 
    window.addEventListener('load',function(){
        document.querySelector('body').classList.add("loaded")  
    });

    window.onload = function(){
        
        // Header Sticky
        const getHeaderId = document.getElementById("navbar");
        if (getHeaderId) {
            window.addEventListener('scroll', event => {
                const height = 150;
                const { scrollTop } = event.target.scrollingElement;
                document.querySelector('#navbar').classList.toggle('sticky', scrollTop >= height);
            });
        }
        
        // Back to Top
        const getId = document.getElementById("backtotop");
        if (getId) {
            const topbutton = document.getElementById("backtotop");
            topbutton.onclick = function (e) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            };
            window.onscroll = function () {
                if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                    topbutton.style.opacity = "1";
                } else {
                    topbutton.style.opacity = "0";
                }
            };
        }
    };

    //Service Slider
    var mySwiper = new Swiper(".service-slider", {
        spaceBetween: 25,
        grabCursor: true,
        loop: false,
        autoHeight: true,
        speed:1200,
        navigation: {
            nextEl: ".service-next",
            prevEl: ".service-prev"
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3
            }
        }
    });

    //Testimonial Slider
    var mySwiper = new Swiper(".testimonial-slider-one", {
        spaceBetween: 25,
        grabCursor: true,
        loop: false,
        autoHeight: true,
        speed:1200,
        navigation: {
            nextEl: ".testimonial-next",
            prevEl: ".testimonial-prev"
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            }
        }
    });
    var mySwiper = new Swiper(".testimonial-slider-two", {
        spaceBetween: 25,
        grabCursor: true,
        loop: false,
        autoHeight: true,
        speed:1200,
        navigation: {
            nextEl: ".testimonial-next",
            prevEl: ".testimonial-prev"
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3
            }
        }
    });
    var mySwiper = new Swiper(".testimonial-slider-three", {
        spaceBetween: 25,
        grabCursor: true,
        loop: false,
        autoHeight: true,
        speed:1200,
        navigation: {
            nextEl: ".testimonial-next",
            prevEl: ".testimonial-prev"
        },
        pagination: {
            el: ".testimonial-pagination",
            dynamicBullets: true,
            clickable:true
          },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3
            }
        }
    });

    //Team Slider
    var mySwiper = new Swiper(".team-slider", {
        spaceBetween: 25,
        grabCursor: true,
        loop: false,
        autoHeight: true,
        speed:1200,
        navigation: {
            nextEl: ".team-next",
            prevEl: ".team-prev"
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3
            }
        }
    });
    // AOS
    AOS.init({
        startEvent: 'load',
    });

    // Counter Js
    if ("IntersectionObserver" in window) {
        let counterObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                let counter = entry.target;
                let target = parseInt(counter.innerText);
                let step = target / 200;
                let current = 0;
                let timer = setInterval(function () {
                    current += step;
                    counter.innerText = Math.floor(current);
                    if (parseInt(counter.innerText) >= target) {
                    clearInterval(timer);
                    }
                }, 10);
                counterObserver.unobserve(counter);
                }
            });
        });
        let counters = document.querySelectorAll(".counter");
            counters.forEach(function (counter) {
            counterObserver.observe(counter);
        });
    }

})();

//Before & after Image Slide
function beforeAfter() {
    document.getElementById("before_after").style.width =
      document.getElementById("before_after_slider").value + "%";
}
function callBeforeAfter() {
    beforeAfter(); // Call the function
}

// Light/Dark Mode
try {

	// function to set a given theme/color-scheme
	function setTheme(themeName) {
		localStorage.setItem('dolt_theme', themeName);
		document.documentElement.className = themeName;
	}
	// function to toggle between light and dark theme
	function toggleTheme() {
		if (localStorage.getItem('dolt_theme') === 'theme-dark') {
			setTheme('theme-light');
		} else {
			setTheme('theme-dark');
		}
	}
	// Immediately invoked function to set the theme on initial load
	(function () {
		if (localStorage.getItem('dolt_theme') === 'theme-dark') {
			setTheme('theme-dark');
			document.getElementById('slider').checked = false;
		} else {
			setTheme('theme-light');
		document.getElementById('slider').checked = true;
		}
	})();
} catch (err) {}