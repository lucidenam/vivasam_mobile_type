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

public class GoogleUtil {

	/**
	 * 구글 Access Token 으로 회원정보 조회
	 * */
	public static HashMap<String, Object> getUserInfo (SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		if (StringUtils.isEmpty(parameter.getAccessToken())) {
			parameter.setAccessToken(parameter.getIdToken());
		}
		String reqURL = "https://oauth2.googleapis.com/tokeninfo?id_token=" + parameter.getIdToken();
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

			String googleId = element.getAsJsonObject().get("sub").getAsString();
			String googleName = element.getAsJsonObject().get("name").getAsString();
			String googleEmail = element.getAsJsonObject().get("email").getAsString();

			parameter.setId(googleId);
			parameter.setName(googleName);
			parameter.setEmail(googleEmail);

			userInfo.put("id", googleId);
			userInfo.put("name", googleName);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return null;
		}
		return userInfo;
	}

}
