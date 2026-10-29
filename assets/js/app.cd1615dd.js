(() => {
'use strict';
const d = document;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const blocks = [...d.querySelectorAll('.reveal')];
if (blocks.length && !reduce && 'IntersectionObserver' in window) {
const io = new IntersectionObserver((entries) => {
for (const e of entries) {
if (e.isIntersecting) {
e.target.classList.add('in');
io.unobserve(e.target);
}
}
}, { rootMargin: '0px 0px -6% 0px' });
const tops = blocks.map((el) => el.getBoundingClientRect().top);
blocks.forEach((el, i) => {
if (tops[i] > innerHeight) el.classList.add('pre');
io.observe(el);
});
}
const menu = d.querySelector('.menu');
if (menu) {
const close = () => { menu.open = false; };
menu.addEventListener('click', (e) => { if (e.target.closest('.menu-panel a')) close(); });
d.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target)) close(); });
d.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && menu.open) { close(); menu.querySelector('summary').focus(); }
});
}
const box = d.querySelector('[data-sha-box]');
if (!box) return;
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 5000);
fetch('version.json', { cache: 'no-cache', signal: ctl.signal })
.then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
.then((v) => {
const build = Number(v && v.build);
const sha = String((v && v.apkSha256) || '').toLowerCase();
if (Number.isInteger(build) && build > 0 && build < 1e7) {
for (const el of d.querySelectorAll('[data-build]')) el.textContent = `compilação ${build}`;
for (const el of d.querySelectorAll('[data-build-label]')) el.textContent = `Compilação ${build}`;
}
if (/^[a-f0-9]{64}$/.test(sha)) {
const code = box.querySelector('[data-sha]');
code.textContent = sha;
box.hidden = false;
const fb = d.querySelector('[data-sha-fallback]');
if (fb) fb.hidden = true;
const btn = box.querySelector('[data-copy]');
const label = btn.querySelector('span');
const status = box.querySelector('[data-copy-status]');
btn.addEventListener('click', async () => {
let msg = 'SHA-256 copiado';
try {
await navigator.clipboard.writeText(sha);
} catch {
const sel = getSelection();
const range = d.createRange();
range.selectNodeContents(code);
sel.removeAllRanges();
sel.addRange(range);
msg = 'SHA-256 selecionado: copie com o menu do sistema';
}
label.textContent = msg.startsWith('SHA-256 c') ? 'Copiado' : 'Selecionado';
status.textContent = msg;
setTimeout(() => { label.textContent = 'Copiar'; }, 2500);
});
}
})
.catch(() => {})
.finally(() => clearTimeout(timer));
})();