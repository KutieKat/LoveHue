(() => {
    let currentPage = 0;
    let posts = [];

    $('.featured-posts__list').first().slick({
        infinite: true,
        slidesToShow: 1,
        prevArrow: false,
        nextArrow: false,
        dots: false,
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true
    });

    $('.category-highlighted-posts__list').slick({
        infinite: true,
        slidesToShow: 5,
        prevArrow: false,
        nextArrow: false,
        dots: false,
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true
    });

    $('[data-toggle="tooltip"]').tooltip();

    $(window).scroll(function(event) {
        const btnBackToTop = $('#btnBackToTop');
        const mainNavigationBar = $('.main-header__main-navigation nav');
        const offsetFromTop = $(window).scrollTop();

        if (offsetFromTop >= 20) {
            mainNavigationBar.addClass('fixed-top');
        }
        else {
            mainNavigationBar.removeClass('fixed-top');
        }

        if (offsetFromTop >= 10) {
            btnBackToTop.show();
        }
        else {
            btnBackToTop.hide();
        }
    });

    $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
        // On-page links
        if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
        && 
        location.hostname == this.hostname
        ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
            // Only prevent default if animation is actually gonna happen
            event.preventDefault();
            $('html, body').animate({
            scrollTop: target.offset().top
            }, 500, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
                return false;
            } else {
                $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
            };
            });
        }
        }
    });

    function getRelativeTimeString(timeString) {
        let relativeTimeString = moment(timeString).fromNow();
        let replacements = [
            {
                originalString: ['days'],
                replacementString: 'ngày'
            },
            {
                originalString: ['hour', 'hours'],
                replacementString: 'giờ'
            },
            {
                originalString: ['minute', 'minutes'],
                replacementString: 'phút'
            },
            {
                originalString: ['second', 'seconds'],
                replacementString: 'giây'
            },
            {
                originalString: ['ago'],
                replacementString: 'trước'
            },
            {
                originalString: ['few'],
                replacementString: 'một vài'
            },
            {
                originalString: ['a', 'an', '1n'],
                replacementString: '1'
            }
        ];

        if (relativeTimeString.indexOf('days') > 1) {
            if (parseInt(relativeTimeString) > 3) {
                return `${ moment(timeString).format('DD/MM/YYYY') }, lúc ${ moment(timeString).format('hh:mm') }`;
            }
            else {
                replacements.forEach(replacement => {
                    const { originalString, replacementString } = replacement;
            
                    originalString.forEach(str => {
                      if (relativeTimeString.includes(str)) {
                          relativeTimeString = relativeTimeString.replace(str, replacementString);
                      }
                    });
                });
            
                return relativeTimeString;
            }
        }
    };

    function renderPosts() {
        let html = '';

        posts.forEach(post => {
            html += `
                <article class="category-timeline-post clearfix">
                    <a href="/bai-viet/${ post['seo_slug'] }" title="${ post['title'] }"><img src="/${ post['thumbnail_image_file_name'] }" class="category-timeline-post__thumbnail" alt="${ post['title'] }" /></a>
                    <div class="category-timeline-post__details">
                        <span class="category-timeline-post__category"><a href="/chuyen-muc/${ post['post_category']['seo_slug'] }">${ post['post_category']['name'] }</a></span>
                        <h3 class="category-timeline-post__title"><a href="/bai-viet/${ post['seo_slug'] }">${ post['title'] }</a></h3>
                        <p class="category-timeline-post__meta">
                            <span class="category-timeline-post__posted-time"><i class="far fa-clock"></i>&nbsp;&nbsp;${ getRelativeTimeString(post['createdAt']) }</span>
                            <span class="category-timeline-post__views"><i class="far fa-eye"></i>&nbsp;&nbsp;${ post['views'] } lượt xem</span>
                        </p>
                        <p class="category-timeline-post__summary">${ post['summary'] }</p>
                    </div>
                </article>
            `;
        });

        $('.category-timeline-posts__list').html(html);
    }

    $('.btn-load-more').on('click', function() {
        let url = $(this).data('href');

        if (url.indexOf('?') === -1) {
            url = url + '?page=' + ++currentPage;
        }
        else {
            url = url + '&page=' + ++currentPage;
        }

        $.ajax({
            url
        })
        .done(function(response) {
            if (response.data.docs.length > 0) {
                posts.push(...response.data.docs);
                renderPosts();
            }
            else {
                $('.btn-load-more').hide();
            }
        })
        .fail(function(response) {
            console.log(response);
        });
    });

    $('#btnFacebookShare').on('click', function() {
        $('button[title="Thích"]').click()
    });

    $('.btn-load-more').click();
})();