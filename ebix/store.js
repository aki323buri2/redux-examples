import React from 'react';
import { createActions } from 'redux-actions';
const actions = createActions(...[
	'REQUEST_MISSINGS', 
	'RECEIVE_MISSINGS', 

	'SAVE_MISSINGS', 
	'LOAD_MISSINGS', 

	'RELOAD', 

	'PAGE_CLICK', 
	'CLICK_MISSINGS', 
	'ACTIVATE_MISSINGS_OF', 

	'SWITCHES_TOGGLE', 
]);
import { handleActions } from 'redux-actions';
const reducers = {};
reducers.missings = handleActions({
	REQUEST_MISSINGS: (state, { payload }) =>
	{
		return { ...state, fetching: true, todo: 100, done: 0 };
	}, 
	RECEIVE_MISSINGS: (state, { payload: data }) =>
	{
		return { ...state, fetching: false, todo: data.length, done: 0, data };
	}, 
	REQUEST_MISSINGS_SIMILAR: (state, { payload }) =>
	{
		const data = state.data.map((v, i) => ({ ...v, fetching: true }));
		return { ...state, fetching: true, todo: data.length, data };
	}, 
	RECEIVE_MISSINGS_SIMILAR_OF: (state, { payload: { index, similar } }) =>
	{
		let { done, data } = state;
		done++;
		const { bunrui, daibun, chubun, syobun, syu, keijo, kako, search, hinmei: ref } = similar[0] || {};
		const insert = { ...data[index], bunrui, daibun, chubun, syobun, syu, keijo, kako, search, ref };
		insert.chance = similar.length;
		insert.similar = [ ...similar ];
		insert.fetching = false;
		data = [ ...data.slice(0, index), insert, ...data.slice(index + 1) ];
		return { ...state, done, data };
	}, 
	RECEIVE_MISSINGS_SIMILAR_OF_ALL: (state, { payload }) =>
	{
		return { ...state, fetching: false };
	}, 
	SAVE_MISSINGS: (state, { paylod }) =>
	{
		localStorage.setItem('missings', JSON.stringify(state));
		return state;
	}, 
	LOAD_MISSINGS: (state, { payload }) =>
	{
		return JSON.parse(localStorage.getItem('missings'));
	}, 
}, {
	fetching: false,
	todo: 0,
	done: 0, 
	data: [], 
});
reducers.pagination = handleActions({
	RECEIVE_MISSINGS: (state, { payload: data }) =>
	{
		return { ...state, page: 0, pages: Math.ceil(data.length / state.perpage) };
	}, 
	PAGE_CLICK: (state, { payload: page }) =>
	{
		return { ...state, page };
	}
}, {
	page: 0, 
	pages: 0, 
	perpage: 20, 
	disp: 3, 
});
reducers.selected = handleActions({
	CLICK_MISSINGS: (state, { payload: { row, index, shiftKey, ctrlKey } }) =>
	{
		let { latest } = state;

		if (!shiftKey && !ctrlKey)
		{
			return { ...state, row, active: index, latest: index, indexes: { [index]: true } }
		}
		else if (index !== latest)
		{
			if (shiftKey && latest < 0) latest = 0;
			
			const indexes = ctrlKey ? state.indexes : {};
			
			if (shiftKey)
			{
				const min = Math.min(latest, index);
				const max = Math.max(latest, index);
				for (let i = min; i <= max; i++) indexes[i] = true;
			}
			else 
			{
				indexes[index] = true;
			}
			return { ...state, row, active: index, latest: shiftKey ? latest : index, indexes };
		}
		return state;
	}, 
	ACTIVATE_MISSINGS_OF: (state, { payload: { row, index } }) =>
	{
		return { ...state, row, active: index };
	}, 
}, {
	row: {}, 
	active: -1, 
	latest: -1, 
	indexes: {}, 
});
reducers.switches = handleActions({
	SWITCHES_TOGGLE: (state, { payload: name }) =>
	{
		return { ...state, [name]: state[name] ? false : true }
	}
}, {});
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import createSaga from 'redux-saga'
const saga = createSaga();
const middleware = [
	thunk, 
	saga, 
];
const ie10 = window.navigator.userAgent.toLowerCase().match(/ie\s10/);
// if (!ie10) middleware.push(logger);
const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
import { connect, Provider } from 'react-redux';
const connectStore = App => (
	<Provider store={store}>
		{React.createElement(connect(state => state)(props => <App {...props}/>))}
	</Provider>
);
export {
	actions, 
	store, 
	saga, 
	connectStore, 
}