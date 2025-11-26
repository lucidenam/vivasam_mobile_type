package edu.visang.vivasam.common.utils;

/* 문자열 치환 Class
 * 2022-03-24
 */
import org.springframework.stereotype.Component;

public class RegexUtil {
	// 숫자
	public static String regexNumber(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[0-9]*$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		return regexValue;
	}
	// 영문자 치환
	public static String regexEString(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[a-zA-Z]*$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		return regexValue;
	}
	// 한글 치환
	public static String regexHString(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[가-힣]*$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 영어 & 숫자 치환
	public static String regexEHString(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[a-zA-Z0-9]*$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 비밀번호 (숫자, 문자 포함의 6~12자리 이내)
	public static String regexPassword(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[A-Za-z0-9]{6,12}$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		return regexValue;
	}
	// 비밀번호 (숫자, 문자, 특수문자 포함 8~15자리 이내)
	public static String regexPasswords(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^.*(?=^.{8,15}$)(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 이메일
	public static String regexEmail(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 휴대전화
	public static String regexMobile(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("\t^\\\\d{3}-\\\\d{3,4}-\\\\d{4}$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 일반전화
	public static String regexHp(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("\t^\\\\d{2,3}-\\\\d{3,4}-\\\\d{4}$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 주민등록번호
	public static String regexRnumber(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("\\d{6} \\- [1-4]\\d{6}")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 파일확장자
	public static String regexFile(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("^\\\\S+.(?i)(txt|pdf|hwp|xls)$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
	// 이중 파일확장
	public static String regexDoubleFile(String regexValue) {
		regexValue = "";
		for (int i = 0; i < regexValue.length(); i++) {
			if (String.valueOf(regexValue.charAt(i)).matches("(.+?)((\\\\.tar)?\\\\.gz)$")) {
				regexValue += regexValue.charAt(i); // 문자열 추가
			}
		}
		// 공백제거
		regexValue = regexValue.replaceAll(" ", "");
		// 치환 처리 리턴
		return regexValue;
	}
}
