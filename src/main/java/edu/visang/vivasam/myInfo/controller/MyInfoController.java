package edu.visang.vivasam.myInfo.controller;

import edu.visang.vivasam.common.utils.SHA256Util;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.exception.RestingAccountException;
import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.member.service.MemberService;
import edu.visang.vivasam.myInfo.model.MyInfoLeave;
import edu.visang.vivasam.myInfo.service.MyInfoService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.JwtTokenProvider;
import edu.visang.vivasam.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/myInfo")
public class MyInfoController {
    public static final Logger logger = LoggerFactory.getLogger(MyInfoController.class);

    @Autowired
    MyInfoService myInfoService;

    @Autowired
    MemberService memberService;

    @Autowired
    JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;


    /**
     * 비밀번호 확인
     *
     * @return
     */
    @PostMapping("/checkPassword")
    public ResponseEntity<?> checkPassword(@CurrentUser UserPrincipal currentUser,
                                           @RequestBody Map<String, Object> requestParamMap) throws NoSuchAlgorithmException {

        SHA256Util sha256 = new SHA256Util();

        String memberId = currentUser.getMemberId();
        String oldPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("1")));

        Map<String, String> resultMap = new HashMap<>();
        if ("".equals(oldPwd) || "".equals(memberId) || oldPwd == null || memberId == null) {
            resultMap.put("code", "1");
            resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "1", "VIVA_EMPTY_PWD")));
        } else {
            //현재 비밀번호 확인
            int chkResult = myInfoService.checkPwd(oldPwd.replaceAll("'", "''"), memberId);
            if (chkResult == 1) {
                resultMap.put("code", "0");
                resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "0", "VIVA_OK")));
            } else {
                resultMap.put("code", "3");
                resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "3", "VIVA_INVALID_PWD")));
            }
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 비밀번호 변경
     * @return
     */
    @PostMapping("/changePassword")
    @Secured("ROLE_USER")
    public ResponseEntity<?> changePassword(@CurrentUser UserPrincipal currentUser, @RequestBody Map<String,Object> requestParamMap) {

//        String memberId = VivasamUtil.isNull(String.valueOf(requestParamMap.get("0")));
        String memberId = currentUser.getMemberId();
        String oldPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("1")));
        String newPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("2")));

        Map<String,String> resultMap = new HashMap<>();
        if ( "".equals(oldPwd) || "".equals(memberId) || oldPwd == null || memberId == null ) {
            resultMap.put("code","1");
        } else {
            // 추가) 패스워드 개인정보 포함 여부
            MemberInfo memberInfo = myInfoService.getPrivateMemberInfo(memberId);
            if (memberInfo.getBirth() != null) {
                String birth = memberInfo.getBirth().substring(memberInfo.getBirth().length()-4);
                String birthYear = memberInfo.getBirth().substring(0,4);
                if (newPwd.contains(birth)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
                if (newPwd.contains(birthYear)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getOldPassword() != null) {
                String newEncodePw = myInfoService.getEncodeNewPassword(newPwd);
                if (newEncodePw.equals(memberInfo.getOldPassword())) {
                    resultMap.put("code","5");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getEmail() != null) {
                String email = memberInfo.getEmail().split("@")[0];
                if (newPwd.contains(email)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getName() != null) {
                String name = memberInfo.getName();
                if (newPwd.contains(name)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getMemberId() != null) {
                if (newPwd.contains(memberInfo.getMemberId())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getCellphone() != null) {
                if (newPwd.contains(memberInfo.getCellphone2())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
                if (newPwd.contains(memberInfo.getCellphone3())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }

            if (continuousPwd(newPwd)) {
                resultMap.put("code","4");
                return ResponseEntity.ok(resultMap);
            }

            //현재 비밀번호 확인
            int chkResult = myInfoService.checkPwd(oldPwd.replaceAll("'", "''"), memberId);
            if ( chkResult == 1 ) {
                myInfoService.updateChangeOldPwd(memberId);	// 이전 비밀번호 기록 저장
                //비밀번호 변경 확인
                int chgResult = myInfoService.changeSsoPwd(newPwd.replaceAll("'", "''"), memberId, currentUser.getSsoMemberYN(), false);
//                int chgResult = myInfoService.changePwd(newPwd.replaceAll("'", "''"), memberId); //따옴표(')가 비번에 포함되는 경우 오류 발생해서 보완, 심원보, 20140403
                if ( chgResult == 1 ) {
                    memberService.insertPassModifyLog(memberId);
                    resultMap.put("code","0");
                } else {
                    resultMap.put("code","2");
                }
            } else {
                resultMap.put("code","3");
            }
        }
        return ResponseEntity.ok(resultMap);
    }


    /**
     * 비밀번호 변경2
     *
     * @return
     */
    @PostMapping("/changePassword2")
    public ResponseEntity<?> changePassword2(@RequestBody Map<String, Object> requestParamMap) {

        String memberId = VivasamUtil.isNull(String.valueOf(requestParamMap.get("0")));
        String newPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("1")));
        String uuidForCertifiNum = VivasamUtil.isNull(String.valueOf(requestParamMap.get("2")));
        String certifiNum = VivasamUtil.isNull(String.valueOf(requestParamMap.get("3")));
        String isSso = memberService.getSsoMemberByUserId(memberId);
        String isSsoMember = "True".equals(isSso) || "1".equals(isSso) ? "Y" : "N";


        Map<String, String> resultMap = new HashMap<>();
        if (StringUtils.isEmpty(memberId) || StringUtils.isEmpty(newPwd) || StringUtils.isEmpty(uuidForCertifiNum) || StringUtils.isEmpty(certifiNum)) {
            resultMap.put("code", "1");
        } else {
            // 인증번호 재확인
            String originCertifiNum = (String) redisTemplate.opsForValue().get(uuidForCertifiNum + memberId);

            if(originCertifiNum == null || StringUtils.isEmpty(originCertifiNum) || !certifiNum.equals(originCertifiNum)) {
                resultMap.put("code", "2");
                return ResponseEntity.ok(resultMap);
            }

            // 비밀번호 변경 확인
            int chgResult = myInfoService.changeSsoPwd(newPwd.replaceAll("'", "''"), memberId, isSsoMember, true);
//			int chgResult = myInfoService.changePwd(newPwd.replaceAll("'", "''"), memberId); //따옴표(')가 비번에 포함되는 경우 오류 발생해서 보완, 심원보, 20140403
            if (chgResult == 1) {
                memberService.insertPassModifyLog(memberId);
                resultMap.put("code", "0");

                // 인증번호 초기화
                redisTemplate.opsForValue().set(uuidForCertifiNum + memberId, "");
            } else {
                resultMap.put("code", "2");
            }
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 회원정보 가져오기
     * @param currentUser
     * @return
     */
    @PostMapping("/memberInfo")
    @Secured("ROLE_USER")
    public ResponseEntity<?> memberInfo(@CurrentUser UserPrincipal currentUser) {
        logger.info("check : {}", currentUser);
        if(currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
//            MemberInfo memInfo = memberService.getMemberInfo(currentUser.getMemberId());
            MemberInfo memInfo = memberService.getSsoMemberInfo(currentUser.getMemberId());
            return ResponseEntity.ok(memInfo);
        }else {
            return ResponseEntity.ok("INVALID");
        }
    }

    /**
     * 개인정보수정 > SNS 연결하기 API
     */
    @ResponseBody
    @PostMapping("/sns/link")
    @Secured("ROLE_USER")
    public ResponseEntity<?> snsLink(@RequestBody SnsLoginParameter parameter, @CurrentUser UserPrincipal currentUser) {

        MemberResult result = new MemberResult();

        if (parameter == null) {
            throw new RestingAccountException("API 로그인시 오류가 발생하였습니다.");
        }

        String memberId = currentUser.getMemberId();

        String snsType = parameter.getType();
        String accessToken = parameter.getAccessToken();
        parameter.setMemberId(memberId);

        // 1. SnsLoginParameter 데이터 검증
        if(snsType == null || accessToken == null) {
            throw new RestingAccountException("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }

        // 2. 해당 회원이 선택한 SNS 타입으로 연동한 계정이 있는지 확인
        List<SnsMemberInfo> snsMemberList = memberService.getSnsMemberList(memberId);

        // 2-1. 이미 해당 SNS 타입으로 연동이 된 계정이 있는 경우 에러 처리
        if (snsMemberList != null && snsMemberList.stream().anyMatch(snsMemberInfo -> snsMemberInfo.getSnsType().equals(snsType))) {
            throw new RestingAccountException("이미 해당 SNS로 연동된 계정이 있습니다.");
        }

        // 3. 각 SNS API를 통해 계정 검증 및 저장 처리
        SnsCheckResult snsCheckResult = memberService.saveSnsLoginInfoByMyInfo(parameter, currentUser);
        if (snsCheckResult.isError()) {
            throw new RestingAccountException(snsCheckResult.getMsg());
        }
        result.setCode("success");
        return ResponseEntity.ok(result);
    }

    /**
     * 개인정보수정 > SNS 연결해제 API
     */
    @ResponseBody
    @PostMapping("/sns/unlink")
    @Secured("ROLE_USER")
    public ResponseEntity<?> snsUnlink(HttpServletRequest request, @Valid @RequestBody SnsLoginParameter parameter, @CurrentUser UserPrincipal currentUser) {

        MemberResult result = new MemberResult();

        String memberId = currentUser.getMemberId();
        String snsType = parameter.getType();
        String accessToken = parameter.getAccessToken();
        parameter.setMemberId(memberId);

        // 1. SnsLoginParameter 데이터 검증
        if(snsType == null || accessToken == null || memberId == null) {
            throw new RestingAccountException("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }
        String loginType = "LOGIN";
        try {
            String token = request.getHeader("authorization").replaceAll("Bearer ", "");
            Claims claims = jwtTokenProvider.getUserInfo(token);
            Object memberInfo = claims.get("memberInfo");
            loginType = ((LinkedHashMap) memberInfo).get("loginType").toString();
        }
        catch (Exception e) {
            throw new RestingAccountException("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }

        // 2. 현재 로그인한 SNS 타입으로 연동 해제는 불가능
        if (snsType.equals(loginType)) {
            throw new RestingAccountException("로그인한 SNS는 연결 해제가 되지 않습니다.");
        }

        // 3. 해당 회원이 선택한 SNS 타입으로 연동한 계정이 있는지 확인
        List<SnsMemberInfo> snsMemberList = memberService.getSnsMemberList(memberId);

        // 3-1. 이미 해당 SNS 타입으로 연동이 된 계정이 없는 경우 에러 처리
        if (snsMemberList == null || snsMemberList.stream().noneMatch(snsMemberInfo -> snsMemberInfo.getSnsType().equals(snsType))) {
            throw new RestingAccountException("해당 SNS로 연동된 계정이 없습니다.");
        }

        // 4. 각 SNS API를 통해 계정 검증 및 저장 처리
        SnsCheckResult snsCheckResult = memberService.deleteSnsLoginInfoByMyInfo(parameter, currentUser);
        if (snsCheckResult.isError()) {
            throw new RestingAccountException(snsCheckResult.getMsg());
        }

        result.setCode("success");
        return ResponseEntity.ok(result);
    }

    /**
     * 회원정보 가져오기전 비밀번호 검증
     *
     * @param currentUser
     * @return
     */
    @PostMapping("/memberInfoCheck")
    @Secured("ROLE_USER")
    public ResponseEntity<?> memberInfoCheck(@CurrentUser UserPrincipal currentUser,
                                             @RequestBody Map<String, Object> requestParamMap,
                                             HttpServletRequest request) {
        String authParam = VivasamUtil.isNull(String.valueOf(requestParamMap.get("1")));

        // 기본값이 LOGIN 인가?
        String loginType = jwtTokenProvider.parseLoginTypeFromRequest(request);
        if (loginType == null || LoginType.LOGIN.name().equals(loginType)) {
            String pw = authParam;
            if (StringUtils.hasLength(pw)
                    && currentUser != null
                    && StringUtils.hasText(currentUser.getMemberId())) {

                int chkResult = myInfoService.checkPwd(pw.replaceAll("'", "''"), currentUser.getMemberId());
                if (chkResult == 1) {
                    MemberInfo memInfo = memberService.getSsoMemberInfo(currentUser.getMemberId());
                    return ResponseEntity.ok(memInfo);
                }
            }
        } else {
            String accessToken = authParam;
            String apiId = VivasamUtil.isNull(String.valueOf(requestParamMap.get("apiId")));
            String idToken = VivasamUtil.isNull(String.valueOf(requestParamMap.get("idToken")));

            // accessToken 으로 유효한 정보인지 확인
            SnsLoginParameter snsLoginParameter = new SnsLoginParameter();
            snsLoginParameter.setType(loginType);
            snsLoginParameter.setAccessToken(accessToken);
            snsLoginParameter.setApiId(apiId);
            snsLoginParameter.setIdToken(idToken);

            SnsCheckResult x = memberService.userInfoValidationCheck(snsLoginParameter);
            if (x != null) return ResponseEntity.ok("INVALID");

            MemberInfo memInfo = memberService.getSsoMemberInfo(currentUser.getMemberId());
            return ResponseEntity.ok(memInfo);
        }

        return ResponseEntity.ok("INVALID");
    }

    /**
     * 탈퇴 사유 리스트 가져오기
     * @return
     */
    @GetMapping("/leaveMessageList")
    @Secured("ROLE_USER") // login 여부를 감시 한다.
    public ResponseEntity<?> leaveMessageList() {
        List<MyInfoLeave> leaveMessageList = myInfoService.getMemberLeaveMessage();
        return ResponseEntity.ok(leaveMessageList);
    }

    /**
     * 회원 탈퇴
     * @param currentUser
     * @param parameter
     * @return
     */
    @ResponseBody
    @PostMapping("/leave")
    @Secured("ROLE_USER") // login 여부를 감시 한다.
    public ResponseEntity<?> leaveSsoMember(@CurrentUser UserPrincipal currentUser,
                                            @RequestBody MyInfoLeave parameter) throws Exception {
        parameter.setSsoMember("Y".equals(currentUser.getSsoMemberYN()) ? "1" : "0");
        parameter.setDomMemberId(currentUser.getMemberId());
        return ResponseEntity.ok(myInfoService.leaveSsoMember(parameter));
    }

    private boolean continuousPwd(String pwd) {
        int o = 0;
        int d = 0;
        int p = 0;
        int n = 0;
        int limit = 3;

        for(int i=0; i<pwd.length(); i++) {
            char tempVal = pwd.charAt(i);
            if(i > 0 && (p = o - tempVal) > -2 && (n = p == d ? n + 1 :0) > limit -3) {
                return true;
            }
            d = p;
            o = tempVal;
        }
        return false;
    }

    @PostMapping("/checkPasswordDetail")
    public ResponseEntity<?> checkPasswordDetail(@CurrentUser UserPrincipal currentUser,
                                           @RequestBody Map<String, Object> requestParamMap) throws NoSuchAlgorithmException {

        SHA256Util sha256 = new SHA256Util();

        String memberId = currentUser.getMemberId();
        String oldPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("1")));
        String newPwd = VivasamUtil.isNull(String.valueOf(requestParamMap.get("2")));

        Map<String, String> resultMap = new HashMap<>();
        if ("".equals(oldPwd) || "".equals(memberId) || oldPwd == null || memberId == null) {
            resultMap.put("code", "1");
            resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "1", "VIVA_EMPTY_PWD")));
        } else {
            // 추가) 패스워드 개인정보 포함 여부
            MemberInfo memberInfo = myInfoService.getPrivateMemberInfo(memberId);
            if (memberInfo.getBirth() != null) {
                String birth = memberInfo.getBirth().substring(memberInfo.getBirth().length()-4);
                String birthYear = memberInfo.getBirth().substring(0,4);
                if (newPwd.contains(birth)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
                if (newPwd.contains(birthYear)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getOldPassword() != null) {
                String newEncodePw = myInfoService.getEncodeNewPassword(newPwd);
                if (newEncodePw.equals(memberInfo.getOldPassword())) {
                    resultMap.put("code","5");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getEmail() != null) {
                String email = memberInfo.getEmail().split("@")[0];
                if (newPwd.contains(email)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getName() != null) {
                String name = memberInfo.getName();
                if (newPwd.contains(name)) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getMemberId() != null) {
                if (newPwd.contains(memberInfo.getMemberId())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }
            if (memberInfo.getCellphone() != null) {
                if (newPwd.contains(memberInfo.getCellphone2())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
                if (newPwd.contains(memberInfo.getCellphone3())) {
                    resultMap.put("code","4");
                    return ResponseEntity.ok(resultMap);
                }
            }

            if (continuousPwd(newPwd)) {
                resultMap.put("code","4");
                return ResponseEntity.ok(resultMap);
            }
            //현재 비밀번호 확인
            int chkResult = myInfoService.checkPwd(oldPwd.replaceAll("'", "''"), memberId);
            if (chkResult == 1) {
                resultMap.put("code", "0");
                resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "0", "VIVA_OK")));
            } else {
                resultMap.put("code", "3");
                resultMap.put("hash", sha256.encrypt(String.format("%s_%s", "3", "VIVA_INVALID_PWD")));
            }
        }
        return ResponseEntity.ok(resultMap);
    }
}