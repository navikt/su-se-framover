import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import combineReducers from './combineReducers';

const Store = createStore(combineReducers, applyMiddleware(thunk));

export default Store;
