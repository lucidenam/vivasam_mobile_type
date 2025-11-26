import {createAction, handleActions} from "redux-actions";
import {fromJS, Map} from "immutable";
import {pender} from "redux-pender";
import * as api from 'lib/api';
// action triggering (Action 은 Trigger 의 기능만 한다. 외부로 Value 를 Return 하는건 안된다.)
// action type
const PUSH_VD = '/dinfo/PUSH_VD';
const PUSH_SVD = '/dinfo/PUSH_SVD';
const GET_SVD = '/dinfo/GET_SVD'
const POP_VD = '/dinfo/POP_VD';
const DEFAULT_SD = '/dinfo/DEFAULT_SD';
const APID_CONVERTER = '/dinfo/APID_CONVERTER';

// Action Creator (각 컴포넌트에서 실제 호출되는 함수)
export const push_vd_obj = createAction(PUSH_VD);
export const pop_vd_obj = createAction(POP_VD);
export const default_sd = createAction(DEFAULT_SD);
export const push_svd_obj = createAction(PUSH_SVD);
export const get_svd_obj = createAction(GET_SVD);
// export const apiD_converter = createAction(APID_CONVERTER, (targetLinkPath) => api.getDLinkConverter(targetLinkPath));

// Declare from js
// const initialState = fromJS({
//     isDType : false, // d type [true || false] => not function
//     test: {
//         // when need test setting object
//     },
//     infoD: {
//         type: ``, //
//         path: `/`, // path
//         searchP: ``, // search Query
//         ptype: ``
//     },
//     apiD: {
//         data: {},
//         status: false,
//         exMsg: ``,
//         resCode: -1
//     }
// });
// const testObj = {
//     // when need test setting object};
// }

const infoDObj = {
    isDType : false,
    isInAppBR : false, // From is inAppBR
    isMultiSearchParam : false, // if contain multi Search Param on Search Param
    type: ``, // type that access point when click
    path: `/`, // access Path on Previously
    searchP: ``, // search Query
    ptype: ``, // platform types <AOS / IOS>
    pathCurrent: ``, // current Path
    fromWhere: `` // Access Entry Point Kinds <Mobile Browser / or Any What>
}

const apiDObj = {
    data: Map({}),
    status: false,
    exMsg: ``,
    resCode: -1
}

const initialState = Map({
    //isDType : false, // d type [true || false] => not function
    //test: Map(testObj),
    infoD: Map(infoDObj),
    apiD: Map(apiDObj)
});
export default handleActions({
   [PUSH_VD]: (state, action) => {
        // 부모 컴포넌트에서 자식 컴포넌트로 직접 데이터를 전달하는 경우
        const {type, object} = action.payload;
        //console.log('Actions : ' + JSON.stringify(fromJS(object)));
        //console.log('Type : ' + JSON.stringify(type));
        return state.set(type, fromJS(object));
   },
   [PUSH_SVD]: (state, action) => {
       // 가공 처리이후 전달받고자하는 데이터를 컴포넌트간 종속관계에 상관하지 않고 저장하는 경우
       // Push || Change can accept
        const {type, object} = action.payload;
        //console.log(`${JSON.stringify(type)} ${JSON.stringify(object)}`);
        return state.setIn(['infoD', 'type'], object.type)
            .setIn(['infoD', 'path'], object.path)
            .setIn(['infoD', 'searchP'], object.searchP)
            .setIn(['infoD','ptype'], object.ptype)
            .setIn(['infoD','pathCurrent'], object.pathCurrent)
            .setIn(['infoD','fromWhere'], object.fromWhere)
            .setIn(['infoD','isDType'], object.isDType);
   },
   [GET_SVD]: (state) => {
       // 저장된 값 확인 state = {저장된 객체 본체}
       //console.log(`GET_SVD : ${state} ${state.getIn(['infoD'])}`);
       return state;
   },
   [POP_VD]: (state) => {
       // 저장된 값 확인
       return state;
   },
   [DEFAULT_SD]: (state) => {
       state = initialState;
       //console.log(`State : ${state}`);
       return state;
   },
   ...pender({
        type : APID_CONVERTER,
        onSuccess: (state, action) => {
            const { data, status } = action.payload.apiD;
            //console.log(`APID_CONVERT_HS_DEV_CALL : ${data} ${status}`);
            // set when data response received at success
            // state set data by setIn || return value on directly
            return state.setIn(['apiD','data'], data).setIn(['apiD','status'], status);
        },
        onError: (state, action) => {
            const { status, resCode } = action.payload.apiD;
            //console.log(`APID_CONVERT_HS_DEV_CALL : ${status} ${resCode}`);
            // set when data response received at error
            // return value on directly
            // state set data by setIn || return value on directly
            return state.setIn(['apiD','status'], status ).setIn(['apiD','resCode'], resCode);
        }
   })
}, initialState);
