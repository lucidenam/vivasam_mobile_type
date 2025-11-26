package edu.visang.vivasam.myClassInfo.controller;

import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.educourse.service.EducourseService;
import edu.visang.vivasam.exception.VivasamException;
import edu.visang.vivasam.member.model.MemberInfo;
import edu.visang.vivasam.myClassInfo.service.MyClassInfoService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static org.springframework.data.repository.init.ResourceReader.Type.JSON;

@RestController
@RequestMapping("/api/myClass")
public class MyClassInfoController {
    public static final Logger logger = LoggerFactory.getLogger(MyClassInfoController.class);

    private String strMainEsSubjectCd = "SC108,SC109,SC111,SC112"; //음,미,체,실
    private String strMainMsHsSubjectCd = "SC100,SC101,SC102,SC103,SC106,SC104,SC105,SC107,SC108,SC109.SC110,SC111,SC112,SC113,SC114"; //국,영,수,사,역사,과, 체육,실과,진로와 직업,정보


    @Autowired
    MyClassInfoService myClassInfoService;
    @Autowired
    EducourseService educourseService;
    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;
    /**
     * 내교과서 조회
     * @param user
     * @return
     */
    @GetMapping("/myTextBookInfoList")
    @Secured("ROLE_USER")
    public List<Map<String, Object>> myTextBookInfoList(@CurrentUser UserPrincipal user) {
        return myClassInfoService.myTextBookInfoList(user.getMemberId());
    }

    /**
     * 나의 학교급,과목 (대표,추가) 조회
     * @param user
     * @return
     */
    @GetMapping("/myClassInfo")
    @Secured("ROLE_USER")
    public Map<String, String> memberInfo(@CurrentUser UserPrincipal user) {

        Map<String, String> myClassInfo = new HashMap<>();

        if(user == null) {
            return myClassInfo;
        }

        myClassInfo.put("memberId",user.getMemberId());
        myClassInfo.put("schoolLvlCd", user.getSchoolLvlCd());
        myClassInfo.put("schoolName", user.getSchoolName());
        myClassInfo.put("mainSubject", user.getMainSubject());
        myClassInfo.put("mainSubjectName", user.getMainSubjectName());
        myClassInfo.put("mainCourseCd", myClassInfoService.getCourseCdInfo(user.getMainSubjectName(), user.getSchoolLvlCd()));
        myClassInfo.put("secondSubject", user.getSecondSubject());
        myClassInfo.put("secondSubjectName", user.getSecondSubjectName());
        //myClassInfo.put("secondCourseCd", myClassInfoService.getCourseCdInfo(user.getSecondSubjectName(), user.getSecondSubject()));
        if(StringUtils.hasText(user.getMyGrade())) {
            String myGrades = user.getMyGrade().replaceAll(" ", "");
            myClassInfo.put("myGrades", myGrades);
            myClassInfo.put("myGrade", Collections.max(Arrays.asList(myGrades.split("\\,"))));
        }else {
            myClassInfo.put("myGrades", "");
            myClassInfo.put("myGrade", "");
        }

        return myClassInfo;
    }

