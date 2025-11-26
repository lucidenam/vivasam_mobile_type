import {createAction, handleActions} from 'redux-actions';
import * as api from 'lib/api';
import {ACCESS_TOKEN, SESSION_LOGGED_KEY} from '../../constants';
import * as common from 'lib/common';
import {Map} from 'immutable';
import {pender} from 'redux-pender';
import jwtDecode from 'jwt-decode';

// action types
const LOGIN = 'base/LOGIN';
const LOGOUT = 'base/LOGOUT';
const CHECK_LOGIN = 'base/CHECK_LOGIN';
const TEMP_LOGIN = 'base/TEMP_LOGIN';
const AUTO_LOGIN = 'base/AUTO_LOGIN';
const AWAKE = 'base/AWAKE';
const FIND_SLEEP = 'base/FIND_SLEEP';
const POP_VALUES = 'base/POP_VALUES';
const PUSH_VALUES = 'base/PUSH_VALUES';
const STICKY_HEIGHT = 'base/STICKY_HEIGHT';
const OPEN_LOADING = 'base/OPEN_LOADING';
const CLOSE_LOADING = 'base/CLOSE_LOADING';
const IDENTIFICATION_DATA = 'base/IDENTIFICATION_DATA';
const CHECK_AUTH_IPIN = 'base/CHECK_AUTH_IPIN';

// action creators
export const login = createAction(LOGIN, (id,pw) => api.login(id, pw), (id) => ({loggingId: id}));
export const snsLogin = createAction(LOGIN, (id, pw, object) => api.snsLogin(id, pw, object), (id) => ({loggingId: id}));
export const logout = createAction(LOGOUT);
export const checkLogin = createAction(CHECK_LOGIN, api.checkLogin);
export const tempLogin = createAction(TEMP_LOGIN);
export const autoLogin = createAction(AUTO_LOGIN);
export const awake = createAction(AWAKE, api.awake);
export const findSleep = createAction(FIND_SLEEP, api.findSleepId);
export const popValues = createAction(POP_VALUES);
export const pushValues = createAction(PUSH_VALUES);
export const stickyHeight = createAction(STICKY_HEIGHT);
export const openLoading = createAction(OPEN_LOADING);
export const closeLoading = createAction(CLOSE_LOADING);
export const identificationData = createAction(IDENTIFICATION_DATA, api.getIdentificationData);
export const checkAuthIPIN = createAction(CHECK_AUTH_IPIN, api.checkAuthIPIN);

const emptyLoginInfo = {
    memberId : '',
    memberName : '',
    mainSubjectName : '',
    mainSubject: '',
    schoolLvlCd: '',
    mLevel: '',
    mTypeCd: '',
    ssoMemberYN: '',
    teacherCertifiedYN: '',
    certifyCheck: '',
    epkiYn: '',
    regDate: '',
    memberPasswordModifyChk: ''
}
// initial state
const initialState = Map({
    logged: false, // 현재 로그인 상태
    loginInfo: Map(emptyLoginInfo),
    autoLogin: false,
    sleepId: '',
    authRequireId: '',
    valEndDate: '',
    title:'',
    returnUrl:'',
    stickyHeight: 0,
    isApp: null,
    fcmToken: null,
    soobakcState: null,
    searchInfo: null,
    qnaInfo: null,
    isLoading: false,
    loadingType: '',
    isFirst : false, /* 첫로그인시 마케팅 동의 정보 팝업 보여줄지 여부 */
    ssoLoginMode : true, // 통합회원 통신 여부 (on : true / off : false)
    reRegister: false	// 서류인증 재신청 여부
});

const logoutProcess = (state) => {
    api.logout();
    localStorage.removeItem(ACCESS_TOKEN);
    sessionStorage.removeItem(ACCESS_TOKEN);
    sessionStorage.removeItem(SESSION_LOGGED_KEY);
    return state.set('logged', false).mergeIn(['loginInfo'], emptyLoginInfo);
}

