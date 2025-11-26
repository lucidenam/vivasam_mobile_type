package edu.visang.vivasam.saemteo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventAnswerParameter {
    private String eventId;
    private String[] eventIds;
    private EventAnswerPage answerPage;
    private String eventAnswerSeq;
    private String answerIndex;
}
