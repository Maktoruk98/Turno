/* Turno · service worker
   - Guarda la app para que abra sin conexión.
   - Muestra la notificación «Trabajando» mientras hay un turno abierto
     y la vuelve a mostrar si se desliza para quitarla. */
const VERSION = 'turno-v4';
const SDK = 'turno-sdk';
const FUENTES = 'turno-fuentes';
const ESTADO = 'turno-estado';
const CLAVE = './__estado';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './badge-96.png'];

self.addEventListener('install', e => {
  // Cada archivo por separado: si falta uno, la app se instala igual.
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![VERSION, FUENTES, ESTADO, SDK].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
    await enCola(asegurar);
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      // Red primero para recibir actualizaciones; sin conexión, la copia guardada.
      e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(k => k.put('./index.html', c)); return r; })
        .catch(() => caches.match('./index.html', { ignoreSearch: true })));
      return;
    }
    e.respondWith(caches.match(req).then(hit => {
      const red = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then(k => k.put(req, c)); } return r; }).catch(() => hit);
      return hit || red;
    }));
    return;
  }
  // El código de Firebase (versión fija) se guarda para que la app abra sin conexión
  if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.open(SDK).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
    }));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FUENTES).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req); c.put(req, r.clone()); return r;
    }).catch(() => fetch(req)));
  }
});

/* ---------- Estado compartido con la app ---------- */
async function leerEstado() {
  try { const r = await (await caches.open(ESTADO)).match(CLAVE); return r ? await r.json() : { trabajando: false }; }
  catch (e) { return { trabajando: false }; }
}
async function guardarEstado(est) {
  const c = await caches.open(ESTADO);
  await c.put(CLAVE, new Response(JSON.stringify(est), { headers: { 'content-type': 'application/json' } }));
}

// Las órdenes se procesan de una en una para que una notificación antigua no reaparezca tras finalizar.
let cola = Promise.resolve();
const enCola = fn => (cola = cola.then(fn, fn));

const hm = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

function globo(on) {
  try {
    const n = self.navigator;
    if (on && n.setAppBadge) n.setAppBadge(1).catch(() => {});
    if (!on && n.clearAppBadge) n.clearAppBadge().catch(() => {});
  } catch (e) {}
}
async function mostrar(est) {
  globo(true);
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const pausa = !!est.pausaDesde;
  await self.registration.showNotification(pausa ? 'En pausa' : 'Trabajando', {
    tag: 'turno',
    body: pausa ? `En pausa desde las ${hm(est.pausaDesde)} · entrada ${hm(est.inicio)}` : `Entrada a las ${hm(est.inicio)}. Toca para abrir.`,
    icon: 'icon-192.png',
    badge: 'badge-96.png',
    requireInteraction: true,
    silent: true,
    renotify: false,
    timestamp: est.inicio,
    data: { inicio: est.inicio },
    actions: [
      { action: 'abrir', title: 'Abrir' },
      { action: 'finalizar', title: 'Finalizar turno' }
    ]
  });
}
async function quitar() {
  globo(false);
  const ns = await self.registration.getNotifications({ tag: 'turno' });
  ns.forEach(n => n.close());
}
async function asegurar() {
  const est = await leerEstado();
  if (!est.trabajando) { await quitar(); return; }
  const ns = await self.registration.getNotifications({ tag: 'turno' });
  if (!ns.length) await mostrar(est);
}

self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'estado' && d.estado) {
    e.waitUntil(enCola(async () => {
      await guardarEstado(d.estado);
      if (d.estado.trabajando) await mostrar(d.estado); else await quitar();
    }));
  } else if (d.type === 'asegurar') {
    e.waitUntil(enCola(async () => { if (d.estado) await guardarEstado(d.estado); await asegurar(); }));
  }
});

// Si el usuario la desliza para quitarla y sigue en turno, vuelve a aparecer.
self.addEventListener('notificationclose', e => {
  if (e.notification.tag !== 'turno') return;
  e.waitUntil(enCola(async () => {
    const est = await leerEstado();
    if (est.trabajando && est.fija !== false) await mostrar(est);
  }));
});

self.addEventListener('notificationclick', e => {
  if (e.notification.tag !== 'turno') return;
  const accion = e.action === 'finalizar' ? 'finalizar' : 'abrir';
  e.waitUntil((async () => {
    const lista = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of lista) {
      if ('focus' in c) { await c.focus(); c.postMessage({ type: 'accion', accion }); return; }
    }
    await self.clients.openWindow(accion === 'finalizar' ? './?accion=finalizar' : './');
  })());
});
