package edu.visang.vivasam.saemteo.controller;

import edu.visang.vivasam.common.model.SchoolInfo;
import edu.visang.vivasam.common.service.CheckXSSService;
import edu.visang.vivasam.common.service.SchoolService;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.exception.VivasamException;
import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.member.service.MemberRecommendationService;
import edu.visang.vivasam.member.service.MemberService;
import edu.visang.vivasam.myInfo.service.MyInfoService;
import edu.visang.vivasam.saemteo.model.*;
import edu.visang.vivasam.saemteo.service.SaemteoService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.apache.commons.lang3.time.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/saemteo")
public class SaemteoController {
    public static final Logger logger = LoggerFactory.getLogger(SaemteoController.class);

    @Autowired
    SaemteoService saemteoService;

    @Autowired
    MemberService memberService;

    @Autowired
    MemberMileageService memberMileageService;

    @Autowired
    MyInfoService myInfoService;

    @Autowired
    SchoolService schoolService;

    @Autowired
    CheckXSSService checkXSSService;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @Autowired
    MemberRecommendationService memberRecommendationService;

    /**
     * 이벤트 목록
     *
     * @return
     */
    @GetMapping("/eventList")
    public ResponseEntity<?> eventList(@RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        return getEventResponseEntity(null, eventId);
    }

    /**
     * 이벤트 정보
     *
     * @return
     */
    @GetMapping("/eventInfo")
    public ResponseEntity<?> eventInfo(@CurrentUser UserPrincipal currentUser,
                                       @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        return getEventResponseEntity(currentUser, eventId);
    }

