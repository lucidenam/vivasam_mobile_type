package edu.visang.vivasam.cs.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

@Mapper
public interface CsMapper {

    public List<Map<String, Object>> noticeList(@Param("pageRequest") PageRequest pageRequest,
                                                @Param("noticeId") String noticeId,
                                                @Param("srchCate") String srchCategory);

    public Map<String, Object> noticeView(@Param("id") String noticeId);

    public Map<String, Object> preNotice(@Param("id") String noticeId, @Param("cd") String noticeCd);
    public Map<String, Object> nextNotice(@Param("id") String noticeId, @Param("cd") String noticeCd);

    public List<Map<String, Object>> reqDataList(@Param("pageRequest") PageRequest pageRequest,
                                             @Param("userId") String userId);

    public Map<String, Object> reqDataView(@Param("userId") String userId, @Param("reqDataId") String reqDataId);

    public List<Map<String, Object>> qnaList(@Param("pageRequest") PageRequest pageRequest,
                                             @Param("userId") String userId, @Param("srchCate") String srchCategory);

    public Map<String, Object> qnaView(@Param("id") String qnaId);

    public int cQnaInsert(Map<String, Object> params);

    public int cQnaFileInsert(@Param("qnaId") String qnaCd, @Param("orgFileName") String orgFileName, @Param("realFileName") String realFileName, @Param("fileSize") String fileSize, @Param("fileGrpCd") String fileGrpCd);

    public List<Map<String, Object>> sidoCodeList(Map<String, Object> params);

    public List<Map<String, Object>> contactList(@Param("pageRequest") PageRequest pageRequest,
                                                 @Param("pkcode") String pkcode);

    public List<Map<String, Object>> allContactList();

    public void updateQnaCheck(@Param("qnaId") String qnaId);

    public int getMemberNoticeCnt(@Param("noticeId") String noticeId, @Param("memberId") String memberId);

    public void insertNoticeCheck(@Param("noticeId") String noticeId, @Param("memberId") String memberId);

    public void updateNoticeCheck(@Param("noticeId") String noticeId, @Param("memberId") String memberId);
}
