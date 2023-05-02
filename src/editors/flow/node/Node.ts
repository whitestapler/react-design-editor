import color from 'color';
import { fabric } from 'fabric';
import i18next from 'i18next';
import { uuid } from 'uuidv4';

import { FabricObject, CirclePort } from '../../../canvas';
import { LinkObject } from '../../../canvas/objects/Link';
import Port, { PortObject } from '../../../canvas/objects/Port';

export const NODE_COLORS = {
	TRIGGER: {
		fill: 'rgb(200,200,200)',
		border: 'rgb(100, 100,100)',
	},
	LOGIC: {
		fill: 'rgb(200,200,200)',
		border: 'rgb(100, 100,100)',
	},
	POINTSPAN: {
		fill: 'rgb(200,200,200)',
		border: 'rgb(100, 100,100)',
	},
	ACTION: {
		fill: 'rgb(200,200,200)',
		border: 'rgb(100, 100,100)',
	},
};

export const OUT_PORT_TYPE = {
	SINGLE: 'SINGLE',
	STATIC: 'STATIC',
	DYNAMIC: 'DYNAMIC',
	BROADCAST: 'BROADCAST',
	NONE: 'NONE',
};

export const DESCRIPTIONS = {
	script: i18next.t('common.name'),
	template: i18next.t('common.name'),
	json: i18next.t('common.name'),
	cron: i18next.t('common.name'),
};

export const getEllipsis = (text: string, length: number) => {
	if (!length) {
		return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
			? text.length > 8
				? text.substring(0, 8).concat('...')
				: text
			: text.length > 15
			? text.substring(0, 15).concat('...')
			: text;
	}
	return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
		? text.length > length / 2
			? text.substring(0, length / 2).concat('...')
			: text
		: text.length > length
		? text.substring(0, length).concat('...')
		: text;
};

export type NodeType = 'TRIGGER' | 'LOGIC' | 'POINTSPAN' | 'ACTION';

export interface NodeObject extends FabricObject<fabric.Group> {
	errorFlag?: fabric.IText;
	label?: fabric.Text;
	toPort?: PortObject;
	errors?: any;
	fromPort?: PortObject[];
	descriptor?: Record<string, any>;
	nodeClazz?: string;
	configuration?: Record<string, any>;
	defaultPortOption?: () => Partial<PortObject>;
	toPortOption?: () => Partial<PortObject>;
	fromPortOption?: () => Partial<PortObject>;
	createToPort?: (left: number, top: number) => PortObject;
	createFromPort?: (left: number, top: number) => PortObject[];
	singlePort?: (portOption: Partial<PortObject>) => PortObject[];
	staticPort?: (portOption: Partial<PortObject>) => PortObject[];
	dynamicPort?: (portOption: Partial<PortObject>) => PortObject[];
	broadcastPort?: (portOption: Partial<PortObject>) => PortObject[];
	setErrors?: (errors: any) => void;
	duplicate?: () => NodeObject;
}

