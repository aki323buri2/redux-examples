import React from 'react';
import { findDOMNode } from 'react-dom';
class Draggable extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			style: {
				position: 'absolute', 
				zIndex: 100, 
				...props.style, 
			}, 
		};
	}
	dom = () =>
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{
		this.handle = this.dom().querySelector(this.props.handle||'.handle')||this.dom();
		this.handle.style.cursor = 'pointer';
		this.dom().addEventListener('mousedown', this.mousedown, true);
		this.dom().addEventListener('mouseup', this.mouseup, true);
	}
	componentWillUnmount = () =>
	{
		this.dom().removeEventListener('mousedown', this.mousedown, true);
		this.dom().removeEventListener('mouseup', this.mouseup, true);
		document.removeEventListener('mousemove', this.mousemove, true);
	}
	mousedown = e =>
	{
		const { clientX: x, clientY: y } = e;
		if (!(r=>r.left<=x&&x<=r.right&&r.top<=y&&y<=r.bottom)(this.handle.getBoundingClientRect()))
		{
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.latest = { x, y };
		document.addEventListener('mousemove', this.mousemove, true);
	}
	mouseup = e =>
	{
		document.removeEventListener('mousemove', this.mousemove, true);
	}
	mousemove = e =>
	{
		const { clientX: x, clientY: y } = e;
		const delta = { x, y };
		delta.x -= this.latest.x;
		delta.y -= this.latest.y;
		this.latest = { x, y };

		const { style } = this.state;
		if (style.right  !== undefined) style.right  -= delta.x;
		if (style.bottom !== undefined) style.bottom -= delta.y;
		let { left, top } = document.defaultView.getComputedStyle(this.dom());
		if (left === 'auto' || top === 'auto')
		{
			({ left, top } = this.computedAutoStyle());
		}
		else
		{
			left = parseInt(left.replace(/px$/, ''));
			top  = parseInt(top .replace(/px$/, ''));
		}
		if (style.right  === undefined) style.left = left + delta.x;
		if (style.bottom === undefined) style.top  = top  + delta.y;
		this.setState({ style });
	}
	computedAutoStyle = () =>
	{
		let { left, top } = this.dom().getBoundingClientRect();
		if (document.defaultView.getComputedStyle(this.dom()).position !== 'absolute')
		{
			return { left, top };
		}
		let el = this.dom();
		while (el = el.parentNode)
		{
			if (document.defaultView.getComputedStyle(el).position !== 'static') break;
		}
		const offset = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
		left -= offset.left;
		top  -= offset.top ;
		return { left, top };
	}
	render = () =>
	{
		const { style } = this.state;
		return (React.cloneElement(React.Children.only(this.props.children), {
			style: { ...style }, 
		}));
	}
};
export default Draggable;