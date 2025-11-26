package edu.visang.vivasam.educourse.controller;

import edu.visang.vivasam.educourse.service.EducourseService;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/educourse")
public class EducourseController {
    public static final Logger logger = LoggerFactory.getLogger(EducourseController.class);

    @Autowired
    EducourseService educourseService;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    /**
     * 학교급별 전체 교과 목록 조회
     * @param schoolLvlCd
     * @return
     */
    @GetMapping("/subjectList")
    public List<Map<String, Object>> subjectGroupList(@RequestParam(value = "schoolLvlCd") String schoolLvlCd) {
        List<Map<String, Object>> subjectGroupList = educourseService.subjectGroupList(schoolLvlCd);
        return subjectGroupList;
    }


    /**
     * 교과에 속한 교과서 목록조회
     * @param subjectGrpCd
     * @param eduYear
     * @return
     */
    @GetMapping("/getTextbookListbyGrpCd")
    public List<Map<String, Object>> getTextbookListbyGrpCd(@RequestParam(value = "subjectGrpCd") String subjectGrpCd ,
                                                            String eduYear,
                                                            String grade,
                                                            String mdValue,
                                                            String subjectTypeCd) {
        logger.info("subjectGrpCd : {} / eduYear : {} / grade : {} / {}", subjectGrpCd, eduYear, grade, subjectTypeCd);

        if ("전체".equals(mdValue)) {
            mdValue = null;
        } else if ("22 개정".equals(mdValue)) {
            mdValue = "2022";
        } else if ("15 개정".equals(mdValue)) {
            mdValue = "2015";
        } else {
            mdValue = null;
        }
        // 전체 교과 공통 textbookCode
        String commonSubjectTextbookCode
                = "106445,106446,106212,106213,106455,106456,106214,106461,106463,106218," +
                  "106468,106469,106221,106477,106478,106317,106483,106484,106485,106486," +
                  "106228,106229,106447,106448,106462,106464,106515,106514";
        // 전체 교과 일반 textbookCode
        String generalSubjectTextbookCode
                = "106449,106450,106451,106279,106280,106281,106282,106215,106283,106216," +
                  "106217,106219,106220,106284,106285,106476,106222,106223,106287,106288," +
                  "106289,106290,106479,106225,106224,106319,106227,106291,106230,106232," +
                  "106233,106502,106239,106504,106234,106505,106241,106342,106507,106235," +
                  "106508,106236,106509,106237,106240,106487,106488,106489,106490,106510,106465,106466,106467," +
                  "106457,106458,106459,106473,106470,106480";
        // 전체 교과 진로
        String careerPathSubjectTextbookCode
                = "106454,106286,106334,106245,106231,106246,106247,106248,106506,106513," +
                  "106238,106491,106492,106493,106494,106495,106496,106497,106498,106567,106474,106472,106569,106570,106481,106568";
        // 전체 교과 융합 textbookCode
        String amalgamationSubjectTextbookCode = "106452,106453,106503,106511,106499,106500,106501,106512,106460,106475,106471,106574,106571";


        String[] subjectTypeTexbookList = null;
        switch (subjectTypeCd) {
            case "1" :
                subjectTypeTexbookList = commonSubjectTextbookCode.split(",");
                break;
            case "2" :
                subjectTypeTexbookList = generalSubjectTextbookCode.split(",");
                break;
            case "3" :
                subjectTypeTexbookList = careerPathSubjectTextbookCode.split(",");
                break;
            case "4" :
                subjectTypeTexbookList = amalgamationSubjectTextbookCode.split(",");
                break;
            default :
                subjectTypeTexbookList = null;
                break;
        }

        String[] subjectGrpCds = subjectGrpCd.split("\\,");
        List<Map<String, Object>> getTextbookListbyGrpCd = educourseService.getTextbookListbyGrpCd(subjectGrpCds, eduYear, grade, mdValue,subjectTypeTexbookList);
        return getTextbookListbyGrpCd;
    }

