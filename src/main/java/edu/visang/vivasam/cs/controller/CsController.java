package edu.visang.vivasam.cs.controller;

import edu.visang.vivasam.common.service.CheckXSSService;
import edu.visang.vivasam.cs.service.CsService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cs")
public class CsController {

    private static final Logger logger = LoggerFactory.getLogger(CsController.class);

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @Autowired
    CsService csService;

    @Autowired
    CheckXSSService checkXSSService;

    @RequestMapping(value="/qnaInsert")
    public ResponseEntity<?> checkEventJoin(  HttpServletRequest request,
                                              @RequestParam(value = "qnaCd", required = true) String qnaCd,
                                              @RequestParam(value = "member_id", required = true) String member_id,
                                              @RequestParam(value = "qnaTitle", required = true) String qnaTitle,
                                              @RequestParam(value = "qnaContents", required = true) String qnaContents,
                                              @RequestParam(value = "qnaSchLvlCd", required = false, defaultValue = "") String qnaSchLvlCd,
                                              @RequestParam(value = "qnaSubjectCd", required = false, defaultValue = "") String qnaSubjectCd,
                                              @RequestParam(value = "qnaTextBookCd", required = false, defaultValue = "") String qnaTextBookCd,
                                              @RequestParam(value = "qnaHighUnitCd", required = false, defaultValue = "") String qnaHighUnitCd,
                                              @RequestParam(value = "qnaKindCd", required = false, defaultValue = "") String qnaKindCd,
                                              @RequestParam(value = "qnaUnitTitle", required = false, defaultValue = "") String qnaUnitTitle,
                                              @RequestParam(value = "qnaCallYn", required = false, defaultValue = "") String qnaCallYn,
                                              @RequestParam(value = "qnaCallType", required = false, defaultValue = "") String qnaCallType,
                                              @RequestParam(value = "qnaUseYn", required = false, defaultValue = "") String qnaUseYn,
                                              @RequestParam(value = "reqDataCd", required = false, defaultValue = "") String reqDataCd) throws Exception {

        qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", qnaTitle);
        qnaContents = checkXSSService.ReplaceValue(request, "qnaContents", qnaContents);
        qnaUnitTitle = checkXSSService.ReplaceValue(request, "qnaUnitTitle", qnaUnitTitle);

        Map<String,String> resultMap = new HashMap<>();
        String regIp = request.getRemoteAddr();
        try {
            int updateCount = csService.cQnaInsert(member_id, qnaCd, qnaTitle, qnaContents,
                    qnaSchLvlCd, qnaSubjectCd, qnaTextBookCd, qnaHighUnitCd, qnaKindCd, qnaUnitTitle, regIp, qnaCallYn, qnaCallType, qnaUseYn, reqDataCd);
            logger.error("TEST updateCount : " + updateCount);
            resultMap.put("code","0000");
            resultMap.put("qnaId", updateCount + "") ;
            resultMap.put("msg","성공");
        } catch (Exception e) {
            resultMap.put("code","1111");
            resultMap.put("msg","실패");
            logger.error(e.toString());
        }

        return ResponseEntity.ok(resultMap);
    }



