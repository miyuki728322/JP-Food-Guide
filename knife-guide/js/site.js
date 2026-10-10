/* ============================================================
   包丁の道 — shared site behavior
   Builds sticky nav + prev/next footer from the chapter map,
   wires scroll reveals and sortable tables.
   ============================================================ */
(function () {
    'use strict';

    var CHAPTERS = [
        { file: '01-history.html',    num: '一', jp: '歴史',   en: 'History' },
        { file: '02-knives.html',     num: '二', jp: '包丁',   en: 'The Knives' },
        { file: '03-steel.html',      num: '三', jp: '鋼材',   en: 'Steel' },
        { file: '04-handles.html',    num: '四', jp: '柄',     en: 'Handles' },
        { file: '05-technique.html',  num: '五', jp: '技法',   en: 'Technique' },
        { file: '06-sharpening.html', num: '六', jp: '研ぎ',   en: 'Sharpening' },
        { file: '07-care.html',       num: '七', jp: '手入れ', en: 'Care & Storage' },
        { file: '08-regions.html',    num: '八', jp: '産地',   en: 'Regions & Makers' },
        { file: '09-buying.html',     num: '九', jp: '購入',   en: 'Buying Guide' }
    ];

    var current = window.__PAGE || (location.pathname.split('/').pop() || 'index.html');

    /* ---------- sticky nav ---------- */
    var navMount = document.getElementById('site-nav');
    if (navMount) {
        var nav = document.createElement('nav');
        nav.className = 'site-nav';
        nav.setAttribute('aria-label', 'Chapters');

        var brand = document.createElement('a');
        brand.className = 'site-nav__brand';
        brand.href = 'index.html';
        brand.innerHTML = '<span class="site-nav__brand-jp">包丁の道</span>' +
            '<span class="site-nav__brand-en">The Japanese Knife</span>';
        nav.appendChild(brand);

        var list = document.createElement('div');
        list.className = 'site-nav__chapters';
        CHAPTERS.forEach(function (ch) {
            var a = document.createElement('a');
            a.className = 'site-nav__link' + (ch.file === current ? ' site-nav__link--active' : '');
            a.href = ch.file;
            a.title = ch.en;
            a.innerHTML = '<span class="site-nav__link-num">' + ch.num + '</span>' +
                '<span class="site-nav__link-jp">' + ch.jp + '</span>';
            list.appendChild(a);
        });
        nav.appendChild(list);

        var progress = document.createElement('div');
        progress.className = 'site-nav__progress';
        nav.appendChild(progress);

        navMount.replaceWith(nav);

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
                ticking = false;
            });
        }, { passive: true });
    }

    /* ---------- prev / next footer ---------- */
    var footMount = document.getElementById('chapter-footer');
    if (footMount) {
        var idx = -1;
        CHAPTERS.forEach(function (ch, i) { if (ch.file === current) idx = i; });
        var prev = idx > 0 ? CHAPTERS[idx - 1] : null;
        var next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

        var foot = document.createElement('div');
        foot.className = 'chapter-footer';

        function linkHtml(ch, dir, label) {
            return '<a class="chapter-footer__link chapter-footer__link--' + dir + '" href="' + ch.file + '">' +
                '<p class="chapter-footer__dir">' + label + '</p>' +
                '<p class="chapter-footer__title">' + ch.en + '</p>' +
                '<p class="chapter-footer__jp">' + ch.jp + '</p></a>';
        }

        var html = '';
        if (prev) html += linkHtml(prev, 'prev', '← Previous');
        else html += '<a class="chapter-footer__link chapter-footer__link--prev" href="index.html">' +
            '<p class="chapter-footer__dir">← Contents</p>' +
            '<p class="chapter-footer__title">Table of Contents</p>' +
            '<p class="chapter-footer__jp">目次</p></a>';
        if (next) html += linkHtml(next, 'next', 'Next →');
        else html += '<a class="chapter-footer__link chapter-footer__link--next" href="index.html">' +
            '<p class="chapter-footer__dir">Finish →</p>' +
            '<p class="chapter-footer__title">Back to Contents</p>' +
            '<p class="chapter-footer__jp">目次</p></a>';

        foot.innerHTML = html;
        footMount.replaceWith(foot);
    }

    /* ---------- scroll reveals ---------- */
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- sortable tables ---------- */
    document.querySelectorAll('table.js-sortable').forEach(function (table) {
        var ths = table.querySelectorAll('thead th');
        ths.forEach(function (th, col) {
            if (!th.classList.contains('sortable')) return;
            th.addEventListener('click', function () {
                var tbody = table.querySelector('tbody');
                var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
                var dir = th.classList.contains('sorted-asc') ? -1 : 1;
                ths.forEach(function (t) { t.classList.remove('sorted-asc', 'sorted-desc'); });
                th.classList.add(dir === 1 ? 'sorted-asc' : 'sorted-desc');

                rows.sort(function (a, b) {
                    var av = a.children[col].getAttribute('data-sort') || a.children[col].textContent.trim();
                    var bv = b.children[col].getAttribute('data-sort') || b.children[col].textContent.trim();
                    var an = parseFloat(av), bn = parseFloat(bv);
                    if (!isNaN(an) && !isNaN(bn)) return (an - bn) * dir;
                    return av.localeCompare(bv) * dir;
                });
                rows.forEach(function (r) { tbody.appendChild(r); });
            });
        });
    });
})();
