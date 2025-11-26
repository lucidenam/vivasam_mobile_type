package edu.visang.vivasam.common.model;

import lombok.Data;

@Data
public class EmailLogParameter {
	private int idx;
	private String vsCode;
	private String uid;
	private String title;
	private String contents;
	private String results;
}
