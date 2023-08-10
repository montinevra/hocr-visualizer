import re
import sys
import xml.etree.ElementTree as ET
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel, QScrollArea 
from PyQt6.QtGui import QPixmap 
from PIL import Image, ImageDraw


class HOCRVisualizer(QMainWindow):
	def __init__(self, image_path, element_data):
		super().__init__()

		self.image = Image.open(image_path)
		self.draw = ImageDraw.Draw(self.image)

		for element in element_data:
			bounding_box = element['bounding_box']
			self.draw.rectangle(bounding_box, outline='red', width=2)

		self.init_ui()

	def init_ui(self):
		image_qt = self.image.toqpixmap().toImage()
		pixmap = QPixmap.fromImage(image_qt)

		label = QLabel(self)
		label.setPixmap(pixmap)

		scroll_area = QScrollArea()
		scroll_area.setWidgetResizable(True)
		scroll_area.setWidget(label)
		self.setCentralWidget(scroll_area)

		self.setGeometry(100, 100, 800, 600)
		self.setWindowTitle("HOCR Visualization")


def parse_hocr_elements(hocr_path):
	tree = ET.parse(hocr_path)
	root = tree.getroot()
	namespace = "{http://www.w3.org/1999/xhtml}"  # Default namespace for the entire document
	element_data = []

	for element in root.iter():
		element_name = element.tag.replace(namespace, '')  # Remove the namespace from the tag name
		element_class = element.get('class', '')
		element_id = element.get('id', '')
		title = element.get('title', '')
		content = element.text.strip() if element.text else ''
		if title:
			bbox_match = re.search(r'bbox (\d+) (\d+) (\d+) (\d+)', title)
			if bbox_match:
				x1, y1, x2, y2 = map(int, bbox_match.groups())
				bounding_box = ((x1, y1), (x2, y2))
				element_data.append({
					'element_name': element_name,
					'class': element_class,
					'id': element_id,
					'bounding_box': bounding_box,
					'content': content
				})
	return element_data


def main():
	if len(sys.argv) != 3:
		print("Usage: python script.py <hocr_file> <image_file>")
		sys.exit(1)
	hocr_path = sys.argv[1]
	image_path = sys.argv[2]
	element_data = parse_hocr_elements(hocr_path)

	app = QApplication(sys.argv)

	main_window = HOCRVisualizer(image_path, element_data)
	main_window.show()

	sys.exit(app.exec())


if __name__ == "__main__":
	main()



