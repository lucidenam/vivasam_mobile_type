package edu.visang.vivasam.member.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberInfo {
    // 가입여부 판단
    private int isExist;
    // 등록 성공여부
    private int isSucces;
    // 학교정보 검색
    private int code;
    private String dosi;
    private String addr;
    private String tab;
    private String sido;
    private String sigungu;

    // 가입자 정보
    private String memberId;
    private String pwd;
    private String name;
    private String shaYn;
    private String questionCode;
    private String answer;
    private String email;
    private String mailingYn;
    private String gender;
    private String lunar;
    private String birth;
    private String tcCode;
    private String cellphone;
    private String cellphone1;
    private String cellphone2;
    private String cellphone3;
    private String smsYn;
    private String tel;
    private String telYn;
    private String zip;
    private String addr1;
    private String addr2;
    private String ipinCi;
    private String epkiCertdn;
    private String epkiCertsn;
    private String validYn;
    private String mTypeCd;
    private int chalkPoint;
    private String profileImgPath;
    private int scrapCnt;
    private int editCnt;
    private String mySub;
    private String mySubCode;
    private int visitCnt;
    private String lastIp;
    private String lastDate;
    private String lastTime;
    private String regDate;
    private String regTime;
    private String valDate;
    private String valTime;
    private String branchYn;
    private String nickname;
    private String nicknameYn;
    private String sex;					//	성별
    private String visangTbYN;			//	비상교과서 채택여부
    private String valEndDate;			//	비상교과서 채택여부

    // 가입자 학교 정보
    private String fkareacode;
    private String fkbranchcode;
    private String fkareaname;
    private String fkbranchname;
    private String schFlag;
    private int schCode;
    private String schName;
    private String school;
    private String introduce;
    private String area;
    private String myGrade;

    //20160311, 학교 주소 정보 추가, 심원보
    private String schZipCd; //학교 우편번호
    private String schAddr; //학교 주소

    // 가입자 선택 교과정보
    private String selectedTextbook;

    // 교과서 목록 정보
    private String educourseId;
    private String textbook;
    private String textbookName;
    private String otherlessonyn;
    private String otherlessonynLog;

    // 공개여부컬럼
    private String emailYn;
    private String schoolnameYn;
    private String schoollocYn;
    private String birthYn;
    private String textbookYn;
    private String cellphoneYn;
    private String introduceYn;

    //우편번호 테이블
    private String zipcode;
    private String gugun;
    private String dong;
    private String ri;
    private String bunji;
    private String building;

    //그룹관련 테이블
    private String grinfoId;			//	그룹 ID
    private String gr_memberLevel;		//	그룹별 사용자 LEVEL
    private String blackYn;				//	그룹 가입 불가 회원 여부

    //비상교과서 채택 사용Yn
    private String subjectBookUseYn;

    private String joinDomain; //회원가입 사이트
    private String updateDt; //비바샘 회원정보 최종 업데이트 일자(온티처 회원의 경우 NULL, 부가정보 등록시 업데이트됨)


    private String mainSubject;
    private String secondSubject;

    private String age;
    private String schoolLvlNm;

    private String expiryTermNum;

    private String marketingSmsYn;
    private String marketingEmailYn;
    private String marketingTelYn;

    private String marketingSmsYnT;
    private String marketingEmailYnT;
    private String marketingTelYnT;

    private String ssoMember = null; /* SSO 통합회원 여부*/
    private String identified = null;	/* SSO 본인 인증 여부 */
    private String thirdMarketingAgree = null;	/* SSO 제3자 마케팅 동의 여부 */
    private String ssoRegDate;			/* SSO 통합회원 전환/가입 일자 (format YYYY.MM.DD) */

    private String oldPassword;

    private String[] grade;
}
