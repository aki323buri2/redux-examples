import React from 'react';
import { findDOMNode } from 'react-dom';
class Selectable extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			style: {
				position: 'absolute', 
				zIndex: 100, 
				border: '1px dashed #999', 
				background: 'transparent', 
				left: 0, 
				top: 0, 
				width: 100, 
				height: 100, 
				visibility: 'hidden', 
				...this.props.style, 
			}, 
		};
	}
	dom = () =>
	{
		return findDOMNode(this);
	}
	componentDidMount = e =>
	{
		document.addEventListener('mousedown', this.mousedown, true);
		document.addEventListener('mouseup', this.mouseup, true);
	}
	componentWillUnmount = e =>
	{
		document.removeEventListener('mousedown', this.mousedown, true);
		document.removeEventListener('mouseup', this.mouseup, true);
		document.removeEventListener('mousemove', this.mousemove, true);
	}
	mousedown = e =>
	{
		const { clientX: x, clientY: y } = e;
		this.initial = { x, y };
		
		e.preventDefault();
		e.stopPropagation();
		document.addEventListener('mousemove', this.mousemove, true);

		this.selectable = document.querySelectorAll(this.props.selectable);

	}
	mouseup = e =>
	{
		document.removeEventListener('mousemove', this.mousemove, true);
		
		this.setState({ style: { ...this.state.style, visibility: 'hidden' } });
	}
	mousemove = e =>
	{
		const { clientX: x, clientY: y } = e;
		const terminal = { x, y };
		this.rect(this.initial, terminal);

		const rect = this.dom().getBoundingClientRect();
		const selectedClass = this.props.selectedClass || 'is-selected';

		[].map.call(this.selectable, e => 
		{
			const { left, top, right, bottom } = e.getBoundingClientRect();
			if (
				Math.max(rect.left, left) < Math.min(rect.right, right) &&
				Math.max(rect.top, top) < Math.min(rect.bottom, bottom)
			)
			{
				e.classList.add(selectedClass);
			}
			else
			{
				e.classList.remove(selectedClass);
			}
		});
			
	}
	
	rect = (initial, terminal) =>
	{
		let left = Math.min(initial.x, terminal.x);
		let top  = Math.min(initial.y, terminal.y);
		const width  = Math.abs(initial.x - terminal.x);
		const height = Math.abs(initial.y - terminal.y);
		const offset = this.computedOffset();
		left -= offset.left;
		top  -= offset.top ;
		this.setState({ style: {
			...this.state.style, 
			left, 
			top, 
			width, 
			height, 
			visibility: 'visible', 
		}});
	}
	computedOffset = () =>
	{
		let { left, top } = this.dom().getBoundingClientRect();
		const offset = this.computedStyle();
		left -= offset.left;
		top  -= offset.top ;
		return { left, top };
	}
	render = () =>
	{
		const { style } = this.state;
		return (
			<div className="selectable" style={{ ...style }}>
			</div>
		)
	}

	computedStyle = () =>
	{
		const css = document.defaultView.getComputedStyle;

		let { left, top } = css(this.dom());
		
		if (left === 'auto' || top === 'auto')
		{
			let el = this.dom();
			while (el = el.parentNode)
			{
				if (css(el).positon !== 'static') break;
			}
			const offset = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
			left -= offset.left;
			top  -= offset.top ;
		}
		else
		{
			left = parseInt(left.replace(/px$/, ''));
			top  = parseInt(top .replace(/px$/, ''));
		}
		return { left, top };
	}
}
export default Selectable;