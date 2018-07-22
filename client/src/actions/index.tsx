import * as actions from '../actions';
import * as constants from '../constants';
import * as types from '../types';


export interface SetUserAction {
    type: constants.SET_USER;
    payload?: types.UserState;
}

export const setUser = (payload?: types.UserState): SetUserAction => {
    return {
        type: constants.SET_USER,
        payload: payload,
    };
}

export interface UserStateProps {
    setUser: (payload?: types.UserState) => SetUserAction;
}
