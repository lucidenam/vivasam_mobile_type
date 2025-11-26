package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.SearchMapper;
import edu.visang.vivasam.common.model.EducourseSearch;
import edu.visang.vivasam.common.utils.PageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SearchService {
    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);

    @Autowired
    SearchMapper searchMapper;

    public List<Map<String, Object>> searchList(String word, String member) {
        return searchMapper.searchList(word, member);
    }

    public int searchEducourseListCount(String word) {
        return searchMapper.searchEducourseListCount(word);
    }

    public List<Map<String, Object>> searchEducourseListTop3(String word) {
        return searchMapper.searchEducourseListTop3(word);
    }

    public Page<Map<String, Object>> searchEducourseList(int page, int pageSize, EducourseSearch educourseSearch) {
        PageRequest request = new PageRequest(page, pageSize);
        logger.info("request offset : {}, size : {}, page : {}", request.getOffset(), request.getPageSize(), request.getPageNumber());
        List<Map<String, Object>> list = searchMapper.searchEducourseList(request, educourseSearch);
        return PageUtils.generatePage(list, request, "code");
    }

    public int searchLibraryListCount(String word) {
        return searchMapper.searchLibraryListCount(word);
    }

    public List<Map<String, Object>> searchLibraryListTop3(String word) {
        return searchMapper.searchLibraryListTop3(word);
    }

    public Page<Map<String, Object>> searchLibraryList(int page, int pageSize, EducourseSearch educourseSearch) {
        PageRequest request = new PageRequest(page, pageSize);
        logger.info("request offset : {}, size : {}, page : {}", request.getOffset(), request.getPageSize(), request.getPageNumber());
        List<Map<String, Object>> list = searchMapper.searchLibraryList(request, educourseSearch);
        return PageUtils.generatePage(list, request, "code");
    }

    public int searchNoticeListCount(String word) {
        return searchMapper.searchNoticeListCount(word);
    }

    public List<Map<String, Object>> searchNoticeListTop3(String word) {
        return searchMapper.searchNoticeListTop3(word);
    }

    public List<Map<String, Object>> searchNoticeList(String word) {
        return searchMapper.searchNoticeList(word);
    }

}
