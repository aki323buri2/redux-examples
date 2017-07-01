if (!window.Promise) window.Promise = require('pinkie-promise');
const ie10 = window.navigator.userAgent.toLowerCase().match(/ie\s10/);
let debug = false;
Promise.resolve()
.then(stat =>
{
	const saga = createSaga();
	const app = redux({ App, reducers, saga });
	render(app, document.querySelector('#app'));
	saga.run(sagas);
})
.catch(err =>
{
	render(<div className="error">{err.toString()}</div>, document.querySelector('#err'));
	console.error(err);
});
import React from 'react';
import { render } from 'react-dom';
import { findDOMNode } from 'react-dom';
import { connect, Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
const redux = ({ App, reducers, saga }) =>
{
	const middleware = [ saga, ...(!ie10 && debug ? [ logger ] : []) ];
	const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
	return (
		<Provider store={store}>
			{React.createElement(connect(state => state)(props => <App {...props}/>))}
		</Provider>
	);
};
import { createActions } from 'redux-actions';
import { handleActions } from 'redux-actions';
import { put, fork, takeEvery } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createSaga from 'redux-saga';
import axios from 'axios';
import moment from 'moment';
const fetch = url => axios.get(url).then(res => res.data);
debug = true;
const actions = createActions(...[
	'MESSAGE', 
	'COMMENTS', 
	'IP', 
	'NAME',
	'ROOM', 
	'CONNECTING',  
	'SOCKET_ERROR', 
	'HANDSHAKE', 
	'CHECK_IN', 
	'WELCOME', 
]);
const sagas = function *()
{
	const ip = yield fetch('http://sirius/ip');
	const names = yield fetch(`http://sirius/ip2names/${ip}`);
	const name = names[0] || ip;
	yield put(actions.ip(ip));
	yield put(actions.name(name));

	const room = 'room1';
	yield put(actions.room(room));

	const io = require('socket.io-client');

	yield put(actions.connecting());
	
	yield takeEvery(eventChannel(emit => 
	{
		const socket = io('http://vega:8000')
		.on('connect_error', err =>
		{
			emit(actions.socketError(err));
			console.error(err);
			socket.close();
		})
		.on('handshake', handshake =>
		{
			emit(actions.handshake(handshake));
			setTimeout(() => emit(actions.checkIn({ socket, name, room })), 1000);
		})
		.on('welcom', ({ name, room }) =>
		{
			emit(actions.welcome({ name, room }));
		})
		;
		return ()=>{};
	})
	, function *(action)
	{
		yield put(action);
	});
	yield takeEvery(actions.checkIn, function *({ payload: { socket, name, room } })
	{
		socket.emit('check in', { name, room });
	});

};
const reducers = (o => Object.entries(o).reduce((o, [ name, { map, initial } ]) =>
	Object.assign(o, { [name]: handleActions(map, initial) })
, {}))({
	ip      : { map: { IP     : (state, { payload: v }) => v }, initial: '' }, 
	name    : { map: { NAME   : (state, { payload: v }) => v }, initial: '' }, 
	room    : { map: { ROOM   : (state, { payload: v }) => v }, initial: '' }, 
	message : { map: { MESSAGE: (state, { payload: v }) => v }, initial: '' }, 
	comments : { map: {
		COMMENTS: (state, { payload: comments }) => 
		{
			return [ ...state, ...(Array.isArray(comments) ? comments : [ comments ]) ];
		}
	}, initial: [] }, 
	socketError: { map: { SOCKET_ERROR: (state, { payload: v }) => v }, initial: {} }, 
	handshake  : { map: { 
		HANDSHAKE   : (state, { payload: v }) => v, 
		SOCKET_ERROR: (state, { payload }) => ({}), 
		CONNECTING  : (state, { payload }) => ({ connecting: true }), 
	}, initial: {} }, 
});

const style = {
	linked: {
		pointerEvents: 'auto', 
		cursor: 'pointer', 
	}, 
	box: {
		padding: '1em', 
		marginBottom: 10, 
	}, 
	flex: {
		display: ie10 ? '-ms-flexbox' : 'flex', 
	}, 
};

const App = ({
	dispatch, 
	message, 
	comments,
	ip, 
	name,  
	room, 
	socketError, 
	handshake, 
}) => (
	<div className="app">

		<div className="float content is-small" style={{
			position: 'fixed', 
			zIndex: 100, 
			left: 0, 
			top: 0, 
			width: 250, 
		}}>
			<div className="box name" style={style.box}>
				<div className="name">
					<span className="icon is-small">
						<i className="fa fa-user"></i>
					</span>
					&nbsp;
					<span>{name}</span>
					<span>{name === ip ? null : <span>&nbsp;({ip})</span>}</span>
				</div>
				<div className="room">
					<span className="icon is-small">
						<i className="fa fa-users"></i>
					</span>
					&nbsp;
					<span>{room}</span>
				</div>
			{handshake.connecting ?
				<div>
					conneting...
					<span className="icon">
					 	<i className="fa fa-spinner fa-spin fa-pulse"></i>
					 </span> 
				</div>
			: (handshake.headers ?
				<div>
					<span className="icon is-small">
						<i className="fa fa-sign-in"></i>
					</span>
					&nbsp;
					<strong>
						{(handshake.headers||{}).host}
					</strong>
					<div>
						{(handshake.address||'').replace(/^.*:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}).*$/, '$1')}
					</div>
					<div>
						{moment(handshake.time, 'ddd MMM DD YYYY HH:mm:ss GMT+0900 (JST)').format('YYYY-MM-DD HH:mm:ss.SSS')}
					</div>
				</div>
			: 
				<div>
					<span className="icon is-small">
						<i className="fa fa-unlink"></i>
					</span>
				</div>
			)}

			</div>
		{socketError.message ?
			<article className="message is-danger content is-small">
				<div className="message-header">
					<strong>{socketError.message}</strong>
				</div>
				<div className="message-body">
					{socketError.stack}
				</div>
			</article>
		: null}
		</div>

		<div className="message-" style={{
			marginBottom: '1em', 
		}}>
			<p className="control has-icons-left" style={{
				width: 300, 
			}}>
				<input type="text" className="input is-small"
					value={message}
					onChange={e => dispatch(actions.message(e.target.value))}
				/>
				<span className="icon is-small is-left" style={style.linked}>
					<i className="fa fa-commenting-o"></i>
				</span>
			</p>
		</div>

		<div className="comments">
			<div className="box content is-small" style={{
				overflowY: 'scroll', 
				height: 300, 
				padding: '1em', 
			}}>
			{comments.map((comment, index) => 
				<Comment key={index} comment={comment}/>
			)}
			</div>
		</div>
	</div>
);
class Comment extends React.Component 
{
	render = () =>
	{
		const { comment } = this.props;
		return (
			<div className="comment">
				{comment}
			</div>
		);
	}
	dom = () => findDOMNode(this);
	componentDidMount = () =>
	{
		this.dom().scrollIntoView();
	}
}
