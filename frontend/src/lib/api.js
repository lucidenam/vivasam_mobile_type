import axios from 'axios';
import {ACCESS_TOKEN} from '../constants';
import * as common from './common'
import {throttle} from 'lodash';

/* rest api 공통 호출 모듈 */
export const request = (options) => {
    const headers = {
        'content-type': 'application/json'
    };
    if(sessionStorage.getItem(ACCESS_TOKEN)) {
        headers.Authorization = 'Bearer ' + sessionStorage.getItem(ACCESS_TOKEN);
    }
    return axios({...{headers: headers}, ...options});
};

export const download = (url, filename) => {
    axios({
        url,
        method: 'GET',
        responseType: 'blob', // important
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
    });
}

/* 호출 결과 공통 처리 */
axios.interceptors.response.use(
    (config) => {
        return config;
    },
    (error) => {
        if(error.response && error.response.data && !error.response.data.code && error.response.data.message) {
            common.error(error.response.data.message);
        }
        return Promise.reject(error);
    }
);

/* 로그인 요청 */
export const login = (username, password) => request({
    url: '/api/auth/login',
    method: 'post',
    data: {
        username,
        password
    }
});

export const checkLogin = () => request({
    url: '/api/auth/check',
    method: 'post'
});

export const getMarketingAgreeList = () => request({
    url: '/api/member/getMarketingAgreeList',
    method: 'get'
});

export const marketingAgreeUpdate = (marketingAgreeYn) => request({
    url: '/api/member/marketingAgreeUpdate',
    method: 'get',
    params: {
        marketingAgreeYn
    }
});

/* 게이터 메인 배너 조회하기 */
export const gateMain = () => request({
    url: '/api/main/banner',
    method: 'get'
});

export const mainBannerList = () => request({
    url: '/api/main/mainBannerList',
    method: 'get'
});

export const mainNoticeList = () => request({
    url: '/api/main/mainNoticeList',
    method: 'get'
});

export const mainBottomBanner = () => request({
    url: '/api/main/mainBottomBanner',
    method: 'get'
});

/* 회원가입여부 확인 */
export const checkUser = (name, email) => request({
    url: '/api/member/checkExistPerson',
    method: 'post',
    data: {
        name,
        email
    }
});

/* 회원가입여부 확인 */
export const checkUserId = (id) => request({
    url: '/api/member/checkExistId',
    method: 'get',
    params: {
        id: id
    }
});

export const getAddress = (keyword, currentPage) => axios({
    url: 'https://www.juso.go.kr/addrlink/addrLinkApi.do',
    method: 'get',
    params: {
        ...{
            confmKey: 'U01TX0FVVEgyMDE3MDEyNjE0MjIxOTE4NjI4',
            countPerPage: 20,
            currentPage: 1,
            resultType: 'json'
        },
        keyword,
        currentPage
    }
});

// DLink Converter For Security
export const getDLinkConverter = (td) => axios({
    url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks',
    method: 'post',
    params: {
        key: td.fdk
    },
    headers: {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
        // 'Cache-Control': 'max-age=604800'
    },
    data: {
        dynamicLinkInfo : {
            domainUriPrefix: td.prefix,
            link: td.link,
            androidInfo: {
                androidPackageName: td.pkgName,
                androidFallbackLink: td.aosFallbackUrl,
                androidMinPackageVersionCode: td.versionAos
            },
            iosInfo: {
                iosBundleId: td.pkgName,
                iosAppStoreId: td.iosSerialId
            },
            navigationInfo: {
                enableForcedRedirect: td.iosScreenUp
            }
        },
        suffix: {
            option: "SHORT"
        }
    }
});

export const vscodeList = (code) => request({
    url: '/api/common/vscodeList',
    method: 'get',
    params: {
        code
    }
});

export const codeList = (grpCode, refCode) => request({
    url: '/api/common/codeList',
    method: 'get',
    params: {
        grpCode,
        refCode
    }
});

/* 학교급별 교과 목록 */
export const subjectList = (schLvlCd) => request({
    url: '/api/common/subjectList',
    method: 'get',
    params: {
        schLvlCd
    }
});

/* 학교급별 교과 목록 */
export const eduSubjectList = (schoolLvlCd) => request({
    url: '/api/educourse/subjectList',
    method: 'get',
    params: {
        schoolLvlCd
    }
});

/* 학교급별 교과 목록 */
export const getTextbookListbyGrpCd = (subjectGrpCd,grade,mdValue,subjectTypeCd) => request({
    url: '/api/educourse/getTextbookListbyGrpCd',
    method: 'get',
    params: {
        subjectGrpCd,
        grade,
        mdValue,
        subjectTypeCd
    }
});

/* 학교급별 교과 목록 */
export const getTextBookInfo = (textbookCd) => request({
    url: '/api/educourse/textBookInfo',
    method: 'get',
    params: {
        textbookCd
    }
});

/* 학교급별 교과 목록 */
export const getAllMenuList = (textbookCd) => request({
    url: '/api/educourse/getAllMenuList',
    method: 'get',
    params: {
        textbookCd
    }
});


/*
    공통자료, 단원별자료 특화자료 전체목록 조회 (교과서 자료실의 기본)
    P73 4
    textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195

    textbookCd : true
    gubunCd : false
    type1Cd : false
*/
export const getCourseBaseClassInfoList = (textbookCd, gubunCd, type1Cd) => request({
    url: '/api/educourse/getCourseBaseClassInfoList',
    method: 'get',
    params: {
        textbookCd,
        gubunCd,
        type1Cd
    }
});


/*
    대단원 하위의 중단원 조회
    p75 1A, 1B --> 중단원... 대단원과 같이나오게 쿼리 수정 요망
    class1Cd : true
*/
export const getCourseBaseClassSubInfotList = (class1Cd) => request({
    url: '/api/educourse/getCourseBaseClassSubInfotList',
    method: 'get',
    params: {
        class1Cd
    }
});


/*
    첫 대단원 정보의 유형 분류 정보 조회
    textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
              소단원 선택시 getCourseBaseClassSubInfotList 조회한 class2Cd를 넣는다
    P75 2

    1110001 => 수업 자료
    1110002 => 평가 자료
    1110003 => 멀티미디어 자료
    1110004 => 음원 자료
    1110005 => 이미지 자료
    1110006 => 스마트 교안 자료
 */
export const getUnitTypeList = (classCd, type1Cd) => request({
    url: '/api/educourse/getUnitTypeList',
    method: 'get',
    params: {
        classCd,
        type1Cd
    }
});

