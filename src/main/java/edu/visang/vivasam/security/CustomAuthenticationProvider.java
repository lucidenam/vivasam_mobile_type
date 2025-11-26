package edu.visang.vivasam.security;

import edu.visang.vivasam.exception.EPKIExpiredException;
import edu.visang.vivasam.exception.EPKIUnauthenticatedException;
import edu.visang.vivasam.exception.NotIdentifiedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.util.Map;

public class CustomAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {
    private MssqlPasswordEncoder passwordEncoder;
    private UserDetailsService userDetailsService;

    protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        if (authentication.getCredentials() == null) {
            this.logger.info("Authentication failed: no credentials provided");
            throw new BadCredentialsException(this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
        } else {
            String presentedPassword = authentication.getCredentials().toString();

            if (!this.passwordEncoder.matches(presentedPassword, userDetails.getPassword())) {
                this.logger.info("Authentication failed: password does not match stored value");
//                throw new BadCredentialsException(this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
                throw new BadCredentialsException(this.messages.getMessage(null , ""));
            }else {
                UserPrincipal user = (UserPrincipal) userDetails;
                this.logger.info(user);

                this.logger.info("본인인증여부 체크");
                if(!"Y".equals(user.getIdentifiedYN())) {
                    throw new NotIdentifiedException("본인인증이 필요합니다.");
                }

                //[SSO] 교사 인증기간 만료나 미인증도 로그인 처리한다
                this.logger.info("교사인증여부 체크");
                //교사인증여부체크
//                if(!"Y".equals(user.getValidYn())) {
//                    throw new EPKIUnauthenticatedException("교사인증이 필요합니다.");
//                }

                CustomUserDetailsService customUserDetailsService = (CustomUserDetailsService)userDetailsService;

                if("Y".equals(user.getValidYn())) { //교사 인증 확인
                    Map<String, String> validEpki = customUserDetailsService.checkVaildEndDate(authentication.getPrincipal().toString());
                    if (validEpki != null  && validEpki.containsKey("certValidTerm") && validEpki.get("certValidTerm") != null && Integer.parseInt(validEpki.get("certValidTerm")) < 0) {
                        //교사 인증 기간이 만료된 경우
                        user.setTeacherCertifiedYN("N");
                    } else {
                        user.setTeacherCertifiedYN("Y");
                    }
                }


                //기존 sha1 pwd를 sha512로 변경하기
                //TODO : SHA1 ENCODE 값이 변형되는 문제가 있는듯.... 해결해야함....
                if(StringUtils.hasText(user.getSha1Pwd())) {
                    customUserDetailsService.changeMemberPwdSha2(authentication.getPrincipal().toString(), authentication.getCredentials().toString());
                }

//                Map<String, String> validEpki = customUserDetailsService.checkVaildEndDate(authentication.getPrincipal().toString());


            }
        }
    }

    protected void doAfterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "A UserDetailsService must be set");
    }

    protected final UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        try {
            UserDetails loadedUser = this.getUserDetailsService().loadUserByUsername(username);
            if (loadedUser == null) {
                throw new InternalAuthenticationServiceException("UserDetailsService returned null, which is an interface contract violation");
            } else {
                return loadedUser;
            }
        } catch (UsernameNotFoundException var4) {
            throw var4;
        } catch (InternalAuthenticationServiceException var5) {
            throw var5;
        } catch (Exception var6) {
            throw new InternalAuthenticationServiceException(var6.getMessage(), var6);
        }
    }

    public void setPasswordEncoder(MssqlPasswordEncoder passwordEncoder) {
        Assert.notNull(passwordEncoder, "passwordEncoder cannot be null");
        this.passwordEncoder = passwordEncoder;
    }

    protected MssqlPasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
    }

    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    protected UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

}
