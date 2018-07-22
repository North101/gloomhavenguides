import { SetUserAction } from '../actions';
import { UserStateStore } from '../types/index';
import { SET_USER } from '../constants/index';


export function userState(state: UserStateStore, action: SetUserAction): UserStateStore {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };

    default:
      return state;
  }
}
