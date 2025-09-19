let login = document.getElementById('login');
let logout = document.getElementById('logout');

logout.style.display = 'none';
login.addEventListener('click', () => {
	chrome.runtime.sendMessage({
		message: 'login',
	});
	window.close();
});

logout.addEventListener('click', () => {
	chrome.runtime.sendMessage({
		message: 'logout',
	});
	window.close();
});

chrome.storage.sync.get(['token'], (token) => {
	if (token.token != null) {
		login.style.display = 'none';
		logout.style.display = '';
	} else {
		login.style.display = '';
		logout.style.display = 'none';
	}
});
