package edu.visang.vivasam.common.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DownloadMapper {
    public List<Map<String, Object>> getFileList(Map<String, Object> requestMap);
    public int insertFiledownLog(Map<String, Object> requestMap);
}
