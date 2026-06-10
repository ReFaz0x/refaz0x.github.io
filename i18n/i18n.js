// i18n/i18n.js — single translation engine, shared by every page.
// PT lives in the HTML (source of truth); only EN/ES/ZH/JA are authored as JSON.
(function () {
  const SUPPORTED = ['pt', 'en', 'es', 'zh', 'ja'];
  const DEFAULT = 'pt';
  const STORE = 'refaz_lang';
  const cache = {};            // original pt-BR, captured from the page
  let captured = false;

  function capture() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      cache[el.getAttribute('data-i18n')] = el.innerHTML;
    });
    captured = true;
  }
  function pick() {
    const url = new URLSearchParams(location.search).get('lang');
    const lang = url || localStorage.getItem(STORE) || DEFAULT;
    return SUPPORTED.includes(lang) ? lang : DEFAULT;
  }
  async function apply(lang) {
    if (!captured) capture();
    const dict = lang === DEFAULT
      ? cache
      : await fetch(`/i18n/${lang}.json`).then(r => r.json()).catch(() => ({}));
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const v = dict[k] != null ? dict[k] : cache[k];   // fall back to PT
      if (v != null) el.innerHTML = v;
    });
    document.documentElement.lang = lang === DEFAULT ? 'pt-BR' : lang;
    localStorage.setItem(STORE, lang);
    document.querySelectorAll('[data-lang]').forEach(b =>
      b.classList.toggle('is-active', b.dataset.lang === lang));
  }
  window.setLang = apply;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(b =>
      b.addEventListener('click', () => apply(b.dataset.lang)));
    apply(pick());
  });
})();