    /**
     * 교과서정보 조회
     * @param textbookCd
     * @return
     */
    @GetMapping("/textBookInfo")
    //P73 2A 교과서 정보
    public Map<String, Object> textBookInfo(@RequestParam(value = "textbookCd") String textbookCd) {


        //1. 학교급, 교과에 포함된 전체 교과서 정보 조회
        List<Map<String, Object>> textbookList = educourseService.getTextbookList(textbookCd);

        //2. 1번 전체 교과서 정보에서 현재 교과서 정보 조회
        Map<String,Object> textBookInfo = new HashMap<>();

        if (textbookList.size() > 0) {

            for (int i =0 ; i<textbookList.size() ; i++) {
                //logger.info("TextbookInfo : " + tbi.getTextbookCd());
                if (textbookList.get(i).get("textbookCd").equals(textbookCd)) {

                    textBookInfo.put("textbookInfo",textbookList.get(i));
                    if("2022".equals(textbookList.get(i).get("eduYear"))) {
                        List<Map<String, Object>> textbookLinkInfo = educourseService.getSmartTextbookInfo(textbookCd);
                        textBookInfo.put("textbookSmartInfo", textbookLinkInfo);
                        List<Map<String, Object>> textbookUrlInfo = educourseService.getSmartTextbookUrlInfo(textbookCd);
                        textBookInfo.put("textbookUrlInfo", textbookUrlInfo);
                    } else {
                        textBookInfo.put("textbookSmartInfo", null);
                    }

                    break;
                }
            }
        }
        // 교과서 DVD 표시 여부
        String textbookDvdCnt = educourseService.getTextbookDvdCnt(textbookCd);
        textBookInfo.put("textbookDvdCnt",textbookDvdCnt);
        // 차시자료는 초등에만 해당하므로 제외
        //String periodCheck = educourseService.getPeriodCheck(textbookCd);
        textBookInfo.put("periodCheck", null);

        return textBookInfo;
    }

    /**
     * 공통자료, 단원별자료 특화자료 전체목록 조회 (교과서 자료실의 기본)
     * @param textbookCd
     * @return
     */
    @GetMapping("/getCourseBaseClassInfoList")
    //P73 4
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    public List<Map<String, Object>> getCourseBaseClassInfoList(
                            @RequestParam(value = "textbookCd") String textbookCd,
                            @RequestParam(value = "gubunCd", required = false) String gubunCd,
                            @RequestParam(value = "type1Cd", required = false) String type1Cd) {
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        List<Map<String, Object>> classList = new ArrayList<>();

        if(StringUtils.isEmpty(gubunCd) || "C".equals(gubunCd)) {
            classList.addAll(educourseService.getCourseBaseClassInfoList(textbookCd, "C", type1Cd));	// 공통 자료
        }
        if(StringUtils.isEmpty(gubunCd) || "L".equals(gubunCd)) {
            classList.addAll(educourseService.getCourseBaseClassInfoLnbList(textbookCd, "L", null));	// 단원별 자료
        }
        if(StringUtils.isEmpty(gubunCd) || "S".equals(gubunCd)) {
            classList.addAll(educourseService.getCourseBaseClassInfoList(textbookCd, "S", type1Cd));	// 특화 자료
        }

        return classList;
    }


    /**
     * 대단원 하위의 중단원 조회-->단원별만
     * @param class1Cd
     * @return
     */
    @GetMapping("/getCourseBaseClassSubInfotList")
    //p75 1A, 1B --> 중단원... 대단원과 같이나오게 쿼리 수정 요망
    public List<Map<String, Object>> getCourseBaseClassSubInfotList(@RequestParam(value = "class1Cd", required = true) String class1Cd) {
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        List<Map<String, Object>> subUnitList = educourseService.getCourseBaseClassSubInfotList(class1Cd);
        return subUnitList;
    }


    /**
     * 첫 대단원 정보의 유형 분류 정보 조회--> 단원별 (공통은 getCourseBaseClassInfoList 쿼리에서 사용)
     * @param classCd
     * @return
     */
    @GetMapping("/getUnitTypeList")
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    // classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
    //            소단원 선택시 getCourseBaseClassSubInfotList 조회한 class2Cd를 넣는다

    //P75 2
    public List<Map<String, Object>> getUnitTypeList(@RequestParam(value = "classCd", required = false) String classCd,
                                                     @RequestParam(value = "type1Cd", required = false) String type1Cd) {

        // 첫 대단원 정보의 유형 분류 정보 조회
        /*
            1110001 => 수업 자료
            1110002 => 평가 자료
            1110003 => 멀티미디어 자료
            1110004 => 음원 자료
            1110005 => 이미지 자료
            1110006 => 스마트 교안 자료*/
        List<Map<String, Object>> unitTypeList = educourseService.getUnitTypeList(classCd,type1Cd);

      return  unitTypeList;
    }

