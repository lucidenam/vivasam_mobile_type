import {createAction, handleActions} from 'redux-actions';
import {fromJS} from 'immutable';
import {pender} from 'redux-pender';
import * as api from 'lib/api';

// action types
const POP_VALUES = 'join/POP_VALUES';
const PUSH_VALUES = 'join/PUSH_VALUES';
const CHECK_USER = 'join/CHECK_USER';
const CHECK_USER_ID = 'join/CHECK_USER_ID';
const INSERT_JOIN = 'join/INSERT_JOIN';
const UPDATE_MEMBER_INFO = 'join/UPDATE_MEMBER_INFO';
const MEMBER_INFO = 'join/MEMBER_INFO';
const MEMBER_INFO_CHECK = 'join/MEMBER_INFO_CHECK';
const DEFAULT_STORE = 'join/DEFAULT_STORE';
const CHECK_SSO_USER = 'join/CHECK_SSO_USER';
const CHECK_SSO_USER_ID = 'join/CHECK_SSO_USER_ID';
const CHECK_USER_EMAIL = 'join/CHECK_USER_EMAIL';
const IDENTIFICATION_DATA = 'join/IDENTIFICATION_DATA';

// action creators
export const popValues = createAction(POP_VALUES);
export const pushValues = createAction(PUSH_VALUES);
export const checkUser = createAction(CHECK_USER, api.checkUser);
export const checkUserId = createAction(CHECK_USER_ID, api.checkUserId);
// export const insertJoin = createAction(INSERT_JOIN, api.insertJoin);
export const insertJoin = createAction(INSERT_JOIN, api.insertSsoJoin);
export const insertSnsJoin = createAction(INSERT_JOIN, api.insertSnsSsoJoin);
export const updateMemberInfo = createAction(UPDATE_MEMBER_INFO, api.updateMemberInfo);
export const memberInfo = createAction(MEMBER_INFO, api.memberInfo);
export const memberInfoCheck = createAction(MEMBER_INFO_CHECK, api.memberInfoCheck);
export const defaultStore = createAction(DEFAULT_STORE);
export const checkSsoUser = createAction(CHECK_SSO_USER, api.checkJoinedMember);
export const checkSsoUserId = createAction(CHECK_SSO_USER_ID, api.checkAvailableSsoId);
export const checkUserEmail = createAction(CHECK_USER_EMAIL, api.checkExistEmail);
export const identificationData = createAction(IDENTIFICATION_DATA, api.getIdentificationData);

// initial state
const initialState = fromJS({
    test: false, // 테스트인경우 true, 운영은 false
    type : {
        isSelected : false, //회원가입시 통합회원선택 진행 여부
        ssoMember : true //통합회원 여부
    },
    agree : {
        all : false,
        special : false, //(통합회원)통합회원 특별 약관
        service : false, //비바샘 - 서비스 이용약관
        privacy : false, //비바샘 - 개인정보 수집 및 이용 동의
        marketing : false, //비바샘 - 마케팅 광고 활용 동의
        thirdPrivacy : false, //(통합회원)비바샘 - 개인정보 제3자 제공 동의
        tschService : false, //(통합회원)티스쿨 - 서비스 이용약관
        tschPrivacy : false, //(통합회원)티스쿨 - 개인정보 수집 및 이용 동의
        thirdMarketing : false, //(통합회원)티스쿨 - 교육청 위탁연수 정보 및 마케팅 활용 동의
        tschThirdParty : false, //(통합회원)티스쿨 - 개인정보 제3자 제공에 대한 동의
        agreeDate: '',
        marketingEmail : false,
        marketingSms : false,
        marketingTel : false,
        tschMarketingEmail: false,
        tschMarketingSms: false,
        tschMarketingTel: false,
        mTypeCd: '0',
    },
    check : {
        userName : '',
        email : '',
        emailDomain : '',
        otherDomain : '',
        isOtherDomain : false,
        cellphone : '',
        user : false,
        existMemberId : '',
        existVivaEmail : '',
        existMemberInActive : false,
        existIdUsable : true,
        tUsers : [],
        isExistViva : false,
        isExistTsch : false,
        isDupleT : false,
        isInActiveT : false,
        isPossibleConversion : false,
        isUsableT : false,
        isSameId : false,
        ssoId : '',
        tId : '',
        checkCase : '',
        sMessage : '',
        //-----
        // userName : '가나다',
        // email : 'test',
        // emailDomain : 'otherDomain',
        // otherDomain : 'test.test',
        // isOtherDomain : true,
        // cellphone : '010123412',
        // user : false, //이거 뭐더라....?
        // existMemberId : '', //없어도 되는듯?
        //-----
        exception : ''
    },
    info : {
        tschUserId : '',
        userName : '',
        userId : '',
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
        existTschoolUsers : {},
        isIpin : '',
        type : '', //NICE or IPIN
        ssoMember : null,
        regDate : '',
        accessToken : '',
        apiId: '',
        idToken: '',
        memberValidateType: '',
        memberValidateEmail: '',
    },
    sso: {
        uuid: '',
        vUserId: '',
        tschUserId: '',
        newUserId: '',
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
        visangTbYN : '',
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
        joinCheck: false
    },
    //개인정보 변경 여부 체크를 위한 객체
    initInfo: {},
    initSchool: {},
    initAgree: {},
    initSnsList: {
        'NAVER': false,
        'KAKAO': false,
        'FACEBOOK': false,
        'GOOGLE': false,
        'WHALESPACE': false,
        'APPLE': false,
    },
    recoJoinInfo: {
        reco: '',
        via: '',
    },
});

