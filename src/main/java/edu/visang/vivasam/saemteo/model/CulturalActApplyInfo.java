package edu.visang.vivasam.saemteo.model;

import lombok.Data;

/**
 * 교사문화프로그램/오프라인세미나 신청 정보
 */
@Data
public class CulturalActApplyInfo {

    String cultureActId;
    String memberId;
    String withPeopleNumber;

    String questionCtnt;
    String online;
    String offline;
    String eventAnswerDesc; // 이벤트 내용1

}
