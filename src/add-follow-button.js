import browser from 'webextension-polyfill';

function htmlToElement(html) {
	const template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
}
function foundSocialList(response, container) {
	const potentialSocial = container.querySelector('#social-list li:last-child')
	let buttonContainer;
	if (potentialSocial !== null) {
		buttonContainer = potentialSocial;
	} else {
		buttonContainer = container.querySelector('h2');
	}
	if (!response) {
		const button = htmlToElement('<button class="ml-2 border-2 rounded border-blue-500 p-2">Add To Extension</button>');
		const onClick = () => {
			button.removeEventListener('click', onClick);
			button.textContent = 'Wait...';
			browser.runtime.sendMessage({
				type: 'follow',
				data: {
					url: window.location.href
				},
			}).then((response) => {
				console.log(response);
				return button.textContent = 'Done!';
			}).catch((reason) => {
				console.error('[foundSocialList]', reason);
				return button.textContent = 'Failed...';
			}).then(() => {
				setTimeout(() => {
					button.remove();
					waitForContainer();
				}, 3000)
			}, console.trace);
		};
		button.addEventListener('click', onClick);
		buttonContainer.after(button);
	} else {
		const button = htmlToElement('<button class="ml-2 border-2 rounded border-red-700 p-2">Remove From Extension</button>');
		const onClick = () => {
			button.removeEventListener('click', onClick);
			button.textContent = 'Wait...';
			browser.runtime.sendMessage({
				type: 'unfollow',
				data: {
					url: window.location.href
				},
			}).then((response) => {
				console.log(response);
				return button.textContent = 'Done!';
			}).catch((reason) => {
				console.error('[foundSocialList]', reason);
				return button.textContent = 'Failed...';
			}).then(() => {
				setTimeout(() => {
					button.remove();
					waitForContainer();
				}, 3000)
			}, console.trace);
		};
		button.addEventListener('click', onClick);
		buttonContainer.after(button);

	}
}

function waitForContainer() {
	let container = document.querySelector('.user-content');
	if (container === null) {
		setTimeout(waitForContainer, 100);
	} else {
		console.log('trying to send message');
		browser.runtime.sendMessage({
			type: 'getStatus',
			data: {
				url: window.location.href
			},
		}).then((response) => {
			console.log('got response', response);
			console.log(container);
			foundSocialList(response, container);
		});
	}
}

function init() {
	if (window.addFollowButton) {
		return;
	}
	window.addFollowButton = true;
	// If a webpage has an owncast-video-container, its propably an owncast instance
	const timeouts = {};
	const onTimeout = () => {
		console.log('check for owncast video container');
		if (document.getElementsByClassName('owncast-video-container').length < 1) {
			console.log('no video container');
			return;
		}
		clearTimeout(timeouts.thousendfivehundered);
		console.log('found video container');
		waitForContainer();

	}
	timeouts.threehundered = setTimeout(onTimeout, 300);
	timeouts.thousendfivehundered = setTimeout(onTimeout, 1500);
}

init();
