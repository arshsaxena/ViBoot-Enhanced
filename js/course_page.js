let reg_no;
let moduleWise = true;

// Sends the message to service worker
const trigger_download = (downloads) => {
	chrome.runtime.sendMessage({
		message: 'course-page-data',
		data: downloads,
	});
};

// Download Link
const get_link = (link_element, reg_no) => {
	if (!link_element) {
		console.error('Invalid link_element:', link_element);
		return null;
	}

	const url = link_element.getAttribute('data-downloadurl'); // Use data-downloadurl for the URL
	if (!url) {
		console.error('URL not found in data-downloadurl attribute.');
		return null;
	}
	const utc = new Date();
	const webadress = window.location.href;

	if (
		webadress.indexOf('vtopcc') === -1 &&
		webadress.indexOf('vitbhopal') === -1
	) {
		// Case: VIT Vellore / Chennai (vtop.vit.ac.in)
		const csrf = document.getElementsByName('_csrf')[0]?.defaultValue || '';
		const params = `authorizedID=${reg_no}&_csrf=${csrf}&x=${encodeURIComponent(
			utc.toUTCString(),
		)}`;
		return `https://vtop.vit.ac.in/vtop/${url.trim()}?${params}`;
	} else if (webadress.indexOf('vitbhopal') !== -1) {
		// Case: VIT Bhopal (vtop.vitbhopal.ac.in)
		const params = `authorizedID=${reg_no}&x=${encodeURIComponent(
			utc.toUTCString(),
		)}`;
		return `https://vtop.vitbhopal.ac.in/vtop/${url.trim()}?${params}`;
	} else {
		// Case: VIT-AP or other using vtopcc.vit.ac.in
		const params = `authorizedID=${reg_no}&x=${encodeURIComponent(
			utc.toUTCString(),
		)}`;
		return `https://vtopcc.vit.ac.in/vtop/${url.trim()}?${params}`;
	}
};