const loginProcess = (state, accessToken) => {
    try {
        const decPayload = jwtDecode(accessToken);
        const {memberInfo} = decPayload;
        sessionStorage.setItem(ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(SESSION_LOGGED_KEY, 'true');
        if(state.get('autoLogin')) {
            localStorage.setItem(ACCESS_TOKEN, accessToken);

            const tempToken = localStorage.getItem("exSsToken");
            api.getAutoLoginToken(memberInfo.memberId).then((response) => {
                localStorage.removeItem("exSsToken");
                localStorage.setItem("exSsToken",response.data.newToken);
            }).catch((error) => {
                console.log(error);
                localStorage.removeItem("exSsToken");
                localStorage.setItem("exSsToken", tempToken);
            });

        }else {
            localStorage.removeItem(ACCESS_TOKEN);
        }

        setTimeout(()=>{
            window.webViewBridge.send('getPushToken', '', function(res){ //Browser 에서는 동작하지 않습니다. WebView 에서만.
                if (res.value) {
                    api.syncAppToken(res.value, memberInfo.memberId);
                }
            }, function(err){
                //Do nothing.
            });
        },100);

        return state.set('logged', true).mergeIn(['loginInfo'], memberInfo);
    }catch(e) {
        console.log(e);
        return state;
    }
}

// reducer
export default handleActions({
    ...pender({
        type: LOGIN,
        onSuccess: (state, action) => {  // 로그인 성공 시
            state = state.set('valEndDate', action.payload.data.valEndDate);
            return loginProcess(state, action.payload.data.accessToken);
        },
        onError: (state, action) => {  // 에러 발생 시
            const data = action.payload && action.payload.response && action.payload.response.data;
            //휴면계정
            if(data.code === 'L002') {
                state = state.set('sleepId', action.meta.loggingId);
            }
            else if(data.code === 'L003' || data.code === 'L004') {
                state = state.set('authRequireId', action.meta.loggingId);
            }

            return logoutProcess(state);
        }
    }),
    ...pender({
        type: CHECK_LOGIN,
        onSuccess: (state, action) => {
            if(action.payload.data === "DUPLICATE") {
                common.info("다른기기에서 동일 아이디로 접속 되었습니다. 자동으로 로그아웃 됩니다.");
                window.document.location.href="/";
                state = logoutProcess(state);
                return state;
            } else if (action.payload.data === 'NOT_USER') {
                common.info("로그인된 회원정보가 없습니다. 로그아웃 됩니다.");
                window.document.location.href = "/";
                return logoutProcess(state);
            } else if(action.payload.data !== 'OK') {
                return logoutProcess(state);
            }
            return state;
        }
    }),
    ...pender({
        type: AWAKE,
        onSuccess: (state, action) => {
            if(action.payload.data === '0000') {
                state = state.set('sleepId', '');
            }
            return state;
        }
    }),
    ...pender({
        type: FIND_SLEEP,
        onSuccess: (state, action) => {
            let sleepId = '';
            if(action.payload.data.memberId) {
                sleepId = action.payload.data.memberId;
            }
            return state.set('sleepId', sleepId);
        },
        onError: (state, action) => {
            return state.set('sleepId', '');
        }
    }),
    ...pender({
        type: IDENTIFICATION_DATA,
        onSuccess: (state, action) => {
            const { data } = action.payload;
            //memberId
            //result
            //existId
            //existIdActive
            console.log(data);
            return data;
            // return state.setIn(['type', 'isSelected'], preData.isSelected)
            //             .setIn(['check', 'exception'], data.code ? data.code : '');
        },
        onError: (state, action) => {  // 에러 발생 시
            // return state.setIn(['check', 'exception'], action.payload.status);
        }
    }),
    [tempLogin](state, action) {
        return loginProcess(state, action.payload.accessToken);
    },
    [logout](state) {
        return logoutProcess(state);
    },
    [autoLogin](state, action) {
        return state.set('autoLogin', action.payload);
    },
    [PUSH_VALUES]: (state, action) => {
        const { type, object } = action.payload;
        return state.set(type, object);
    },
    [STICKY_HEIGHT]: (state, action) => {
        return state.set('stickyHeight', action.payload);
    },
    [OPEN_LOADING]: (state, action) => {
      let loadingType = '';
      if(action.payload && action.payload.loadingType) {
          loadingType = action.payload.loadingType;
      }
      return state.set('isLoading',true).set('loadingType',loadingType);
    },
    [CLOSE_LOADING]: (state, action) => {
      return state.set('isLoading',false);
    },
}, initialState)
