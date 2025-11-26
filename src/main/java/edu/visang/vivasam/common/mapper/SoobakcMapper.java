package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.MetaCode;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface SoobakcMapper {
    /**
     * 수박씨 과목 목록
     * @return
     */
    public List<Map<String, Object>> getSoobakcList(Map<String, Object> requestMap);

    public List<Map<String, Object>> getSoobakcDetail(Map<String, Object> requestMap);

    public List<MetaCode> rmetaCode(Map<String, Object> requestMap);

    public String getSoobakcImagePath(Map<String, Object> requestMap);

    public String getSoobakcImagePathOnlySchoolGrade(Map<String, Object> requestMap);

    public Map<String, Object> getSoobakcImageBanner(Map<String, Object> requestMap);
}
