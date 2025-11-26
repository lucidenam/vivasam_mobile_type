package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class Sms {
	private String phoneNumber;
	private String sndPhn;
	private String rcvPhn;
	private String callBack;
	private String smsMsg;
	private String authCode;

}