/*
   단원별자료에 노출되는 목록 정보 셋팅
   textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
   classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
             소단원 선택시 getCourseBaseClassSubInfotList 조회한 class2Cd를 넣는다
   type1Cd (getUnitTypeList에서 조회 ): 1110001 => 수업 자료 1110002 => 평가 자료 1110003 => 멀티미디어 자료 1110004 => 음원 자료 1110005 => 이미지 자료 1110006 => 스마트 교안 자료
   P76  2  --> 페이징 처리 필요

   exec DBO.SP_COURSE_UNIT_DATA_GROUP_BY_LIST 1, 5, 20101478, 1110001, null
   Lnb등 해당 교과서의 분류 정보 일괄 조회
*/
export const getEducourseUnitDataList = (classCd, type1Cd, type2Cd, page=0, pageSize=20) => request({
    url: '/api/educourse/getEducourseUnitDataList',
    method: 'get',
    params: {
        page,
        pageSize,
        classCd,
        type1Cd,
        type2Cd
    }
});

/*
    첫 대단원 정보의 유형 분류 정보의 하위정보 selectbox
    p 76 1A
    ex )수업자료:교과서,교사용 교과서,지도서,수업 지도안,수업 PPT,활동지,학습지,읽기 자료,링크 자료
    classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
              소단원 선택시 getCourseBaseClassSubInfotList에서 조회한 class2Cd를 넣는다
    type1Cd (getUnitTypeList에서 조회 ): 1110001 => 수업 자료 1110002 => 평가 자료 1110003 => 멀티미디어 자료 1110004 => 음원 자료 1110005 => 이미지 자료 1110006 => 스마트 교안 자료

    exec DBO.SP_COURSE_UNIT_DATA_GROUP_TYPE_DETAIL_LIST 1, 5, 20101478, 1110001, null
    Lnb등 해당 교과서의 분류 정보 일괄 조회
*/
export const getUnitSubTypeList = (classCd, type1Cd) => request({
    url: '/api/educourse/getUnitSubTypeList',
    method: 'get',
    params: {
        classCd,
        type1Cd
    }
});


/* 특화자료 목록 */
export const getEducourseSpecialDataList = (textbookCd, class2Cd, page=0, pageSize=20) => request({
    url: '/api/educourse/getEducourseSpecialDataList',
    method: 'get',
    params: {
        page,
        pageSize,
        textbookCd,
        class2Cd
    }
});

/* 공통자료 목록 */
export const getEducourseCommonDataList = (textbookCd, class2Cd, type2Cd, page=0, pageSize=20) => request({
    url: '/api/educourse/getEducourseCommonDataList',
    method: 'get',
    params: {
        page,
        pageSize,
        textbookCd,
        class2Cd,
        type2Cd
    }
});

/* 공통자료 정보의 유형 분류 정보의 하위정보 */
export const getEducourseCommonDataTypeList = (textbookCd, class2Cd) => request({
    url: '/api/educourse/getEducourseCommonDataTypeList',
    method: 'get',
    params: {
        textbookCd,
        class2Cd
    }
});

/* 특화 서브 카피 */
export const getEduCourseSpecialDataSubCopy = (class2Cd) => request({
    url: '/api/educourse/getEduCourseSpecialDataSubCopy',
    method: 'get',
    params: {
        class2Cd
    }
});

/* 차시 목록 */
export const getPeriodListMain = (class1Cd, page=0, pageSize=20) => request({
    url: '/api/educourse/getPeriodListMain',
    method: 'get',
    params: {
        page,
        pageSize,
        class1Cd
    }
});

/* 콘텐츠 정보 조회 */
export const getContentInfo = (contentId) => request({
    url: '/api/educourse/getContentInfo',
    method: 'get',
    params: {
        contentId
    }
});



export const getSchoolArea = (codeflag, fkcode, pkcode) => request({
    url: '/api/school/area',
    method: 'get',
    params: {
        codeflag,
        fkcode,
        pkcode
    }
});

export const qnaInsert = (member_id, qnaCd, qnaSchLvlCd, qnaTitle, qnaContents, vivasamformat) => request({
    url: '/api/cs/qnaInsert',
    method: 'post',
    params: {
        member_id: member_id,
        qnaCd: qnaCd,
        qnaSchLvlCd: qnaSchLvlCd,
        qnaTitle: qnaTitle,
        qnaContents: qnaContents,
        vivasamformat: "json"
    }
});

export const insertJoin = (...args) => request({
    url: '/api/member/insertJoin',
    method: 'post',
    data: {
        ...args
    }
});

export const updateMemberInfo = (...args) => request({
    url: '/api/member/updateMemberInfo',
    method: 'post',
    data: {
        ...args
    }
});

export const teacherCertifyUpload = (formData) => {
    return request({
        headers: {'Content-Type': 'multipart/form-data; charset=utf-8; boundary="another cool boundary";'},
        url: '/api/mail/teacherCertifyUpload',
        method: 'post',
        data: formData
    });
}

/* 내 교사인증 정보 */
export const checkEpkStatusInfo = () => request({
    url: '/api/member/checkEpkStatusInfo',
    method: 'post'
});

/* 휴면계정 복구 */
export const awake = (username, password) => request({
    url: '/api/member/awake',
    method: 'post',
    data: {
        username,
        password
    }
});

/* 내교과서 목록 */
export const myTextBookInfoList = () => request({
    url: '/api/myClass/myTextBookInfoList',
    method: 'get'
});

/* 내교과서 삭제 */
export const deleteMyTextbook = (textbookCd) => request({
    url: '/api/myClass/deleteMyTextbook',
    method: 'get',
    params: {
        textbookCd
    }
});

/* 내교과서 등록 */
export const insertMyTextbook = (textbookCd) => request({
    url: '/api/myClass/insertMyTextbook',
    method: 'get',
    params: {
        textbookCd
    }
});

/* 내교과정보 */
export const myClassInfo = () => request({
    url: '/api/myClass/myClassInfo',
    method: 'get'
});

/* 내교과서 추천교과 목록 */
export const recommendSubjectList = () => request({
    url: '/api/myClass/recommendSubjectList',
    method: 'get'
});

/* 최근열람자료 */
export const myMaterialViewList = () =>request({
    url: '/api/myClass/myMaterialViewList',
    method: 'get',
});

/* 최근열람자료이력저장 */
export const insertMaterialViewLog = throttle((contentId) => request({
    url: '/api/common/insertMaterialViewLog',
    method: 'post',
    data: {
        contentId
    }
}), 300);

/* 내 담은 자료 */
export const myPutDataList = (folderId, page, pageSize) =>request({
    url: '/api/myClass/myPutDataList',
    method: 'get',
    params: {
        folderId,
        page,
        pageSize
    }
});

/* 내 담은 자료 삭제 */
export const deletePutData = (deleteList) =>request({
    url: '/api/myClass/deletePutData',
    method: 'post',
    data: {
        deleteList
    }
});

