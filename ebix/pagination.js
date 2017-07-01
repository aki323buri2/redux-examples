import React from 'react';
import classnames from 'classnames';
class Pagination extends React.Component 
{
	render()
	{
		const { page, pages, perpage, disp, click } = this.props;

		let { start, end } = { start: 0, end: page - 1 };
		if (disp < pages)
		{
			start = page - Math.floor(disp / 2);
			if (start < 0) start = 0;
			end = start + disp - 1;
			if (end > pages - 1)
			{
				end = pages - 1;
				start = end - disp + 1;
			}
		}
		const list = [];
		for (let i = 0; i < disp; i++) list.push(start + i);
		if (start >  1) list.unshift(null);
		if (start >= 1) list.unshift(0);
		if (end < pages - 2) list.push(null);
		if (end < pages - 1) list.push(pages - 1);

		return (
		<div className="pagination">
		{pages ?
			<nav className="pagination is-centered is-small">
				<a className="pagination-previous"
					disabled={page === 0}
					onClick={e => page === 0 ? null : click(page - 1)}
				>
					Prev
				</a>
				<ul className="pagination-list">
				{list.map((v, i) => 
					<li key={i}>
					{v === null ?
						<span className="pagination-ellipsis">&hellip;</span>
					:
						<a 
							className={classnames({
								'pagination-link': true, 
								'is-current': v === page
							})}
							onClick={e => click(v)}
						>
							{v + 1}
						</a>
					}
					</li>
				)}
				</ul>
				<a className="pagination-next"
					disabled={page === pages - 1}
					onClick={page === pages - 1 ? null : e => click(page + 1)}
				>
					Next
				</a>
			</nav>
		:
			null 
		}
		</div>
		);
	}
}
export default Pagination;