// reducer
export default handleActions({
    ...pender({
        type: CHECK_USER,
        onSuccess: (state, action) => {
          const { data: code } = action.payload;
          return state.setIn(['check','user'], code === 0 ? false : true);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['check','user'], false);
        }
    }),
    ...pender({
        type: CHECK_USER_ID,
        onSuccess: (state, action) => {
          const { data: code } = action.payload;
          return state.setIn(['info','duplicateId'], code === 0 ? false : true);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['info','duplicateId'], false);
        }
    }),
    ...pender({
        type: INSERT_JOIN,
        onSuccess: (state, action) => {
            const { data: code } = action.payload;
            const d = new Date();
            const dtxt = d.getFullYear() + '년 ' + parseInt(d.getMonth()+1,10) + '월 ' + d.getDate() + '일';
            return state.setIn(['school','joinCheck'], code === 0 ? true : false).setIn(['agree','agreeDate'],dtxt);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['school','joinCheck'], false);
        }
    }),
    ...pender({
        type: UPDATE_MEMBER_INFO,
        onSuccess: (state, action) => {
            const { data: code } = action.payload;
            return state.setIn(['school','joinCheck'], code === 0 ? true : false);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['school','joinCheck'], false);
        }
    }),
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

            return state.setIn(['info','userId'],data.memberId)
                        .setIn(['info','userName'],data.name)
                        .setIn(['check','email'],email ? email : '')
                        .setIn(['check','emailDomain'],emailDomain ? emailDomain : '')
                        .setIn(['check','otherDomain'],otherDomain ? otherDomain : '')
                        .setIn(['check','isOtherDomain'],isOtherDomain ? true : false)
                        .setIn(['info','telephone'],data.cellphone ? data.cellphone : '')
                        .setIn(['info','zipNo'],data.zip ? data.zip : '')
                        .setIn(['info','address'],data.addr1 ? data.addr1 : '')
                        .setIn(['info','addressDetail'],data.addr2 ? data.addr2 : '')
                        .setIn(['info','birthDay'],data.birth ? data.birth.substring(0,4)+'-'+data.birth.substring(4,6)+'-'+data.birth.substring(6,8) : '')
                        .setIn(['info','gender'],data.sex ? data.sex : '')
                        .setIn(['info','lunar'],data.lunar ? data.lunar : '')
                        .setIn(['info','ssoMember'],data.ssoMember)
                        .setIn(['info','ssoRegDate'],data.ssoRegDate)
                        .setIn(['info','regDate'],data.regDate)
                        .setIn(['info','email'],data.email)
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
                        .setIn(['agree','marketingEmail'],data.marketingEmailYn==='Y' ? true : false)
                        .setIn(['agree','marketingSms'],data.marketingSmsYn==='Y' ? true : false)
                        .setIn(['agree','marketingTel'],data.marketingTelYn==='Y' ? true : false)
                        .setIn(['agree', 'mTypeCd'], data.mtypeCd ? data.mtypeCd : '0')
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    ...pender({
        type: MEMBER_INFO_CHECK,
        onSuccess: (state, action) => {
            const {data} = action.payload;
            // MEMBER_INFO 프로세스와 동일, 단 사용자가 입력한 비밀번호가 일치할 경우만 데이터 조회 가능
            if (data === 'INVALID') return initialState;

            let grade = state.toJS().school.grade;
            if (data.myGrade) {
                data.myGrade.split(',').filter(function (item) {
                    let key = 'g0' + item;
                    grade[key].checked = !!grade[key].value;
                });
            } else {
                for (let i = 1; i <= 7; i++) {
                    let key = 'g0' + i;
                    grade[key].checked = false;
                }
            }

            let email, emailDomain, otherDomain, isOtherDomain;
            if (data.email) {
                let s = data.email.split("@");
                email = s[0];
                let REGEXP_DOMAIN = /^(?:gmail.com|daum.net|hanmail.net|naver.com|nate.com)$/;
                if (s[1]) {
                    if (REGEXP_DOMAIN.test(s[1])) {
                        emailDomain = "@" + s[1];
                    } else {
                        emailDomain = "otherDomain";
                        otherDomain = s[1];
                        isOtherDomain = true;
                    }
                }
            }

            return state.setIn(['info','userId'],data.memberId)
                .setIn(['info','userName'],data.name)
                .setIn(['check','email'],email ? email : '')
                .setIn(['check','emailDomain'],emailDomain ? emailDomain : '')
                .setIn(['check','otherDomain'],otherDomain ? otherDomain : '')
                .setIn(['check','isOtherDomain'],isOtherDomain)
                .setIn(['info','telephone'],data.cellphone ? data.cellphone : '')
                .setIn(['info','zipNo'],data.zip ? data.zip : '')
                .setIn(['info','address'],data.addr1 ? data.addr1 : '')
                .setIn(['info','addressDetail'],data.addr2 ? data.addr2 : '')
                .setIn(['info','birthDay'],data.birth ? data.birth.substring(0,4)+'-'+data.birth.substring(4,6)+'-'+data.birth.substring(6,8) : '')
                .setIn(['info','gender'],data.sex ? data.sex : '')
                .setIn(['info','lunar'],data.lunar ? data.lunar : '')
                .setIn(['info','ssoMember'],data.ssoMember)
                .setIn(['info','ssoRegDate'],data.ssoRegDate)
                .setIn(['info','regDate'],data.regDate)
                .setIn(['info','email'],data.email)
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
                .setIn(['agree','marketingEmail'],data.marketingEmailYn === 'Y')
                .setIn(['agree','marketingSms'],data.marketingSmsYn === 'Y')
                .setIn(['agree','marketingTel'],data.marketingTelYn === 'Y')
                .setIn(['agree', 'tschMarketingEmail'], data.marketingEmailYnT === 'Y')
                .setIn(['agree', 'tschMarketingSms'], data.marketingSmsYnT === 'Y')
                .setIn(['agree', 'tschMarketingTel'], data.marketingTelYnT === 'Y')
                .setIn(['agree', 'mTypeCd'], data.mtypeCd ? data.mtypeCd : '0')
        },
        onError: (state, action) => {  // 에러 발생 시
            return state;
        }
    }),
    ...pender({
        type: CHECK_SSO_USER,
        onSuccess: (state, action) => {
          const { data: isExist, data: memberId } = action.payload;
          return state.setIn(['check','user'], isExist === 1 ? false : true)
                        .setIn(['check','existMemberId'], memberId);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['check','user'], false).setIn(['check','existMemberId'], '');
        }
    }),
    ...pender({
        type: CHECK_SSO_USER_ID,
        onSuccess: (state, action) => {
          const { data } = action.payload;
          return state.setIn(['info','duplicateId'], !data);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['info','duplicateId'], false);
        }
    }),
    ...pender({
        type: CHECK_USER_EMAIL,
        onSuccess: (state, action) => {
            const {data} = action.payload;
            return state.setIn(['info', 'duplicateEmail'], !data);
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['info','duplicateEmail'], false);
        }
    }),
    ...pender({
        type: IDENTIFICATION_DATA,
        onSuccess: (state, action) => {
            const { data } = action.payload;

            console.log(data);
            let preData = data.preStepData;

            //비바샘 아이디 유무.
            let isExistViva = (data.existId != null && data.existId != '') ? true : false;
            //티스쿨 아이디 목록.(비바샘 아이디가 있는 경우엔 null)
            let tUsers = data.tschool ? (data.tschool.tschoolUser ? data.tschool.tschoolUser : data.tschool) : [];
            //티스쿨 아이디 유무.
            let isExistTsch = tUsers.length > 0 ? true :  false;
            //티스쿨 아이디 다중 여부.
            let isDupleT = tUsers.length > 1 ? true : false;
            //티스쿨 아이디 중 휴면계정 존재 여부.
            let isInActiveT = isExistTsch && data.tschool.isActiveT == 'false' ? true : false;
            //티스쿨 아이디 한개일때 사용 가능 여부.
            let isUsableT = (isExistTsch && !isDupleT && !isInActiveT) ? (tUsers[0].isusable === 'true' ? true : false) : false;
            //비바샘, 티스쿨 동일 아이디 소유한 경우
            let isSameId = false;
            //통합회원 전환을 위한 체크케이스(1~7)
            let checkCase = data.checkCase;

            let fullEmail = preData.email + (preData.isOtherDomain ? ('@'+preData.otherDomain) : preData.emailDomain);
            return state.setIn(['type', 'isSelected'], preData.isSelected)
                        .setIn(['type', 'ssoMember'], preData.ssoMember)
                        .setIn(['agree', 'all'], preData.all)
                        .setIn(['agree', 'special'], preData.special)
                        .setIn(['agree', 'service'], preData.service)
                        .setIn(['agree', 'privacy'], preData.privacy)
                        .setIn(['agree', 'marketing'], preData.marketing)
                        .setIn(['agree', 'thirdPrivacy'], preData.thirdPrivacy)
                        .setIn(['agree', 'tschService'], preData.tschService)
                        .setIn(['agree', 'tschPrivacy'], preData.tschPrivacy)
                        .setIn(['agree', 'thirdMarketing'], preData.thirdMarketing)
                        .setIn(['agree', 'tschThirdParty'], preData.tschThirdParty)
                        .setIn(['agree', 'agreeDate'], preData.agreeDate)
                        .setIn(['agree', 'marketingEmail'], preData.marketingEmail)
                        .setIn(['agree', 'marketingSms'], preData.marketingSms)
                        .setIn(['agree', 'marketingTel'], preData.marketingTel)
                        .setIn(['agree', 'mTypeCd'], preData.mTypeCd)
                        .setIn(['check', 'userName'], preData.userName)
                        .setIn(['check', 'email'], preData.email)
                        .setIn(['check', 'emailDomain'], preData.emailDomain)
                        .setIn(['check', 'isOtherDomain'], preData.isOtherDomain)
                        .setIn(['check', 'otherDomain'], preData.otherDomain)
                        .setIn(['check', 'cellphone'], preData.cellphone)
                        .setIn(['check', 'isExistViva'], isExistViva)
                        .setIn(['check', 'isExistTsch'], isExistTsch)
                        .setIn(['check', 'tUsers'], tUsers)
                        .setIn(['check', 'isDupleT'], isDupleT)
                        .setIn(['check', 'isInActiveT'], isInActiveT)
                        .setIn(['check', 'isUsableT'], isUsableT)
                        .setIn(['check', 'isSameId'], isSameId)
                        .setIn(['check', 'user'], preData.user)
                        .setIn(['check', 'existMemberId'], data.existId)
                        .setIn(['check', 'existVivaEmail'], data.existVivaEmail)
                        .setIn(['check', 'existMemberInActive'], data.existIdActive === 'Y' ? false : true)
                        .setIn(['check', 'existIdUsable'], data.existIdUsable)
                        .setIn(['check', 'isPossibleConversion'], !isExistViva && !isDupleT && !isInActiveT ? true : false)
                        .setIn(['check', 'checkCase'], checkCase)
                        .setIn(['check', 'sMessage'], data.sMessage)
                        .setIn(['info', 'email'], fullEmail)
                        .setIn(['info', 'isIpin'], data.sCoInfo1)
                        .setIn(['info', 'type'], preData.TYPE)
                        .setIn(['info', 'userName'], data.sName)
                        .setIn(['info', 'gender'], data.sex)
                        .setIn(['info', 'birthDay'], data.sBirthDate)
                        .setIn(['info', 'telephone'], data.sMobileNo ? data.sMobileNo : preData.cellphone)
                        .setIn(['check', 'exception'], data.code ? data.code : '');
        },
        onError: (state, action) => {  // 에러 발생 시
            return state.setIn(['check', 'exception'], action.payload.status);
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
