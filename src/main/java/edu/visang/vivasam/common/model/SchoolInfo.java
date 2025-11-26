package edu.visang.vivasam.common.model;

import lombok.Data;
import lombok.ToString;

/**
 * 학교정보 (참조 - V_SCHOOL_INFO)
 */
@Data
@ToString
public class SchoolInfo {
    
    private Integer code;
    private String dosi;
    private String name;
    private String addr;
    private String zip;
    private String tel;
    /** 학교급 (E:초등, M:중등, H:고등) - 그외(I:한국교육개발원중등, B:광주교대, U:한국교육개발원고등, S:현재사용안함) */
    private String tab;
    private String pkCode;
    private String fkCode;
    
    /**
     * 학교급 TAB 값을 UserSession에서 사용할 학교급으로 변경하여 반환
     * @return 학교급코드
     */
    public String getSchoolLvlCd() {
        if ("E".equals(this.tab)) {
            return "ES";
        } else if ("M".equals(this.tab)) {
            return "MS";
        } else if ("H".equals(this.tab)) {
            return "HS";
        } 
        return "";
    }
}
