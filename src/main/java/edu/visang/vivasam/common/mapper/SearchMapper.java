package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.EducourseSearch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

@Mapper
public interface SearchMapper {

    /**
     * Search List (기본)
     * @param word
     * @param member
     * @return
     */
    public List<Map<String, Object>> searchList(@Param("word") String word, @Param("member") String member);


    /**
     * 교과자료 목록 카운트
     * @param word
     * @return
     */
    public int searchEducourseListCount(@Param("word") String word);

    /**
     * 교과자료 top 3
     * @param word
     * @return
     */
    public List<Map<String, Object>> searchEducourseListTop3(@Param("word") String word);

    /**
     * 교과 자료 목록
     * @param pageRequest
     * @param educourseSearch
     * @return
     */
    public List<Map<String, Object>> searchEducourseList(@Param("pageRequest") PageRequest pageRequest, @Param("educourseSearch") EducourseSearch educourseSearch);

    /**
     * 라이브러리 목록 카운트
     * @param word
     * @return
     */
    public int searchLibraryListCount(@Param("word") String word);

    /**
     * 라이브러리 top 3
     * @param word
     * @return
     */
    public List<Map<String, Object>> searchLibraryListTop3(@Param("word") String word);

    /**
     * 라이브러리 목록
     * @param word
     * @return
     */
    public List<Map<String, Object>> searchLibraryList(@Param("pageRequest") PageRequest pageRequest, @Param("educourseSearch") EducourseSearch educourseSearch);

    /**
     * 공지사항 목록 카운트
     * @param word
     * @return
     */
    public int searchNoticeListCount(@Param("word") String word);

    /**
     * 공지사항 목록 TOP 3
     * @param word
     * @return
     */
    public List<Map<String, Object>> searchNoticeListTop3(@Param("word") String word);

    /**
     * 공지사항 목록
     * @param word
     * @return
     */
    public List<Map<String, Object>> searchNoticeList(@Param("word") String word);
}
