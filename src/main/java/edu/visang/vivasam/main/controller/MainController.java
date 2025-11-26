package edu.visang.vivasam.main.controller;

import edu.visang.vivasam.common.model.GateBanner;
import edu.visang.vivasam.common.service.BannerService;
import edu.visang.vivasam.common.service.NoticeService;
import edu.visang.vivasam.saemteo.model.SurveyInfo;
import edu.visang.vivasam.saemteo.service.SaemteoService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/main")
public class MainController {
    public static final Logger logger = LoggerFactory.getLogger(MainController.class);

    @Autowired
    BannerService bannerService;

    @Autowired
    NoticeService noticeService;

    @Autowired
    SaemteoService saemteoService;

    @GetMapping("/banner")
    public GateBanner gateBanner() {
        return bannerService.gateBanner();
    }

    @GetMapping("/mainBannerList")
    public List<Map<String, Object>> bannerList() {
        return bannerService.mainBannerList();
    }

    @GetMapping("/mainNoticeList")
    public List<Map<String, Object>> noticeList() {
        return noticeService.noticeList();
    }


    @GetMapping("/mainSurvey")
    public Object rSurveyList() {
       List<SurveyInfo> surveyList = saemteoService.surveyList("Y","");
        if(!surveyList.isEmpty() && surveyList.size()>0){
            return surveyList.get(0);
        }
        return null;
    }

    @GetMapping("/mainBottomBanner")
    public Map<String, Object> mainBottomBanner() {
        return bannerService.mainBottomBanner();
    }

    // app 업데이트 체크용 최신버전정보 조회
    @GetMapping("/latestAppVersion")
    public ResponseEntity<?> getLatestAppVersion(@RequestParam("os") String os) {

        String uri;
        if ("ANDROID".equalsIgnoreCase(os)) {
            uri = "https://dn.vivasam.com/appData/vivasam/mobile/version/version.json";
        } else if ("IOS".equalsIgnoreCase(os)) {
            uri = "https://dn.vivasam.com/appData/vivasam/mobile/version/version_for_ios.json";
        } else {
            return ResponseEntity.ok(new HashMap<>());
        }

        RestTemplate restTemplate = new RestTemplate();
        Map<String, String> result = restTemplate.getForObject(uri, HashMap.class);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/getIssueContentsGroupMainKeyword")
	public ResponseEntity<?> getIssueContentsGroupMainKeyword(@CurrentUser UserPrincipal currentUser) {
		List<Map<String, Object>> resultMap = null;

		// 오늘날짜 + 5일 까지 데이터 호출
		resultMap = bannerService.getKeywordIssueData();

		return ResponseEntity.ok(resultMap);
	}

}
