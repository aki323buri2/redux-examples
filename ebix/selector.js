import React from 'react';
import { findDOMNode } from 'react-dom';
class Selector extends React.Component 
{
	state = {
		offset: { x: 0, y: 0 }, 
		left: 0, 
		top: 0, 
		right: 100, 
		bottom: 100, 
		visibility: false, 
	};
	dom = () => findDOMNode(this);
	componentDidMount = () =>
	{
		let { left: x, top: y } = this.dom().getBoundingClientRect();
		x += window.pageXOffset;
		y += window.pageYOffset;
		const offset = { x, y }
		this.setState({ offset });


		document.addEventListener('mousedown', this.mousedown);
		document.addEventListener('mouseup', this.mouseup);
	}
	componentWillUnmount = e =>
	{
		this.selectable = document.querySelectorAll(this.props.selectable);
		[].map.call(this.selectable, v => 
		{
			v.removeEventListener('mouseover', this.mouseover);
		});
		document.removeEventListener('mousedown', this.mousedown);
		document.removeEventListener('mouseup', this.mouseup);
		document.removeEventListener('mousemove', this.mousemove, true);
		
	}
	area = () =>
	{
		const { offset } = this.state;
		let { left, top, right, bottom } = document.querySelector(this.props.draggable).getBoundingClientRect();
		left += window.pageXOffset - offset.x;
		top  += window.pageYOffset - offset.y;
		right  += window.pageXOffset - offset.x;
		bottom += window.pageYOffset - offset.y;

		this.selectable = document.querySelectorAll(this.props.selectable);
		[].map.call(this.selectable, v => 
		{
			v.addEventListener('mouseover', this.mouseover);
		});

		return { left, top, right, bottom };
	}
	mousedown = e =>
	{

		let { clientX: left, clientY: top } = e;
		const { offset } = this.state;
		left += window.pageXOffset - offset.x;
		top  += window.pageYOffset - offset.y;
	
		const area = this.area();	
		if (!(area.left <= left && left <= area.right && area.top <= top && top <= area.bottom))
		{
			return;
		}

		if (this.props.select) this.props.select({ e });

		e.preventDefault();

		this.setState({ left, top, right: left, bottom: top, visibility: true });

		this.dragging = true;

		document.addEventListener('mousemove', this.mousemove, true);
	}
	mousemove = e =>
	{
		let { clientX: right, clientY: bottom } = e;
		const { offset } = this.state;
		right  += window.pageXOffset - offset.x;
		bottom += window.pageYOffset - offset.y;
		this.setState({ right, bottom });
	}
	mouseup = e => 
	{
		document.removeEventListener('mousemove', this.mousemove, true);
		this.dragging = false;
		this.setState({ visibility: false });
	}
	mouseover = e =>
	{
		if (this.dragging && this.props.selecting)
		{
			this.props.selecting({ e });
		}
	}
	render = () =>
	{
		const { left, top, right, bottom, visibility } = this.state;
		return (
		<div className="selector"
			style={{
				position: 'absolute', 
				zIndex: 100, 
				border: '1px dashed #999', 
				background: 'transparent', 
				left: Math.min(left, right), 
				top : Math.min(top, bottom), 
				width : Math.abs(right - left), 
				height: Math.abs(bottom - top),  
				visibility: visibility ? 'visible' : 'hidden', 
			}}
		>
		</div>
		);
	}

}
export default Selector;