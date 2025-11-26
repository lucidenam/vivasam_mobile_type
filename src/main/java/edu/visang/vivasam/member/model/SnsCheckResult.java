package edu.visang.vivasam.member.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SnsCheckResult {
	private boolean error = false;
	private boolean result = false;
	private boolean join = false;
	private String msg;
	private List<String> list;
	private String memberId;

	public SnsCheckResult(){}

	public SnsCheckResult(boolean error, String msg) {
		this.error = error;
		this.msg = msg;
	}

	public SnsCheckResult(boolean result) {
		this.result = result;
	}

	public SnsCheckResult(boolean result, boolean join) {
		this.result = result;
		this.join = join;
	}

	public SnsCheckResult(boolean result, List<String> list) {
		this.result = result;
		this.list = list;
	}
}
