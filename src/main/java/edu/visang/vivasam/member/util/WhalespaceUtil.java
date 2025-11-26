package edu.visang.vivasam.member.util;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import edu.visang.vivasam.member.model.SnsLoginParameter;
import org.apache.commons.lang3.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

public class WhalespaceUtil {

	/**
	 * 웨일스페이스 Access Token 으로 회원정보 조회
	 * 웨일스페이스 => 네이버 웍스로 전환 후 IdToken 디코딩으로 api 없이 회원정보를 조회합니다.
	 * 더 상세한 회원정보 API는 아래 주석 참고 바랍니다.
	 * */
	public static HashMap<String, Object> getUserInfo (String token, SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		String id = "";
		String email = "";
		String name = "";
		String id_v1 = "";

		if (StringUtils.isNotEmpty(parameter.getIdToken())) {
			try {
				List<String> tokenList =  separateIdToken(parameter.getIdToken());
				JsonObject header = decodeJWT(tokenList.get(0));
				JsonObject payload = decodeJWT(tokenList.get(1));

				id = payload.get("sub").getAsString(); // => 아래 "https://www.worksapis.com/v1.0/users" API의 userId와 동일한 값
				name = payload.get("family_name").getAsString() + payload.get("given_name").getAsString();
				email = payload.get("email").getAsString();

				parameter.setId(id);
				parameter.setEmail(email);
				parameter.setName(name);

				userInfo.put("id", id);

				return userInfo;
			} catch (Exception e) {}
		}

		// 더 상세한 회원정보를 얻을 수 있는 API 입니다.
		// 차후 필요한 경우 위 return userInfo; 주석처리 후 사용하시면 됩니다.
		if (StringUtils.isEmpty(id)) return null;
		String header = "Bearer " + token; // Bearer 다음에 공백 추가
		String apiURL = "https://www.worksapis.com/v1.0/users/" + id;

		try {
			Map<String, String> requestHeaders = new HashMap<>();
			requestHeaders.put("Authorization", header);
			String responseBody = get(apiURL,requestHeaders);

			JsonParser parser = new JsonParser();
			Object obj = parser.parse(responseBody);
			JsonObject response = (JsonObject)obj;

			id = response.get("userId").getAsString();

			JsonObject jsonName = response.getAsJsonObject("userName");
			String familyName = jsonName.get("lastName").getAsString();
			String givenName = jsonName.get("firstName").getAsString();
			name = familyName + givenName;
			email = response.get("email").getAsString();

			parameter.setId(id);
			parameter.setEmail(email);
			parameter.setName(name);

			userInfo.put("id", id);
			userInfo.put("id_v1", id_v1);
		} catch (Exception e) {
			return null;
		}
		return userInfo;
	}

	private static List<String> separateIdToken(String idToken) {
		// 토큰을 '.'으로 분리하여 각 부분을 List에 저장
		String[] parts = idToken.split("\\.");  // 정규 표현식을 사용하여 '.'으로 분리

		// List로 변환하여 반환
		List<String> partList = new ArrayList<>();
		for (String part : parts) {
			partList.add(part);  // 각 부분을 리스트에 추가
		}

		return partList;
	}

	public static JsonObject decodeJWT(String part) {
		// Base64Url 디코딩
		String base64 = part
				.replace("-", "+")
				.replace("_", "/");

		// Base64 인코딩 문자열이 4의 배수가 되어야 하므로 패딩 추가
		while (base64.length() % 4 != 0) {
			base64 += "=";
		}

		try {
			// Base64 디코딩
			byte[] decodedBytes = Base64.getDecoder().decode(base64);

			// JSON 디코딩
			String jsonString = new String(decodedBytes);
			JsonParser parser = new JsonParser();
			Object obj = parser.parse(jsonString);
			JsonObject json = (JsonObject)obj;

			return json;
		} catch (IllegalArgumentException e) {
			System.out.println("Failed to decode Base64");
			return null;
		} catch (Exception e) {
			System.out.println("Error decoding JSON: " + e.getMessage());
			return null;
		}
	}



	private static String get(String apiUrl, Map<String, String> requestHeaders){
		HttpURLConnection con = connect(apiUrl);
		try {
			con.setRequestMethod("GET");
			for(Map.Entry<String, String> header :requestHeaders.entrySet()) {
				con.setRequestProperty(header.getKey(), header.getValue());
			}


			int responseCode = con.getResponseCode();
			if (responseCode == HttpURLConnection.HTTP_OK) { // 정상 호출
				return readBody(con.getInputStream());
			} else { // 에러 발생
				return readBody(con.getErrorStream());
			}
		} catch (IOException e) {
			throw new RuntimeException("API 요청과 응답 실패", e);
		} finally {
			con.disconnect();
		}
	}

	private static HttpURLConnection connect(String apiUrl){
		try {
			URL url = new URL(apiUrl);
			return (HttpURLConnection)url.openConnection();
		} catch (MalformedURLException e) {
			throw new RuntimeException("API URL이 잘못되었습니다. : " + apiUrl, e);
		} catch (IOException e) {
			throw new RuntimeException("연결이 실패했습니다. : " + apiUrl, e);
		}
	}

	private static String readBody(InputStream body){
		try {
			InputStreamReader streamReader = new InputStreamReader(body,"UTF-8");
			BufferedReader lineReader = new BufferedReader(streamReader);
			StringBuilder responseBody = new StringBuilder();
			String line;
			while ((line = lineReader.readLine()) != null) {
				responseBody.append(line);
			}
			return responseBody.toString();
		} catch (IOException e) {
			throw new RuntimeException("API 응답을 읽는데 실패했습니다.", e);
		}
	}
}
