package edu.visang.vivasam.common.utils;

import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class NiceUtil {

    Environment environment;

    public NiceUtil(Environment environment) {
        this.environment = environment;
    }

    //비상교육 NICE 사이트코드
    private static final String SITE_CODE = "BP217";
    //비상교육 NICE 사이트 패스워드
    private static final String SITE_PASSWORD = "Q6GaO9yQrp49";
    // CheckPlus(본인인증) 처리 후, 결과 데이타를 리턴 받기위해 다음예제와 같이 http부터 입력합니다.
    //리턴url은 인증 전 인증페이지를 호출하기 전 url과 동일해야 합니다. ex) 인증 전 url : http://www.~ 리턴 url : http://www.~
    // 성공시 이동될 URL
    private static final String S_RETURN_URL = "/api/member/getNiceVerificationData";

    // 실패시 이동될 URL
    private static final String S_ERROR_URL = "/#/verification/error";

    public HashMap getEncData(String uuid) {
        NiceID.Check.CPClient niceCheck = new  NiceID.Check.CPClient();

        String sRequestNumber = "REQ0000000001";
        sRequestNumber = niceCheck.getRequestNO(SITE_CODE);

        String sAuthType = "";      // 없으면 기본 선택화면, M: 핸드폰, C: 신용카드, X: 공인인증서
        String popgubun = "";		// Y : 취소버튼 있음 / N : 취소버튼 없음
        String customize = "";		// 없으면 기본 웹페이지 / Mobile : 모바일페이지
        String sGender = ""; 		// 없으면 기본 선택 값, 0 : 여자, 1 : 남자

        String returnUrl = environment.getProperty("vivasam.api.domain") + S_RETURN_URL + "/" + uuid;
        String errorUrl = environment.getProperty("vivasam.front.domain") + S_ERROR_URL;
        // 입력될 plain 데이타를 만든다.
        String sPlainData = "7:REQ_SEQ" + sRequestNumber.getBytes().length + ":" + sRequestNumber +
                "8:SITECODE" + SITE_CODE.getBytes().length + ":" + SITE_CODE +
                "9:AUTH_TYPE" + sAuthType.getBytes().length + ":" + sAuthType +
                "7:RTN_URL" + returnUrl.getBytes().length + ":" + returnUrl +
                "7:ERR_URL" + errorUrl.getBytes().length + ":" + errorUrl +
                "11:POPUP_GUBUN" + popgubun.getBytes().length + ":" + popgubun +
                "9:CUSTOMIZE" + customize.getBytes().length + ":" + customize +
                "6:GENDER" + sGender.getBytes().length + ":" + sGender;

        String sMessage = "";
        String sEncData = "";

        int iReturn = niceCheck.fnEncode(SITE_CODE, SITE_PASSWORD, sPlainData);
        if( iReturn == 0 ) {
            sEncData = niceCheck.getCipherData();
        } else if( iReturn == -1) {
            sMessage = "암호화 시스템 에러입니다.";
        } else if( iReturn == -2) {
            sMessage = "암호화 처리오류입니다.";
        } else if( iReturn == -3) {
            sMessage = "암호화 데이터 오류입니다.";
        } else if( iReturn == -9) {
            sMessage = "입력 데이터 오류입니다.";
        } else {
            sMessage = "알수 없는 에러 입니다. iReturn : " + iReturn;
        }

        HashMap<String, String> resultMap = new HashMap<String, String>();
        resultMap.put("sEncData", sEncData);
        resultMap.put("sMessage", sMessage);

        return resultMap;
    }

    public Map<String, String> setDecodeData(String encodeData) {
        NiceID.Check.CPClient niceCheck = new  NiceID.Check.CPClient();

        String sEncodeData = requestReplace(encodeData, "encodeData");
        String sCipherTime = "";			// 복호화한 시간
        String sRequestNumber = "";			// 요청 번호
        String sResponseNumber = "";		// 인증 고유번호
        String sAuthType = "";				// 인증 수단
        String sName = "";					// 성명
        String sDupInfo = "";				// 중복가입 확인값 (DI_64 byte)
        String sConnInfo = "";				// 연계정보 확인값 (CI_88 byte)
        String sBirthDate = "";				// 생년월일(YYYYMMDD)
        String sGender = "";				// 성별
        String sNationalInfo = "";			// 내/외국인정보 (개발가이드 참조)
        String sMobileNo = "";				// 휴대폰번호
        String sMobileCo = "";				// 통신사
        String sMessage = "";
        String sPlainData = "";

        Map<String, String> resultMap = new HashMap<>();
        int iReturn = niceCheck.fnDecode(SITE_CODE, SITE_PASSWORD, sEncodeData);
        if( iReturn == 0 )
        {
            sPlainData = niceCheck.getPlainData();
            sCipherTime = niceCheck.getCipherDateTime();

            // 데이타를 추출합니다.
            java.util.HashMap mapresult = niceCheck.fnParse(sPlainData);

            sRequestNumber  = (String)mapresult.get("REQ_SEQ");
            sResponseNumber = (String)mapresult.get("RES_SEQ");
            sAuthType		= (String)mapresult.get("AUTH_TYPE");
            sName			= (String)mapresult.get("NAME");
            //sName			= (String)mapresult.get("UTF8_NAME"); //charset utf8 사용시 주석 해제 후 사용
            sBirthDate		= (String)mapresult.get("BIRTHDATE");
            sGender			= (String)mapresult.get("GENDER");
            sNationalInfo  	= (String)mapresult.get("NATIONALINFO");
            sDupInfo		= (String)mapresult.get("DI");
            sConnInfo		= (String)mapresult.get("CI");
            sMobileNo		= (String)mapresult.get("MOBILE_NO");
            sMobileCo		= (String)mapresult.get("MOBILE_CO");

            //String session_sRequestNumber = (String)session.getAttribute("REQ_SEQ");
            //if(!sRequestNumber.equals(session_sRequestNumber))
            //{
            //    sMessage = "세션값이 다릅니다. 올바른 경로로 접근하시기 바랍니다.";
            //    sResponseNumber = "";
            //    sAuthType = "";
            //}
        } else if( iReturn == -1) {
            sMessage = "복호화 시스템 에러입니다.";
        } else if( iReturn == -4) {
            sMessage = "복호화 처리오류입니다.";
        } else if( iReturn == -5) {
            sMessage = "복호화 해쉬 오류입니다.";
        } else if( iReturn == -6) {
            sMessage = "복호화 데이터 오류입니다.";
        } else if( iReturn == -9) {
            sMessage = "입력 데이터 오류입니다.";
        } else if( iReturn == -12) {
            sMessage = "사이트 패스워드 오류입니다.";
        } else {
            sMessage = "알수 없는 에러 입니다. iReturn : " + iReturn;
        }

        resultMap.put("sRequestNumber", sRequestNumber);
        resultMap.put("sResponseNumber", sResponseNumber);
        resultMap.put("sAuthType", sAuthType);
        resultMap.put("sName", sName);
        resultMap.put("sBirthDate", sBirthDate);
        resultMap.put("sGender", sGender);
        resultMap.put("sNationalInfo", sNationalInfo);
        resultMap.put("sDupInfo", sDupInfo);
        resultMap.put("sConnInfo", sConnInfo);
        resultMap.put("sMobileNo", sMobileNo);
        resultMap.put("sMobileCo", sMobileCo);
        resultMap.put("iReturn", String.valueOf(iReturn));
        resultMap.put("sMessage", sMessage);

        return resultMap;
    }

    public String requestReplace (String paramValue, String gubun) {

        String result = "";

        if (paramValue != null) {

            paramValue = paramValue.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

            paramValue = paramValue.replaceAll("\\*", "");
            paramValue = paramValue.replaceAll("\\?", "");
            paramValue = paramValue.replaceAll("\\[", "");
            paramValue = paramValue.replaceAll("\\{", "");
            paramValue = paramValue.replaceAll("\\(", "");
            paramValue = paramValue.replaceAll("\\)", "");
            paramValue = paramValue.replaceAll("\\^", "");
            paramValue = paramValue.replaceAll("\\$", "");
            paramValue = paramValue.replaceAll("'", "");
            paramValue = paramValue.replaceAll("@", "");
            paramValue = paramValue.replaceAll("%", "");
            paramValue = paramValue.replaceAll(";", "");
            paramValue = paramValue.replaceAll(":", "");
            paramValue = paramValue.replaceAll("-", "");
            paramValue = paramValue.replaceAll("#", "");
            paramValue = paramValue.replaceAll("--", "");
            paramValue = paramValue.replaceAll("-", "");
            paramValue = paramValue.replaceAll(",", "");

            if(gubun != "encodeData"){
                paramValue = paramValue.replaceAll("\\+", "");
                paramValue = paramValue.replaceAll("/", "");
                paramValue = paramValue.replaceAll("=", "");
            }

            result = paramValue;

        }
        return result;
    }
}
