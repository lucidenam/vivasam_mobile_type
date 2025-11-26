package edu.visang.vivasam.common.model;

import lombok.Data;

@Data
public class SmsLog {
	private int idx;
	private String uid;
	private String title;
	private String contents;
	private String results;
}
