import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

// action types
const OPEN_VIEWER = 'viewer/OPEN_VIEWER';
const CLOSE_VIEWER = 'viewer/CLOSE_VIEWER';
const PUSH_VALUES = 'viewer/PUSH_VALUES';
const DEFAULT_DOC_VALUES = 'viewer/DEFAULT_DOC_VALUES';

// action creators
export const openViewer = createAction(OPEN_VIEWER);
export const closeViewer = createAction(CLOSE_VIEWER);
export const pushValues = createAction(PUSH_VALUES);
export const defaultDocValues = createAction(DEFAULT_DOC_VALUES);

// initial state
const initialState = fromJS({
  title: '',
  visible: false,
  target: '',
  doc: {
    content:'',
    toolbarClazz:'layer_help type5 hide',
    no: 1,
    totalCount: '',
    direction: ''
  },
  contentInfo: {
    content: ''
  }
});

// reducer
export default handleActions({
  [OPEN_VIEWER]: (state, action) => {
    const { title, target } = action.payload;
    return state.set('title',title).set('visible',true).set('target',target);
  },
  [CLOSE_VIEWER]: (state, action) => {
    return state.set('title','').set('visible',false).set('auth',false).set('target','');
  },
  [PUSH_VALUES]: (state, action) => {
      const { type, object } = action.payload;
      return state.set(type, fromJS(object));
  },
  [DEFAULT_DOC_VALUES]: (state, action) => {
      return state.set('doc',fromJS({
                      content:'',
                      toolbarClazz:'layer_help type5 hide',
                      no: 1,
                      totalCount: '',
                      direction: ''
                    }))
  }
}, initialState);
