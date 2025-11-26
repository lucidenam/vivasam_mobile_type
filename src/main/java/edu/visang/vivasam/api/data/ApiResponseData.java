package edu.visang.vivasam.api.data;

/**
 * API REUTRN DATA
 */
public class ApiResponseData {
    private String srcProcSite;
    private String memberId;
    private String memberCi;
    private String memberName;
    private String memberIdUseYn;
    private String memberEmail;
    private String memberHp;
    private String memberBirthday;
    private String memberSchCd;
    private String memberMainSubjectCd;
    private String memberSecondSubjectCd;
    private String memberRegCase;
    private String processStr;
    private String mailYn;
    private String smsYn;
    private String telYn;
    private String access_token;
    private String refresh_token;
    private String session_state;
    private String mailAgreeDate;
    private String smsAgreeDate;
    private String telAgreeDate;


    public String getSrcProcSite() {
        return srcProcSite;
    }

    public void setSrcProcSite(String srcProcSite) {
        this.srcProcSite = srcProcSite;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getMemberCi() {
        return memberCi;
    }

    public void setMemberCi(String memberCi) {
        this.memberCi = memberCi;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getMemberIdUseYn() {
        return memberIdUseYn;
    }

    public void setMemberIdUseYn(String memberIdUseYn) {
        this.memberIdUseYn = memberIdUseYn;
    }

    public String getMemberEmail() {
        return memberEmail;
    }

    public void setMemberEmail(String memberEmail) {
        this.memberEmail = memberEmail;
    }

    public String getMemberHp() {
        return memberHp;
    }

    public void setMemberHp(String memberHp) {
        this.memberHp = memberHp;
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

    public String getMailYn() {
        return mailYn;
    }

    public void setMailYn(String mailYn) {
        this.mailYn = mailYn;
    }

    public String getSmsYn() {
        return smsYn;
    }

    public void setSmsYn(String smsYn) {
        this.smsYn = smsYn;
    }

    public String getTelYn() {
        return telYn;
    }

    public void setTelYn(String telYn) {
        this.telYn = telYn;
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public String getRefresh_token() {
        return refresh_token;
    }

    public void setRefresh_token(String refresh_token) {
        this.refresh_token = refresh_token;
    }

    public String getSession_state() {
        return session_state;
    }

    public void setSession_state(String session_state) {
        this.session_state = session_state;
    }

    public String getMailAgreeDate() {
        return mailAgreeDate;
    }

    public void setMailAgreeDate(String mailAgreeDate) {
        this.mailAgreeDate = mailAgreeDate;
    }

    public String getSmsAgreeDate() {
        return smsAgreeDate;
    }

    public void setSmsAgreeDate(String smsAgreeDate) {
        this.smsAgreeDate = smsAgreeDate;
    }

    public String getTelAgreeDate() {
        return telAgreeDate;
    }

    public void setTelAgreeDate(String telAgreeDate) {
        this.telAgreeDate = telAgreeDate;
    }



    @Override
    public String toString() {
        return "ApiResponseData{" +
                "srcProcSite='" + srcProcSite + '\'' +
                ", memberId='" + memberId + '\'' +
                ", memberCi='" + memberCi + '\'' +
                ", memberName='" + memberName + '\'' +
                ", memberIdUseYn='" + memberIdUseYn + '\'' +
                ", memberEmail='" + memberEmail + '\'' +
                ", memberHp='" + memberHp + '\'' +
                ", memberBirthday='" + memberBirthday + '\'' +
                ", memberSchCd='" + memberSchCd + '\'' +
                ", memberMainSubjectCd='" + memberMainSubjectCd + '\'' +
                ", memberSecondSubjectCd='" + memberSecondSubjectCd + '\'' +
                ", memberRegCase='" + memberRegCase + '\'' +
                ", processStr='" + processStr + '\'' +
                ", mailYn='" + mailYn + '\'' +
                ", smsYn='" + smsYn + '\'' +
                ", telYn='" + telYn + '\'' +
                ", access_token='" + access_token + '\'' +
                ", refresh_token='" + refresh_token + '\'' +
                ", session_state='" + session_state + '\'' +
                ", mailAgreeDate='" + mailAgreeDate + '\'' +
                ", smsAgreeDate='" + smsAgreeDate + '\'' +
                ", telAgreeDate='" + telAgreeDate + '\'' +
                '}';
    }
}
