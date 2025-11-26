import { createAction, handleActions } from 'redux-actions';

import { fromJS } from 'immutable';

// action types
const OPEN_POPUP = 'popup/OPEN_POPUP';
const CLOSE_POPUP = 'popup/CLOSE_POPUP';

// action creators
export const openPopup = createAction(OPEN_POPUP);
export const closePopup = createAction(CLOSE_POPUP);

// initial state
// counter 내교과서 카운팅
const initialState = fromJS({
  title: '',
  visible: false,
  componet: '',
  closeButtonHidden: false,
  wrapClassName: '',
  templateClassName: '',
  counter: 0
});

// reducer
export default handleActions({
  [OPEN_POPUP]: (state, action) => {
    const { title, componet, closeButtonHidden, wrapClassName, templateClassName, counter } = action.payload;
    return state.set('title',title).set('visible',true).set('componet',componet).set('closeButtonHidden', closeButtonHidden).set('wrapClassName', wrapClassName).set('templateClassName', templateClassName).set('counter',counter);
  },
  [CLOSE_POPUP]: (state, action) => {
    return state.set('title','').set('visible',false).set('componet','').set('closeButtonHidden', false).set('wrapClassName', '').set('templateClassName', '').set('counter', 0);
  }
}, initialState);