    /**
     * 추천교과 자료
     * @param
     * @return
     */
    @GetMapping("/recommendSubjectList")
    @Secured("ROLE_USER")
    public Map<String, Object> recommendSubjectList(@CurrentUser UserPrincipal user) {
        //TODO
        //1. 비바샘 웹사이트>메인>이달의 교과자료 데이터와 연동하여 각 학교급별/교과별 자로 추천 (3개)
        //2. 최근 3개월간 업데이트 자료  (2개)      - 최근 업데이트 자료 없을 시 1.기준 자료로 노출
        //--->현재 as-is 추천 교과자료와 동일, 최근업데이트 자료가 뭔지 확인 후 쿼리 수정 or 소스 수정이 필요함


        // 회원 대표 과목 코드 정보
        String mainSubjectCd = "";

        String memberId = "";
        String schoolLvlCd = "";
        String myGrade = ""; //담당학년
        String mainContentSchoolLvlCd = ""; //학교급 정보가 없는 경우 메인 컨텐츠 정보 조회를 위한 임시 학교급 코드 변수
        String mainContentSubjectCd = ""; // 메인 컨텐츠 정보 노출용 과목 코드 정보
        String mLevel = ""; //회원레벨
        MemberInfo memInfo = new MemberInfo();
        if (user != null) {
            //수정요망
            memberId = VivasamUtil.isNull(user.getMemberId(),"");
            mLevel = VivasamUtil.isNull(user.getMLevel(), "");
            //학급별 교과 기준의 대표 교과 코드가 아닌 전체 학급 기준(과목 카페)의 교과 코드임
            mainSubjectCd = VivasamUtil.isNull(user.getMainSubject(), ""); //SC1??


            //회원 정보 조회
            memInfo = myClassInfoService.getMemberInfo(memberId);

            myGrade = memInfo.getMyGrade();
            //학교급코드(ES : 초등, MS : 중등, HS : 고등 | DBO.CODELIST WHERE CODEGROUP_ID = '101') // BS : 초등(기타), IS : 중등(기타), US : 고등(기타)
            schoolLvlCd = VivasamUtil.isNull((memInfo.getSchFlag() != null && !memInfo.getSchFlag().equals("") ? memInfo.getSchFlag() + "S" : ""), "");

            //메인 컨텐츠 정보 조회용 학교급 코드 설정, 회원정보에 학교급 정보가 설정된 경우
            if (!"".equals(schoolLvlCd)) {
                mainContentSchoolLvlCd = schoolLvlCd;
                mainContentSubjectCd = memInfo.getMainSubject();
            }

            logger.info("-0 .mainSubjectCd ---------------------------------------------> {}", mainSubjectCd);
            logger.info("-0 .mainContentSchoolLvlCd -------------------------------------> {}", mainContentSchoolLvlCd);
            logger.info("-0 .mainContentSubjectCd ------------------------------------->  {}", mainContentSubjectCd);

            //회원의 대표과목이 미설정 상태인 경우
            if (!"".equals(mainContentSchoolLvlCd) && !"".equals(mainSubjectCd)) {
                mainContentSubjectCd = getMainContentSubjectCd(mainContentSchoolLvlCd, mainSubjectCd);
            }
            logger.info("3 .mainSubjectCd ---------------------------------------------> {}", mainSubjectCd);
            logger.info("3 .mainContentSchoolLvlCd -------------------------------------> {}", mainContentSchoolLvlCd);
            logger.info("3 .mainContentSubjectCd -------------------------------------> {}", mainContentSubjectCd);
        }

        if ("".equals(schoolLvlCd) || "".equals(mainSubjectCd)) {
            mainContentSubjectCd = getMainContentSubjectCd(mainContentSchoolLvlCd, mainSubjectCd);
        }

        mainContentSubjectCd = this.getSchoolLvlCd(mainContentSubjectCd);

        // 메인 컨텐츠 자료 생성
        List<Map<String,Object>> recommendSubjectList = myClassInfoService.rRecommendArea(mainContentSubjectCd,"A");

        logger.info(" recommendSubjectList ---------------------------------------------> {}", recommendSubjectList);

        Map<String, Object> result = new HashMap<>();
        Map<String, String> subjectInfo = new HashMap<>();
        subjectInfo.put("schoolLvlCd", schoolLvlCd);
        subjectInfo.put("subjectCd", mainContentSubjectCd);
        result.put("recommendSubjects", recommendSubjectList);
        result.put("subjectInfo", subjectInfo);

        return result;
    }


    private String getSchoolLvlCd(String schoolLvlCd) {
        if(schoolLvlCd == null) {
            return null;
        }
        switch (schoolLvlCd) {
            case "BS" :
                schoolLvlCd = "ES";
                break;
            case "IS" :
                schoolLvlCd = "MS";
                break;
            case "US" :
                schoolLvlCd = "HS";
                break;
        }
        return schoolLvlCd;
    }

