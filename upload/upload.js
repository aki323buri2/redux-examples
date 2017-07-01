if (!window.Promise) window.Promise = require('pinkie-promise');
const ie10 = window.navigator.userAgent.match(/ie\s10/i);
let debug = false;
// debug = true;
Promise.resolve()
.then(stat =>
{
	const { app, saga } = redux(App);
	render(app, document.querySelector('#app'));
	saga.run(sagas);
})
.catch(err =>
{
	render(<div className="err">{err.toString()}</div>, document.querySelector('#err'));
	console.error(err);
});
import React from 'react';
import { render } from 'react-dom';
import { findDOMNode } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import createSaga from 'redux-saga';
import logger from 'redux-logger';
const redux = App =>
{
	const saga = createSaga();
	const middleware = [ saga, ...(!ie10 && debug ? [ logger ] : []) ];
	const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
	const app = (
		<Provider store={store}>
			{React.createElement(connect(state => state)(props => <App {...props}/>))}
		</Provider>
	);
	return { app, saga };
};
import { createActions } from 'redux-actions';
import { handleActions } from 'redux-actions';
import { put, takeEvery } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import numeral from 'numeral';
import filesize from 'filesize';
const reducers = (o => Object.entries(o).reduce((o, [ n, { map, initial } ]) =>
	Object.assign(o, { [n]: handleActions(map, initial) })
, {}))({
	message : { map: { MESSAGE : (state, { payload: v }) => v }, initial: '' }, 
	file    : { map: { FILE    : (state, { payload: v }) => v }, initial: null }, 
	progress: { map: { PROGRESS: (state, { payload: { loaded, total } }) =>
	{
		return { loaded, total };

	}}, initial: { loaded: 0, total: 0 }}, 

	data: { map: { LOADEND: (state, { payload: v }) => v }, initial: null }, 
});
const actions = createActions(...[
	'MESSAGE', 
	'FILE', 
	'PARSE', 
	'PROGRESS', 
	'LOADEND', 
	'UPLOAD', 
]);
const sagas = function *()
{
	yield put(actions.message('message'));

	const reader = new FileReader();

	yield takeEvery(actions.parse, function *({ payload: file })
	{
		yield reader.readAsArrayBuffer(file);
	});
	yield takeEvery(eventChannel(emit =>
	{
		reader.onerror     = e => console.log({ type: 'error', e });
		reader.onprogress  = e =>
		{
			emit(actions.progress({ loaded: e.loaded, total: e.total }));
		}
		reader.onabort     = e => console.log({ type: 'abort', e });
		reader.onloadstart = e => console.log({ type: 'loadstart', e });
		reader.onload      = e => 
		{
			emit(actions.loadend(e.target.result));
		};
		return ()=>{};

	}), function *(action)
	{
		yield put(action);
	});
	yield takeEvery(actions.upload, function *({ payload: data })
	{
		console.log(data);
	});
};
const App = ({
	dispatch, 
	message, 
	file, 
	progress, 
	data, 
}) => (
	<div className="app">
		
		<div className="message-" style={{
			position: 'fixed', 
			zIndex: 100, 
			left: 0, 
			top: 0, 
			width: 220, 
		}}>
			<article className="message">
				<div className="message-body content is-small" style={{
					padding: '.5em', 
				}}>
					{message}
				</div>
			</article>
		</div>

		<div style={{ display: ie10 ? '-ms-flexbox' : 'flex' }}>
			<FileSelector
				file={file}
				change={v => dispatch(actions.file(v))}
			/>

			<div>&nbsp;</div>

			{file === null ? null : 
				<div className="file-info content is-small">
					<a className="button is-small is-primary"
						onClick={e => dispatch(actions.parse(file))}
					>
						<span className="icon is-small">
							<i className="fa fa-list"></i>
						</span>
						<span>check</span>
					</a>
				</div>
			}

			
		</div>

		<div>&nbsp;</div>

		<div className="progress- content is-small">
		{progress.loaded === progress.total ? null : 
			<progress className="progress is-small"
				value={progress.loaded}
				max={progress.total}
			>
			</progress>
		}
		{!progress.total || progress.total !== progress.loaded ? null : 
			<span>{filesize(progress.total)}</span>
		}
		</div>

		{!data ? null : 
			<div className="upload">
				<a className="button is-small is-danger"
					onClick={e =>
					{
						dispatch(actions.upload(data));
					}}
				>
					<span className="icon is-small">
						<i className="fa fa-upload"></i>
					</span>
					<span>{filesize(data.byteLength)}</span>
				</a>
			</div>
		}

	</div>
);
const FileSelector = ({
	style, 
	file, 
	change, 
}) => {
	let input;
	return (
	<div className="file-selector" style={style}>
		<a className="button is-small"
			onClick={e => input.click()}
		>
			<span className="icon is-small">
				<i className="fa fa-folder"></i>
			</span>
			<span>
				{file ? file.name : '...'}
			</span>
		</a>

		<input type="file" name="file" id="file"
			ref={v => input = v}
			onChange={e =>
			{
				if (!e.target.files.length) return;
				change(e.target.files[0]);
			}}
			style={{ display: 'none' }}
		/>
	</div>
	);
};