function parseHOCR(hocrDocument) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(hocrDocument, 'text/html');
	const hocrData = [];

	function parseElement(element) {
		const elementData = {
			type: element.classList[0],
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
		hocrElement.className = type;
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

		// Load any image with the same base filename as the .hocr file
		const filename = file.name;
		const hocrBaseFilename = filename.replace(/\.[^/.]+$/, ''); // Remove extension
		loadImageWithMatchingBaseFilename(hocrBaseFilename);
	};
	reader.readAsText(file);
}

function loadImageWithMatchingBaseFilename(hocrBaseFilename) {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.svg'];
	const imageElement = document.getElementById('image');
	let imageLoaded = false;

	function loadNextImage(index) {
		if (index >= imageExtensions.length) {
			// If no matching image found, display default "No image selected" message
			imageElement.src = '';
			return;
		}

		const imageFilename = `${hocrBaseFilename}${imageExtensions[index]}`;
		const image = new Image();
		image.onload = function () {
			const hocrContainer = document.getElementById('hocrContainer');
			hocrContainer.style.width = `${image.width}px`;
			hocrContainer.style.height = `${image.height}px`;
			imageElement.src = image.src;
			imageLoaded = true;
		};
		image.onerror = function () {
			if (!imageLoaded) {
				loadNextImage(index + 1);
			}
		};
		image.src = imageFilename;
	}

	loadNextImage(0);
}

const hocrInput = document.getElementById('hocrInput');
hocrInput.addEventListener('change', handleHOCRFile);

function toggleElementVisibility(className) {
	const elements = document.getElementsByClassName(className);
	for (const element of elements) {
		element.style.display = element.style.display === 'none' ? 'block' : 'none';
	}
}

function toggleTextContentVisibility() {
	const wordElements = document.getElementsByClassName('ocrx_word');
	for (const element of wordElements) {
		element.style.color = element.style.color === 'black' ? '' : 'black';
	}
}

const imageElement = document.getElementById('image');

function toggleImageVisibility() {
	imageElement.style.display = imageElement.style.display === 'none' ? 'block' : 'none';
}
