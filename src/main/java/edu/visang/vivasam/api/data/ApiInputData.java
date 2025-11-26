package edu.visang.vivasam.api.data;

public class ApiInputData {
    private String memberId             ; //0:Vivasam,1:Tschool
    private String memberTypeCd         ; //0:교사,1:교육전문직원,2:예비교사,3:일반,4:학생
    private String memberPassword       ; //
    private String memberName           ; //
    private String memberCi             ; //
    private String memberHp             ; //
    private String memberEmail          ; //
    private String memberBirthday       ; //
    private String memberSchCd          ; //
    private String memberSchNm          ; //학교코드가 등록이 되지 않았을 경우 학교명 입력
    private String memberSiteRegCase    ; // 2023.09.14 - 8번 가입시  memberSiteRegCase : 회원가입상세경로 추가됨 - MV 모바일 비바샘 중고등
    private String memberMainSubjectCd  ; //
    private String memberSecondSubjectCd; //
    private String memberMktAgrYn       ; //0^Y|1^N"
    private String memberSnsType        ; //NAVER,KAKAO등.
    private String memberSnsId          ; //
    private String memberSnsHp          ; //
    private String memberSnsName        ; //
    private String memberSnsEmail       ; //
    private String memberSnsYear        ; //
    private String memberSrcPath        ; //1,2,3
    private String memberRegCase        ; //0:Vivasam,1:Tschool
    private String processStr           ; //"case0:신규생성
    private String domId                ; //탈퇴 코드
    private String domMessage           ; //탈퇴 사유
    private String memberRecommendId;
    private String srcProcSite          ; // 0:비바샘,1:연수원    DB처리 기준
    private String srcConnSite          ; // 0:비바샘 초등,1:비바샘 증등,2:연수원    접속출처
    private String srcProcMethod        ; // 0:사이트 , 1: SNS
    private String sessionStatStr   ;

    public String getMemberRecommendId() {
        return memberRecommendId;
    }

    public void setMemberRecommendId(String memberRecommendId) {
        this.memberRecommendId = memberRecommendId;
    }

    public String getSessionStatStr() {
        return sessionStatStr;
    }

    public void setSessionStatStr(String sessionStatStr) {
        this.sessionStatStr = sessionStatStr;
    }

    public String getSrcProcSite() {
        return srcProcSite;
    }

    public void setSrcProcSite(String srcProcSite) {
        this.srcProcSite = srcProcSite;
    }

    public String getSrcProcMethod() {
        return srcProcMethod;
    }

    public void setSrcProcMethod(String srcProcMethod) {
        this.srcProcMethod = srcProcMethod;
    }

    public String getSrcConnSite() {
        return srcConnSite;
    }

