package edu.visang.vivasam.payload;

import edu.visang.vivasam.member.model.SnsLoginParameter;
import org.hibernate.validator.constraints.NotBlank;

/**
 * Created by rajeevkumarsingh on 02/08/17.
 */
public class LoginRequest {
    @NotBlank(message = "아이디를 입력하세요.")
    private String username;

    @NotBlank(message = "비밀번호를 입력하세요.")
    private String password;

    private SnsLoginParameter snsLoginParameter;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public SnsLoginParameter getSnsLoginParameter() {
        return snsLoginParameter;
    }

    public void setSnsLoginParameter(SnsLoginParameter snsLoginParameter) {
        this.snsLoginParameter = snsLoginParameter;
    }

    private int retCnt;

    public int getRetCnt() { return retCnt; }

    public void setRetCnt(int retCnt) { this.retCnt = retCnt; }
}
