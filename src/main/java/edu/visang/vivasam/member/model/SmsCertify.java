package edu.visang.vivasam.member.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class SmsCertify {
	private String memberId;
	private String cellphone;
	private String certifiNum;
	private String uuidForCertifiNum;

	private int result = 0;
}
