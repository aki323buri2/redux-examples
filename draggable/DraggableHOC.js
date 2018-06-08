import React from 'react';
import { findDOMNode } from 'react-dom';
const events = {
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
	dblclick: [
		'dblclick',  
	], 
};
const DraggableHOC = WrappedComponent => class extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			style: {
				position: 'absolute', 
				...this.props.style, 
			}, 
		};
	}
	dom()
	{
		return findDOMNode(this);
	}
	componentDidMount()
	{
		this.handle = this.dom().querySelector(this.props.handle||'.handle')||this.dom();
		this.handle.style.cursor = 'pointer';
		this.dom().on(events.start, this.mousedown);
		this.dom().on(events.end, this.mouseup);
		this.offset = { x: 0, y: 0 };
		this.delta = { x: 0, y: 0 };

		this.handle.on(events.dblclick, this.dblclick);
	}
	componentWillUnmount()
	{
		this.dom().off(events.start, this.mousedown);
		this.dom().off(events.end, this.mouseup);
		document.off(events.move, this.mousemove);

		this.handle.off(events.dblclick, this.dblclick);
	}
	mousedown = e =>
	{
		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		if (!this.handle.hittest(x, y))
		{
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.latest = { x, y };
		document.on(events.move, this.mousemove);
	}
	mouseup = e =>
	{
		document.off(events.move, this.mousemove);
		this.offset = { ...this.delta };
	}
	mousemove = e =>
	{
		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		this.delta = { x, y };
		this.delta.x -= this.latest.x;
		this.delta.y -= this.latest.y;
		this.delta.x += this.offset.x;
		this.delta.y += this.offset.y;
		const transform =`translate3d(${this.delta.x}px,${this.delta.y}px,0)`;
		this.setState({ style: { transform } });
	}

	dblclick = e =>
	{
		const transform = 'translate3d(0,0,0)';
		this.offset = { x: 0, y: 0 };
		this.setState({ style: { transform } });
	}

	render()
	{
		const { style } = this.state;
		return ( 
			<WrappedComponent 
				style={style}
			/>
		);
	}
};
export default DraggableHOC;