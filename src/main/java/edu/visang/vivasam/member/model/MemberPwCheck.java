package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class MemberPwCheck {
	private String memberId;
	private String memberPw;
	private String type;
}
