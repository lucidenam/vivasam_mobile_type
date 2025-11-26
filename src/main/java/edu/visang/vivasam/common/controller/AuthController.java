package edu.visang.vivasam.common.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.api.ApiConnectionUtil;
import edu.visang.vivasam.api.data.ApiInputData;
import edu.visang.vivasam.common.constant.VivasamConstant;
import edu.visang.vivasam.common.model.LogSignIn;
import edu.visang.vivasam.common.service.LogService;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.config.GlobalConfig;
import edu.visang.vivasam.exception.RestingAccountException;
import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.member.service.MemberService;
import edu.visang.vivasam.payload.JwtAuthenticationResponse;
import edu.visang.vivasam.payload.LoginReCaptcha;
import edu.visang.vivasam.payload.LoginRequest;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.CustomUserDetailsService;
import edu.visang.vivasam.security.JwtTokenProvider;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JwtTokenProvider tokenProvider;
    @Autowired
    MemberService memberService;
    @Autowired
    MemberMileageService memberMileageService;
    @Autowired
    LogService logService;
    @Autowired
    Environment environment;
    @Autowired
    CustomUserDetailsService customUserDetailsService;
    @Autowired
    GlobalConfig globalConfig;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpSession session) {
        logger.info("############# Login Process");
//        loginRequest.setPassword(memberService.decryptText(loginRequest.getPassword()));
        // 가입 여부 아이디 조회
        String existIds = memberService.checkExistId(loginRequest.getUsername());
        // 휴면계정여부 조회
        String memberChk = memberService.AccountManageSignIn(loginRequest.getUsername());

        if("0".equals(existIds)){
            throw new BadCredentialsException("");
        }else {
            if ("X1ISRESTINGY1".equals(memberChk)) {
                throw new RestingAccountException("휴면계정입니다.");
            }
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal user = (UserPrincipal)authentication.getPrincipal();

 		// 교사인증 부분 업데이트
        user.setCeritfyCheck(memberService.checkCertifyCheck(user.getMemberId()));

        //최종 로그인일시 업데이트
        memberService.updateSignInDateTime(user.getMemberId());

        //사용자 필수 회원 정보 확인
        String memberRequiredChk = "N";
        int memberRequiredChkInt = memberService.getMemberReqChk(user.getMemberId());
        if(memberRequiredChkInt == 0) {
            memberRequiredChk = "Y";
        }

        String ssoMemChkYn = "N";
        if( "Y".equals(user.getSsoMemberYN()) && "true".equals(environment.getProperty("vivasam_sso_login_mode")) ) {
            logger.info("############# Blocked SSO Login Mode !!!!!");
            //티스쿨 로그인 시간 기록

            //최종 SSO 로그인일시 업데이트
            memberService.updateSsoSignInDateTime(user.getMemberId());

            // www.tschool.net으로 호출하는 부분 임시 막음 처리.. 서버 내에서 티스쿨 서버 호출 안됨.
//			new ElasticLoginClient().syncTuserLoginDttm(user.getMemberId());

			try {
				// 24.11.17 통합회원 로그인 처리 sso 호출하도록 수정
				ApiInputData apiParam = new ApiInputData();
				apiParam.setSrcConnSite("0"); // 0: vivasam
				apiParam.setSrcProcMethod("0"); // 0: 자체 로그인
				apiParam.setMemberId(user.getMemberId());
				apiParam.setMemberPassword(loginRequest.getPassword());
				new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
						.loginUser(apiParam);
			} catch (Exception e) {
				e.printStackTrace();
				throw new RestingAccountException("통합회원 로그인 시 서버 처리 관련 오류가 발생하였습니다.");
			}

            HashMap<String, String> ssoChkParam = new HashMap<String, String>();
            ssoChkParam.put("memberId", user.getMemberId());
            ssoChkParam.put("addRequiredYn", "N");
            ssoChkParam.put("isSsoMember", "1");
            ssoMemChkYn = memberService.rMemberRequiredCheck(ssoChkParam);
        }

        // 정회원, 교사인증, 교사회원일 경우 로그인 마일리지 지급
        if ("AU300".equals(user.getMLevel()) && "Y".equals(user.getValidYn()) && "0".equals(user.getMTypeCd())) {
            // 로그인 마일리지를 지급
            Mileage mileage = new Mileage(user.getMemberId(), MileageCode.LOGIN.getAmount(), MileageCode.LOGIN.getCode());
            // 오늘 로그인 마일리지를 지급했는지 체크
            int chkExist = memberMileageService.getMileageCntByTodayLogin(mileage);
            if(chkExist == 0) {
                memberMileageService.insertMileagePlus(mileage);
            }
        }

        //로그인 접근 로그 저장
        LogSignIn logSignIn = new LogSignIn();
        logSignIn.setLogType(VivasamConstant.STAT_SIGNIN);
        logSignIn.setRemoteIp(request.getRemoteAddr());
        logSignIn.setUserId(user.getMemberId());
        //FIXME : API서버에서 세션 정책 문의하기....+
        logSignIn.setSessId(session.getId());
        String token = logService.logMemberSignIn(logSignIn);

        String jwt = tokenProvider.generateToken(authentication);

        //TODO : 중복로그인 세션 정보 저장??? 중복로그인 문제는 어떻게 처리할지 문의.
        //웹에서만 중복로그인 체크
        if(!VivasamUtil.isApp(request)) {
            //  !!!  중복로그인 세션 정보 저장  !!!  시작;
            memberService.addUserInfo(user.getMemberId(), jwt, VivasamUtil.getClientIP(request));
            //  !!!  중복로그인 세션 정보 저장  !!!  끝
        }


        /*
            마케팅 활용 동의 팝업 보기 여부 체크 - 인증 후 첫 로그인시에만 노출되는 팝업.
         */
        //인증 후 첫 로그인 여부
        boolean isFirst = "Y".equals(user.getFirstYn());
        //마케팅 수신 동의 여부
        int marketingAgreeCount = memberService.marketingAgreeInfoCheck(user.getMemberId());

        // 비밀번호 업데이트 안내
        int pwModifyChkInt = memberService.selectMemberPasswordModifyChk(user.getMemberId());

        // 비밀번호 로그인 횟수 초기화
        loginRequest.setRetCnt(15);
        memberService.updateMemberRetCnt(loginRequest);

        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse(jwt);
        jwtAuthenticationResponse.setFirst(isFirst);
        jwtAuthenticationResponse.setLastDate(user.getLastDate());
        jwtAuthenticationResponse.setValEndDate(user.getValEndDate());
        jwtAuthenticationResponse.setMarketingAgree(marketingAgreeCount > 0);
        jwtAuthenticationResponse.setMemberPasswordModifyChk(pwModifyChkInt > 180);
        jwtAuthenticationResponse.setMemberRequiredChk(memberRequiredChk);
        jwtAuthenticationResponse.setEpkiYn(user.getEpkiYn());
        jwtAuthenticationResponse.setLoginType("LOGIN");

        //sso
        jwtAuthenticationResponse.setSsoMemberYN(user.getSsoMemberYN());
        jwtAuthenticationResponse.setIdentifiedYN(user.getIdentifiedYN());
        jwtAuthenticationResponse.setValidYN(user.getValidYn());
        jwtAuthenticationResponse.setTeacherCertifiedYN(user.getTeacherCertifiedYN());
        jwtAuthenticationResponse.setSsoMemChkYn(ssoMemChkYn);

        // 브이북 연동용 토큰
        jwtAuthenticationResponse.setToken(token);

        logger.info(" jwtAuthenticationResponse : {}", jwtAuthenticationResponse);

        return ResponseEntity.ok(jwtAuthenticationResponse);
    }

    @PostMapping("/sns/login")
    public ResponseEntity<?> authenticateSnsUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request,
                                                 HttpSession session) {
        logger.info("############# Sns Login Process");
        // SNS 토근으로 계정 확인
        SnsLoginParameter snsLoginParameter = loginRequest.getSnsLoginParameter();
        if (snsLoginParameter == null) {
            throw new RestingAccountException("API 로그인시 오류가 발생하였습니다.");
        }
        else {
            SnsCheckResult x = memberService.userInfoValidationCheck(snsLoginParameter);
            if (x != null) throw new RestingAccountException("API 로그인시 오류가 발생하였습니다.");
        }

        //회원아이디 조회하기
        SnsMemberInfo snsMember = memberService.getSnsMember(snsLoginParameter);
        if (snsMember == null || org.apache.commons.lang3.StringUtils.isBlank(snsMember.getMemberId())) {
            throw new RestingAccountException("API 로그인시 오류가 발생하였습니다.");
        }
        String memberId = snsMember.getMemberId();

        // 휴면계정여부 조회
        String memberChk = memberService.AccountManageSignIn(memberId);
        if ("X1ISRESTINGY1".equals(memberChk)) {
            throw new RestingAccountException("휴면계정입니다.");
        }

        // 유저 조회
        UserPrincipal user = customUserDetailsService.loadUserByUsernameSns(memberId);
        // 교사인증 부분 업데이트
        user.setCeritfyCheck(memberService.checkCertifyCheck(user.getMemberId()));

        // 최종 로그인일시 업데이트
        memberService.updateSignInDateTime(user.getMemberId());

        // 사용자 필수 회원 정보 확인
        String memberRequiredChk = "N";
        int memberRequiredChkInt = memberService.getMemberReqChk(user.getMemberId());
        if (memberRequiredChkInt == 0) {
            memberRequiredChk = "Y";
        }

        String ssoMemChkYn = "N";
        if ("Y".equals(user.getSsoMemberYN()) && "true".equals(environment.getProperty("vivasam_sso_login_mode"))) {
            logger.info("############# Blocked SSO Login Mode !!!!!");
            // 티스쿨 로그인 시간 기록

            // 최종 SSO 로그인일시 업데이트
            memberService.updateSsoSignInDateTime(user.getMemberId());

            // www.tschool.net으로 호출하는 부분 임시 막음 처리.. 서버 내에서 티스쿨 서버 호출 안됨.
//			new ElasticLoginClient().syncTuserLoginDttm(user.getMemberId());

			try {
				// 24.11.17 통합회원 로그인 처리 sso 호출하도록 수정
				ApiInputData apiParam = new ApiInputData();
				apiParam.setSrcConnSite("0"); // 0: vivasam
				apiParam.setSrcProcMethod("1"); // 1: SNS 로그인
				apiParam.setMemberId(memberId);
				apiParam.setMemberPassword(loginRequest.getPassword());
				new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
						.loginUser(apiParam);
			} catch (Exception e) {
				e.printStackTrace();
				throw new RestingAccountException("통합회원 로그인 시 서버 처리 관련 오류가 발생하였습니다.");
			}

            HashMap<String, String> ssoChkParam = new HashMap<String, String>();
            ssoChkParam.put("memberId", user.getMemberId());
            ssoChkParam.put("addRequiredYn", "N");
            ssoChkParam.put("isSsoMember", "1");
            ssoMemChkYn = memberService.rMemberRequiredCheck(ssoChkParam);
        }

        // 정회원, 교사인증, 교사회원일 경우 로그인 마일리지 지급
        if ("AU300".equals(user.getMLevel()) && "Y".equals(user.getValidYn()) && "0".equals(user.getMTypeCd())) {
            // 로그인 마일리지를 지급
            Mileage mileage = new Mileage(user.getMemberId(), MileageCode.LOGIN.getAmount(), MileageCode.LOGIN.getCode());
            // 오늘 로그인 마일리지를 지급했는지 체크
            int chkExist = memberMileageService.getMileageCntByTodayLogin(mileage);
            if(chkExist == 0) {
                memberMileageService.insertMileagePlus(mileage);
            }
        }

        // 로그인 접근 로그 저장
        LogSignIn logSignIn = new LogSignIn();
        logSignIn.setLogType(VivasamConstant.STAT_SIGNIN);
        logSignIn.setRemoteIp(request.getRemoteAddr());
        logSignIn.setUserId(user.getMemberId());
        // FIXME : API서버에서 세션 정책 문의하기....+
        logSignIn.setSessId(session.getId());
        String token = logService.logMemberSignIn(logSignIn);
        user.setLoginType(snsLoginParameter.getType());
        String jwt = tokenProvider.generateTokenBySns(user);

        // TODO : 중복로그인 세션 정보 저장??? 중복로그인 문제는 어떻게 처리할지 문의.
        // 웹에서만 중복로그인 체크
        if (!VivasamUtil.isApp(request)) {
            // !!! 중복로그인 세션 정보 저장 !!! 시작;
            memberService.addUserInfo(user.getMemberId(), jwt, VivasamUtil.getClientIP(request));
            // !!! 중복로그인 세션 정보 저장 !!! 끝
        }

        /*
         * 마케팅 활용 동의 팝업 보기 여부 체크 - 인증 후 첫 로그인시에만 노출되는 팝업.
         */
        // 인증 후 첫 로그인 여부
        boolean isFirst = "Y".equals(user.getFirstYn());
        // 마케팅 수신 동의 여부
        int marketingAgreeCount = memberService.marketingAgreeInfoCheck(user.getMemberId());

        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse(jwt);
        jwtAuthenticationResponse.setFirst(isFirst);
        jwtAuthenticationResponse.setLastDate(user.getLastDate());
        jwtAuthenticationResponse.setValEndDate(user.getValEndDate());
        jwtAuthenticationResponse.setMarketingAgree(marketingAgreeCount > 0);
        // SNS 로그인 비밀번호 알림 X
        jwtAuthenticationResponse.setMemberPasswordModifyChk(false);
        jwtAuthenticationResponse.setMemberRequiredChk(memberRequiredChk);
        jwtAuthenticationResponse.setLoginType(snsLoginParameter.getType());
        jwtAuthenticationResponse.setEpkiYn(user.getEpkiYn());

        // sso
        jwtAuthenticationResponse.setSsoMemberYN(user.getSsoMemberYN());
        jwtAuthenticationResponse.setIdentifiedYN(user.getIdentifiedYN());
        jwtAuthenticationResponse.setValidYN(user.getValidYn());
        jwtAuthenticationResponse.setTeacherCertifiedYN(user.getTeacherCertifiedYN());
        jwtAuthenticationResponse.setSsoMemChkYn(ssoMemChkYn);

        // 브이북 연동용 토큰
        jwtAuthenticationResponse.setToken(token);

        return ResponseEntity.ok(jwtAuthenticationResponse);
    }

    @PostMapping("/check")
    //@Secured("ROLE_USER")
    public ResponseEntity<?> checkUser(HttpServletRequest request, @CurrentUser UserPrincipal currentUser) {
        logger.info("check : {}", currentUser);

        if(currentUser == null) {
            // 회원정보가 없어서 UserPrincipal가 null인 경우를 위한 처리
            String jwt = VivasamUtil.getJwtFromRequest(request);
            if(org.apache.commons.lang3.StringUtils.isNotBlank(jwt)) {
                return ResponseEntity.ok("NOT_USER");
            }
        }

        boolean isApp = VivasamUtil.isApp(request);
        logger.info("isApp : {}", isApp);
        //Web일 경우 중복로그인 체크
        if(!isApp && currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String jwt = VivasamUtil.getJwtFromRequest(request);
            String result = memberService.checkUserInfo(currentUser.getMemberId(), jwt, VivasamUtil.getClientIP(request));
            if ("OVER".equals(result)){
                HttpSession session =  request.getSession(false);
                if(session != null) session.invalidate();
                return ResponseEntity.ok("DUPLICATE");
            }
        }

        if(currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("OK");
        }else {
            return ResponseEntity.ok("INVALID");
        }
    }

    //로그인 마일리지 체크
    @PostMapping("/login/mileage")
    // @Secured("ROLE_USER")
    public ResponseEntity<?> loginMileage(HttpServletRequest request, @CurrentUser UserPrincipal currentUser) {

        if (currentUser != null && "AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
            // 로그인 마일리지를 지급
            Mileage mileage = new Mileage(currentUser.getMemberId(), MileageCode.LOGIN.getAmount(), MileageCode.LOGIN.getCode());
            // 오늘 로그인 마일리지를 지급했는지 체크
            int chkExist = memberMileageService.getMileageCntByTodayLogin(mileage);
            if(chkExist == 0) {
                memberMileageService.insertMileagePlus(mileage);
            }
        }

        if (currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("OK");
        } else {
            return ResponseEntity.ok("INVALID");
        }
    }

    @PostMapping("/check/retCnt")
    public ResponseEntity<?> checkRetCnt(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpSession session) {
        Map<String, Object> resultMap = new HashMap<>();
        int retCnt = memberService.getMemberRetCnt(loginRequest.getUsername());
        String userId = memberService.getMemberLoginInfo(loginRequest);
        if (userId == null) {
            resultMap.put("status","INVALID");
            resultMap.put("retCnt",retCnt);
            loginRequest.setRetCnt(retCnt-1);
            memberService.updateMemberRetCnt(loginRequest);
        } else {
            resultMap.put("status","PASS");
            resultMap.put("retCnt",retCnt);
        }
        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/verifyRecaptcha")
    public String checkRetCnt(@Valid @RequestBody LoginReCaptcha param, HttpServletRequest req) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map= new LinkedMultiValueMap<>();
            String secretKey = globalConfig.getRecaptchaSecretKey();
            System.out.println(req.getServerName());
            if ("mv.vivasam.com".equals(req.getServerName())) {
                secretKey = "6Ldh3EUrAAAAAFuy_Nr1EhVezxp2CXqm-U-VxCG0";
            }
            map.add("secret", secretKey);
            map.add("response", param.getToken());
            logger.debug("secret : " + secretKey);
            logger.debug("token : " + param.getToken());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.exchange("https://www.google.com/recaptcha/api/siteverify", HttpMethod.POST, request, String.class);
            String body = response.getBody();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(body);
            logger.debug("jsonNode : " + jsonNode);
            String score = jsonNode.get("score").asText();
            logger.debug("score : " + score);

            return score;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @PostMapping("/checkRetCnt")
    @ResponseBody
    public ResponseEntity<?> checkRetCnt(@RequestBody LoginRequest parameter) throws Exception {
        Map<String, Object> resultMap = new HashMap<>();
        String memberChk = memberService.AccountManageSignIn(parameter.getUsername());
        if (memberChk != null && !"".equals(memberChk)) {
            int retCnt = memberService.getMemberRetCnt(parameter.getUsername());
            resultMap.put("retCnt",retCnt);
            resultMap.put("code","SUCCESS");
        } else {
            resultMap.put("retCnt",0);
            resultMap.put("code","FAIL");
        }

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CurrentUser UserPrincipal currentUser, HttpSession session) {
        Map<String, Object> resultMap = new HashMap<>();
        if (currentUser != null) {
            int result = logService.deleteTokenByMemberId(currentUser, session);
            if (result > 0) {
                resultMap.put("code","SUCCESS");
            } else {
                resultMap.put("code","FAIL");
            }
        }

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/auto/login/token")
    @ResponseBody
    public ResponseEntity<?> getNewToken(HttpServletRequest request,HttpSession session, @RequestBody LoginRequest loginRequest) throws Exception {
        Map<String, Object> resultMap = new HashMap<>();

        //자동 로그인 접근 로그 저장
        LogSignIn logSignIn = new LogSignIn();
        logSignIn.setLogType(VivasamConstant.STAT_SIGNIN);
        logSignIn.setRemoteIp(request.getRemoteAddr());
        logSignIn.setUserId(loginRequest.getUsername());
        logSignIn.setSessId(session.getId());

        String token = logService.logMemberSignIn(logSignIn);
        resultMap.put("newToken",token);

        return ResponseEntity.ok(resultMap);
    }
}
