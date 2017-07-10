if (!window.Promise) window.Promise = require('pinkie-promise');
const ie10 = window.navigator.userAgent.match(/ie\s10/i);
let debug = false;
debug = true;//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
Promise.resolve()
.then(stat =>
{
	const app = redux(App);
	render(app, document.querySelector('#app'));
	app.run(saga);
})
.catch(err =>
{
	render(<div className="err">{err.toString()}</div>, document.querySelector('#err'));
	console.error(erro);
});
import React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import createSaga from 'redux-saga';
import logger from 'redux-logger';
const redux = App =>
{
	const saga = createSaga();
	const middleware = [ saga, ...(!ie10 && debug ? [ logger ] : []) ];
	const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
	const app = <Provider store={store}><App/></Provider>;
	return {
		...app, 
		run: root => saga.run(root), 
	};
}
import { createActions } from 'redux-actions';
const actions = createActions({
	USER: a => a,
	FILE: a => a,  
	DATA: a => a, 
	UPLOAD: a => a, 
});
import { handleActions } from 'redux-actions';
const reducers = {};
reducers.user = handleActions({ USER: (state, { payload: v }) => v }, '');
reducers.file = handleActions({ FILE: (state, { payload: v }) => v }, null);
reducers.data = handleActions({ FILE: (state, { payload: v }) => v }, null);
import { put, call, takeEvery, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
const saga = function *()
{
	yield put(actions.user('aki323buri2'));
};
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import filesize from 'filesize';
const App = () => (
	<div className="app">
		<User/>
		<File/>
		<Upload/>
	</div>
);
const User = connect(state => state)(({
	user, 
}) => (
	<div className="user tag is-small" style={{ margin: '.5em' }}>
		<span className="icon is-small">
			<i className="fa fa-user"></i>
		</span>
		<span className="name">
			{user}
		</span>
	</div>
));
const File = connect(state => state, {
	change: file => actions.file(file), 
})(({
	file, 
	change, 
}) => 
{
	let input;
	return (
	<div className="file" style={{ marginBottom: '.5em' }}>
		<input type="file" name="file" id="file" 
			ref={r => input = r} 
			style={{ display: 'none' }}
			onChange={e => e.target.files.length ? change(e.target.files[0]) : null}
		/>
		<a className="button is-primary is-small has-icons-left"
			onClick={e => input.click()}
		>
			<span className="icon is-small">
				<i className="fa fa-folder"></i>
			</span>
			<span>
				{file ? file.name : ' ... '}
			</span>
		</a>
	</div>
)});
const Upload = connect(state => state, {
	data: actions.data, 
	upload: actions.upload, 
})(
class extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.reader = this.fileReader();
		this.state = { loading: false, loaded: 0, total: 0 };
	}
	render = () =>
	{
		const {
			file, 
			upload, 
		} = this.props;
		const { 
			loading, 
			loaded, 
			total, 
		} = this.state;
		const {
			data
		} = this;

		return (
		<div className="upload content is-small" style={{ margin: 0 }}>
		{!file ? null : 
			<div>
				<a 
					className={classnames({
						'button is-info is-small has-icons-left': true, 
						'is-loading': loading, 
					})}
					onClick={e => upload(data)}
				>
					<span className="icon is-small">
						<i className="fa fa-upload"></i>
					</span>
					<span>Upload</span>
				</a>
				{'   '}
				<span>
					{loading ? 
						`${loaded} / ${total}` 
					:
						`${filesize(loaded)} (${loaded})`
					}
				</span>

			</div>
		}
		</div>
		);
	}
	componentWillReceiveProps = ({ file }) =>
	{
		if (!file) return;
		this.reader.readAsArrayBuffer(file);
	}
	fileReader = () =>
	{
		const reader = new FileReader();
		reader.onloadstart = e =>
		{
			this.setState({ loading: true });
		};
		reader.onprogress = e => 
		{
			this.setState({ loaded: e.loaded, total: e.total });
		};
		reader.onloadend = e =>
		{
			this.setState({ loading: false });
			this.data = e.target.result;
		};
		
		return reader;
	}
});