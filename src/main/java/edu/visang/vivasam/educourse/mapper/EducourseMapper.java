package edu.visang.vivasam.educourse.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.method.P;

import java.util.List;
import java.util.Map;

@Mapper
public interface EducourseMapper {

    public List<Map<String, Object>> subjectGroupList(@Param("schoolLvlCd") String schoolLvlCd);
    public List<Map<String, Object>> getTextbookListbyGrpCd(@Param("subjectGrpCds") String[] subjectGrpCds,
                                                            @Param("eduYear") String eduYear,
                                                            @Param("grade") String grade,
                                                            @Param("mdValue") String mdValue,
                                                            @Param("subjectTypeTexbookList") String[] subjectTypeTexbookList);
    public String getEduCourseSubjectCd(@Param("schoolLvlCd") String schoolLvlCd, @Param("subjectCd") String subjectCd);
    public List<Map<String, Object>> getTextbookList(@Param("textbookCd") String textbookCd);
    public String getTextbookDvdCnt(@Param("textbookCd") String textbookCd);
    public List<Map<String, Object>> getSmartTextbookInfo(@Param("textbookCd") String textbookCd);


    public List<Map<String, Object>> getCourseBaseClassInfoList(@Param("textbookCd") String textbookCd, @Param("gubunCd") String gubunCd, @Param("type1Cd") String type1Cd);
    public List<Map<String, Object>> getCourseBaseClassInfoLnbList(@Param("textbookCd") String textbookCd, @Param("gubunCd") String gubunCd, @Param("type1Cd") String type1Cd);
    public String getPeriodCheck(@Param("textbookCd") String textbookCd);
    public List<Map<String, Object>> getUnitTypeList(@Param("classCd") String classCd,@Param("type1Cd") String type1Cd);
    public List<Map<String, Object>> rEducourseUnitDataList(@Param("pageRequest") PageRequest pageRequest,
                                                            @Param("classCd") String classCd,
                                                            @Param("type1Cd") String type1Cd,
                                                            @Param("type2Cd") String type2Cd);
    public List<Map<String, Object>> getCourseBaseClassSubInfotList(@Param("class1Cd") String class1Cd);
    public List<Map<String, Object>> getUnitSubTypeList(@Param("classCd") String classCd, @Param("type1Cd") String type1Cd);


    public List<Map<String, Object>> rEducourseCommonDataList(@Param("pageRequest") PageRequest pageRequest,
                                                            @Param("textbookCd") String textbookCd,
                                                            @Param("class2Cd") String class2Cd,
                                                              @Param("type2Cd") String type2Cd);
    public List<Map<String, Object>> rEducourseCommonDataTypeList(@Param("textbookCd") String textbookCd, @Param("class2Cd") String class2Cd);


    public List<Map<String, Object>> rEducourseSpecialDataList(@Param("pageRequest") PageRequest pageRequest,
                                                              @Param("textbookCd") String textbookCd,
                                                              @Param("class2Cd") String class2Cd);

    public String getEduCourseSpecialDataSubCopy(@Param("class2Cd") String class2Cd);

    public List<Map<String, Object>> getPeriodListMain(
                                        @Param("pageRequest") PageRequest pageRequest,
                                        @Param("class1Cd") String class1Cd);

    public Map<String, Object> getContentInfo(@Param("contentId") String contentId);

    public List<Map<String, Object>> getHtmlContentList(@Param("textbookCd") String textbookCd);

    public List<Map<String, Object>> getSmartTextbookUrlInfo(@Param("textbookCd") String textbookCd);
}
