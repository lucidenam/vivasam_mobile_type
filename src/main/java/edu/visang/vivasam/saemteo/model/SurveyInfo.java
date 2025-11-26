package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import lombok.ToString;

import java.util.List;

@Data
@ToString
public class SurveyInfo {
    private String surveyId;
    private String surveyYear;
    private String surveyMonth;
    private String subject;
    private String surveyStartDt;
    private String surveyEndDt;
    private String surveyTypeCd;
    private String surveyDuplSelCnt; //설문 중복 선택수
    private String surveyUseYn;
    private String surveyRegDt;
    private String surveyRegrId;

    private String surveyItemNo; //설문 항목 일련번호
    private String surveyItemNm; //설문 항목명

    private String memberId;
    private String surveySelItemNo; //설문 항목 선택 일련번호
    private String surveyApplyDt;
    private String surveyApplyCnt; //참여자수

    private String surveySelItemCnt; //설문 항목 선택자수

    private String name; //회원 성명
    private String schLvlNm; //회원 학교급
    private String schName;
    private String mainSubjectNm;
    private String myGrade;
    private String surveyType;

    private List<SurveyInfo> surveyItemList = null;
}
