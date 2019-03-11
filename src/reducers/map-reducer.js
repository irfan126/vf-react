import { RELOAD_MAP, RELOAD_MAP_FINISH } from '../actions/types';

const INITIAL_STATE = {
	isReloading: false
}

export const rentalMapReducer = (state= INITIAL_STATE, action) => {
	switch(action.type) {
		case RELOAD_MAP:
			return {isReloading: true};
		case RELOAD_MAP_FINISH:
			return {isReloading: false};
		default:
			return state;
	}
}