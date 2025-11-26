package edu.visang.vivasam.saemteo.model;

import lombok.Data;

import java.util.Map;

@Data
public class EventJoinReqParam {

    private String eventId;
    private String memberId;
    private String eventAnswerDesc;
    private String eventAnswerDesc2;

    private String ssn;

    // 신청경품 type,수량 정보
    private Map<String, Integer> amountMap;

}
