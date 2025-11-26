package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.SchoolMapper;
import edu.visang.vivasam.common.model.SchoolInfo;
import edu.visang.vivasam.common.utils.PageUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SchoolService {
    private static final Logger logger = LoggerFactory.getLogger(SchoolService.class);

    @Autowired
    SchoolMapper schoolMapper;

    public Page<Map<String, Object>> selectSchoolList(int page, int pageSize, String schoolName, String tab) {
        PageRequest request = new PageRequest(page, pageSize);
        logger.info("request offset : {}, size : {}, page : {}", request.getOffset(), request.getPageSize(), request.getPageNumber());

        /*
         * 요청사항 [RMS-9663] :[개발] 학교검색 팝업 기능 개선
         * 학교검색어에 뛰어쓰기가 있을시 2개로 나누어서 LIKE 검색 처리
         */
        String query = "";
        if(schoolName.indexOf(" ") > 0) {
            for(int i=0; i<schoolName.split(" ").length; i++) {
                query += "AND NAME LIKE CONCAT('%', '" + schoolName.split(" ")[i] + "', '%') ";
            }
        } else {
            query += "AND NAME LIKE CONCAT('%', '" + schoolName + "', '%')";
        }

        // 소속 유형 필터
        if(StringUtils.isNotBlank(tab)) {
            query += " AND TAB = '" + tab + "'";
        }

        List<Map<String, Object>> list = schoolMapper.selectSchoolList(request, query);
        return PageUtils.generatePage(list, request, "code");
    }

    public List<Map<String, String>> selectSchoolArea(String pkcode, String codeflag, String fkcode) {
        return schoolMapper.selectSchoolArea(pkcode, codeflag, fkcode);
    }

    // 학교정보 조회
    public SchoolInfo getSchoolInfo(Integer schCode) {
        return schoolMapper.getSchoolInfo(schCode);
    }
    
}
