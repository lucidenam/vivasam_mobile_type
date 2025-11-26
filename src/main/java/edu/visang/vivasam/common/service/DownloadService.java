package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.constant.PointConstant;
import edu.visang.vivasam.common.mapper.DownloadMapper;
import edu.visang.vivasam.common.model.PointInfo;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DownloadService {
    @Autowired
    DownloadMapper downloadMapper;
    @Autowired
	CommonService commonService;

    public List<Map<String, Object>> getFileList(Map<String, Object> requestMap) {
    	String userid = (String) requestMap.get("userid");

        List<Map<String, Object>> resultList = downloadMapper.getFileList(requestMap);

        // 다운로드 포인트 지급
		for(Map<String, Object> fileInfo : resultList) {
			if("Y".equals(fileInfo.get("downyn"))) {
				String pid = (String) fileInfo.get("pid");
				String pgubun = (String) fileInfo.get("pgubun");

				// 로그
				HashMap<String, Object> paramMap = new HashMap<>();
				paramMap.put("userid", userid);
				paramMap.put("pid", pid);
				paramMap.put("pgubun", pgubun);

				downloadMapper.insertFiledownLog(paramMap);

				if(StringUtils.isNotBlank(userid) && StringUtils.isNotBlank(pid) && StringUtils.isNotBlank(pgubun)) {
					PointInfo point = new PointInfo();
					point.setActionType("AC701");
					point.setContentType(pgubun);
					point.setContentId(pid);
					point.setMemberId(userid);

					commonService.applyPoint(point);
				}
			}
		}

        return resultList;
    }
}
