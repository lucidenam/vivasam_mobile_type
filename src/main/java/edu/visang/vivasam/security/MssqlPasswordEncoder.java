package edu.visang.vivasam.security;

import edu.visang.vivasam.security.mapper.SecurityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class MssqlPasswordEncoder {
    private static final Logger logger = LoggerFactory.getLogger(MssqlPasswordEncoder.class);

    @Autowired
    private SecurityMapper securityMapper;

    @Value("${spring.profiles.active}")
    private String activeEnv;

    public Passwords encode(CharSequence rawPassword) {
        Passwords passwords = securityMapper.encode(rawPassword.toString());
        return passwords;
    }

    public boolean matches(CharSequence rawPassword, String encodedPassword) {

        if (StringUtils.isEmpty(encodedPassword)) {
            logger.warn("Empty encoded password");
            return false;
        }

        Passwords passwords = encode(rawPassword);
        if(passwords == null || (StringUtils.isEmpty(passwords.getOldPassword()) && StringUtils.isEmpty(passwords.getNewPassword()))) {
            logger.warn("password encoding error");
            return false;
        }
        String oldPassword = passwords.getOldPassword();
        String newPassword = passwords.getNewPassword();

        if(!StringUtils.isEmpty(encodedPassword)) {
            if (encodedPassword.equals(oldPassword)) {
                return true;
            }
            if (encodedPassword.equals(newPassword)) {
                return true;
            }
            // FIXME 인코딩 문제 인 것 같은데, 일단은 임시로 로그인 가능하게 처리
            // return !"prod".equals(activeEnv);
        }

        return false;
    }
}
