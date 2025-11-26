package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class MemberResult {

	private String memberId;
	private String name;
	private String memberEMail;
	private String certifiNum;
	private String uuidForCertifiNum;

	private String code;
	private String msg;
	private String procResultValue;
	private String bannerType;
	private String redirectURL;
	private boolean isSuccess = false;
	private Object object;
}
