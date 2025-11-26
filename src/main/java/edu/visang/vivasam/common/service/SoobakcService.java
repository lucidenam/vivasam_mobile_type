package edu.visang.vivasam.common.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.common.mapper.SoobakcMapper;
import edu.visang.vivasam.common.model.MetaCode;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SoobakcService {
    private static final Logger logger = LoggerFactory.getLogger(SoobakcService.class);
    
    @Value("${only1.server.url}")
    private String only1ServerUrl;

    @Autowired
    SoobakcMapper soobakcMapper;

    public List<Map<String, Object>> getSoobakcList(Map<String, Object> requestMap) throws Exception {
        String action_type = (String) requestMap.get("ACTION_TYPE");
        if(action_type.equals("LECTURE_LIST")) {
            // api 조회
            String url = only1ServerUrl + "/api/vivasam/lecture/getLectureList.asp?actionType=LECTURE_LIST&lpIdx=" + requestMap.get("LECTURECD") + "&lecCnt=" + requestMap.get("LECCNT");
            String response = callExternalAPI(url);
            
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
            Map<String, Object> resultMap = mapper.readValue(response, Map.class);
            List<Map<String, Object>> resultList = (List<Map<String, Object>>) resultMap.get("result");
            List<Map<String, Object>> soobakcList = new ArrayList<>();
            
            for(Map<String, Object> originalMap : resultList) {
                Map<String, Object> soobakcMap = new HashMap<>();
                for (Map.Entry<String, Object> entry : originalMap.entrySet()) {
                    soobakcMap.put(entry.getKey().toUpperCase(), entry.getValue());
                }
                soobakcList.add(soobakcMap);
            }
            
            return soobakcList;
        } else {
            return soobakcMapper.getSoobakcList(requestMap);
        }
    }

    public List<Map<String, Object>> getSoobakcDetail(Map<String, Object> requestMap) throws Exception {
        // api 조회
        String url = only1ServerUrl + "/api/vivasam/lecture/getLectureDetail.asp?ld_idx=" + requestMap.get("LECTURECD");
        String response = callExternalAPI(url);
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
        Map<String, Object> resultMap = mapper.readValue(response, Map.class);
        List<Map<String, Object>> resultList = (List<Map<String, Object>>) resultMap.get("result");
        
        return resultList;
    }

    public List<MetaCode> rmetaCode(String[] args) {
        Map<String, Object> requestMap = new HashMap<String, Object>();

        requestMap.put("ctype", args[0]);
        requestMap.put("code", args[1]);

        for (int i = 1; i < args.length - 1; i++) {
            requestMap.put("code" + i, args[i + 1]);
        }

        return soobakcMapper.rmetaCode(requestMap);
    }

    public String getSoobakcImagePath(Map<String, Object> requestParams) {
        String imagePath = soobakcMapper.getSoobakcImagePathOnlySchoolGrade(requestParams);
        if(imagePath == null || "".equals(imagePath)) imagePath = soobakcMapper.getSoobakcImagePath(requestParams);
        return imagePath;
    }

    public Map<String, Object> getSoobakcImageBanner(Map<String, Object> requestParams) {
        String orgSchoolGrade = requestParams.get("schoolGrade").toString();
        requestParams.put("schoolGrade", "ALL");
        Map<String, Object> imageBanner = null;

        imageBanner = soobakcMapper.getSoobakcImageBanner(requestParams);
        if(imageBanner == null) {
            requestParams.put("schoolGrade", orgSchoolGrade);
            imageBanner = soobakcMapper.getSoobakcImageBanner(requestParams);
        }

        return imageBanner;
    }
	
	 public String callExternalAPI(String url) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet(url);
            HttpResponse httpResponse = httpClient.execute(httpGet);
            HttpEntity httpEntity = httpResponse.getEntity();
            return EntityUtils.toString(httpEntity);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
