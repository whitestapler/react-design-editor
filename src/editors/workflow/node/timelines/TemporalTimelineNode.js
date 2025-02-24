import { fabric } from 'fabric';
import TimelineNode from './TimelineNode';
import { getEllipsis } from '../../configuration/NodeConfiguration';
import { Port } from '../../../../canvas/objects';

const TemporalTimelineNode = fabric.util.createClass(TimelineNode, {
	initialize(options) {
		options = options || {};
		options.left += 20;
		this.callSuper('initialize', options);
	},
	createFromPort(x, y) {
		const isEven = this.configuration.routes.length % 2 === 0;
		const calcOdd = (port, i) => {
			const centerIndex = Math.ceil(this.configuration.routes.length / 2);
			const index = i + 1;
			let left;
			let leftDiff;
			if (centerIndex === index) {
				left = x;
			} else if (centerIndex > index) {
				left = x - port.width * (centerIndex - index);
				leftDiff = -port.width * (centerIndex - index);
			} else {
				left = x + port.width * (index - centerIndex);
				leftDiff = port.width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		const calcEven = (port, i) => {
			const centerIndex = this.configuration.routes.length / 2;
			const index = i + 1;
			let left;
			let leftDiff;
			if (centerIndex >= index) {
				left = x - port.width / 2 - port.width * (centerIndex - index);
				leftDiff = -(port.width / 2) - port.width * (centerIndex - index);
			} else {
				left = x - port.width / 2 + port.width * (index - centerIndex);
				leftDiff = -(port.width / 2) + port.width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		this.ports = this.configuration.routes.map((outPort, i) => {
			const rect = new fabric.Rect({
				width: 80,
				height: 40,
				fill: 'rgba(0, 0, 0, 0.2)',
				originFill: 'rgba(0, 0, 0, 0.2)',
				hoverFill: 'green',
				rx: 7,
				ry: 7,
			});
			const label = new fabric.Text(getEllipsis(outPort, 7), {
				fontSize: 18,
				lineHeight: 2,
				fontFamily: 'polestar',
				fill: 'rgba(255, 255, 255, 0.8)',
			});
			let coords;
			if (isEven) {
				coords = calcEven(rect, i);
			} else {
				coords = calcOdd(rect, i);
			}
			const portLabel = new fabric.Group([rect, label], {
				id: outPort,
				width: 80,
				height: 40,
				rx: 7,
				ry: 7,
				left: coords.left,
				top: y + 20,
				leftDiff: coords.leftDiff,
				topDiff: 20,
				fill: 'rgba(0, 0, 0, 0.1)',
				originX: 'center',
				originY: 'center',
			});
			label.set({
				top: rect.top + 10,
				left: rect.center().x,
			});
			return portLabel;
		});
		this.ports.forEach(port => {
			this.addWithUpdate(port);
			port.setCoords();
		});
		this.fromPort = this.ports.map((port, i) => {
			let coords;
			if (isEven) {
				coords = calcEven(port, i);
			} else {
				coords = calcOdd(port, i);
			}
			port.fromPort = new Port({
				id: port.id,
				type: 'fromPort',
				left: coords.left,
				angle: 180,
				top: y + port.height,
				leftDiff: coords.leftDiff,
				width: 10,
				height: 10,
				...this.fromPortOption(),
			});
			return port.fromPort;
		});
		return this.fromPort;
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		const clonedObj = new TemporalTimelineNode(options);
		return clonedObj;
	},
});

TemporalTimelineNode.fromObject = function(options, callback) {
	return callback(new TemporalTimelineNode(options));
};

window.fabric.TemporalTimelineNode = TemporalTimelineNode;

export default TemporalTimelineNode;