    public void setSrcConnSite(String srcConnSite) {
        this.srcConnSite = srcConnSite;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getMemberTypeCd() {
        return memberTypeCd;
    }

    public void setMemberTypeCd(String memberTypeCd) {
        this.memberTypeCd = memberTypeCd;
    }

    public String getMemberPassword() {
        return memberPassword;
    }

    public void setMemberPassword(String memberPassword) {
        this.memberPassword = memberPassword;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getMemberCi() {
        return memberCi;
    }

    public void setMemberCi(String memberCi) {
        this.memberCi = memberCi;
    }

    public String getMemberHp() {
        return memberHp;
    }

    public void setMemberHp(String memberHp) {
        this.memberHp = memberHp;
    }

    public String getMemberEmail() {
        return memberEmail;
    }

    public void setMemberEmail(String memberEmail) {
        this.memberEmail = memberEmail;
    }

    public String getMemberBirthday() {
        return memberBirthday;
    }

    public void setMemberBirthday(String memberBirthday) {
        this.memberBirthday = memberBirthday;
    }

    public String getMemberSchCd() {
        return memberSchCd;
    }

    public void setMemberSchCd(String memberSchCd) {
        this.memberSchCd = memberSchCd;
    }

    public String getMemberMainSubjectCd() {
        return memberMainSubjectCd;
    }

    public void setMemberMainSubjectCd(String memberMainSubjectCd) {
        this.memberMainSubjectCd = memberMainSubjectCd;
    }

    public String getMemberSecondSubjectCd() {
        return memberSecondSubjectCd;
    }

    public void setMemberSecondSubjectCd(String memberSecondSubjectCd) {
        this.memberSecondSubjectCd = memberSecondSubjectCd;
    }

    public String getMemberMktAgrYn() {
        return memberMktAgrYn;
    }

    public void setMemberMktAgrYn(String memberMktAgrYn) {
        this.memberMktAgrYn = memberMktAgrYn;
    }

    public String getMemberSnsType() {
        return memberSnsType;
    }

    public void setMemberSnsType(String memberSnsType) {
        this.memberSnsType = memberSnsType;
    }

    public String getMemberSnsId() {
        return memberSnsId;
    }

    public void setMemberSnsId(String memberSnsId) {
        this.memberSnsId = memberSnsId;
    }

    public String getMemberSnsHp() {
        return memberSnsHp;
    }

    public void setMemberSnsHp(String memberSnsHp) {
        this.memberSnsHp = memberSnsHp;
    }

    public String getMemberSnsName() {
        return memberSnsName;
    }

    public void setMemberSnsName(String memberSnsName) {
        this.memberSnsName = memberSnsName;
    }

    public String getMemberSnsEmail() {
        return memberSnsEmail;
    }

    public void setMemberSnsEmail(String memberSnsEmail) {
        this.memberSnsEmail = memberSnsEmail;
    }

    public String getMemberSnsYear() {
        return memberSnsYear;
    }

    public void setMemberSnsYear(String memberSnsYear) {
        this.memberSnsYear = memberSnsYear;
    }

    public String getMemberSrcPath() {
        return memberSrcPath;
    }

    public void setMemberSrcPath(String memberSrcPath) {
        this.memberSrcPath = memberSrcPath;
    }

    public String getMemberRegCase() {
        return memberRegCase;
    }

    public void setMemberRegCase(String memberRegCase) {
        this.memberRegCase = memberRegCase;
    }

    public String getProcessStr() {
        return processStr;
    }

    public void setProcessStr(String processStr) {
        this.processStr = processStr;
    }

    public String getDomId() {
        return domId;
    }

    public void setDomId(String domId) {
        this.domId = domId;
    }

    public String getDomMessage() {
        return domMessage;
    }

    public void setDomMessage(String domMessage) {
        this.domMessage = domMessage;
    }

    public String getMemberSchNm() {
        return memberSchNm;
    }

    public void setMemberSchNm(String memberSchNm) {
        this.memberSchNm = memberSchNm;
    }

    public String getMemberSiteRegCase() {
        return memberSiteRegCase;
    }

    public void setMemberSiteRegCase(String memberSiteRegCase) {
        this.memberSiteRegCase = memberSiteRegCase;
    }

    @Override
    public String toString() {
        return "ApiInputData{" +
                "memberId='" + memberId + '\'' +
                ", memberTypeCd='" + memberTypeCd + '\'' +
                ", memberPassword='" + memberPassword + '\'' +
                ", memberName='" + memberName + '\'' +
                ", memberCi='" + memberCi + '\'' +
                ", memberHp='" + memberHp + '\'' +
                ", memberEmail='" + memberEmail + '\'' +
                ", memberBirthday='" + memberBirthday + '\'' +
                ", memberSchCd='" + memberSchCd + '\'' +
                ", memberMainSubjectCd='" + memberMainSubjectCd + '\'' +
                ", memberSecondSubjectCd='" + memberSecondSubjectCd + '\'' +
                ", memberMktAgrYn='" + memberMktAgrYn + '\'' +
                ", memberSnsType='" + memberSnsType + '\'' +
                ", memberSnsId='" + memberSnsId + '\'' +
                ", memberSnsHp='" + memberSnsHp + '\'' +
                ", memberSnsName='" + memberSnsName + '\'' +
                ", memberSnsEmail='" + memberSnsEmail + '\'' +
                ", memberSnsYear='" + memberSnsYear + '\'' +
                ", memberSrcPath='" + memberSrcPath + '\'' +
                ", memberRegCase='" + memberRegCase + '\'' +
                ", processStr='" + processStr + '\'' +
                ", domId='" + domId + '\'' +
                ", domMessage='" + domMessage + '\'' +
                ", srcProcSite='" + srcProcSite + '\'' +
                ", srcConnSite='" + srcConnSite + '\'' +
                ", srcProcMethod='" + srcProcMethod + '\'' +
                ", sessionStatStr='" + sessionStatStr + '\'' +
                ", memberSchNm='" + memberSchNm + '\'' +
                ", memberSiteRegCase='" + memberSiteRegCase + '\'' +
                '}';
    }
}