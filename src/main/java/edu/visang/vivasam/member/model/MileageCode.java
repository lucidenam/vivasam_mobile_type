package edu.visang.vivasam.member.model;

/**
 * 마일리지 유형 구분
 * viva-elementary com.vivasam.elementary.mvc.data.enums.MileageCode 참조
 */
public enum MileageCode {

	JOIN_SSO("ML001", 100, "통합회원 가입"),
	JOIN_VIVA("ML002", 50, "단독회원 가입"),
	CHG_SSO("ML003", 50, "통합회원 전환"),
	AWAKE("ML004", 20, "휴면 해지"),
	LOGIN("ML005", 1, "로그인"),
	SURVEY("ML006", 5, "비바샘 설문조사 참여"),
	REPLY("ML007", 5, "댓글 등록"),
	APP_DOWNLOAD("ML008", 50, "모바일 앱 다운로드"),
	EVENT("ML009", 0, "이벤트 참여"),
	GIFT("ML010", 0, "연말 점수대별 선물 증정"),
	ADMIN_PLUS("ML011", 0, "관리자 수동 적립"),
	ADMIN_MINUS("ML012", 0, "관리자 수동 차감"),
	JOIN_RECO("ML016", 300, "추천인 아이디"),

	;
	
	private String code;
	private int amount;
	private String desc;
	
	MileageCode(String code, int amount, String desc) {
		this.code = code;
		this.amount = amount;
		this.desc = desc;
	}
	
	public String getCode() {
		return code;
	}
	
	public int getAmount() {
		return amount;
	}
	
	public String getDesc() {
		return desc;
	}
}
