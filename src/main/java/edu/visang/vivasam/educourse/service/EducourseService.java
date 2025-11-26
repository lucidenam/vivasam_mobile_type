package edu.visang.vivasam.educourse.service;

import edu.visang.vivasam.common.utils.PageUtils;
import edu.visang.vivasam.educourse.mapper.EducourseMapper;
import org.apache.ibatis.annotations.Param;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EducourseService {

    private static final Logger logger = LoggerFactory.getLogger(EducourseService.class);

    @Autowired
    EducourseMapper educourseMapper;

    public List<Map<String, Object>> subjectGroupList(String schoolLvlCd) {
        return educourseMapper.subjectGroupList(schoolLvlCd);
    }

    public List<Map<String, Object>> getTextbookListbyGrpCd(String[] subjectGrpCds, String eduYear, String grade, String mdValue, String[] subjectTypeTexbookList) {
        return educourseMapper.getTextbookListbyGrpCd(subjectGrpCds, eduYear, grade, mdValue, subjectTypeTexbookList);
    }

    /**
     * 회원의 전체 학급 기준(과목 카페)의 교과 코드를 학급별 교과 코드로 변환
     */
    public String getEduCourseSubjectCd(String schoolLvlCd, String subjectCd){
        return educourseMapper.getEduCourseSubjectCd(schoolLvlCd, subjectCd);
    }

    public List<Map<String, Object>> getTextbookList(String textbookCd){
        return educourseMapper.getTextbookList(textbookCd);
    }
    /**
    교과서 DVD 표시 여부
     */
    public String getTextbookDvdCnt(String textbookCd){
        return educourseMapper.getTextbookDvdCnt(textbookCd);
    }

    /**
     * 22개정 교과서 스마트 교과서
     * */
    public List<Map<String, Object>> getSmartTextbookInfo(String textbookCd){
        return educourseMapper.getSmartTextbookInfo(textbookCd);
    }

    /**
     Lnb등 해당 교과서의 분류 정보 일괄 조회
     */
    public List<Map<String, Object>> getCourseBaseClassInfoList(String textbookCd, String gubunCd, String type1Cd){
        return educourseMapper.getCourseBaseClassInfoList(textbookCd, gubunCd, type1Cd);
    }

    public List<Map<String, Object>> getCourseBaseClassInfoLnbList(String textbookCd, String gubunCd, String type1Cd){
        return educourseMapper.getCourseBaseClassInfoLnbList(textbookCd, gubunCd, type1Cd);
    }

    public String getPeriodCheck(String textbookCd) {
        return educourseMapper.getPeriodCheck(textbookCd);

    }

    public List<Map<String, Object>> getUnitTypeList(String classCd,String type1Cd){
        return educourseMapper.getUnitTypeList(classCd, type1Cd);
    }

    public Page<Map<String, Object>> rEducourseUnitDataList(int page , int pageSize , String classCd, String type1Cd, String type2Cd){
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = educourseMapper.rEducourseUnitDataList(request,classCd,type1Cd, type2Cd);
        return PageUtils.generatePage(list, request, "contentGubun");
    }
    public List<Map<String, Object>> getCourseBaseClassSubInfotList(String class1Cd){
        return educourseMapper.getCourseBaseClassSubInfotList(class1Cd);
    }
    public List<Map<String, Object>> getUnitSubTypeList(String classCd,String type1Cd){
        return educourseMapper.getUnitSubTypeList(classCd,type1Cd);
    }

    public Page<Map<String, Object>> rEducourseCommonDataList(int page , int pageSize , String textbookCd, String class2Cd,String type2Cd){
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = educourseMapper.rEducourseCommonDataList(request,textbookCd,class2Cd,type2Cd);
        return PageUtils.generatePage(list, request, "contentGubun");
    }

    public List<Map<String, Object>> rEducourseCommonDataTypeList(String textbookCd,String class2Cd){
        return educourseMapper.rEducourseCommonDataTypeList(textbookCd,class2Cd);
    }
    public Page<Map<String, Object>> rEducourseSpecialDataList(int page , int pageSize , String textbookCd, String class2Cd){
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = educourseMapper.rEducourseSpecialDataList(request,textbookCd,class2Cd);
        return PageUtils.generatePage(list, request, "contentGubun");
    }

    public String getEduCourseSpecialDataSubCopy(String class2Cd) {
        return educourseMapper.getEduCourseSpecialDataSubCopy(class2Cd);
    }

    public Page<Map<String, Object>> getPeriodListMain(int page, int pageSize, String class1Cd) {
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = educourseMapper.getPeriodListMain(request,class1Cd);
        return PageUtils.generatePage(list, request, "periodId");
    }

    public Map<String, Object> getContentInfo(String contentId) {
        return educourseMapper.getContentInfo(contentId);
    }

    public List<Map<String, Object>> getHtmlContentList(String textbookCd){
        return educourseMapper.getHtmlContentList(textbookCd);
    }

    public List<Map<String, Object>> getSmartTextbookUrlInfo(String textbookCd) {
        return educourseMapper.getSmartTextbookUrlInfo(textbookCd);
    }
}
