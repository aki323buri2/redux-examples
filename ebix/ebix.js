if (!window.Promise) window.Promise = require('pinkie-promise');
const ie10 = window.navigator.userAgent.match(/MSIE 10/);
if (!Element.prototype.closest) Element.prototype.closest = require('./polyfill').closest;
Promise.resolve()
.then(stat => 
{
	const app = connectStore(App);
	render(app, document.querySelector('#app'));
	
	saga.run(rootSaga);
	if (false)
	{
		store.dispatch(actions.reload());
	}
	else 
	{
		store.dispatch(actions.loadMissings());
		const data = store.getState().missings.data || [];
		store.dispatch(actions.receiveMissings(data));
	}
})
.catch(e =>
{
	console.error(e);
	render(<div>{e.toString()}</div>, document.querySelector('#app'));
});

import { actions, store, saga, connectStore } from './store';
import rootSaga from './saga';

import React from 'react';
import { render } from 'react-dom';
import Missings from './missings';
import Pagination from './pagination';
import Draggable from './draggable';
import Selector from './selector';
import Selected from './selected'; 
import classnames from 'classnames';
const App = ({
	dispatch, 
	missings, 
	pagination, 
	selected, 
	switches, 
}) => (
	<div className="app">

		<Switches
			switches={switches}
			toggle={name => dispatch(actions.switchesToggle(name))}
		/>

		<Selector
			draggable=".missings"
			selectable=".missings tbody > tr"
			select={({ e }) =>
			{
				const tr = e.target.closest('tr');
				if (!tr) return;
				const { shiftKey, ctrlKey } = e;
				const index = parseInt(tr.getAttribute('data-index'));
				const row = missings.data[index];
				dispatch(actions.clickMissings({ row, index, shiftKey, ctrlKey }));
			}}
			selecting={({ e }) =>
			{
				const tr = e.target.closest('tr');
				if (!tr) return;
				const shiftKey = true;
				const { ctrlKey } = e;
				const index = parseInt(tr.getAttribute('data-index'));
				const row = missings.data[index];
				dispatch(actions.clickMissings({ row, index, shiftKey, ctrlKey }));
			}}
		/>
		
		<div style={{
			display: ie10 ? '-ms-flexbox' : 'flex', 
		}}>
			<Save {...missings}
				load={({ e }) => dispatch(actions.reload())}
				save={({ e }) => dispatch(actions.saveMissings())}
			/>

			<div style={{ width: '1rem' }}></div>

			<Pending {...missings}/>

			<div style={{ width: '1rem' }}></div>
			
			<Pagination {...pagination}
				click={v => dispatch(actions.pageClick(v))}
			/>
		</div>

		<div style={{ height: '1rem' }}></div>
		
		<Missings {...missings} {...pagination} {...selected} 
			click={({ e, row, index }) =>
			{
				const { shiftKey, ctrlKey } = e; 
				dispatch(actions.clickMissings({ row, index, shiftKey, ctrlKey }));
			}}
		/>

		<Draggable style={{
			position: 'fixed', 
			zIndex: 100, 
			right: 100, 
			top: 100, 
			width: 600, 
			height: 300, 
		}}>
			<Selected {...selected} {...missings}
				select={({ e, row, index }) =>
				{
					dispatch(actions.activateMissingsOf({ row, index }));
				}}
			/>
		</Draggable>

	</div>
);
const Save = ({
	fetching, 
	load, 
	save, 
}) => (
	<div className="save">
		<div className="block">
			<a 
				className={classnames({
					'button is-small': true, 
					'is-loading': fetching
				})}
				disabled={fetching}
				onClick={e => fetching ? (()=>{})() : load({ e })}
			>
			<span className="icon is-small">
					<i className="fa fa-refresh"></i>
				</span>
				<span>
					Load
				</span>
			</a>
			<a className="button is-small"
				onClick={e => save({ e })}
			>
				<span className="icon is-small">
					<i className="fa fa-floppy-o"></i>
				</span>
				<span>Save</span>
			</a>
		</div>
	</div>
);
const Pending = ({
	fetching, 
	todo, 
	done, 
	data, 
}) => (
	<div className="pending">
	{fetching ?
		<span>
			<span>{done}/{todo}</span>
			<span className="icon is-small">
				<i className="fa fa-spinner fa-spin fa-pulse"></i>
			</span>
		</span>
	:
		<span>{data.length}</span>
	}
	</div>
);
const Switches = ({
	switches, 
	toggle, 
}) => (
	<div className="switches"
		style={{
			position: 'fixed', 
			zIndex: 100, 
			left: 0, 
			top: 0, 
		}}
	>
		<a 
			className={classnames({
				'button': true, 
				'is-primary': switches.selector, 
			})}
			onClick={e => toggle('card')}
		>
			<span className="icon is-small">
				<i className="fa fa-hand-pointer-o"></i>
			</span>
		</a>
	</div>
);