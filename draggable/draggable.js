import React from 'react';
import { findDOMNode } from 'react-dom';
class Draggable extends React.Component 
{
	dom = () =>
	{
		return findDOMNode(this);
	}
	componentDidMount = () =>
	{
		const dom = this.dom();
		const { left, top } = dom.getBoundingClientRect();
		this.setState({ left, top });

		this.handle = dom.querySelector(this.props.handle || '.handle');
		if (!this.handle) this.handle = dom;

		this.handle.setAttribute('style', 'cursor: pointer');
		dom.addEventListener('mousedown' , this.mousedown , true);
		dom.addEventListener('mouseup'   , this.mouseup   , true);
		dom.addEventListener('touchstart', this.mousedown , { passive: false });
		dom.addEventListener('touchend'  , this.mouseup   , true);
	}
	componentWillUnmount = () =>
	{
		const dom = this.dom();
		dom.removeEventListener('mousedown' , this.mousedown , true);
		dom.removeEventListener('mouseup'   , this.mouseup   , true);
		dom.removeEventListener('touchstart', this.touchstart, { passive: false });
		dom.removeEventListener('touchend'  , this.touchend  , true);
		document.removeEventListener('mousemove', this.mousemove, true);
		document.removeEventListener('touchmove', this.mousemove, true);
	}
	mousedown  = e => 
	{
		const { clientX: x, clientY: y } = e.type === 'touchstart' ? e.touches[0] : e;
		const rect = this.handle.getBoundingClientRect();
		const hittest = 
			(r => r.left <= x && x <= r.right && r.top <= y && y <= r.bottom)(rect)
		;
		if (!hittest) return;

		e.preventDefault();
		e.stopPropagation();
		this.setState({ lastX: x, lastY : y });
		document.addEventListener('mousemove', this.mousemove, true);
		document.addEventListener('touchmove', this.mousemove, true);
	};
	mouseup = e => 
	{
		document.removeEventListener('mousemove', this.mousemove, true);
		document.removeEventListener('touchmove', this.mousemove, true);
	}
	mousemove = e => 
	{
		const { clientX: x, clientY: y } = e.type === 'touchmove' ? e.touches[0] : e;
		const { left, top, lastX, lastY } = this.state;
		this.setState({
			left: left + (x - lastX), 
			top : top  + (y - lastY), 
			lastX: x, 
			lastY: y, 
		});
	}
	render = () =>
	{
		const { left, top } = this.state || {};
		const style = {};
		if (left !== undefined) style.left = left;
		if (top  !== undefined) style.top  = top ;
		style.color = 'red';
		return (
			React.cloneElement(React.Children.only(this.props.children), {
				style: { ...this.props.children.props.style, ...style },  
			})
		);
	}
}
export default Draggable;