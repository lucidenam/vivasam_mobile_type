import { createAction, handleActions } from 'redux-actions';
import * as api from 'lib/api';
import { fromJS } from 'immutable';
import { pender } from 'redux-pender';

// action types
const POP_VALUES = 'library/POP_VALUES';
const PUSH_VALUES = 'library/PUSH_VALUES';
const DEFAULT_VALUES = 'library/DEFAULT_VALUES';
const META_DATA = 'library/META_DATA';
// const POP_VALUES = 'fastMusicLibrary/POP_VALUES';
// const PUSH_VALUES = 'fastMusicLibrary/PUSH_VALUES';
// const DEFAULT_VALUES = 'fastMusicLibrary/DEFAULT_VALUES';
// const META_DATA = 'fastMusicLibrary/META_DATA';

// action creators
export const popValues = createAction(POP_VALUES);
export const pushValues = createAction(PUSH_VALUES);
export const defaultValues = createAction(DEFAULT_VALUES);
// export const metaData = createAction(META_DATA, api.metaData);
// export const metaData = createAction(META_DATA, api.fastMusicLibraryCode);
export const metaData = createAction(META_DATA, api.fastMusicLibraryData);

// initial state
const initialState = fromJS({
    pagesize : 20,
    data:'',
    code : 663,
    scode : '',
    name : '전체',
    sname : '',
    word : '',
    metaCode: {},
    metaData: {},
    visible: false,
    links: {},
    totalElements: '',
    all: true,
    categoryVisible: false,
    stotalCnt:''
});

// reducer
export default handleActions({
    ...pender({
        type: META_DATA,
        onSuccess: (state, action) => {
          const { data: code } = action.payload;
          return true;
        },
        onError: (state, action) => {  // 에러 발생 시
            return false;
        }
    }),
    [POP_VALUES]: (state, action) => {
        return state;
    },
    [PUSH_VALUES]: (state, action) => {
        const { type, object } = action.payload;
        let obj;
        if(type === 'metaCode' || type === 'metaData' || type === 'links'){
          obj = fromJS(object);
        }else{
          obj = object;
        }
        return state.set(type, obj);
    },
    [DEFAULT_VALUES]: (state, action) => {
        return state.set('code','')
                    .set('scode','')
                    .set('name','전체')
                    .set('sname','')
                    .set('scode','')
                    .set('word','')
                    .set('metaCode',fromJS({}))
                    .set('metaData',fromJS({}))
                    .set('visible',false)
                    .set('links',fromJS({}))
                    .set('totalElements','')
                    .set('all',true)
                    .set('categoryVisible',false)
                    .set('stotalCnt','')
    }
}, initialState);