/* 내 폴더목록 */
export const myFolderList = () =>request({
    url: '/api/myClass/myFolderList',
    method: 'get'
});

/* 내 다운로드 자료 */
export const myDownDataList = (textbookCd,type1Cd, page, size) =>request({
    url: '/api/myClass/myDownDataList',
    method: 'get',
    params: {
        textbookCd,
        type1Cd,
        page,
        size
    }
});

/* 내 다운로드 교과서 목록 */
export const myDownDataTextbookList = () =>request({
    url: '/api/myClass/myDownDataTextbookList',
    method: 'get'
});

/* 내 교과 추가/수정/삭제 */
export const changeMySubject = (mainSubject, secondSubject) => request({
    url: '/api/myClass/changeMySubject',
    method: 'get',
    params: {
        mainSubject,
        secondSubject
    }
});

/* 학교급+과목별 교과 목록 */
export const getTextbookListByCourse = (courseCd,mdValue) => request({
    url: '/api/myClass/getTextbookListByCourse',
    method: 'get',
    params: {
        courseCd,
        mdValue
    }
});

/* 설문조사 */
export const getPromoteInfo = () => request({
    url: '/api/main/mainSurvey',
    method: 'get'
});

export const findId = (memberName, certifyMethod, searchString) => request({
    url: '/api/member/findId',
    method: 'post',
    data: {
        memberName,
        certifyMethod,
        searchString
    }
});

export const findSleepId = (memberName, memberEmail) => request({
    url: '/api/member/findSleepId',
    method: 'post',
    data: {
        memberName,
        memberEmail
    }
});

export const findPwd = (memberName, memberId, memberEmail, cellPhone) => request({
    url: '/api/member/findPwd',
    method: 'post',
    data: {
        memberName,
        memberId,
        memberEmail,
        cellPhone
    }
});

export const findPwdIpin = (memberName, memberId, memberEmail, cellPhone, memberIpin) => request({
    url: '/api/member/findPwdIpin',
    method: 'post',
    data: {
        memberName,
        memberId,
        memberEmail,
        cellPhone,
        memberIpin
    }
});


/* 고객센터 - 공지사항 목록 */
export const noticeList = (page, srchCate) => request({
    url: '/api/cs/noticeList',
    method: 'get',
    params: {
        page: page,
        srchCate: srchCate
    }
});

/* 고객센터 - 공지사항 상세 */
export const noticeView = (noticeId) => request({
    url: '/api/cs/notice/' + noticeId,
    method: 'get'
});

/* 고객센터 - 내 문의내역 목록 */
export const qnaList = (page, srchFilter) => request({
    url: '/api/cs/qna',
    method: 'get',
    params: {
        page,
        srchFilter
    }
});

/* 고객센터 - 내 문의내역 상세 */
export const qnaView = (qnaId, srchFilter) => request({
    url: '/api/cs/qna/' + qnaId,
    method: 'get',
    params: {
        srchFilter
    }
});

/* 고객센터 - 문의하기 */
export const qnaNew = (qnaCd, qnaSchLvlCd, qnaSubjectCd, reqDataCd, qnaTitle, qnaContents, qnaCall, qnaCallTime, useYn) => request({
    url: '/api/cs/qnaNew',
    method: 'post',
    data: {
        qnaCd,
        qnaSchLvlCd,
        qnaSubjectCd,
        reqDataCd,
        qnaTitle,
        qnaContents,
        qnaCall,
        qnaCallTime,
        useYn
    }
});

/* 고객센터 - 문의하기 */
export const qnaFileInsert = (qnaId, orgFileName, realFileName, fileSize, fileGrpCd) => request({
    url: '/api/cs/qnaFileInsert',
    method: 'post',
    data: {
        qnaId,
        orgFileName,
        realFileName,
        fileSize,
        fileGrpCd
    }
});

/* 고객센터 - 주변 지사 찾기 - 시/도 목록 */
export const sidoList = () => request({
    url: '/api/cs/contact/sidoList',
    method: 'get'
});

/* 고객센터 - 주변 지사 찾기 - 지사 목록 */
export const contactList = (page, pkcode) => request({
    url: '/api/cs/contactList',
    method: 'get',
    params: {
        page,
        pkcode
    }
});

/* 고객센터 - 주변 지사 찾기 - 지사 목록(지도 마커용) */
export const allContactList = () => request({
    url: '/api/cs/contact/all',
    method: 'get'
});

/* 검색 - 연관검색어 */
export const getSuggestCompletion = (query) => request({
    url : '/api/search/getSuggestCompletion',
    method : 'post',
    data : {
        query
    }
});

/* 검색 - 자동완성 */
export const getAutocompleted = (query) => request({
    url : '/api/search/getAutocompleted',
    method : 'post',
    data: {
        query
    }
})

/* 검색 - total */
export const getSearchList = (query) => request({
    url : '/api/search/searchList',
    method : 'post',
    data: {
        query
    }
});

/* 검색 - 교과 자료 */
export const searchEducourseList = (query, offset, schoolLevels, eduYears, educourseTypes, extNames, subjectCodes, sorting) => request({
    url : '/api/search/searchEducourseList',
    method: 'post',
    data : {
        query, offset, schoolLevels, eduYears, educourseTypes, extNames, subjectCodes, sorting
    }
});

/* 검색 - 라이브러리 */
export const searchLibraryList = (query, offset, fileTypes, libraryTypes, sorting) => request({
    url : '/api/search/searchLibraryList',
    method: 'post',
    data : {
        query, offset, fileTypes, libraryTypes, sorting
    }
})

/* 검색 - 고객센터 */
export const searchCsList = (query, offset, sorting) => request({
    url: '/api/search/searchCsList',
    method : 'post',
    data : {
        query, offset, sorting
    }
})

export const metaCode = (args) => request({
    url: '/api/opendata/metaCode',
    method: 'get',
    params: args
});

export const metaData = (args) => request({
    url: '/api/opendata/metaData',
    method: 'get',
    params: args

});

export const changePassword = (...args) => request({
    url: '/api/myInfo/changePassword',
    method : 'post',
    data: {
        ...args
    }
});

export const checkPassword = (...args) => request({
    url: '/api/myInfo/checkPassword',
    method : 'post',
    data: {
        ...args
    }
});

export const changePassword2 = (...args) => request({
    url: '/api/myInfo/changePassword2',
    method: 'post',
    data: {
        ...args
    }
});

export const checkCertifiNumResetPwd = (certifiNum, uuidForCertifiNum, memberId) => request({
    url: '/api/member/checkCertifiNumResetPwd',
    method: 'post',
    data: {
        certifiNum,
        uuidForCertifiNum,
        memberId,
    }
});


export const memberInfo = () => request({
    url: '/api/myInfo/memberInfo',
    method : 'post'
});

