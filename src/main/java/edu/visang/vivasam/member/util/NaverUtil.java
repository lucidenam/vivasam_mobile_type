package edu.visang.vivasam.member.util;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import edu.visang.vivasam.member.model.SnsLoginParameter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class NaverUtil {

	/**
	 * 네이버 Access Token 으로 회원정보 조회
	 * */
	public static HashMap<String, Object> getUserInfo (String token, SnsLoginParameter parameter) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();

		String header = "Bearer " + token; // Bearer 다음에 공백 추가
		String apiURL = "https://openapi.naver.com/v1/nid/me";
		try {
			Map<String, String> requestHeaders = new HashMap<>();
			requestHeaders.put("Authorization", header);
			String responseBody = get(apiURL,requestHeaders);
			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(responseBody);
			JsonElement response = element.getAsJsonObject().get("response");

			String id = response.getAsJsonObject().get("id").getAsString();
			String email = "";
			String mobile = "";
			String name = "";
			String birthday = "";
			String year = "";
			try {
				email = getString(response, "email");
				mobile = getString(response, "mobile");
				name = getString(response, "name");
				birthday = getString(response, "birthday");
				year = getString(response, "birthyear");
			}
			catch (Exception ex) {

			}

			//국제번호인 경우
			if(!mobile.contains("010")) {
				mobile = "";
			}

			// id를설정하지않는경우는
			parameter.setId(id);
			parameter.setEmail(email);
			parameter.setPhoneNumber(mobile);
			parameter.setName(name);
			parameter.setYear(year + birthday.replaceAll("-",""));

			userInfo.put("id", id);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			return null;
		}
		return userInfo;
	}

	/**
	 * 네이버 Access Token 으로 회원정보 연동해제
	 */
	public static boolean unlinkUserInfo(String token, String naverClientId, String naverClientSecret) {

		String apiURL = "https://nid.naver.com/oauth2.0/token?";
		try {
			apiURL += "service_provider=" + "NAVER&"; // 고정값 API 명세에는 없지만 해당값이 없는경우 호출이 안됨. https://developers.naver.com/forum/posts/21714 참조
			apiURL += "grant_type=" + "delete&"; // 요청 타입. delete 으로 설정
			apiURL += "client_id=" + naverClientId + "&"; // 애플리케이션 등록 시 발급받은 Client ID 값
			apiURL += "client_secret=" + naverClientSecret + "&"; // 애플리케이션 등록 시 발급받은 Client Secret 값
			apiURL += "access_token=" + token; // 유효한 접근토큰 값

			String responseBody = get(apiURL, null);
			JsonParser parser = new JsonParser();
			JsonElement element = parser.parse(responseBody);
			JsonElement result = element.getAsJsonObject().get("result");

			if (result == null || !"success".equals(result.getAsString())) {
				return false;
			}
		} catch (Exception e) {
			return false;
		}
		return true;
	}

	private static String getString(JsonElement response, String name) {
		try {
			return response.getAsJsonObject().get(name).getAsString();
		}
		catch (Exception e) {
			return "";
		}
	}

	private static String get(String apiUrl, Map<String, String> requestHeaders){
		HttpURLConnection con = connect(apiUrl);
		try {
			con.setRequestMethod("GET");
			if(requestHeaders != null) {
				for (Map.Entry<String, String> header : requestHeaders.entrySet()) {
					con.setRequestProperty(header.getKey(), header.getValue());
				}
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
		InputStreamReader streamReader = new InputStreamReader(body);
		try (BufferedReader lineReader = new BufferedReader(streamReader)) {
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