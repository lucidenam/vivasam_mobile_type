package edu.visang.vivasam.common.model;

import lombok.Data;

@Data
public class EpkStatusInfo {
	private int epkId;
	private String regId;
	private String regDttm;
	private String epkStatusCd;
	private String ansAdmId;
	private String ansDttm;
	private String uptAdmId;
	private String uptDttm;
	private String attachFile;
	private String attachFile2;
	private String attachFile3;
	private String comment;
	private String type;
}
