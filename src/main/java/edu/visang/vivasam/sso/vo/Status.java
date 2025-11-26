package edu.visang.vivasam.sso.vo;







public class Status {



	private Boolean error;

	private Integer code;

	private String type;



	private String message;

	

	public Status(Integer code, String type, String message) {

		this.error = false;

		this.code = code;

		this.type = type;

		this.message = message;

	}

	

	public Status(Boolean error, Integer code, String type, String message) {

		this.error = error;

		this.code = code;

		this.type = type;

		this.message = message;

	}





	public Boolean getError() {

		return error;

	}





	public Integer getCode() {

		return code;

	}





	public String getType() {

		return type;

	}





	public String getMessage() {

		return message;

	}



	

	

}

