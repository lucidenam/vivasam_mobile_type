package edu.visang.vivasam.api.url;

/**
 * API URL 관리
 *
 * @author
 */
public enum ApiUrlInfo {
    CREATE_USER("/users", "POST", "회원생성"),
    IS_SSO_MEMBER_CHECK("/users/isSsoMemberYn", "POST", "통합회원 가입여부 확인"),
    SEARCH_USER_CI_INFO("/users/searchCi", "POST", "유저 가입 정보 확ㅇ니"),
    DUPLICATE_USER_ID_CHECK("/users/searchId", "GET", "아이디 중복 체크"),
    DUPLICATE_EMAIL_CHECK("/users/email", "POST", "이메일 중복 체크"),
    INSERT_SNS_MEMBER_INFO("/users/snsReg", "POST", "SNS 회원 연동"),
    DELETE_SNS_MEMBER_INFO("/users/snsEscape", "POST", "SNS 회원 연동"),
    LEAVE_USER("/users/escape", "POST", "회원 탈퇴"),
    UPDATE_USER_INFO("/users", "POST", "회원 수정"),
    UPDATE_USER_PASSWORD("/users/changePassword", "POST", "패스워드 수정"),
    SEARCH_MARKETING_INFO("/users/searchMarketing", "POST", "통합회원 마케팅 동의 여부 조회"),
    USER_LOGIN("/users/login", "POST", "회원 로그인")

    ;

    private String apiUrl;
    private String apiMethod;
    private String description;

    ApiUrlInfo(String apiUrl, String apiMethod, String description) {
        this.apiUrl = apiUrl;
        this.apiMethod = apiMethod;
        this.description = description;
    }


    public String getApiUrl() {
        return apiUrl;
    }

    public String getApiMethod() {
        return apiMethod;
    }

    public String getDescription() {
        return description;
    }





}
