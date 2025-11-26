package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class SurveyItemInfo {
    private String surveyId;

    private String surveyItemNo; //설문 항목 일련번호
    private String surveyItemNm; //설문 항목명
    private String surveySelItemNo; //설문 참여 선택 항목 번호
    private String surveySubjective; // 설문 참여 주관식
    private String surveyOpenYN; // 설문 참여 주관식
    private String memberId;
}
