package edu.visang.vivasam.member.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SnsMemberInfo {
	private String snsType;
	private String snsId;
	private String memberId;
	private String insertDate;
	private String deleteDate;
	private String useYn;
	private int joinPath;
}