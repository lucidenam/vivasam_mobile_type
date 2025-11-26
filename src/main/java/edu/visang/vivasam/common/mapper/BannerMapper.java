package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.GateBanner;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface BannerMapper {
    public List<Map<String, Object>> mainBannerList();

    public Map<String, Object> mainBottomBanner();

    GateBanner gateBanner();

    List<Map<String, Object>> getKeywordIssueData();
}
