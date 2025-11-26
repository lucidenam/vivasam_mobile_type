package edu.visang.vivasam.member.util;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import edu.visang.vivasam.member.model.SnsLoginParameter;
import org.apache.commons.lang3.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

public class FacebookUtil {

	/**
	 * 페이스북 Access Token 으로 회원정보 조회
	 * */
	public static HashMap<String, Object> getUserInfo (SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		if (StringUtils.isBlank(parameter.getApiId())) {
			parameter.setApiId(parameter.getId());
		}
		String reqURL = "https://graph.facebook.com/" + parameter.getApiId() + "?fields=id,name,email,picture&access_token=" + parameter.getAccessToken();

		try {
			URL url = new URL(reqURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");

			// 요청에 필요한 Header에 포함될 내용
			int responseCode = conn.getResponseCode();
			InputStreamReader inputStreamReader = new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8);
			BufferedReader br = new BufferedReader(inputStreamReader);

			String line = "";
			String result = "";
			while ((line = br.readLine()) != null) {
				result += line;
			}

			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(result);

			String facebookId = element.getAsJsonObject().get("id").getAsString();
			String facebookName = "";
			String email = "";
			try {
				facebookName = getName(element, "name");
				email = getName(element, "email");
			}
			catch (Exception e) { }

			// 비즈니스 토큰 얻기
			String userTokenForBusiness = FacebookBusinessUtil.getUserTokenForBusiness(parameter);
			if (StringUtils.isNotBlank(userTokenForBusiness)) {
				parameter.setId(userTokenForBusiness);
			}
			else {
				return null;
			}
			parameter.setName(facebookName);
			parameter.setEmail(email);
			userInfo.put("id", facebookId);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return null;
		}
		return userInfo;
	}

	/**
	 * 페이스북 Access Token 으로 연동 해제
	 * */
	public static boolean unlinkUserInfo (String apiId, String accessToken) {

		String reqURL = "https://graph.facebook.com/" + apiId + "/permissions?access_token=" + accessToken;

		try {
			URL url = new URL(reqURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("DELETE");

			// 요청에 필요한 Header에 포함될 내용
			int responseCode = conn.getResponseCode();
			InputStreamReader inputStreamReader = new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8);
			BufferedReader br = new BufferedReader(inputStreamReader);

			String line = "";
			String result = "";
			while ((line = br.readLine()) != null) {
				result += line;
			}

			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(result);

			return element.getAsJsonObject().get("success").getAsBoolean();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return false;
		}
	}

	private static String getName(JsonElement element, String name) {
		try {
			return element.getAsJsonObject().get(name).getAsString();
		}
		catch (Exception e) {
			return "";
		}
	}

}