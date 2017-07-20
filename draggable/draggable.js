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
				...this.props.style, 
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
		const target = this.handle.getBoundingClientRect();
		if (!(r => r.left <= x && x <= r.right && r.top <= y && y <= r.bottom)(target))
		{
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.last = { x, y };
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
		if (style.right  !== undefined) style.right -= delta.x; 
		if (style.bottom !== undefined) style.bottom -= delta.y; 
		const { left, top } = this.computedStyle();
		if (style.right  === undefined) style.left = left + delta.x;
		if (style.bottom === undefined) style.top  = top  + delta.y;

		this.setState({ style });
	}
	computedStyle = () =>
	{
		let { left, top } = this.dom().getBoundingClientRect();

		if (this.state.style.position !== 'absolute')
		{
			return { left, top };
		}
		
		let el = this.dom();
		while ((el = el.parentNode) && el.style.position !== 'static')
		{
			break;
		}
		const offset = el.getBoundingClientRect();
		left -= offset.left;
		top  -= offset.top ;
		
		return { left, top };		
	}

	render = () =>
	{
		const { style } = this.state; 
		return (React.cloneElement(React.Children.only(this.props.children), {
			style: { ...style }
		}));
	}

};
export default Draggable;