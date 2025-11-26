package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class Mileage {

	private String memberId;
	private int amount;
	private String mileageCode;
	private String targetMenu;
	private String targetId;
	private String targetType;
	private String error;
	private String nowYear;

	public Mileage() {

	}

	public Mileage(String memberId, int amount, String mileageCode) {
		this.memberId = memberId;
		this.amount = amount;
		this.mileageCode = mileageCode;
		this.targetType = "MV";
	}
}
