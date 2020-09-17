'use strict'

const parser = new DOMParser
let lastTrack

document.addEventListener('visibilitychange', () => {
	if (!document.hidden) updateContent()
})

window.addEventListener('load', async () => {
	document.getElementById('stream').play()
	document.querySelector('#cover > img').addEventListener('error', ({ target }) => {
		target.src = 'shuffle-logo.png'
		target.alt = 'Shuffle FM'
	})
	updateContent()
	await navigator.serviceWorker.register('/service-worker.js')
})

window.setInterval(updateContent, 5000)

async function updateContent () {
	const icestats = await getIcestats()
	const track = icestats.source.title
	if (track == 'Shuffle FM - Commercial Free Variety') return
	if (track == lastTrack) return
	lastTrack = track
	const { mbid, title } = await getRelease(track)
	document.querySelector('#cover > figcaption').innerHTML = track
	const coverImage = document.querySelector('#cover > img')
	coverImage.src = `https://coverartarchive.org/release/${ mbid }/front-500`
	coverImage.alt = title
}

async function getIcestats () {
	const endpoint = 'https://remote.shufflefm.app:8443/status-json.xsl'
	const response = await fetch(endpoint, { cache: 'no-store' })
	const data = await response.json()
	return data.icestats
}

async function getRelease (track) {
	const endpoint = `https://musicbrainz.org/ws/2/release?query=${ track }&limit=1`
	const response = await fetch(endpoint)
	const text = await response.text()
	const fragment = parser.parseFromString(text, 'text/xml')
	const release = fragment.querySelector('release')
	return {
		mbid: release.getAttribute('id'),
		title: release.querySelector('title').innerHTML
	}
}
