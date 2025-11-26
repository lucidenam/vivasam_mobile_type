package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface CommonMapper {
    public List<Map<String, Object>> vscodeList(String code);

    public List<Map<String, Object>> codeList(Map<String, Object> params);

    public List<Map<String, Object>> subjectCodeList(String schLvlCd);

    public List<ConvertedDocCondition> convertedSmartDocumentList(ConvertedDocCondition cdc);

    public List<ConvertedDocCondition> convertedDocumentList(ConvertedDocCondition cdc);

    // SP_POINT 용 쿼리
    void insertPointHistoryInfo(PointInfo param);
    void insertSocialContentHis(PointInfo param);
    String selectMemberSpPointCheck(String memberId);
    int selectSocialContentHisCount(PointInfo param);

    public int getContentMemLevelCheck(@Param("contentGubun") String contentGubun, @Param("contentId") String contentId);

    public int setPushAlarms(PushAlarms pushAlarms);

    public PushAlarms getPushAlarms(@Param("memberId") String memberId);

    int insertEpkStatusInfo(EpkStatusInfo parameter);

    Map<String,Object> getMemberSchoolYn(String memberId);

    int insertEpkStatusInfoKEy(EpkStatusInfo parameter);

    DocumentContentInfo getDocumentContentInfo(DocumentContentInfo dci);
}