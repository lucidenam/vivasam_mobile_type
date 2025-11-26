package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class SmsInfo {

	private String phone;
	private String subject;
	private String msg;

}