    /*
     * 메인 컨텐츠 학교급에 따라 과목코드 리턴
     * */
    private String getMainContentSubjectCd(String schoolLvlCd, String mainSubjectCd) {
        String mainContentSubjectCd = "";

        // 기타 학교급 처리
        schoolLvlCd = this.getSchoolLvlCd(schoolLvlCd);

        //회원의 대표과목이 미설정 상태인 경우
        if ("".equals(mainSubjectCd)) {
            //아래 로직에서 처리
        }
        //회원의 대표과목이 설정 상태인 경우
        else {

            logger.info("0.mainSubjectCd : {}", mainSubjectCd);
            logger.info("0.mainContentSubjectCd : {}", mainContentSubjectCd);
            logger.info("0.schoolLvlCd : {}", schoolLvlCd);

            if (mainSubjectCd.indexOf("SC1") == -1) {
                mainContentSubjectCd = mainSubjectCd;
            }
            //회원의 대표과목이 음,미,체,실/국,영,수,사,역사,과(SC1??)에 포함된 경우 메인 컨텐츠용 과목 코드(SC3??)를 조회함.
            else if (("ES".equals(schoolLvlCd) && strMainEsSubjectCd.indexOf(mainSubjectCd) > 0) || (!"ES".equals(schoolLvlCd) && strMainMsHsSubjectCd.indexOf(mainSubjectCd) >= 0)) {
                //전체 학급 기준(과목 카페)의 교과 코드를 학급별 교과 코드(SC3??)로 변환

                mainContentSubjectCd = educourseService.getEduCourseSubjectCd(schoolLvlCd, mainSubjectCd);
            }
            else {
    				/*
    				//중등 회원의 대표과목이 국,영,수,사,역사,과에 포함 안된 경우 메인 컨텐츠용 과목 코드를 기타 코드로 설정
    				if ("MS".equals(schoolLvlCd)) {
    					mainContentSubjectCd =  Vivasam_Constant.MS_ETC_SUBJECT_GRP_CD; //SC369
    				}
    				else {
    					mainContentSubjectCd =  Vivasam_Constant.HS_ETC_SUBJECT_GRP_CD; //SC379, 고등 기타는 삭제
    				}
    				*/
            }
        }

        logger.info("5.mainSubjectCd : {}", mainSubjectCd);
        logger.info("5.mainContentSubjectCd : {}", mainContentSubjectCd);
        logger.info("5.schoolLvlCd : {}", schoolLvlCd);

        //회원의 대표과목이 미설정 상태인 경우 또는 설정했지만 고등이면서 회원의 대표과목이 국,영,수,사,역사,과에 포함 안된 경우
        if ("".equals(mainContentSubjectCd)) {
            if ("ES".equals(schoolLvlCd)) {
                //int rndNum = (int) (Math.random() * 4) + 1; //음,미,체,실 네 과목으로 랜덤 처리

                //대표과목을 랜덤으로 처리하여 메인 컨텐츠용 과목 코드SC3??)를 조회함.
                mainContentSubjectCd = "GS001";

            }
            else {
                int rndNum = (int) (Math.random() * 6) + 1; //기타를 제외한 국,영,수,사,역사,과 여섯 과목으로 랜덤 처리

                //대표과목을 랜덤으로 처리하여 메인 컨텐츠용 과목 코드SC3??)를 조회함.
                mainContentSubjectCd = educourseService.getEduCourseSubjectCd(schoolLvlCd, strMainMsHsSubjectCd.split(",")[rndNum - 1]);
            }
        }

        logger.info("2.mainSubjectCd : {}", mainSubjectCd);
        logger.info("2.mainContentSubjectCd {}", mainContentSubjectCd);
        logger.info("2.schoolLvlCd : {}", schoolLvlCd);

        if ("ES".equals(schoolLvlCd)){
            mainContentSubjectCd = "GS001";
        }

        return mainContentSubjectCd;
    }


