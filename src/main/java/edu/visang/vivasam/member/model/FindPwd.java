package edu.visang.vivasam.member.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class FindPwd {
    private String memberName;
    private String memberEmail;
    private String memberId;
    private String cellPhone;
    private String memberIpin;
    private String certifiNum;
    private String uuidForCertifiNum;
    @JsonIgnore
    private String tempPwd;

    private String randomNumber;
    private String snsYn;

    private int result = 0;
}
