package edu.visang.vivasam.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;

@Data
@ToString
public class UserPrincipal implements UserDetails {
    private String memberId; /*아이디*/
    private String ssoMemberYN; /*통합회원 여부*/
    private String identifiedYN; /*본인인증 여부*/
    private String teacherCertifiedYN; /*교사인증 유효여부*/
    private String memberName; /*성명*/
    private String validYn; /*인증여부*/
    private String mTypeCd; /* 회원구분 */
    private String schoolName; /*학교명*/
    private String schoolLvlCd; /*선택 학교 기준 학교급(ES, MS, HS)*/
    private String teacherYn; /*미사용*/
    private String grinfoId; /*미사용*/
    private String grinfoName; /*미사용*/
    private String mainSubject; /*메인 대표교과코드*/
    private String mainSubjectName; /*메인 대표교과명*/
    private String secondSubject; /*서브 대표교과코드*/
    private String secondSubjectName;/*서브 대표교과명*/
    private String profileImgPath;/*미사용(프로파일 이미지 경로)*/
    private String visangTbYN;/*비상교과서채택여부*/
    private String mLevel;/*회원 레벨(AU300:정회원,AU400:준회원)*/
    private String loginType;
    @JsonIgnore
    private String myGrade;
    @JsonIgnore
    private String valEndDate;
    @JsonIgnore
    private String firstYn; /*인증 후 첫 로그인 여부*/
    @JsonIgnore
    private String lastDate;
    @JsonIgnore
    private String sha1Pwd;
    @JsonIgnore
    private String sha2Pwd;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private String ceritfyCheck; /* 교사 인증 체크 */
    private String epkiYn; /* EPKI 인증 체크 */
    private String regDate;

    @Override
    public String getUsername() {
        return memberId;
    }
    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPrincipal that = (UserPrincipal) o;
        return Objects.equals(memberId, that.memberId);
    }
    @Override
    public int hashCode() {
        return Objects.hash(memberId);
    }
}
