package edu.visang.vivasam.member.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class MemberValidateEmail {
	private String email;
	private String memberId;
	private String certification;
	private String certifiNum;
	private String uuidForCertifiNum;
	private boolean emailTest;

	private int result = 0;
}