// 불충분한 인증으로 인증스텝 추가
export const memberInfoCheck = (pwOrAuthToken, apiId, idToken) => request({
    url: '/api/myInfo/memberInfoCheck',
    method: 'post',
    data: {
        '1': pwOrAuthToken,
        'apiId': apiId,
        'idToken': idToken
    }
});

// 개인정보수정 > SNS 연결하기
export const linkSns = (parameter) => request({
    url: '/api/myInfo/sns/link',
    method: 'post',
    data : parameter
});

// 개인정보수정 > SNS 연결 해제
export const unlinkSns = (parameter) => request({
    url: '/api/myInfo/sns/unlink',
    method: 'post',
    data : parameter
});

/* 비바샘터 홈 목록 */
export const saemteoBannerList = () => request({
    url: '/api/saemteo/saemteoBannerList',
    method: 'get'
});

/* 비바샘터 추천 수업자료 목록 */
export const recommandEduBannerList = () => request({
    url: '/api/saemteo/recommandEduBannerList',
    method: 'get'
});

/* 비바샘터 이벤트 목록 */
export const eventList = (eventId) => request({
    url: '/api/saemteo/eventList',
    method: 'get',
    params: {
        eventId
    }
});

/* 비바샘터 이벤트 정보 */
export const eventInfo = (eventId) => request({
    url: '/api/saemteo/eventInfo',
    method: 'get',
    params: {
        eventId
    }
});

export const eventSubEventList = (eventId) => request({
    url: '/api/saemteo/eventSubEventList',
    method: 'get',
    params: {
        eventId
    }
});


/* 비바샘터 이벤트 정보(종료되거나 비활성 포함) */
export const eventInfoAll = (eventId) => request({
    url: '/api/saemteo/eventInfoAll',
    method: 'get',
    params: {
        eventId
    }
});

/* 비바샘터 교사문화 프로그램 목록 */
export const programList = () => request({
    url: '/api/saemteo/programList',
    method: 'get'
});

/* 비바샘터 교사문화 프로그램 정보 */
export const programInfo = (programId) => request({
    url: '/api/saemteo/programInfo',
    method: 'get',
    params: {
        programId
    }
});

/* 비바샘터 오프라인 세미나 목록 */
export const seminarList = () => request({
    url: '/api/saemteo/seminarList',
    method: 'get'
});

/* 비바샘터 오프라인 세미나 정보 */
export const seminarInfo = (seminarId) => request({
    url: '/api/saemteo/seminarInfo',
    method: 'get',
    params: {
        seminarId
    }
});

