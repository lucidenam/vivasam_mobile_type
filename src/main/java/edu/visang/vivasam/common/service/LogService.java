package edu.visang.vivasam.common.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.common.mapper.LogMapper;
import edu.visang.vivasam.common.model.LogSignIn;
import edu.visang.vivasam.common.model.LogToken;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpSession;

@Service
public class LogService {
    @Autowired
    LogMapper logMapper;

    @Transactional
    public String logMemberSignIn(LogSignIn logSignIn) {

        if (logSignIn == null)
            return null;

        if ((logSignIn.getLogType() == null) || (logSignIn.getUserId() == null) || (logSignIn.getSessId() == null))
            return null;
        try {
            int rsltValue = logMapper.logSignIn(logSignIn);

            // 기존 인증 토큰 모두 삭제(비활성화)
            logMapper.deleteTokenByMemberId(logSignIn.getUserId());

            // 로그인 성공하면 로그인 외부 검증용 토큰 발급처리
            ObjectMapper objectMapper = new ObjectMapper();
            LogToken logToken = objectMapper.convertValue(logSignIn, LogToken.class);
            String token = VivasamUtil.generateRandomToken();
            logToken.setToken(token);            rsltValue += logMapper.tokenGenerate(logToken);
            return token;
        } catch (Exception e) {
            e.printStackTrace();
            // logger.info(e.toString());
        }

        return null;

    }

    public void logMaterialView(String memberId, String contentId) {
        try {
            int rsltValue = logMapper.logMaterialView(memberId, contentId);
        } catch (Exception e) {
            // logger.info(e.toString());
        }
    }

    public int deleteTokenByMemberId(UserPrincipal currentUser, HttpSession session) {
        //로그아웃 처리
        LogSignIn logSignIn = new LogSignIn();
        logSignIn.setLogType("O");
        logSignIn.setUserId(currentUser.getMemberId());
        logSignIn.setSessId(session.getId());
        int result = logMapper.logSignIn(logSignIn);
        result += logMapper.deleteTokenByMemberId(currentUser.getMemberId());
        return result;
    }
}
