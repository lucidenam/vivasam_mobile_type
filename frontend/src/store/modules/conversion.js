import {createAction, handleActions} from 'redux-actions';
import {fromJS} from 'immutable';
import {pender} from 'redux-pender';
import * as api from 'lib/api';

// action types
const POP_VALUES = 'conversion/POP_VALUES';
const PUSH_VALUES = 'conversion/PUSH_VALUES';
const MEMBER_INFO = 'conversion/MEMBER_INFO';
const DEFAULT_STORE = 'conversion/DEFAULT_STORE';
const CHECK_SSO_USER_ID = 'conversion/CHECK_SSO_USER_ID';
const CHECK_USER_EMAIL = 'conversion/CHECK_USER_EMAIL';
const CHECK_SSO_CONVERSION_ID = 'conversion/CHECK_SSO_CONVERSION_ID';
const INSERT_SSO_CONVERSION = 'conversion/INSERT_SSO_CONVERSION';


// action creators
export const popValues = createAction(POP_VALUES);
export const pushValues = createAction(PUSH_VALUES);
export const memberInfo = createAction(MEMBER_INFO, api.memberInfo);
export const defaultStore = createAction(DEFAULT_STORE);
export const checkSsoUserId = createAction(CHECK_SSO_USER_ID, api.checkAvailableSsoId);
export const checkUserEmail = createAction(CHECK_USER_EMAIL, api.checkExistEmail);
export const checkSsoConversionId = createAction(CHECK_SSO_CONVERSION_ID, api.checkConversionId);
export const inserSsoConversion = createAction(INSERT_SSO_CONVERSION, api.insertSsoConversion);

// initial state
const initialState = fromJS({
    event : {
        agree : false //통합회원 전환 안내 페이지 - 개인 정보 수집 및 이용 동의
    },
    agree : {
        all : false,
        special : false, //(통합회원)통합회원 특별 약관
        thirdPrivacy : false, //(통합회원)비바샘 - 개인정보 제3자 제공 동의
        tschService : false, //(통합회원)티스쿨 - 서비스 이용약관
        tschPrivacy : false, //(통합회원)티스쿨 - 개인정보 수집 및 이용 동의
        thirdMarketing : false, //(통합회원)티스쿨 - 교육청 위탁연수 정보 및 마케팅 활용 동의
        tschThirdParty : false, //(통합회원)티스쿨 - 개인정보 제3자 제공에 대한 동의
        agreeDate: '',
        mTypeCd: '0',
    },
    check : {
        vUser : {},
        tUsers : [],
        isExistTsch : false,
        isSameId : false,
        isSameIdInactive : false,
        sameUser : {},
        isDupleT : false,
        isInActiveT : false,
        isPossibleConversion : false,
        needNewId : false,
        ssoId : '',
        tId : '',
        existMemberId : '',
        existVivaEmail : '',
        existMemberInActive : false,
        existIdUsable : true,
        checkCase : '',
        sMessage : '',
        exception : ''
    },
    info : {
        ssoMember : false,
        validYN : 'N',
        newUserId : '',
        tschUserId : '',
        userName : '',
        userId : '',
        vUserId : '',
        duplicateId : false,
        oldPassword : '',
        password : '',
        passwordCheck : '',
        email : '',
        telephone : '',
        zipNo : '',
        address : '',
        addressDetail : '',
        birthDay : '',
        lunar : '1',
        gender : '',
        passwordModify :false,
        duplicateEmail : false,
        existTschoolId : '',
        isIpin : '',
        memberValidateType: '',
        memberValidateEmail: '',
    },
    school : {
        schoolName: '', //학교명(sch_name_searchedv)
        schoolCode: '', //학교코드(sch_code_searchedv)
        schoolGrade: '', //학교(등)급 E,M,H(sch_kind_sel_1)
        registTypeCode: '',//검색:0, 직접입력:1(sch_kind_directley)
        fkareaCode: '', //학교지역-시도코드(fkareacode)
        fkareaName: '', //학교지역-시도명(fkareacode)
        fkbranchCode: '',   //학교지역-시군구코드(fkbranchcode)
        fkbranchName: '',   //학교지역-시군구명(fkbranchcode)
        directlyAgree: false,   //학교변경 동의여부(directly_agree)
        requestedTerm: '',  //직접입력 별도 요청사항(requestedTerm)
        mainSubject : '',
        secondSubject : '',
        visangTbYN : 'Y',
        expiryTermNum : '',
        myGrade : '',
        grade:{
            g01:{checked:false,value:'1'},
            g02:{checked:false,value:'2'},
            g03:{checked:false,value:'3'},
            g04:{checked:false,value:'4'},
            g05:{checked:false,value:'5'},
            g06:{checked:false,value:'6'},
            g07:{checked:false,value:'7'}
        },
        conversionCheck: false
    }

});