    /*
     * 메인 컨텐츠 학교급코드 리턴(비로그인 또는 설정 정보가 없을 경우)
     * */
    private String getMainContentSchoolLvlCd() {
        String mainContentSchoolLvlCd = "";

        int rndNum = (int) (Math.random() * 3) + 1;

        if (rndNum == 1)
            //mainContentSchoolLvlCd = "ES";
            mainContentSchoolLvlCd = "MS";
        else if (rndNum == 2)
            mainContentSchoolLvlCd = "MS";
        else if (rndNum == 3)
            mainContentSchoolLvlCd = "HS";

        return mainContentSchoolLvlCd;
    }



    /**
     * 나의 교실 > 내 교과 설정(설정대상 교과목조회)
     * @return
     * @throws Exception
     */
    /*@GetMapping("/getAllSubjectList")
    @Secured("ROLE_USER")
    public List<Map<String,Object>> rTextbookList(@CurrentUser UserPrincipal user) {
        //103 코드 그룹 기준 교과목 정보 조회    --->오른쪽에 있는거 selectbox
        List<Map<String,Object>> subjectList = myClassInfoService.rSubjectList();

        String courseInfo = myClassInfoService.getCourseCdInfo(user.getMainSubjectName(), user.getMainSubject());

        String[] courseArr = courseInfo.split("\\|");

        //설정할 교과서 정보 조회----->오른쪽에 있는 설정할 교과조회 +버튼 대상
        List<Map<String,Object>> textbookList = myClassInfoService.rTextbookList(courseArr[0], courseArr[1], courseArr[2], user.getMemberId());

        return textbookList;
    }*/


    //나의 교실 > 내 교과서 설정 > 설정할 교과서 정보 조회(p63 2E)
    @GetMapping(value = "getTextbookListByCourse")
    @Secured("ROLE_USER")
    public List<Map<String,Object>> getTextbookListByCourse(@RequestParam(value = "courseCd", required = true) String courseCd,
                                                            @RequestParam(value = "mdValue", required = false) String mdValue,
                                                                    @CurrentUser UserPrincipal user) {
        if ("전체".equals(mdValue)) {
            mdValue = null;
        } else if ("22 개정".equals(mdValue)) {
            mdValue = "2022";
        } else if ("15 개정".equals(mdValue)) {
            mdValue = "2015";
        } else {
            mdValue = null;
        }
        List<Map<String,Object>> textbookList = myClassInfoService.getTextbookListByCourse(courseCd, user.getMemberId(),mdValue);
        //String[] courseArr = subjectString.split("\\|");

        /*if (user != null && courseArr.length == 3) {
            memberId = VivasamUtil.isNull(user.getMemberId());

            textbookList = myClassInfoService.rTextbookList(courseArr[0], courseArr[1], courseArr[2], memberId);

        }*/
        return textbookList;
    }

    @GetMapping("myPutDataList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> myPutDataList(
                @RequestParam(value = "page", defaultValue = "1") int page,
                @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
                @RequestParam(value = "folderId", required = false, defaultValue = "") String folderId,
                @CurrentUser UserPrincipal user) {
        Page<Map<String, Object>> myPutDataList = myClassInfoService.myPutDataList(page, pageSize, user.getMemberId(), folderId);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(myPutDataList);

        return ResponseEntity.ok(resources);
    }

    @PostMapping("deletePutData")
    @Secured("ROLE_USER")
    public ResponseEntity<?> deletePutData(
            @RequestBody Map<String, Object> requestParams,
            @CurrentUser UserPrincipal user) {
        logger.info("requestParams : {}", requestParams);
        List<String> deleteList = (List<String>)requestParams.get("deleteList");
        Map<String, String> result = new HashMap<>();

        if(!CollectionUtils.isEmpty(deleteList)){
            for(String contentData : deleteList){
                String data[]  = contentData.split("-");

                String folderId = data[0];
                String contentGubun = data[1];
                String contentId	 = data[2];

                logger.info("folderId ===============" + folderId);
                logger.info("contentGubun ===============" + contentGubun);
                logger.info("contentId ===============" + contentId);

                myClassInfoService.deletePutData(user.getMemberId(), folderId, contentGubun, contentId);
            }

        }
        result.put("resultCode", "SUCCESS");
        return ResponseEntity.ok(result);
    }

