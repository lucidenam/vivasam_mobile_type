package edu.visang.vivasam.member.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.member.model.SnsLoginParameter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.io.*;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.*;

public class AppleUtil {

	/**
	 * 네이버 Access Token 으로 회원정보 조회
	 */
	public static HashMap<String, Object> getUserInfo(SnsLoginParameter parameter, String retUrl) {
		//    요청하는 클라이언트마다 가진 정보가 다를 수 있기에 HashMap타입으로 선언
		HashMap<String, Object> userInfo = new HashMap<>();
		try {
			// 1. JWT 토큰 decode
			Map<String, Object> jwtMap = jwtToMap(parameter.getAccessToken());
			// JWT가 아닌경우 예외처리
			if (jwtMap == null) {
				return null;
			}

			Map<String, String> header = (Map<String, String>) jwtMap.get("header");
			// 3. Header값을 통해 애플에서 Public Key 조회
			Optional<Map<String, String>> key = getPublicKey(header.get("alg"), header.get("kid"));
			// Public Key를 찾을 수 없는경우 예외처리
			if (!key.isPresent()) {
				return null;
			}


			byte[] nBytes = Base64.getUrlDecoder().decode(key.get().get("n"));
			byte[] eBytes = Base64.getUrlDecoder().decode(key.get().get("e"));

			BigInteger n = new BigInteger(1, nBytes);
			BigInteger e = new BigInteger(1, eBytes);

			RSAPublicKeySpec publicKeySpec = new RSAPublicKeySpec(n, e);
			KeyFactory keyFactory = null;
			keyFactory = KeyFactory.getInstance(key.get().get("kty"));
			PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);

			// 4. Public Key로 JWT토큰 검증
			Claims claims = Jwts.parser().setSigningKey(publicKey).parseClaimsJws(parameter.getAccessToken()).getBody();
			parameter.setId(claims.get("sub").toString());
			if (!claims.get("email").toString().contains("@privaterelay.appleid.com")) {
				parameter.setEmail(claims.get("email").toString());
			}
			userInfo.put("sub", claims.get("sub").toString());
		} catch (Exception e) {
			return null;
		}
		return userInfo;
	}

	private static Map<String, Object> jwtToMap(String jwt) {
		try {
			Map<String, Object> result = new HashMap<>();
			String[] splitJwt = jwt.split("\\.");
			ObjectMapper objectMapper = new ObjectMapper();
			Base64.Decoder decoder = Base64.getDecoder();

			String headerString = new String(decoder.decode(splitJwt[0]), StandardCharsets.UTF_8);
			String payloadString = new String(decoder.decode(splitJwt[1]), StandardCharsets.UTF_8);
//       String signatureString = new String(decoder.decode(splitJwt[2]), StandardCharsets.UTF_8);

			result.put("header", objectMapper.readValue(headerString, Map.class));
			result.put("payload", objectMapper.readValue(payloadString, Map.class));
			result.put("signature", splitJwt[2]);

			return result;
		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	private static Optional<Map<String, String>> getPublicKey(String alg, String kid) {

		List<Map<String, String>> keys = new ArrayList<>();

		String apiURL = "https://appleid.apple.com/auth/keys";
		try {
			URL url = new URL(apiURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");

			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));

			String line = "";
			String result = "";
			while ((line = br.readLine()) != null) {
				result += line;
			}

			ObjectMapper objectMapper = new ObjectMapper();

			Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);

			keys = (ArrayList) resultMap.get("keys");
			return keys.stream().filter(key -> alg.equals(key.get("alg")) && kid.equals(key.get("kid"))).findFirst();
		} catch (IOException e) {
			return null;
		}
	}
}
