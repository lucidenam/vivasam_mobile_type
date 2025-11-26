package edu.visang.vivasam.device.controller;

import edu.visang.vivasam.device.model.AppToken;
import edu.visang.vivasam.device.service.AppTokenService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import eu.bitwalker.useragentutils.UserAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 *
 *
 * curl -X POST \
 *   'http://localhost:8000/api/app/token?sync=&user=chiang&value=app_token_aaaa' \
 *   -H 'cache-control: no-cache' \
 *   -d '{"username": "tester", "password": "1234"}'
 *
 */
@RestController
@RequestMapping("/api/app")
public class DeviceController {

    public static final Logger logger = LoggerFactory.getLogger(DeviceController.class);

    @Autowired
    AppTokenService appTokenService;

    @RequestMapping(value = "/token", params = "sync", method = RequestMethod.POST)
    public void syncFirebaseAppToken(@RequestHeader(value="User-Agent") String userAgentString,
                                     @RequestParam(value = "user", required = false) String userName,
                                     @RequestParam("value") String token,
                                     @CurrentUser UserPrincipal currentUser) {

        logger.info("푸시 메시지 기능을 위한 앱 토큰 정보를 동기화합니다. 아이디: {}, 토큰: {}, User Agent{}", userName, token, userAgentString);

        UserAgent userAgent = UserAgent.parseUserAgentString(userAgentString);

        AppToken appToken = new AppToken();
        appToken.setToken(token);
        appToken.setMemberId(userName);//TODO check user name
        if (userAgent.getOperatingSystem() != null) {
            appToken.setOs(userAgent.getOperatingSystem().getName());
        }

        appTokenService.syncToken(appToken, currentUser);
    }
}
