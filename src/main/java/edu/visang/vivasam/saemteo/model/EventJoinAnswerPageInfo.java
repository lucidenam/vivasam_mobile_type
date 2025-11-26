package edu.visang.vivasam.saemteo.model;

import lombok.Data;

import java.util.List;

/**
 * 이벤트 답변 목록 조회 조건
 */
@Data
public class EventJoinAnswerPageInfo {

    private String eventId;
    private String[] eventIds;
    /**
     * 조회할 이벤트 참여 글 seq - 기본적으로 2번이 이벤트 질문에 대한 답변이다. 특수기호(^||^)로 두개의 답변을 함게 기록한 경우 있음
     */
    private String eventAnswerSeq = "2";

    private int page = 1;
    private int pageSize = 10;
    // 한 이벤트 페이지에 여러 개의 이벤트 중 선택적으로 참여 가능한 하나의 이벤트 참여 내용을 댓글로 보여주는 경우
    private int answerIndex = 0;

    private String recentAnswerEachItem = "N";

    //498 스승의 날 댓글 좋아요 이벤트
    private String memberId;

    //533 22개정 비상 교과서로 인한 추가
    //검색기능 추가입니다
    private int searchIndex;
    private String searchKeyword;
    private String searchKeyword2;
    private List<String> searchKeywordList;
}
