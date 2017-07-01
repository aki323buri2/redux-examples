import React from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import numeral from 'numeral';

const columns = {
	month  : { title: '年月' }, 
	hinsyu : { title: '品種ＣＤ' }, 
	hinmei : { title: '品名' }, 
	size   : { title: 'サイズ' }, 
	yoryo  : { title: '容量' }, 
	tani   : { title: '重量' }, 
	irisu  : { title: '入数' }, 
	ref    : { title: '参照' }, 
	chance : { title: '候補' }, 
	bunrui : { title: '分類CD' }, 
	daibun : { title: '大分類' }, 
	chubun : { title: '中分類' }, 
	syobun : { title: '小分類' }, 
	syu    : { title: '種' }, 
	keijo  : { title: '形状部位' }, 
	kako   : { title: '加工方法' }, 
};
[
	columns.yoryo, 
	columns.irisu, 
	columns.chance, 
].map(v => 
{
	(v||{}).style = { textAlign: 'right' };
	(v||{}).format = s => numeral(s).format('0,0');
});
const Missings = ({
	data, 
	page, 
	pages, 
	perpage, 

	indexes, 
	active, 

	click, 
}) => (
	<div className="missings">
		<table className="table is-bordered is-narrow is-small">
			<thead>
				<tr>
					<th>No.</th>
				{Object.entries(columns).map(([ name, { title, style } ]) =>
					<th key={name} className={classnames(name)} style={style}>
						{title}
					</th>
				)}
				</tr>
			</thead>
			<tbody>
			{data.slice(page * perpage, (page + 1) * perpage)
				.map((row, index) => ({ row, index: page * perpage + index }))
				.map(({ row, index }) =>
				<tr key={index}
					data-index={index}
					className={classnames({
						'is-selected': indexes[index] === true, 
						'is-active'  : index === active, 
					})}
					onClick={e => click({ e, row, index })}
					onMouseDown={e =>
					{
						e.preventDefault();
					}}
				>
					<td style={{ textAlign: 'right' }}>
						{index + 1}
					</td>
				{Object.entries(columns).map(([ name, { title, style, format } ]) =>
					<td key={name} className={classnames(name)} style={style}>
					{name === 'chance' && row.fetching ?
						<span className="icon is-small">
							<i className="fa fa-spinner fa-spin fa-pulse"></i>
						</span>
					:
						<span>{format ? format(row[name]) : row[name]}</span>
					}
					</td>
				)}
				</tr>
			)}
			</tbody>
		</table>
	</div>
);
export default Missings;