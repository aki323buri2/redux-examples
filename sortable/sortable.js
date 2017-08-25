import React from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
const ie10 = window.navigator.userAgent.match(/ie\s10/i);
const vendor = window.navigator.userAgent.match(/ie\s/i) ? 'ms' : 'webkit';
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
const arr = a => Array.isArray(a) ? a : [a];
const rect = r => ({hittest:(x,y)=>r.left<=x&&x<=r.right&&r.top<=y&&y<=r.bottom});
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
const Sortable = class extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			items: [ ...this.props.items ], 
		};
	}
	dom = () =>
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{

		dom(this.dom()).on(event.start, this.start, true);
		dom(document).on(event.end, this.end, true);
	}
	componentWillUnmount = () =>
	{
		dom(this.dom()).off(event.start, this.start, true);
		dom(document).off(event.end, this.end, true);
		dom(document).off(event.move, this.move, true);
	}
	start = e =>
	{
		e.preventDefault();

		return e.button === 2 ? this.select(e) : this.moveStart(e);
	}
	moveStart = e =>
	{

		this.node = dom(e.target).closest(node => node.sortable);
		if (!this.node) return;

		this.nodes = dom(this.dom()).find(node => node.sortable);
		if (!this.nodes) return;

		this.index = this.node.sortable.index;

		const { left, top, width, height } = this.node.getBoundingClientRect();
		const clone = this.node.cloneNode(true);
		clone.style.left = `${left}px`;
		clone.style.top = `${top}px`;
		clone.style.width = `${width}px`;
		clone.style.height = `${height}px`;
		clone.style.position = 'fixed';
		clone.style.zIndex = 100;
		this.moving = document.body.appendChild(clone);

		this.node.style.visibility = 'hidden';

		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		this.latest = { x, y };

		dom(document).on(event.move, this.move, true);
	}
	move = e =>
	{
		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		const delta = { x, y };
		delta.x -= this.latest.x;
		delta.y -= this.latest.y;
		this.moving.style[`${vendor}Transform`] = `translate3d(
			${delta.x}px,
			${delta.y}px,
			0)`;

		const { left, top, width, height } = this.moving.getBoundingClientRect();
		const position = top + height / 2;

		const scroll = {};
		scroll.container = ie10 ? document.documentElement : document.body;
		scroll.min = 0;
		scroll.max = window.innerHeight;
		scroll.accelarator = 5;

		scroll.overflow = ((a, b, c) => a > b ? -(a - b) : (b > c ? (b - c) : (0)))(
			scroll.min, 
			position, 
			scroll.max, 
		);

		if (this.scrollInterval)
		{
			clearInterval(this.scrollInterval);
			this.scrollInterval = null;
		}
		if (scroll.overflow)
		{
			this.scrollInterval = setInterval(() =>
			{
				scroll.container.scrollTop += scroll.overflow / height * scroll.accelarator
				
			}, 5);
		}

		this.newIndex = null;
		this.moving.rect = this.moving.getBoundingClientRect();
		const interrupt = this.moving.rect.height;

		this.nodes.every(node =>
		{
			const { value, index } = node.sortable;
			let { top, height } = node.getBoundingClientRect();
			
			let translate = 0;
			
			if (index > this.index)
			{
				translate -= this.moving.rect.height;
			}

			top += translate;

			if (top > this.moving.rect.top)
			{
				translate += interrupt;
			}

			top += translate;

			if (index < this.index && top > this.moving.rect.top)
			{
				if (this.newIndex === null) this.newIndex = index;
			}
			else if (index > this.index && top + height < this.moving.rect.bottom)
			{
				this.newIndex = index;
			}

			node.style[`${vendor}Transform`] = `translate3d(0,${translate}px,0)`;
			node.style[`${vendor}TransitionDuration`] = `${transition}ms`;

			return true;
		});
	}
	end = e =>
	{
		dom(document).off(event.move, this.move, true);
		if (this.moving)
		{
			this.moving.parentElement.removeChild(this.moving);
			this.moving = null;
		}
		if (this.node)
		{
			this.node.style.visibility = '';
			this.node = null;
		}
		if (this.scrollInterval)
		{
			clearInterval(this.scrollInterval);
			this.scrollInterval = null;
		}
		if (this.nodes)
		{
			this.nodes.every(node =>
			{
				node.style[`${vendor}Transform`] = '';
				node.style[`${vendor}TransitionDuration`] = '';
				return true;
			});
			this.nodes = null;
		}

		if (this.index !== null && this.newIndex !== null)
		{
			let items = [ ...this.state.items ];
			const move = items.splice(this.index, 1);
			items.splice(this.newIndex, 0, move);
			
			this.setState({ items });
			this.index = null;
			this.newIndex = null;			
		}
	}

	render = () =>
	{
		return (
			<div className="sortable box is-small"
				onContextMenu={e => e.preventDefault()}
			>
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
export default Sortable;