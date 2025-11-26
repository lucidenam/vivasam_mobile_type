package edu.visang.vivasam.common.controller;

import edu.visang.vivasam.common.constant.PointConstant;
import edu.visang.vivasam.common.model.ConvertedDocCondition;
import edu.visang.vivasam.common.model.DocumentContentInfo;
import edu.visang.vivasam.common.model.PointInfo;
import edu.visang.vivasam.common.model.PushAlarms;
import edu.visang.vivasam.common.service.CommonService;
import edu.visang.vivasam.common.service.LogService;
import edu.visang.vivasam.member.service.MemberService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.*;

@RestController
@RequestMapping("/api/common")
public class CommonController {
    private static final Logger logger = LoggerFactory.getLogger(CommonController.class);

    @Autowired
    CommonService commonService;

    @Autowired
    LogService logService;

    @Autowired
    MemberService memberService;

    @GetMapping("/info")
    public ResponseEntity<?> info(@RequestHeader(value = "x-requested-with", required = false) String requestedWith, HttpServletRequest request) {
        logger.info("HTTP_X_REQUESTED_WITH: {}", requestedWith);

        Map<String,Object> resultMap = new HashMap<>();
        resultMap.put("requestedWith", requestedWith);

        return ResponseEntity.ok(resultMap);
    }

    @GetMapping("/vscodeList")
        public List<Map<String, Object>> subjectList(@RequestParam(value = "code", required = true) String code, @CurrentUser UserPrincipal currentUser) {
            List<Map<String, Object>> vscodeList = commonService.vscodeList(code);
            if ("QA000".equals(code)) {
                List<Map<String, Object>> vscodeNewList = new ArrayList<>();
                for (int i=0; i<vscodeList.size(); i++) {
                    if (!"QA023".equals(vscodeList.get(i).get("codeId"))) {
                        vscodeNewList.add(vscodeList.get(i));
                    }
                }
                vscodeList = vscodeNewList;

                if (currentUser != null) {
                    String renewYn = memberService.getMemberTeacherCertifiedCheckYn(currentUser.getMemberId());
                    List<Map<String, Object>> top_list = new ArrayList<>();
                    if (renewYn.equals("Y")) {
                        for (int i=0; i<vscodeList.size(); i++) {
                            if ("QA001".equals(vscodeList.get(i).get("codeId")) || "QA003".equals(vscodeList.get(i).get("codeId")) || "QA011".equals(vscodeList.get(i).get("codeId"))) {
                                top_list.add(vscodeList.get(i));
                            }
                        }
                        vscodeList = top_list;
                    }
                }
            }
            return vscodeList;
    }

    @GetMapping("/codeList")
    public List<Map<String, Object>> codeList(@RequestParam(value = "grpCode") String grpCode
                                            , @RequestParam(value = "refCode", required = false) String refCode) {
        return commonService.codeList(grpCode, refCode);
    }

    @GetMapping("/subjectList")
    public List<Map<String, Object>> subjectCodeList(@RequestParam(value = "schLvlCd") String schLvlCd) {
        return commonService.subjectCodeList(schLvlCd);
    }

    /**
     * 교과 상세뷰 문서 변환 이미지 목록
     * @param contentGubun
     * @param contentId
     * @return
     */
    @GetMapping("/convertedDocumentList")
    public ResponseEntity<?> convertedDocumentList(@RequestParam(value = "contentGubun", required = false, defaultValue="") String contentGubun,
                                                   @RequestParam(value = "contentId", required = false, defaultValue = "") String contentId) {

        ConvertedDocCondition cdc = new ConvertedDocCondition();
        cdc.setMediaGubun(contentGubun);
        cdc.setMediaId(contentId);
        List<ConvertedDocCondition> convertedDocumentList;
        if ("CN070".equals(contentGubun)) {
            convertedDocumentList = commonService.convertedSmartDocumentList(cdc);
        }else{
            convertedDocumentList = commonService.convertedDocumentList(cdc);
        }
        Map<String,Object> resultMap = new HashMap<>();
        if (convertedDocumentList != null && convertedDocumentList.size() > 0 ) {
            resultMap.put("code","0");
            resultMap.put("content",convertedDocumentList);
        }else{
            resultMap.put("code","0");
            // 데이터가 없는 경우 자료 미리보기 준비중으로 셋팅해준다.
            ConvertedDocCondition noData = new ConvertedDocCondition();
            noData.setFileCdnYn("N");
            noData.setThumbnailPath("https://www.vivasam.com/resources/images/viewer/noimage2.png");
            noData.setFilePath("https://www.vivasam.com/resources/images/viewer/noimage2.png");
            convertedDocumentList.add(noData);

            resultMap.put("content",convertedDocumentList);
        }
        return ResponseEntity.ok(resultMap);
    }


