package edu.visang.vivasam.sso.vo;



public class ParamVo {

	private String ci;
	private String username;
	private String password;
	private String password_confirmation;
	private String v_BeforeID;
	private String v_AfterID;
	private String v_FromSite;
	private int returnIntValue;
	private String fail_log;
	private String proc_gn;
	private String mem_gn;             //회원구분 ('H': 휴면   , 'A' : 활동중 , 'N' : 해당사항없음)
	private String after_id_exist;           //to_be 아이디 존재여부 (Y/N)
	private String before_id_exist;           //to_be 아이디 존재여부 (Y/N)
	private String before_id_rest_exist;     //as_is 아이디 휴면 존재여부 (Y/N)
	private String ci_rest_yn;               //ci 휴면 존재여부 (Y/N)


	public String getBefore_id_exist() {
		return before_id_exist;
	}

	public void setBefore_id_exist(String before_id_exist) {
		this.before_id_exist = before_id_exist;
	}

	public String getBefore_id_rest_exist() {
		return before_id_rest_exist;
	}

	public void setBefore_id_rest_exist(String before_id_rest_exist) {
		this.before_id_rest_exist = before_id_rest_exist;
	}

	public String getCi_rest_yn() {
		return ci_rest_yn;
	}

	public void setCi_rest_yn(String ci_rest_yn) {
		this.ci_rest_yn = ci_rest_yn;
	}


	public String getAfter_id_exist() {
		return after_id_exist;
	}

	public void setAfter_id_exist(String after_id_exist) {
		this.after_id_exist = after_id_exist;
	}

	public int getReturnIntValue() {
		return returnIntValue;
	}

	public void setReturnIntValue(int returnIntValue) {
		this.returnIntValue = returnIntValue;
	}

	public String getV_FromSite() {
		return v_FromSite;
	}

	public void setV_FromSite(String v_FromSite) {
		this.v_FromSite = v_FromSite;
	}

	public String getMem_gn() {
		return mem_gn;
	}

	public void setMem_gn(String mem_gn) {
		this.mem_gn = mem_gn;
	}

	public String getV_BeforeID() {
		return v_BeforeID;
	}

	public void setV_BeforeID(String v_BeforeID) {
		this.v_BeforeID = v_BeforeID;
	}

	public String getV_AfterID() {
		return v_AfterID;
	}

	public void setV_AfterID(String v_AfterID) {
		this.v_AfterID = v_AfterID;
	}

	public String getFail_log() {
		return fail_log;
	}

	public void setFail_log(String fail_log) {
		this.fail_log = fail_log;
	}

	public String getProc_gn() {
		return proc_gn;
	}

	public void setProc_gn(String proc_gn) {
		this.proc_gn = proc_gn;
	}

	public String getCi() {
		return ci;
	}

	public void setCi(String ci) {
		this.ci = ci;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword_confirmation() {
		return password_confirmation;
	}

	public void setPassword_confirmation(String password_confirmation) {
		this.password_confirmation = password_confirmation;
	}
}

