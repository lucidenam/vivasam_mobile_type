package edu.visang.vivasam.creative.model;

import lombok.Data;

@Data
public class CreativeParam {

	private String fctId;
	private String year;
	private String month;
	private String day;

	private String educourseId;
	private String type1;
	private String type2;
	private String type3;

	private int pageNo = 1;
	private int pageSize = 10;
}