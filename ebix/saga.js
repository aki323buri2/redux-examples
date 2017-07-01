import { fork, join, put, call, all, takeEvery, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
const fetch = url => axios.get(url).then(res => res.data);
fetch.missings = () => fetch('http://sirius/ebix/genka/missings');
fetch.similar  = s  => fetch(`http://sirius/ebix/hinsyu/similar/${s}/100`);

import { createActions } from 'redux-actions';
const actions = createActions(...[
	'REQUEST_MISSINGS', 
	'RECEIVE_MISSINGS', 
	'REQUEST_MISSINGS_SIMILAR', 
	'RECEIVE_MISSINGS_SIMILAR_OF', 
	'RECEIVE_MISSINGS_SIMILAR_OF_ALL', 
]);

const rootSaga = function *()
{
	yield takeLatest('RELOAD', function *()
	{
		yield put(actions.requestMissings());
		const missings = yield call(fetch.missings);
		yield put(actions.receiveMissings(missings));

		yield put(actions.requestMissingsSimilar());
		yield all(missings.map(({ hinmei }, index) => call(function *()
		{
			const similar = yield call(fetch.similar, hinmei);
			yield put(actions.receiveMissingsSimilarOf({ index, similar }));
		})));
		yield put(actions.receiveMissingsSimilarOfAll());
	});
};
export default rootSaga;