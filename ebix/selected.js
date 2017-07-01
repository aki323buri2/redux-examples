import React from 'react';
import classnames from 'classnames';
import numeral from 'numeral';
import './selected.css';
if (!Element.prototype.closest) Element.prototype.closest = require('./polyfill').closest;
if (!Array.prototype.findIndex) Array.prototype.findIndex = require('./polyfill').findIndex;
if (!NodeList.prototype.forEach) NodeList.prototype.forEach = require('./polyfill').forEach;
import { findDOMNode } from 'react-dom';

class Selected extends React.Component 
{
	dom = () => findDOMNode(this);
	ensureActive = () =>
	{
		const active = this.dom().querySelectorAll('.is-active, is-selected');
		active.forEach((value, key, array, args) =>
		{
			let list = value.closest('.list');
			if (!list) return;

			list = list.getBoundingClientRect();
			let rect = value.getBoundingClientRect();
			if (list.top <= rect.top && rect.bottom <= list.bottom) return;

			value.scrollIntoView(false);
		});
	}
	componentDidUpdate = (prevProps, prevState) =>
	{
		this.ensureActive();
	}
	render = () =>
	{
		const {
			row: {
				hinsyu, 
				hinmei, 
				size, 
				yoryo, 
				tani, 
				irisu, 
				bunrui, 
				similar, 
			}, 
			active, 
			latest, 
			indexes, 

			data, 

			select, 
		} = this.props; 

		return (
		<div className="selected box">

			<Selector
				indexes={Object.keys(indexes).filter(v => v).map(v => parseInt(v))}
				active={active}
				data={data}
				select={select}
			/>

			<div className="handle">
				<span className="icon is-small">
					<i className="fa fa-arrows"></i>
				</span>
				<span className="is-pulled-right">
					<a className="delete"></a>
				</span>
			</div>

			<div className="hinsyu content is-small">
				<code>{hinsyu}</code>

				<div>
					<strong style={{ fontSize: '1.2em' }}>
						<Highlighted {...{
							hinmei, 
							search: ((similar||[])[0]||{}).search, 
							style: { background: 'yellow' }, 
						}}/>
					</strong>
					{size ? 
						<span className="tag">
							{size}
						</span> 
					: null}
				</div>
				<div>
					{hinsyu ?
						<span className="">
							{numeral(yoryo).format('0,0')}
							{tani}
							x 
							{numeral(irisu).format('0,0')}
						</span>
					: null}
				</div>
			</div>

			<List 
				similar={similar}
				bunrui={bunrui}
			/>

		</div>
	)
	}
}
const Highlighted = ({
	hinmei, 
	search, 
	style, 
}) => (
	hinmei !== undefined ?
	<span>
		<span>
			{hinmei.substr(0, hinmei.indexOf(search))}
		</span>
		<span style={style}>
			{hinmei.substr(hinmei.indexOf(search), search.length)}
		</span>
		<span>
			{hinmei.substr(hinmei.indexOf(search) + search.length)}
		</span>
	</span>
	: null
);
const Selector = ({
	indexes, 
	active, 
	data, 
	select, 
}) => (
	<div className="selector box content is-small"
		style={{
			position: 'absolute', 
			left: -220, 
			width: 200, 
			visibility: indexes.length > 1 ? 'visible' : 'hidden', 
		}}
	>
		<div className="box list"
			style={{
				overflowY: 'scroll', 
				height: 350, 
			}}
		>
			<ul>
			{indexes
				.map(index => ({ index, row: data[index] }))
				.map(({ index, 
				row: {
					hinsyu, 
					hinmei, 
					size, 
				}}) =>
				<li key={index}
					className={classnames({
						'is-active': index === active, 
					})}
					onClick={e =>
					{
						select({ e, row: data[index], index });
					}}
				>
					
					<code>{hinsyu}</code>
					{hinmei}
					{size}
				</li>
			)}
			</ul>
		</div>

		<div className="buttons">
			<a className="button is-small"><span className="icon is-small"
				onClick={e => 
				{
					const length = indexes.length;
					if (length === 0) return;
					let index = indexes.findIndex(v => v === active);
					index = (--index + length) % length;
					index = indexes[index];

					select({ e, row: data[index], index });
				}}
			>
				<i className="fa fa-play fa-rotate-180"></i>
			</span></a>
			<a className="button is-small"><span className="icon is-small"
				onClick={e =>
				{
					const length = indexes.length;
					if (length === 0) return;
					let index = indexes.findIndex(v => v === active);
					index = (++index + length) % length;
					index = indexes[index]

					select({ e, row: data[index], index });
				}}
			>
				<i className="fa fa-play"></i>
			</span></a>
		</div>

	</div>
);
const List = ({
	similar, 
	bunrui: selected, 
}) => (
	<div className="list box"
		style={{
			overflowY: 'scroll', 
			height: 300, 
		}}
	>
		<ul
			className="content is-small"
			style={{
				listStyle: 'none', 
			}}
		>
		{(similar||[]).map(({
			bunrui, 
			daibun, 
			chubun, 
			syobun, 
			syu, 
			keijo, 
			kako, 
			hinsyu, 
			hinmei, 
			search, 
		}, index) =>
			<li key={index}
				className={classnames({
					'is-selected': bunrui === selected, 
				})}
			>
				<div className="media">
					<div className="media-left"
						style={{
							position: 'relative', 
						}}
					>
						<span className="icon">
							<i className="fa fa-cube"></i>
						</span>
						<code
							style={{
								position: 'absolute', 
								right: -10, 
								bottom: -10, 
							}}
						>
							{bunrui}
						</code>
					</div>
					<div className="media-content">
						<div className="columns">
							<div className="column is-4">
								<div>{daibun}</div>
								<div>{chubun}</div>
								<div>{syobun}</div>
							</div>
							<div className="column is-4">
								<div>{syu}</div>
								<div>{keijo}</div>
								<div>{kako}</div>
							</div>
							<div className="column is-4">
								<Highlighted {...{
									hinmei, 
									search, 
									style: { background: 'yellow' }, 
								}}/>
							</div>
						</div>
						
						
						
					</div>
					<div className="media-right"></div>
				</div>
			</li>
		)}
		</ul>
	</div>
);
export default Selected;