    /**
     * 고객센터 > 공지사항 > 목록
     *
     * @param page
     * @param size
     * @param noticeId
     * @param srchCategory
     * @return
     */
    @GetMapping(value="/noticeList")
    public ResponseEntity<?> noticeList(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "noticeId", required = false) String noticeId,
            @RequestParam(value = "srchCate", required = false) String srchCategory) {

        Page<Map<String, Object>> list = csService.noticeList(page, size, noticeId, srchCategory);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(list);

        return ResponseEntity.ok(resources);
    }

    /**
     * 고객센터 > 공지사항 > 상세
     *
     * @param noticeId
     * @return
     */
    @GetMapping(value="/notice/{noticeId}")
    public ResponseEntity<?> noticeView(@PathVariable String noticeId,@CurrentUser UserPrincipal currentUser) {
        Map<String, Object> notice = csService.noticeView(noticeId);
        if (currentUser != null) {
            int cnt = csService.getMemberNoticeCnt(noticeId,currentUser.getMemberId());
            if (cnt < 1) csService.insertNoticeCheck(noticeId,currentUser.getMemberId());
            else csService.updateNoticeCheck(noticeId,currentUser.getMemberId());
        }
        return ResponseEntity.ok(notice);
    }


    /**
     * 고객센터 > 문의하기
     * @param request
     * @param requestMap
     * @param currentUser
     * @return
     * @throws Exception
     */
    @RequestMapping(value="/qnaNew", method=RequestMethod.POST)
    public ResponseEntity<?> insertQna(  HttpServletRequest request,
                                         @RequestBody Map<String, String> requestMap,
                                         @CurrentUser UserPrincipal currentUser) throws Exception {

        String qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", requestMap.get("qnaTitle"));
        String qnaContents = checkXSSService.ReplaceValue(request, "qnaContents", requestMap.get("qnaContents"));

        Map<String,String> resultMap = new HashMap<>();
        String regIp = request.getRemoteAddr();
        try {
            int updateCount = csService.cQnaInsert(currentUser.getMemberId(), requestMap.get("qnaCd"),
                    qnaTitle, qnaContents,
                    requestMap.get("qnaSchLvlCd"), requestMap.get("qnaSubjectCd"),
                    null, null, null, null, regIp, requestMap.get("qnaCall"), requestMap.get("qnaCallTime"), requestMap.get("useYn"), requestMap.get("reqDataCd"));

            logger.error("TEST updateCount : " + updateCount);
            resultMap.put("code","0000");
            resultMap.put("qnaId", updateCount + "") ;
            resultMap.put("msg","성공");
        } catch (Exception e) {
            resultMap.put("code","1111");
            resultMap.put("msg","실패");
            logger.error(e.getMessage());
        }

        return ResponseEntity.ok(resultMap);
    }

    @RequestMapping(value="/qnaFileInsert", method=RequestMethod.POST)
    public ResponseEntity<?> fileInsertQna(  HttpServletRequest request,
                                         @RequestBody Map<String, String> requestMap,
                                         @CurrentUser UserPrincipal currentUser) throws Exception {

        Map<String,String> resultMap = new HashMap<>();

        try {
            int updateCount = csService.cQnaFileInsert(requestMap.get("qnaId"), requestMap.get("orgFileName"), requestMap.get("realFileName"), requestMap.get("fileSize"), requestMap.get("fileGrpCd"));
            resultMap.put("code","0000");
            resultMap.put("msg","성공");
        } catch (Exception e) {
            resultMap.put("code","1111");
            resultMap.put("msg","실패");
            logger.error(e.toString());
        }
        return ResponseEntity.ok(resultMap);
    }


    /**
     * 고객센터 > 내 문의내역 > 목록
     *
     * @param page
     * @param size
     * @param srchFilter
     * @param currentUser
     * @return
     */
    @GetMapping(value="/qna")
    public ResponseEntity<?> qnaList(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "srchFilter", defaultValue = "SITE_QNA") String srchFilter,
            @CurrentUser UserPrincipal currentUser) {

            logger.info("currentUser : {}", currentUser);

            Page<Map<String, Object>> list = null;
            if("ALL".equals(srchFilter)) srchFilter = "";
            /*
            switch (srchFilter) {
                case "REQ_DATA" :
                    if(page == 0) page = 1;
                    list = csService.reqDataList(page, size, currentUser.getMemberId());
                    break;
                case "QBANK_ERROR" :
                    if(page == 0) page = 1;
                    //TODO 문제은행 항목 오류 - dbo.SP_QBANK_MY_ERROR_LIST
                    list = csService.qnaList(page, size, currentUser.getMemberId(), null);
                    break;
                default :
                    break;
            }*/
            list = csService.qnaList(page, size, currentUser.getMemberId(), srchFilter);

            Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(list);

            return ResponseEntity.ok(resources);
    }

    /**
     * 고객센터 > 내 문의내역 > 상세
     *
     * @param qnaId
     * @return
     */
    @GetMapping(value="/qna/{qnaId}")
    public ResponseEntity<?> qnaView(@PathVariable String qnaId,
                                     @RequestParam(value = "srchFilter", defaultValue = "SITE_QNA") String srchFilter,
                                     @CurrentUser UserPrincipal currentUser) {

        logger.info("currentUser : {}", currentUser);

        Map<String, Object> qna = null;

        switch (srchFilter) {
            case "REQ_DATA" :
                qna = csService.reqDataView(currentUser.getMemberId(), qnaId);
                break;
            case "QBANK_ERROR" :
                //TODO 문제은행 항목 오류
                qna = csService.qnaView(qnaId);
                break;
            default :
                qna = csService.qnaView(qnaId);
                if(currentUser == null) return ResponseEntity.ok(qna);
                if (qna.get("answer") != null) {
                    qna.put("answer", String.valueOf(qna.get("answer")).replace("\n", "<br>"));
                }
                
                /*
                 * ISMS 매개변수 조작 조치
                 * 2021-02-18 김인수
                 * */
                if(!qna.get("regId").toString().equals(currentUser.getMemberId())) {
                	qna = null;
                }
                break;
        }
        csService.updateQnaCheck(qnaId);
        return ResponseEntity.ok(qna);
    }

    /**
     * 고객센터 > 주변 지사 찾기 > 시/도 목록
     *
     * @param codeflag
     * @param pkcode
     * @return
     */
    @GetMapping(value="/contact/sidoList")
    public ResponseEntity<?> sidoList(@RequestParam(value = "codeflag", defaultValue = "B") String codeflag,
                                      @RequestParam(value = "pkcode", required = false) String pkcode) {
        List<Map<String, Object>> list = csService.sidoCodeList(codeflag, pkcode);
        return ResponseEntity.ok(list);
    }

    /**
     * 고객센터 > 주변 지사 찾기 > 지사 목록
     *
     * @param page
     * @param size
     * @param pkcode
     * @return
     */
    @GetMapping(value="/contactList")
    public ResponseEntity<?> contactList(@RequestParam(value = "page", defaultValue = "0") int page,
                                        @RequestParam(value = "size", defaultValue = "10") int size,
                                        @RequestParam(value = "pkcode", required = false) String pkcode) {
        Page<Map<String, Object>> list = csService.contactList(page, size, pkcode);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(list);
        return ResponseEntity.ok(resources);
    }

    /**
     * 고객센터 > 주변 지사 찾기 > 지사 전체 목록(지도 마커용)
     * @return
     */
    @GetMapping(value="/contact/all")
    public ResponseEntity<?> allContactList() {
        return ResponseEntity.ok(csService.allContactList());
    }
}