    public ResponseEntity<?> getEventResponseEntity(UserPrincipal currentUser,
                                                    @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {
        EventInfo eventInfo = new EventInfo();
        eventInfo.setSchType("A");
        eventInfo.setEventId(eventId);

        // 비공개 이벤트를 사용할때(비바샘이 간다, 초중고 신학기 자료집 배포)
        if("439".equals(eventId) || "438".equals(eventId) || "491".equals(eventId) ||"512".equals(eventId) || "553".equals(eventId)) {
            eventInfo.setEventUseYn("N");
        } else {
            eventInfo.setEventUseYn("Y");
        }

        List<EventInfo> eventList = saemteoService.eventList(eventInfo);

        if (!"".equals(eventId)) {
            saemteoService.eventUpdateReadCount(eventId);
        }

        int evtListSize = eventList.size();

        Map<String, Object> resultMap = new HashMap<>();
        if (evtListSize > 0) {
            resultMap.put("code", "0");
            resultMap.put("eventList", eventList);
            List<Banner> bannerList = new ArrayList<Banner>();
            for (EventInfo temp : eventList) {

                // 모바일 배너 비공개일 경우 보여주지 않음.
                if (temp.getEventMobileBannerUseYn().equals("N")) {

                } else {
                    Banner banner = new Banner();
                    banner.setType("event");
                    banner.setTypeName("이벤트");
                    banner.setName(temp.getEventName());
                    banner.setId(temp.getEventId());
                    banner.setStartDate(temp.getEventSdate());
                    banner.setEndDate(temp.getEventEdate());
                    banner.setSrc(temp.getEventMobBnPath() + temp.getEventMobBnSav());
                    bannerList.add(banner);
                }
            }
            resultMap.put("bannerList", bannerList);
        } else {
            resultMap.put("code", "1");
        }

        if (currentUser != null && currentUser.getMemberId() != null && !"".equals(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("check : {}", memberId);
            if (memberId != null && StringUtils.hasText(memberId)) {
                int applyCnt = 0;
                // 구글 이벤트의 경우 참여 회수 체크 제외
                if (eventId.equals("263") || eventId.equals("264")) {
                } else {
                    applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                }

                //룰렛이벤트시 중복참여가능하게
                if (applyCnt > 0 && !"429".equals(eventId)) {
                    //중복참여
                    resultMap.put("code", "3");
                } else {
                    MemberInfo memberInfo = memberService.getMemberInfo(memberId);
                    resultMap.put("memberInfo", memberInfo);
                }
            } else {
                //로그인 필요
                resultMap.put("code", "2");
            }
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 이벤트의 하위이벤트 목록 조회
     * @param eventId
     * @return
     */
    @GetMapping("/eventSubEventList")
    public ResponseEntity<?> eventSubEventList(@RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        // 하위 이벤트 목록 조회
        List<EventInfo> subEventList = saemteoService.eventSubEventList(eventId);	// 기존 메서드 규칙과 유사하게 생성 (너무한거 아니냐고... -by 허장회 2021-06-27)
        List<SubEventInfo> subEventInfoUiDtoList = SubEventInfo.toUiDtoList(subEventList);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("eventList", subEventInfoUiDtoList);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 이벤트 정보(비활성 종료 포함)
     *
     * @return
     */
    @GetMapping("/eventInfoAll")
    public ResponseEntity<?> eventInfoAll(@CurrentUser UserPrincipal currentUser,
                                          @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        return getEventResponseEntityAll(currentUser, eventId);
    }

    public ResponseEntity<?> getEventResponseEntityAll(UserPrincipal currentUser,
                                                       @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {
        EventInfo eventInfo = new EventInfo();
        eventInfo.setEventId(eventId);

        List<EventInfo> eventList = saemteoService.eventListAll(eventInfo);

        if (!"".equals(eventId)) {
            saemteoService.eventUpdateReadCount(eventId);
        }

        int evtListSize = eventList.size();

        Map<String, Object> resultMap = new HashMap<>();
        if (evtListSize > 0) {
            resultMap.put("code", "0");
            resultMap.put("eventList", eventList);
            List<Banner> bannerList = new ArrayList<Banner>();
            for (EventInfo temp : eventList) {
                Banner banner = new Banner();
                banner.setType("event");
                banner.setTypeName("이벤트");
                banner.setName(temp.getEventName());
                banner.setId(temp.getEventId());
                banner.setStartDate(temp.getEventSdate());
                banner.setEndDate(temp.getEventEdate());
                banner.setSrc(temp.getEventMobBnPath() + temp.getEventMobBnSav());
                bannerList.add(banner);
            }
            Collections.sort(bannerList);
            resultMap.put("bannerList", bannerList);
        } else {
            resultMap.put("code", "1");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 교사문화 프로그램 목록
     *
     * @return
     */
    @GetMapping("/programList")
    public ResponseEntity<?> programList(@RequestParam(value = "stateCd", required = false, defaultValue = "1") String stateCd,
                                         @RequestParam(value = "gubunCd", required = false, defaultValue = "1") String gubunCd) {

        return getResponseEntity(stateCd, gubunCd, null, null, null);
    }

    /**
     * 오프라인 세미나 목록
     *
     * @return
     */
    @GetMapping("/seminarList")
    public ResponseEntity<?> seminarList(@RequestParam(value = "stateCd", required = false, defaultValue = "1") String stateCd,
                                         @RequestParam(value = "gubunCd", required = false, defaultValue = "2") String gubunCd) {

        return getResponseEntity(stateCd, gubunCd, null, null, null);
    }


    /**
     * 교사문화 프로그램 정보
     *
     * @return
     */
    @GetMapping("/programInfo")
    public ResponseEntity<?> programInfo(@CurrentUser UserPrincipal currentUser,
                                         @RequestParam(value = "programId", required = false, defaultValue = "") String programId) {

        ResponseEntity<?> responseEntity = getResponseEntity("1", "1", null, programId, currentUser);
        saemteoService.programUpdateReadCount(programId);

        return responseEntity;
    }

    /**
     * 오프라인 세미나 정보
     *
     * @return
     */
    @GetMapping("/seminarInfo")
    public ResponseEntity<?> seminarInfo(@CurrentUser UserPrincipal currentUser,
                                         @RequestParam(value = "seminarId", required = false, defaultValue = "") String seminarId) {

        ResponseEntity<?> responseEntity = getResponseEntity("1", "2", null, seminarId, currentUser);
        saemteoService.programUpdateReadCount(seminarId);

        return responseEntity;
    }

    /**
     * 교사문화 프로그램 / 오프라인세미나 responseEntity
     *
     * @param stateCd
     * @param gubunCd
     * @param rowNum
     * @param cultureActId
     * @return
     */
    public ResponseEntity<?> getResponseEntity(String stateCd, String gubunCd, Integer rowNum, String cultureActId, UserPrincipal currentUser) {

        Map<String, Object> resultMap = new HashMap<>();
        List<CulturalActInfo> programList = saemteoService.programList(gubunCd, stateCd, rowNum, cultureActId);

        int programListSize = programList.size();

        if (programListSize > 0) {
            //성공
            resultMap.put("code", "0");
            resultMap.put("programList", programList);
            List<Banner> bannerList = new ArrayList<Banner>();
            for (CulturalActInfo temp : programList) {
                Banner banner = new Banner();
                if (gubunCd.equals("2")) {
                    banner.setType("seminar");
                    banner.setTypeName("오프라인 세미나");
                } else {
                    banner.setType("program");
                    banner.setTypeName("교사문화 프로그램");
                }
                banner.setName(temp.getTitle());
                banner.setId(temp.getCultureActId());
                banner.setStartDate(temp.getStartDt());
                banner.setEndDate(temp.getEndDt());
                banner.setSrc(temp.getMobileThumPathUrl());
                bannerList.add(banner);
            }
            Collections.sort(bannerList);
            resultMap.put("bannerList", bannerList);

        } else {
            //진행중인 프로그램 없음
            resultMap.put("code", "1");
        }

        if (currentUser != null && currentUser.getMemberId() != null && !"".equals(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("check : {}", memberId);
            if (memberId != null && StringUtils.hasText(memberId)) {
                int applyCnt = saemteoService.cultureProgramOfflineSeminarApplyCheck(memberId, cultureActId);
                if (applyCnt > 0) {
                    //중복참여
                    resultMap.put("code", "3");
                } else {
                    MemberInfo memberInfo = memberService.getMemberInfo(memberId);
                    resultMap.put("memberInfo", memberInfo);
                }
            } else {
                //로그인 필요
                resultMap.put("code", "2");
            }
        }

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/insertEventApply")
    public ResponseEntity<?> insertEventApply(HttpServletRequest request,
                                              @CurrentUser UserPrincipal currentUser,
                                              @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = currentUser.getMemberId();
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String eventAnswerDesc2 = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc2")));
        String amountYn = VivasamUtil.isNull(String.valueOf(requestParams.get("amountYn")));
        String applyContentTotCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentTotCnt")));
        String applyContentNumbers = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentNumbers")));
        String applyTargetContentCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyTargetContentCnt")));
        // 한 이벤트 페이지에서 참여한 이벤트의 개수
        String eventAgreeCount = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAgreeCount")), "0");

        name = checkXSSService.ReplaceValue(request, "name", name);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);

        System.out.println("==========================================");
        System.out.println("insertEventApply start");
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                // 451 이벤트는 별도의 URL로 처리
                if ("451".equals(eventId)) {
                    resultMap.put("code", "4");
                    return ResponseEntity.ok(resultMap);
                }

                HashMap<String, String> param = new HashMap<String, String>();
                param.put("memberId", memberId);
                param.put("name", name);
                param.put("cellphone", cellphone);
                param.put("eventId", eventId);
                param.put("eventAnswerDesc", eventAnswerDesc);

                if ("550".equals(eventId)) {
					param.put("orderNo","0");
				}

                EventInfo parentEventInfo = saemteoService.getParentEventInfoSubDupYnByEventId(eventId);
                int applyCnt = 0;
                // 1. 상위 이벤트가 없거나, 상위 이벤트의 하위 중복신청허용 값이 null 이거나, 하위 중복신청을 허용할 경우는 서브이벤트 아이디로 신청 수 조회
                if (parentEventInfo == null || parentEventInfo.getSubDupYn() == null || "Y".equals(parentEventInfo.getSubDupYn())) {
                    // 이벤트 신청 수
                    applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                }
                // 2. 상위 이벤트가 있으면서 서브이벤트 중복신청이 안될 경우 상위이벤트 아이디로 신청수 조회
                else {
                    // 이벤트 신청 수
                    applyCnt = saemteoService.getEventJoinCntByEventParentId(parentEventInfo.getEventId(), memberId);
                }

                logger.info("eventApplyCheck applyCnt : " + applyCnt);
                if (applyCnt == 0) {
                    // 이벤트 마일리지 차감 여부 체크
                    int mileagePoint = saemteoService.getEventMileagePoint(eventId);
                    if(mileagePoint < 0) {
                        mileagePoint = Math.abs(mileagePoint);
                        int usableMileage = memberMileageService.getMemberMileageUsableAmount(memberId); // 사용가능 마일리지
                        if (usableMileage < mileagePoint) {
                            // 마일리지 부족
                            resultMap.put("code", "5");
                            return ResponseEntity.ok(resultMap);
                        }
                    }

                    int chkJoin = 0;
                    // 605 이벤트 중복 방지를 위한 쿼리
                    if("605".equals(eventId)) chkJoin = saemteoService.eventApplyInsertExists(param);
                    else chkJoin = saemteoService.eventApplyInsert(param);

                    if (chkJoin > 0) {
                        int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
                        param.put("checkTotalVal", Integer.toString(checkTotalVal));
                        param.put("eventAnswerSeq", "1");
                        saemteoService.eventJoinAnswerInsert(param);
                    }

                    // 나머지 정보 저장
                    if (!"".equals(eventAnswerDesc2)) {
                        Boolean amtSuccess = true;
                        // seq 2 저장
                        HashMap<String, String> param2 = new HashMap<String, String>();
                        param2.put("eventId", eventId);
                        param2.put("memberId", memberId);
                        param2.put("eventAnswerDesc", eventAnswerDesc2);
                        param2.put("eventAnswerSeq", "2");
                        if ("550".equals(eventId)) {
							param2.put("orderNo","0");
						}
                        saemteoService.setEventJoinAnswerAddInsert(param2);

                        // 신청수량 저장
                        if ("Y".equals(amountYn)) {
                            try {
                                int totCnt = 0;
                                String[] strContentNumber = null;
                                String[] strTargetContentCnt = null;
                                try {
                                    totCnt = Integer.parseInt(applyContentTotCnt);
                                    strContentNumber = applyContentNumbers.split(",");
                                    strTargetContentCnt = applyTargetContentCnt.split(",");
                                } catch (Exception e) {
                                    totCnt = 0;
                                }

                                if (strContentNumber.length == totCnt && strTargetContentCnt.length == totCnt) {
                                    for (int i = 0; i < totCnt; i++) {
                                        if (!"0".equals(strTargetContentCnt[i])) {
                                            HashMap<String, String> param3 = new HashMap<String, String>();
                                            param3.put("eventId", eventId);
                                            param3.put("eventAnswerSeq", strContentNumber[i]);
                                            param3.put("memberId", memberId);
                                            param3.put("eventAnswerDesc", strTargetContentCnt[i]);
                                            // 수량체크
                                            boolean amountCheck = saemteoService.setEventJoinAnswerAddAmountChk(param3);
                                            if (amountCheck) {
                                                int result = saemteoService.eventJoinAnswerInsertForGoods(param3);
                                                if(result <= 0) {
                                                    saemteoService.deleteEventJoinInfo(param3);
                                                    System.out.println("==========================================");
                                                    System.out.println("insertEventApply Exception");
                                                    throw new Exception(strContentNumber[i]);
                                                }
                                            } else {
                                                System.out.println("==========================================");
                                                System.out.println("insertEventApply Exception");
                                                throw new Exception(strContentNumber[i]);
                                            }
                                        }
                                    }
                                }
                                resultMap.put("code", "0");
                            }catch (Exception e){
                                resultMap.put("code", "4");
                                resultMap.put("seq", e.getMessage());
                            }
                        } else {
                            resultMap.put("code", "0");
                        }
                    } else {
                        // 교과서 속 순간 이벤트 (7.4 ~ 7.25)
                        // 1번 이벤트에는 eventAnswerSeq == 2가 존재하지 않음
                        if ("574".equals(eventId)) {
                            saemteoService.setEventJoinAnswerAddInsert(param);
                        }
                        resultMap.put("code", "0");
                    }
                    //설문조사 최신 1개까지
                    List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
                    int surveyListSize = surveyList.size();
                    if (surveyListSize > 0) {
                        resultMap.put("surveyList", surveyList.get(0));
                    }

                    // 정상신청일 경우 마일리지 추가
                    // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                    if ("AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
                        if ("0".equals(resultMap.get("code"))) {
                            if(!addEventMileage(eventId, memberId, eventAgreeCount)) {
                                // 마일리지 적립or차감 실패
                                resultMap.put("code", "6");
                            }
                        }
                    }

                    // 이벤트 신청시 재직학교 변경
                    updateMyInfoSchoolInfo(requestParams, currentUser);

                } else {
                    // 550번 이벤트 임시 처리.. 이벤트 참여 시 후기 남기고, 이벤트 참여 후에도 후기를 따로 남길 수 있음.
					if ("550".equals(eventId)) {
						int myTotalVal = saemteoService.checkEventTotalJoinMy(eventId,memberId);
						param.put("orderNo", String.valueOf(myTotalVal));

						//int chkJoin = saemteoService.eventApplyInsert(param);

                        int chkJoin = 0;
                        // 605 이벤트 중복 방지를 위한 쿼리
                        if("605".equals(eventId)) chkJoin = saemteoService.eventApplyInsertExists(param);
                        else chkJoin = saemteoService.eventApplyInsert(param);

						if (chkJoin > 0) {
							int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
							param.put("checkTotalVal", Integer.toString(checkTotalVal));
							param.put("eventAnswerSeq", "1");
							saemteoService.eventJoinAnswerInsert(param);
						}

						// seq 2 저장
						HashMap<String, String> param2 = new HashMap<String, String>();
						param2.put("eventId", eventId);
						param2.put("memberId", memberId);
						param2.put("eventAnswerDesc", eventAnswerDesc2);
						param2.put("eventAnswerSeq", "2");
						param2.put("orderNo", String.valueOf(myTotalVal));
						saemteoService.setEventJoinAnswerAddInsert(param2);

						resultMap.put("code","0");
					} else {
                        //이미 신청한 경우
                        resultMap.put("code", "1");
                    }
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    // 이벤트 신청시 재직학교 변경
    private void updateMyInfoSchoolInfo(Map<String, Object> requestParams, UserPrincipal currentUser) {

        String userInfoYn = VivasamUtil.isNull(String.valueOf(requestParams.get("userInfo")));  // 개인정보 입력유형 (Y:개인정보 불러오기, N:직접입력)
        String newSchCodeStr = VivasamUtil.isNull(String.valueOf(requestParams.get("schCode")));      // 개인정보 불러오기일 경우 학교코드

        String memberId = currentUser.getMemberId();

        // 이벤트 참여후 개인정보 변경은 사용자에게 알림을 발생시키지 않고 에러 로그만 남긴다.
        try {
            MemberInfo memberInfo = memberService.getMemberInfo(memberId);;

            if ("Y".equals(userInfoYn)) {
                Integer newSchCode = StringUtils.hasText(newSchCodeStr) ? Integer.parseInt(newSchCodeStr) : null;
                SchoolInfo schoolInfo = schoolService.getSchoolInfo(newSchCode);

                // 사용자의 학교코드와 신규로 입력한 학교 코드가 다르면 학교 변경
                if (!Integer.valueOf(memberInfo.getSchCode()).equals(newSchCode)
                        && schoolInfo != null) {

                    String schName = schoolInfo.getName();
                    String fkareacode = schoolInfo.getFkCode();
                    String fkbranchcode = schoolInfo.getPkCode();

                    myInfoService.changeMySchoolInfo(memberId, fkareacode, fkbranchcode, newSchCode, schName);
                }
            }

        } catch (Exception e) {
            logger.error("이벤트 참여시 학교정보 또는 휴대폰번호 변경시 오류 ", e);
        }

    }


    @PostMapping("/insertEventApplyAll")
    public ResponseEntity<?> insertEventApplyAll(HttpServletRequest request,
                                                 @CurrentUser UserPrincipal currentUser,
                                                 @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String updateYn = VivasamUtil.isNull(String.valueOf(requestParams.get("updateYn")));
        String strAmount = VivasamUtil.isNull(String.valueOf(requestParams.get("strAmount")));

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        name = checkXSSService.ReplaceValue(request, "name", name);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);

        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                HashMap<String, String> param = new HashMap<String, String>();
                param.put("memberId", memberId);
                param.put("name", name);
                param.put("cellphone", cellphone);
                param.put("eventId", eventId);
                param.put("eventAnswerDesc", eventAnswerDesc);

                //as-is 이벤트는 개인정보 수정안함
                //int modifyResult = memberService.myInfoModify(param);
                //if ( modifyResult > 0 ) {
                //}
                int applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                logger.info("eventApplyCheck applyCnt : " + applyCnt);
                if (applyCnt == 0) {
                    int chkJoin = saemteoService.eventApplyInsert(param);
                    if (chkJoin > 0) {
                        int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
                        param.put("checkTotalVal", Integer.toString(checkTotalVal));
                        param.put("eventAnswerSeq", "1");
                        saemteoService.eventJoinAnswerInsert(param);
                    }

                    if(!"".equals(strAmount)){
                        String[] arrAmount = strAmount.split(",");
                        if(arrAmount != null && arrAmount.length > 1){
                            boolean success = true;
                            // 수량신청 정보 저장
                            HashMap<String, String> param2 = new HashMap<String, String>();
                            int i=0;
                            while(i<arrAmount.length){
                                String seq = arrAmount[i];
                                String amount = arrAmount[i+1];

                                if(!"".equals(seq) && !"".equals(amount)){
                                    param2.put("eventId", eventId);
                                    param2.put("memberId", memberId);
                                    param2.put("eventAnswerDesc", amount);
                                    param2.put("eventAnswerSeq", seq);
                                    // 수량체크
                                    boolean amountCheck = saemteoService.setEventJoinAnswerAddAmountChk(param2);
                                    if(amountCheck){
                                        saemteoService.setEventJoinAnswerAddInsert(param2);
                                    }else{
                                        // 수량 초과
                                        resultMap.put("code", "4");
                                        resultMap.put("seq", seq);
                                        success = false;
                                        break;
                                    }
                                }
                                i = i + 2;
                            }
                            if(success){
                                resultMap.put("code", "0");
                            }
                        }else{
                            resultMap.put("code", "5");
                        }
                    }else{
                        resultMap.put("code", "5");
                    }

                } else { //이미 신청한 경우
                    resultMap.put("code", "1");
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 이벤트 폼 없이 회원 정보를 통한 이벤트 조사
     *
     * @param stateCd
     * @param gubunCd
     * @param rowNum
     * @param cultureActId
     * @return
     */
    @PostMapping("/insertNoFormEventApply")
    public ResponseEntity<?> insertNoAnswerEventApply(HttpServletRequest request,
                                                      @CurrentUser UserPrincipal currentUser,
                                                      @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);

        MemberInfo memInfo = new MemberInfo();
        //회원 정보 조회
        memInfo = memberService.getMemberInfo(memberId);

        // Event 자체를 참가할 자격이 되는지에 대한 여부 ( 0 - 불가능 / 1 - 가능 )
        // EX) 가입일 등..
        int eventCheckCode = 1;

        // 가입일 등의 검사 조건이 있는 경우 여기에 추가 할 것
        if (eventId.equals("240")) {
            if (VivasamUtil.doDiffOfDate(memInfo.getRegDate(), "2019-02-18") < 0) {
                eventCheckCode = 0;
            }
        } else if (eventId.equals("284")) {
            if (VivasamUtil.doDiffOfDate(memInfo.getRegDate(), "2020-02-17") < 0) {
                eventCheckCode = 0;
            }
        }

        if (eventCheckCode == 1) { // 이벤트 참가 자격이 되는 여부

            if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
                if (memberId.equals(currentUser.getMemberId())) {
                    // 이벤트 내용 1에 주소, 수령처, 연락처, 선택한 테마관
                    eventAnswerDesc = "/" + memInfo.getZip() + "/" + memInfo.getAddr1() + "/" + memInfo.getSchName() + "/" + memInfo.getCellphone() + "/" + eventAnswerDesc;

                    HashMap<String, String> param = new HashMap<String, String>();
                    param.put("memberId", memberId);
                    param.put("name", memInfo.getName());
                    param.put("cellphone", memInfo.getCellphone());
                    param.put("eventId", eventId);
                    param.put("eventAnswerDesc", eventAnswerDesc);

                    //as-is 이벤트는 개인정보 수정안함
                    //int modifyResult = memberService.myInfoModify(param);
                    //if ( modifyResult > 0 ) {
                    //}
                    int applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                    logger.info("eventApplyCheck applyCnt : " + applyCnt);
                    if (applyCnt == 0) {
                        int chkJoin = saemteoService.eventApplyInsert(param);
                        if (chkJoin > 0) {
                            int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
                            param.put("checkTotalVal", Integer.toString(checkTotalVal));
                            param.put("eventAnswerSeq", "1");
                            saemteoService.eventJoinAnswerInsert(param);
                        }
                        resultMap.put("code", "0");

                        //설문조사 최신 1개까지
                        List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
                        int surveyListSize = surveyList.size();
                        if (surveyListSize > 0) {
                            resultMap.put("surveyList", surveyList.get(0));
                        }
                    } else { //이미 신청한 경우
                        resultMap.put("code", "1");
                    }
                } else {
                    //로그인 조작
                    resultMap.put("code", "3");
                }
            } else {
                //로그인 필요
                resultMap.put("code", "2");
            }

        } else {
            // 기타 신청 자격이 안되는 경우
            resultMap.put("code", "4");
        }
        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/insertApply")
    public ResponseEntity<?> insertApply(HttpServletRequest request,
                                         @CurrentUser UserPrincipal currentUser,
                                         @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String withPeopleNumber = VivasamUtil.isNull(String.valueOf(requestParams.get("withPeopleNumber")));
        String cultureActId = VivasamUtil.isNull(String.valueOf(requestParams.get("cultureActId")));
        String questionCtnt = VivasamUtil.isNull(String.valueOf(requestParams.get("questionCtnt")));
        String offline = VivasamUtil.isNull(String.valueOf(requestParams.get("offline")));
        String online = VivasamUtil.isNull(String.valueOf(requestParams.get("online")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));  // 이벤트 내용1

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        name = checkXSSService.ReplaceValue(request, "name", name);
        email = checkXSSService.ReplaceValue(request, "email", email);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        withPeopleNumber = checkXSSService.ReplaceValue(request, "withPeopleNumber", withPeopleNumber);
        cultureActId = checkXSSService.ReplaceValue(request, "cultureActId", cultureActId);
        questionCtnt = checkXSSService.ReplaceValue(request, "questionCtnt", questionCtnt);
        offline = checkXSSService.ReplaceValue(request, "offline", offline);
        online = checkXSSService.ReplaceValue(request, "online", online);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);

        // 신청정보
        CulturalActApplyInfo culturalActApplyInfo = new CulturalActApplyInfo();
        culturalActApplyInfo.setCultureActId(cultureActId);
        culturalActApplyInfo.setMemberId(memberId);
        culturalActApplyInfo.setWithPeopleNumber(withPeopleNumber);
        culturalActApplyInfo.setQuestionCtnt(questionCtnt);
        culturalActApplyInfo.setOffline(offline);
        culturalActApplyInfo.setOnline(online);
        culturalActApplyInfo.setEventAnswerDesc(eventAnswerDesc);

        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                //다른 사용자가 사용중인지 확인
                int checkUser = memberService.checkExistPersonEmail(memberId, email);
                //사용불가한 이메일
                if (checkUser == 1) {
                    resultMap.put("code", "4");
                    resultMap.put("email", email);
                    return ResponseEntity.ok(resultMap);
                }

                int applyCnt = saemteoService.cultureProgramOfflineSeminarApplyCheck(memberId, cultureActId);

                logger.info("cultureProgramOfflineSeminarApplyCheck applyCnt : " + applyCnt);

                if (applyCnt == 0) {
                    CulturalActInfo culturalActInfo = saemteoService.findProgramById(Long.parseLong(cultureActId));
                    if (culturalActInfo != null) {
                        // 교사문화 프로그램과 오프라인세미나 신청을 함께 처리
                        saemteoService.cultureProgramOfflineSeminarApplyInsert(culturalActInfo, culturalActApplyInfo);
                        resultMap.put("code", "0");
                    } else {
                        resultMap.put("code", "99"); // 올바르지 않은 문화프로그램,오프라인세미나 아이디
                    }

                } else { //이미 신청한 경우
                    resultMap.put("code", "1");
                }

            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 설문조사 목록
     *
     * @return
     */
    @GetMapping("/surveyList")
    public ResponseEntity<?> surveyList(@RequestParam(value = "ingSurveyYn", required = false, defaultValue = "Y") String ingSurveyYn) {

        List<SurveyInfo> surveyList = saemteoService.surveyList(ingSurveyYn, "");
        int surveyListSize = surveyList.size();

        Map<String, Object> resultMap = new HashMap<>();
        if (surveyListSize > 0) {
            resultMap.put("code", "0");
            resultMap.put("surveyList", surveyList.get(0));//무조건 1개
        } else {
            resultMap.put("code", "1");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 설문조사 결과보기
     *
     * @return
     */
    @GetMapping("/surveyResult")
    public ResponseEntity<?> surveyResult(HttpServletRequest request,
                                          @CurrentUser UserPrincipal currentUser,
                                          @RequestParam(value = "surveyId", required = false, defaultValue = "") String surveyId) {

        Map<String, Object> resultMap = new HashMap<>();
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {

            int pageno = VivasamUtil.isNumber(request.getParameter("pageno"), 1);
            int pagesize = VivasamUtil.isNumber(request.getParameter("pagesize"), 5);

            surveyId = checkXSSService.ReplaceValue(request, "surveyId", surveyId);

            //설문 등록 정보 조회
            SurveyInfo surveyInfo = saemteoService.surveyInfo(surveyId);

            //설문 참여자 현황 정보 조회
            List<SurveyInfo> surveyResult = saemteoService.surveyApplyStat(surveyId);

            resultMap.put("surveyInfo", surveyInfo);
            resultMap.put("surveyResult", surveyResult);
            resultMap.put("code", "0");

        } else {
            //로그인 필요
            resultMap.put("code", "1");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 설문조사 결과보기 페이징
     *
     * @return
     */
    @GetMapping("/surveyResultItem")
    public ResponseEntity<?> surveyResultItem(HttpServletRequest request,
                                              @CurrentUser UserPrincipal currentUser,
                                              @RequestParam(value = "surveyId", required = false, defaultValue = "") String surveyId,
                                              @RequestParam(value = "pageno", required = false, defaultValue = "1") String pageno,
                                              @RequestParam(value = "pagesize", required = false, defaultValue = "5") String pagesize) {

        Map<String, Object> resultMap = new HashMap<>();
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            surveyId = checkXSSService.ReplaceValue(request, "surveyId", surveyId);
            int totalCount = saemteoService.surveySubejctiveItemCount(surveyId, "11");
            Page<SurveyItemInfo> list = (Page<SurveyItemInfo>) saemteoService.surveySubejctiveItemList(Integer.parseInt(pageno), Integer.parseInt(pagesize), totalCount, surveyId);
            if (list != null && list.getSize() > 0) {
                Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(list);
                resultMap.put("surveyItemResult", resources);
            }
            resultMap.put("code", "0");
        } else {
            //로그인 필요
            resultMap.put("code", "1");
        }
        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/insertSurveyApply")
    public ResponseEntity<?> insertSurveyApply(HttpServletRequest request,
                                               @CurrentUser UserPrincipal currentUser,
                                               @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String surveyId = VivasamUtil.isNull(String.valueOf(requestParams.get("surveyId")));
        String surveySelItem = VivasamUtil.isNull(String.valueOf(requestParams.get("surveyItemNo")));
        String surveyType = VivasamUtil.isNull(String.valueOf(requestParams.get("surveyType")));
        String surveySubjective = VivasamUtil.isNull(String.valueOf(requestParams.get("surveySubjective")));

        surveyId = checkXSSService.ReplaceValue(request, "surveyId", surveyId);
        surveySelItem = checkXSSService.ReplaceValue(request, "surveySelItem", surveySelItem);
        surveyType = checkXSSService.ReplaceValue(request, "surveyType", surveyType);
        surveySubjective = checkXSSService.ReplaceValue(request, "surveySubjective", surveySubjective);

        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();

            // 준회원인 경우
            if(currentUser.getMLevel().equals("AU400")) {
                resultMap.put("code", "3");
                return ResponseEntity.ok(resultMap);
            }
            // 교사 미인증인 경우
            if(!currentUser.getValidYn().equals("Y")) {
                resultMap.put("code", "4");
                return ResponseEntity.ok(resultMap);
            }

            //참여 확인
            int applyCnt = saemteoService.surveyApplyCnt(memberId, surveyId);
            if (applyCnt == 0) {
                //설문 참여 정보 등록
                int effectRow = saemteoService.surveyApplyInsert(surveyId, memberId);
                if (effectRow > 0) {
                    String surveyItemNo = "";
                    String[] arrSurveySelItem = surveySelItem.split(",");
                    if ("M".equals(surveyType)) {
                        for (int No = 0; No < arrSurveySelItem.length; No++) {
                            surveyItemNo = arrSurveySelItem[No];
                            if (surveyItemNo.equals("11")) {
                                saemteoService.surveyItemApplyInsert(surveyId, memberId, surveyItemNo, surveySubjective);
                            } else {
                                saemteoService.surveyItemApplyInsert(surveyId, memberId, surveyItemNo, "");
                            }
                        }
                    } else if (surveyType.equals("O")) {
                        saemteoService.surveyItemApplyInsert(surveyId, memberId, "11", surveySubjective);
                    } else {
                        for (int No = 0; No < arrSurveySelItem.length; No++) {
                            surveyItemNo = arrSurveySelItem[No];
                            saemteoService.surveyItemApplyInsert(surveyId, memberId, surveyItemNo, "");
                        }
                    }
                }
                resultMap.put("code", "0");

                // 설문조사 참여 마일리지 적립
                if ("AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
                    Mileage mileage = new Mileage(memberId, MileageCode.SURVEY.getAmount(), MileageCode.SURVEY.getCode());
                    mileage.setTargetId(surveyId);
                    memberMileageService.insertMileagePlus(mileage);
                }
            } else { //이미 신청한 경우
                resultMap.put("code", "1");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }


    /**
     * 비바샘터 홈 목록
     *
     * @return
     */
    @GetMapping("/saemteoBannerList")
    public ResponseEntity<?> saemteoBannerList() {

        Map<String, Map<String, Object>> resultObjectMap = new HashMap<>();
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        List<Banner> bannerList = new ArrayList<Banner>();
        List<Banner> bannerList1 = new ArrayList<Banner>();
        List<Banner> bannerList2 = new ArrayList<Banner>();
        List<Banner> bannerList3 = new ArrayList<Banner>();
        //이벤트 배너 최대 5개까지
        EventInfo eventInfo = new EventInfo();
        eventInfo.setSchType("A");
        eventInfo.setRowNum(5);
        eventInfo.setEventUseYn("Y");
        List<EventInfo> eventList = saemteoService.eventList(eventInfo);
        int evtListSize = eventList.size();
        if (evtListSize > 0) {
            for (EventInfo temp : eventList) {
                // 모바일 배너 비공개일 경우 보여주지 않음.
                if (temp.getEventMobileBannerUseYn().equals("N")) {

                } else {
                    Banner banner = new Banner();
                    banner.setType("event");
                    banner.setTypeName("이벤트");
                    banner.setName(temp.getEventName());
                    banner.setId(temp.getEventId());
                    banner.setStartDate(temp.getEventSdate());
                    banner.setEndDate(temp.getEventEdate());
                    banner.setSrc(temp.getEventMobBnPath() + temp.getEventMobBnSav());
                    bannerList1.add(banner);
                }
            }
        }

        //교사문화프로그램 최신 1개까지
        Integer rowNum = 1;
        String stateCd = "1";
        String gubunCd = "1";
        List<CulturalActInfo> programList = saemteoService.programList(gubunCd, stateCd, rowNum, null);
        int programListSize = programList.size();
        if (programListSize > 0) {
            for (CulturalActInfo temp : programList) {
                Banner banner = new Banner();
                banner.setType("program");
                banner.setTypeName("교사문화 프로그램");
                banner.setName(temp.getTitle());
                banner.setId(temp.getCultureActId());
                banner.setStartDate(temp.getStartDt());
                banner.setEndDate(temp.getEndDt());
                banner.setSrc(temp.getMobileThumPathUrl());
                bannerList2.add(banner);
            }
        }

        //오프라인 세미나 최신 1개까지
        gubunCd = "2";
        List<CulturalActInfo> seminarList = saemteoService.programList(gubunCd, stateCd, rowNum, null);
        int seminarListSize = seminarList.size();
        if (seminarListSize > 0) {
            for (CulturalActInfo temp : seminarList) {
                Banner banner = new Banner();
                banner.setType("seminar");
                banner.setTypeName("오프라인 세미나");
                banner.setName(temp.getTitle());
                banner.setId(temp.getCultureActId());
                banner.setStartDate(temp.getStartDt());
                banner.setEndDate(temp.getEndDt());
                banner.setSrc(temp.getMobileThumPathUrl());
                bannerList3.add(banner);
            }
        }

        // 병합
        bannerList.addAll(bannerList1);
        bannerList.addAll(bannerList2);
        bannerList.addAll(bannerList3);
        // 정렬
        Collections.sort(bannerList);
        resultMap.put("bannerList", bannerList);

        //설문조사 최신 1개까지
        List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
        int surveyListSize = surveyList.size();
        if (surveyListSize > 0) {
            resultMap.put("surveyList", surveyList.get(0));
        }

        resultObjectMap.put("bannerList", resultMap);

        return ResponseEntity.ok(resultObjectMap);
    }


    /**
     * 비바샘터 추천 수업 자료 배너 목록
     *
     * @return
     */
    @GetMapping("/recommandEduBannerList")
    public ResponseEntity<?> recommandEduBannerList() {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        //이벤트 배너
        List<Map<String, Object>> recommandEduBannerList = saemteoService.recommandEduBannerList();
        if (recommandEduBannerList.size() > 0) {
            resultMap.put("bannerList", recommandEduBannerList);
        }

        return ResponseEntity.ok(resultMap);
    }

    /** 20190411 부터 신규 함수는 아래쪽에 넣어두시면 감사하겠습니다. **/


    /**
     * 2019.04.11 김대희
     * EventId를 통해 해당 응답 목록 출력
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/getEventAnswerList")
    public ResponseEntity<?> getEventAnswerList(@CurrentUser UserPrincipal currentUser,
                                                @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 매개변수 값 입력
        EventJoinAnswerPageInfo parameter = new EventJoinAnswerPageInfo();
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = (int) pageParams.get("pageSize");
        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();


        // 해당 리스트 값 가져오기
        parameter.setPage(pageNo);
        parameter.setPageSize(pageSize);
        parameter.setEventId(eventId);
        parameter.setEventAnswerSeq(eventAnswerSeq);
        parameter.setMemberId("");
        if (requestParams.get("searchIndex") != null) parameter.setSearchIndex((int) requestParams.get("searchIndex"));
        if (requestParams.get("searchKeyword") != null) parameter.setSearchKeyword(requestParams.get("searchKeyword").toString());
        if (requestParams.get("searchKeyword2") != null) parameter.setSearchKeyword2(requestParams.get("searchKeyword2").toString());
        if (requestParams.get("searchKeywordList") != null) parameter.setSearchKeywordList((ArrayList) requestParams.get("searchKeywordList"));

        List<Map<String, Object>> eventJoinAnswerList = saemteoService.eventJoinAnswerApplyList(parameter);


        for (Map<String, Object> tempMap : eventJoinAnswerList) {
            String event_answer_desc = VivasamUtil.getStringOfObject(tempMap.get("event_answer_desc"));
            event_answer_desc = VivasamUtil.replace(event_answer_desc, "''", "'");
            tempMap.put("event_answer_desc", event_answer_desc);
        }

        resultMap.put("eventJoinAnswerList", eventJoinAnswerList);
        return ResponseEntity.ok(resultMap);

    }

    /**
     * 2019.04.14 김대희
     * EventId, MemberId, eventDesc, eventSeq 를 입력하여 응답 추가
     * 모바일에서 질문당 1개만 입력이 가능하여, 추가( 2.3.4번 질문 응답은 이 함수를 통해 입력 )
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/setEventJoinAnswerAddInsert")
    public ResponseEntity<?> setEventJoinAnswerAddInsert(HttpServletRequest request,
                                                         @CurrentUser UserPrincipal currentUser,
                                                         @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String eventAnswerSeq = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerSeq")));
        String amountYn = VivasamUtil.isNull(String.valueOf(requestParams.get("amountYn")));

        // XSS 공격 필터링 - ( EventId, memberId, 응답 내용, 응답 번호 )
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);
        eventAnswerSeq = checkXSSService.ReplaceValue(request, "eventAnswerSeq", eventAnswerSeq);

        // 현재 회원과 이벤트 회원의 일치사항 확인
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                HashMap<String, String> param = new HashMap<String, String>();
                param.put("eventId", eventId);
                param.put("memberId", memberId);
                param.put("eventAnswerDesc", eventAnswerDesc);
                param.put("eventAnswerSeq", eventAnswerSeq);
                if("Y".equals(amountYn)){
                    // 수량체크
                    boolean amountCheck = saemteoService.setEventJoinAnswerAddAmountChk(param);
                    if(amountCheck){
                        saemteoService.setEventJoinAnswerAddInsert(param);
                        resultMap.put("code", "0");
                    }else{
                        resultMap.put("code", "4"); // 수량 초과로 기본 화면으로 초기화
                    }
                }else{
                    saemteoService.setEventJoinAnswerAddInsert(param);
                    resultMap.put("code", "0");
                }

            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.04.14 김대희
     * EventId, MemberId를 통해 해당 응답 삭제
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/setEventAnswerDelete")
    public ResponseEntity<?> setEventDeleteList(HttpServletRequest request,
                                                @CurrentUser UserPrincipal currentUser,
                                                @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));

        // XSS 공격 필터링 - ( EventId, memberId )
        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        // 현재 회원과 이벤트 회원의 일치사항 확인
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {
                try { // 정상적일시 Code 0
                    saemteoService.eventJoinDelete(eventId, memberId);
                    saemteoService.eventJoinAnswerDelete(eventId, memberId);
                    resultMap.put("code", "0");
                } catch (Exception e) { // Error 발생시
                    e.printStackTrace();
                    resultMap.put("code", "1");
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.04.14 김대희
     * EventId, MemberId를 통해 해당 응답 수정
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/setEventAnswerUpdate")
    public ResponseEntity<?> setEventAnswerUpdate(HttpServletRequest request,
                                                  @CurrentUser UserPrincipal currentUser,
                                                  @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String eventJoinAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String eventJoinAnswerSeq = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerSeq")));

        // XSS 공격 필터링 - ( EventId, memberId, 응답 내용, 응답 번호 )
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventJoinAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventJoinAnswerDesc);
        eventJoinAnswerSeq = checkXSSService.ReplaceValue(request, "eventAnswerSeq", eventJoinAnswerSeq);

        // 현재 회원과 이벤트 회원의 일치사항 확인
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {
                try { // 정상적일시 Code 0
                    saemteoService.eventJoinAnswerUpdate(eventId, memberId, eventJoinAnswerDesc, eventJoinAnswerSeq);
                    resultMap.put("code", "0");
                } catch (Exception e) { // Error 발생시
                    e.printStackTrace();
                    resultMap.put("code", "2");
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.04.14 김대희
     * EventId를 통해 해당 이벤트 응답 숫자 파악
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/checkEventTotalJoin")
    public ResponseEntity<?> checkEventTotalJoin(HttpServletRequest request,
                                                 @CurrentUser UserPrincipal currentUser,
                                                 @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));

        // XSS 공격 필터링 - ( EventId )
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.checkEventTotalJoin(eventId);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }


    /**
     * 2019.04.22 김대희
     * EventId, MemberId를 통해 해당 EventId, eventJoinAnswer 에 있는 응답 하나 출력
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/getEventAnswerSingleQuestion")
    public ResponseEntity<?> getEventAnswerSingleQuestion(HttpServletRequest request,
                                                          @CurrentUser UserPrincipal currentUser,
                                                          @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String eventAnswerSeq = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerSeq")));

        // XSS 공격 필터링 - ( EventId, memberId, 응답 내용, 응답 번호 )
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventAnswerSeq = checkXSSService.ReplaceValue(request, "eventAnswerSeq", eventAnswerSeq);

        // 해당 리스트 값 가져오기 ( 한개의 응답값만 가져올 예정 )
        EventJoinAnswerPageInfo parameter = new EventJoinAnswerPageInfo();
        parameter.setPage(1);
        parameter.setPageSize(1);
        parameter.setEventId(eventId);
        parameter.setEventAnswerSeq(eventAnswerSeq);
        parameter.setMemberId(memberId);
        List<Map<String, Object>> eventJoinAnswerList = saemteoService.eventJoinAnswerApplyList(parameter);


        resultMap.put("eventJoinAnswerList", eventJoinAnswerList);
        return ResponseEntity.ok(resultMap);

    }

    /**
     * 2019.05.09 김대희
     * 설렘꾸러미 지역에 따른 카운트 추출
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/getGiftBundleCount")
    public ResponseEntity<?> getGiftBundleCount(HttpServletRequest request,
                                                @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 설렘꾸러미 Param Name은 requestIdx로 지정
        String idx = VivasamUtil.isNull(String.valueOf(requestParams.get("eventGiftCount")));
        int requestCount = saemteoService.getGiftBundleCount(idx);

        resultMap.put("requestCount", String.valueOf(requestCount));
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.05.23 김대희
     * 질문이 살아있는 수업의 남은 수량 파악 위해 사용
     * 다른 이벤트와 달리 선택이 6개라 따로 api 생성
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/getClassLiveQuestionEventAmount")
    public ResponseEntity<?> getClassLiveQuestionEventAmount(HttpServletRequest request,
                                                             @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 해당되는 event Id = 252지만 외부에서 받아오도록 작업
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);


        List<Map<String, Object>> classLiveQuestionAmountListMap = saemteoService.classLiveQuestionAmount();
        Map<String, Object> classLiveAmountList = classLiveQuestionAmountListMap.get(0);

        // 프런트를 바꾸지 않고 해당 백엔드만 수정하기 위해 classLiveQuestion 배열은 유지함
        // 해당 쿼리문 한번만 실행하고 배열에 값 할당
        int[] classLiveQuestionAmountList = new int[6];
        classLiveQuestionAmountList[0] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTKOREAN")));
        classLiveQuestionAmountList[1] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTMATH")));
        classLiveQuestionAmountList[2] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTSOCIAL")));
        classLiveQuestionAmountList[3] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTMORAL")));
        classLiveQuestionAmountList[4] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTSCIENCE")));
        classLiveQuestionAmountList[5] = Integer.parseInt(String.valueOf(classLiveAmountList.get("COUNTCAREERS")));

        resultMap.put("classLiveQuestionAmountList", classLiveQuestionAmountList);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.06.10 김대희
     * 이벤트 수량 검사를 통한 이벤트 등록
     * 수량이 제한되어 있는 입력의 경우 수량 검사를 꼭 해주어야 함.
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/insertAmountEventApply")
    public ResponseEntity<?> insertAmountEventApply(HttpServletRequest request,
                                                    @CurrentUser UserPrincipal currentUser,
                                                    @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String amount = VivasamUtil.isNull(String.valueOf(requestParams.get("amount")));

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        name = checkXSSService.ReplaceValue(request, "name", name);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);
        amount = checkXSSService.ReplaceValue(request, "amount", amount);

        // eventAnswer 응답이 없거나 비어있는 경우 튕기도록 추가
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId()) && eventAnswerDesc != null && (!eventAnswerDesc.equals(""))) {
            if (memberId.equals(currentUser.getMemberId())) {

                /* 이벤트 수량 검사 추가 */
                String eventCntId = "2";
                String type = "1";

                // 이벤트 현재 신청 수량
                int eventCnt = saemteoService.checkEventCntCount(eventId, eventCntId);
                // 이벤트 수량
                int eventTotCnt = saemteoService.checkEventTotAmount(eventId, type);
                int sumEventCnt = eventCnt + Integer.parseInt(amount);

                // 현재 이벤트 수량이 남아있는 경우 지원 유무 검사
                if (eventTotCnt >= sumEventCnt) {

                    HashMap<String, String> param = new HashMap<String, String>();
                    param.put("memberId", memberId);
                    param.put("name", name);
                    param.put("cellphone", cellphone);
                    param.put("eventId", eventId);
                    param.put("eventAnswerDesc", eventAnswerDesc);

                    int applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                    logger.info("eventApplyCheck applyCnt : " + applyCnt);
                    if (applyCnt == 0) { // 지원하지 않았던 경우 해당되는 수량만큼 값을 넣어줌
                        int chkJoin = saemteoService.eventApplyInsert(param);
                        if (chkJoin > 0) {
                            int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
                            param.put("checkTotalVal", Integer.toString(checkTotalVal));
                            param.put("eventAnswerSeq", "1");
                            saemteoService.eventJoinAnswerInsert(param);

                            // 수량이 있는 경우 2번에도 해당되는 수량만큼 집어넣어야 함.
                            param = new HashMap<String, String>();
                            param.put("eventId", eventId);
                            param.put("memberId", memberId);
                            param.put("eventAnswerDesc", amount);
                            param.put("eventAnswerSeq", "2");
                            saemteoService.setEventJoinAnswerAddInsert(param);
                        }
                        resultMap.put("code", "0");

                        //설문조사 최신 1개까지
                        List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
                        int surveyListSize = surveyList.size();
                        if (surveyListSize > 0) {
                            resultMap.put("surveyList", surveyList.get(0));
                        }
                    } else { //이미 신청한 경우
                        resultMap.put("code", "1");
                    }
                } else { // 수량 초과
                    resultMap.put("code", "4");
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.08.22 김대희
     * SMS를 통한 비공개 이벤트인 경우 사용
     * 해당회원이 이벤트 참여자격이 되는지 검사
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/checkPrivateEventMember")
    public ResponseEntity<?> checkPrivateEventMember(HttpServletRequest request,
                                                     @CurrentUser UserPrincipal currentUser,
                                                     @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // MemberId, EventId로 해당 회원인지 검사
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            // 해당 회원이 이벤트 자격이 있는지 검사
            HashMap<String, String> param = new HashMap<String, String>();
            param.put("memberId", memberId);
            param.put("eventId", eventId);
            int checkPrivateEventCnt = saemteoService.checkPrivateEventMemberCount(eventId, memberId);
            if (checkPrivateEventCnt == 0) {
                // 해당 회원의 이벤트 신청 자격이 없는 경우
                resultMap.put("code", "0");
            } else {
                // 해당 회원의 이벤트 신청 자격이 있는 경우
                resultMap.put("code", "1");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }


    /**
     * 2019.10.25 김대희
     * 구글 설문조사 ( 또는 중복가능 조사 )
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/googleSurveyCountCheck")
    public ResponseEntity<?> googleSurveyCountCheck(HttpServletRequest request,
                                                    @CurrentUser UserPrincipal currentUser,
                                                    @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));

        // XSS 공격 필터링 - ( EventId )
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.googleSurveyCountCheck(eventId);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2019.10.28 김완섭
     * 구글 설문조사 참여
     * 수량 제한 체크, 구글 이벤트 참여 완료 여부를 알 수 없어, 중복 신청이 가능하며, 중복 신청 카운트에 상관없이, 참여 아이디 수로 체크
     *
     * @param request
     * @param model
     * @return
     */
    @PostMapping("/insertGoogleEventApply")
    public ResponseEntity<?> insertGoogleEventApply(HttpServletRequest request,
                                                    @CurrentUser UserPrincipal currentUser,
                                                    @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        //필수 항목
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String amount = VivasamUtil.isNull(String.valueOf(requestParams.get("amount")));

        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        name = checkXSSService.ReplaceValue(request, "name", name);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);
        amount = checkXSSService.ReplaceValue(request, "amount", amount);

        // eventAnswer 응답이 없거나 비어있는 경우 튕기도록 추가
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId()) && eventAnswerDesc != null && (!eventAnswerDesc.equals(""))) {
            if (memberId.equals(currentUser.getMemberId())) {

                /* 이벤트 수량 검사 추가 */
                String eventCntId = "2";
                String type = "1";

                // 이벤트 현재 신청 수량
                int eventCnt = saemteoService.googleSurveyCountCheck(eventId);
                // 이벤트 수량
                int eventTotCnt = saemteoService.checkEventTotAmount(eventId, type);
                int sumEventCnt = eventCnt + Integer.parseInt(amount);

                // 현재 이벤트 수량이 남아있는 경우 지원 유무 검사
                if (eventTotCnt >= sumEventCnt) {

                    HashMap<String, String> param = new HashMap<String, String>();
                    param.put("memberId", memberId);
                    param.put("name", name);
                    param.put("eventId", eventId);
                    param.put("eventAnswerDesc", eventAnswerDesc);

                    int chkJoin = saemteoService.eventApplyInsert(param);
                    if (chkJoin > 0) {
                        int checkTotalVal = saemteoService.googleSurveyCountCheck(eventId);
                        param.put("checkTotalVal", Integer.toString(checkTotalVal));
                        param.put("eventAnswerSeq", "1");
                        saemteoService.eventJoinAnswerInsert(param);

                        // 수량이 있는 경우 2번에도 해당되는 수량만큼 집어넣어야 함.
                        param = new HashMap<String, String>();
                        param.put("eventId", eventId);
                        param.put("memberId", memberId);
                        param.put("eventAnswerDesc", amount);
                        param.put("eventAnswerSeq", "2");
                        saemteoService.setEventJoinAnswerAddInsert(param);
                    }
                    resultMap.put("code", "0");
                } else { // 수량 초과
                    resultMap.put("code", "4");
                }
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2020.02.13 김대희
     * 모니터링단 이벤트 등록
     *
     * @param request
     * @param currentUser
     * @param requestParamMap
     * @return
     */
    @PostMapping("/insertMonitoringEvent")
    public ResponseEntity<?> insertMonitoringEvent(HttpServletRequest request,
                                                   @CurrentUser UserPrincipal currentUser,
                                                   @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 수정할 정보 입력
        // 횟수, 아이디, 경력, 지원동기, 활동 내역
        String number = VivasamUtil.isNull(String.valueOf(requestParams.get("number")));
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));
        String teacherCareer = VivasamUtil.isNull(String.valueOf(requestParams.get("teacherCareer")));
        String applyReason = VivasamUtil.isNull(String.valueOf(requestParams.get("applyReason")));
        String activityDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("activityDesc")));
        String mSubjectCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mSubjectCd")));

        // eventAnswer 응답이 없거나 비어있는 경우 튕기도록 추가
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {
                HashMap<String, String> param = new HashMap<String, String>();
                param.put("mntrNumber", number);
                param.put("memberId", memberId);
                param.put("teacherCareer", teacherCareer);
                param.put("applyReason", applyReason);
                param.put("activityDesc", activityDesc);
                param.put("mSubjectCd", mSubjectCd);
                saemteoService.insertMonitoringEvent(param);
                resultMap.put("code", "0");
            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }


        return ResponseEntity.ok(resultMap);

    }


    /**
     * 2020.02.14 김대희
     * 이벤트를 위한 회원의 학급정보 추출
     *
     * @param request
     * @param currentUser
     * @param requestParamMap
     * @return
     */
    @PostMapping("/eventMemberSchoolInfo")

    public ResponseEntity<?> eventMemberSchoolInfo(HttpServletRequest request,
                                                   @CurrentUser UserPrincipal currentUser,
                                                   @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 해당 회원의 학급 추출
        String memberId = VivasamUtil.isNull(String.valueOf(requestParams.get("memberId")));

        // Id를 통해 학급 추출 정보를 찾음
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {
                HashMap<String, String> param = new HashMap<String, String>();
                param.put("memberId", memberId);

                String tab = saemteoService.eventMemberSchoolInfo(param);
                resultMap.put("TAB", tab);
                resultMap.put("code", "0");

            } else {
                //로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            //로그인 필요
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);

    }



    /**
     * 2020.03.16 김대희
     * EVENT_ANSWER_DESC 에 있는 문자에 따른 신청 수량 파악 ( 현재 신청 수량 파악 )
     * 이벤트 답변에 ( 초등 수학, 초등 사회 ) 이렇게 달릴시 초등 수학만 보내고 LIKE문으로 체크함
     * @param request
     * @param requestParamMap
     * @return
     */
    @PostMapping("/eventAnswerDescCheck")
    public ResponseEntity<?> eventAnswerDescCheck(HttpServletRequest request,
                                                  @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 수량 검사는 로그인 필요 없음
        HashMap<String, String> param = new HashMap<String, String>();
        int amount = saemteoService.chkEventJoinAnswerSeq(requestParams.get("eventId").toString(),"","2",requestParams.get("eventAnswerDesc").toString());
        resultMap.put("amount", amount);
        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);

    }

    /**
     * 2020.03.16 김대희
     * 수량 제한 파악
     * 해당된 EVENT_ID, EVENT_TYPE에 따른 EVENT_AMOUNT 측정
     * @param request
     * @param requestParamMap
     * @return
     */
    @PostMapping("/eventCheckLimitAmount")
    public ResponseEntity<?> eventCheckLimitAmount(HttpServletRequest request,
                                                   @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");

        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String type = VivasamUtil.isNull(String.valueOf(requestParams.get("eventType")));

        Map<String, Object> resultMap = new HashMap<>();

        // 수량 검사는 로그인 필요 없음
        HashMap<String, String> param = new HashMap<String, String>();
        int eventTotCnt = saemteoService.checkEventTotAmount(eventId, type);
        resultMap.put("eventTotCnt", eventTotCnt);
        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);

    }

    /**
     * 2020.03.30 윤명수
     * EVENT_ANSWER_DESC 에 신청한 수량이 적혀있을 경우
     * @param request
     * @param requestParamMap
     * @return
     */
    @PostMapping("/chkEventJoinQntCnt")
    public ResponseEntity<?> chkEventJoinQntCnt(HttpServletRequest request,
                                                @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        String seq = VivasamUtil.isNull(String.valueOf(requestParams.get("seq")));
        if("".equals(seq)){
            seq = "2";
        }
        // 수량 검사는 로그인 필요 없음
        int qntCnt = saemteoService.chkEventJoinQntCnt(requestParams.get("eventId").toString(),"", seq);
        resultMap.put("qntCnt", qntCnt);
        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2021.06.03 허장회
     * 수량제한이 있는 경품 이벤트에서 경품종류가 다수일 경우, 잔여 수량 조회
     * @return 잔여 신청가능 수량
     */
    @PostMapping("/chkEventRemainsQntCnt")
    public ResponseEntity<?> chkEventRemainQntCnt(@RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        String eventId = requestParams.get("eventId").toString();

        // 신청 가능 수량 조회
        List<EventAmount> eventAmountRemainsList = saemteoService.selectEventAmountRemains(eventId);

        // 응답데이터 생성
        Map<String, Object> resultMap = new HashMap<>();
        for (EventAmount item : eventAmountRemainsList) {
            resultMap.put("qntCnt_" + item.getEventType(), item.getRemains());
        }
        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 나의 이벤트 신청정보
     * @param requestParamMap
     * @param currentUser
     * @return
     */
    @PostMapping("/my-answer")
    public ResponseEntity<?> findMyEventJoinAnswer(
            @RequestBody Map<String, Map<String, Object>> requestParamMap,
            @CurrentUser UserPrincipal currentUser
    ) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        String eventId = requestParams.get("eventId").toString();

        String memberId = currentUser.getMemberId();

        // 이벤트 아이디가 없거나 사용자 아이디가 없으면 "" 반환
        if (!StringUtils.hasText(eventId) || !StringUtils.hasText(memberId)) {
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("answer", "");
            return ResponseEntity.ok(resultMap);
        }

        String eventJoinAnswer = "";
        EventInfo parentEventInfo = saemteoService.getParentEventInfoSubDupYnByEventId(eventId);

        // 1. 상위 이벤트가 없거나, 상위 이벤트의 하위 중복신청허용 값이 null 이거나, 하위 중복신청을 허용할 경우는 서브이벤트 아이디로 신청 값 조회
        if (parentEventInfo == null || parentEventInfo.getSubDupYn() == null || "Y".equals(parentEventInfo.getSubDupYn())) {
            eventJoinAnswer = saemteoService.getMyEventJoinAnswer(eventId, memberId);

        }
        // 2. 상위 이벤트가 있으면서 서브이벤트 중복신청이 안될 경우 상위이벤트 아이디로 신청답변 조회
        else {
            eventJoinAnswer = saemteoService.getMyEventJoinAnswerByParentEventId(parentEventInfo.getEventId(), memberId);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("answer", eventJoinAnswer);
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 이벤트 신청 여부 조회
     * @param requestParamMap
     * @param currentUser
     * @return
     */
    @PostMapping("/chkEventJoin")
    public ResponseEntity<?> checkEventJoin(
            @RequestBody Map<String, Map<String, Object>> requestParamMap,
            @CurrentUser UserPrincipal currentUser
    ) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        String eventId = requestParams.get("eventId").toString();

        String memberId = currentUser.getMemberId();

        int joinCnt;
        EventInfo parentEventInfo = saemteoService.getParentEventInfoSubDupYnByEventId(eventId);
        // 1. 상위 이벤트가 없거나, 상위 이벤트의 하위 중복신청허용 값이 null 이거나, 하위 중복신청을 허용할 경우는 서브이벤트 아이디로 신청 수 조회
        if (parentEventInfo == null || parentEventInfo.getSubDupYn() == null || "Y".equals(parentEventInfo.getSubDupYn())) {
            joinCnt = saemteoService.eventApplyCheck(memberId, eventId);
        }

        // 2. 상위 이벤트가 있으면서 서브이벤트 중복신청이 안될 경우 상위이벤트 아이디로 신청수 조회
        else {
            joinCnt = saemteoService.getEventJoinCntByEventParentId(parentEventInfo.getEventId(), memberId);

        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("eventJoinYn", joinCnt > 0 ? "Y" : "N");
        resultMap.put("eventEnd",  saemteoService.getEventEndDate(eventId));

        /* 2025-09-15 ~ 2025-09-23 [ <위인의 생각을 쓰다> 필사 노트 ] 로 인한 코드 추가 ( 모바일은 이벤트 / pc는 꿈지기 로 인한 중복 체크 )  */
        String campaignId = "10";
        EventInfo eventReqInfo = new EventInfo();
        eventReqInfo.setCampaignId(campaignId);
        eventReqInfo.setMemberId(memberId);
        int joinCount2 = saemteoService.getCampaignJoinCnt(eventReqInfo);
        resultMap.put("campaignJoinYn", joinCount2 > 0 ? "Y" : "N");
        /* 2025-09-15 ~ 2025-09-23 [ <위인의 생각을 쓰다> 필사 노트 ] 로 인한 코드 추가 ( 모바일은 이벤트 / pc는 꿈지기 로 인한 중복 체크 )  */

        /* 2024 08 30 교과서 합격 이벤트 */
        if("520".equals(eventId) || "521".equals(eventId)) {
            EventInfo eventReqInfo2 = new EventInfo();
            eventReqInfo2.setMemberId(memberId);
            eventReqInfo2.setEventId(eventId);
            String joinDate = saemteoService.chkEventJoinDate(eventReqInfo2);
            resultMap.put("joinDate", joinDate);
        }
        /* 2025-08-29 비상교과서 이벤트 */
        if("583".equals(eventId) || "584".equals(eventId)) {
            EventInfo eventReqInfo2 = new EventInfo();
            eventReqInfo2.setMemberId(memberId);
            eventReqInfo2.setEventId(eventId);
            String joinDate = saemteoService.chkEventJoinDate(eventReqInfo2);
            resultMap.put("joinDate", joinDate);
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 서버 시간 조회
     * @return
     */
    @PostMapping("/getCurrentTime")
    public ResponseEntity<?> getCurrentTime() {

        // 서버시간
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateFormat = formatter.format(Calendar.getInstance().getTime());

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("nowDate", dateFormat);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * TODO 해당 메서드 Service의 Transation 내로 리팩토링할 것.
     * 이벤트에 등록된 마일리지 포인트 적립
     * @param eventId
     * @param memberId
     */
    public boolean addEventMileage(String eventId, String memberId, String eventAgreeCount) {
        logger.info("1111");
        boolean result = false;
        int mileagePoint= saemteoService.getEventMileagePoint(eventId);
        int agreeCount = Integer.parseInt(eventAgreeCount);

        if (agreeCount > 0){
            mileagePoint *= agreeCount;
        }

        if(mileagePoint == 0) {
            return true;
        } else if (mileagePoint < 0) {
            mileagePoint = Math.abs(mileagePoint); //절대값으로 음수를 양수로 변경함
            Mileage mileage = new Mileage(memberId, mileagePoint, MileageCode.EVENT.getCode());
            mileage.setTargetId(eventId);
            mileage.setTargetMenu("EVENT");
            result =  memberMileageService.insertMileageMinus(mileage);
        } else if (mileagePoint > 0) {
            logger.info("2222");
            Mileage mileage = new Mileage(memberId, mileagePoint, MileageCode.EVENT.getCode());
            mileage.setTargetId(eventId);
            mileage.setTargetMenu("EVENT");
            result = memberMileageService.insertMileagePlus(mileage);
        }
        logger.info("7777");
        return result;
    }

    /**
     * @param requestParamMap
     * @return
     */
    @PostMapping("/getEventAnswerListCntForTwoComment")
    public ResponseEntity<?> getEventAnswerListCntForTwoComment(@RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = requestParams.get("eventId").toString();
        String eventJoinAnswerSeq = requestParams.get("eventAnswerSeq").toString();

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.getEventJoinAnswerCntForTwoComment(eventId, eventJoinAnswerSeq);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     * @param requestParamMap
     * @return
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/getEventAnswerListForTwoComment")
    public ResponseEntity<?> getEventAnswerListForTwoComment(@RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 매개변수 값 입력
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = (int) pageParams.get("pageSize");
        String eventId = requestParams.get("eventId").toString();
        String eventJoinAnswerSeq = requestParams.get("eventAnswerSeq").toString();

        // 해당 리스트 값 가져오기
        List<Map<String, Object>> eventJoinAnswerList = saemteoService.getEventJoinAnswerListForTwoComment(pageNo, pageSize, eventId, eventJoinAnswerSeq, "");

        for (Map<String, Object> tempMap : eventJoinAnswerList) {
            String event_answer_desc = VivasamUtil.getStringOfObject(tempMap.get("event_answer_desc"));
            event_answer_desc = VivasamUtil.replace(event_answer_desc, "''", "'");
            tempMap.put("event_answer_desc", event_answer_desc);
        }

        resultMap.put("eventJoinAnswerList", eventJoinAnswerList);
        return ResponseEntity.ok(resultMap);

    }

    /**
     * 한 이벤트 페이지에서 특정 참여 정보의 수
     */
    @PostMapping("/getSpecificEventAnswerCount")
    public ResponseEntity<?> getSpecificEventAnswerCount(@RequestBody EventJoinAnswerPageInfo parameter) {
        Map<String, Object> resultMap = new HashMap<>();

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.getSpecificEventTotalJoin(parameter);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    /**
     *  한 이벤트 페이지에서 특정 이벤트 참여정보 목록
     */
    @PostMapping("/getSpecificEventAnswerList")
    public ResponseEntity<?> getSpecificEventAnswerList(@RequestBody EventAnswerParameter parameter) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("eventJoinAnswerList", saemteoService.getSpecificEventJoinAnswerList(parameter));
        return ResponseEntity.ok(resultMap);
    }

    /**
     * @param requestParamMap
     * @return
     */
    @PostMapping("/getSpecificEventAnswerList3")
    public ResponseEntity<?> getSpecificEventAnswerList3(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // 2024 08 23 520 교과서 합격 이벤트용 임시 댓글창 불러오기
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 매개변수 값 입력
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = 6;
        Object eventIdObj = pageParams.get("eventId");
        String eventId = String.valueOf(eventIdObj);
        int totalCnt = saemteoService.getReplyCount(eventId);
        List<Map<String, Object>> eventJoinAnswerList = saemteoService.getSpecificEventJoinAnswerList3(pageNo, pageSize, eventId);

        resultMap.put("replyTotalCnt", totalCnt);
        resultMap.put("eventJoinAnswerList", eventJoinAnswerList);
        return ResponseEntity.ok(resultMap);
    }
    /**
     * @param requestParamMap
     * @return
     */
    @PostMapping("/writeReply")
    public ResponseEntity<?> writeReply(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("replyAns");

        String memberId = (String) pageParams.get("memberId");
        Object eventIdObj = pageParams.get("eventId");
        String eventId = String.valueOf(eventIdObj);
        String content = (String) pageParams.get("contents");
        String refUrl = (String) pageParams.get("refUrl");
        try {
            int result = saemteoService.writeReply(memberId, eventId, content, refUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(0);
    }

    /**
     * 회원 정보 수정 이벤트 참여정보 insert
     * */
    @GetMapping("/agree")
    public ResponseEntity<?> setMemberEventAgreeInfo(@CurrentUser UserPrincipal currentUser,
                                                     @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {
        MemberEventAgreeInfo memberEventAgreeInfo = new MemberEventAgreeInfo();
        memberEventAgreeInfo.setMemberId(currentUser.getMemberId());
        memberEventAgreeInfo.setEventId(eventId);

        logger.info(currentUser.getMemberId());
        logger.info(eventId);
        //중복 검사
        if (saemteoService.getEventAgreeInfoCount(memberEventAgreeInfo) < 1) {
            saemteoService.insertEventAgreeInfo(memberEventAgreeInfo);
        }

        return ResponseEntity.ok(memberEventAgreeInfo);
    }


    /**
     * 룰렛 이벤트 남은 티켓 조회
     * @param requestParamMap
     * @param currentUser
     * @return
     */
    @PostMapping("/getRouletteTicketNum")
    public ResponseEntity<?> getRouletteTicketNum(
            @RequestBody Map<String, Map<String, Object>> requestParamMap,
            @CurrentUser UserPrincipal currentUser
    ) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        String eventId = requestParams.get("eventId").toString();

        String memberId = currentUser.getMemberId();
        String regDate[] = currentUser.getRegDate().split("-");
        LocalDate memRegDate = LocalDate.of(Integer.parseInt(regDate[0]),Integer.parseInt(regDate[1]), Integer.parseInt(regDate[2]));
        LocalDate startDate = LocalDate.of(2023,2,12);
        LocalDate endDate = LocalDate.of(2023,4,1);

        String urlSaveYn = saemteoService.getRouletteEventUrlJoin(memberId);
        int joinCnt = saemteoService.eventApplyCheck(memberId, eventId);
        // 교사인증 부분 업데이트
        currentUser.setCeritfyCheck(memberService.checkCertifyCheck(currentUser.getMemberId()));


        int ticketRemainNum = 0;

        //룰렛 이벤트 기간내 신규회원 및 인증회원 여부
        if(memRegDate.isAfter(startDate) && memRegDate.isBefore(endDate) && "Y".equals(currentUser.getCeritfyCheck())) {
            ticketRemainNum++;
        }

        //url 등록 여부
        if(org.apache.commons.lang3.StringUtils.isNotBlank(urlSaveYn)){
            ticketRemainNum++;
        }

        //1차참여 여부
        if(joinCnt > 0) {
            ticketRemainNum--;
        }

        //2차참여 여부
        if(org.apache.commons.lang3.StringUtils.isNotBlank(urlSaveYn) && "Y".equals(urlSaveYn)) {
            ticketRemainNum--;
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("ticketRemainNum", ticketRemainNum);
        resultMap.put("urlSaveYn", urlSaveYn);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 룰렛 이벤트 남은 티켓 조회
     * @param requestParamMap
     * @param currentUser
     * @return
     */
    @PostMapping("/roulette/save/url")
    public ResponseEntity<?> rouletteSaveUrl(
            @RequestBody Map<String, Map<String, Object>> requestParamMap,
            @CurrentUser UserPrincipal currentUser
    ) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String url = VivasamUtil.isNull(String.valueOf(requestParams.get("url")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));

        Map<String, Object> returnMap = new HashMap<>();

        try {
            if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
                HashMap<String, String> param = new HashMap<String, String>();
                param.put("memberId", memberId);
                param.put("url", url);
                param.put("eventId", eventId);
                param.put("urlEventJoinYn", "N");

                saemteoService.saveRouletteEventUrl(param);

                returnMap.put("code", "0");
            } else {
                returnMap.put("code", "2");
            }
        } catch (Exception e) {
            returnMap.put("code", "1");
        }



        return ResponseEntity.ok(returnMap);
    }

    /**
     * 룰렛 이벤트 신청
     * @param requestParamMap
     * @param currentUser
     * @return
     */
    @PostMapping("/insertRouletteEventApply")
    public ResponseEntity<?> insertRouletteEventApply(HttpServletRequest request, @CurrentUser UserPrincipal currentUser,
                                                      @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String eventAnswerDesc2 = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc2")));
        String amountYn = VivasamUtil.isNull(String.valueOf(requestParams.get("amountYn")));
        String applyContentTotCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentTotCnt")));
        String applyContentNumbers = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentNumbers")));
        String applyTargetContentCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyTargetContentCnt")));
        //url등록티켓사용여부
        String urlSaveYn = saemteoService.getRouletteEventUrlJoin(memberId);
        // 한 이벤트 페이지에서 참여한 이벤트의 개수
        String eventAgreeCount = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAgreeCount")), "0");



        name = checkXSSService.ReplaceValue(request, "name", name);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);

        logger.info("==========================================");
        logger.info("insertRouletteEventApply start");
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                HashMap<String, String> param = new HashMap<String, String>();
                param.put("memberId", memberId);
                param.put("name", name);
                param.put("cellphone", cellphone);
                param.put("eventId", eventId);
                param.put("eventAnswerDesc", eventAnswerDesc);


                EventInfo parentEventInfo = saemteoService.getParentEventInfoSubDupYnByEventId(eventId);
                int applyCnt = saemteoService.eventApplyCheck(memberId, eventId);
                logger.info("eventApplyCheck applyCnt : " + applyCnt);


                //중복참여방지
                if((applyCnt > 0 && org.apache.commons.lang3.StringUtils.isBlank(urlSaveYn)) || (applyCnt > 0 && "Y".equals(urlSaveYn))) {
                    resultMap.put("code", "1");
                    return ResponseEntity.ok(resultMap);
                }

                //이미 1차참여 후 2차참여인 경우 무조건 비바콘으로 당첨
                //기존 EVENT_JOIN_ANSWER의 EVENT_ANSWER_DESC에 UPDATE진행 후 EVENT_ROULETTE_URL_230213의 URL_EVENT_JOIN_YN UPDATE 후 종료
                if(applyCnt > 0 && org.apache.commons.lang3.StringUtils.isNotBlank(urlSaveYn) && "N".equals(urlSaveYn)) {

                    HashMap<String, String> paramForUpdate = new HashMap<String, String>();
                    paramForUpdate.put("memberId", memberId);
                    paramForUpdate.put("eventAnswerDesc", eventAnswerDesc2);
                    paramForUpdate.put("eventId", eventId);
                    saemteoService.update2ndRouletteEventJoin(paramForUpdate);
                    saemteoService.updateRouletteUrlJoinYn(paramForUpdate);


                    resultMap.put("prizeIdx", "10");
                    resultMap.put("prizeName", "비바콘 200P");
                    resultMap.put("code", "0");
                    return ResponseEntity.ok(resultMap);
                }

                if (applyCnt == 0) {
                    // 이벤트 마일리지 차감 여부 체크
                    int mileagePoint = saemteoService.getEventMileagePoint(eventId);
                    if(mileagePoint < 0) {
                        mileagePoint = Math.abs(mileagePoint);
                        int usableMileage = memberMileageService.getMemberMileageUsableAmount(memberId); // 사용가능 마일리지
                        if (usableMileage < mileagePoint) {
                            // 마일리지 부족
                            resultMap.put("code", "5");
                            return ResponseEntity.ok(resultMap);
                        }
                    }

                    int chkJoin = saemteoService.eventApplyInsert(param);
                    if (chkJoin > 0) {
                        int checkTotalVal = saemteoService.checkEventTotalJoin(eventId);
                        param.put("checkTotalVal", Integer.toString(checkTotalVal));
                        param.put("eventAnswerSeq", "1");
                        saemteoService.eventJoinAnswerInsert(param);
                    }

                    // 나머지 정보 저장
                    if (!"".equals(eventAnswerDesc2)) {

                        // 신청수량 저장
                        try {

                            HashMap<String, String> prizeResult = saemteoService.getRoulettePrize(eventId);
                            String prizeIdx = prizeResult.get("prizeIdx");
                            String prizeName = prizeResult.get("prizeName");

                            HashMap<String, String> param3 = new HashMap<String, String>();
                            param3.put("eventId", eventId);
                            param3.put("eventAnswerSeq", prizeResult.get("prizeIdx"));
                            param3.put("memberId", memberId);
                            param3.put("eventAnswerDesc", "1");

                            // seq 2 저장
                            HashMap<String, String> param2 = new HashMap<String, String>();
                            param2.put("eventId", eventId);
                            param2.put("memberId", memberId);
                            param2.put("eventAnswerDesc", eventAnswerDesc2 + prizeName);
                            param2.put("eventAnswerSeq", "2");
                            saemteoService.setEventJoinAnswerAddInsert(param2);

                            // 수량체크
//							boolean amountCheck = saemteoService.setEventJoinAnswerAddAmountChk(param3);
//							if (amountCheck) {
//								// 상품 저장
//								saemteoService.setEventJoinAnswerAddInsert(param3);
//							} else {
//								throw new Exception();
//							}

                            // 상품 저장
                            saemteoService.setEventJoinAnswerAddInsert(param3);

                            resultMap.put("prizeIdx", prizeIdx);
                            resultMap.put("prizeName", prizeName);
                            resultMap.put("code", "0");
                        } catch (Exception e) {
                            resultMap.put("code", "4");
                            resultMap.put("seq", e.getMessage());
                        }
                    } else {
                        resultMap.put("code", "0");
                    }
                    // 설문조사 최신 1개까지
                    List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
                    int surveyListSize = surveyList.size();
                    if (surveyListSize > 0) {
                        resultMap.put("surveyList", surveyList.get(0));
                    }

                    // 정상신청일 경우 마일리지 추가
                    // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                    if ("AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
                        if ("0".equals(resultMap.get("code"))) {
                            if(!addEventMileage(eventId, memberId, eventAgreeCount)) {
                                // 마일리지 적립or차감 실패
                                resultMap.put("code", "6");
                            }
                        }
                    }

                    // 이벤트 신청시 학교정보, 휴대폰 번호 변경
                    updateMyInfoSchoolInfo(requestParams, currentUser);

                } else { // 이미 신청한 경우
                    resultMap.put("code", "1");
                }
            } else {
                // 로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            // 로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 이벤트 정보
     *
     * @return
     */
    @GetMapping("/currentUser/info")
    public ResponseEntity<?> currentUserInfo(@CurrentUser UserPrincipal currentUser) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        if (currentUser != null && currentUser.getMemberId() != null && !"".equals(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("check : {}", memberId);
            if (memberId != null && StringUtils.hasText(memberId)) {
                MemberInfo memberInfo = memberService.getMemberInfo(memberId);
                resultMap.put("memberInfo", memberInfo);
            } else {
                // 로그인 필요
                resultMap.put("code", "2");
            }
        }

        return ResponseEntity.ok(resultMap);
    }


    /**
     * TODO 해당 메서드 Service의 Transation 내로 리팩토링할 것.
     * 이벤트에 등록된 마일리지 포인트 적립
     * @param eventId
     * @param memberId
     */
    public boolean addVivasamGoMileage(String eventId, String memberId) {

        boolean result = false;
        int mileagePoint = 100;

        if(mileagePoint == 0) {
            result = true;
        } else if (mileagePoint < 0) {
            mileagePoint = Math.abs(mileagePoint); //절대값으로 음수를 양수로 변경함
            Mileage mileage = new Mileage(memberId, mileagePoint, MileageCode.EVENT.getCode());
            mileage.setTargetId(eventId);
            mileage.setTargetMenu("EVENT");
            result = memberMileageService.insertMileageMinus(mileage);
        } else if (mileagePoint > 0) {
            Mileage mileage = new Mileage(memberId, mileagePoint, MileageCode.EVENT.getCode());
            mileage.setTargetId(eventId);
            mileage.setTargetMenu("EVENT");
            result = memberMileageService.insertMileagePlus(mileage);
        }

        return result;
    }

    /**
     * 비바샘이 간다 신청
     *
     * @return
     */
    @PostMapping("/insertVivasamGoApply")
    public ResponseEntity<?> insertVivasamGoApply(HttpServletRequest request, @CurrentUser UserPrincipal currentUser,
                                                  @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String receiveInfo = VivasamUtil.isNull(String.valueOf(requestParams.get("receiveInfo")));
        String visitDate1 = VivasamUtil.isNull(String.valueOf(requestParams.get("visitDate1")));
        String visitDate2 = VivasamUtil.isNull(String.valueOf(requestParams.get("visitDate2")));
        String peopleCount = VivasamUtil.isNull(String.valueOf(requestParams.get("peopleCount")));
        String reason = VivasamUtil.isNull(String.valueOf(requestParams.get("reason")));
        String reasonDetail = VivasamUtil.isNull(String.valueOf(requestParams.get("reasonDetail")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String participation = VivasamUtil.isNull(String.valueOf(requestParams.get("participation")));

        // 한 이벤트 페이지에서 참여한 이벤트의 개수
        String eventAgreeCount = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAgreeCount")), "0");

        receiveInfo = checkXSSService.ReplaceValue(request, "receiveInfo", receiveInfo);
        reason = checkXSSService.ReplaceValue(request, "reason", reason);
        reasonDetail = checkXSSService.ReplaceValue(request, "reasonDetail", reasonDetail);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        // 올해 참여 내역 조회
        Date nowDate = new Date();
        String nowYear = String.valueOf(1900 + nowDate.getYear());
        Mileage checkParam = new Mileage();
        checkParam.setMemberId(memberId);
        checkParam.setNowYear(nowYear);
        // 현재날짜를 기준으로 올해의 년도를 가지고 와서 참여기록 체크
        int checkJoinCnt = memberMileageService.checkVivasamGoForYear(checkParam);

        logger.info("==========================================");
        logger.info("insertVivasamGoApply start");
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            if (memberId.equals(currentUser.getMemberId())) {

                // 이벤트 마일리지 차감 여부 체크
                int mileagePoint = 100;
                if(mileagePoint < 0) {
                    mileagePoint = Math.abs(mileagePoint);
                    int usableMileage = memberMileageService.getMemberMileageUsableAmount(memberId); // 사용가능 마일리지
                    if (usableMileage < mileagePoint) {
                        // 마일리지 부족
                        resultMap.put("code", "5");
                        return ResponseEntity.ok(resultMap);
                    }
                }

                // 나머지 정보 저장
                if (!"".equals(receiveInfo) && !"".equals(peopleCount) || ("".equals(visitDate1) && "".equals(visitDate2))) {
                    HashMap<String, String> param = new HashMap<String, String>();

                    //날짜가 없는경우 1900-01-01로 저장안되게..
                    visitDate1 = visitDate1.equals("") ? null : visitDate1;
                    visitDate2 = visitDate2.equals("") ? null : visitDate2;

                    param.put("eventId", eventId);
                    param.put("memberId", memberId);
                    param.put("receiveInfo", receiveInfo);
                    param.put("peopleCount", peopleCount);
                    param.put("visitDate1", visitDate1);
                    param.put("visitDate2", visitDate2);
                    param.put("reason", reason);
                    param.put("reasonDetail", reasonDetail);
                    param.put("participation", participation);

                    saemteoService.saveVivasamGoEventAnswer(param);

                    resultMap.put("code", "0");
                } else {
                    resultMap.put("code", "7");
                }
                // 설문조사 최신 1개까지
                List<SurveyInfo> surveyList = saemteoService.surveyList("Y", "");
                int surveyListSize = surveyList.size();
                if (surveyListSize > 0) {
                    resultMap.put("surveyList", surveyList.get(0));
                }

                // 올해 첫 참여일 경우 마일리지 적립
                if (checkJoinCnt <= 0) {
                    // 정상신청일 경우 마일리지 추가
                    // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                    if ("AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
                        if ("0".equals(resultMap.get("code"))) {
                            if (!addVivasamGoMileage(eventId, memberId)) {
                                // 마일리지 적립or차감 실패
                                resultMap.put("code", "6");
                            }
                        }
                    }
                }

                // 이벤트 신청시 학교정보, 휴대폰 번호 변경
                updateMyInfoSchoolInfo(requestParams, currentUser);
            } else {
                // 로그인 조작
                resultMap.put("code", "3");
            }
        } else {
            // 로그인 필요
            resultMap.put("code", "2");
        }
        return ResponseEntity.ok(resultMap);
    }


    @GetMapping("/event/recommendationInfo")
    @Secured("ROLE_USER")
    public ResponseEntity<?> getRecommendatationInfo(@CurrentUser UserPrincipal currentUser) {
        if (currentUser == null || !StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("INVALID");
        }

        String memberId = currentUser.getMemberId();

        // 로그인 사용자
        MemberInfo memberInfo = memberService.getMemberInfo(memberId);

        // 가입일 정보 조회 (449이벤트)
        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn("449");

        String memberRegDateStr = memberInfo.getRegDate();
        Date memberRegDate = null;
        Date eventSdate = null;
        Date eventEdate = null;
        boolean isEndedEvent = false;
        try {
            memberRegDate = DateUtils.parseDate(memberRegDateStr, "yyyy-MM-dd");
            eventSdate = eventInfo.getEventStartDate();
            eventEdate = eventInfo.getEventEndDate();

            isEndedEvent = new Date().after(eventEdate);

        } catch (ParseException e) {
            e.printStackTrace();
        }

        // 가입일 기준 코드 구분
        String memberRegType;
        if (eventSdate.after(memberRegDate)) {
            // 기존 회원 - 이벤트 시작일 전 가입
            memberRegType = "A001";
        } else {
            // 신규 회원 - 이벤트 시작일 후 가입 시간도 비교해야 하는가?
            memberRegType = "B001";
        }

        // 1. 추천인 코드 조회
        String recommendationCode = memberRecommendationService.getRecommendationCode(memberId);

        // 2. 추천 가입인수 조회
        MemberRecommendationParameter param = new MemberRecommendationParameter();
        param.setMemberId(memberId);
        param.setPage(1);
        param.setSize(999999); //최대 사용자 전부 조회
        int recommendationCount =  memberRecommendationService.getMemberRecommendationCount(param);
        List<MemberRecommendationResult> memberRecommendationList = memberRecommendationService.getMemberRecommendationList(param);
        memberRecommendationList.forEach(MemberRecommendationResult::masking);

        // 3. 내 포인트 조회
        int totalPoint = memberRecommendationService.getTotalPoint(memberId);

        // 4. 이벤트 참가여부 조회
        int joinCnt = saemteoService.eventApplyCheck(memberId, "451");

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");
        resultMap.put("memberRegType", memberRegType);
        resultMap.put("recoCode", recommendationCode);

        resultMap.put("recommendationCount", recommendationCount);
        resultMap.put("recommendationList", memberRecommendationList);
        // 이벤트 신청후에는 잔여포인트 있더라도 0으로 표시
        resultMap.put("totalPoint", (isEndedEvent || joinCnt > 0) ? 0 : totalPoint);


        return ResponseEntity.ok(resultMap);
    }

    // 추천인코드가 유효한 값인지 확인
    @GetMapping("/checkValidReco")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkRecoCode(@RequestParam(value = "reco", defaultValue = "") String reco) {
        reco = reco.trim();
        boolean valid = memberRecommendationService.validateRecommendationCode(reco);
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("valid", valid);
        return ResponseEntity.ok(resultMap);
    }

    // 특정이벤트가 진행중인지 여부 판단, sub event 일 경우도 상관없음
    @GetMapping("/checkEventProgress")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkEventProgress(@RequestParam(value = "eventId") String eventId) {

        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn(eventId);
        if (eventInfo == null) {
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("progress", false);
            return ResponseEntity.ok(resultMap);
        }


        Date now = new Date();
        Date eventStartDate = eventInfo.getEventStartDate();
        Date eventEndDate = eventInfo.getEventEndDate();

        boolean progress = now.after(eventStartDate) && now.before(eventEndDate);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("progress", progress);
        resultMap.put("ended", now.after(eventEndDate));
        return ResponseEntity.ok(resultMap);

    }

    @PostMapping("/insertEventApply451")
    public ResponseEntity<?> insertEventApply451(
            HttpServletRequest request,
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("cellphone")));
        String eventId = VivasamUtil.isNull(String.valueOf(requestParams.get("eventId")));
        String eventAnswerDesc = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc")));
        String eventAnswerDesc2 = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc2")));
        String amountYn = VivasamUtil.isNull(String.valueOf(requestParams.get("amountYn")));
        String applyContentTotCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentTotCnt")));
        String applyContentNumbers = VivasamUtil.isNull(String.valueOf(requestParams.get("applyContentNumbers")));
        String applyTargetContentCnt = VivasamUtil.isNull(String.valueOf(requestParams.get("applyTargetContentCnt")));
        String ssn = VivasamUtil.isNull(String.valueOf(requestParams.get("ssn")));

        name = checkXSSService.ReplaceValue(request, "name", name);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);
        eventAnswerDesc = checkXSSService.ReplaceValue(request, "eventAnswerDesc", eventAnswerDesc);


        // 로그인 필요
        if (currentUser == null || !StringUtils.hasText(memberId)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        // 신규가입 회원인데 교사인증 없이 이벤트 참여했을 경우
        MemberInfo memberInfo = memberService.getMemberInfo(memberId);
        String memberRegType = getMemberRegType(memberInfo);
        if ("B001".equals(memberRegType)) {
            if ("N".equals(memberService.getMemberTeacherCertifiedYn(memberId))) {
                resultMap.put("code", "3");
                return ResponseEntity.ok(resultMap);
            }
        }

        EventJoinReqParam eventJoinReqParam = new EventJoinReqParam();
        eventJoinReqParam.setEventId(eventId);
        eventJoinReqParam.setMemberId(memberId);
        eventJoinReqParam.setEventAnswerDesc(eventAnswerDesc);
        eventJoinReqParam.setEventAnswerDesc2(eventAnswerDesc2);
        eventJoinReqParam.setSsn(ssn);
        eventJoinReqParam.setAmountMap(parseAmountMap(amountYn, applyContentTotCnt, applyContentNumbers, applyTargetContentCnt));

        try {
            saemteoService.applyEventJoin451(eventJoinReqParam);
            resultMap.put("code", "0");
        } catch (VivasamException e) {
            e.printStackTrace();
            resultMap.put("code", e.getCode());
        } catch (Exception e) {
            e.printStackTrace();
            // 알수 없는 오류
            resultMap.put("code", "99");
        }
        // 이벤트 신청시 학교정보, 휴대폰 번호 변경
        updateMyInfoSchoolInfo(requestParams, currentUser);

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/insertEventApply521")
    public ResponseEntity<?> insertEventApply521(
            HttpServletRequest request,
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String eventId = "521";
        String eventAnswerDesc2 = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc2")));

        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        // 로그인 필요
        if (currentUser == null || !StringUtils.hasText(memberId)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        // 신규가입 회원인데 교사인증 없이 이벤트 참여했을 경우
        MemberInfo memberInfo = memberService.getMemberInfo(memberId);
        String memberRegType = getMemberRegType(memberInfo);
        if ("B001".equals(memberRegType)) {
            if ("N".equals(memberService.getMemberTeacherCertifiedYn(memberId))) {
                resultMap.put("code", "3");
                return ResponseEntity.ok(resultMap);
            }
        }

        EventJoinReqParam eventJoinReqParam = new EventJoinReqParam();
        eventJoinReqParam.setEventId(eventId);
        eventJoinReqParam.setMemberId(memberId);
        eventJoinReqParam.setEventAnswerDesc2(eventAnswerDesc2);

        try {
            saemteoService.applyEventJoin521(eventJoinReqParam);
            resultMap.put("code", "0");
        } catch (VivasamException e) {
            e.printStackTrace();
            resultMap.put("code", e.getCode());
        } catch (Exception e) {
            e.printStackTrace();
            // 알수 없는 오류
            resultMap.put("code", "99");
        }

        return ResponseEntity.ok(resultMap);
    }


    private Map<String, Integer> parseAmountMap(
            String amountYn, String applyContentTotCnt, String applyContentNumbers, String applyTargetContentCnt
    ) {

        if (!"Y".equals(amountYn)) {
            return new HashMap<>();
        }

        try {
            int totCnt = Integer.parseInt(applyContentTotCnt);
            String[] strContentNumber = applyContentNumbers.split(",");
            String[] strTargetContentCnt = applyTargetContentCnt.split(",");

            Map<String, Integer> amountMap = new HashMap<>();
            if (strContentNumber.length == totCnt && strTargetContentCnt.length == totCnt) {
                for (int i = 0; i < totCnt; i++) {
                    int cnt = Integer.parseInt(strTargetContentCnt[i]);
                    if (cnt > 0) {
                        amountMap.put(strContentNumber[i], cnt);
                    }
                }
            }

            return amountMap;
        } catch (Exception e) {
            throw new VivasamException("4", "신청수량 정보가 잘못되었습니다.");
        }
    }

    private String getMemberRegType(MemberInfo memberInfo) {
        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn("449");

        String memberRegDateStr = memberInfo.getRegDate();
        Date memberRegDate = null;
        Date eventSdate = null;
        try {
            memberRegDate = DateUtils.parseDate(memberRegDateStr, "yyyy-MM-dd");
            eventSdate = eventInfo.getEventStartDate();
        } catch (ParseException e) {
            e.printStackTrace();
        }

        // 가입일 기준 코드 구분
        String memberRegType;
        if (eventSdate.after(memberRegDate)) {
            // 기존 회원 - 이벤트 시작일 전 가입
            memberRegType = "A001";
        } else {
            // 신규 회원 - 이벤트 시작일 후 가입 시간도 비교해야 하는가?
            memberRegType = "B001";
        }
        return memberRegType;
    }

    @GetMapping("/vivaJoinEventInfo")
    public ResponseEntity<?> getVivaJoinEventInfo(@CurrentUser UserPrincipal currentUser
            , @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        eventId = "477";

        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn("477");

        Map<String, Object> resultMap = new HashMap<>();

        // 실시간 학교 랭킹 3위
        // 이벤트 참여 완료한 학교 상위 3까지 -->> 학교명 및 참여 인원수
        List<EventInfo> eventJoinList = saemteoService.eventJoinList(eventId);
        logger.info("실시간 학교 랭킹 3위 eventJoinList : {}", eventJoinList);
        resultMap.put("eventJoinList", eventJoinList);

        // 로그인 했을때
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("로그인 아이디 : {}", memberId);

            // 우리학교 가입자
            List<EventInfo> ourSchJoinList = saemteoService.ourSchJoinList(eventId, memberId);
            logger.info("우리학교 가입자 수 : {}", ourSchJoinList);
            resultMap.put("ourSchJoinList", ourSchJoinList);

            // 신규 가입 체크 - 가입일
            MemberInfo memberInfo = memberService.getMemberInfo(memberId);
            String memberRegDateStr = memberInfo.getRegDate();
            String memberRegTime = memberInfo.getRegTime();
            String memRegDate = memberRegDateStr + " " + memberRegTime;
            logger.info("로그인 한 사람 가입 시간 : {}", memberRegTime);

            Date memberRegDate = null;
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm");

            try {
                memberRegDate = format.parse(memRegDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            // 가입 날짜 + 시간
            String memRegDateTime = format.format(memberRegDate);
            logger.info("로그인 한 사람의 가입 시간 : {}", memRegDateTime);
            resultMap.put("memRegDateTime", memRegDateTime);

            Date eventSDate = eventInfo.getEventStartDate();
            logger.info("eventSDate : {}", eventSDate);

            // 가입일 기준 코드 구분
            String memberRegType;
            if (eventSDate.after(memberRegDate)) {
                // 기존 회원 - 이벤트 시작일 전 가입
                memberRegType = "A001";
                logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
            } else {
                // 신규 회원 - 이벤트 시작일 후 가입
                memberRegType = "B001";
                logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
            }
            resultMap.put("memberRegType", memberRegType);
        }

        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);

    }

    @PostMapping("/recommenderCheck")
    public ResponseEntity<Map<String, Object>>  recommenderCheck(@RequestParam(value="recommender", defaultValue = "") String recommender, @CurrentUser UserPrincipal currentUser){

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");


        recommender = recommender.trim();
        String memberId = currentUser.getMemberId();

        boolean valid = saemteoService.recommenderCheck(recommender, memberId);
        if(valid){
            logger.info("추천인 코드 있는지 여부 valid : {}", valid);
            // 추천 id가 있을때 이름 가져오기
            String existRecommend = saemteoService.existRecommend(recommender);
            logger.info("추천 id 있을때 이름 가져오기 : {}", existRecommend);
            resultMap.put("existRecommend", existRecommend);
        }

        else {
            resultMap.put("code", "1");
        }
        return ResponseEntity.ok(resultMap);
    }

    // 기존 이벤트 댓글처럼 페이징처리해서 가입 학교 50순위 가져오기
    @PostMapping("/getSpecificEventAnswerList2")
    public ResponseEntity<?> getSpecificEventAnswerList2(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 매개변수 값 입력
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = (int) pageParams.get("pageSize");
        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();

        //한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우
        String answerIndex = VivasamUtil.isNull(String.valueOf(requestParams.get("answerIndex")), "0");

        List<Map<String, Object>> eventJoinAnswerList2 = saemteoService.getEventJoinAnswerList2(pageNo, pageSize, eventId, eventAnswerSeq, answerIndex);

        resultMap.put("eventJoinAnswerList2", eventJoinAnswerList2);

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/getSpecificEventAnswerCount2")
    public ResponseEntity<?> getSpecificEventAnswerCount2(@RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();
        //한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우
        String answerIndex = VivasamUtil.isNull(String.valueOf(requestParams.get("answerIndex")), "0");

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.getSpecificEventTotalJoin2(eventId, eventAnswerSeq, answerIndex);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    // 2024 새학기를 부탁해 이벤트
    @GetMapping("/getNewSemiEventInfo")
    public ResponseEntity<?> getNewSemiEventInfo(@CurrentUser UserPrincipal currentUser
            , @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        eventId = "485";

        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn("485");

        Map<String, Object> resultMap = new HashMap<>();

        // 추천 받은 선생님의 랭킹 , 이름 , 카운트
        List<EventInfo> getRecommendRankList = saemteoService.getRecommendRankList(eventId);
        logger.info("추천 받은 선생님 랭킹 : {}", getRecommendRankList);
        resultMap.put("getRecommendRankList", getRecommendRankList);

        // 로그인 했을때
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("로그인 아이디 : {}", memberId);

            // 내 랭킹
            String myRank = "N";
            for(int i = 0; i < getRecommendRankList.size(); i++){
                if (getRecommendRankList.get(i).getRecommendId().equals(memberId)) {
                    myRank = getRecommendRankList.get(i).getOrderNo();
                    break;
                }
                logger.info("@@@@@ : {}", myRank);
            }

            resultMap.put("myRank", myRank);

            // 신규 가입 체크 - 가입일
            MemberInfo memberInfo = memberService.getMemberInfo(memberId);
            String memberRegDateStr = memberInfo.getRegDate();
            String memberRegTime = memberInfo.getRegTime();
            String memRegDate = memberRegDateStr + " " + memberRegTime;
            logger.info("로그인 한 사람 가입 시간 : {}", memberRegTime);

            Date memberRegDate = null;
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm");

            try {
                memberRegDate = format.parse(memRegDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            // 가입 날짜 + 시간
            String memRegDateTime = format.format(memberRegDate);
            logger.info("로그인 한 사람의 가입 시간 : {}", memRegDateTime);
            resultMap.put("memRegDateTime", memRegDateTime);


            Date eventSDate = eventInfo.getEventStartDate();
            logger.info("eventSDate : {}", eventSDate);

            // 가입일 기준 코드 구분
            String memberRegType;
            if (eventSDate.after(memberRegDate)) {
                // 기존 회원 - 이벤트 시작일 전 가입
                memberRegType = "A001";
                logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
            } else {
                // 신규 회원 - 이벤트 시작일 후 가입
                memberRegType = "B001";
                logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
            }
            resultMap.put("memberRegType", memberRegType);
        }

        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);

    }

    // 2024 비바샘이 부탁해 (댓글처럼 페이징처리해서 추천인 선생님 랭킹 가져오기 )
    @PostMapping("/get2024EventAnswerList")
    public ResponseEntity<?> get2024EventAnswerList(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 매개변수 값 입력
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = (int) pageParams.get("pageSize");
        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();

        //한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우
        String answerIndex = VivasamUtil.isNull(String.valueOf(requestParams.get("answerIndex")), "0");

        List<Map<String, Object>> eventAnswerList = saemteoService.get2024EventAnswerList(pageNo, pageSize, eventId, eventAnswerSeq, answerIndex);

        resultMap.put("eventAnswerList", eventAnswerList);

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/get2024EventAnswerCount")
    public ResponseEntity<?> get2024EventAnswerCount(@RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();
        //한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우
        String answerIndex = VivasamUtil.isNull(String.valueOf(requestParams.get("answerIndex")), "0");

        try {
            // 정상적일시 Code 0
            // 이벤트 응모숫자 파악
            int eventAnswerCount = saemteoService.get2024EventAnswerCount(eventId, eventAnswerSeq, answerIndex);
            resultMap.put("eventAnswerCount", eventAnswerCount);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    // 2025 welcomevivasam 이벤트
	@GetMapping("/getRecommendEventInfo")
	public ResponseEntity<?> getRecommendEventInfo(@CurrentUser UserPrincipal currentUser
			, @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {
		Map<String, Object> resultMap = new HashMap<>();
		List<Map<String, String>> recommendList = null;

		// 로그인 했을때
		if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
			String memberId = currentUser.getMemberId();
			recommendList = saemteoService.getMyRecomList(memberId);
			resultMap.put("recommendList",recommendList);

			MemberInfo memberInfo = memberService.getMemberInfo(memberId);
			EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn("542");

			String memberRegDateStr = memberInfo.getRegDate();
			Date memberRegDate = null;
			Date eventSdate = null;
			try {
				memberRegDate = DateUtils.parseDate(memberRegDateStr, "yyyy-MM-dd");
				eventSdate = eventInfo.getEventStartDate();
			} catch (ParseException e) {
				e.printStackTrace();
			}

			// 가입일 기준 코드 구분
			String memberRegType;
			if (eventSdate.after(memberRegDate)) {
				// 기존 회원 - 이벤트 시작일 전 가입
				memberRegType = "A001";
			} else {
				// 신규 회원 - 이벤트 시작일 후 가입 시간도 비교해야 하는가?
				memberRegType = "B001";
			}

			resultMap.put("memberRegType", memberRegType);
		}

		resultMap.put("code", "0");
		return ResponseEntity.ok(resultMap);
	}

    // 2024 스승의날 이벤트
    @PostMapping("/get2024EventAnswerList498")
    public ResponseEntity<?> get2024EventAnswerList498(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 매개변수 값 입력
        Map<String, Object> pageParams = (Map<String, Object>) requestParams.get("answerPage");
        int pageNo = (int) pageParams.get("pageNo");
        int pageSize = (int) pageParams.get("pageSize");
        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();
        String memberId = requestParams.get("memberId").toString();

        //한 이벤트 페이지에서 특정 이벤트 참여정보만 댓글로 보여지는 경우
        String answerIndex = VivasamUtil.isNull(String.valueOf(requestParams.get("answerIndex")), "0");
        List<Map<String, Object>> eventAnswerList = saemteoService.get2024EventAnswerList498(pageNo, pageSize, eventId, eventAnswerSeq, answerIndex, memberId);

        resultMap.put("eventAnswerList", eventAnswerList);

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/makeEventLike")
    public ResponseEntity<?> makeEventLike(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        // 매개변수 값 입력
        String eventId = requestParams.get("eventId").toString();
        String memberId = requestParams.get("memberId").toString();
        String likeMemberId = requestParams.get("likeMemberId").toString();
        Boolean likeCheck = (boolean) requestParams.get("likeCheck");

        EventInfo param = new EventInfo();
        param.setEventId(eventId);
        param.setMemberId(memberId);
        param.setLikeMemberId(likeMemberId);
        param.setLikeCheck(likeCheck);

        String code = "";

        try {
            code = saemteoService.updateStateEventLike(param);
            resultMap.put("code",code);
        } catch (Exception e) {
            e.printStackTrace();
            code = "400";
            resultMap.put("code","400");
        }

        return ResponseEntity.ok(resultMap);
    }

    // 2024 모여봐요~ 비바샘! 이벤트  [ 2024년 5월 24일 ~ 2024년 6월 23일 ]
    @GetMapping("/getMyRecomCnt")
    public ResponseEntity<?> getMyRecomCnt(@CurrentUser UserPrincipal currentUser
            , @RequestParam(value = "eventId", required = false, defaultValue = "") String eventId) {

        eventId = "503";

        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn(eventId);

        Map<String, Object> resultMap = new HashMap<>();

        // 로그인 했을때
        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();
            logger.info("로그인 아이디 : {}", memberId);

            String eventJoinYn = "N";
            // 참여 여부 (504, 505이벤트)
            int eventJoinCheck = saemteoService.getEventJoinCheck(memberId);
            eventJoinYn = eventJoinCheck > 0 ? "Y" : "N";

            if ("Y".equals(eventJoinYn)) {
                // 나의 추천인 아이디 수
                int myRecomCnt = 0;
                myRecomCnt = saemteoService.getMyRecomCnt(memberId);

                resultMap.put("myRecomCnt", myRecomCnt);
            } else {
                // 로그인 0 & 이벤트 참여 x
                resultMap.put("myRecomCnt", "참여하기를 클릭 후, 동료 선생님이 추천인 ID를 입력하여 회원가입 후 교사인증을 완료하면 실시간 추천인 수에 집계됩니다.");
            }
            // 가입일 기준 코드 구분  memberRegType _ A001 / B001
            String memberRegType = getMemberRegType2(eventId, memberId);
            resultMap.put("memberRegType", memberRegType);
        }
        resultMap.put("code", "0");
        return ResponseEntity.ok(resultMap);

    }

    private String getMemberRegType2(String eventId, String memberId) {
        Map<String, Object> resultMap = new HashMap<>();

        Date memberRegDate = null;
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm");

        // 신규 가입 체크 - 가입일
        MemberInfo memberInfo = memberService.getMemberInfo(memberId);
        String memberRegDateStr = memberInfo.getRegDate();
        String memberRegTime = memberInfo.getRegTime();
        String memRegDate = memberRegDateStr + " " + memberRegTime;
        logger.info("로그인 한 사람 가입 시간 : {}", memberRegTime, eventId);

        try {
            memberRegDate = format.parse(memRegDate);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        // 가입 날짜 + 시간
        String memRegDateTime = format.format(memberRegDate);
        logger.info("로그인 한 사람의 가입 시간 : {}", memRegDateTime);
        resultMap.put("memRegDateTime", memRegDateTime);

        EventInfo eventInfo = saemteoService.getEventInfoNoMatterUseYn(eventId);
        Date eventSDate = eventInfo.getEventStartDate();
        logger.info("eventSDate : {}", eventSDate);

        // 가입일 기준 코드 구분
        String memberRegType;
        if (eventSDate.after(memberRegDate)) {
            // 기존 회원 - 이벤트 시작일 전 가입
            memberRegType = "A001";
            logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
        } else {
            // 신규 회원 - 이벤트 시작일 후 가입
            memberRegType = "B001";
            logger.info("내 가입일 기준 코드 구분 : {}", memberRegType);
        }
        return memberRegType;
    }

    @PostMapping("/getPopularCnt")
    public ResponseEntity<?> getPopularCnt(@RequestBody Map<String, Map<String, Object>> requestParamMap) {
        // RequestParamMap의 첫 키가 "0"이므로 이를 통해 한단계 빼온 후에 세팅해야 합니다.
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        String eventId = requestParams.get("eventId").toString();
        String eventAnswerSeq = requestParams.get("eventAnswerSeq").toString();

        try {
            List<EventInfo> popularCnt = saemteoService.getPopularCnt(eventId, eventAnswerSeq);
            resultMap.put("popularCnt", popularCnt);
            resultMap.put("code", "0");
        } catch (Exception e) { // Error 발생시
            e.printStackTrace();
            resultMap.put("code", "2");
        }

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/getEventVoteRank")
	public ResponseEntity<?> getEventVoteRank() {
		Map<String, Object> resultMap = new HashMap<>();

		try {
			// 정상적일시 Code 0
			// 이벤트 응모숫자 파악
			List<Map<String, Object>> voteRank = saemteoService.getEventVoteRank();
			resultMap.put("voteRank", voteRank);
			resultMap.put("code", "0");
		} catch (Exception e) { // Error 발생시
			e.printStackTrace();
			resultMap.put("code", "2");
		}

		return ResponseEntity.ok(resultMap);
	}

    @PostMapping("/insertEventApply584")
    public ResponseEntity<?> insertEventApply584(HttpServletRequest request, @CurrentUser UserPrincipal currentUser,
                                                @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();
        // 필수 항목
        String memberId = currentUser.getMemberId();
        String eventId = "584";
        String eventAnswerDesc2 = VivasamUtil.isNull(String.valueOf(requestParams.get("eventAnswerDesc2")));

        eventId = checkXSSService.ReplaceValue(request, "eventId", eventId);

        // 로그인 필요
        if (currentUser == null || !StringUtils.hasText(memberId)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        // 신규가입 회원인데 교사인증 없이 이벤트 참여했을 경우
        MemberInfo memberInfo = memberService.getMemberInfo(memberId);
        String memberRegType = getMemberRegType(memberInfo);
        if ("B001".equals(memberRegType)) {
            if ("N".equals(memberService.getMemberTeacherCertifiedYn(memberId))) {
                resultMap.put("code", "3");
                return ResponseEntity.ok(resultMap);
            }
        }

        EventJoinReqParam eventJoinReqParam = new EventJoinReqParam();
        eventJoinReqParam.setEventId(eventId);
        eventJoinReqParam.setMemberId(memberId);
        eventJoinReqParam.setEventAnswerDesc2(eventAnswerDesc2);

        try {
            saemteoService.applyEventJoin584(eventJoinReqParam);
            resultMap.put("code", "0");
        } catch (VivasamException e) {
            e.printStackTrace();
            resultMap.put("code", e.getCode());
        } catch (Exception e) {
            e.printStackTrace();
            // 알수 없는 오류
            resultMap.put("code", "99");
        }

        return ResponseEntity.ok(resultMap);
    }
}