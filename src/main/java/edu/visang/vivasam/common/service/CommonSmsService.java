package edu.visang.vivasam.common.service;

import com.google.gson.Gson;
import edu.visang.vivasam.common.mapper.CommonSmsMapper;
import edu.visang.vivasam.common.model.CommonSms;
import edu.visang.vivasam.common.model.SmsLog;
import edu.visang.vivasam.common.utils.JsonUtils;
import edu.visang.vivasam.config.GlobalConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommonSmsService {

    private final GlobalConfig globalConfig;

    private final CommonSmsMapper commonSmsMapper;

    public String smsSend(CommonSms parameter) throws Exception {
    	int rowCount = 0;
		SmsLog smsLogParameter = new SmsLog();
		String callback = globalConfig.getCallNumber();
		String smsAuth = globalConfig.getSmsAuth();
		String smsUrl = globalConfig.getSmsUrl();
		String path = globalConfig.getSmsStandardUrl();

    	String uuid = UUID.randomUUID().toString();
		String title = parameter.getTitle();
		String msg = parameter.getMsg();
		String phone = parameter.getPhone().replace("-", "");

		List<Map<String, String>> msgDataList = new ArrayList<Map<String, String>>();

		if(validCellPhone(phone)) {
			Map<String, String> smsMap = new HashMap<String, String>();
	    	smsMap.put("msg_key", uuid);
			smsMap.put("title", title);
			smsMap.put("sender_number", callback);
			smsMap.put("receiver_number", phone);
			smsMap.put("msg", msg);
			smsMap.put("origin_cid", "0123456789");
			smsMap.put("echo_to_webhook", "vivasam");
			msgDataList.add(smsMap);

			Map<String, List<Map<String, String>>> sendMap = new HashMap<String, List<Map<String, String>>>();
			sendMap.put("msg_data", msgDataList);

			Gson gson = new Gson();
			String smsJson = gson.toJson(sendMap);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("Authorization", smsAuth);

	    	RestTemplate restTemplate = new RestTemplate();
			restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

			URI uri = UriComponentsBuilder
					.fromUriString(smsUrl)
					.path(path)
					.build()
					.toUri();

			HttpEntity<String> entity = new HttpEntity<String>(smsJson, headers);
			ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);

			smsLogParameter.setTitle(title);
			smsLogParameter.setUid(uuid);
			smsLogParameter.setContents(smsJson);

			Map<String, String> resultMap = JsonUtils.readValue(response.getBody(), Map.class);

			try {
				rowCount = commonSmsMapper.insertSmsLog(smsLogParameter);

				if(rowCount > 0) {
					smsLogParameter.setResults(String.valueOf(resultMap.get("results")));
					commonSmsMapper.updateSmsLog(smsLogParameter);
				}
			}catch(Exception e) {
				log.error(smsLogParameter.toString());
			}

			if(response.getStatusCodeValue() == 200) {
				return "OK";
			}else {
		    	return "FAIL";
			}
		}else {
			log.error("Wrong Number:" + phone);
	    	return "FAIL";
		}
    }

	public boolean validCellPhone(String value){
		boolean returnVal = false;
		String pattern = "^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$";

		if(Pattern.matches(pattern, value)) {
			returnVal = true;
		}
		return returnVal;
	}
}