// Link Details
const get_link_details = (link_element, index) => {
	if (link_element.outerText.indexOf('_') === -1) {
		let table_rows = link_element.parentNode.parentNode.parentNode.children;
		let module = table_rows[3].innerText.trim();
		let module_title = table_rows[4].innerText.trim();
		let topic = table_rows[7].innerText.trim();
		let date = table_rows[1].innerText.trim();

		if (module == '') {
			topic = 'Unnamed';
		}

		let title = (link_element.title + '-' + topic + '-' + date).replace(
			/[/:*?"<>|]/g,
			'_',
		);
		let folder_title = module + '-' + module_title;
		let data = {
			url: get_link(link_element, reg_no),
			title: title,
			folder_title: folder_title,
		};
		// console.log(data);
		return data;
	} else {
		let data = {
			url: get_link(link_element, reg_no),
			title: link_element.title + '-',
		};
		// console.log(data);
		return data;
	}
};

let course_details = () => {
	let course_table = document
		.getElementsByTagName('table')[0]
		.querySelectorAll('td');
	let course =
		course_table[8].innerText.trim() +
		'-' +
		course_table[9].innerText.trim();
	let faculty_slot =
		course_table[12].innerText.trim() +
		'-' +
		course_table[13].innerText.trim();
	return { course, faculty_slot };
};

const checkbox_link = (chk) => {
	if (chk.parentNode === null) return [];

	return Array.from(chk.parentNode.children).filter(function (child) {
		return child !== chk;
	});
};

const download_files = (type) => {
	let all_links = Array.from(document.querySelectorAll('.check-input'));
	all_links = all_links
		.filter((link) => type === 'all' || link['checked'])
		.map((link, index) => get_link_details(checkbox_link(link)[0], index));

	const { course, faculty_slot } = course_details();

	return trigger_download({
		link_data: all_links,
		course: course,
		faculty_slot: faculty_slot,
		module_wise: moduleWise,
	});
};

let change_type = (box) => {
	// console.log(box);
	box.target.checked = true;
	// console.log(box);
};

const modify_page = () => {
	const { course, faculty_slot } = course_details();

	// Caution text
	let text_div = document.createElement('div');
	text_div.innerHTML = `<p>*Please disable <span><b>Ask location before each download</b></span> setting in your browser.</p>`;
	text_div.style.color = 'red';
	text_div.style.fontSize = '1rem';
	document
		.getElementsByClassName('table')[2]
		.insertAdjacentElement('beforebegin', text_div);

	let newDiv = document.createElement('div');

	//   /*add buttons at top of the page*/

	//   // Add download all button
	//   let download_all_vtop = document.getElementsByClassName(
	//     "btn btn-md btn-primary btn-block"
	//   )[0];
	//   let download_all_u = download_all_vtop.cloneNode(true);
	//   download_all_u.removeAttribute("href");
	//   download_all_u.name = "download_all_u";
	//   download_all_u.style =
	//     "float: right; width: auto; margin-right: 10px; margin-top: -1px";
	//   download_all_u.onclick = () => download_files("all");
	//   // document.getElementsByClassName("box-title")[0].appendChild(download_all_u);
	//   newDiv.appendChild(download_all_u);

	//   //Add Download selected button
	//   let download_selected_u = download_all_u.cloneNode(true);
	//   download_selected_u.name = "";
	//   download_selected_u.innerHTML =
	//     '<span class="glyphicon glyphicon-download-alt"></span> Download Selected';
	//   download_selected_u.style =
	//     "float: right; width: auto; margin-right: 10px; margin-top: -1px";
	//   download_selected_u.onclick = () => download_files("selected");
	//   // document.getElementsByClassName("box-title")[0].appendChild(download_selected_u);
	//   // document.getElementsByClassName("table-responsive")[1].insertAdjacentElement("beforeend",download_selected_u);
	//   newDiv.appendChild(download_selected_u);

	//   //select all button
	//   const div = document.createElement("div");
	//   div.style =
	//     "float: right; width: auto; margin-top: -1px; margin-right: 25px;";
	//   const select_all_elem = document.createElement("input");
	//   select_all_elem.setAttribute("type", "checkbox");
	//   select_all_elem.setAttribute("id", "select_all");
	//   const select_all_text = document.createElement("label");
	//   select_all_text.innerHTML = "&nbsp;Select All";

	//   div.appendChild(select_all_elem);
	//   div.appendChild(select_all_text);
	//   // document.getElementsByClassName("table")[2].insertAdjacentElement("beforebegin", div);
	//   newDiv.appendChild(div);

	//   //Name for the files to be given
	//   let dropdown_file = document.createElement("select");
	//   dropdown_file.innerHTML = `
	//     <option value="table_name">File name as Lecture topic</option>
	//     <option value="fac_upload_name">File name as uploaded by faculty</option>`;
	//   dropdown_file.style = "float: right; width: auto; margin-right: 25px;";
	//   dropdown_file.id = "drop_file";
	//   // document.getElementsByClassName("table")[2].insertAdjacentElement("beforebegin", dropdown_file);
	//   newDiv.appendChild(dropdown_file);

	//   chrome.storage.sync.set({ file_name: "table_name" });

	//   //Type of selection for check boxes
	//   let dropdown_hover = document.createElement("select");
	//   dropdown_hover.innerHTML = `
	//     <option value="click">Click</option>
	//     <option value="hover">Hover</option>`;
	//   dropdown_hover.style = "float: right; width: auto; margin-right: 25px;";
	//   dropdown_hover.id = "type_drop";
	//   // document.getElementsByClassName("table")[2].insertAdjacentElement("beforebegin", dropdown_hover);
	//   newDiv.appendChild(dropdown_hover);

	/* ADD MODULE-WISE TOGGLE SWITCH */
	let targetElement = document.querySelector(
		'#CoursePageLectureDetail > div:nth-child(11) > div.form-group.col-sm-12.row.mb-3',
	);

	if (targetElement) {
		let toggleWrapper = document.createElement('div');
		toggleWrapper.style.display = 'flex';
		toggleWrapper.style.alignItems = 'center';
		toggleWrapper.style.justifyContent = 'flex-end';
		toggleWrapper.style.marginTop = '5px';

		let toggleLabel = document.createElement('label');
		toggleLabel.innerText = 'Download Module Wise';
		toggleLabel.style.marginRight = '10px';
		toggleLabel.style.fontSize = '14px';
		toggleLabel.style.color = '#333';
		toggleLabel.style.fontWeight = 'bold';

		let toggleCheckbox = document.createElement('input');
		toggleCheckbox.type = 'checkbox';
		toggleCheckbox.checked = true;
		toggleCheckbox.style.width = '18px';
		toggleCheckbox.style.height = '18px';
		toggleCheckbox.style.cursor = 'pointer';

		toggleWrapper.appendChild(toggleLabel);
		toggleWrapper.appendChild(toggleCheckbox);
		targetElement.insertBefore(toggleWrapper, targetElement.firstChild);

		toggleCheckbox.addEventListener('change', () => {
			moduleWise = toggleCheckbox.checked;
			console.log('Module Wise Download:', moduleWise);
		});
	} else {
		console.error(
			'Target element for module-wise toggle switch not found!',
		);
	}

	/*add check boxes to the materials*/

	// Takes the reference material links
	let material = Array.from(document.querySelectorAll('.btn-link'));
	let ref_material = [];
	material.forEach((material_link1) => {
		if (!material_link1.innerHTML.includes('Web Material')) {
			ref_material.push(material_link1);
		}
	});

	ref_material.forEach((elem, index) => {
		elem.addEventListener('click', (event) => {
			event.preventDefault();
			return trigger_download({
				link_data: [get_link_details(elem, index)],
				course,
				faculty_slot,
				module_wise: moduleWise,
			});
		});

		const check = document.createElement('input');
		check.setAttribute('type', 'checkbox');
		check.setAttribute('class', 'check-input');
	});

	let chk_boxes = document.getElementsByClassName('check-input');
	for (let i = 0; i < chk_boxes.length; i++) {
		chk_boxes[i].setAttribute('title', i + 1);
	}
	for (let i = 0; i < ref_material.length; i++) {
		ref_material[i].setAttribute('title', i + 1);
	}

	document
		.getElementsByClassName(
			'table table-bordered table-hover responsive',
		)[0]
		.insertAdjacentElement('beforebegin', newDiv);

	document.getElementById('drop_file').addEventListener('change', () => {
		let file_name_drop = document.getElementById('drop_file').value;
		if (file_name_drop === 'fac_upload_name') {
			chrome.runtime.sendMessage({
				message: 'fac_upload_name',
			});
		} else if (file_name_drop === 'table_name') {
			chrome.runtime.sendMessage({
				message: 'table_name',
			});
		}
	});

	document.getElementById('type_drop').addEventListener('change', () => {
		let checkbox1 = Array.from(document.querySelectorAll('.check-input'));
		let val = document.getElementById('type_drop').value;

		if (val == 'hover') {
			checkbox1.forEach((box) => {
				box.addEventListener('mouseover', change_type);
			});
		} else if (val == 'click') {
			checkbox1.forEach((box, index) => {
				box.removeEventListener('mouseover', change_type);
			});
		}
	});

	select_all_elem.addEventListener('click', () => {
		const checkedValue = document.getElementById('select_all').checked;
		let checkbox = Array.from(document.querySelectorAll('.check-input'));
		checkbox.forEach((boxes) => {
			boxes.checked = checkedValue;
		});
	});

	let footer = document.getElementsByClassName('form-group col-md-4')[2];
	footer.className = 'form-group col-md-6';
	let download_all_d = document.getElementById('backButton').cloneNode(true);
	download_all_d.removeAttribute('href');
	download_all_d.removeAttribute('onclick');
	download_all_d.innerText = 'Download all files';
	download_all_d.style = 'padding:3px 16px;font-size:13px; margin-left:5px;';
	download_all_d.onclick = () => download_files('all');
	footer.appendChild(download_all_d);

	let download_selected_d = download_all_d.cloneNode(true);
	download_selected_d.innerText = 'Download selected files';
	download_selected_d.onclick = () => download_files('selected');
	footer.appendChild(download_selected_d);
};

chrome.runtime.onMessage.addListener((request) => {
	if (request.message === 'course_page_change') {
		try {
			const loader = setInterval(function () {
				if (document.readyState !== 'complete') return;
				clearInterval(loader);
				if (
					document.getElementsByClassName(
						'navbar-text text-light small fw-bold',
					)[0] == undefined
				) {
					reg_no =
						document
							.getElementsByClassName('VTopHeaderStyle')[0]
							.innerText.replace('(STUDENT)', '')
							.trim() || '';
				} else
					reg_no =
						document
							.getElementsByClassName(
								'navbar-text text-light small fw-bold',
							)[0]
							.innerText.replace('(STUDENT)', '')
							.trim() || '';
				if (!document.getElementsByName('download_all_u').length) {
					modify_page();
				}
			}, 500);
		} catch (error) {}
	}
});
