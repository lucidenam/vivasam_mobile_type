package edu.visang.vivasam.member.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class SnsLoginParameter implements Serializable {
	private String type;
	private String key;
	private String accessToken;
	private String birthday;
	private String year;
	private String email;
	private String phoneNumber;
	private String cellphone1;
	private String cellphone2;
	private String cellphone3;
	private String id;
	private String name;
	private String code;
	private String isIpin = "IPIN_CI_";
	private String memberId;
	private String signedRequest;
	private String idToken;
	private String ipinCi = "IPIN_CI_";
	private String inputData;
	private String clientsecret;
	private String refreshToken;
	private String apiId;
	private boolean infoCheck = false; // 개인정보 수정화면에서 사용하기위한 변수
	private boolean leaveCheck = false; // 회원탈퇴 화면에서 사용하기 위한 변수
	private String clientId = ""; 		// rest api 키
	private String clientSecret = ""; 		// rest api 키
	private String redirectUrl = "";	// redirect url
	private String state = "";	// whalespace state
}