    /**
     * 뷰어 평가자료 여부 체크
     * @param contentGubun
     * @param contentId
     * @return
     */
    @GetMapping("/contentCheck")
    public ResponseEntity<?> contentCheck(@CurrentUser UserPrincipal currentUser,
                                          @RequestParam(value = "contentGubun", required = false, defaultValue="") String contentGubun,
                                          @RequestParam(value = "contentId", required = false, defaultValue = "") String contentId) {

        Map<String,Object> resultMap = new HashMap<>();
        if(currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {

            int chkCount = commonService.getContentMemLevelCheck(contentGubun, contentId);
            //준회원 제한
            if ("AU400".equals(currentUser.getMLevel()) &&  chkCount > 0) {
                resultMap.put("code", "1");
            }else{
                resultMap.put("code","0");
            }
        }else {
            //로그인 필요
            resultMap.put("code","2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 뷰어 포인트 적립
     * @param contentGubun
     * @param contentId
     * @return
     */
    @GetMapping("/applyPoint/viewer")
    public ResponseEntity<?> addPointViewer(@CurrentUser UserPrincipal currentUser,
                                       @RequestParam(value = "contentGubun", required = false, defaultValue="") String contentGubun,
                                       @RequestParam(value = "contentId", required = false, defaultValue = "") String contentId) {

        Map<String,Object> resultMap = new HashMap<>();

        if(currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();

            PointInfo point = new PointInfo();
            point.setActionType(PointConstant.AC_VIEW_CONTENTS);
            point.setContentType(contentGubun);
            point.setContentId(String.valueOf(contentId));
            point.setMemberId(memberId);

            try {
                commonService.applyPoint(point);
                resultMap.put("code","0");
            } catch (Exception e) {
                logger.info("이미 열람포인트가 등록된 컨텐츠!");
                resultMap.put("code","1");
            }
        }else {
            //로그인 필요
            resultMap.put("code","2");
        }
        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/setPushAlarms")
    @Secured("ROLE_USER")
    public ResponseEntity<?> setPushAlarms(@CurrentUser UserPrincipal currentUser,
                                          @RequestBody PushAlarms pushAlarms) {

        pushAlarms.setMemberId(currentUser.getMemberId());
        String resultCode = null;
        if(commonService.setPushAlarms(pushAlarms) > 0) {
            resultCode = "SUCCESS";
        }else {
            resultCode = "ERROR";
        }

        return ResponseEntity.ok(resultCode);
    }

    @GetMapping("/getPushAlarms")
    @Secured("ROLE_USER")
    public ResponseEntity<?> getPushAlarms(@CurrentUser UserPrincipal currentUser) {
        PushAlarms pushAlarms = commonService.getPushAlarms(currentUser.getMemberId());

        return ResponseEntity.ok(pushAlarms);
    }

    @PostMapping("/insertMaterialViewLog")
    @Secured("ROLE_USER")
    public void insertMaterialViewLog(@CurrentUser UserPrincipal currentUser, @RequestBody Map<String, String> requestParams ) {
        String memberId = currentUser.getMemberId();
        String contentId = requestParams.get("contentId");

        if(StringUtils.isEmpty(memberId) || StringUtils.isEmpty(contentId)) {
            return;
        }
        logService.logMaterialView(memberId, contentId);
    }

    @RequestMapping("/mobileEvent")
    public void mobile_event(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println("<?xml version=\"1.0\" encoding=\"UTF-8\"?><axis-app><error>0</error><message></message></axis-app>");
        out.close();
        out.flush();
    }

    /**
     * 네이티브 보안 체크용 API
     * @param sha1
     * @return
     */
    @GetMapping("/check/native/sha1")
    public Boolean checkNativeString(@RequestParam(value = "sha1", required = false, defaultValue = "") String sha1) {
        String originSha1 = "8D:4F:6A:41:38:37:0B:98:13:92:47:57:32:3C:6A:D2:92:12:82:A5";
        String originSha2 = "DC:15:55:C4:2D:6D:F8:DC:0A:AB:E5:46:06:7D:FB:6D:D5:2A:F8:EA";
        String originSha3 = "dfff7f1dd4f8a5914d4d5ea33584c00484a80e19f53b062eb960745113310975";
        byte[] decodedBytes = Base64.getDecoder().decode(sha1);
        String decodedStr = new String(decodedBytes);

        boolean result1 = originSha1.equals(decodedStr);
        boolean result2 = originSha2.equals(decodedStr);
        boolean result3 = originSha3.equals(sha1);
        if (result1 || result2 || result3) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 교과 상세뷰 문서 컨텐츠 정보
     *
     * @param contentGubun
     * @param contentId
     * @return
     */
    @GetMapping("/documentContentInfo")
    public ResponseEntity<?> documentContentInfo(
            @RequestParam(value = "contentGubun", required = false, defaultValue = "") String contentGubun,
            @RequestParam(value = "contentId", required = false, defaultValue = "") String contentId) {

        DocumentContentInfo dci = new DocumentContentInfo();
        dci.setContentGubun(contentGubun);
        dci.setContentId(contentId);
        DocumentContentInfo documentContentInfo = commonService.getDocumentContentInfo(dci);

        Map<String, Object> resultMap = new HashMap<>();
        if (documentContentInfo != null) {
            resultMap.put("code", "0");
            resultMap.put("content", documentContentInfo);
        } else {
            resultMap.put("code", "1");
        }
        return ResponseEntity.ok(resultMap);
    }
}
