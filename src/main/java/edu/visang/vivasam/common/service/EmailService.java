package edu.visang.vivasam.common.service;

import com.google.gson.Gson;
import edu.visang.vivasam.common.constant.VivasamConstant;
import edu.visang.vivasam.common.mapper.EmailLogMapper;
import edu.visang.vivasam.common.mapper.EmailMapper;
import edu.visang.vivasam.common.model.EmailInfo;
import edu.visang.vivasam.common.model.EmailLogParameter;
import edu.visang.vivasam.common.utils.JsonUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;

@Service
public class EmailService {

	private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

	@Autowired
    EmailMapper emailMapper;

	@Autowired
	EmailLogMapper emailLogMapper;

	@Autowired
	Environment environment;

	public void sendJoinMail(String newId, String name, String email) {
		Map<String, Object> map = new HashMap<>();
		map.put("memberId", newId) ;
		map.put("memberName", name);
		map.put("email", email);
		Map<String,Object> sendMailInfo = emailMapper.selectJoinMailContent(map);
		sendMailInfo.put("email", email);

		try {
			EmailInfo emailInfo = new EmailInfo();
			emailInfo.setSubject(sendMailInfo.get("subject").toString());
			emailInfo.setContent(sendMailInfo.get("mailContent").toString());
			emailInfo.setTo(email);
			emailInfo.setVsCode("ET002");

			this.saveEMail(emailInfo);
			emailMapper.inserJoinMailSendLog(map);
		}catch(Exception e) {
			//메일 발송 오류 나더라도 진행
		}

	}

	public void sendAgreeMail(HashMap<String,String> map) {
		Map<String,Object> sendMailInfo = emailMapper.selectAgreeMailContent(map);
		sendMailInfo.put("email", map.get("email"));

		try {
			EmailInfo emailInfo = new EmailInfo();
			emailInfo.setSubject(sendMailInfo.get("subject").toString());
			emailInfo.setContent(sendMailInfo.get("mailContent").toString());
			emailInfo.setTo(map.get("email"));
			emailInfo.setVsCode("ET003");

			this.saveEMail(emailInfo);
		}catch(Exception e) {
			//메일 발송 오류 나더라도 진행
		}
	}

	public void saveEMail(EmailInfo emailInfo) {

		RestTemplate restTemplate = new RestTemplate();

		String auth = environment.getProperty("emailAuth");
		String path = environment.getProperty("emailStandardUrl");
		String jsonString = makeEmailJson(emailInfo);

		logger.info("EMAIL: {}", jsonString);

		HttpHeaders headers = new HttpHeaders();
		//headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
		headers.set("Authorization", auth);

		URI uri = UriComponentsBuilder
				.fromUriString(environment.getProperty("emailUrl"))
				.path(path)
				.build()
				.toUri();

		logger.info("EMAIL uri: {}", uri);
		HttpEntity<String> entity = new HttpEntity<String>(jsonString, headers);
		ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);
		Map<String, String> resultMap = JsonUtils.readValue(response.getBody(), Map.class);
		Gson gson = new Gson();
		String resultJson = gson.toJson(resultMap);
		logger.info("EMAIL Results: {}", resultJson);

		// email 발송 로그 시작
		try {
			EmailLogParameter emailLogParameter = new EmailLogParameter();
			emailLogParameter.setVsCode(emailInfo.getVsCode());
			emailLogParameter.setTitle(emailInfo.getSubject());
			emailLogParameter.setUid(UUID.randomUUID().toString());
			emailLogParameter.setContents(jsonString);

			int rowCount = emailLogMapper.insertEmailLog(emailLogParameter);

			if(rowCount > 0){
				emailLogParameter.setResults(resultJson);
				emailLogMapper.updateEmailLog(emailLogParameter);
			}

		} catch (Exception e) {
			logger.error("EMAIL LOG ERROR : {}", e.getMessage());
		}

	}

	private String makeEmailJson(EmailInfo emailInfo) {

		Map<String, Object> map = new HashMap<String, Object>();

		map.put("sender", VivasamConstant.EMAIL_SENDER);
		map.put("sender_name", VivasamConstant.EMAIL_SENDER_NAME);
		map.put("subject", emailInfo.getSubject());
		map.put("body", emailInfo.getContent());

		List<Map<String, String>> receiver = new ArrayList<Map<String, String>>();
		Map<String, String> receiverMap = new HashMap<String, String>();
		receiverMap.put("email", emailInfo.getTo());
		receiver.add(receiverMap);
		map.put("receiver", receiver);

		Gson gson = new Gson();
		String emailJson = gson.toJson(map);

		return emailJson;
	}
}
