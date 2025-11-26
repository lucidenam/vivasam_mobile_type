package edu.visang.vivasam.saemteo.service;

import edu.visang.vivasam.common.utils.PageUtils;
import edu.visang.vivasam.common.utils.StringEncrypter;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.exception.VivasamException;
import edu.visang.vivasam.member.mapper.MemberRecommendationMapper;
import edu.visang.vivasam.member.model.Mileage;
import edu.visang.vivasam.member.model.MileageCode;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.saemteo.mapper.SaemteoMapper;
import edu.visang.vivasam.saemteo.model.*;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SaemteoService {

    private static final Logger logger = LoggerFactory.getLogger(SaemteoService.class);

    @Autowired
    SaemteoMapper saemteoMapper;

    @Autowired
    MemberRecommendationMapper memberRecommendationMapper;

    @Autowired
    private MemberMileageService memberMileageService;

    public List<EventInfo> eventList(EventInfo eventInfo) {
        return saemteoMapper.eventList(eventInfo);
    }

    public List<EventInfo> eventListAll(EventInfo eventInfo) {
        return saemteoMapper.eventListAll(eventInfo);
    }

    public EventInfo getEventInfoNoMatterUseYn(String eventId) {
        return saemteoMapper.getEventInfoNoMatterUseYn(eventId);
    }

    public int getEventMileagePoint(String eventId) {
        return saemteoMapper.getEventMileagePoint(eventId);
    }

    public List<EventInfo> eventSubEventList(String eventId) {
        return saemteoMapper.eventSubEventList(eventId);
    }

    public List<CulturalActInfo> programList(String gubunCd, String stateCd, Integer rowNum, String cultureActId) {
        return saemteoMapper.programList(gubunCd, stateCd, rowNum, cultureActId);
    }

    public CulturalActInfo findProgramById(Long cultureActId) {
        if (cultureActId == null) return null;
        return saemteoMapper.findProgramById(cultureActId);
    }
    

    public List<SurveyInfo> surveyList(String ingSurveyYn, String surveyId) {
        return saemteoMapper.surveyList(ingSurveyYn, surveyId);
    }

    public void programUpdateReadCount(String cultureActId) {
        saemteoMapper.programUpdateReadCount(cultureActId);
    }

    public void eventUpdateReadCount(String eventId) {
        saemteoMapper.eventUpdateReadCount(eventId);
    }

    public int cultureProgramOfflineSeminarApplyCheck(String memberId, String cultureActId) {
        return saemteoMapper.cultureProgramOfflineSeminarApplyCheck(memberId, cultureActId);
    }

    @Transactional
    public void cultureProgramOfflineSeminarApplyInsert(CulturalActInfo culturalActInfo, CulturalActApplyInfo culturalActApplyInfo) {
        String programGubunCd = culturalActInfo.getProgramGubunCd();
        String applyGubunCd = culturalActInfo.getApplyGubunCd();

        // 교사문화 프로그램 신청
        if (CulturalActInfo.PROGRAM_GUBUN_CD_CULTURE_PROGRAM.equals(programGubunCd)) {
            String online = culturalActApplyInfo.getOnline();
            String offline = culturalActApplyInfo.getOffline();

            // 온라인, 오프라인 둘다 참석 가능일 경우, 값이 없는 것을 "0"으로 설정
            if (CulturalActInfo.APPLY_GUBUN_CD_ALL.equals(applyGubunCd)) {
                online = (StringUtils.isNotBlank(online) ? online : "0");
                offline = (StringUtils.isNotBlank(offline) ? offline : "0");

            } else if (CulturalActInfo.APPLY_GUBUN_CD_ONLINE.equals(applyGubunCd)) {
                online = "1";
                offline = "0";

            } else {
                // 기본은 offline 신청
                online = "0";
                offline = "1";
            }

            culturalActApplyInfo.setOnline(online);
            culturalActApplyInfo.setOffline(offline);

            saemteoMapper.cultureProgramOfflineSeminarApplyInsert(culturalActApplyInfo);

        }
        // 오프라인 세미나 신청
        else if (CulturalActInfo.PROGRAM_GUBUN_CD_OFFLINE_SEMINAR.equals(programGubunCd)) {
            culturalActApplyInfo.setOnline("0");
            culturalActApplyInfo.setOffline("1");
            saemteoMapper.cultureProgramOfflineSeminarApplyInsert(culturalActApplyInfo);
        }
    }


    public SurveyInfo surveyInfo(String surveyId) {
        return saemteoMapper.surveyInfo(surveyId);
    }

    public List<SurveyInfo> surveyApplyStat(String surveyId) {
        return saemteoMapper.surveyApplyStat(surveyId);
    }

    public int surveySubejctiveItemCount(String surveyId, String surveyItemNo) {
        return saemteoMapper.surveySubejctiveItemCount(surveyId, surveyItemNo);
    }

    public Page<?> surveySubejctiveItemList(int pageno, int pagesize, int totalCount, String surveyId) {
        Map<String,Object> paramMap = new HashMap<>();
        paramMap.put("surveyId",surveyId);
        paramMap.put("pageno",pageno);
        paramMap.put("pagesize",pagesize);
        List<SurveyItemInfo> list = saemteoMapper.surveySubejctiveItemList(paramMap);
        pageno = pageno - 1;
        PageRequest request = new PageRequest(pageno, pagesize);
        return PageUtils.generatePageClazz(list, totalCount, request);
    }

    public int surveyApplyCnt(String memberId, String surveyId) {
        return saemteoMapper.surveyApplyCnt(memberId, surveyId);
    }

    public int surveyApplyInsert(String surveyId, String memberId) {
        return saemteoMapper.surveyApplyInsert(surveyId, memberId);
    }

    public void surveyItemApplyInsert(String surveyId, String memberId, String surveyItemNo, String surveySubjective) {
        saemteoMapper.surveyItemApplyInsert(surveyId, memberId, surveyItemNo, surveySubjective);
    }

    public List<Map<String, Object>> recommandEduBannerList() {
        return saemteoMapper.recommandEduBannerList();
    }

    public int eventApplyCheck(String memberId, String eventId) {
        return saemteoMapper.eventApplyCheck(memberId,eventId);
    }

    public int eventApplyInsert(HashMap<String, String> paramMap) {
        return saemteoMapper.eventApplyInsert(paramMap);
    }

    public int eventApplyInsertExists(HashMap<String, String> paramMap) {
        return saemteoMapper.eventApplyInsertExists(paramMap);
    }

    public int checkEventTotalJoin(String eventId) {
        return saemteoMapper.checkEventTotalJoin(eventId);
    }

    public int checkEventTotalJoinMy(String eventId,String memberId) {
		return saemteoMapper.checkEventTotalJoinMy(eventId,memberId);
	}

    public int eventJoinAnswerInsert(HashMap<String, String> paramMap) {
        return saemteoMapper.eventJoinAnswerInsert(paramMap);

    }

    public int deleteEventJoinInfo(HashMap<String, String> paramMap) {
        int result1 = saemteoMapper.deleteEventJoinInfo(paramMap);
        int result2 = saemteoMapper.deleteEventJoinInfo2(paramMap);

        return result1 + result2;

    }

    /* 20190411 부터 추가된 내용은 아래에 적어주시면 감사하겠습니다 */
    // Event 질문만 따로 입력
    public int setEventJoinAnswerAddInsert(HashMap<String, String> paramMap) {
        String eventId = paramMap.get("eventId");
        // 하위 이벤트 하나라도 참여할 시 상위 이벤트 마일리지 지급
        if (
                "574".equals(eventId) || "575".equals(eventId) // 교과서 속 순간 이벤트 (7.4 ~ 7.25)
        ) {
			Mileage mileage = new Mileage();

			EventInfo parentEventInfo = saemteoMapper.getParentEventInfoSubDupYnByEventId(paramMap.get("eventId"));
			int parentEventMileagePoint = saemteoMapper.getEventMileagePoint(parentEventInfo.getEventId());

			mileage.setMemberId(paramMap.get("memberId"));
			mileage.setTargetId(parentEventInfo.getEventId());

			int checkEventJoin = memberMileageService.getMileageCntByEventId(mileage);

			if (parentEventMileagePoint != 0 && checkEventJoin <= 0) {
				mileage.setAmount(parentEventMileagePoint);
				mileage.setMileageCode(MileageCode.EVENT.getCode());
                mileage.setTargetMenu("EVENT");
				memberMileageService.insertMileagePlus(mileage);
			}
		}

        return saemteoMapper.eventJoinAnswerInsert(paramMap);
    }

    //경품 신청용 이벤트 insert
    public int eventJoinAnswerInsertForGoods(HashMap<String, String> paramMap) {
        return saemteoMapper.eventJoinAnswerInsertForGoods(paramMap);
    }

    public boolean setEventJoinAnswerAddAmountChk(HashMap<String, String> paramMap) {
        boolean result = false;

        HashMap<String, String> param = new HashMap<String, String>();
        param.put("event_id", paramMap.get("eventId"));
        param.put("seq", paramMap.get("eventAnswerSeq"));
        param.put("member_id", paramMap.get("memberId"));
        param.put("type", paramMap.get("eventAnswerSeq"));

        String strApplyAmount = VivasamUtil.isNull(String.valueOf(paramMap.get("eventAnswerDesc")));

        int intApplyAmount = 1;

        if(!"".equals(strApplyAmount)){
            try{
                intApplyAmount = Integer.parseInt(strApplyAmount);
            }catch(Exception e){
                intApplyAmount = 1;
            }
        }else{
            intApplyAmount = 1;
        }

        int joinCnt = saemteoMapper.chkEventJoinQntCnt(param);
        int limitAmount = saemteoMapper.checkEventTotAmount(param);
        int chkQntCnt = limitAmount - joinCnt;

        if(chkQntCnt >= intApplyAmount){
            result = true;
        }else{
            // 기존 등록 된 정보 삭제
            saemteoMapper.deleteEventJoinInfo(param);
            saemteoMapper.deleteEventJoinInfo2(param);
        }

        return result;
    }



    // eventId와 Event응답 번호 내용을 통해 응답 내용을 출력
    public List<Map<String, Object>> eventJoinAnswerApplyList(EventJoinAnswerPageInfo parameter) {
        logger.debug("eventJoinAnswerApplyList Start");
        List<Map<String, Object>> result = saemteoMapper.eventJoinAnswerApplyList(parameter);

        // EventId가 이상하게 나오는 것도 같이 출력될 수 있어서 해당 부분 제거 위해 넣음
        // member_id == null / event_id == 2 같은 이상한 자료 삭제
        for (int i = 0; i < result.size(); i++) {
            String eventObjectId = String.valueOf(result.get(i).get("event_id"));
            if (parameter.getEventId().equals(eventObjectId)) {
            } else {
                result.remove(i);
                i--;
            }
        }
        return result;
    }

    // Event 참여자 삭제
    public int eventJoinDelete(String event_id, String member_id){
        logger.debug("eventJoinDelete Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", String.valueOf(event_id));
        paramMap.put("memberId", String.valueOf(member_id));
        return saemteoMapper.eventJoinDelete(paramMap);
    }

    // Event 응답 삭제
    public int eventJoinAnswerDelete(String event_id, String member_id){
        logger.debug("eventJoinAnswerDelete Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", String.valueOf(event_id));
        paramMap.put("memberId", String.valueOf(member_id));
        return saemteoMapper.eventJoinAnswerDelete(paramMap);
    }

    // Event 질문 변경
    public int eventJoinAnswerUpdate(String event_id, String member_id, String event_answer_desc, String event_answer_seq){
        logger.debug("eventJoinAnswerUpdate Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", String.valueOf(event_id));
        paramMap.put("memberId", String.valueOf(member_id));
        paramMap.put("eventAnswerDesc", String.valueOf(event_answer_desc));
        paramMap.put("eventJoinAnswerSeq", String.valueOf(event_answer_seq));
        return saemteoMapper.eventJoinAnswerUpdate(paramMap);
    }

    // 설렘꾸러미 지역에 따른 값 추출
    public int getGiftBundleCount(String idx){
        logger.debug("getGiftBundleCount Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("idx", String.valueOf(idx));
        return saemteoMapper.getGiftBundleCount(paramMap);
    }

    // 해당되는 이벤트에 해당되는 답이 얼마나 있는지 카운트
    public int chkEventJoinAnswerSeq(String event_id, String member_id, String seq, String event_answer_desc){
        logger.debug("chkEventJoinAnswerSeq Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("event_id", String.valueOf(event_id));
        paramMap.put("member_id", String.valueOf(member_id));
        paramMap.put("seq", String.valueOf(seq));
        paramMap.put("event_answer_desc", String.valueOf(event_answer_desc));
        return saemteoMapper.chkEventJoinAnswerSeq(paramMap);
    }

    // 해당되는 이벤트에 해당되는 신청 수량 카운트
    public int chkEventJoinQntCnt(String event_id, String member_id, String seq){
        logger.debug("chkEventJoinQntCnt Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("event_id", String.valueOf(event_id));
        paramMap.put("member_id", String.valueOf(member_id));
        paramMap.put("seq", String.valueOf(seq));
        return saemteoMapper.chkEventJoinQntCnt(paramMap);
    }

    /**
     * 경품재고 조회
     * @param eventId
     * @return
     */
    public List<EventAmount> selectEventAmountRemains(String eventId) {
        return saemteoMapper.selectEventAmountRemains(eventId);
    }


    /**
     * 이벤트 아이디로 상위이벤트 아이디와 서브이벤트 중복신청 허용여부 조회
     *
     * @param eventId 이벤트아이디
     * @return eventParentId, subDupYn
     */
    public EventInfo getParentEventInfoSubDupYnByEventId(String eventId) {
        return saemteoMapper.getParentEventInfoSubDupYnByEventId(eventId);
    }

    /**
     * 상위이벤트 아이디로 서브이벤트에 참여여부 확인 (중복신청 체크를 위함)
     * @param eventParentId
     * @param memberId
     * @return
     */
    public int getEventJoinCntByEventParentId(String eventParentId, String memberId) {
        return saemteoMapper.getEventJoinCntByEventParentId(eventParentId, memberId);
    }

    public String getMyEventJoinAnswer(String eventId, String memberId) {
        if (StringUtils.isBlank(eventId) || StringUtils.isBlank(memberId)) return "";

        return saemteoMapper.getMyEventJoinAnswer(eventId, memberId);
    }

    /**
     * 나의 이벤트 신청 답변 정보 - 하위이벤트가 있고 하위이벤트 중복신청이 불가능한 경우
     * @param eventParentId 이벤트 아이디
     * @param memberId 사용자 아이디
     * @return
     */
    public String getMyEventJoinAnswerByParentEventId(String eventParentId, String memberId) {
        if (StringUtils.isBlank(eventParentId) || StringUtils.isBlank(memberId)) return "";

        return saemteoMapper.getMyEventJoinAnswerByParentEventId(eventParentId, memberId);
    }


    // 살아있는 수업 쿼리문 처리
    public List<Map<String, Object>> classLiveQuestionAmount(){
        return saemteoMapper.classLiveQuestionAmount();
    }


    // 이벤트 참여 수량 체크 ( PC버전 로직과 동일, 2번에 수량 합으로 체크 )
    public int checkEventCntCount(String event_id, String eventCntId) {

        logger.debug("-----------------------------------------------------------");
        logger.debug("checkEventCntCount Start");
        logger.debug("-----------------------------------------------------------");
        logger.debug("event_id  : " + event_id);
        logger.debug("eventCntId : " + eventCntId);
        logger.debug("-----------------------------------------------------------");

        HashMap<String, String> param = new HashMap<String, String>();

        param.put("event_id", event_id);
        param.put("eventCntId", eventCntId);

        return saemteoMapper.checkEventCntCount(param);
    }

    // 이벤트 총 수량 체크 ( PC버전 로직과 동일, 2번에 수량 합으로 체크 )
    public int checkEventTotAmount(String event_id, String type) {

        logger.debug("-----------------------------------------------------------");
        logger.debug("checkEventTotAmount Start");
        logger.debug("-----------------------------------------------------------");
        logger.debug("event_id  : " + event_id);
        logger.debug("type : " + type);
        logger.debug("-----------------------------------------------------------");

        HashMap<String, String> param = new HashMap<String, String>();

        param.put("event_id", event_id);
        param.put("type", type);

        return saemteoMapper.checkEventTotAmount(param);
    }

    // 비공개 이벤트 대상 회원인지 확인
    // SMS 모바일 이벤트 단독일시 진행
    public int checkPrivateEventMemberCount(String event_id, String member_id){
        logger.debug("checkPrivateEventMemberCount Start");
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("event_id", String.valueOf(event_id));
        paramMap.put("member_id", String.valueOf(member_id));
        return saemteoMapper.checkPrivateEventMemberCount(paramMap);
    }

    /* 구글 설문조사 ( 중복 응답 가능 ) */
    public int googleSurveyCountCheck(String eventId) {
        return saemteoMapper.googleSurveyCountCheck(eventId);
    }


    /* 모니터링단 이벤트 등록 */
    public int insertMonitoringEvent(HashMap<String, String> paramMap){
        return saemteoMapper.insertMonitoringEvent(paramMap);
    }

    public String eventMemberSchoolInfo(HashMap<String, String> paramMap){
        return saemteoMapper.eventMemberSchoolInfo(paramMap);
    }

    /* 이벤트 참여 설문결과 전체 건수 조회 - 코멘트 입력이 2개일 때 사용 */
    public int getEventJoinAnswerCntForTwoComment(String eventId, String eventJoinAnswerSeq) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", eventId);
        paramMap.put("eventJoinAnswerSeq", eventJoinAnswerSeq);
        return saemteoMapper.getEventJoinAnswerCntForTwoComment(paramMap);
    }

    /* 이벤트 참여 설문결과 목록 조회 - 코멘트 입력이 2개일 때 사용 */
    public List<Map<String, Object>> getEventJoinAnswerListForTwoComment(int pageNo, int pageSize, String eventId, String eventJoinAnswerSeq, String memberId) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("pageNo", String.valueOf(pageNo));
        paramMap.put("pageSize", String.valueOf(pageSize));
        paramMap.put("eventId", eventId);
        paramMap.put("eventJoinAnswerSeq", eventJoinAnswerSeq);
        paramMap.put("memberId", memberId);
        return saemteoMapper.getEventJoinAnswerListForTwoComment(paramMap);
    }

    /* 한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우 사용 */
    public int getSpecificEventTotalJoin(EventJoinAnswerPageInfo parameter) {
        return saemteoMapper.getSpecificEventTotalJoin(parameter);
    }

    /* 한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우 사용 */
    public List<EventAnswerResult> getSpecificEventJoinAnswerList(EventAnswerParameter parameter) {
        return saemteoMapper.getSpecificEventJoinAnswerList(parameter);
    }


    public List<Map<String, Object>> getSpecificEventJoinAnswerList3(int pageNo, int pageSize, String eventId) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("pageNo", String.valueOf(pageNo));
        paramMap.put("pageSize", String.valueOf(pageSize));
        paramMap.put("eventId", eventId);

        return saemteoMapper.getSpecificEventJoinAnswerList3(paramMap);
    }


    public int getReplyCount(String eventId){
        return saemteoMapper.getReplyCount(eventId);
    }

    public int writeReply(String memberId, String eventId, String content, String refUrl){
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("memberId", memberId);
        paramMap.put("content", content);
        paramMap.put("refUrl", refUrl);
        paramMap.put("eventId", eventId);

        return saemteoMapper.writeReply(paramMap);
    }

    public void insertEventAgreeInfo(MemberEventAgreeInfo memberEventAgreeInfo) {
        saemteoMapper.insertEventAgreeInfo(memberEventAgreeInfo);
    }

    public int getEventAgreeInfoCount(MemberEventAgreeInfo memberEventAgreeInfo) {
        return saemteoMapper.getEventAgreeInfoCount(memberEventAgreeInfo);
    }

    public String getRouletteEventUrlJoin(String memberId) {
        return saemteoMapper.getRouletteEventUrlJoin(memberId);
    }

    public void saveRouletteEventUrl(HashMap<String, String> param) {
        saemteoMapper.saveRouletteEventUrl(param);
    }

    public void update2ndRouletteEventJoin(HashMap<String, String> param) {
        saemteoMapper.update2ndRouletteEventJoin(param);
    }

    public void updateRouletteUrlJoinYn(HashMap<String, String> param) {
        saemteoMapper.updateRouletteUrlJoinYn(param);
    }


    //룰렛이벤트 상품선정 함수
    public HashMap getRoulettePrize(String eventId) {
        String itemName = ""; //상품명
        String idx = ""; //어드민 기준 경품번호

        try {
            Map<String, String> prize = new HashMap<String, String>();

            prize.put("3", "스타벅스");    //기본확률제공 4%
            prize.put("4", "페레로로쉐");    //기본확률제공 19%
            prize.put("5", "바나나우유");    //기본확률제공 37%
            prize.put("6", "비요뜨 초코링");    //기본확률제공 37%
            prize.put("7", "무선줄넘기");    //기본확률제공 2%
            prize.put("8", "에어팟");    //특정 날짜 & 조건시 당첨
            prize.put("9", "아이패드");    //특정 날짜 & 조건시 당첨
//			prize.put("8", "비바콘 200P");	//2차 신청시 비바콘당첨은 위에서 별도로 처리함

            // 경품이 있는 이벤트일 경우 경품 잔여 수량 조회
            List<EventAmount> eventAmountList = saemteoMapper.getEventAmountList(eventId);
            // 현재 잔고 조회, list->map으로 변환
            Map<String, EventAmount> eventAmountMap = new HashMap<>();
            if (CollectionUtils.isNotEmpty(eventAmountList)) {
                for (EventAmount eventAmount : eventAmountList) {
                    eventAmountMap.put(eventAmount.getEventType(), eventAmount);
                }
            }

            int tot_cnt1 = eventAmountMap.get("3").getRemains(); //스타벅스
            int tot_cnt2 = eventAmountMap.get("4").getRemains(); //페레로로쉐
            int tot_cnt3 = eventAmountMap.get("5").getRemains(); //바나나우유
            int tot_cnt4 = eventAmountMap.get("6").getRemains(); //비요뜨 초코링
            int tot_cnt5 = eventAmountMap.get("7").getRemains(); //무선줄넘기
            int tot_cnt6 = eventAmountMap.get("8").getRemains(); //에어팟
            int tot_cnt7 = eventAmountMap.get("9").getRemains(); //아이패드

            Double weight1 = 0D;
            Double weight2 = 0D;
            Double weight3 = 0D;
            Double weight4 = 0D;
            Double weight5 = 0D;
            Double weight6 = 0D;
            Double weight7 = 0D;
            Double weight8 = 0D;

            weight1 = (tot_cnt1 > 0) ? 4D : 0;
            weight2 = (tot_cnt2 > 0) ? 19D : 0;
            weight3 = (tot_cnt3 > 0) ? 37D : 0;
            weight4 = (tot_cnt4 > 0) ? 37D : 0;
            weight5 = (tot_cnt5 > 0) ? 2D : 0;
//			weight6 = (tot_cnt6 < 600) ? 3D : 0;
//			weight7 = (tot_cnt7 < 300) ? 2D : 0;
//			weight8 = (tot_cnt8 < 50) ? 1D : 0;



            Map<String, Double> w = new HashMap<String, Double>();

            //가중치가 유동적인 경품에 대해 가중치가 할당 된 시점에만 추첨범위에 포함
            if(weight1 > 0) w.put("3", weight1);
            if(weight2 > 0) w.put("4", weight2);
            if(weight3 > 0) w.put("5", weight3);
            if(weight4 > 0) w.put("6", weight4);
            if(weight5 > 0) w.put("7", weight5);
            if(weight6 > 0) w.put("8", weight6);
            if(weight7 > 0) w.put("9", weight7);
//					if(weight8 > 0) w.put("8", weight8); 잠시 차단

            LocalDate nowDate = LocalDate.now();
            //실서버용
            LocalDate airPod1Date = LocalDate.of(2023, 2, 13);
            LocalDate airPod2Date = LocalDate.of(2023, 2, 20);
            LocalDate airPod3Date = LocalDate.of(2023, 3, 6);
            LocalDate airPod4Date = LocalDate.of(2023, 3, 13);
            LocalDate airPod5Date = LocalDate.of(2023, 3, 20);
            LocalDate ipadDate = LocalDate.of(2023, 3, 1);
            int airPodTriggerCnt1 = 10;
            int airPodTriggerCnt2 = 20;
            int airPodTriggerCnt3 = 30;
            int airPodTriggerCnt4 = 40;
            int airPodTriggerCnt5 = 50;
            int iPadTriggerCnt1 = 9;
            //테스트용
//            LocalDate airPod1Date = LocalDate.of(2023, 2, 6);
//            LocalDate airPod2Date = LocalDate.of(2023, 2, 8);
//            LocalDate airPod3Date = LocalDate.of(2023, 2, 9);
//            LocalDate airPod4Date = LocalDate.of(2023, 2, 10);
//            LocalDate airPod5Date = LocalDate.of(2023, 2, 13);
//            LocalDate ipadDate = LocalDate.of(2023, 2, 7);
//            int airPodTriggerCnt1 = 1;
//            int airPodTriggerCnt2 = 3;
//            int airPodTriggerCnt3 = 1;
//            int airPodTriggerCnt4 = 2;
//            int airPodTriggerCnt5 = 3;
//            int iPadTriggerCnt1 = 2;

            //오늘의 당첨누적갯수 가져오기(비바콘 제외 스타벅스~무선줄넘기)
            int todayRouletteJoinCnt = saemteoMapper.getTodayRouletteJoinCnt("");


            if(nowDate.equals(airPod1Date) && todayRouletteJoinCnt == airPodTriggerCnt1 && tot_cnt6 >= 5) {
                idx = "8";
            } else if (nowDate.equals(airPod2Date) && todayRouletteJoinCnt == airPodTriggerCnt2 && tot_cnt6 >= 4){
                idx = "8";
            } else if (nowDate.equals(airPod3Date) && todayRouletteJoinCnt == airPodTriggerCnt3 && tot_cnt6 >= 3){
                idx = "8";
            } else if (nowDate.equals(airPod4Date) && todayRouletteJoinCnt == airPodTriggerCnt4 && tot_cnt6 >= 2){
                idx = "8";
            } else if (nowDate.equals(airPod5Date) && todayRouletteJoinCnt == airPodTriggerCnt5 && tot_cnt6 >= 1){
                idx = "8";
            } else if (nowDate.equals(ipadDate) && todayRouletteJoinCnt == iPadTriggerCnt1 && tot_cnt7 >= 1){
                idx = "9";
            } else {
                Random rand = new Random();
                idx = getWeightedRandom(w, rand);
            }

            itemName = prize.get(idx);

            //특정제품(에어팟 & 아이패드)의 경우 복수체크
            if("8".equals(idx) || "9".equals(idx)) {
                if(getTodayRouletteJoinCnt("check") > 1) {
                    throw new Exception();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        HashMap<String, String> resultMap = new HashMap<>();
        resultMap.put("prizeIdx", idx);
        resultMap.put("prizeName", itemName);


        return resultMap;
    }

    /**
     * 가중치에 따른 랜덤 상품 추첨
     * @param Map<E, Double> weights
     * @param Random random
     * @return
     */
    public <E> E getWeightedRandom(Map<E, Double> weights, Random random) {
        E result = null;
        double bestValue = Double.MAX_VALUE;

        for (E element : weights.keySet()) {
            double value = -Math.log(random.nextDouble()) / weights.get(element);
            if (value < bestValue) {
                bestValue = value;
                result = element;
            }
        }
        return result;
    }

    public int getTodayRouletteJoinCnt(String check) {
        return saemteoMapper.getTodayRouletteJoinCnt(check);
    }

    public String getEventEndDate(String eventId) {
        return saemteoMapper.getEventEndDate(eventId);
    }

    public void saveVivasamGoEventAnswer(HashMap<String, String> param) {
        saemteoMapper.saveVivasamGoEventAnswer(param);
    }


    // 스승의날 선물대잔치 데이터 등록
    @Transactional
    public void applyEventJoin451(EventJoinReqParam eventJoinReqParam) throws Exception {

        String memberId = eventJoinReqParam.getMemberId();
        String eventId = eventJoinReqParam.getEventId();

        EventInfo eventInfo = saemteoMapper.getEventInfoNoMatterUseYn(eventId);
        if (!eventInfo.isProgressing()) {
            throw new VivasamException("4", "이벤트 신청기간이 아닙니다.");
        }

        // 1. 중복 신청 학인
        int applyCnt = saemteoMapper.eventApplyCheck(memberId, eventId);
        if (applyCnt > 0) {
            throw new VivasamException("1", "이미 신청하셨습니다.");
        }

        // 2. 신청 정보 만들기
        // 현재 자기의 포인트 조회
        Integer totalPoint = memberRecommendationMapper.getTotalPoint(memberId);
        // 상품 조회
        List<EventAmount> eventAmountList = saemteoMapper.getEventAmountList(eventId);
        Map<String, EventAmount> eventAmountMap = eventAmountList.stream().collect(Collectors.toMap(EventAmount::getEventType, Function.identity()));

        // 전체 신청 포인트
        int totalApplyPoint = 0;
        Map<String, Integer> amountMap = eventJoinReqParam.getAmountMap();
        StringBuilder sb = new StringBuilder(2000);
        if (CollectionUtils.isNotEmpty(amountMap.entrySet())) {
            for (Map.Entry<String, Integer> entry :  amountMap.entrySet()) {
                EventAmount eventAmount = eventAmountMap.get(entry.getKey());
                // 상품 조회할 수 없을 경우 skip
                if (eventAmount == null) continue;

                totalApplyPoint += eventAmount.getPrice() * entry.getValue();
                sb.append("이름:" + eventAmount.getName() + ";가격:" + eventAmount.getPrice() + ";수량:" + entry.getValue()).append("/");
            }

            if (sb.length() > 0) {
                sb.setLength(sb.length() - 1);
            }
        }

        if (totalPoint < totalApplyPoint) {
            // 신청상품 포인트 총합이 포인트 보유분을 초과하였습니다.
            throw new VivasamException("2", "보유 포인트 보다 많은 상품을 신청하셨습니다.");
        }
        String eventAnswerDesc2 = "총:" + totalPoint +";신청:" + totalApplyPoint +  "/" + sb.toString();
        eventJoinReqParam.setEventAnswerDesc2(eventAnswerDesc2);


        // 3. 이벤트 join 추가
        HashMap<String, String> eventJoinParam = new HashMap<>();
        eventJoinParam.put("memberId", memberId);
        eventJoinParam.put("eventId", eventId);
        saemteoMapper.eventApplyInsert(eventJoinParam);

        // 3-1. 포인트 신청이 5만점 초과일 경우 SSN 등록
        if (totalApplyPoint > 50000) {
            System.out.println("ssn 등록 ");
            // 주민번호 필수값 누락
            String ssn = eventJoinReqParam.getSsn();

            if (StringUtils.isBlank(eventJoinReqParam.getSsn())) throw new VivasamException("3", "신청 포인트가 5만 초과이지만 주민등록번호가 입력되지 않았습니다.");

            int eventIdInt = Integer.parseInt(eventId);
            // 한번 등록되었으면 중복등록 안함
            String encryptSsn = new StringEncrypter("vivasam-event451-ssn-123!@#", "gift-party-123!@#").encrypt(ssn);
            if (saemteoMapper.getEventJoinSsnCnt(eventIdInt, memberId) == 0) {
                saemteoMapper.insertEventJoinSsn(eventIdInt, memberId, encryptSsn);
            } else {
                saemteoMapper.updateEventJoinSsn(eventIdInt, memberId, encryptSsn);
            }
        }

        // 4. 이벤트 참여 정보 등록
//		int checkTotalVal = saemteoMapper.checkEventTotalJoin(eventId);	// 사용용도가???
        HashMap<String, String> eventJoinAnswerParam1 = new HashMap<>();
//		eventJoinAnswerParam1.put("checkTotalVal", Integer.toString(checkTotalVal));	// 사용용도가 없음
        eventJoinAnswerParam1.put("memberId", memberId);
        eventJoinAnswerParam1.put("eventId", eventId);
        eventJoinAnswerParam1.put("eventAnswerDesc", eventJoinReqParam.getEventAnswerDesc());
        eventJoinAnswerParam1.put("eventAnswerSeq", "1");
        saemteoMapper.eventJoinAnswerInsert(eventJoinAnswerParam1);

        // 5. 이벤트 참여 정보 2번째 등록
        if (StringUtils.isNotBlank(eventJoinReqParam.getEventAnswerDesc2())) {
            HashMap<String, String> param2 = new HashMap<>();
            param2.put("eventId", eventId);
            param2.put("memberId", memberId);
            param2.put("eventAnswerDesc", eventJoinReqParam.getEventAnswerDesc2());
            param2.put("eventAnswerSeq", "2");
            saemteoMapper.eventJoinAnswerInsert(param2);
        }

        // 6. 상품 신청정보 등록
        amountMap = eventJoinReqParam.getAmountMap();
        for (Map.Entry<String, Integer> entry : amountMap.entrySet()) {
            HashMap<String, String> param3 = new HashMap<>();
            param3.put("eventId", eventId);
            param3.put("eventAnswerSeq", entry.getKey());
            param3.put("memberId", memberId);
            param3.put("eventAnswerDesc", String.valueOf(entry.getValue()));
            saemteoMapper.eventJoinAnswerInsert(param3);
        }
    }

    // 521 출석체크 이벤트, 주차별 참여
    @Transactional
    public void applyEventJoin521(EventJoinReqParam eventJoinReqParam) throws Exception {
        HashMap<String, String> param = new HashMap<>();
        param.put("memberId", eventJoinReqParam.getMemberId());
        param.put("eventAnswerDesc2", eventJoinReqParam.getEventAnswerDesc2());
        saemteoMapper.applyEventJoin521(param);
    }

    // 학교 랭킹 3순위
    public List<EventInfo> eventJoinList(String eventId) {
        return saemteoMapper.eventJoinList(eventId);
    }

    // 우리 학교 가입자
    public List<EventInfo> ourSchJoinList(String eventId, String memberId) {
        return saemteoMapper.ourSchJoinList(eventId, memberId);
    }

    public boolean recommenderCheck(String recommender, String memberId) {
        if(StringUtils.isBlank(recommender)) return false;
        // 추천ID가 존재하면 : 1
        // 추천ID가 존재하지 않으면 : 0
        int cnt = saemteoMapper.recommenderCheck(recommender, memberId);
        return cnt == 1;
    }

    public String existRecommend(String recommender) {
        return saemteoMapper.existRecommend(recommender);
    }

    public List<Map<String, Object>> getEventJoinAnswerList2(int pageNo, int pageSize, String eventId, String eventAnswerSeq, String answerIndex) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("pageNo", String.valueOf(pageNo));
        paramMap.put("pageSize", String.valueOf(pageSize));
        paramMap.put("eventId", eventId);
        paramMap.put("eventAnswerSeq", eventAnswerSeq);
        paramMap.put("answerIndex", answerIndex);

        return saemteoMapper.getEventJoinAnswerList2(paramMap);
    }

    public int getSpecificEventTotalJoin2(String eventId, String eventAnswerSeq, String answerIndex) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", eventId);
        paramMap.put("eventAnswerSeq", eventAnswerSeq);
        paramMap.put("answerIndex", answerIndex);

        return saemteoMapper.getSpecificEventTotalJoin2(paramMap);
    }

    public List<EventInfo> getRecommendRankList(String eventId) {
        return saemteoMapper.getRecommendRankList(eventId);
    }

    public List<Map<String, Object>> get2024EventAnswerList(int pageNo, int pageSize, String eventId, String eventAnswerSeq, String answerIndex) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("pageNo", String.valueOf(pageNo));
        paramMap.put("pageSize", String.valueOf(pageSize));
        paramMap.put("eventId", eventId);
        paramMap.put("eventAnswerSeq", eventAnswerSeq);
        paramMap.put("answerIndex", answerIndex);

        return saemteoMapper.get2024EventAnswerList(paramMap);
    }

    public int get2024EventAnswerCount(String eventId, String eventAnswerSeq, String answerIndex) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("eventId", eventId);
        paramMap.put("eventAnswerSeq", eventAnswerSeq);
        paramMap.put("answerIndex", answerIndex);

        return saemteoMapper.get2024EventAnswerCount(paramMap);
    }

    public int getCampaignJoinCnt(EventInfo eventReqInfo) {
        return saemteoMapper.getCampaignJoinCnt(eventReqInfo);
    }

    public List<Map<String, Object>> get2024EventAnswerList498(int pageNo, int pageSize, String eventId, String eventAnswerSeq, String answerIndex, String memberId) {
        HashMap<String, String> paramMap = new HashMap<>();
        paramMap.put("page", String.valueOf(pageNo));
        paramMap.put("pageSize", String.valueOf(pageSize));
        paramMap.put("eventId", eventId);
        paramMap.put("eventAnswerSeq", eventAnswerSeq);
        paramMap.put("answerIndex", answerIndex);
        paramMap.put("memberId",memberId);

        List<Map<String, Object>> eventAnswerList = saemteoMapper.get2024EventAnswerList498(paramMap);
        for(int i = 0; i < eventAnswerList.size(); i++){
            String tmpAnswer = (String) eventAnswerList.get(i).get("eventAnswerDesc");

            if (tmpAnswer.indexOf("\n") > -1) {
                tmpAnswer = tmpAnswer.replaceAll("\\n","");
                eventAnswerList.get(i).put("eventAnswerDesc",tmpAnswer);
            }
        }

        return eventAnswerList;
    }

    // 498 스승의날 좋아요 이벤트
    @Transactional
    public String updateStateEventLike(EventInfo param) {
        String code = "0";

        try {
            int memberLikeCnt = 0;

            // 1. 현재 좋아요를 받은 ID의 갯수 조회
            memberLikeCnt = saemteoMapper.getEventLikeCnt(param);

            if (param.getLikeCheck()) {
                // 2. 좋아요 (getLikeCheck == TRUE)
                saemteoMapper.insertEventJoinLike(param);
                memberLikeCnt = memberLikeCnt + 1;
            } else {
                // 3. 좋아요 취소 (getLikeCheck == FALSE)
                saemteoMapper.deleteEventJoinLike(param);
                memberLikeCnt = memberLikeCnt - 1;
            }

            // 4. EventJoinAnswer 답변부분의 좋아요 변경 (Admin의 쿼리를 변경하지 않기 위해 답변의 특정 부분만 업데이트 진행)

            //  4-1. 원본 답변 가져오기.
            String oriAnswer = saemteoMapper.getMyEventJoinAnswer(param.getEventId(), param.getLikeMemberId());

        /*
			4-2. 원본 답변 변형 후 배열로 변경 작업
			[ split나 replaceAll을 사용하려 했으나 메소드에서
			 " ^||^ " 해당 문자열을 찾지 못해 문자열을 변경하는 식으로 작업 ]
		*/
            while (true) {
                if (oriAnswer.indexOf("^||^") > -1) {
                    oriAnswer = oriAnswer.substring(0, oriAnswer.indexOf("^||^")) + "####" + oriAnswer.substring(oriAnswer.indexOf("^||^") + 4);
                } else {
                    break;
                }
            }
            String[] tmpAnswer = oriAnswer.split("####");

            //  4-3. 원본 답변에서 현재 변경된 좋아요 갯수로 변경
            tmpAnswer[2] = "좋아요[" + memberLikeCnt + "]";

            //  4-4. 변경된 답변 다시 합치기
            param.setEventAnswerDesc(tmpAnswer[0] + "^||^" + tmpAnswer[1] + "^||^" + tmpAnswer[2]);

            // 5. 변경된 답변으로 업데이트
            saemteoMapper.updateStateEventLike(param);
        } catch (Exception e) {
            e.printStackTrace();
            return code = "400";
        }

        return code = "200";
    }

    public int getEventJoinCheck(String memberId) {
        return saemteoMapper.getEventJoinCheck(memberId);
    }

    public int getMyRecomCnt(String memberId) {
        return saemteoMapper.getMyRecomCnt(memberId);
    }

    public List<Map<String, String>> getMyRecomList(String memberId) {
		return saemteoMapper.getMyRecomList(memberId);
	}

    public List<EventInfo> getPopularCnt(String eventId, String eventAnswerSeq) {
        return saemteoMapper.getPopularCnt(eventId, eventAnswerSeq);
    }

    public String chkEventJoinDate(EventInfo param) {
        String joinDate = saemteoMapper.chkEventJoinDate(param);
        String result = "";
        String joinDate1 = "";
        String joinDate2 = "";
        String joinDate3 = "";
        String joinDate4 = "";

        Date eventStartDay1 = null;
        Date eventEndDay1 = null;
        Date eventStartDay2 = null;
        Date eventEndDay2 = null;
        Date eventStartDay3 = null;
        Date eventEndDay3 = null;
        Date eventStartDay4 = null;
        Date eventEndDay4 = null;
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat dateFormat2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        try {
            eventStartDay1 = new Date(dateFormat2.parse("2025-08-29 00:00:00").getTime());
			eventEndDay1 = new Date(dateFormat2.parse("2025-09-07 23:59:59").getTime());
			eventStartDay2 = new Date(dateFormat2.parse("2025-09-08 00:00:00").getTime());
			eventEndDay2 = new Date(dateFormat2.parse("2025-09-21 23:59:59").getTime());
			eventStartDay3 = new Date(dateFormat2.parse("2025-09-22 00:00:00").getTime());
			eventEndDay3 = new Date(dateFormat2.parse("2025-10-05 23:59:59").getTime());
			eventStartDay4 = new Date(dateFormat2.parse("2025-10-06 00:00:00").getTime());
			eventEndDay4 = new Date(dateFormat2.parse("2025-10-17 23:59:59").getTime());
        } catch (Exception e){}

        if (joinDate != null ) {
            String dateX[] = joinDate.split("&");
            for (int i = 0; i < dateX.length; i++) {
                Date joinRefDate = null;

                String dateOnly = (dateX[i] == null ? "" : dateX[i].trim());
                if (dateOnly.isEmpty()) continue;

                // # 뒤(정답)는 버리고 날짜만 남김
                int sharp = dateOnly.indexOf('#');
                if (sharp >= 0) dateOnly = dateOnly.substring(0, sharp).trim();
                if (dateOnly.isEmpty()) continue;

                try {
                    joinRefDate = new Date(dateFormat2.parse(dateOnly + " 09:00:00").getTime());

                    if (eventStartDay1.getTime() <= joinRefDate.getTime() && joinRefDate.getTime() <= eventEndDay1.getTime()) {
                        joinDate1 = dateOnly;
                    };
                    if (eventStartDay2.getTime() <= joinRefDate.getTime() && joinRefDate.getTime() <= eventEndDay2.getTime()) {
                        joinDate2 = dateOnly;
                    };
                    if (eventStartDay3.getTime() <= joinRefDate.getTime() && joinRefDate.getTime() <= eventEndDay3.getTime()) {
                        joinDate3 = dateOnly;
                    };
                    if (eventStartDay4.getTime() <= joinRefDate.getTime() && joinRefDate.getTime() <= eventEndDay4.getTime()) {
                        joinDate4 = dateOnly;
                    };

                } catch (Exception e) {}
            }
        }

        result = joinDate1;
        if(!StringUtils.isEmpty(joinDate2)) result += "&" + joinDate2;
        if(!StringUtils.isEmpty(joinDate3)) result += "&" + joinDate3;
        if(!StringUtils.isEmpty(joinDate4)) result += "&" + joinDate4;

        return result;
    }

    public List<Map<String, Object>> getEventVoteRank(){ return saemteoMapper.getEventVoteRank();}

    @Transactional
    public void applyEventJoin584(EventJoinReqParam eventJoinReqParam) {
        HashMap<String, String> param = new HashMap<>();
        param.put("memberId", eventJoinReqParam.getMemberId());
        param.put("eventAnswerDesc2", eventJoinReqParam.getEventAnswerDesc2());
        saemteoMapper.applyEventJoin584(param);
    }

}