    @GetMapping("myFolderList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> myFolderList(
            @CurrentUser UserPrincipal user) {
        List<Map<String, Object>> myFolderList = myClassInfoService.myFolderList(user.getMemberId());

        return ResponseEntity.ok(myFolderList);
    }

    @GetMapping("myDownDataList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> myDownDataList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "textbookCd", required = false, defaultValue = "") String textbookCd,
            @RequestParam(value = "type1Cd", required = false, defaultValue = "") String type1Cd,
            @CurrentUser UserPrincipal user) {
        Page<Map<String, Object>> myDownDataList = myClassInfoService.myDownDataList(page, size, user.getMemberId(), textbookCd, type1Cd);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(myDownDataList);

        return ResponseEntity.ok(resources);
    }

    @GetMapping("myDownDataTextbookList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> myDownDataTextbookList(
            @CurrentUser UserPrincipal user) {
        List<Map<String, Object>> myDownDataTextbookList = myClassInfoService.myDownDataTextbookList(user.getMemberId());

        return ResponseEntity.ok(myDownDataTextbookList);
    }

    /**
     * 교과 설정을 변경한다.
     * @param mainSubject
     * @param secondSubject
     * @param user
     * @return
     */
    @GetMapping("changeMySubject")
    @Secured("ROLE_USER")	//	login 여부를 감시 한다.
    public ResponseEntity<?> changeMySubject(
                                @RequestParam(value = "mainSubject", required = true) String mainSubject,
                                @RequestParam(value = "secondSubject", required = false, defaultValue = "") String secondSubject,
                                @CurrentUser UserPrincipal user){
        logger.info("------------------------------------");
        logger.info("chgSubjectCode");
        logger.info("------------------------------------");
        logger.info("mainSubject   : {}", mainSubject);
        logger.info("secondSubject : {}", secondSubject);
        logger.info("------------------------------------");

        String memberId = user.getMemberId();
        int chgResult = myClassInfoService.changeMySubject(mainSubject, secondSubject, memberId);
        if ( chgResult > 0 ) {
            return  ResponseEntity.ok("SUCCESS");
        }else{
            throw new VivasamException();
        }


    }

    /**
     * 내교과서 설정 삭제
     *
     * @param textbookCd
     * @return
     */
    @GetMapping("deleteMyTextbook")
    @Secured("ROLE_USER")	//	login 여부를 감시 한다.
    public ResponseEntity<?> deleteMyTextbook(
                                @RequestParam(value = "textbookCd", required = true) String textbookCd,
                                @CurrentUser UserPrincipal user){
        String memberId = user.getMemberId();
        int delResult = myClassInfoService.deleteMyTextbook(textbookCd,memberId);
        if ( delResult > 0 ) {
            return  ResponseEntity.ok("SUCCESS");
        }else{
            throw new VivasamException();
        }
    }

    /**
     * 내교과서 등록
     *
     * @param textbookCd
     * @return
     */
    @GetMapping("insertMyTextbook")
    @Secured("ROLE_USER")	//	login 여부를 감시 한다.
    public ResponseEntity<?> insertMyTextbook(
            @RequestParam(value = "textbookCd", required = true) String textbookCd,
            @CurrentUser UserPrincipal user){
        String memberId = user.getMemberId();
        List<Map<String, Object>> myTextBookInfoList = myClassInfoService.myTextBookInfoList(user.getMemberId());
        int delResult = myClassInfoService.insertMyTextbook(textbookCd,memberId);
        if ( delResult > 0 ) {
            return  ResponseEntity.ok("SUCCESS");
        }else{
            throw new VivasamException();
        }
    }

    @GetMapping("myMaterialViewList")
    @Secured("ROLE_USER")	//	login 여부를 감시 한다.
    public ResponseEntity<?> myMaterialViewList(@CurrentUser UserPrincipal user){
        List<Map<String, Object>> myDownDataTextbookList = myClassInfoService.myMaterialViewList(user.getMemberId());
        return ResponseEntity.ok(myDownDataTextbookList);
    }
}