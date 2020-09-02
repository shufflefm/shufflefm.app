'use strict'

const CACHE_ID = '3'
const CACHE_LIST = [
	'/index.html',
	'/main.js',
	'/main.css',
	'/WorkSans.ttf',
	'/WorkSansVariable.ttf'
]

self.addEventListener('install', ({ waitUntil }) => {
	waitUntil(cacheResources())
	self.skipWaiting()
})

self.addEventListener('activate', ({ waitUntil }) => {
	waitUntil(cleanCache())
	self.clients.claim()
})

self.addEventListener('fetch', ({ request, respondWith }) => {
	if (request.mode != 'navigate') return
	respondWith(fetch(request).catch(tryCacheFetch))
})

async function cacheResources () {
	const cache = await caches.open(CACHE_ID)
	cache.addAll(CACHE_LIST)
}

async function cleanCache() {
	const keyList = await caches.keys()
	return Promise.all(keyList.map(purgeOldCaches))
}

function purgeOldCaches (key) {
	if (key != CACHE_ID) return caches.delete(key)
}

async function tryCacheFetch () {
	const cache = await caches.open(CACHE_ID)
	return cache.match(request)
}
