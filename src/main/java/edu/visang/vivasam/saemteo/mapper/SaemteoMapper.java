package edu.visang.vivasam.saemteo.mapper;

import edu.visang.vivasam.saemteo.model.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Mapper
public interface SaemteoMapper {

    public List<EventInfo> eventList(EventInfo eventInfo);

    public List<EventInfo> eventListAll(EventInfo eventInfo);

    // 공개여부, 공개플랫폼과 상관없이 정보 조회,
    public EventInfo getEventInfoNoMatterUseYn(String eventId);

    int getEventMileagePoint(String eventId);

    public List<EventInfo> eventSubEventList(String eventId);

    public List<CulturalActInfo> programList(@Param("gubunCd") String gubunCd, @Param("stateCd") String stateCd, @Param("rowNum") Integer rowNum, @Param("cultureActId") String cultureActId);
    
    public CulturalActInfo findProgramById(@Param("cultureActId") Long cultureActId);

    public List<SurveyInfo> surveyList(@Param("ingSurveyYn") String ingSurveyYn, @Param("surveyId") String surveyId);

    public void programUpdateReadCount(@Param("cultureActId") String cultureActId);

    public void eventUpdateReadCount(@Param("eventId") String eventId);

    public int cultureProgramOfflineSeminarApplyCheck(@Param("memberId") String memberId, @Param("cultureActId") String cultureActId);

    public void cultureProgramOfflineSeminarApplyInsert(CulturalActApplyInfo culturalActApplyInfo);

    public SurveyInfo surveyInfo(@Param("surveyId") String surveyId);

    public List<SurveyInfo> surveyApplyStat(@Param("surveyId") String surveyId);

    public List<SurveyItemInfo> surveySubejctiveItemList(Map<String, Object> paramMap);

    public int surveyApplyCnt(@Param("memberId") String memberId, @Param("surveyId") String surveyId);

    public int surveyApplyInsert(@Param("surveyId") String surveyId, @Param("memberId") String memberId);

    public void surveyItemApplyInsert(@Param("surveyId") String surveyId, @Param("memberId") String memberId, @Param("surveyItemNo") String surveyItemNo, @Param("surveySubjective") String surveySubjective);

    public int surveySubejctiveItemCount(@Param("surveyId") String surveyId, @Param("surveyItemNo") String surveyItemNo);

    public List<Map<String, Object>> recommandEduBannerList();

    public int eventApplyCheck(@Param("memberId") String memberId, @Param("eventId") String eventId);

    public int eventApplyInsert(HashMap<String, String> paramMap);
    public int eventApplyInsertExists(HashMap<String, String> paramMap);

    public int checkEventTotalJoin(@Param("eventId") String eventId);

    public int checkEventTotalJoinMy(@Param("eventId") String eventId, @Param("memberId") String memberId);

    public int eventJoinAnswerInsert(HashMap<String, String> paramMap);

    public int eventJoinAnswerInsertForGoods(HashMap<String, String> paramMap);

    // 20190411 부터 신규 함수는 아래쪽에 작성해주세요.
    public List<Map<String, Object>> eventJoinAnswerApplyList(EventJoinAnswerPageInfo parameter);

    public int eventJoinDelete(HashMap<String, String> paramMap);

    public int eventJoinAnswerDelete(HashMap<String, String> paramMap);

    public int eventJoinAnswerUpdate(HashMap<String, String> paramMap);

    public int getGiftBundleCount(HashMap<String , String> paramMap);

    public int chkEventJoinAnswerSeq(HashMap<String , String> paramMap);

    public int chkEventJoinQntCnt(HashMap<String , String> paramMap);

    // 이벤트 경품 잔여 신청가능 수량 조회
    public List<EventAmount> selectEventAmountRemains(String eventId);

    EventInfo getParentEventInfoSubDupYnByEventId(String eventId);

    int getEventJoinCntByEventParentId(@Param("eventParentId") String eventParentId, @Param("memberId") String memberId);

    public String getMyEventJoinAnswer(@Param("eventId") String eventId, @Param("memberId") String memberId);

    String getMyEventJoinAnswerByParentEventId(@Param("eventParentId") String eventParentId, @Param("memberId") String memberId);

