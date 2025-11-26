package edu.visang.vivasam.saemteo.model;


import lombok.Data;
import lombok.ToString;

/** 모니터링단 전용 VO **/
@Data
@ToString
public class MonitoringGroupApplyInfo {

    private String memberId;
    private String mntrNumber;
    private String teacherNm;
    private String email;
    private String tccode;
    private String cellphone;
    private String schoolCd;
    private String schoolNm;
    private String fkareacode;
    private String fkbranchcode;
    private String schoolLvlCd;
    private String mSubjectCd;
    private String visangTbYN;
    private String chargeGrade;
    private String teacherCareer;
    private String applyReason;
    private String activityDesc;

}
