package edu.visang.vivasam.device.service;

import edu.visang.vivasam.device.mapper.AppTokenMapper;
import edu.visang.vivasam.device.model.AppToken;
import edu.visang.vivasam.member.mapper.MemberMapper;
import edu.visang.vivasam.member.model.Mileage;
import edu.visang.vivasam.member.model.MileageCode;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class AppTokenService {

    public static final Logger logger = LoggerFactory.getLogger(AppTokenService.class);

    @Autowired
    AppTokenMapper appTokenMapper;

    @Autowired
    MemberMapper memberMapper;

    @Autowired
    MemberMileageService memberMileageService;

    @Transactional
    public void syncToken(AppToken appToken, UserPrincipal currentUser) {
        if (StringUtils.hasText(appToken.getMemberId())) {
            String exist = memberMapper.checkExistId(appToken.getMemberId());
            logger.info("check exist user id: {}", exist);
            if ("0".equals(exist)) {//0 이면 기존 사용자가 없는 경우입니다.
                appToken.setMemberId(null); //오류 같은 거 처리하지 않고 그냥 null 로 설정합니다.
            }
        }

        String existToken = appTokenMapper.findByToken(appToken.getToken());
        if (StringUtils.hasText(existToken)) {
            appTokenMapper.updateAppToken(appToken);

            logger.info("기존 사용자 앱 토큰을 업데이트 했습니다.");
        }
        else {
            appTokenMapper.saveAppToken(appToken);
            logger.info("사용자 앱 토큰을 저장했습니다.");
        }

        // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
        if (currentUser != null && "AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
            // 앱다운로드 마일리지
            Mileage mileage = new Mileage(appToken.getMemberId(), MileageCode.APP_DOWNLOAD.getAmount(), MileageCode.APP_DOWNLOAD.getCode());
//			int chkExist = appTokenMapper.findByMemberId(currentUser.getMemberId());
            int chkExistMileage = memberMileageService.getMileageCntByMileageCode(mileage);

            if (chkExistMileage == 0) {
                memberMileageService.insertMileagePlus(mileage);
            }
        }
    }


}