// reducer
export default handleActions({
    ...pender({
        type: MEMBER_INFO,
        onSuccess: (state, action) => {
            const { data } = action.payload;
            let grade = state.toJS().school.grade;
            if(data.myGrade){
                data.myGrade.split(',').filter(function(item) {
                    let key = 'g0'+item;
                    if(grade[key].value){
                      grade[key].checked = true;
                    }
                    return
                });
            }
            let email, emailDomain, otherDomain, isOtherDomain;
            if(data.email){
                let s = data.email.split("@");
                email = s[0];
                let REGEXP_DOMAIN = /^(?:gmail.com|daum.net|hanmail.net|naver.com|nate.com)$/;
                if(s[1]){
                    if(REGEXP_DOMAIN.test(s[1])){
                        emailDomain = "@"+s[1]
                    }else{
                        emailDomain = "otherDomain"
                        otherDomain = s[1];
                        isOtherDomain = true;
                    }
                }
            }
            return state.setIn(['info','ssoMember'],data.ssoMember)
                        .setIn(['info','validYN'], data.validYn)
                        .setIn(['info','userId'],data.memberId)
                        .setIn(['info','vUserId'],data.memberId)
                        .setIn(['info','userName'],data.name)
                        .setIn(['info','email'],data.email)
                        // .setIn(['check','email'],email ? email : '')
                        // .setIn(['check','emailDomain'],emailDomain ? emailDomain : '')
                        // .setIn(['check','otherDomain'],otherDomain ? otherDomain : '')
                        // .setIn(['check','isOtherDomain'],isOtherDomain ? true : false)
                        .setIn(['info','telephone'],data.cellphone ? data.cellphone : '')
                        .setIn(['info','zipNo'],data.zip ? data.zip : '')
                        .setIn(['info','address'],data.addr1 ? data.addr1 : '')
                        .setIn(['info','addressDetail'],data.addr2 ? data.addr2 : '')
                        .setIn(['info','birthDay'],data.birth ? data.birth.substring(0,4)+'-'+data.birth.substring(4,6)+'-'+data.birth.substring(6,8) : '')
                        .setIn(['info','gender'],data.sex ? data.sex : '')
                        .setIn(['info','lunar'],data.lunar ? data.lunar : '')
                        .setIn(['school','schoolName'],data.schName ? data.schName : '')
                        .setIn(['school','schoolGrade'],data.schFlag ? data.schFlag : '')
                        .setIn(['school','schoolCode'],data.schCode ? data.schCode : '')
                        .setIn(['school','grade'],grade ? grade : '')
                        .setIn(['school','myGrade'],data.myGrade ? data.myGrade : '')
                        .setIn(['school','fkareaCode'],data.fkareacode ? data.fkareacode : '')
                        .setIn(['school','fkareaName'],data.fkareaname ? data.fkareaname : '')
                        .setIn(['school','fkbranchCode'],data.fkbranchcode ? data.fkbranchcode : '')
                        .setIn(['school','fkbranchName'],data.fkbranchname ? data.fkbranchname : '')
                        .setIn(['school','mainSubject'],data.mainSubject ? data.mainSubject : '')
                        .setIn(['school','secondSubject'],data.secondSubject ? data.secondSubject : '')
                        .setIn(['school','visangTbYN'],data.visangTbYN ? data.visangTbYN : '')
                        .setIn(['school','expiryTermNum'],data.expiryTermNum ? data.expiryTermNum : '')
                        // .setIn(['agree','marketingEmail'],data.marketingEmailYn==='Y' ? true : false)
                        // .setIn(['agree','marketingSms'],data.marketingSmsYn==='Y' ? true : false)
                        // .setIn(['agree','marketingTel'],data.marketingTelYn==='Y' ? true : false)
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    ...pender({
        type: CHECK_SSO_USER_ID,
        onSuccess: (state, action) => {
          const { data: code } = action.payload;
          return state.setIn(['info','duplicateId'], !code);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['info','duplicateId'], false);
        }
    }),
    ...pender({
        type: CHECK_USER_EMAIL,
        onSuccess: (state, action) => {
          const { data } = action.payload;
          return state.setIn(['info','duplicateEmail'], !data);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['info','duplicateEmail'], false);
        }
    }),
    ...pender({
        type: CHECK_SSO_CONVERSION_ID,
        onSuccess: (state, action) => {
            const { data } = action.payload;

            console.log(data);

            //비바샘 아이디 정보
            let vUser = data.existId;
            //비바샘 아이디 유무.
            let isExistViva = (data.existId != null && data.existId != '') ? true : false;
            //티스쿨 아이디 목록
            let tUsers = data.tschool ? (data.tschool.tschoolUser ? data.tschool.tschoolUser : data.tschool) : [];
            //티스쿨 아이디 유무
            let isExistTsch = tUsers.length > 0 ? true : false;
            //티스쿨 아이디 다중 여부
            let isDupleT = tUsers.length > 1 ? true : false;
            //티스쿨 아이디 휴면 여부
            let isInActiveT = isExistTsch && data.tschool.isActiveT == 'false' ? true : false;
            //티스쿨 아이디 한개일때 사용 가능 여부.
            let isUsableT = (isExistTsch && !isDupleT && !isInActiveT) ? (tUsers[0].isusable === 'true' ? true : false) : false;
            //비바샘, 티스쿨 동일 아이디 소유한 경우
            let isSameId = false;
            //통합회원 전환을 위한 체크케이스(1~7)
            let checkCase = data.checkCase;

            let tId = tUsers.length == 1 ? tUsers[0].tid : '';
            return state.setIn(['check', 'vUser'], vUser)
                        .setIn(['check', 'tUsers'], tUsers)
                        .setIn(['check', 'isExistViva'], isExistViva)
                        .setIn(['check', 'isExistTsch'], isExistTsch)
                        .setIn(['check', 'sameUser'], isSameId)
                        .setIn(['check', 'isDupleT'], isDupleT)
                        .setIn(['check', 'isInActiveT'], isInActiveT)
                        .setIn(['check', 'isUsableT'], isUsableT)
                        .setIn(['check', 'isSameId'], isSameId)
                        .setIn(['check', 'tId'], tId)
                        .setIn(['check', 'existMemberId'], data.existId)
                        .setIn(['check', 'existVivaEmail'], data.existVivaEmail)
                        .setIn(['check', 'existMemberInActive'], data.existIdActive === 'Y' ? false : true)
                        .setIn(['check', 'existIdUsable'], data.existIdUsable)
                        .setIn(['check', 'isPossibleConversion'], !isExistViva && !isDupleT && !isInActiveT ? true : false)
                        .setIn(['check', 'checkCase'], checkCase)
                        .setIn(['check', 'sMessage'], data.sMessage)
                        .setIn(['check', 'exception'], data.code ? data.code : '');
        },
        onError: (state, action) => {  // 에러 발생 시
              return state.setIn(['check', 'exception'], action.payload.response.status);
        }
    }),
    ...pender({
        type: INSERT_SSO_CONVERSION,
        onSuccess: (state, action) => {
            const { data } = action.payload;
            const d = new Date();
            const dtxt = d.getFullYear() + '년 ' + parseInt(d.getMonth()+1,10) + '월 ' + d.getDate() + '일';
            return state.setIn(['school','joinCheck'], data === '0000' ? true : false).setIn(['agree','agreeDate'],dtxt);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['school','joinCheck'], false);
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