    public List<Map<String, Object>> classLiveQuestionAmount();

    public int checkEventCntCount(HashMap<String, String> paramMap);

    public int checkEventTotAmount(HashMap<String, String> paramMap);

    public int checkPrivateEventMemberCount(HashMap<String, String> paramMap);

    public int googleSurveyCountCheck(@Param("eventId") String eventId);

    public int insertMonitoringEvent(HashMap<String, String> paramMap);

    public String eventMemberSchoolInfo(HashMap<String, String> paramMap);

    public int deleteEventJoinInfo(HashMap<String, String> paramMap);
    public int deleteEventJoinInfo2(HashMap<String, String> paramMap);

    int getEventJoinAnswerCntForTwoComment(HashMap<String, String> paramMap);

    List<Map<String, Object>> getEventJoinAnswerListForTwoComment(HashMap<String, String> paramMap);

    int getSpecificEventTotalJoin(EventJoinAnswerPageInfo parameter);

    List<EventAnswerResult> getSpecificEventJoinAnswerList(EventAnswerParameter parameter);

    List<Map<String, Object>> getSpecificEventJoinAnswerList3(HashMap<String, String> paramMap);
    int getReplyCount(String eventId);
    int writeReply(HashMap<String, Object> paramMap);

    void insertEventAgreeInfo(MemberEventAgreeInfo memberEventAgreeInfo);

    int getEventAgreeInfoCount(MemberEventAgreeInfo memberEventAgreeInfo);

    String getRouletteEventUrlJoin(@Param("memberId") String memberId);

    void saveRouletteEventUrl(HashMap<String, String> param);

    void update2ndRouletteEventJoin(HashMap<String, String> param);

    void updateRouletteUrlJoinYn(HashMap<String, String> param);

    List<EventAmount> getEventAmountList(@Param("eventId") String eventId);

    int getTodayRouletteJoinCnt(@Param("check") String check);

    String getEventEndDate(String eventId);

    void saveVivasamGoEventAnswer(HashMap<String, String> param);

    void insertEventJoinSsn(@Param("eventId") Integer eventId, @Param("memberId") String memberId, @Param("ssn") String ssn);

    void updateEventJoinSsn(@Param("eventId") Integer eventId, @Param("memberId") String memberId, @Param("ssn") String ssn);

    int getEventJoinSsnCnt(@Param("eventId") Integer eventId, @Param("memberId") String memberId);

    List<EventInfo> eventJoinList(String eventId);

    List<EventInfo> ourSchJoinList(@Param("eventId") String eventId, @Param("memberId") String memberId);

    int recommenderCheck(@Param("recommender") String recommender, @Param("memberId") String memberId);

    String existRecommend(String recommender);

    List<Map<String, Object>> getEventJoinAnswerList2(HashMap<String, String> paramMap);

    int getSpecificEventTotalJoin2(HashMap<String, String> paramMap);

    List<EventInfo> getRecommendRankList(String eventId);

    List<Map<String, Object>> get2024EventAnswerList(HashMap<String, String> paramMap);

    int get2024EventAnswerCount(HashMap<String, String> paramMap);

    int getCampaignJoinCnt(EventInfo eventReqInfo);

    //498 스승의날 좋아요 이벤트관련
    List<Map<String, Object>> get2024EventAnswerList498(HashMap<String, String> paramMap);
    void updateStateEventLike(EventInfo param);
    int getEventLikeCnt(EventInfo param);
    void insertEventJoinLike(EventInfo param);
    void deleteEventJoinLike(EventInfo param);

    int getEventJoinCheck(String memberId);

    int getMyRecomCnt(String memberId);
    List<Map<String, String>> getMyRecomList(String memberId);

    List<EventInfo> getPopularCnt(@Param("eventId") String eventId, @Param("eventAnswerSeq") String eventAnswerSeq);
    String chkEventJoinDate(EventInfo param);

    //520 이벤트 출석체크 이벤트
    void applyEventJoin521(HashMap<String, String> param);

    List<Map<String, Object>> getEventVoteRank();

    void applyEventJoin584(HashMap<String, String> param);
}