const Node = fabric.util.createClass(fabric.Group, {
	type: 'node',
	superType: 'node',
	initialize(options: any) {
		options = options || {};
		const icon = new fabric.IText(options.icon || '\uE174', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 20,
			fill: options.stroke,
		});
		let name = 'Default Node';
		if (options.name) {
			name = getEllipsis(options.name, 18);
		}
		this.label = new fabric.Text(name || 'Default Node', {
			fontSize: 16,
			fontFamily: 'polestar',
			fontWeight: 500,
			fill: 'rgba(255, 255, 255, 0.8)',
		});
		const rect = new fabric.Rect({
			rx: 10,
			ry: 10,
			width: 200,
			height: 40,
			fill: options.fill || 'rgba(0, 0, 0, 0.3)',
			stroke: options.stroke || 'rgba(0, 0, 0, 0)',
			strokeWidth: 2,
		});
		this.errorFlag = new fabric.IText('\uf071', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 14,
			fill: 'rgba(255, 0, 0, 0.8)',
			visible: options.errors,
		});
		const node = [rect, icon, this.label, this.errorFlag];
		const option = Object.assign({}, options, {
			id: options.id || uuid(),
			width: 200,
			height: 40,
			originX: 'left',
			originY: 'top',
			hasRotatingPoint: false,
			hasControls: false,
			borderColor: '#08979c',
		});
		this.callSuper('initialize', node, option);
		icon.set({
			top: icon.top + 10,
			left: icon.left + 10,
		});
		this.label.set({
			top: this.label.top + this.label.height / 2 + 3,
			left: this.label.left + 37,
		});
		this.errorFlag.set({
			left: rect.left,
			top: rect.top,
			visible: options.errors,
		});
	},
	toObject() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			id: this.get('id'),
			name: this.get('name'),
			icon: this.get('icon'),
			description: this.get('description'),
			superType: this.get('superType'),
			configuration: this.get('configuration'),
			nodeClazz: this.get('nodeClazz'),
			descriptor: this.get('descriptor'),
			borderColor: this.get('borderColor'),
			borderScaleFactor: this.get('borderScaleFactor'),
			dblclick: this.get('dblclick'),
			deletable: this.get('deletable'),
			cloneable: this.get('cloneable'),
			fromPort: this.get('fromPort'),
			toPort: this.get('toPort'),
		});
	},
	defaultPortOption() {
		const { type }: { type: NodeType } = this.descriptor as any;
		const fill = color('#718096')
			.lighten(0.2)
			.toString();
		return {
			nodeId: this.id,
			hasBorders: false,
			hasControls: false,
			hasRotatingPoint: false,
			selectable: false,
			originX: 'center',
			originY: 'center',
			lockScalingX: true,
			lockScalingY: true,
			superType: 'port',
			fill,
			originFill: fill,
			hoverFill: fill,
			selectFill: fill,
			hoverCursor: 'pointer',
			strokeWidth: 2,
			stroke: this.descriptor ? NODE_COLORS[type].border : 'rgba(0, 0, 0, 1)',
			radius: 6,
			width: 10,
			height: 10,
			links: [] as LinkObject[],
			enabled: true,
		};
	},
	toPortOption() {
		return {
			...this.defaultPortOption(),
		};
	},
	fromPortOption() {
		return {
			...this.defaultPortOption(),
			angle: 45,
		};
	},
	createToPort(left: number, top: number) {
		if (this.descriptor.inEnabled) {
			this.toPort = new CirclePort({
				id: 'defaultInPort',
				type: 'toPort',
				...this.toPortOption(),
				left,
				top,
			});
		}
		return this.toPort;
	},
	createFromPort(left: number, top: number) {
		if (this.descriptor.outPortType === OUT_PORT_TYPE.BROADCAST) {
			this.fromPort = this.broadcastPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.STATIC) {
			this.fromPort = this.staticPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC) {
			this.fromPort = this.dynamicPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.NONE) {
			this.fromPort = [];
		} else {
			this.fromPort = this.singlePort({ ...this.fromPortOption(), left, top });
		}
		return this.fromPort;
	},
	singlePort(portOption: any) {
		const fromPort = new Port({
			id: 'defaultFromPort',
			type: 'fromPort',
			...portOption,
		});
		return [fromPort];
	},
	staticPort(portOption: any) {
		return this.descriptor.outPorts.map((outPort: any, i: number) => {
			return new Port({
				id: outPort,
				type: 'fromPort',
				...portOption,
				left: i === 0 ? portOption.left - 40 : portOption.left + 40,
				top: portOption.top,
				leftDiff: i === 0 ? -40 : 40,
				fill: i === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)',
				originFill: i === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)',
			});
		});
	},
	dynamicPort(_portOption: any): any[] {
		return [];
	},
	broadcastPort(portOption: any) {
		return this.singlePort(portOption);
	},
	setErrors(errors: any) {
		if (errors) {
			this.errorFlag.set({
				visible: true,
			});
		} else {
			this.errorFlag.set({
				visible: false,
			});
		}
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		return new Node(options);
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

Node.fromObject = (options: NodeObject, callback: (obj: NodeObject) => any) => {
	return callback(new Node(options));
};

// @ts-ignore
window.fabric.FromPort = Port;

// @ts-ignore
window.fabric.ToPort = Port;

// @ts-ignore
window.fabric.Node = Node;

export default Node;
