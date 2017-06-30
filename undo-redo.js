if (!window.Promise) window.Promise = require('pinkie-promise');
const ie10 = window.navigator.userAgent.match(/ie\s10/i);
Promise.resolve()
.then(stae =>
{
	const app = connectStore(App);
	render(app, document.querySelector('#app'));
	app.run(saga);
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
let debug = false;
debug = true;
const connectStore = App =>
{
	const saga = createSaga();
	const middleware = [ saga, ...(!ie10 && debug ? [ logger ] : []) ];
	const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
	const app = <Provider store={store}><App/></Provider>;
	return {
		...app, 
		run: root => saga.run(root)
	};
};
import { handleActions } from 'redux-actions';
import undoable from 'redux-undo';
const reducers = {};

reducers.todos = (() => 
{
	const todo = handleActions({
		ADD_TODO : (state, { payload: { id, text } }) => 
			({ id, text, completed: false }), 
		EDIT_TODO: (state, { payload: { id, text } }) => 
			state.id !== id ? state : { ...state, text }, 
		TOGGLE_TODO: (state, { payload: id }) => 
			state.id !== id ? state : { ...state, completed: !state.completed }, 
	}, {});
	const todos = handleActions({
		ADD_TODO : (state, action) => [ ...state, todo(undefined, action) ],  
		EDIT_TODO: (state, action) => state.map(t => todo(t, action)), 
		TOGGLE_TODO: (state, action) => state.map(t => todo(t, action)), 
	}, []);
	return undoable(todos);
})();
reducers.filter = handleActions({ 'FILTER': (state, { payload: v }) => v }, 'SHOW_ALL');

import { createAction } from 'redux-actions';
import { createActions } from 'redux-actions';
import { put, call, takeEvery } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
const actions = (() =>
{
	let id = 0;
	return createActions({
		ADD_TODO: text => ({ id: id++, text }), 
		EDIT_TODO: a => a, 
		TOGGLE_TODO: a => a, 
		FILTER: a => a, 
	});
})();
const saga = function *()
{
	yield put(actions.addTodo('hoge'));
	yield put(actions.addTodo('fuga'));
	yield put(actions.editTodo({ id: 1, text: 'fugafuga' }));
	yield put(actions.toggleTodo(1));
};

import ReactTooltip from 'react-tooltip';
const App = ({
}) => (
	<div className="app">

		<ReactTooltip effect="solid"/>

		<AddTodo />
		<Filter/>
		<UndoRedo/>
		<VisibleTodoList/>

	</div>
);
const AddTodo = connect()(({
	dispatch, 
}) => 
{
	let input;
	const submit = e =>
	{
		e.preventDefault();
		if (!input.value.trim()) return;
		dispatch(actions.addTodo(input.value));
		input.value = '';
		input.focus();
	};
	return (
	<div className="add-todo">
		<form className="form" onSubmit={submit}>
			<p className="control has-icons-left">
				<input type="text" className="input is-small" ref={n => input = n}/>
				<span className="icon is-small is-left linked" onClick={submit}
					data-tip='TODOを追加します'
				>
					<i className="fa fa-plus"></i>
				</span>
			</p>
		</form>
	</div>
	);
});
const VisibleTodoList = connect(
	state => ({
		todos: ((todos, filter) =>
		{
			switch (filter)
			{
				case 'SHOW_ALL': return todos;
				case 'SHOW_COMPLETED': return todos.filter(t =>  t.completed);
				case 'SHOW_ACTIVE'   : return todos.filter(t => !t.completed);
				default: throw new Error('Unknown filter: ' + filter);
			}
		})(state.todos.present, state.filter), 
	}), 
	{
		toggle: actions.toggleTodo, 
	}
)(({
	todos, 
	toggle, 
}) => (
	<div className="todo-list">
		<ul>
		{todos.map(todo =>
			<Todo key={todo.id} {...todo} onClick={e => toggle(todo.id)}/>
		)}
		</ul>
	</div>
));
const Todo = ({
	text, 
	completed, 
	onClick,  
}) => (
	<li className="todo"
		onClick={onClick}
		style={{
			textDecoration: completed ? 'line-through' : 'none', 
		}}
	>
		{text}
	</li>
);
const Filter = () => (
	<p>
		show: {' '}
		<FilterLink filter="SHOW_ALL">All</FilterLink>
		<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
		<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
	</p>
);
const FilterLink = connect(
	(state, own) => ({ active: own.filter === state.filter })
	, 
	(dispatch, own) => ({ apply: () => dispatch(actions.filter(own.filter)) })
)(({
	active, 
	apply, 
	children, 
}) => (
	<a className="filter-link button is-small"
		disabled={active}
		onClick={e =>
		{
			e.preventDefault();
			apply();
		}}
	>
		{children}
	</a>
));

import { ActionCreators as UndoActionCreators } from 'redux-undo';
const UndoRedo = connect(
	state => ({
		canUndo: state.todos.past  .length > 0, 
		canRedo: state.todos.future.length > 0, 
	})
	, 
	({
		onUndo: UndoActionCreators.undo, 
		onRedo: UndoActionCreators.redo, 
	})
)(({
	canUndo, 
	canRedo, 
	onUndo, 
	onRedo, 
}) => (
	<div className="undo-redo">
		<a className="button is-small" onClick={onUndo} disabled={!canUndo}>Undo</a>
		<a className="button is-small" onClick={onRedo} disabled={!canRedo}>Redo</a>
	</div>
));