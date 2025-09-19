let course = '';
let faculty_slot = '';
let file_name = {};
let time_last = new Date();
let det_file_name = 'table_name';

chrome.runtime.onMessage.addListener((request) => {
	if (request.message === 'table_name') {
		det_file_name = 'table_name';
	}
	if (request.message === 'fac_upload_name') {
		det_file_name = 'fac_upload_name';
	}
});

let set_time_last = (time) => {
	time_last = time;
};

const returnMessage = (MessageToReturn) => {
	chrome.tabs.query({ active: true }, (tab) => {
		let i;
		for (i = 0; i < tab.length; i++) {
			if (tab[i].url.includes('vtop')) {
				break;
			}
		}

		chrome.tabs.sendMessage(tab[i].id || 0, {
			message: MessageToReturn,
		});
	});
};

const trigger_download = (request) => {
	course = request.message.course;
	faculty_slot = request.message.faculty_slot;
	request.message.link_data.forEach((link) => {
		file_name[link.url] = link.title;

		chrome.downloads.download(
			{
				url: link.url,
			},
			function (downloadId) {
				chrome.downloads.search({ id: downloadId }, function (results) {
					var downloadItem = results[0];
				});
			},
		);
	});
};

const get_file_name = (fname, url) => {
	let title = '';
	let file_extension = fname.replace(/([^_]*_){8}/, '').split('.');
	file_extension = '.' + file_extension[file_extension.length - 1];
	// Splits after the fifth occurence of '_'
	if (det_file_name === 'table_name') {
		let file_prefix = file_name[url] || '';
		// file_prefix = file_prefix.replace(/(\r\n|\n|\r)/gm, " ");
		file_prefix = file_prefix.split('\n')[0];
		if (file_prefix.length < 4) {
			let index = file_name[url] || '';
			index = index.split('-')[0] + '-';
			let file_prefix = fname.split('_');
			// console.log(file_prefix);
			for (let i = 8; i < file_prefix.length; i++) {
				title += file_prefix[i];
				title += ' ';
			}
			title =
				index +
				title.split('.')[0] +
				'-' +
				file_prefix[7] +
				file_extension;
		} else {
			title = file_prefix + file_extension;
		}
	} else if (det_file_name === 'fac_upload_name') {
		let index = file_name[url] || '';
		index = index.split('-')[0] + '-';
		let file_prefix = fname.split('_');
		// console.log(file_prefix);
		for (let i = 8; i < file_prefix.length; i++) {
			title += file_prefix[i];
			title += ' ';
		}
		title =
			index + title.split('.')[0] + '-' + file_prefix[7] + file_extension;
	}
	if (title.indexOf('undefined') != -1) {
		title = fname;
	}
	return title;
};

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
	if (item.url.indexOf('vtop') !== -1) {
		const title = get_file_name(item.filename, item.url);
		if (course != '' && faculty_slot != '')
			suggest({
				filename:
					'VIT Downloads/' +
					course.replace(':', '') +
					'/' +
					faculty_slot +
					'/' +
					title,
			});
		else suggest({ filename: 'VIT Downloads/Other Downloads/' + title });
	}
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

chrome.webRequest.onCompleted.addListener(
	async (details) => {
		let link = details['url'];
		time_last = new Date();
		set_time_last(time_last);
		if (link.indexOf('doStudentMarkView') !== -1) {
			returnMessage('mark_view_page');
		} else if (
			link.indexOf('processViewStudentAttendance') !== -1 ||
			link.indexOf('processBackAttendanceDetails') !== -1
		) {
			returnMessage('view_attendance');
		} else if (
			link.indexOf('vtop/assets/img/favicon.ico') !== -1 ||
			link.indexOf('menu.js') !== -1 ||
			link.indexOf('home') !== -1
		) {
			if (link.indexOf('menu.js') !== -1) await sleep(3500);
			returnMessage('nav_bar_change');
		} else if (link.indexOf('processViewStudentCourseDetail') !== -1) {
			returnMessage('course_page_change');
		} else if (link.indexOf('vtopcc.vit.ac.in/vtop/vtopLogin') !== -1) {
			returnMessage('vtopcc_captcha');
		} else if (
			link.indexOf('vtop/doLogin') !== -1 ||
			link.indexOf('assets/img/favicon.png') !== -1 ||
			link.indexOf('goHomePage') !== -1
		) {
			returnMessage('vtopcc_nav_bar');
		} else if (link.indexOf('doSearchExamScheduleForStudent') !== -1) {
			returnMessage('exam_schedule');
		} else if (link.indexOf('processViewTimeTable') !== -1) {
			returnMessage('time_table');
		}
	},
	{
		urls: [
			'*://vtop.vit.ac.in/*',
			'*://vtopcc.vit.ac.in/vtop/*',
			'*://vtop.vitbhopal.ac.in/vtop/*',
		],
	},
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	try {
		if (request.message.course !== '') trigger_download(request);
	} catch {
		if (request.message == 'login') {
			chrome.identity.getAuthToken(
				{ interactive: true },
				(auth_token) => {
					chrome.storage.sync.set({ token: auth_token });
					if (auth_token) {
						chrome.identity.getProfileUserInfo((userInfo) => {
							let email = userInfo.email;
							chrome.notifications.create('Sign In', {
								type: 'basic',
								iconUrl: './../assets/icons/img_128.png',
								title: 'Sign In',
								message: `You are successfully signed in with ${email}`,
							});
						});
						sendResponse(true);
					}
					return true;
				},
			);
		} else if (request.message === 'logout') {
			user_signed_in = false;
			chrome.storage.sync.get(['token'], (token) => {
				chrome.identity.removeCachedAuthToken(
					{ token: token.token },
					() => {
						chrome.storage.sync.set({ token: null });
					},
				);
			});
			chrome.notifications.create('Sign Out', {
				type: 'basic',
				iconUrl: './../assets/icons/img_128.png',
				title: 'Sign Out',
				message: 'Signed out from google',
			});
		}
	}
});

chrome.alarms.create({ periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(() => {
	let a;
	let time_nw = new Date();
});
