
import React from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import './sortable.scss';
import _ from 'lodash';
const env = {
	ie: window.navigator.userAgent.match(/ie\s/i), 
};
const vendor = env.ie ? 'ms' : 'webkit';
const transition = 500;
const event = {
	start: [
		'mousedown', 
		'touchstart', 
	],
	end: [
		'mouseup', 
		'touchend', 
		'touchcancel', 
	],
	move: [
		'mousemove', 
		'touchmove', 
	],
};
const dom = node => ({
	on: (e, cb, b) => arr(e).map(e => node.addEventListener(e, cb, b)), 
	off: (e, cb, b) => arr(e).map(e => node.removeEventListener(e, cb, b)), 
	hittest: (x, y) => rect(node.getBoundingClientRect()).hittest(x, y), 
	find: callback => [].filter.call(node.getElementsByTagName('*'), callback), 
	closest: callback => 
	{
		for (let el = node; el; el = el.parentElement)
		{
			if (callback(el)) return el;
		}
	}, 
});
const arr = a => Array.isArray(a) ? a : [a];
const rect = r => ({ hittest:(x,y)=>r.left<=x&&x<=r.right&&r.top<=y&&y<=r.bottom });

const Sortable = class extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			items: [ ...this.props.items ], 
		};
		this.selected = [];
	}
	dom = () => 
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{
		this.container = env.ie 
			? document.documentElement
			: document.body
		;
		this.scroller = scroller(this.container);
		dom(this.dom()).on(event.start, this.start, true);
		dom(document).on(event.end, this.end, true);

		dom(this.dom()).on('contextmenu', e => e.preventDefault());
	}

	componentWillUnmount = () =>
	{
		dom(this.dom()).off(event.start, this.start, true);
		dom(document).off(event.end, this.end, true);
		dom(document).off(event.move, this.move, true);
	}
	click = e => 
	{
		const node = dom(e.target).closest(node => node.sortable);
		if (!_.find(this.selected, n => n === node))
		{
			this.selected.push(node);
			node.classList.add('is-selected');
		}
	}
	start = e => 
	{
		if (e.button === 2) return this.click(e);

		this.nodes = dom(this.dom()).find(node => node.sortable);
		this.node = dom(e.target).closest(node => node.sortable);
		if (!this.node) return;

		e.preventDefault();

		const { index } = this.node.sortable;
		this.index = index;

		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		this.latest = { x, y };

		let el = document.createElement('div');
		this.node.rect = this.node.getBoundingClientRect();
		el.style.position = 'fixed';
		el.style.zIndex   = 100;
		el.style.left     = `${this.node.rect.left}px`;
		el.style.top      = `${this.node.rect.top}px`;
		el.style.width    = `${this.node.rect.width}px`;
		el.classList.add('box', 'is-small');
		this.moving = document.body.appendChild(el);
		this.moving.appendChild(this.node.cloneNode(true));

		this.dom().rect = this.dom().getBoundingClientRect();

		el = document.createElement('div');
		el.style.position = 'fixed';
		el.style.left     = `${this.dom().rect.left}px`;
		el.style.top      = `${this.node.rect.top}px`;
		el.style.width    = `${this.dom().rect.width}px`;
		el.style.background = '#ccc';
		el.style.opacity  = 0.5;
		el.classList.add('box', 'is-small');
		this.target = document.body.appendChild(el);
		this.target.rect = this.target.getBoundingClientRect();
		this.target.style[`${vendor}TransitionDuration`] = `${transition}ms`;


		(a => a.map(node => node.rect = node.getBoundingClientRect()))([
			this.node, 
			this.moving, 
		]);

		dom(document).on(event.move, this.move, true);
	}
	move = e => 
	{
		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		const delta = { x, y };
		delta.x -= this.latest.x;
		delta.y -= this.latest.y;

		const pos = y;
		const min = 0;
		const max = window.innerHeight;
		const overflow = ((a,b,c)=>a>b?-(a-b):(b>c?(b-c):0))(min, pos, max);
		const deccelator = 20;

		this.scroller.stop();
		if (overflow)
		{
			this.scroller.scroll(overflow / deccelator);
		}

		this.moving.style[`${vendor}Transform`] = `translate3d(
			${delta.x}px,
			${delta.y}px,
			0)`
		;

		this.node.style.visibility = 'hidden';

		this.newIndex = null;

		this.moving.rect = this.moving.getBoundingClientRect();
		
		this.nodes.every((node, index) =>
		{
			
			let translate = 0;

			if (index > this.index)
			{
				translate -= this.node.rect.height;
			}

			node.style[`${vendor}Transform`] = `translate3d(0,${translate}px,0)`;
			node.style[`${vendor}TransitionDuration`] = `${transition}ms`;
			
			node.rect = node.getBoundingClientRect();


			if (node.rect.bottom < this.moving.rect.top)
			{
				this.newIndex = index + 1;
			}

			return true;
		});
		if (this.newIndex)
		{
			const before = this.nodes[this.newIndex - 1];
			const after = this.nodes[this.newIndex];
			const top = before === undefined ? 0 : before.rect.bottom;

			const translate = top - this.target.rect.top;
			this.target.style[`${vendor}Transform`] = `translate3d(0,${translate}px,0)`;
		}
	}
	end = e => 
	{
		dom(document).off(event.move, this.move, true);
		
		this.scroller.stop();
		
		if (this.moving)
		{
			document.body.removeChild(this.moving);
			this.moving = null;
		}
		if (this.target)
		{
			document.body.removeChild(this.target);
			this.target = null;
		}
		if (this.node)
		{
			this.node.style.visibility = '';
			this.node = null;
		}
		(this.nodes||[]).every(node =>
		{
			node.style[`${vendor}Transform`] = '';
			node.style[`${vendor}TransitionDuration`] = '';
			return true;
		});

		if (this.newIndex)
		{
			const items = [ ...this.state.items ];
			const value = items[this.index];
			items.splice(this.index, 1);
			items.splice(this.newIndex - (this.newIndex > this.index ? 1 : 0), 0, value);
			this.setState({ items });
			this.newIndex = null;
		}
	}

	render = () =>
	{
		return (
			<div className="sortable box is-small">
			{this.state.items.map((value, index) =>
				<SortableItem value={value} index={index} key={index}/>
			)}
			</div>
		);
	}
};
const SortableItem = class extends React.Component
{
	dom = () => 
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{
		const { value, index } = this.props;
		this.dom().sortable = { value, index };
		this.dom().style.cursor = 'pointer';
	}
	render = () =>
	{
		return (
			<div className="sortable-item box is-small">
				{this.props.value}
			</div>
		);
	}
};
const scroller = container => new Scroller(container);
class Scroller 
{
	constructor(container)
	{
		this.container = container;
	}
	scroll = (scroll) =>
	{
		this.stop();
		this.interval = setInterval(() =>
		{
			this.container.scrollTop += scroll;
		}, 5);
	}
	stop = () =>
	{
		if (this.interval)
		{
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}
export default Sortable;