/* 비바샘터 교사문화 프로그램 / 오프라인 세미나 신청 */
export const insertApply = (...args) => request({
    url: '/api/saemteo/insertApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘터 설문조사 목록 */
export const surveyList = () => request({
    url: '/api/saemteo/surveyList',
    method: 'get'
});

/* 비바샘터 설문조사 결과확인 */
export const surveyResult = (surveyId) => request({
    url: '/api/saemteo/surveyResult',
    method: 'get',
    params: {
      surveyId
    }
});

/* 비바샘터 설문조사 결과 페이징 */
export const surveyResultItem = (args) => request({
    url: '/api/saemteo/surveyResultItem',
    method: 'get',
    params: args
});

/* 비바샘터 설문조사 신청 */
export const insertSurveyApply = (...args) => request({
    url: '/api/saemteo/insertSurveyApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘터 이벤트 신청 */
export const insertEventApply = (...args) => request({
    url: '/api/saemteo/insertEventApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘터 이벤트 신청 내용포함 한번에 */
export const insertEventApplyAll = (...args) => request({
    url: '/api/saemteo/insertEventApplyAll',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘터 이벤트 신청 - 이벤트 폼 없이 신청을 받는 이벤트인 경우 */
/* ex) 비바샘 2019 신학기 이벤트 */
export const insertNoFormEventApply = (...args) => request({
    url: '/api/saemteo/insertNoFormEventApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘터 이벤트 신청 - 이벤트 폼 없이 신청을 받는 이벤트인 경우 */
/* ex) 비바샘 2019 신학기 이벤트 */
export const eventAgreeInfo = (eventId) => request({
    url: '/api/saemteo/agree',
    method: 'get',
    params: {
        eventId
    }
});


/* 교과 상세뷰 문서 변환 이미지 목록 */
export const convertedDocumentList = (contentId,contentGubun) => request({
    url: '/api/common/convertedDocumentList',
    method: 'get',
    params: {
      contentId,
      contentGubun
    }
});

/* 뷰어 내폴더 담기 */
export const addFolder = (contentId,contentGubun) => request({
    url: '/api/opendata/addFolder',
    method: 'get',
    params: {
      contentId,
      contentGubun
    }
});

/* 뷰어 포인트 적립 */
export const applyPointViewer = (contentId,contentGubun) => request({
    url: '/api/common/applyPoint/viewer',
    method: 'get',
    params: {
      contentId,
      contentGubun
    }
});

/* 뷰어 평가자료 여부 체크 */
export const contentCheck = (contentId,contentGubun) => request({
    url: '/api/common/contentCheck',
    method: 'get',
    params: {
      contentId,
      contentGubun
    }
});

/* 수박씨->온리원 강의 목록 */
export const getSoobakcList = (...args) => request({
    url: '/api/soobakc/getSoobakcList',
    method: 'post',
    data: {
        ...args
    }
});

/* 수박씨->온리원 강의 상세 */
export const getSoobakcDetail = (...args) => request({
    url : '/api/soobakc/getSoobakcDetail',
    method: 'post',
    data: {
        ...args
    }
})

/* 수박씨->온리원 강의 정보 */
export const getSoobakcInfo = (...args) => request({
    url : '/api/soobakc/getSoobakcInfo',
    method: 'post',
    data: {
        ...args
    }
})

/* 수박씨->온리원 동영상 url 정보 얻기 */
export const getSoobakcMovs = (...args) => request({
    url : '/api/soobakc/getSoobakcMovs',
    method : 'post',
    data : {
        ...args
    }
})

export const getFileInfoList = (args) => request({
    url : '/api/download/getFileInfoList',
    method : 'post',
    data : {
        ...args
    }
})

export const getSuggestQuery = (query) => request({
    url : '/api/search/getSuggestQuery',
    method : 'post',
    data : {
        query
    }
});

export const apiInfo = () => request({
    url: '/api/common/info',
    method: 'get',
});

export const syncAppToken = (token, userId) => request({
    url: '/api/app/token?sync',
    method: 'POST',
    params: {
        value: token,
        user: userId
    }
});

export const setAppPermission = (userCommand, permission) => {
    //카메라 접근 권한을 신청합니다.
    var command = null;
    switch(userCommand) {
        case 'checkPmsCamera':
            command = 'reqPmsCamera';
            break;
        case 'checkPmsPhoto':
            command = 'reqPmsPhoto';
            break;
        case 'checkPmsGPS':
            command = 'reqPmsGPS';
            break;
        case 'checkPmsPush':
            command = 'reqPmsPush';
            break;
        case 'checkPmsDataNetwork':
            command = 'reqPmsDataNetwork';
    }
    if (command === null) {
        return new Promise(function(resolve, reject) {
            reject(new Error('정의되지 않은 권한 정보입니다.'));
        });
    }
    else {
        return new Promise(function(resolve, reject) {
            window.webViewBridge.send(command, {"value": permission}, function(res){
                resolve(res);
            }, function(err){
                reject(err);
            });
        });
    }
};

export const getAppPermission = (userCommand) => {
    return new Promise(function(resolve, reject) {
        window.webViewBridge.send(userCommand, null, function(res){
            //alert(JSON.stringify(res));
            resolve(res);
        }, function(err){
            reject(err);
        });
    });
};

export const openPhoto = () => {
    return new Promise(function(resolve, reject) {
        window.webViewBridge.send('checkPmsPhoto', '', function(permission){
            console.log('photo permission: ' + permission.value);
            if (permission.value === 'true') {
                //그냥 두면 실행됩니다.
                console.log('사진첩을 실행합니다...');
                resolve(true);
            }
            else {
                //사진첩 접근 권한을 신청합니다.
                window.webViewBridge.send('reqPmsPhoto', {"value": "true"}, function(res){
                    resolve(res.value === 'true');
                }, function(err){
                    reject(err);
                });
            }
        }, function(err){
            reject(err);
        });
    });
};

export const openCamera = () => {
    return new Promise(function(resolve, reject) {
        window.webViewBridge.send('checkPmsCamera', '', function(permission){
            console.log('camera permission: ' + permission.value);
            if (permission.value === 'true') {
                resolve(true);
            }
            else {
                //카메라 접근 권한을 신청합니다.
                window.webViewBridge.send('reqPmsCamera', {"value": "true"}, function(res){
                    resolve(res.value === 'true');
                }, function(err){
                    reject(err);
                });
            }
        }, function(err){
            reject(err);
        });
    });
};

export const appAlert = (message) => {
    alert(message);
};

// 사용할 경우 네이티브앱 충돌 발생
export const appConfirm = (message) => {
    if (window.__isApp === true) {
        return new Promise(function (resolve, reject) {
            window.webViewBridge.send('callConfirmMsg', {"value": message}, (confirm) => {
                resolve(confirm.value);
            }, (err) => {
                reject(err);
            });
        });
    }
    else {
        return new Promise(function(resolve, reject) {
            let confirmed = window.confirm(message);
            return resolve(confirmed);
        });
    }
}

export const setPushAlarms = (eventYn, materialUpdateYn, qnaAnswerYn, notiYn) => request({
    url: '/api/common/setPushAlarms',
    method: 'POST',
    data: {
        eventYn,
        materialUpdateYn,
        qnaAnswerYn,
        notiYn
    }
});

export const getPushAlarms = () => request({
    url: '/api/common/getPushAlarms',
    method: 'GET',
});

/**
 *
 */
export const hasDataNetworkPermission = () => {
    const checkPmsDataNetwork = localStorage.getItem("checkPmsDataNetwork");
    if (checkPmsDataNetwork === 'true') {//데이터 네트워크 사용을 허용했다면 다른 것을 체크할 필요 없습니다.
        return new Promise(function(resolve) {
            resolve(true);
        });
    }
    else {
        return new Promise(function(resolve, reject) {
            window.webViewBridge.send('getDeviceNetwork', null, (type)=>{
                if (type == 'cellular') {//허용을 하지 않았는데 셀룰러 타입이면 거절해야 한다.
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            }, (err)=>{
                reject(err);
            });
        });
    }
};

export const getSoobakcImage = (schoolGrade, educourse) => request({
    url: '/api/soobakc/getSoobakcImage',
    method: 'POST',
    data: {
        schoolGrade,
        educourse
    }
});

export const getSoobakcImageBanner = (schoolGrade, educourse) => request({
    url: '/api/soobakc/getSoobakcImageBanner',
    method: 'POST',
    data: {
        schoolGrade,
        educourse
    }
});

/* 20190411 신규 Api 추가 */
/* 이벤트 리스트 출력 */
export const getEventAnswerList = (...args) => request({
    url: '/api/saemteo/getEventAnswerList',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 리스트 출력 - 코멘트 입력이 2개일 때 사용 */
export const getEventAnswerListForTwoComment = (...args) => request({
    url: '/api/saemteo/getEventAnswerListForTwoComment',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답 카운트 출력 */
/* 이벤트 응답 수정 */
export const getEventAnswerListCntForTwoComment = (...args) => request({
    url: '/api/saemteo/getEventAnswerListCntForTwoComment',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답 카운트 출력 - 한 이벤트에서 특정 이벤트의 참여정보만 출력시 사용 */
export const getSpecificEventAnswerCount = (param) => request({
    url: '/api/saemteo/getSpecificEventAnswerCount',
    method: 'post',
    data: param
});

/* 이벤트 응답 리스트 출력 - 한 이벤트에서 특정 이벤트의 참여정보만 출력시 사용 */
export const getSpecificEventAnswerList = (param) => request({
    url: '/api/saemteo/getSpecificEventAnswerList',
    method: 'post',
    data: param
});

/* 이벤트 응답 리스트 출력 - 한 이벤트에서 특정 이벤트의 참여정보만 출력시 사용 */
export const getSpecificEventAnswerList3 = (...args) => request({
    url: '/api/saemteo/getSpecificEventAnswerList3',
    method: 'post',
    data: {
        ...args
    }
});

export const writeReply = (...args) => request({
    url: '/api/saemteo/writeReply',
    method: 'post',
    data: {
        ...args
    }
});


/* 이벤트 질문에 대한 추가 응답 */
export const setEventJoinAnswerAddInsert = (...args) => request({
    url: '/api/saemteo/setEventJoinAnswerAddInsert',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 참여 삭제 */
export const setEventAnswerDelete = (...args) => request({
    url: '/api/saemteo/setEventAnswerDelete',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답 수정 */
export const setEventAnswerUpdate = (...args) => request({
    url: '/api/saemteo/setEventAnswerUpdate',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답 카운트 출력 */
/* 이벤트 응답 수정 */
export const checkEventTotalJoin = (...args) => request({
    url: '/api/saemteo/checkEventTotalJoin',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답 댓글 한개 출력 */
export const getEventAnswerSingleQuestion = (...args) => request({
    url: '/api/saemteo/getEventAnswerSingleQuestion',
    method: 'post',
    data: {
        ...args
    }
});

/* 설렘꾸러미 카운트 출력 */
export const getGiftBundleCount = (...args) => request({
    url: '/api/saemteo/getGiftBundleCount',
    method: 'post',
    data: {
        ...args
    }
});

/* 설렘꾸러미 카운트 출력 */
export const getClassLiveQuestionEventAmount = (...args) => request({
    url: '/api/saemteo/getClassLiveQuestionEventAmount',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 수량 체크 이벤트 한번에 등록 */
export const insertAmountEventApply = (...args) => request({
    url: '/api/saemteo/insertAmountEventApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비밀번호 변경 다음에 클릭 시 */
export const ajaxPassNextUpdate = () => request({
    url: '/api/member/ajaxPassNextUpdate',
    method: 'get'
});

/***********************************
 *************** SSO ***************
 *********************************** 2019.07 */

/* 회원 가입 여부 확인(성명, 이메일, 휴대폰 모두 일치) */
export const checkJoinedMember = (name, email, cellphone) => request({
    url: '/api/member/checkJoinedMember',
    method: 'post',
    data: {
        name,
        email,
        cellphone
    }
});

/* 통합회원 아이디 중복 확인 */
export const checkAvailableSsoId = (ssoId) => request({
    url: '/api/member/checkAvailableSsoId',
    method: 'post',
    params: {
        ssoId
    }
});

/* 이메일 중복 확인 */
export const checkExistEmail = (userId, email) => request({
    url: '/api/member/checkExistEmail',
    method: 'post',
    params: {
        userId,
        email
    }
});

/* 통합회원 동의 저장 */
export const updateIntergratedAgree = (intergratedAgreeYn) => request({
    url : '/api/member/updateIntergratedAgree',
    method : 'post',
    params : {
        intergratedAgreeYn
    }
});

/* nice 본인인증 encdata 얻기 */
export const getNiceEncData = (...args) => request({
    url : '/api/member/getNiceEncData',
    method : 'post',
    data : {
        ...args
    }
})

/* cache에 저장된 본인인증 정보 가져오기 */
export const getIdentificationData = (uuid) => request({
    url : '/api/member/getIdentificationData/' + uuid,
    method : 'post',
    params : {
    }
})

/* 본인인증 스킵하기 ( 테스트용 ) */
export const skipIdentification = (...args) => request({
    url : '/api/member/skipIdentified',
    method : 'post',
    data : {
        ...args
    }
})


/* 통합회원 가입하기 */
export const insertSsoJoin = (...args) => request({
    url: '/api/member/insertSsoJoin',
    method: 'post',
    data: {
        ...args
    }
});

/* 통합 전환시 본인 소유 아이디 및 통합 회원으로 사용 가능 여부 확인 */
export const checkConversionId = (...args) => request({
    url: '/api/member/checkConversionId',
    method: 'post',
    data: {
        ...args
    }
});

/* 통합회원 전환하기 */
export const insertSsoConversion = (...args) => request({
    url: '/api/member/insertSsoConversion',
    method: 'post',
    data: {
        ...args
    }
});

/* 신규가입시 바로 통합회원 전환하기 */
export const insertSsoConversionJoin = (...args) => request({
    url: '/api/member/insertSsoConversionJoin',
    method: 'post',
    data: {
        ...args
    }
});

/* 삭제해도 될듯? */

export const updateUserCiInfo = (userInfo) => request({
    url : '/api/member/updateUserCiInfo',
    method : 'post',
    data : {
        userInfo
    }
})

/* tschool user 정보 얻기 */
export const getTschoolUserInfos = (memberId) => request({
    url : '/api/member/getTschoolUserInfos',
    method : 'post',
    params : {
        memberId
    }
})

export const checkSsoMember = (userInfos) => request({
    url : '/api/member/checkSsoMember',
    method : 'post',
    data : {
        userInfos : userInfos
    }
})

export const getVivasamMemberInfo = (memberId) => request({
    url : '/api/member/getVivasamMemberInfo',
    method : 'get',
    params: {
        memberId
    }
})

export const addSsoMember = (...args) => request({
    url : '/api/member/addSsoMember',
    method : 'post',
    data : {
        ...args
    }
})

/* 본인인증 처리 테스트용 */
export const updateUserCiInfoTest = (memberId) => request({
    url : '/api/member/updateUserCiInfoTest',
    method : 'post',
    params : {
      memberId
  }
})

/* 해당 회원의 이벤트 참여 자격 검사 */
export const checkPrivateEventMember = (...args) => request({
    url: '/api/saemteo/checkPrivateEventMember',
    method: 'post',
    data: {
        ...args
    }
});

/* 해당회원의 임시 인증 확인 */
export const checkAuthIPIN = () => request({
    url: '/api/member/checkAuthIPIN',
    method: 'post'
});

/* 구글 설문조사 ( 중복 가능 ) */
export const googleSurveyCountCheck = (...args) => request({
    url: '/api/saemteo/googleSurveyCountCheck',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 중복 참여 */
export const insertGoogleEventApply = (...args) => request({
    url: '/api/saemteo/insertGoogleEventApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 비바샘 포토존 */
export const photoZone = (PHOTO_IDX) => request({
    url: '/api/opendata/photoZone',
    method: 'get',
    params: {
        'PHOTO_IDX' : PHOTO_IDX
    }
});


// 모니터링단 신청
export const insertMonitoringEvent = (...args) => request({
    url: '/api/saemteo/insertMonitoringEvent',
    method: 'post',
    data: {
        ...args
    }
});

/* 해당 회원 학급 정보 추출 */
export const eventMemberSchoolInfo = (...args) => request({
    url: '/api/saemteo/eventMemberSchoolInfo',
    method: 'post',
    data: {
        ...args
    }
});


/* 이벤트 응답에 따른 참여 수량 체크 */
export const eventAnswerDescCheck = (...args) => request({
    url: '/api/saemteo/eventAnswerDescCheck',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 ID 및 Type에 따른 최대수량 확인 */
export const eventCheckLimitAmount = (...args) => request({
    url: '/api/saemteo/eventCheckLimitAmount',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 응답에 따른 참여 수량(수량을 따로 받았을 때) 체크 */
export const chkEventJoinQntCnt = (...args) => request({
    url: '/api/saemteo/chkEventJoinQntCnt',
    method: 'post',
    data: {
        ...args
    }
});

export const chkEventRemainsQntCnt = (...args) => request({
    url: '/api/saemteo/chkEventRemainsQntCnt',
    method: 'post',
    data: {
        ...args
    }
});

export const chkEventJoin = (...args) => request({
    url: '/api/saemteo/chkEventJoin',
    method: 'post',
    data: {
        ...args
    }
})

//520 출석체크 이벤트용 update
export const insertEventApply521 = (...args) => request({
    url: '/api/saemteo/insertEventApply521',
    method: 'post',
    data: {
        ...args
    }
})

export const getCurrentTime = (...args) => request({
    url: '/api/saemteo/getCurrentTime',
    method: 'post',
    data: {
        ...args
    }
})

export const getEventMyAnswer = (...args) => request({
    url: '/api/saemteo/my-answer',
    method: 'post',
    data: {
        ...args
    }
});


export const marketingAgreeUpdateThree = (...args) => request({
    url: '/api/member/marketingAgreeUpdateThree',
    method: 'post',
    data: {
        ...args
    }
});

/*
    테스트용 html 컨텐츠 리스트 조회
    textbookCd : 과목코드
*/
export const getHtmlContentList = (textbookCd) => request({
    url: '/api/educourse/getHtmlContentList',
    method: 'get',
    params: {
        textbookCd
    }
});


/**
 * 앱 최신버전 조회
 * @param os OS종류 ANDROID, IOS
 * @returns {AxiosPromise}
 */
export const getLatestAppVersion = (os) => request({
    url: '/api/main/latestAppVersion',
    method: 'get',
    params: {
        os: os
    }
});


export const loginSns = (parameter) => request({
    url: '/api/member/sns/login',
    method: 'POST',
    data : parameter
});

export const getMemberInfoByMemberId = (existMemberId) => request({
    url: '/api/member/info/get',
    method: 'GET',
    params: {
        existMemberId
    }
});

export const getMappingIdList = (snsLoginParameter) => request({
    url: '/api/member/sns/linkage',
    method: 'POST',
    data : snsLoginParameter
});

export const updateMemberId = (snsLoginParameter) => request({
    url: '/api/member/sns/linkage/update',
    method: 'POST',
    data : snsLoginParameter
});

export const getLoginType = () => request({
    url: '/api/member/sns/login/type',
    method: 'GET'
});

export const getPwdExit = (memberId) => request({
    url: '/api/member/pwd/exit',
    method: 'GET',
    params: {
        memberId
    }
});

export const getModifySns = () => request({
    url: '/api/member/sns/modify/sns',
    method: 'GET'
});

export const sendCertifyMail = (email, emailTest, memberId) => request({
    url: '/api/member/sendCertifyMail',
    method: 'POST',
    data: {
        email,
        emailTest,
        memberId,
    }
});

export const checkCertifyMail = (certifiNum, uuidForCertifiNum, email, memberId) => request({
    url: '/api/member/checkCertifyMail',
    method: 'post',
    data: {
        certifiNum,
        uuidForCertifiNum,
        email,
        memberId,
    }
});

export const updateCertifyMail = (email, certifiNum, uuidForCertifiNum, memberId) => request({
    url: '/api/member/updateCertifyMail',
    method: 'post',
    data: {
        email,
        certifiNum,
        uuidForCertifiNum,
        memberId,
    }
});

export const sendMsg = (cellphone) => request({
    url: '/api/member/info/send/sms',
    method: 'GET',
    params : {
        cellphone
    }
});

export const isSnsMemberCheck = (cellphone, email) => request({
    url: '/api/member/sns/check',
    method: 'GET',
    params : {
        "cellphone" : cellphone,
        "email" : email
    }
});

/* SNS회원 가입하기 */
export const insertSnsSsoJoin = (...args) => request({
    url: '/api/member/sns/insertSsoJoin',
    method: 'post',
    data: {
        ...args
    }
});

export const snsLogin = (username, password, snsLoginParameter) => request({
    url: '/api/auth/sns/login',
    method: 'post',
    data: {
        username,
        password,
        snsLoginParameter
    }
});

export const sendMsgSnsJoin = (cellphone, memberId) => request({
    url: '/api/member/info/sns/sms',
    method: 'GET',
    params : {
        cellphone,
        memberId,
    }
});

export const checkCertifySms = (certifiNum, uuidForCertifiNum, cellphone, memberId) => request({
    url: '/api/member/check/sns/sms',
    method: 'post',
    data: {
        certifiNum,
        uuidForCertifiNum,
        cellphone,
        memberId,
    }
});

export const updateIpinCi = (isIpin) => request({
    url: '/api/member/sso/ipinci',
    method: 'GET',
    params : {
        isIpin : isIpin
    }
});

export const leaveMessageList = () => request({
    url: '/api/myInfo/leaveMessageList',
    method: 'GET'
});

export const leave = (domId, domMessage) => request({
    url: '/api/myInfo/leave',
    method: 'POST',
    data: {
        domId: domId,
        domMessage: domMessage
    }
});

/* 룰렛이벤트 티켓 갯수 가져오기 */
export const getRouletteTicketNum = (...args) => request({
    url: '/api/saemteo/getRouletteTicketNum',
    method: 'post',
    data: {
        ...args
    }
});

/* 룰렛이벤트 url 등록 */
export const rouletteSaveUrl = (...args) => request({
    url: '/api/saemteo/roulette/save/url',
    method: 'post',
    data: {
        ...args
    }
});


/* 비바샘 룰렛 이벤트 신청 */
export const insertRouletteEventApply = (...args) => request({
    url: '/api/saemteo/insertRouletteEventApply',
    method: 'post',
    data: {
        ...args
    }
});


/* 비바샘터 사용자 정보 */
export const currentUserInfo = () => request({
    url: '/api/saemteo/currentUser/info',
    method: 'get'
});

/* 비바샘터 이벤트 신청 */
export const insertVivasamGoApply = (...args) => request({
    url: '/api/saemteo/insertVivasamGoApply',
    method: 'post',
    data: {
        ...args
    }
});

/* 추천인 코드 등록 */
export const registerMemberRecoCode = () => request({
    url: '/api/member/recoCode',
    method: 'post',
    data: {}
});

/* 추천인 코드 조회 */
export const getRecommendationInfo = () => request({
    url: '/api/saemteo/event/recommendationInfo',
    method: 'get',
    data: {}
});

/* 추천인 코드 유효한지 체크 */
export const chkValidReco = (reco) => request({
    url: '/api/saemteo/checkValidReco',
    method: 'get',
    params: {
        reco: reco
    }
});

/* 특정이벤트가 진행중인지 확인 */
export const chkEventProgress = (eventId) => request({
    url: '/api/saemteo/checkEventProgress',
    method: 'get',
    params: {
        eventId: eventId
    }
});

/* 스승의날 선물대잔치 이벤트 등록 */
export const insertEventApply451 = (...args) => request({
    url: '/api/saemteo/insertEventApply451',
    method: 'post',
    data: {
        ...args
    }
});

/* 회원유형 업데이트 */
export const updateMemberMTypeCd = (memberId, mTypeCd) => request({
    url: '/api/member/updateMemberMTypeCd',
    method: 'post',
    data: {
        memberId,
        mTypeCd
    }
});

/* 로그인 마일리지 체크 */
export const checkLoginMileage = () => request({
    url: '/api/auth/login/mileage',
    method: 'post'
});


/* 447 비버샘 팬클럽 이벤트 시작*/
// 학교 리스트 및 회원가입 타입(이벤트시작일 기준) 가져오기
export const getVivaJoinEventInfo = () => request({
    url: '/api/saemteo/vivaJoinEventInfo',
    method: 'get'
});

// 추천 아이디 조회
export const recommenderCheck = (recommender) => request({
    url: '/api/saemteo/recommenderCheck',
    method: 'post',
    params: {
        recommender : recommender
    }
});

// 학교 랭킹을 댓글형식으로 가져오기
/* 이벤트 응답 리스트 출력 - 한 이벤트에서 특정 이벤트의 참여정보만 출력시 사용 */
export const getSpecificEventAnswerList2 = (...args) => request({
    url: '/api/saemteo/getSpecificEventAnswerList2',
    method: 'post',
    data: {
        ...args
    }
});

export const getSpecificEventAnswerCount2 = (...args) => request({
    url: '/api/saemteo/getSpecificEventAnswerCount2',
    method: 'post',
    data: {
        ...args
    }
});


// 추천 아이디 조회
export const recommendCheck = (recommender) => request({
    url: '/api/member/recommenderCheck',
    method: 'post',
    params: {
        recommender : recommender
    }
});


/* 485 비바샘 새 학기를 부탁해 이벤트 시작*/
export const getNewSemiEventInfo = () => request({
    url: '/api/saemteo/getNewSemiEventInfo',
    method: 'get'
});

/* 542 비바샘 새 학기를 부탁해 이벤트 시작*/
export const getRecommendEventInfo = () => request({
	url: '/api/saemteo/getRecommendEventInfo',
	method: 'get'
});

/* 이벤트 응답 리스트 출력 - 한 이벤트에서 특정 이벤트의 참여정보만 출력시 사용 */
export const get2024EventAnswerList = (...args) => request({
    url: '/api/saemteo/get2024EventAnswerList',
    method: 'post',
    data: {
        ...args
    }
});

/* 이벤트 참여자 수 확인 */
export const get2024EventAnswerCount = (...args) => request({
    url: '/api/saemteo/get2024EventAnswerCount',
    method: 'post',
    data: {
        ...args
    }
});
/* 485 비바샘 새 학기를 부탁해 이벤트 끝*/

/* 557 찾아가는 교사 문화 프로그램 투표 */
export const getEventVoteRank = (...args) => request({
	url: '/api/saemteo/getEventVoteRank',
	method: 'post',
});

/* 비바클래스 알림 신청 */
export const serviceNotificationApply = () => request({
    url: '/api/opendata/serviceNotificationApply',
    method: 'post',
    data: {
        serviceNm: 'vivaClass'
    }
});

/* 2024 498 스승의날 좋아요 이벤트 건 */
export const get2024EventAnswerList498 = (...args) => request({
    url: '/api/saemteo/get2024EventAnswerList498',
    method: 'post',
    data: {
        ...args
    }
});
/* 2024 498 스승의날 좋아요 이벤트 건 */
export const makeEventLike = (...args) => request({
    url: '/api/saemteo/makeEventLike',
    method: 'post',
    data: {
        ...args
    }
});

export const getMyRecomCnt = () => request({
    url: '/api/saemteo/getMyRecomCnt',
    method: 'get'
});

/* 513 AI 플랫폼 활용 공모전 : 도전! AI 알잘딱깔샘! - 인기투표 getPopularCnt */
export const getPopularCnt = (...args) => request({
    url: '/api/saemteo/getPopularCnt',
    method: 'post',
    data: {
        ...args
    }
});

/*  바로바로 음악관 tab 가져오기 */
export const fastMusicLibraryCode = (args) => request({
    url: '/api/opendata/fastMusicLibraryCode',
    method: 'get',
    params: args
});

/*  바로바로 음악관 data 가져오기 */
export const fastMusicLibraryData = (args) => request({
    url: '/api/opendata/fastMusicLibraryData',
    method: 'get',
    params: args
});

/*  ISMS 비밀번호 오류 체크 */
export const loginPasswordCheck = (username, password) => request({
    url: '/api/auth/check/retCnt',
    method: 'post',
    data: {
        username,
        password
    }
});

export const sendTempPwd = (memberName, memberId, cellPhone) => request({
    url: '/api/member/sendTempPwd',
    method: 'post',
    data: {
        memberName,
        memberId,
        cellPhone
    }
});

export const checkPasswordDetail = (...args) => request({
    url: '/api/myInfo/checkPasswordDetail',
    method : 'post',
    data: {
        ...args
    }
});

export const verifyRecaptcha = (token) => request({
    url: '/api/auth/verifyRecaptcha',
    method: 'post',
    data: {
        token: token
    }
});

/* 오늘 날짜 계기 키워드 가지고 오기 */
export const getIssueContentsGroupMainKeyword = () => request({
	url: '/api/main/getIssueContentsGroupMainKeyword',
	method: 'GET',
});

/* 계기 수업 자료 달력 정보 */
export const getClassDataCalendar = (year, month, day) => request({
	url: '/api/creative/class/data/calendar',
	method: 'get',
	params: {
		year,
		month,
		day
	}
});

/* 계기 수업 자료 일별 데이터 조회 */
export const getClassDayData = (month, day) => request({
	url: '/api/creative/class/data/day',
	method: 'get',
	params: {
		month,
		day
	}
});

/* 계기 수업 자료 월 전체 일별 데이터 조회 */
export const getAllClassMonthData = (month) => request({
	url: '/api/creative/class/data/month',
	method: 'get',
	params: {
		month
	}
});

export const checkRetCnt = (username, password) => request({
    url: '/api/auth/checkRetCnt',
    method: 'post',
    data: {
        username,
        password
    }
});

/* 로그아웃 요청 */
export const logout = () => request({
    url: '/api/auth/logout',
    method: 'post'
});

// 583 출석체크 이벤트용 update
export const insertEventApply584 = (...args) => request({
    url: '/api/saemteo/insertEventApply584',
    method: 'post',
    data: {
        ...args
    }
});

// 자동 로그인 토큰 갱신
export const getAutoLoginToken = (username) => request({
    url: '/api/auth/auto/login/token',
    method: 'post',
    data: {
        username
    }
});

/* 교과 상세뷰 문서 정보 */
export const documentContentInfo = (contentId, contentGubun) => request({
    url: '/api/common/documentContentInfo',
    method: 'get',
    params: {
        contentId,
        contentGubun
    }
});