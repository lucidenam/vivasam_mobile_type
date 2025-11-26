package edu.visang.vivasam.myClassInfo.mapper;

import edu.visang.vivasam.member.model.MemberInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

@Mapper
public interface MyClassInfoMapper {
    public List<Map<String, Object>> myTextBookInfoList(@Param("memberId") String memberId);
    public MemberInfo getMemberInfo(@Param("memberId") String memberId);
    public List<Map<String, Object>> rRecommendArea(@Param("subjectType") String subjectType,@Param("areaType") String areaType);
    public String getCourseCdInfo(@Param("subjectNm") String subjectNm, @Param("schoolLvlCd") String schoolLvlCd);
    public List<Map<String, Object>> rSubjectList();
    public List<Map<String,Object>> getTextbookListByCourse(//@Param("esCodelistId") String esCodelistId,
                                                  //@Param("msCodelistId") String msCodelistId,
                                                  //@Param("hsCodelistId") String hsCodelistId,
                                                  //@Param("eduYear") String eduYear,
                                                  @Param("courseCd") String courseCd,
                                                  @Param("memberId") String memberId,
                                                  @Param("mdValue") String mdValue);
    public List<Map<String, Object>> myPutDataList(@Param("pageRequest") PageRequest pageRequest, @Param("memberId") String memberId, @Param("folderId") String folderId);
    public int myPutDataListCount(@Param("pageRequest") PageRequest pageRequest, @Param("memberId") String memberId, @Param("folderId") String folderId);
    
    public int deletePutData(@Param("memberId") String memberId, @Param("folderId") String folderId, @Param("contentGubun") String contentGubun,@Param("contentId") String contentId);
    public int deletePutDataBak(@Param("memberId") String memberId, @Param("folderId") String folderId, @Param("contentGubun") String contentGubun,@Param("contentId") String contentId);
    public List<Map<String, Object>> myFolderList(@Param("memberId") String memberId);
    public List<Map<String, Object>> myDownDataList(@Param("pageRequest") PageRequest pageRequest, @Param("memberId") String memberId, @Param("textbookCd") String textbookCd, @Param("type1Cd") String type1Cd);
    public int myDownDataListCount(@Param("pageRequest") PageRequest pageRequest, @Param("memberId") String memberId, @Param("textbookCd") String textbookCd, @Param("type1Cd") String type1Cd);
    public List<Map<String, Object>> myDownDataTextbookList(@Param("memberId") String memberId);
    public int changeMySubject(@Param("mainSubject") String mainSubject, @Param("secondSubject") String secondSubject,@Param("memberId") String memberId);
    public int deleteMyTextbook(@Param("textbookCd") String textbookCd, @Param("memberId") String memberId);
    public int insertMyTextbook(@Param("textbookCd") String textbookCd, @Param("memberId") String memberId);
    public List<Map<String, Object>> myMaterialViewList(@Param("memberId") String memberId);
}
