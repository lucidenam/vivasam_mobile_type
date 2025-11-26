import {createAction, handleActions} from 'redux-actions';
import * as api from 'lib/api';
import {fromJS, List, Map} from 'immutable';
import {pender} from 'redux-pender';


// action types
const MY_CLASS_INFO = 'myclass/MY_CLASS_INFO'; //내 학교급, 교과정보
const MY_TEXTBOOKS = 'myclass/MY_TEXTBOOKS'; //내교과서 목록
const MY_RECOMMEND_SUBJECTS = 'myclass/MY_RECOMMEND_SUBJECTS'; //추천교과
const MY_MATERIAL_VIEWS = 'myclass/MY_MATERIAL_VIEWS'; //추천교과
const PUSH_VALUES = 'myclass/PUSH_VALUES';

// action creators
export const myClassInfo = createAction(MY_CLASS_INFO, api.myClassInfo);
export const myTextBooks = createAction(MY_TEXTBOOKS, api.myTextBookInfoList);
export const myRecommendSubjects = createAction(MY_RECOMMEND_SUBJECTS, api.recommendSubjectList);
export const myMaterialViews = createAction(MY_MATERIAL_VIEWS, api.myMaterialViewList);
export const pushValues = createAction(PUSH_VALUES);

const emptyMyClassInfo = {
    memberId: '',
    schoolLvlCd:'',    //학교급
    schoolName: '',
    mainSubject: '',    //대표교과
    mainSubjectName: '',   //대표교과
    mainCourseCd: '',   //메인과목코드,
    secondSubject: '',  //추가교과
    secondSubjectName: '',  //추가교과명
    //secondCourseCd: ''  //추가교과목코드
    myGrades: '',
    myGrade: ''
};

// initial state
const initialState = Map({
    myClassInfo: emptyMyClassInfo,
    myTextBooks: [], //내교과서목록,
    recommentSubjectInfo: Map({
        subjectInfo: Map({

        }),
        recommendSubjects: List([])
    }), //추천교과자료
    myMaterialViews: [],  //최근열람자료
    myDefaultCafeSubjectCd: null,
    myDefaultElementaryGrade: null,
    lastElementaryGrade: null,
    lastCafeSubjectCd: '',
    subjectTypeCd:''
});

// reducer
export default handleActions({
    ...pender({
        type: MY_TEXTBOOKS,
        onSuccess: (state, action) => { //조회성공시
            return state.set('myTextBooks', action.payload.data);
        },
        onError: (state, action) => {   //에러발생시
            return state;
        }
    }),
    ...pender({
        type: MY_CLASS_INFO,
        onSuccess: (state, action) => { //조회성공시
            /*
			const { memberId, schoolLvlCd, schoolName, mainSubject, mainSubjectName, mainCourseCd, secondSubject, secondSubjectName, myGrades, myGrade, memberName, usableMileage } = action.payload.data;
			return state.set('myClassInfo', {
			  memberId,
			  schoolLvlCd,
			  schoolName,
			  mainSubject,
			  mainSubjectName,
			  mainCourseCd,
			  secondSubject,
			  secondSubjectName,
			  //secondCourseCd
			  myGrades,
			  myGrade,
			  memberName,
			  usableMileage
			});
			*/
            return state.set('myClassInfo', action.payload.data);
        },
        onError: (state, action) => {   //에러발생시
            return state.set('myClassInfo', fromJS(emptyMyClassInfo).toJS());
        }
    }),
    ...pender({
        type: MY_RECOMMEND_SUBJECTS,
        onSuccess: (state, action) => { //조회성공시
            return state.set('recommentSubjectInfo', fromJS(action.payload.data));
        },
        onError: (state, action) => {   //에러발생시
            return state;
        }
    }),
    ...pender({
        type: MY_MATERIAL_VIEWS,
        onSuccess: (state, action) => { //조회성공시
            return state.set('myMaterialViews', List(action.payload.data));
        },
        onError: (state, action) => {   //에러발생시
            return state;
        }
    }),
    [PUSH_VALUES]: (state, action) => {
        const { type, object } = action.payload;
        return state.set(type, object);
    }
}, initialState)
