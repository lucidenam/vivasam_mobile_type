package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.BannerMapper;
import edu.visang.vivasam.common.model.GateBanner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class BannerService {
    @Autowired
    BannerMapper bannerMapper;

    public List<Map<String, Object>> mainBannerList() {
        return bannerMapper.mainBannerList();
    }

    public Map<String, Object> mainBottomBanner() {
        return bannerMapper.mainBottomBanner();
    }

    public GateBanner gateBanner() {
        return bannerMapper.gateBanner();
    }

    public List<Map<String, Object>> getKeywordIssueData(){return bannerMapper.getKeywordIssueData();}
}
