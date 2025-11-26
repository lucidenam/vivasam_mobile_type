import {createAction, handleActions} from 'redux-actions';
import * as api from 'lib/api';
import {fromJS} from 'immutable';
import {pender} from 'redux-pender';

// action types
const POP_VALUES = 'saemteo/POP_VALUES';
const PUSH_VALUES = 'saemteo/PUSH_VALUES';
const INSERT_APPLY = 'saemteo/INSERT_APPLY';
const INSERT_SURVEY_APPLY = 'saemteo/INSERT_SURVEY_APPLY';
const INSERT_EVENT_APPLY = 'saemteo/INSERT_EVENT_APPLY';
const DEFAULT_STORE = 'saemteo/DEFAULT_STORE';
const INSERT_EVENT_NOFORM_APPLY = 'saemteo/INSERT_EVENT_NOFORM_APPLY';
const GET_EVENT_ANSWER_LIST = 'samteo/GET_EVENT_ANSWER_LIST';
const SET_EVENT_ANSWER_DELETE = 'samteo/SET_EVENT_ANSWER_DELETE';
const SET_EVENT_ANSWER_UPDATE = 'samteo/SET_EVENT_ANSWER_UPDATE';
const SET_EVENT_JOIN_ANSWER_ADD_INSERT = 'samteo/SET_EVENT_JOIN_ANSWER_ADD_INSERT';
const CHECK_EVENT_TOTAL_JOIN = 'samteo/CHECK_EVENT_TOTAL_JOIN';
const GET_EVENT_ANSWER_SINGLE_QUESTION = 'samteo/GET_EVENT_ANSWER_SINGLE_QUESTION';
const GET_GIFT_BUNDLE_COUNT = "samteo/GET_GIFT_BUNDLE_COUNT";
const GET_CLASS_LIVE_QUESTION_EVENT_AMOUNT = "samteo/GET_CLASS_LIVE_QUESTION_EVENT_AMOUNT";
const INSERT_AMOUNT_EVENT_APPLY = 'samteo/INSERT_AMOUNT_EVENT_APPLY';
const CHECK_PRIVATE_EVENT_MEMBER = 'samteo/CHECK_PRIVATE_EVENT_MEMBER';
const GOOGLE_SURVEY_COUNT_CHECK = 'samteo/GOOGLE_SURVEY_COUNT';
const INSERT_GOOGLE_EVENT_APPLY = 'samteo/INSERT_GOOGLE_EVENT_APPLY';
const INSERT_MONITORING_EVENT = 'samteo/INSERT_MONITORING_EVENT';
const EVENT_MEMBER_SCHOOL_INFO = 'samteo/EVENT_MEMBER_SCHOOL_INFO';
const EVENT_ANSWER_DESC_CHECK = 'samteo/EVENT_ANSWER_DESC_CHECK';
const EVENT_CHECK_LIMIT_COUNT = 'samteo/EVENT_CHECK_LIMIT_COUNT';
const CHK_EVENT_JOIN_QNT_CNT = 'samteo/CHK_EVENT_JOIN_QNT_CNT';
const CHK_EVENT_REMAINS_QNT_CNT = 'samteo/CHK_EVENT_REMAINS_QNT_CNT';
const GET_EVENT_MY_ANSWER = 'samteo/GET_EVENT_MY_ANSWER';
const GET_MEMBER_INFO = 'samteo/GET_MEMBER_INFO';

