package edu.visang.vivasam.payload;

import lombok.Data;
import lombok.ToString;

/**
 * Created by rajeevkumarsingh on 19/08/17.
 */
@Data
@ToString
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String lastDate;
    private boolean isFirst;
    private boolean marketingAgree;
    private String valEndDate;
    private String memberRequiredChk;
    private boolean MemberPasswordModifyChk;
    private String ssoMemberYN;
    private String identifiedYN;
    private String teacherCertifiedYN;
    private String validYN;
    private String mTypeCd;
    private String ipinCi;
    private String niceEncData;
    private String ssoMemChkYn;
    private String loginType = "LOGIN";
    private String epkiYn;
    private String regDate;
    private String token;

    public JwtAuthenticationResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
