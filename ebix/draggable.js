import React from 'react';
import { findDOMNode } from 'react-dom';
class Draggable extends React.Component 
{
	state = {};
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
		if (!this.handle) return;

		this.handle.setAttribute('style', 'cursor: pointer');
		dom.addEventListener('mousedown', this.mousedown, true);
		dom.addEventListener('mouseup', this.mouseup, true);
		dom.addEventListener('touchstart', this.mousedown, { passive: false });
		dom.addEventListener('touchend', this.mouseup, true);
	}
	mousedown = e =>
	{
		const { clientX: x, clientY: y } = e.type === 'touchstart' ? e.touches[0] : e;
		if ((r => r.left <= x && x <= r.right && r.top <= y && y <= r.bottom)
			(this.handle.getBoundingClientRect()))
		{
			e.preventDefault();
			e.stopPropagation();
			this.setState({ lastX: x, lastY: y });
			this.dom().ownerDocument.addEventListener('mousemove', this.mousemove, true)
			this.dom().ownerDocument.addEventListener('touchmove', this.mousemove, true)
		}
	}
	mousemove = e =>
	{
		const { clientX: x, clientY: y } = e.type === 'touchmove' ? e.touches[0] : e;
		const { left, top, lastX, lastY } = this.state;
		const [ deltaX, deltaY ] = [ x - lastX, y - lastY ];
		this.setState({ 
			left: left + deltaX, 
			top : top  + deltaY, 
			lastX: x, 
			lastY: y, 
		});
	}
	mouseup = e =>
	{
		this.dom().ownerDocument.removeEventListener('mousemove', this.mousemove, true)
		this.dom().ownerDocument.removeEventListener('touchmove', this.mousemove, true)
	}
	render()
	{
		let { style, children } = this.props;
		const { left, top } = this.state;
		if (left !== undefined) style.left = left;
		if (top  !== undefined) style.top  = top ;
		return (
			<div className="draggable"
				style={{
					...style, 
				}}
			>
				{children}
			</div>
		);
	}
}
export default Draggable;