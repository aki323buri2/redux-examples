import React from 'react';
import { findDOMNode } from 'react-dom';
class Draggable extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			style: { 
				position: 'fixed', 
				zIndex: 100,

				...this.props.style,  
			}
		};
	}
	dom = () =>
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{
		this.handle = this.dom().querySelector('.handle')||this.dom();
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
		if (!(r => r.left <= x && x <= r.right && r.top <= y && y <= r.bottom)(this.handle.getBoundingClientRect()))
		{
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.last = { x, y };
		const { left, top, right, bottom } = this
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
		delta.x -= this.last.x;
		delta.y -= this.last.y;
		this.last = { x, y };
		const { style } = this.state;
		(s => 
		{
			if (s.right !== undefined) s.right -= delta.x;
			if (s.bottom !== undefined) s.bottom -= delta.y;
			let { left, top } = document.defaultView.getComputedStyle(this.dom());
			left = parseInt(left.match(/(.+)px/)[1]);
			top  = parseInt(top .match(/(.+)px/)[1]);
			if (s.right === undefined) s.left = left + delta.x;
			if (s.bottom === undefined) s.top = top + delta.y;
		})(style);
		this.setState({ style });
	}
	render = () =>
	{
		const { style } = this.state;
		return (React.cloneElement(React.Children.only(this.props.children), {
			style: { ...style }, 
		}));
	}
}
export default Draggable;