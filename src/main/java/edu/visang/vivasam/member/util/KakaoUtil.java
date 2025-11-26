package edu.visang.vivasam.member.util;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import edu.visang.vivasam.member.model.SnsLoginParameter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

public class KakaoUtil {

	/**
	 * 카카오 Access Token 으로 회원정보 조회
	 * */
	public static HashMap<String, Object> getUserInfo (SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		String reqURL = "https://kapi.kakao.com/v2/user/me";
		try {
			URL url = new URL(reqURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("POST");

			// 요청에 필요한 Header에 포함될 내용
			conn.setRequestProperty("Authorization", "Bearer " + parameter.getAccessToken());
			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));

			String line = "";
			String result = "";

			while ((line = br.readLine()) != null) {
				result += line;
			}

			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(result);
			String email = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("email").getAsString();
			String telPhone = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("phone_number").getAsString();
			String birthday  = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("birthday").getAsString();
			String year  = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("birthyear").getAsString();
			String name  = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("name").getAsString();
			String ci = element.getAsJsonObject().get("kakao_account").getAsJsonObject().get("ci").getAsString();
			String id = element.getAsJsonObject().get("id").getAsString();

			//국제번호인 경우
			if(telPhone.contains("+") && !telPhone.contains("+82")) {
				telPhone = "";
			}

			parameter.setId(ci);
			parameter.setEmail(email);
			parameter.setPhoneNumber(telPhone.replace("+82 ", "0"));
			parameter.setBirthday(birthday);
			parameter.setYear(year);
			parameter.setName(name);

			userInfo.put("email", email);
			userInfo.put("tel", telPhone);
		} catch (IOException e) {
			return null;
		}
		return userInfo;
	}

	/**
	 * 카카오 Access Token 으로 연동 해제
	 */
	public static boolean unlinkUserInfo (String token) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		String reqURL = "https://kapi.kakao.com/v1/user/unlink";
		try {
			URL url = new URL(reqURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("POST");

			// 요청에 필요한 Header에 포함될 내용
			conn.setRequestProperty("Authorization", "Bearer " + token);
			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));

			String line = "";
			String result = "";

			while ((line = br.readLine()) != null) {
				result += line;
			}

			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(result);
			if (element.getAsJsonObject().get("id").getAsString() == null) {
				return false;
			}


		} catch (IOException e) {
			return false;
		}
		return true;
	}
}