    /**
     * 단원별자료에 노출되는 목록 정보 셋팅 -->공통, 단원별
     * @param classCd
     * @param type1Cd
     * @return
     */
    @GetMapping("/getEducourseUnitDataList")
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    // classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
    //            소단원 선택시 getCourseBaseClassSubInfotList 조회한 class2Cd를 넣는다
    //type1Cd (getUnitTypeList에서 조회 ): 1110001 => 수업 자료 1110002 => 평가 자료 1110003 => 멀티미디어 자료 1110004 => 음원 자료 1110005 => 이미지 자료 1110006 => 스마트 교안 자료
    //P76  2  --> 페이징 처리 필요
    public ResponseEntity<?> getEducourseUnitDataList(
                                                            @RequestParam(value = "page", defaultValue ="0") int page,
                                                            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
                                                            @RequestParam(value = "classCd") String classCd,
                                                            @RequestParam(value = "type1Cd") String type1Cd,
                                                            @RequestParam(value = "type2Cd", required = false) String type2Cd ) {

        //exec DBO.SP_COURSE_UNIT_DATA_GROUP_BY_LIST /*교과자료-단원별 자료의 유형별 정보 조회*/ 1, 5, 20101478, 1110001, null
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        //  List<Map<String, Object>> classList = educourseService.rEducourseUnitDataList(textbookCd);

        Page<Map<String, Object>> educourseUnitDataList = educourseService.rEducourseUnitDataList(page ,pageSize , classCd,type1Cd, type2Cd);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(educourseUnitDataList);
        return ResponseEntity.ok(resources);

    }



    /**
     * 첫 대단원 정보의 유형 분류 정보의 하위정보 selectbox --공통 단원별
     * @param classCd
     * @param type1Cd
     * @return
     */
    //p 76 1A
    //ex )수업자료:교과서,교사용 교과서,지도서,수업 지도안,수업 PPT,활동지,학습지,읽기 자료,링크 자료
    // classCd : 대단원만 있고 중단원 전체일경우 :  getCourseBaseClassInfoList 조회결과의 class1Cd 넣고 ex)20101478
    //            소단원 선택시 getCourseBaseClassSubInfotList에서 조회한 class2Cd를 넣는다
    //type1Cd (getUnitTypeList에서 조회 ): 1110001 => 수업 자료 1110002 => 평가 자료 1110003 => 멀티미디어 자료 1110004 => 음원 자료 1110005 => 이미지 자료 1110006 => 스마트 교안 자료
    @GetMapping("getUnitSubTypeList")
    public List<Map<String, Object>> getUnitSubTypeList(@RequestParam(value = "classCd", required = true) String classCd,
                                                            @RequestParam(value = "type1Cd", required = true) String type1Cd) {

        //exec DBO.SP_COURSE_UNIT_DATA_GROUP_TYPE_DETAIL_LIST /*교과자료-단원별 자료의 유형별 정보 조회*/ 1, 5, 20101478, 1110001, null
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        List<Map<String, Object>> unitSubTypeList = educourseService.getUnitSubTypeList(classCd,type1Cd);
        return unitSubTypeList;

    }
//////공통////

    @GetMapping("/getAllMenuList") //단원별
    //P73 4
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    public List<Map<String, Object>> getAllMenuList(@RequestParam(value = "textbookCd") String textbookCd) {
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        //List<Map<String, Object>> classList = educourseService.getCourseBaseClassInfoList(textbookCd, "L", null);
        List<Map<String, Object>> classList = educourseService.getCourseBaseClassInfoLnbList(textbookCd, "L", null);	// 단원별 자료

        if(!CollectionUtils.isEmpty(classList)) {
            for (Map<String, Object> clazz : classList) {
                clazz.put("subMenuList", educourseService.getCourseBaseClassSubInfotList(String.valueOf(clazz.get("class1Cd"))));
            }
        }
        return classList;
    }

