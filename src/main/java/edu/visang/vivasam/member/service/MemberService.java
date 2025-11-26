package edu.visang.vivasam.member.service;

import com.google.gson.Gson;
import edu.visang.vivasam.api.ApiConnectionUtil;
import edu.visang.vivasam.api.data.*;
import edu.visang.vivasam.common.constant.VivasamConstant;
import edu.visang.vivasam.common.elasticlogin.ElasticLoginClient;
import edu.visang.vivasam.common.model.CommonSms;
import edu.visang.vivasam.common.model.EmailInfo;
import edu.visang.vivasam.common.service.CommonService;
import edu.visang.vivasam.common.service.CommonSmsService;
import edu.visang.vivasam.common.service.EmailService;
import edu.visang.vivasam.common.utils.UserSendTempLog;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.config.GlobalConfig;
import edu.visang.vivasam.cs.service.CsService;
import edu.visang.vivasam.exception.VivasamException;
import edu.visang.vivasam.member.mapper.MemberMapper;
import edu.visang.vivasam.member.mapper.MemberMileageMapper;
import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.member.util.*;
import edu.visang.vivasam.myInfo.service.MyInfoService;
import edu.visang.vivasam.payload.LoginRequest;
import edu.visang.vivasam.saemteo.mapper.SaemteoMapper;
import edu.visang.vivasam.saemteo.model.EventInfo;
import edu.visang.vivasam.security.UserPrincipal;
import edu.visang.vivasam.security.mapper.SecurityMapper;
import edu.visang.vivasam.sso.service.SsoRestfulService;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.RuntimeConstants;
import org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import java.io.StringWriter;
import java.text.ParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class MemberService {

    private static final Logger logger = LoggerFactory.getLogger(MemberService.class);
    static byte secretKey[] = ("1234" + "5678" + "9012" + "3456").getBytes(); // 암호화 키
    static SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey, "AES");
    @Autowired
    MemberMapper memberMapper;

    @Autowired
    CommonService commonService;

    @Autowired
    CsService csXSSService;

    @Autowired
    MyInfoService myInfoService;

    @Autowired
    SsoRestfulService ssoRestfulService;

    @Autowired
    EmailService emailService;

    @Autowired
    MemberMileageMapper memberMileageMapper;

    @Autowired
    Environment environment;

    @Autowired
    UserSendTempLog userSendTempLog;

    @Autowired
    SaemteoMapper saemteoMapper;

    @Autowired
    SecurityMapper securityMapper;

    @Autowired
    CommonSmsService commonSmsService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    MemberMileageService memberMileageService;

    @Autowired
    GlobalConfig globalConfig;

    public String AccountManageSignIn(String menberId) {
        return memberMapper.AccountManageSignIn(menberId);
    }

    public int checkExistPerson(String name, String email) {
        return memberMapper.checkExistPerson(name, email);
    }

    public int checkExistPersonEmail(String memberId, String email) {
        return memberMapper.checkExistPersonEmail(memberId, email);
    }

    public String checkExistId(String id) {
        return memberMapper.checkExistId(id);
    }

    @Transactional
    public String insertJoin(Map<String, String> param) {
        String result = memberMapper.insertJoin(param);
        return result;
    }

    @Transactional
    public boolean updateMemberInfo(Map<String, String> param) {
        /*if(memberMapper.updateMemberInfo(param) == 0) {
            return memberMapper.updateMemberMTypeCd(param); // 회원유형 수정
        }*/

        boolean agreeChange = true;

        // 기존 마케팅 동의 정보 조회
        HashMap<String, String> agreeInfo = memberMapper.getMarketingAgreeInfo(param);

        // 마케팅 활용 동의 저장
        if (!param.get("marketingSmsYn").equals(agreeInfo.get("smsYn"))) {
            MemberMarketingAgreeInfo memberMarketingAgreeInfo = new MemberMarketingAgreeInfo();
            memberMarketingAgreeInfo.setMemberId(param.get("memberId"));
            memberMarketingAgreeInfo.setGubunCd("S");
            memberMarketingAgreeInfo.setAgreeYn(param.get("marketingSmsYn"));
            agreeChange &= memberMapper.saveMarketingInfoEach(memberMarketingAgreeInfo) > 0;
        }
        if (!param.get("marketingEmailYn").equals(agreeInfo.get("emailYn"))) {
            MemberMarketingAgreeInfo memberMarketingAgreeInfo = new MemberMarketingAgreeInfo();
            memberMarketingAgreeInfo.setMemberId(param.get("memberId"));
            memberMarketingAgreeInfo.setGubunCd("E");
            memberMarketingAgreeInfo.setAgreeYn(param.get("marketingEmailYn"));
            agreeChange &= memberMapper.saveMarketingInfoEach(memberMarketingAgreeInfo) > 0;
        }
        if (!param.get("marketingTelYn").equals(agreeInfo.get("telYn"))) {
            MemberMarketingAgreeInfo memberMarketingAgreeInfo = new MemberMarketingAgreeInfo();
            memberMarketingAgreeInfo.setMemberId(param.get("memberId"));
            memberMarketingAgreeInfo.setGubunCd("T");
            memberMarketingAgreeInfo.setAgreeYn(param.get("marketingTelYn"));
            agreeChange &= memberMapper.saveMarketingInfoEach(memberMarketingAgreeInfo) > 0;
        }

        // 회원 데이터 수정
        boolean updateResult = memberMapper.updateMemberUpdateSso(param) > 0;
        // MEMBER 테이블 MY_GRADE 정규화 다른 테이블에 저장
		if (org.apache.commons.lang3.StringUtils.isNotEmpty(param.get("myGrade"))) {
			memberMapper.deleteMemberGradeInfoOnlyViva(param.get("memberId"));
			String[] grade;
			MemberInfo params = new MemberInfo();

			if (param.get("myGrade").contains(",")) {
				grade = param.get("myGrade").split(",");
			} else {
				grade = new String[1];
				grade[0] = param.get("myGrade");
			}

			params.setGrade(grade);
			params.setMemberId(param.get("memberId"));

			memberMapper.insertMemberGradeInfoOnlyViva(params);
		}

        // 준회원이 회원 필수정보가 모두 입력되어 있는 경우 정회원으로 업데이트
        memberMapper.updateMemberMLevel(param);

        // 통합회원 전환 메일링 발송
        //emailService.sendJoinMail(param.get("memberId"), agreeInfo.get("name"), param.get("email"));

        // 마케팅 및 광고 활용 동의 메일링
        if(updateResult && agreeChange) {
            agreeInfo = memberMapper.getMarketingAgreeInfo(param);
            agreeInfo.put("email", param.get("email"));
            emailService.sendAgreeMail(agreeInfo);
        }

        return updateResult;
    }

    @Transactional
    public int updateMemberMTypeCd(Map<String, String> param) {
        return memberMapper.updateMemberMTypeCd(param);
    }

    @Transactional
    public String insertVmagazine(Map<String, String> params) {
        String result = memberMapper.insertVmagazine(params);
        return result;
    }

    @Transactional
    public void updateSignInDateTime(String memberId) {
        memberMapper.updateSignInDateTime(memberId);
    }

    @Transactional
    public void updateSsoSignInDateTime(String memberId) {
        memberMapper.updateSsoSignInDateTime(memberId);
    }

    @Transactional
    public String inactiveMovePersonal(String isResting, String memberId, String password) {
        return memberMapper.inactiveMovePersonal(isResting, memberId, password);
    }

    public int marketingAgreeInfoCheck(String memberId) {
        return memberMapper.marketingAgreeInfoCheck(memberId);
    }

    public List<Map<String, String>> marketingAgreeInfoList(String memberId) {
        return memberMapper.marketingAgreeInfoList(memberId);
    }

    public int marketingAgreeUpdate(String memberId, String marketingAgreeYn) {
       MarketingAgree marketingAgree = new MarketingAgree();
		try {
			marketingAgree.setMemberId(memberId);
			marketingAgree.setMarketingEmailYn(marketingAgreeYn);
			marketingAgree.setMarketingSmsYn(marketingAgreeYn);
			marketingAgree.setMarketingTelYn(marketingAgreeYn);

			HashMap<String, String> oldAgreeList = memberMapper.marketingOldAgreeList(memberId);
			marketingAgree.setRecentMarketingEmailYn(oldAgreeList.get("emailYn"));
			marketingAgree.setRecentMarketingSmsYn(oldAgreeList.get("smsYn"));
			marketingAgree.setRecentMarketingTelYn(oldAgreeList.get("telYn"));

			memberMapper.marketingAgreeUpdate(marketingAgree);

			logger.info("{marketingAgreeUpdate.result : {}}", marketingAgree.getResult());

			// 프로시저 안 마케팅 및 광고 활용 동의 메일링 프로시져 존재 프로시저 처리 - [SP_MEMBER_JOIN_MARKETING_AGERR_MAIL_SEND]
			oldAgreeList = memberMapper.marketingOldAgreeList(memberId);

			// 메일 컨텐츠 html을 가져온다.
			String htmlContent = memberMapper.getMailContent(oldAgreeList);
			oldAgreeList.put("mailContent", htmlContent);
            EmailInfo emailInfo = new EmailInfo();
            emailInfo.setSubject("[비바샘] 마케팅 및 광고 활용 동의 안내");
            emailInfo.setContent(oldAgreeList.get("mailContent"));
            emailInfo.setTo(oldAgreeList.get("email"));
            emailInfo.setVsCode("ET003");

            emailService.saveEMail(emailInfo);
			marketingAgree.setResult(1);
		}catch (Exception e){
			e.printStackTrace();
			marketingAgree.setResult(0);
		}

		return marketingAgree.getResult();
    }

    public int marketingAgreeUpdateThree(String memberId, String marketingEmailYn, String marketingSmsYn, String marketingTelYn) {
        MarketingAgree marketingAgree = new MarketingAgree();
        marketingAgree.setMemberId(memberId);
        marketingAgree.setMarketingEmailYn(marketingEmailYn);
        marketingAgree.setMarketingSmsYn(marketingSmsYn);
        marketingAgree.setMarketingTelYn(marketingTelYn);

        memberMapper.marketingAgreeUpdate(marketingAgree);

        logger.info("{marketingAgreeUpdate.result : {}}", marketingAgree.getResult());

        return marketingAgree.getResult();
    }

    public Map<String, String> findId(String memberName, String certifyMethod, String searchString) {
        return memberMapper.findId(memberName, certifyMethod, searchString);
    }

    public Map<String, String> findSleepId(String memberName, String memberEmail) {
        return memberMapper.findSleepId(memberName, memberEmail);
    }

    public String findPw(FindPwd findPwd) {
        return memberMapper.findPw(findPwd);
    }

    public Map<String, String> findPwdIpin(FindPwd findPwd) {
        return memberMapper.findPwdIpin(findPwd);
    }

    @Transactional
    public int resetMemberPwd(FindPwd findPwd, HttpServletRequest request) {


        /* 1분안에 다시 보낸기록이 없으면 */
        if(!userSendTempLog.isOneMinuteLate(request.getRemoteAddr(),"MOBILE_SEND")){
            throw new VivasamException("9001", "1분안에 메시지를 두번 보낼수 없습니다.");
        }

        memberMapper.resetMemberPwd(findPwd);
        int affectedRow = findPwd.getResult();
        logger.info("resetMemberPwd affectedRow ===> " + affectedRow);

        if (affectedRow < 1) {
            throw new VivasamException("8001", "DB 일시 장애");
        }

        //레디스에 보낸기록 저장
        userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");

        //이메일 비밀번호 찾기일 경우 메일 발송
        if (StringUtils.hasText(findPwd.getMemberEmail())) {
            StringWriter writer = new StringWriter();
            Map<String, Object> map = new HashMap();
            map.put("siteUrl", VivasamConstant.SITE_URL);
            map.put("sendDate", VivasamUtil.getDateFormat("yyyy.MM.dd"));
            map.put("memberName", findPwd.getMemberName());
            map.put("memberId", findPwd.getMemberId());
            map.put("memberTempPwd", findPwd.getTempPwd());
            map.put("memberEMail", findPwd.getMemberEmail());

            VelocityEngine velocityEngine = new VelocityEngine();
            velocityEngine.setProperty("input.encoding", "UTF-8");
            velocityEngine.setProperty("output.encoding", "UTF-8");
            velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
            velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());

            velocityEngine.init();

            Template t = velocityEngine.getTemplate("template/email/newSearchPassword.vm");
            VelocityContext context = new VelocityContext(map);
            t.merge( context, writer );

            EmailInfo emailInfo = new EmailInfo();
            emailInfo.setSubject(VivasamConstant.EMAIL_PWD_TITLE);
            emailInfo.setTo(findPwd.getMemberEmail());
            emailInfo.setFrom(VivasamConstant.EMAIL_SENDER);
            emailInfo.setSendDttm(VivasamUtil.getDateFormat("yyyyMMddHHmmss"));
            emailInfo.setContent(writer.toString());

            logger.info("===========================================");
            logger.info(writer.toString());
            logger.info("===========================================");

            affectedRow = commonService.sendEMail(emailInfo);
        }

        return affectedRow;
    }

    @Transactional
    public MemberValidateEmail sendCertificationNumByEmail(MemberValidateEmail memberValidateEmail, HttpServletRequest request) {

        int affectedRow = 0;
        String memberId = memberValidateEmail.getMemberId();

        // 공직자 이메일 인증여부 조회
        int checkCnt = memberMapper.getMemberValidateEmailCnt(memberValidateEmail);
        if(checkCnt != 0) {
            memberValidateEmail.setResult(1);
            return memberValidateEmail;
        }

        /* 1분안에 다시 보낸기록이 없으면 */
        if(!userSendTempLog.isOneMinuteLate(request.getRemoteAddr(),"EMAIL_SEND")){
            throw new VivasamException("9001", "1분안에 메시지를 두번 보낼수 없습니다.");
        }

        String randomNumber = org.apache.commons.lang3.RandomStringUtils.randomNumeric(6);

        String uuid = UUID.randomUUID().toString();
        String uuidRedisKey = uuid;
        if (!StringUtils.isEmpty(memberId)) {
            uuidRedisKey += memberId;
        }

        redisTemplate.opsForValue().set(uuidRedisKey, randomNumber);

        String uuidTest = "";
        if (redisTemplate.opsForValue().get(uuidRedisKey) != null) {
            memberValidateEmail.setUuidForCertifiNum(uuid);
        } else {
            throw new VivasamException("7001", "uuid 저장 실패");
        }

        //메일 테스트 코드. 개발에서는 메일발송 지원을 안하여 만든 검수용 코드입니다.
        if (memberValidateEmail.isEmailTest()) {
//            memberValidateEmail.setCertifiNum(randomNumber);
        }

        StringWriter writer = new StringWriter();
        Map<String, Object> map = new HashMap<>();
        map.put("randomNumber", randomNumber);
        VelocityEngine velocityEngine = new VelocityEngine();
        velocityEngine.setProperty("input.encoding", "UTF-8");
        velocityEngine.setProperty("output.encoding", "UTF-8");
        velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
        velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());

        velocityEngine.init();

        Template t = velocityEngine.getTemplate("template/email/certifyMail.vm");
        VelocityContext context = new VelocityContext(map);
        t.merge(context, writer);

        EmailInfo emailInfo = new EmailInfo();
        emailInfo.setSubject(VivasamConstant.EMAIL_VALIDATE_EMAIL);
        emailInfo.setTo(memberValidateEmail.getEmail());
        emailInfo.setFrom(VivasamConstant.EMAIL_SENDER);
        emailInfo.setSendDttm(VivasamUtil.getDateFormat("yyyyMMddHHmmss"));
        emailInfo.setContent(writer.toString());

        affectedRow = commonService.sendEMail(emailInfo);

        if (affectedRow > 0) {
            memberValidateEmail.setResult(0);
        } else {
            throw new VivasamException("7001", "전송 실패");
        }

        //레디스에 보낸기록 저장
        userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"EMAIL_SEND");

        return memberValidateEmail;
    }

    @Transactional
    public FindPwd sendCertificationNumByFindPwd(FindPwd findPwd, HttpServletRequest request) throws Exception{

        int affectedRow = 0;

        /* 1분안에 다시 보낸기록이 없으면 */
        if(!userSendTempLog.isOneMinuteLate(request.getRemoteAddr(),"MOBILE_SEND")){
            throw new VivasamException("9001", "1분안에 메시지를 두번 보낼수 없습니다.");
        }

        String randomNumber = org.apache.commons.lang3.RandomStringUtils.randomNumeric(6);

        String uuid = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(uuid + findPwd.getMemberId(), randomNumber);

        String uuidTest = "";
        if(redisTemplate.opsForValue().get(uuid + findPwd.getMemberId()) != null) {
            findPwd.setUuidForCertifiNum(uuid);
        } else {
            throw new VivasamException("7001", "uuid 저장 실패");
        }


        // 휴대전화 비밀번호 찾기일 경우 메일 발송
        if (StringUtils.hasText(findPwd.getCellPhone())) {
            // 2. 인증번호 생성 후 문자 메세지 생성
            String msg = "\n비바샘 인증번호는 " + randomNumber + "입니다.";

            // 3. DB insert
            SmsInfo sms = new SmsInfo();
            sms.setSubject("비바샘 비밀번호 찾기 인증번호");
            sms.setMsg(msg);
            sms.setPhone(findPwd.getCellPhone());
            saveMms(sms);
            affectedRow = 1;
            //레디스에 보낸기록 저장
            userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");

            if (globalConfig.isDev() || globalConfig.isLocal()) {
                findPwd.setRandomNumber(randomNumber);
            }
        }

        // 이메일 비밀번호 찾기일 경우 메일 발송
        if (StringUtils.hasText(findPwd.getMemberEmail())) {
            StringWriter writer = new StringWriter();
            Map<String, Object> map = new HashMap<>();
            map.put("siteUrl", VivasamConstant.SITE_URL);
            map.put("sendDate", VivasamUtil.getDateFormat("yyyy.MM.dd"));
            map.put("memberName", findPwd.getMemberName());
            map.put("memberId", findPwd.getMemberId());
            map.put("randomNumber", randomNumber);
            map.put("memberEMail", findPwd.getMemberEmail());

            VelocityEngine velocityEngine = new VelocityEngine();
            velocityEngine.setProperty("input.encoding", "UTF-8");
            velocityEngine.setProperty("output.encoding", "UTF-8");
            velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
            velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());

            velocityEngine.init();

            Template t = velocityEngine.getTemplate("template/email/newSearchPassword.vm");
            VelocityContext context = new VelocityContext(map);
            t.merge(context, writer);

            EmailInfo emailInfo = new EmailInfo();
            emailInfo.setSubject(VivasamConstant.EMAIL_PWD_TITLE);
            emailInfo.setTo(findPwd.getMemberEmail());
            emailInfo.setFrom(VivasamConstant.EMAIL_SENDER);
            emailInfo.setSendDttm(VivasamUtil.getDateFormat("yyyyMMddHHmmss"));
            emailInfo.setContent(writer.toString());

            logger.info("===========================================");
            logger.info(writer.toString());
            logger.info("===========================================");

            affectedRow = commonService.sendEMail(emailInfo);

            //레디스에 보낸기록 저장
            userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"EMAIL_SEND");
        }

        if (affectedRow < 1) {
            if (StringUtils.hasText(findPwd.getMemberEmail())) {
                throw new VivasamException("7001", "이메일 전송 실패");
            } else if (StringUtils.hasText(findPwd.getCellPhone())) {
                throw new VivasamException("7001", "메세지 전송 실패");
            } else {
                throw new VivasamException("7001", "전송 실패");
            }
        }

        //레디스에 보낸기록 저장
        userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");


        return findPwd;
    }

    public MemberInfo getMemberInfo(String memberId) {
        return memberMapper.getMemberInfo(memberId);
    }

    public int myInfoModify(HashMap<String, String> param) {
        return memberMapper.myInfoModify(param);
    }

    public void updateMemberVia(String memberId) {
        memberMapper.updateMemberVia(memberId);
    }

    public String checkCertifyCheck(String memberId) {
        return memberMapper.checkCertifyCheck(memberId);
    }

    public int getMemberReqChk(String memberId) {
        return memberMapper.getMemberReqChk(memberId);
    }

    public void addUserInfo(String memberId,String jwt,String ipAddress) {

        memberMapper.delMemberLoginfo1(memberId, jwt,ipAddress);
        memberMapper.delMemberLoginfo2(memberId, jwt,ipAddress);

        int cnt = memberMapper.getMemberLoginfoCntForAdd(memberId, jwt,ipAddress);
        if(cnt == 0) {
            memberMapper.updateMemberLoginfo(memberId, jwt,ipAddress);

            int cnt2 = memberMapper.getMemberLoginfoCnt(memberId, jwt,ipAddress);
            if(cnt2 > 0) {
                memberMapper.insertMemberLoginfoLog(memberId, jwt,ipAddress, "모든 MEMBERID 전부삭제로 변경");
            }

            memberMapper.insertMemberLoginfo(memberId, jwt,ipAddress);

            memberMapper.insertMemberLoginfoLog(memberId, jwt,ipAddress, "신규 MEMBERID 등록");
        } else {
            memberMapper.insertMemberLoginfoLog(memberId, jwt,ipAddress, "이미 같은 SID,IP 있음. 업데이트 되지 않음.");
        }

    }

    public String checkUserInfo(String memberId,String jwt,String ipAddress) {

        int cnt = memberMapper.getMemberLoginfoCntForCheck(memberId, jwt,ipAddress);

        if(cnt > 0) {
            memberMapper.insertMemberLoginfoLog(memberId, jwt,ipAddress, "MEMBERID 아웃대상 로그아웃함.");
            return "OVER";
        }
        return "ONE";
    }

    public int selectMemberPasswordModifyChk(String memberId) { return memberMapper.getMemberModifyChk(memberId); }

    public void insertPassModifyLog(String memberId) {
        HashMap<String, String> params = new HashMap<String, String>();
        params.put("memberId", memberId);
        memberMapper.inserPwModifyLog(params);
    }


    /** SSO methods start */

    /**
     * 회원 가입 여부 확인 (성명, 이메일, 휴대전화번호 모두 일치)
     */
    public MemberInfo checkJoinedMember(String name, String email, String cellphone) {
        List<String> joinedMemberIds = memberMapper.checkJoinedMember(name, email, cellphone);
        MemberInfo memberInfo = new MemberInfo();
        memberInfo.setIsExist(joinedMemberIds.size());
        if(joinedMemberIds.size() > 0) {
            String ids = org.apache.commons.lang3.StringUtils.join(joinedMemberIds, ", ");
            memberInfo.setMemberId(ids);
        }
        return memberInfo;
    }

    /**
     * 통합회원으로 사용 가능한 아이디 확인
     */
    public boolean checkAvailableSsoId(String ssoId) {
        ApiInputData input  = new ApiInputData();
        input.setMemberId(ssoId);

        try {
            ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                    .duplicateUserIdCheck(input);
            if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {

                if(output.getData() != null && output.getData().getMemberIdUseYn().equals("N") ) {
                    return true;
                }
            }
            return false;
        }catch(Exception e ) {
            e.printStackTrace();
            return false;

        }
    }

    /**
     * 비바샘 단독회원일때, 통합회원으로 사용 가능한 아이디 확인
     */
    public boolean checkAvailableSsoIdForOnlyViva(String ssoId) {
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>." + ssoId);

        ElasticLoginClient client = new ElasticLoginClient();

        // 2. 티스쿨
        boolean isAvailableTschool = client.isExistIdInTschool(ssoId) == 0 ? true : false;
        if (isAvailableTschool) {
            // 3. 통합
            return client.isAvailableSsoId(ssoId);
        }

        return false;
    }

    /**
     * 통합회원 가입
     */
    @Transactional
    public String createSsoMember(Map<String, String> param) throws Exception {

        String result = "1";

        ApiInputDataMapping mapping = new ApiInputDataMapping();
        ApiInputData apiParam = new ApiInputData();
        //API로 전송할 수 있게 파라메터를 매핑해 준다.
        mapping.mappingInputParam(param, apiParam);

        String marketingStr = "";
        //비바샘 동의
        marketingStr = "0^" + ("true".equals(param.get("Agree4")) ? "Y|" : "N|") ;
        //연수원 동의 <- 프론트 페이지에서 별도 동의처리가 생략되어 Agree4 기준으로 저장(원래는 Agree6)
        marketingStr = marketingStr + "1^" + ("true".equals(param.get("Agree4")) ? "Y" : "N" );
        apiParam.setMemberMktAgrYn(marketingStr);

        if(param.containsKey("snsType")) {
            mapping.mappingInputSnsParamByMap(param, apiParam);
        }
        System.out.println(apiParam.toString());
        ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                .createUser(apiParam);
        if(output != null && output.getStatus().getCode() == 200 ) {
            result = "0";
        }

        //이메일 중복시 반환코드
        if(output != null && output.getStatus().getCode() == 408 ) {
            result = "5";
        }

        //통합api서버 오류시 반환코드
        if(output != null && output.getStatus().getCode() == 500 ) {
            result = "9";
        }

        if ("0".equals(result)) { // 비바샘 회원 생성 성공

            // 공직자 이메일 인증 정보
            if (param.containsKey("memberValidateType") && "1".equals(param.get("memberValidateType"))) {
                MemberValidateEmail memberValidateEmail = new MemberValidateEmail();
                memberValidateEmail.setEmail(param.get("memberValidateEmail"));
                memberValidateEmail.setMemberId(param.get("memberId"));
                memberValidateEmail.setCertification("Y");

                updateCertifyMail(memberValidateEmail);
            }

            //모바일 경로 가입 인증 업데이트
            updateMemberVia(param.get("id"));

            // 비바샘 학교 등록 신청(학교 검색을 통해 검색되지 않는 학교 등록 신청)
            if (param.containsKey("isSelectedSchool") && "false".equals(param.get("isSelectedSchool"))) {
                try {
                    csXSSService.cQnaInsert(param.get("id"), param.get("qnaCd"), param.get("qnaTitle"), param.get("qnaContents"),
                            param.get("qnaSchLvlCd"), "", "", "", "", "", param.get("regIp"), "", "", "Y", null);

                    // 직접입력 소속명을 회원테이블에 업데이트
                    param.put("sch_name_searchedv", param.get("SchoolName"));
                } catch (Exception ex) {
                    throw new VivasamException("8001", "비바샘 학교 등록 신청 생성실패");
                }
            }

            //가입완료 이메일
            emailService.sendJoinMail(apiParam.getMemberId(), apiParam.getMemberName(), apiParam.getMemberEmail());

            //공통 항목이 아닌 비바샘 만의 항목은 따로 저장해 준다.
            if(param.containsKey("myGrade") && !"".equals(param.get("myGrade"))) {
                param.put("memberId", param.get("id"));
                memberMapper.updateMemberInfoOnlyViva(param);

                // MEMBER 테이블 MY_GRADE 정규화 다른 테이블에 저장
                if (org.apache.commons.lang3.StringUtils.isNotEmpty(param.get("myGrade"))) {
                    memberMapper.deleteMemberGradeInfoOnlyViva(param.get("memberId"));
                    String[] grade;
                    MemberInfo params = new MemberInfo();

                    if (param.get("myGrade").contains(",")) {
                        grade = param.get("myGrade").split(",");
                    } else {
                        grade = new String[1];
                        grade[0] = param.get("myGrade");
                    }

                    params.setGrade(grade);
                    params.setMemberId(param.get("memberId"));

                    memberMapper.insertMemberGradeInfoOnlyViva(params);
                }
            }

            // event 449 기간중 event 450 기간에만 추천인 아이디 추가
            Date now = new Date();
            EventInfo eventInfo = saemteoMapper.getEventInfoNoMatterUseYn("450");
            if (eventInfo != null) {
                Date eventSdate = null;
                Date eventEdate = null;
                try {
                    eventSdate = DateUtils.parseDate(eventInfo.getEventSdate(), "yyyy.MM.dd");
                    eventEdate = DateUtils.parseDate(eventInfo.getEventEdate() + " 23:59:59.999", "yyyy.MM.dd HH:mm:ss.SSS");
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                // 이벤트 기간내에 접속할 경우
                if (now.after(eventSdate) && now.before(eventEdate)) {
                    String memberId = param.get("id");
                    String reco = param.get("reco");
                    String via = param.get("via");
                    // 추천인코드가 입력되었을 경우
                    if (org.apache.commons.lang3.StringUtils.isNotBlank(reco)) {
                        memberMapper.updateMemberRecommenderCode(memberId, reco.trim().toUpperCase());
                    }
                    // 추천인코드가 입력되지 않았을 경우 유입경로가 event 일 경우 추천인에 이벤트로 직접가입 코드 추가
                    else if (org.apache.commons.lang3.StringUtils.isNotBlank(via) && "event".equals(via)) {
                        // 초등 PC com.vivasam.elementary.mvc.data.parameter.member.MemberRecommendationPoint.VIA_EVENT_DIRECT_JOIN 참조 할 것.
                        memberMapper.updateMemberRecommenderCode(memberId, "EVENT_DIRECT_JOIN");
                    }
                }
            }

        }

        return result;
    }

    /**
     * 통합 회원 유무 저장
     */
    public int setIpinCI(Map<String, String> params) {
        return memberMapper.setIpinCI(params);
    }



    /**
     * 동일 ci의 티스쿨ID를 찾고 통합 회원으로 전환 가능한 아이디인지 확인
     */
    public Map<String, Object> getMyTschoolUserThenCheckAvailableSsoID(String vivaId) {
        // 1. 비바샘 ID의 통합 회원 사용 가능 여부 확인
        // 2. 동일 ci의 티스쿨 ID 존재 확인
        // 3. 티스쿨 ID의 통합 회원 사용 가능 여부 확인
        // 4. (1.이 사용 가능이면) 비바샘 ID의 티스쿨 사용 가능 여부 확인
        // 5. (3.이 사용 가능이면) 티스쿨 ID의 비바샘 사용 가능 여부 확인

        String ci = getIpinCi(vivaId);
        ElasticLoginClient client = new ElasticLoginClient();
        Map<String, Object> result = client.isExistVandT(vivaId, ci);

        Map<String, String> viva = (Map<String, String>) result.get("vivasam");
        Map<String, String> isSameId = null;
        List<Map<String, String>> newTschUsers = new ArrayList<>();
        if(result.containsKey("tschool")) {
            List<Map<String, String>> tschUsers = (List<Map<String, String>>) result.get("tschool");
            Map<String, String> tsch = null;
            for(int i=0; i<tschUsers.size(); i++) {
                tsch = tschUsers.get(i);

                logger.debug(">>본인 티스쿨 ID 통합 전환 가능 여부 : " + tsch.get("tid") + ", " + tsch.get("isusable"));
                //티스쿨 아이디가 비바샘 아이디와 동일한지 확인한다.
                if ("false".equals(tsch.get("inactive")) && vivaId.equals(tsch.get("tid"))) {
                    //동일한 경우엔 각 DB에 아이디 존재 여부를 확인 할 필요 없음.
//                    if("true".equals(viva.get("isusable"))) {
                    isSameId = viva;
                    if("true".equals(tsch.get("inactive"))) {
                        isSameId.put("inactiveT", tsch.get("inactive"));
                        isSameId.put("isusable", "false");
                    }
//                    }
                } else {
                    if(Boolean.valueOf(tsch.get("isusable"))) { //통합 아이디로 사용가능한 경우
                        String existInViva = checkExistId(tsch.get("tid")); //티스쿨 아이디가 비바샘에 존재하는지 확인
                        if(existInViva != null) {
                            boolean isAvailableTidInViva = "0".equals(existInViva) ? true : false;
                            if (!isAvailableTidInViva) {
                                tsch.put("isusable", String.valueOf(isAvailableTidInViva));
                            }
                        } else {
                            tsch.put("isusable", "false");
                        }
                    }
                }
                newTschUsers.add(tsch);
            }

            result.put("tschool", newTschUsers);
            result.put("isSameId", isSameId);

        }

        return result;
    }

    /**
     * 회원 CI 정보를 이용하여 가입 가능 상태 조회
     * @param sConnInfo
     * @return
     */
    public Map<String, Object> checkJoinMemberInfo(String sConnInfo) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        ApiInputData apiParam  = new ApiInputData();
        apiParam.setMemberCi(sConnInfo);
        boolean existIdInVivasam = true;
        boolean existIdInTschool = true;
        try {
            ApiOutputData apiResponse = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                    .isSsoMemberCheck(apiParam);
            if(apiResponse != null && !apiResponse.getStatus().isError() && apiResponse.getStatus().getCode() == 200 ) {

                ApiResponseData data = apiResponse.getData();
                System.out.println(data.toString());
                //이미 통합 회원일 경우
                if (data != null && "Y".equals(data.getMemberIdUseYn())) {
                    Gson gson = new Gson();
                    resultMap.put("result", "1");
                    resultMap.put("existId", data.getMemberId());
                    resultMap.put("existIdActive", "Y");
                    resultMap.put("existIdInTschool", false);
                    resultMap.put("isSsoMember", "1");
                    resultMap.put("apiData", gson.toJson(data));
                    return resultMap;
                }


                //SNS 회원 여부 및 패스워드 사용자 여부  N : 패스워드 미사용 M : 패스워드 사용
                //SNS 회원가입이더라도 M 일경우 패스워드 입력 받아야함
                resultMap.put("usePassword", data.getMemberIdUseYn());
                ApiOutputListData ciInfoList = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .selectUserCiInfoList(apiParam);
                if (ciInfoList != null && !ciInfoList.getStatus().isError() && ciInfoList.getStatus().getCode() == 200) {
                    List<Map<String, String>> tschoolUser = new ArrayList<>();

                    String existId = "";
                    String existVivaEmail = "";
                    String existIdActive = "";
                    String result = "0";
                    for(ApiResponseData item : ciInfoList.getData()) {
                        Map<String,String> beforeIdInfo = new HashMap<>();
                        //CASE0 은 신규 가입 상태로 LIST가 1개만 나옴
                        System.out.println(item.getMemberRegCase());
                        if ("case0".equals(item.getMemberRegCase())) {  //신규 가입 가입 이력 없음
                            resultMap.put("result", "0");
                            resultMap.put("tschoolUsers", null);
                            resultMap.put("existIdInTschool", false);
                            resultMap.put("existIdInVivasam", false);
                            resultMap.put("canJoinSso", true);
                            resultMap.put("memberRegCase", item.getMemberRegCase());

                            resultMap.put("processStr", org.apache.commons.lang3.StringUtils.isEmpty(item.getProcessStr())? "0^^|1^^": item.getProcessStr());
                            return resultMap;

                        }else if("case1".equals(item.getMemberRegCase()) ){ //기존 가입 정보가 있으며 해당 아이디 사용 가능

                            if("0".equals(item.getSrcProcSite())) {
                                result = "1";
                                existId = item.getMemberId();
                                existVivaEmail = item.getMemberEmail();
                                existIdActive = "Y";
                                existIdInTschool = false;

                            }else {
                                beforeIdInfo.put("tid", item.getMemberId());

                                beforeIdInfo.put("isusable", "true"); //통합회원 가입 가능 여부 (CASE3은 FALSE)
                                beforeIdInfo.put("inactive", "false");
                                beforeIdInfo.put("email", item.getMemberEmail());
                                existIdInVivasam = false;
                                tschoolUser.add(beforeIdInfo);

                            }

                        }else if("case2".equals(item.getMemberRegCase()) ){ //기존 가입 정보가 있고 선택 된 아이디로 변경

                            if("0".equals(item.getSrcProcSite())) {
                                result = "1";
                                existId = item.getMemberId();
                                existVivaEmail = item.getMemberEmail();
                                existIdActive = "Y";
                                existIdInTschool = false;

                            }else {
                                beforeIdInfo.put("tid", item.getMemberId());

                                beforeIdInfo.put("isusable", "true"); //통합회원 가입 가능 여부 (CASE3은 FALSE)
                                beforeIdInfo.put("inactive", "false");
                                beforeIdInfo.put("email", item.getMemberEmail());
                                existIdInVivasam = false;
                                tschoolUser.add(beforeIdInfo);

                            }

                        }else if("case3".equals(item.getMemberRegCase()) ){ //기존 가입 정보가 있고 해당 아이디 모두 사용 할 수 없음

                            if("0".equals(item.getSrcProcSite())) {
                                result = "1";
                                existId = item.getMemberId();
                                existVivaEmail = item.getMemberEmail();
                                existIdActive = "N";
                                existIdInTschool = true;

                            }else {
                                beforeIdInfo.put("tid", item.getMemberId());

                                beforeIdInfo.put("isusable", "false"); //통합회원 가입 가능 여부 (CASE3은 FALSE)
                                beforeIdInfo.put("inactive", "false");
                                beforeIdInfo.put("email", item.getMemberEmail());
                                existIdInVivasam = true;
                                tschoolUser.add(beforeIdInfo);

                            }

                        }
                    }

                    resultMap.put("isSsoMember", "0");
                    if(org.apache.commons.lang3.StringUtils.isNotEmpty(existId)) {
                        resultMap.put("existIdInTschool", existIdInTschool);
                        resultMap.put("existId", existId);
                        resultMap.put("existVivaEmail", existVivaEmail);
                        resultMap.put("existIdActive", existIdActive);
                        resultMap.put("result", result);
                    }else {
                        resultMap.put("existIdInTschool", existIdInTschool);
                    }

                    if(tschoolUser.size() > 0) {
                        Map<String, Object> tschoolUserInfo = new HashMap<String, Object>();
                        tschoolUserInfo.put("tschoolUser", tschoolUser);
                        tschoolUserInfo.put("isActiveT", true);
                        resultMap.put("tschoolUsers", tschoolUserInfo);
                        resultMap.put("existIdInVivasam", existIdInVivasam);
                    }else {
                        resultMap.put("tschoolUsers", null);
                        resultMap.put("existIdInVivasam", existIdInVivasam);
                    }

                    Gson gson = new Gson();
                    resultMap.put("apiData", gson.toJson(ciInfoList.getData()));
                    System.out.println(resultMap);

                    // 통합회원 전환 불가능 여부, 문구 셋팅
                    if (tschoolUser.size() > 1) { // 비바샘 연수원 계정이 여러개인 경우
                        resultMap.put("result", "3");
                        resultMap.put("sMessage", "비바샘 연수원에서 사용하실 1개의 아이디를 제외한 나머지 아이디는 탈퇴 하신 후 다시 통합회원으로 가입하여 주세요.");
                    }
                }else {
                    resultMap.put("result", "4");
                    if(ciInfoList.getStatus().getCode() == 404 && ciInfoList.getStatus().getType() != null && "Ci duplication".equals(ciInfoList.getStatus().getType())) {
                        resultMap.put("sMessage", "현재 2개 이상의 아이디로 가입되어 있습니다.\n1개 아이디를 제외한 나머지 아이디는 탈퇴하신 후 다시 통합회원으로 가입해 주세요.\n아이디 확인이 어려우신 경우, 고객센터(1544-7714)를 통해 문의해 주세요.");
                    }else {
                        resultMap.put("sMessage", apiResponse.getStatus().getMessage());
                    }
                }
            }else {
                resultMap.put("sMessage", apiResponse.getStatus().getMessage());
            }
        } catch(Exception e) {
            resultMap.put("sMessage", "API 서버 통신 오류");
        }
        return resultMap;
    }


    //휴면계정도 조회
    private Map<String, String> personalIdentificationByIPIN2(Map<String, String> param) {
        Map<String, String> resultMap = new HashMap<>();
        String result = "-1";
        //동일 ipin_ci를 가진 회원이 있는지 확인
        //String dbName = environment.getProperty("inactiveDBname");
        //param.put("dbName", dbName);
        Map<String, String> existUsers = memberMapper.getMemberAllByIpinCI(param);
        if(existUsers == null) {
            if(StringUtils.isEmpty(param.get("memberId"))) {
                //신규가입시 중복의 본인인증 아이디가 없는 경우
                result = "0";
            } else {
                //로그인한 기존 사용자의 중복의 본인인증 아이디가 없는 경우

                // 정회원 승격 체크 (필수정보체크)
                HashMap<String, String> memChkParam = new HashMap<String, String>();
                memChkParam.put("memberId", param.get("memberId"));
                memChkParam.put("addRequiredYn", "Y");
                memChkParam.put("isSsoMember", "");
                String memChkYn = memberMapper.rMemberRequiredCheck(memChkParam);
                if (memChkYn.equals("Y")) param.put("mlevel", "AU300");
                // 정회원 승격 체크 (필수정보체크)

                int checkResult = memberMapper.setIpinCI(param);
                result = "1";
            }

        } else {
            resultMap = existUsers;
        }

        resultMap.put("result", result);

        return resultMap;
    }

    //휴면계정 아닌 경우만 조회
    private String personalIdentificationByIPIN(Map<String, String> param) {

        //동일 ipin_ci를 가진 회원이 있는지 확인
        String existUserId = memberMapper.getMemberByIpinCI(param);
        if(existUserId == null || "".equals(existUserId)) {
            if(StringUtils.isEmpty(param.get("memberId"))) {
                //신규가입시 중복의 본인인증 아이디가 없는 경우
                return "0";
            } else {
                //로그인한 기존 사용자의 중복의 본인인증 아이디가 없는 경우 - 인증 정보 저장.
                return String.valueOf(memberMapper.setIpinCI(param));
            }
        } else {
            return existUserId; //동일 CI 회원이 존재하면 회원 ID 리턴
        }
    }

    /**
     * 동일 본인 인증 아이디 존재 확인
     */
    public Map<String, String> checkExistCiThenGetUserId(String ipinCi) {
        Map<String, String> param = new HashMap<>();
        param.put("ipinCI", ipinCi);
        return personalIdentificationByIPIN2(param);
    }

    /**
     * 본인 인증 내역 저장(CI, 이름, 생년월일, 성별, 휴대폰)
     */
    @Transactional
    public Map<String, String> checkExistCiThenUpdateUserInfo(String memberId, String memberName, String ipinCi, String gender, String birthdate, String cellphone) {
        Map<String, String> param = new HashMap<>();
        param.put("memberId", memberId);
        param.put("name", memberName);
        param.put("ipinCI", ipinCi);
        param.put("sex", gender);
        param.put("birth", birthdate);
        if(!StringUtils.isEmpty(cellphone)) {
            String regEx = "(\\d{3})(\\d{3,4})(\\d{4})";
            if(Pattern.matches(regEx, cellphone)) {
                String regCellphone = cellphone.replaceAll(regEx, "$1-$2-$3");
                param.put("cellphone", regCellphone);
            } else {
                param.put("cellphone", cellphone);
            }
        }
        return personalIdentificationByIPIN2(param);
    }


    public String getIpinCi(String memberId) {
        return memberMapper.getIpinCI(memberId);
    }


    /**
     * 통합 회원 가입시 본인 소유 티스쿨 아이디 조회 및 사용가능한 아이디인지 확인
     */
    public Map<String, Object> findTschoolIdByIpinCiThenCheckAvailable(String ipinCi) {
        ElasticLoginClient client = new ElasticLoginClient();
        Map<String, Object> returnResultMap = new HashMap<>();
        List<Map<String, String>> newTuserList = new ArrayList<>();
        List<Map<String, String>> tUserList = client.getTschoolUser(ipinCi);
        Map<String, String> tUser = null;

        boolean isActiveT = true;
        for(int i=0; i<tUserList.size(); i++) {
            tUser = tUserList.get(i);

            if(tUser != null && tUser.containsKey("username")) {
                String tId = tUser.get("username");
                String tType = tUser.get("mem_gn"); // A:활성, H:휴면
                if(!StringUtils.isEmpty(tId)) {
                    Map<String, String> resultMap = new HashMap<>();
                    resultMap.put("tid", tId);
                    resultMap.put("isusable", "false");

                    if("A".equals(tType)) { //티스쿨 활성계정이면
                        resultMap.put("inactive", "false");
                        String existViva = checkExistId(tId); //비바샘에서 사용 가능한 아이디인지 확인
                        boolean availableV = "0".equals(existViva) ? true : false;
                        if(availableV) {
                            boolean availableT = client.isAvailableSsoId(tId); //통합회원으로 사용 가능한 아이디인지 확인
                            resultMap.put("isusable", String.valueOf(availableT));
                        }
                    } else {
                        isActiveT = false;
                        resultMap.put("isusable", "false");
                        resultMap.put("inactive", "true");
                    }
                    newTuserList.add(resultMap);
                }
            }
        }

        returnResultMap.put("tschoolUser", newTuserList);
        returnResultMap.put("isActiveT", String.valueOf(isActiveT));

        return returnResultMap;
    }

    /**
     * 회원정보 가져오기(통합 회원 여부 포함)
     */
    public MemberInfo getSsoMemberInfo(String memberId) {
        MemberInfo memberInfo = memberMapper.getSsoMemberInfo(memberId);

        //통합 회원의 경우 연수원 마케팅 정보 조회
        if ("1".equals(memberInfo.getSsoMember())) {
            Map<String, Object> mktInfo = selectMarketingInfo(memberId);
            if(mktInfo != null && "success".equals(mktInfo.get("result"))) {
                memberInfo.setMarketingSmsYnT((String) mktInfo.get("smsYnT"));
                memberInfo.setMarketingEmailYnT((String) mktInfo.get("mailYnT"));
                memberInfo.setMarketingTelYnT((String) mktInfo.get("telYnT"));
            }
        }

        return memberInfo;
    }

    /**
     * 통합 회원 정보 수정
     */
    @Transactional
    public int exeSsoMyinfoModify(Map<String, String> param ) {

        int result = -1;
        String memberId = param.get("memberId");
        MemberInfo memberInfo = getSsoMemberInfo(memberId);
        boolean mktMailSend = false;

        param.put("ssoId", memberId);
        param.put("thirdMarketingAgree", "true".equals(param.get("Agree6")) ? "Y" : "N"); //Y,N
        param.put("memberName", memberInfo.getName());
        param.put("ci", memberInfo.getIpinCi()); //티스쿨수정때문에 추가
        param.put("birth", memberInfo.getBirth()); //티스쿨수정때문에 추가
//        param.put("mTypeCd", memberInfo.getMTypeCd());

        if ("1".equals(memberInfo.getSsoMember())) {
            try {
                ApiInputData apiParam = new ApiInputData();
                ApiInputDataMapping mapping = new ApiInputDataMapping();

                mapping.mappingInputMyInfoParam(param, apiParam);

                String memberMktAgrYnStr = "";
                String tmpAgree = "";
                //비바샘 동의 여부
                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("marketingSmsYn")) && "Y".equals(param.get("marketingSmsYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingSmsYn())) mktMailSend = true;
                memberInfo.setMarketingSmsYn(tmpAgree);

                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("marketingEmailYn")) && "Y".equals(param.get("marketingEmailYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingEmailYn())) mktMailSend = true;
                memberInfo.setMarketingEmailYn(tmpAgree);

                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("marketingTelYn")) && "Y".equals(param.get("marketingTelYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingTelYn())) mktMailSend = true;
                memberInfo.setMarketingTelYn(tmpAgree);

                //연수원 동의 여부
                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("tschMarketingSmsYn")) && "Y".equals(param.get("tschMarketingSmsYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingSmsYnT())) mktMailSend = true;
                memberInfo.setMarketingSmsYnT(tmpAgree);

                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("tschMarketingEmailYn")) && "Y".equals(param.get("tschMarketingEmailYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingEmailYnT())) mktMailSend = true;
                memberInfo.setMarketingEmailYnT(tmpAgree);

                tmpAgree = org.apache.commons.lang3.StringUtils.isNotBlank(param.get("tschMarketingTelYn")) && "Y".equals(param.get("tschMarketingTelYn")) ? "Y" : "N";
                if(!tmpAgree.equals(memberInfo.getMarketingTelYnT())) mktMailSend = true;
                memberInfo.setMarketingTelYnT(tmpAgree);


                memberMktAgrYnStr = "0^" + memberInfo.getMarketingSmsYn() + "^" + memberInfo.getMarketingEmailYn() + "^" + memberInfo.getMarketingTelYn() + "|";
                memberMktAgrYnStr += "1^" + memberInfo.getMarketingSmsYnT() + "^" + memberInfo.getMarketingEmailYnT() + "^" + memberInfo.getMarketingTelYnT();

                apiParam.setMemberMktAgrYn(memberMktAgrYnStr);

                // 회원유형 변경
                if(!"0".equals(apiParam.getMemberTypeCd())) {
                    apiParam.setMemberMainSubjectCd(null);
                    apiParam.setMemberSecondSubjectCd(null);
                    param.put("myGrade", null);
                    if("3".equals(apiParam.getMemberTypeCd())) {
                        apiParam.setMemberSchNm("");
                        apiParam.setMemberSchCd("0");
                    }
                }

                ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .updateUserInfo(apiParam);
                if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {
                    //공통 항목이 아닌 비바샘 만의 항목은 따로 저장해 준다.
                    if("true".equals(param.get("directlyAgree"))) {
                        param.put("sch_name_searchedv", param.get("schName"));
                    }
                    memberMapper.updateMemberInfoOnlyViva(param);

                    // MEMBER 테이블 MY_GRADE 정규화 다른 테이블에 저장
                    if (org.apache.commons.lang3.StringUtils.isNotEmpty(param.get("myGrade"))) {
                        memberMapper.deleteMemberGradeInfoOnlyViva(param.get("memberId"));
                        String[] grade;
                        MemberInfo params = new MemberInfo();

                        if (param.get("myGrade").contains(",")) {
                            grade = param.get("myGrade").split(",");
                        } else {
                            grade = new String[1];
                            grade[0] = param.get("myGrade");
                        }

                        params.setGrade(grade);
                        params.setMemberId(param.get("memberId"));

                        memberMapper.insertMemberGradeInfoOnlyViva(params);
                    }

                    result = 1;
                }

            } catch(Exception e) {
                result = -1;
            }

        } else {
            //비바샘 회원 정보 수정
            result = updateMemberInfo(param) ? 1 : 0;
        }

        if(mktMailSend) {
            try {
                int affectedRow = 0;
                StringWriter writer = new StringWriter();

                Map<String, Object> newMktInfo = selectMarketingInfo(memberInfo.getMemberId());

                if ("Y".equals(memberInfo.getMarketingSmsYn())) {
                    newMktInfo.put("smsYn", "수신동의");
                } else {
                    newMktInfo.put("smsYn", "수신거부");
                }

                if ("Y".equals(memberInfo.getMarketingEmailYn())) {
                    newMktInfo.put("mailYn", "수신동의");
                } else {
                    newMktInfo.put("mailYn", "수신거부");
                }

                if ("Y".equals(memberInfo.getMarketingTelYn())) {
                    newMktInfo.put("telYn", "수신동의");
                } else {
                    newMktInfo.put("telYn", "수신거부");
                }

                if ("Y".equals(memberInfo.getMarketingSmsYnT())) {
                    newMktInfo.put("smsYnT", "수신동의");
                } else {
                    newMktInfo.put("smsYnT", "수신거부");
                }
                if ("Y".equals(memberInfo.getMarketingEmailYnT())) {
                    newMktInfo.put("mailYnT", "수신동의");
                } else {
                    newMktInfo.put("mailYnT", "수신거부");
                }
                if ("Y".equals(memberInfo.getMarketingTelYnT())) {
                    newMktInfo.put("telYnT", "수신동의");
                } else {
                    newMktInfo.put("telYnT", "수신거부");
                }

                newMktInfo.put("memberId", memberInfo.getMemberId());

                VelocityEngine velocityEngine = new VelocityEngine();
                velocityEngine.setProperty("input.encoding", "UTF-8");
                velocityEngine.setProperty("output.encoding", "UTF-8");
                velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
                velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());

                velocityEngine.init();

                Template t = velocityEngine.getTemplate("template/email/userMktInfoUpdateMail.vm");
                VelocityContext context = new VelocityContext(newMktInfo);
                t.merge(context, writer);

                EmailInfo emailInfo = new EmailInfo();
                emailInfo.setSubject(VivasamConstant.EMAIL_UPDATE_MKT_INFO_TITLE);
                emailInfo.setTo(param.get("email"));
                emailInfo.setFrom(VivasamConstant.EMAIL_SENDER);
                emailInfo.setSendDttm(VivasamUtil.getDateFormat("yyyyMMddHHmmss"));
                emailInfo.setContent(writer.toString());

                logger.info("===========================================");
                logger.info(writer.toString());
                logger.info("===========================================");

                affectedRow = commonService.sendEMail(emailInfo);
            } catch(Exception e) {

            }
        }

        return result;
    }

    public String rMemberRequiredCheck(Map<String, String> param) {
        String result = memberMapper.rMemberRequiredCheck(param);

        return result;
    }

    @Transactional
    public String wakeupInactiveUser(String isActive, String userId, String userPwd) {
        String resultCodeMsg = memberMapper.inactiveMovePersonal(isActive , userId , userPwd);
        if("0000".equals(resultCodeMsg)) {
            String isSsoMember = memberMapper.getSsoMemberByUserId(userId);
            if ("1".equals(isSsoMember)) {
                ElasticLoginClient client = new ElasticLoginClient();
                client.wakeupInactiveTuser(userId);
            }
        }
        return resultCodeMsg;
    }

    public void iIdentificationResultLog(Map<String, String> param) {
        memberMapper.iIdentificationResultLog(param);
    }

    // 서류인증 상태확인(조회)
    public Map<String, Object> getEpkStatusInfo(String memberId) {
        return memberMapper.getEpkStatusInfo(memberId);
    }

    // SNS 로그인 시작 부분
    /**
     * SNS 간편 로그인 시 정보 저장 및 확인
     */
    @Transactional
    public SnsCheckResult saveSnsLoginInfo(SnsLoginParameter parameter, UserPrincipal currentUser) {
        // validation check
        if (isValidationCheck(parameter)) {
            return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }

        // 회원가입 정보 - Acess Token 회원정보 일치 확인
        SnsCheckResult x = userInfoValidationCheck(parameter);
        if (x != null) return x;

        // 나이 확인
        if (org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getYear())
                && org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getBirthday())) {
            SnsCheckResult snsCheckResult = isAgeRange(parameter);
            if (snsCheckResult != null) return snsCheckResult;
        }

        // sns_member에 회원이 이미 가입하였는지 조회
        SnsMemberInfo snsMember = memberMapper.getSnsMember(parameter);

        // 이메일, 휴대전화번호가 이미 등록되어있는지 조회
        SnsCheckResult isJoinMember = new SnsCheckResult();
        if (org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getPhoneNumber()) || org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getEmail())) {
            isJoinMember = isOriginMember(parameter);
        }

        // 개인정보 수정화면에서 사용... 같이사용하기위한 구분 파라미터
        if (parameter.isInfoCheck()) {
            // 로그인확인여부임으로 세션에정보만필요함
            if (ObjectUtils.isEmpty(currentUser) || ObjectUtils.isEmpty(snsMember)) {
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }

            if (org.apache.commons.lang3.StringUtils.isBlank(snsMember.getMemberId())
                    || org.apache.commons.lang3.StringUtils.isBlank(currentUser.getMemberId())) {
                return new SnsCheckResult(true, "가입된 SNS정보가 없습니다.");
            }

            if (!snsMember.getMemberId().equals(currentUser.getMemberId())) {
                return new SnsCheckResult(true, "가입하신 SNS로 로그인을 시도해주세요.");
            }
            return new SnsCheckResult(true);
        }

        // sns에 이미 가입한경우
        if (!ObjectUtils.isEmpty(snsMember)) {
            // 이미 비상교육 계정과 SNS 를 연동한경우 - 로그인 진행
            if (org.apache.commons.lang3.StringUtils.isNotBlank(snsMember.getMemberId())) {
                SnsCheckResult snsCheckResult1 = new SnsCheckResult(true);
                snsCheckResult1.setMemberId(snsMember.getMemberId());
                return snsCheckResult1;
            }
        }
        // SNS 가입을 하지않은 경우 snsMeber 테이블에 isnert
        else {
            //memberMapper.insertSnsMemberInfo(parameter);
        }

        // 연동하지 않은경우 - 회원가입 화면 or 연동 화면으로 이동함
        if (isJoinMember.getList() == null) {
            // 조회된 비상회원이 없는경우 - 회원가입 진행
            return new SnsCheckResult(true, true);
        }
        else {
            // SNS 계정이랑 비상 기존회원 정보랑 맵핑 화면으로 이동
            return isJoinMember;
        }
    }

    /**
     * 개인정보 수정 > SNS 연동 탭 > 연결하기 처리
     */
    @Transactional
    public SnsCheckResult saveSnsLoginInfoByMyInfo(SnsLoginParameter parameter, UserPrincipal currentUser) {

        // 1. SNS API로 해당 토큰이 유효한지 확인 및 개인정보 조회
        SnsCheckResult x = userInfoValidationCheck(parameter);
        if (x != null) return x;

        // 2. 이미 가입된 SNS 계정인지 확인
        SnsMemberInfo snsMember = memberMapper.getSnsMember(parameter);

        if (snsMember != null && snsMember.getMemberId() != null) {
            return new SnsCheckResult(true, "이미 해당 SNS 계정으로 연동된 비바샘 회원이 있습니다.");
        }

        // 3. 전화번호 또는 이메일이 있는지 확인
        if (org.apache.commons.lang3.StringUtils.isBlank(parameter.getPhoneNumber()) && org.apache.commons.lang3.StringUtils.isBlank(parameter.getEmail())) {
            return new SnsCheckResult(true, parameter.getType() + "의 이메일 혹은 휴대전화번호가 비바샘 정보와 일치해야 연결이 가능합니다.\n");
        }

        // 4. 현재 회원 정보와 전화번호 또는 이메일이 일치하는 값이 있는지 확인
        MemberInfo memberInfoView = memberMapper.getMemberInfo(parameter.getMemberId());
        if (!memberInfoView.getEmail().equals(parameter.getEmail()) && !memberInfoView.getCellphone().equals(parameter.getPhoneNumber())) {
            return new SnsCheckResult(true, parameter.getType() + "의 이메일 혹은 휴대전화번호가 비바샘 정보와 일치해야 연결이 가능합니다.\n");
        }

        if("Y".equals(currentUser.getSsoMemberYN())) {
            ApiInputDataMapping mapping  = new ApiInputDataMapping();
            ApiInputData apiParam = new ApiInputData();
            mapping.mappingInputSnsParam(parameter, apiParam);
            apiParam.setMemberId(parameter.getMemberId());
            try {
                ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .insertSnsMemberInfo(apiParam);
                if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {

                }else {
                    return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
                }
            }catch(Exception e) {
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        } else {
            parameter.setMemberId(memberInfoView.getMemberId());
            // 5. SNS_MEMBER_INFO에 데이터 등록
            if (snsMember == null) {
                if (memberMapper.insertSnsMemberInfo(parameter) == 0) {
                    return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
                }
            }
            memberMapper.updateMappinSnsMemberId(parameter);
        }

        return new SnsCheckResult(true, false);
    }

    /**
     * 개인정보 수정 > SNS 연동 탭 > 연결하기 처리
     */
    @Transactional
    public SnsCheckResult deleteSnsLoginInfoByMyInfo(SnsLoginParameter parameter, UserPrincipal currentUser) {

        final String SNS_TYPE = parameter.getType();

        // 1. SNS 연동 정보 조회
        List<SnsMemberInfo> snsMemberList = memberMapper.getSnsMemberList(parameter.getMemberId());

        // 1-1. 비바샘에 SNS로 가입된 정보가 아예 없으면 연동해제하기 위해 약관동의한 SNS 계정 연동만 unlink 처리
        if (snsMemberList == null || snsMemberList.size() <= 0) {
            unlinkSns(parameter);
            return new SnsCheckResult(true, "해당 SNS 계정으로 연동된 비바샘 회원이 존재하지 않습니다.");
        }

        // 1-2. SNS 가입 계정인데 SNS 연동 해제하는 경우 SNS가 1개 이상 가입이 되어있어야함.
        // "SNS로 가입하신 경우 1개 이상 채널에 연결되어 있어야 합니다."
        boolean isSnsJoined = memberMapper.getMemberSnsJoinInfo(parameter.getMemberId()) != null;
        if (isSnsJoined && snsMemberList.size() == 1) {
            return new SnsCheckResult(true, "SNS로 가입하신 경우 1개 이상 채널에 연결되어 있어야 합니다.");
        }

        // 2. SNS API로 해당 토큰이 유효한지 확인 및 개인정보 조회
        SnsCheckResult x = userInfoValidationCheck(parameter);
        if (x != null) return x;

        // 3. 연동 해제 하려는 계정이 DB에 연동 되어있는 계정인지 확인
        SnsMemberInfo snsMember = memberMapper.getSnsMember(parameter);

        // 3-1. 비바샘에 가입된 정보가 없으면 연동 해제하기 위해 약관동의한 SNS 계정 연동만 unlink 처리
        if (snsMember == null || snsMember.getMemberId() == null) {
            unlinkSns(parameter);
            return new SnsCheckResult(true, "해당 SNS 계정으로 연결된 비바샘 회원이 존재하지 않습니다.");
        }

        // 4. SNS 연동 해제 API 호출 처리
        boolean successSnsUnlink = unlinkSns(parameter);

        // 4-1. 연동해제 실패한경우
        if (!successSnsUnlink) {
            return new SnsCheckResult(true, "SNS 연결 해제가 정상적으로 완료되지 않아 취소되었습니다.");
        }

        if ("Y".equals(currentUser.getSsoMemberYN())) {
            ApiInputData apiParam = new ApiInputData();
            apiParam.setMemberId(parameter.getMemberId());
            apiParam.setMemberSnsType(SNS_TYPE);
            try {
                ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .deleteSnsMemberInfo(apiParam);
                if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {
                    return new SnsCheckResult(true, false);
                }else {
                    return new SnsCheckResult(true, "API 서버 오류로 취소되었습니다.");
                }
            }catch(Exception e) {
                return new SnsCheckResult(true, "API 서버 오류로 취소되었습니다.");
            }
        } else {
            // 5. SNS_MEMBER_INFO 테이블에서 DELETE 처리
            memberMapper.deleteSnsMemberInfo(parameter);
        }

        return new SnsCheckResult(true, false);
    }

    private boolean unlinkSns(SnsLoginParameter parameter) {
        if ("NAVER".equals(parameter.getType())) {
            return NaverUtil.unlinkUserInfo(parameter.getAccessToken(), environment.getProperty("naverLoginApiKey"), environment.getProperty("naverClientSecret"));
        } else if ("KAKAO".equals(parameter.getType())) {
            return KakaoUtil.unlinkUserInfo(parameter.getAccessToken());
        } else if ("FACEBOOK".equals(parameter.getType())) {
            return FacebookUtil.unlinkUserInfo(parameter.getApiId(), parameter.getAccessToken());
        }

        return true;
    }
    private boolean isValidationCheck(SnsLoginParameter parameter) {
		/*if (org.apache.commons.lang3.StringUtils.isBlank(parameter.getAccessToken())) {
			return true;
		}*/
        if (org.apache.commons.lang3.StringUtils.isBlank(parameter.getType())) {
            return true;
        }
        return false;
    }

    public SnsCheckResult userInfoValidationCheck(SnsLoginParameter parameter) {
        if ("KAKAO".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = KakaoUtil.getUserInfo(parameter);
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
            if (parameter.getYear() != null) {
                if (parameter.getYear().length() < 8){
                    parameter.setYear(parameter.getYear() + parameter.getBirthday());
                }
            }

            // 카카오 ci 암호화
            memberMapper.updateSnsIdForEncrypt(parameter);
        }
        else if ("NAVER".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = NaverUtil.getUserInfo(parameter.getAccessToken(), parameter);
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }
        else if ("GOOGLE".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = GoogleUtil.getUserInfo(parameter);
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
            String selectId = (String) userInfo.get("id");
            if (!selectId.equals(parameter.getId())) {
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }
        else if ("FACEBOOK".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = FacebookUtil.getUserInfo(parameter);
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }
        else if ("APPLE".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = AppleUtil.getUserInfo(parameter, environment.getProperty("vivasam.api.domain"));
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }
        else if ("WHALESPACE".equals(parameter.getType())) {
            HashMap<String, Object> userInfo = WhalespaceUtil.getUserInfo(parameter.getAccessToken(), parameter);
            if (userInfo == null || userInfo.size() < 1) { // 회원 정보를 가져오지 못한경우 잘못된 경로로 들어온경우임
                return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }
        else {
            return new SnsCheckResult(true, "SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }
        return null;
    }

    public SnsCheckResult isAgeRange(SnsLoginParameter parameter) {
        if (parameter.getYear().matches("[+-]?\\d*(\\.\\d+)?")) { // 년도가 숫자인 경우에만 실행
            Calendar calendar = Calendar.getInstance( );  // 현재 날짜/시간 등의 각종 정보 얻기
            int thisYear = calendar.get(Calendar.YEAR);	// 올해
            String subYear = parameter.getYear().length() >= 4 ? parameter.getYear().substring(0, 4) : parameter.getYear();
            int age = thisYear - Integer.parseInt(subYear); // 만 나이라서 + 1
            if (age < 19 || 65 < age ) {
                return new SnsCheckResult(true, "19세 이상 65세 이하만 가입이 가능합니다.");
            }
        }
        return null;
    }

    private SnsCheckResult isOriginMember(SnsLoginParameter parameter) {
        List<String> memberIdList = memberMapper.checkSnsInfoUser(parameter);

        // 기본인 이메일도 없을경우
        if (org.apache.commons.lang3.StringUtils.isBlank(parameter.getEmail())) {
            return new SnsCheckResult(true, true);
        }

        if (memberIdList.size() >= 1) {
            // 전화번호 또는 이메일과 일치하는 회원이 조회됨 -> 연동 화면으로 이동
            return new SnsCheckResult(true, memberIdList);
        }
        // 조회된 비상회원이 없는경우 - 회원가입 진행
        return new SnsCheckResult(true, true);
    }

    public SnsMemberInfo getSnsMember(SnsLoginParameter parameter) {
        return memberMapper.getSnsMember(parameter);
    }

    public List<String> getSnsMappingIdList(SnsLoginParameter parameter) {
        return memberMapper.checkSnsInfoUser(parameter);
    }

    public MemberResult getSnsMappingUpdate(SnsLoginParameter parameter) {
        MemberResult result = new MemberResult();
        result.setCode("fail");
        if ( org.apache.commons.lang3.StringUtils.isBlank(parameter.getAccessToken()) ||
                org.apache.commons.lang3.StringUtils.isBlank(parameter.getMemberId()) ||
                org.apache.commons.lang3.StringUtils.isBlank(parameter.getType())) { //validation check
            return result;
        }

        // accessToken 정보 조회 회원가입 정보 - Acess Token 회원정보 일치 확인
        // if (config.isProd() || config.isDev()) {
        SnsCheckResult x = userInfoValidationCheck(parameter);
        if (x != null) return result;

        // 회원정보 조회하기
        if (org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getId())
                && org.apache.commons.lang3.StringUtils.isNotBlank(parameter.getType())) {
            List<String> memberIdList = memberMapper.checkSnsInfoUser(parameter);
            // 입력받은 아이디가 맵핑 리스트 정보에 있는지 확인하기
            boolean isMapping = true;
            for (String id : memberIdList) {
                if (parameter.getMemberId().equals(id)) {
                    isMapping = false;
                    break;
                }
            }
            if (isMapping) {
                //맵핑 문제 발생 - 인위적으로 데이터 조작함.
                return result;
            }

            // SNS 계정이랑 비상회원 아이디랑 맵핑 진행
            String isSsoMember = getSsoMemberByUserId(parameter.getMemberId());
            if ("1".equals(isSsoMember)) {
                ApiInputDataMapping mapping  = new ApiInputDataMapping();
                ApiInputData apiParam = new ApiInputData();
                mapping.mappingInputSnsParam(parameter, apiParam);
                apiParam.setMemberId(parameter.getMemberId());
                try {
                    ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                            .insertSnsMemberInfo(apiParam);
                    if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {

                    }else {
                        return result;
                    }
                }catch(Exception e) {
                    return result;
                }
            } else {
                SnsMemberInfo snsMember = memberMapper.getSnsMember(parameter);
                if (snsMember == null) {
                    if (memberMapper.insertSnsMemberInfo(parameter) == 0) {
                        return result;
                    }
                }
                memberMapper.updateMappinSnsMemberId(parameter);
            }

            result.setCode("success"); // 메인화면으로 전달
            return result;
        }

        return result;
    }

    public boolean getMemberPasswordNotExistence(String memberId) {
        return memberMapper.getMemberPasswordNotExistence(memberId);
    }

    public boolean getSleepMemberPasswordNotExistence(String memberId) {
        return memberMapper.getSleepMemberPasswordNotExistence(memberId);
    }

    public List<SnsMemberInfo> getSnsMemberList(String memberId) {
        return memberMapper.getSnsMemberList(memberId);
    }

    public String getSleepMemberCellPhone(String memberId) {
        return memberMapper.getSleepMemberCellPhone(memberId);
    }

    /**
     * MMS 등록
     * @param smsInfo
     */
    public void saveMms(SmsInfo smsInfo) throws Exception {
    	CommonSms parameter = new CommonSms();
    	parameter.setTitle(smsInfo.getSubject());
    	parameter.setMsg(smsInfo.getMsg());
    	parameter.setPhone(smsInfo.getPhone());
    	commonSmsService.smsSend(parameter);
        //memberMapper.saveMms(smsInfo);
    }

    private String makeSmsJson(SmsInfo smsInfo) {

		List<Map<String, String>> msgDataList = new ArrayList<Map<String, String>>();

		String phone = smsInfo.getPhone();
		String pattern = "^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$";

		if(Pattern.matches(pattern, phone)) {
			Map<String, String> smsMap = new HashMap<String, String>();

			smsMap.put("msg_key", UUID.randomUUID().toString());
			smsMap.put("title", smsInfo.getSubject());
			smsMap.put("sender_number", environment.getProperty("callNumber"));
			smsMap.put("receiver_number", smsInfo.getPhone());
			smsMap.put("msg", smsInfo.getMsg());
			smsMap.put("origin_cid", "0123456789");
			smsMap.put("echo_to_webhook", "vivasam");

			msgDataList.add(smsMap);
		}

		Map<String, List<Map<String, String>>> sendMap = new HashMap<String, List<Map<String, String>>>();
		sendMap.put("msg_data", msgDataList);
		Gson gson = new Gson();
		String smsJson = gson.toJson(sendMap);

		return smsJson;
	}

    public boolean isMemberSnsCheck(SnsLoginParameter snsLoginParameter) {
        return memberMapper.isMemberSnsCheck(snsLoginParameter) >= 1;
    }

    /**
     * 통합회원 가입
     */
    @Transactional
    public String createSnsSsoMember(String tid, Map<String, String> param) {
        // 1. 비바샘 회원 생성
        String vResult = insertSnsJoin(param);

        if ("0".equals(vResult)) { // 비바샘 회원 생성 성공
            // 모바일 경로 가입 인증 업데이트
            updateMemberVia(param.get("id"));
            // 비바샘 학교 등록 신청(학교 검색을 통해 검색되지 않는 학교 등록 신청)
            if (param.containsKey("isSelectedSchool") && "false".equals(param.get("isSelectedSchool"))) {
                String qnaCd = "QA011";
                try {
                    csXSSService.cQnaInsert(param.get("id"), qnaCd, param.get("qnaTitle"), param.get("qnaContents"),
                            param.get("qnaSchLvlCd"), "", "", "", "", "", param.get("regIp"), "", "", "Y", null);
                } catch (Exception ex) {
                    throw new VivasamException("8001", "비바샘 학교 등록 신청 생성실패");
                }
            }

            // event 449 기간중 event 450 기간에만 추천인 아이디 추가
            Date now = new Date();
            EventInfo eventInfo = saemteoMapper.getEventInfoNoMatterUseYn("450");
            if (eventInfo != null) {
                Date eventSdate = null;
                Date eventEdate = null;
                try {
                    eventSdate = DateUtils.parseDate(eventInfo.getEventSdate(), "yyyy.MM.dd");
                    eventEdate = DateUtils.parseDate(eventInfo.getEventEdate() + " 23:59:59.999", "yyyy.MM.dd HH:mm:ss.SSS");
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                // 이벤트 기간내에 접속할 경우
                if (now.after(eventSdate) && now.before(eventEdate)) {
                    String memberId = param.get("id");
                    String reco = param.get("reco");
                    String via = param.get("via");
                    // 추천인코드가 입력되었을 경우
                    if (org.apache.commons.lang3.StringUtils.isNotBlank(reco)) {
                        memberMapper.updateMemberRecommenderCode(memberId, reco.trim().toUpperCase());
                    }
                    // 추천인코드가 입력되지 않았을 경우 유입경로가 event 일 경우 추천인에 이벤트로 직접가입 코드 추가
                    else if (org.apache.commons.lang3.StringUtils.isNotBlank(via) && "event".equals(via)) {
                        // 초등 PC com.vivasam.elementary.mvc.data.parameter.member.MemberRecommendationPoint.VIA_EVENT_DIRECT_JOIN 참조 할 것.
                        memberMapper.updateMemberRecommenderCode(memberId, "EVENT_DIRECT_JOIN");
                    }
                }
            }

        }

        return vResult;
    }

    @Transactional
    public String insertSnsJoin(Map<String, String> param) {
        String result = memberMapper.insertSnsJoin(param);
        return result;
    }

    /**
     * SNS로그인 회원가입 시 멤버아이디 업데이트
     * */
    @Transactional
    public void updateSnsMemberId(Map<String, String> param) {
        memberMapper.updateSnsMemberId(param);
    }

    public boolean saveMmsJoin(String cellphone) {
        if("01011112222".equals(cellphone)){
            return false;
        } else {
            return memberMapper.saveMmsJoin(cellphone) >= 1;
        }

    }

    public boolean upateIpinCi(SnsLoginParameter snsLoginParameter) {
        return memberMapper.upateIpinCi(snsLoginParameter) >= 1;
    }

    // 회원 교사 인증 여부 체크
    public String getMemberTeacherCertifiedYn(String memberId) {
        return memberMapper.getMemberTeacherCertifiedYn(memberId);
    }

    // 서류인증 재인증 가능여부 조회(만료 7일전부터 재인증 가능)
    public String getMemberTeacherCertifiedCheckYn(String memberId) {
        return memberMapper.getMemberTeacherCertifiedCheckYn(memberId);
    }

    public String getSsoMemberByUserId(String memberId) {
        return memberMapper.getSsoMemberByUserId(memberId);
    }

    public int updateMemberValidateEmail(MemberValidateEmail memberValidateEmail) {
        return memberMapper.updateMemberValidateEmail(memberValidateEmail);
    }

    /**
     * 회원가입 프로세스 개선
     * 신규가입 시 통합회원 전환을 위한 케이스 확인 메소드
     * case0 - 완전 신규가입일 경우
     * case1 - 비바샘 회원 O && 연수원 가입 X && 연수원에 동일 아이디 X
     * case2 - 비바샘 회원 O && 연수원 회원 X && 연수원에 동일 아이디 O
     * case3 - 비바샘 회원 X && 연수원 회원 O && 비바샘에 동일 아이디 X
     * case4 - 비바샘 회원 X && 연수원 회원 O && 비바샘에 동일 아이디 O
     * case5 - 비바샘 회원 O && 연수원 회원 O && 기존 아이디 사용 가능​
     * case6 - 비바샘 회원 O && 연수원 회원 O && 기존 아이디 사용 불가
     * case7 - 비바샘 회원 O && 연수원 회원 O && 아이디 동일
     * case8 - 이미 통합회원인 경우
     */
    public String newJoinSSoCaseCheck(String existId, List<Map<String, String>> tschoolUserId) {
        String checkCase = "";
        if(!"".equals(existId)) { //1,2,5,6,7,8
            // 이미 통합회원인지 체크
            String isSsoMember = memberMapper.getSsoMemberByUserId(existId);
            if("1".equals(isSsoMember)) {
                return "8";
            }

            // 비바샘 단독 아이디로 티스쿨, SSO 가입여부 조회
            boolean isAvailable = this.checkAvailableSsoIdForOnlyViva(existId);

            if(org.apache.commons.lang3.ObjectUtils.isNotEmpty(tschoolUserId) && tschoolUserId.size() > 0) {
                checkCase = "6";
                for(Map<String, String> tUser : tschoolUserId) {
                    if("true".equals(tUser.get("isusable")) && existId.equals(tUser.get("tid"))) {
                        checkCase = "7";
                        break;
                    } else {
                        if("true".equals(tUser.get("isusable"))) {
                            checkCase = "5";
                        }
                    }
                }
            } else {
                checkCase = isAvailable ? "1" : "2";
            }
        } else { // 3,4
            if(tschoolUserId.size() == 0) return "0";
            checkCase = "4";
            for(Map<String, String> tUser : tschoolUserId) {
                if("true".equals(tUser.get("isusable"))) {
                    checkCase = "3";
                }

            }
        }

        return checkCase;
    }

    public void updateCertifyMail(MemberValidateEmail memberValidateEmail) {
        int emailResult = memberMapper.updateMemberValidateEmail(memberValidateEmail);

        if(emailResult > 0) {
            String domain = memberValidateEmail.getEmail().split("@")[1];

            Map<String, String> certifyUpdateParam = new HashMap<>();
            certifyUpdateParam.put("memberId", memberValidateEmail.getMemberId());
            certifyUpdateParam.put("validType", "EMAIL");
            certifyUpdateParam.put("EPKI_CERTDN", domain);
            certifyUpdateParam.put("EPKI_CERTSN", domain);
            certifyUpdateParam.put("VALID_YN", "Y");
            // EPKI 인증코드 업데이트
            memberMapper.updateMemberReCertify(certifyUpdateParam);
            memberMapper.insertMemberValidateLogInfo(certifyUpdateParam);

            // memberMileage에서 TargetMenu에 본인 아이디로 검색해서 추천인 아이디 찾아오기
            String mileageCheck = memberMapper.selectRecommendId(memberValidateEmail.getMemberId());
            // 본인 아이디에 추천인 아이디가 있는지 찾아오기
            String recommendId = memberMapper.findRecommendId(memberValidateEmail.getMemberId());
            //mileageCheck에 아이디가 있으면 이미 마일리지를 적립했기 때문에 마일리지 적립 X >>> mileageCheck에 아이디는 null 또는 공백
            //recommendId가 있으면 마일리지 지급. >>> recommendId에 아이디는 null이나 공백이면 X
            if(recommendId != null && !"".equals(recommendId) && ("".equals(mileageCheck) || mileageCheck == null)){
                UserPrincipal memberInfoCheck = securityMapper.findByUserId(recommendId);
                // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                if ("AU300".equals(memberInfoCheck.getMLevel()) && "Y".equals(memberInfoCheck.getValidYn()) && "0".equals(memberInfoCheck.getMTypeCd())) {
                    memberMileageService.saveRecoIdMileagePlus(recommendId, memberValidateEmail.getMemberId());
                }
            }

        }

    }

    public Map<String, Object> selectMarketingInfo(String memberId) {
        Map<String, Object> resultMap = new HashMap<>();
        ApiInputData apiParam = new ApiInputData();
        apiParam.setMemberId(memberId);

        //탈퇴사유 등록 해야됨
        try {
            ApiOutputListData outputList = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                    .selectMarketingInfo(apiParam);

            if(outputList != null && !outputList.getStatus().isError() && outputList.getStatus().getCode() == 200 ) {
                for(ApiResponseData output : outputList.getData()) {
                    if("0".equals(output.getSrcProcSite())) {
                        resultMap.put("mailYn", output.getMailYn());
                        resultMap.put("smsYn", output.getSmsYn());
                        resultMap.put("telYn", output.getTelYn());
                        resultMap.put("mailAgreeDate", org.apache.commons.lang3.StringUtils.defaultString(output.getMailAgreeDate(), ""));
                        resultMap.put("smsAgreeDate", org.apache.commons.lang3.StringUtils.defaultString(output.getSmsAgreeDate(), ""));
                        resultMap.put("telAgreeDate", org.apache.commons.lang3.StringUtils.defaultString(output.getTelAgreeDate(), ""));
                    }else {
                        resultMap.put("mailYnT", "1".equals(output.getMailYn())  ? "Y" : "N");
                        resultMap.put("smsYnT",  "1".equals(output.getSmsYn())? "Y" : "N");
                        resultMap.put("telYnT", "1".equals(output.getTelYn() ) ? "Y" : "N");
                        resultMap.put("mailAgreeDateT", org.apache.commons.lang3.StringUtils.defaultString(output.getMailAgreeDate(), ""));
                        resultMap.put("smsAgreeDateT", org.apache.commons.lang3.StringUtils.defaultString(output.getSmsAgreeDate(), ""));
                        resultMap.put("telAgreeDateT", org.apache.commons.lang3.StringUtils.defaultString(output.getTelAgreeDate(), ""));
                    }
                }
                resultMap.put("result", "success");
            }
        }catch(Exception e) {
            resultMap.put("result", "error");

        }
        return resultMap;
    }

    public boolean recommenderCheck(String recommender) {
        if(org.apache.commons.lang3.StringUtils.isBlank(recommender)) return false;
        int cnt = memberMapper.recommenderCheck(recommender);
        return cnt == 1 ;
    }

    public String existRecommender(String recommender) {
        return memberMapper.existRecommender(recommender);
    }

    public String validYn(String recommender) {
        return memberMapper.validYn(recommender);

    }

    public String getMemberSnsJoinInfo(String memberId) { return memberMapper.getMemberSnsJoinInfo(memberId);}

    public String decryptText(String password) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);

            Base64.Decoder docoder = Base64.getDecoder();
            byte decrypted[] = docoder.decode(password.getBytes("UTF-8"));

            return new String(cipher.doFinal(decrypted));
        } catch(Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public int getMemberRetCnt(String memberId) { return memberMapper.getMemberRetCnt(memberId);}

    public String getMemberLoginInfo(LoginRequest loginRequest) { return memberMapper.getMemberLoginInfo(loginRequest);}

    public void updateMemberRetCnt(LoginRequest loginRequest) { memberMapper.updateMemberRetCnt(loginRequest);}

    @Transactional
    public FindPwd sendCertificationNumByTempPwd(FindPwd findPwd, HttpServletRequest request) throws Exception{

        int affectedRow = 0;

        String tempPassword = RandomStringUtils.randomAlphanumeric(10);

        String uuid = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(uuid + findPwd.getMemberId(), tempPassword);

        String uuidTest = "";
        if(redisTemplate.opsForValue().get(uuid + findPwd.getMemberId()) != null) {
            findPwd.setUuidForCertifiNum(uuid);
        } else {
            throw new VivasamException("7001", "uuid 저장 실패");
        }


        if (StringUtils.hasText(findPwd.getCellPhone())) {
            // 2. 인증번호 생성 후 문자 메세지 생성
            String msg = "\n비바샘 임시 비밀번호는 " + tempPassword + "입니다.";

            // 3. DB insert
            SmsInfo sms = new SmsInfo();
            sms.setSubject("비바샘 임시 비밀번호");
            sms.setMsg(msg);
            sms.setPhone(findPwd.getCellPhone());
            saveMms(sms);
            affectedRow = 1;
            //레디스에 보낸기록 저장
            userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");
        }

        if (affectedRow < 1) {
            throw new VivasamException("7001", "전송 실패");
        }

        //레디스에 보낸기록 저장
        userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");

        // 임시 비밀번호 해당 회원 비밀번호로 업데이트
        findPwd.setTempPwd(tempPassword);
        memberMapper.updateMemberOldPassword(findPwd);
        memberMapper.updateMemberPw(findPwd);
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setRetCnt(15);
        loginRequest.setUsername(findPwd.getMemberId());
        updateMemberRetCnt(loginRequest);

        return findPwd;
    }
}