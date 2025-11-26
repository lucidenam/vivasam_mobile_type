package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class CulturalActInfo {

    // 프로그램 구분코드 - 교사문화 프로그램
    public static final String PROGRAM_GUBUN_CD_CULTURE_PROGRAM = "1";
    public static final String PROGRAM_GUBUN_CD_OFFLINE_SEMINAR = "2";
    
    // 참여구분코드 - 전체
    public static final String APPLY_GUBUN_CD_ALL = "ALL";
    // 참여구분코드 - 현장참여
    public static final String APPLY_GUBUN_CD_OFFLINE = "OFFLINE";
    // 참여구분코드 - 온라인
    public static final String APPLY_GUBUN_CD_ONLINE = "ONLINE";

    
    private String memberId;
    private String cultureActId;
    private String title;
    private String mobileTitle;
    private String startDt;
    private String endDt;
    private String contentsGubunCd;
    private String contents;
    private String mobileContents;
    private String summary;
    private String url;
    private String thumbnail;
    private String mobileThumPathUrl;
    private String postscriptGubunCd;
    private String postscript;
    private String postscriptLinkUrl;
    private String applyCnt;
    private String state;
    private int readCnt;
    private int recomCnt;
    private int putCnt;
    private int downCnt;
    private int replyCnt;
    private String regDt;
    private String regId;
    private String upDt;
    private String upId;
    private String mobileApplyContents;
    private String mobileTerm;
    private String addCheckboxYn;
    private String addCheckboxText;
    
    /** 프로그램구분 코드 (1:교사문화프로그램, 2:오프라인세미나) */
    private String programGubunCd;
    /** 참여구분코드  */
    private String applyGubunCd;
}
