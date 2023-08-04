function parseHOCR(hocrDocument) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(hocrDocument, 'text/html');
	const hocrData = [];

	function parseElement(element) {
		const elementData = {
			type: element.classList.contains('ocrx_word') ? 'word' :
				  element.classList.contains('ocr_line') ? 'line' :
				  element.classList.contains('ocr_par') ? 'paragraph' : 'other',
			boundingBox: element.getAttribute('title') ? element.getAttribute('title').match(/bbox (\d+)\s+(\d+)\s+(\d+)\s+(\d+)/) : null,
			text: element.classList.contains('ocrx_word') ? element.textContent.trim() : ''
		};

		if (elementData.boundingBox) {
			const [x1, y1, x2, y2] = elementData.boundingBox.slice(1).map(parseFloat);
			elementData.x1 = x1;
			elementData.y1 = y1;
			elementData.x2 = x2;
			elementData.y2 = y2;
			hocrData.push(elementData);
		}
		for (const childElement of element.children) {
			parseElement(childElement);
		}
	}
	parseElement(doc.body);
	return hocrData;
}

function visualizeHOCR(hocrData) {
	const hocrContainer = document.getElementById('hocrContainer');
	hocrContainer.innerHTML = ''; // Clear previous content

	hocrData.forEach((data) => {
		const { type, boundingBox, text } = data;
		if (!boundingBox) return; // Skip elements without bounding box
		const [x1, y1, x2, y2] = boundingBox.slice(1).map(parseFloat);
		const hocrElement = document.createElement('div');
		hocrElement.textContent = text;
		hocrElement.className = `hocr-${type}`;
		hocrElement.style.left = `${x1}px`;
		hocrElement.style.top = `${y1}px`;
		hocrElement.style.width = `${x2 - x1}px`;
		hocrElement.style.height = `${y2 - y1}px`;
		hocrContainer.appendChild(hocrElement);
	});
}

function handleHOCRFile(event) {
	const file = event.target.files[0];
	const reader = new FileReader();

	reader.onload = function (e) {
		const hocrContent = e.target.result;
		const hocrData = parseHOCR(hocrContent);
		visualizeHOCR(hocrData);
	};
	reader.readAsText(file);
}

function handleOpenImage() {
	const imageInput = document.createElement('input');
	imageInput.type = 'file';
	imageInput.accept = 'image/*';
	imageInput.addEventListener('change', function (event) {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = function (e) {
			const image = document.getElementById('image');
			image.onload = function () {
				const hocrContainer = document.getElementById('hocrContainer');
				hocrContainer.style.width = `${image.width}px`;
				hocrContainer.style.height = `${image.height}px`;
			};
			image.src = e.target.result;
		};
		reader.readAsDataURL(file);
	});
	imageInput.click();
}

const hocrInput = document.getElementById('hocrInput');
hocrInput.addEventListener('change', handleHOCRFile);

const openImageBtn = document.getElementById('openImageBtn');
openImageBtn.addEventListener('click', handleOpenImage);

const toggleWordsBtn = document.getElementById('toggleWordsBtn');
const toggleLinesBtn = document.getElementById('toggleLinesBtn');
const toggleParagraphsBtn = document.getElementById('toggleParagraphsBtn');

function toggleElementVisibility(className) {
	const elements = document.getElementsByClassName(className);
	for (const element of elements) {
		element.style.display = element.style.display === 'none' ? 'block' : 'none';
	}
}

function toggleTextContentVisibility() {
	const wordElements = document.getElementsByClassName('hocr-word');
	for (const element of wordElements) {
		element.style.color = element.style.color === 'black' ? '' : 'black';
	}
}

toggleTextBtn.addEventListener('click', function () {
	toggleTextContentVisibility();
});

const toggleImageBtn = document.getElementById('toggleImageBtn');
const imageElement = document.getElementById('image');

toggleImageBtn.addEventListener('click', function () {
    imageElement.style.display = imageElement.style.display === 'none' ? 'block' : 'none';
});