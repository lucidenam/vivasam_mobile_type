package edu.visang.vivasam.security;

import io.jsonwebtoken.*;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {
    private static  final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private long jwtExpirationInMs;

    public String generateToken(Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("memberId", userPrincipal.getMemberId());
        memberInfo.put("memberName", userPrincipal.getMemberName());
        memberInfo.put("mainSubjectName", userPrincipal.getMainSubjectName());
        memberInfo.put("mainSubject", userPrincipal.getMainSubject());
        memberInfo.put("schoolLvlCd", userPrincipal.getSchoolLvlCd());
        memberInfo.put("mLevel", userPrincipal.getMLevel());
        memberInfo.put("mTypeCd", userPrincipal.getMTypeCd());
        memberInfo.put("certifyCheck", userPrincipal.getCeritfyCheck()); // 교사 인증 부분 추가
        memberInfo.put("ssoMemberYN", userPrincipal.getSsoMemberYN());
        memberInfo.put("teacherCertifiedYN", userPrincipal.getTeacherCertifiedYN());
        memberInfo.put("epkiYn", userPrincipal.getEpkiYn());
        memberInfo.put("loginType", "LOGIN");
        memberInfo.put("regDate", userPrincipal.getRegDate());

        return Jwts.builder()
                .setSubject(userPrincipal.getMemberId())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .setSubject(userPrincipal.getMemberId())
                .claim("memberInfo", memberInfo)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateTokenBySns(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("memberId", userPrincipal.getMemberId());
        memberInfo.put("memberName", userPrincipal.getMemberName());
        memberInfo.put("mainSubjectName", userPrincipal.getMainSubjectName());
        memberInfo.put("mainSubject", userPrincipal.getMainSubject());
        memberInfo.put("schoolLvlCd", userPrincipal.getSchoolLvlCd());
        memberInfo.put("mLevel", userPrincipal.getMLevel());
        memberInfo.put("mTypeCd", userPrincipal.getMTypeCd());
        memberInfo.put("certifyCheck", userPrincipal.getCeritfyCheck()); // 교사 인증 부분 추가
        memberInfo.put("ssoMemberYN", userPrincipal.getSsoMemberYN());
        memberInfo.put("teacherCertifiedYN", userPrincipal.getTeacherCertifiedYN());
        memberInfo.put("loginType", userPrincipal.getLoginType());
        memberInfo.put("regDate", userPrincipal.getRegDate());

        return Jwts.builder().setSubject(userPrincipal.getMemberId()).setIssuedAt(new Date()).setExpiration(expiryDate)
                .setSubject(userPrincipal.getMemberId()).claim("memberInfo", memberInfo)
                .signWith(SignatureAlgorithm.HS512, jwtSecret).compact();
    }

    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public Claims getUserInfo(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }

    public String parseLoginTypeFromRequest(HttpServletRequest request) {
        // JwtAuthenticationFilter.getJwtFromRequest(HttpServletRequest) 참조
        String token = request.getHeader("Authorization").replaceAll("Bearer ", "");
        if (StringUtils.isBlank(token)) return null;
        return this.parseLoginTypeFromAccessToken(token);
    }

    public String parseLoginTypeFromAccessToken(String token) {
        Claims claims = this.getUserInfo(token);
        Object memberInfo = claims.get("memberInfo");
        if (memberInfo == null) return  null;

        Map memberInfoMap = (Map) memberInfo;

        // loginType 추가전 token 생성되었을 경우 loginType 이 null 일수 있음
        Object loginTypeObj = memberInfoMap.get("loginType");
        return loginTypeObj != null ? loginTypeObj.toString() : null;
    }

}
