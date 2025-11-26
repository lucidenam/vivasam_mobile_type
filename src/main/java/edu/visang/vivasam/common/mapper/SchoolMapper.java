package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.SchoolInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

@Mapper
public interface SchoolMapper {
    public List<Map<String, Object>> selectSchoolList(@Param("pageRequest") PageRequest pageRequest, @Param("schoolName") String schoolName);
    public List<Map<String, String>> selectSchoolArea(@Param("pkcode") String pkcode, @Param("codeflag") String codeflag, @Param("fkcode") String fkcode);

    SchoolInfo getSchoolInfo(Integer schCode);
}
