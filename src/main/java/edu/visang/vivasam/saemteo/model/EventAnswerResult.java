package edu.visang.vivasam.saemteo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventAnswerResult {
    private int rownum;
    private String eventId;
    private String memberId;
    private String eventAnswerDesc;
    private String eventAnswerId;

    // 프론트 전달용
    private String event_id;
    private String member_id;
    private String event_answer_desc;
    private String event_answer_id;

    public String getEvent_id() {
        return eventId;
    }
    public String getMember_id() {
        return memberId;
    }
    public String getEvent_answer_desc() {
        return eventAnswerDesc;
    }
    public String getEvent_answer_id() {
        return eventAnswerId;
    }
}