    /**
     * 공통자료에 노출되는 목록 정보 셋팅
     * @param textbookCd
     * @param class2Cd
     * @return
     */
    @GetMapping("/getEducourseCommonDataList")
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    // class2Cd : getCourseBaseClassInfoList 조회결과의 class2Cd
    public ResponseEntity<?> getEducourseCommonDataList(
            @RequestParam(value = "page", defaultValue ="0") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(value = "textbookCd") String textbookCd,
            @RequestParam(value = "class2Cd") String class2Cd,
            @RequestParam(value = "type2Cd", required = false) String type2Cd) {

        //exec DBO.SP_COURSE_UNIT_DATA_GROUP_BY_LIST /*교과자료-단원별 자료의 유형별 정보 조회*/ 1, 5, 20101478, 1110001, null
        //Lnb등 해당 교과서의 분류 정보 일괄 조회
        //  List<Map<String, Object>> classList = educourseService.rEducourseUnitDataList(textbookCd);

        Page<Map<String, Object>> educourseCommonDataList = educourseService.rEducourseCommonDataList(page ,pageSize , textbookCd,class2Cd,type2Cd);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(educourseCommonDataList);
        return ResponseEntity.ok(resources);

    }



    /**
     * 공통자료 정보의 유형 분류 정보의 하위정보 selectbox
     * @param textbookCd
     * @param class2Cd
     * @return
     */
    //p 76 1A
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    // class2Cd : getCourseBaseClassInfoList 조회결과의 class2Cd
    @GetMapping("getEducourseCommonDataTypeList")
    public List<Map<String, Object>> getCommonSubTypeList(@RequestParam(value = "textbookCd", required = true) String textbookCd,
                                                        @RequestParam(value = "class2Cd", required = true) String class2Cd) {
        List<Map<String, Object>> rEducourseCommonDataTypeList = educourseService.rEducourseCommonDataTypeList(textbookCd,class2Cd);
        return rEducourseCommonDataTypeList;

    }


    /**
     * 특화 자료 목록 조회
     * @param textbookCd
     * @param class2Cd
     * @return
     */
    //p 76 1A
    //textbookCd : 선택한 교과서 코드 ex 국어 1-1(김진수) -:106195
    // class2Cd : getCourseBaseClassInfoList 조회결과의 class2Cd
    @GetMapping("getEducourseSpecialDataList")
    public ResponseEntity<?> getEducourseSpecialDataList(@RequestParam(value = "page", defaultValue ="0") int page,
                                                               @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
                                                               @RequestParam(value = "textbookCd") String textbookCd,
                                                               @RequestParam(value = "class2Cd") String class2Cd) {
        Page<Map<String, Object>> rEducourseSpecialDataList = educourseService.rEducourseSpecialDataList(page ,pageSize , textbookCd,class2Cd);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(rEducourseSpecialDataList);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("getEduCourseSpecialDataSubCopy")
    public Map<String, String> getEduCourseSpecialDataSubCopy(@RequestParam(value = "class2Cd") String class2Cd) {
        Map<String, String> result = new HashMap<>();
        result.put("copy",educourseService.getEduCourseSpecialDataSubCopy(class2Cd));
        return result;
    }

    @GetMapping("getPeriodListMain")
    public ResponseEntity<?> getPeriodListMain(@RequestParam(value = "page", defaultValue ="0") int page,
                                               @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
                                               @RequestParam(value = "class1Cd") String class1Cd) {
        Page<Map<String, Object>> periodList = educourseService.getPeriodListMain(page ,pageSize , class1Cd);
        Resources<Map<String, Object>> resources = pagedResourcesAssembler.toResource(periodList);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("getContentInfo")
    public ResponseEntity<?> getContentInfo(@RequestParam(value = "contentId") String contentId) {
        Map<String, Object> contentInfo = educourseService.getContentInfo(contentId);
        return ResponseEntity.ok(contentInfo);
    }

    /**
     * 테스트용 html 컨텐츠 리스트 조회
     * @param textbookCd
     * @return
     */
    @GetMapping("/getHtmlContentList")
    public List<Map<String, Object>> getHtmlContentList(
            @RequestParam(value = "textbookCd") String textbookCd) {
        List<Map<String, Object>> contentList = educourseService.getHtmlContentList(textbookCd);
        return contentList;
    }
}
