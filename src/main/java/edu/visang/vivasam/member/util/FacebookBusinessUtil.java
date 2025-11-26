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

public class FacebookBusinessUtil {

	/**
	 * 페이스북 Access Token 으로 회원정보 조회
	 * 비즈니스
	 * */
	public static String getUserTokenForBusiness(SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		String reqURL = "https://graph.facebook.com/me?fields=id,name,token_for_business&access_token=" + parameter.getAccessToken();
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

			String tokenForUsiness = "";
			try {
				tokenForUsiness = getName(element, "token_for_business");
			}
			catch (Exception e) { }
			return tokenForUsiness;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return "";
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