// action creators
export const popValues = createAction(POP_VALUES);
export const pushValues = createAction(PUSH_VALUES);
export const insertApply = createAction(INSERT_APPLY, api.insertApply);
export const insertSurveyApply = createAction(INSERT_SURVEY_APPLY, api.insertSurveyApply);
export const insertEventApply = createAction(INSERT_EVENT_APPLY, api.insertEventApply);
export const insertEventApplyAll = createAction(INSERT_EVENT_APPLY, api.insertEventApplyAll);
export const insertEventApply451 = createAction(INSERT_EVENT_APPLY, api.insertEventApply451);
export const defaultStore = createAction(DEFAULT_STORE);
export const insertNoFormEventApply = createAction(INSERT_EVENT_NOFORM_APPLY, api.insertNoFormEventApply);
export const getEventAnswerList = createAction(GET_EVENT_ANSWER_LIST, api.getEventAnswerList);
export const setEventAnswerDelete = createAction(SET_EVENT_ANSWER_DELETE, api.setEventAnswerDelete);
export const setEventAnswerUpdate = createAction(SET_EVENT_ANSWER_UPDATE, api.setEventAnswerUpdate);
export const setEventJoinAnswerAddInsert = createAction(SET_EVENT_JOIN_ANSWER_ADD_INSERT, api.setEventJoinAnswerAddInsert);
export const checkEventTotalJoin = createAction(CHECK_EVENT_TOTAL_JOIN, api.checkEventTotalJoin);
export const getEventAnswerSingleQuestion = createAction(GET_EVENT_ANSWER_SINGLE_QUESTION, api.getEventAnswerSingleQuestion);
export const getGiftBundleCount = createAction(GET_GIFT_BUNDLE_COUNT, api.getGiftBundleCount);
export const getClassLiveQuestionEventAmount = createAction(GET_CLASS_LIVE_QUESTION_EVENT_AMOUNT, api.getClassLiveQuestionEventAmount);
export const insertAmountEventApply = createAction(INSERT_AMOUNT_EVENT_APPLY, api.insertAmountEventApply);
export const checkPrivateEventMember = createAction(CHECK_PRIVATE_EVENT_MEMBER, api.checkPrivateEventMember);
export const googleSurveyCountCheck = createAction(GOOGLE_SURVEY_COUNT_CHECK, api.googleSurveyCountCheck);
export const insertGoogleEventApply = createAction(INSERT_GOOGLE_EVENT_APPLY, api.insertGoogleEventApply);
export const insertMonitoringEvent = createAction(INSERT_MONITORING_EVENT, api.insertMonitoringEvent);
export const eventMemberSchoolInfo  = createAction(EVENT_MEMBER_SCHOOL_INFO, api.eventMemberSchoolInfo);
export const eventAnswerDescCheck = createAction(EVENT_ANSWER_DESC_CHECK, api.eventAnswerDescCheck);
export const eventCheckLimitAmount = createAction(EVENT_CHECK_LIMIT_COUNT, api.eventCheckLimitAmount);
export const chkEventJoinQntCnt = createAction(CHK_EVENT_JOIN_QNT_CNT, api.chkEventJoinQntCnt);
export const chkEventRemainsQntCnt = createAction(CHK_EVENT_REMAINS_QNT_CNT, api.chkEventRemainsQntCnt);
export const getEventMyAnswer = createAction(GET_EVENT_MY_ANSWER, api.getEventMyAnswer);
export const getMemberInfo = createAction(GET_MEMBER_INFO, api.memberInfo);

// initial state
const initialState = fromJS({
    apply : {
        memberId : '',
        userName : '',
        email : '',
        emailDomain : '',
        otherDomain : '',
        isOtherDomain : false,
        cellphone : '',
        withPeopleNumber : '',
        agree : false,
        addAgree : false,
        cultureActId : '',
        addCheckboxYn : 'N'
    },
    survey : {
        surveyId : '',
        surveyItemNo : '',
        surveyType : '',
        surveyTypeCd : '',
        surveySubjective : '',
        surveyDuplSelCnt : '',
        isOverTextLength : false
    },
    event : {
        memberId : '',
        userName : '',
        cellphone : '',
        agree : false,
        inputType : '개인정보 불러오기',
        schName : '',
        schZipCd : '',
        schAddr : '',
        addressDetail : '',
        receive : '교무실',
        receiveEtc : '',
        receiveGrade : '',
        receiveClass : '',
        userInfo : 'Y',
        eventId : '',
        eventAnswerDesc : '',
        eventAnswerSeq : '',
        amount : '', // 이벤트 수량 추가
        eventType : '',  // 이벤트 Type 추가
        answer:'',
    },
    answerPage : { // 응답 출력 내용 ( 시작 Index, Page Size )
        pageNo : '',
        pageSize : ''
    },
    eventAnswer : { // "Question : [ Q1 : A1,  Q2 : A2 ] "
        eventAnswerContent : ''
    },
    eventGiftBundleCount : { // 설렘꾸러미 카운트
        eventGiftCount: ''
    },
    eventMonitoring : { // 모니터링단 이벤트
        number : '', // 횟수
        memberId : '', // 아이디
        teacherCareer : '', // 교사 경력
        applyReason : '', // 지원 이유
        activityDesc : '', // 개인 활용내역
        mSubjectCd : '' // 비교과 구분
    },

    roulette: { //룰렛 이벤트
        start: false, //룰렛시작여부
        prizeIdx: "", //상품index
        prizeName: "", //상품명
    }
});

// reducer
export default handleActions({
    ...pender({
        type: INSERT_APPLY,
        onSuccess: (state, action) => {
            const { data } = action.payload;
            let email;
            if(data.email){
                let s = data.email.split("@");
                email = s[0];
            }
            return state.setIn(['apply','email'],email ? email : '');
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    ...pender({
        type: INSERT_SURVEY_APPLY,
        onSuccess: (state, action) => {
            return state;
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    ...pender({
        type: INSERT_EVENT_APPLY,
        onSuccess: (state, action) => {
            return state;
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    [POP_VALUES]: (state, action) => {
        return state;
    },
    [PUSH_VALUES]: (state, action) => {
        const { type, object } = action.payload;
        return state.set(type, fromJS(object));
    },
    [DEFAULT_STORE]: (state, action) => {
        state = initialState;
        return state;
    }
}, initialState);
