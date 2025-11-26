package edu.visang.vivasam.common.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeMapper {
    public List<Map<String, Object>> noticeList();
}
