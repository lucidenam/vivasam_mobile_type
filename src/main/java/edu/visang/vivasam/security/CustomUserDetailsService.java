package edu.visang.vivasam.security;

import edu.visang.vivasam.exception.NotIdentifiedException;
import edu.visang.vivasam.security.mapper.SecurityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    SecurityMapper securityMapper;
    @Autowired
    UserDetailsService userDetailsService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserPrincipal userPrincipal = securityMapper.findByUserId(username);

        if(userPrincipal == null || StringUtils.isEmpty(userPrincipal.getMemberId())) {
            //throw new UsernameNotFoundException("Member not found with id : " + username);
            return userPrincipal;
        }
        //FIXME : 일반권한으로 ROLE_USER를 넣어준다. 1ASIS 소스 분석후 필요시 권한 세분화하기.
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        userPrincipal.setAuthorities(authorities);

        return userPrincipal;
    }

    public UserPrincipal loadUserByUsernameSns(String username) throws UsernameNotFoundException {
        UserPrincipal userPrincipal = securityMapper.findByUserId(username);
        if (userPrincipal == null || StringUtils.isEmpty(userPrincipal.getMemberId())) {
            throw new UsernameNotFoundException("Member not found with id : " + username);
        }
        else {
            this.logger.info("본인인증여부 체크");
            if (!"Y".equals(userPrincipal.getIdentifiedYN())) {
                throw new NotIdentifiedException("본인인증이 필요합니다.");
            }
            // [SSO] 교사 인증기간 만료나 미인증도 로그인 처리한다
            this.logger.info("교사인증여부 체크");
            // 교사인증여부체크
            // if(!"Y".equals(user.getValidYn())) {
            //  throw new EPKIUnauthenticatedException("교사인증이 필요합니다.");
            // }
            CustomUserDetailsService customUserDetailsService = (CustomUserDetailsService) userDetailsService;

            if ("Y".equals(userPrincipal.getValidYn())) { // 교사 인증 확인
                Map<String, String> validEpki = customUserDetailsService
                        .checkVaildEndDate(username);
                if (validEpki != null && validEpki.containsKey("certValidTerm") && validEpki.get("certValidTerm") != null
                        && Integer.parseInt(validEpki.get("certValidTerm")) < 0) {
                    // 교사 인증 기간이 만료된 경우
                    userPrincipal.setTeacherCertifiedYN("N");
                } else {
                    userPrincipal.setTeacherCertifiedYN("Y");
                }
            }
        }
        return userPrincipal;
    }

    public void changeMemberPwdSha2(String memberId, String password) {
        changeMemberPwdSha2(memberId, password);
    }
    public Map<String, String> checkVaildEndDate(String memeberId) {
        return securityMapper.checkVaildEndDate(memeberId);
    }

}
