package edu.visang.vivasam.member.controller;

import edu.visang.vivasam.api.ApiConnectionUtil;
import edu.visang.vivasam.api.data.ApiInputData;
import edu.visang.vivasam.api.data.ApiOutputData;
import edu.visang.vivasam.common.elasticlogin.ElasticLoginClient;
import edu.visang.vivasam.common.service.CheckXSSService;
import edu.visang.vivasam.common.utils.*;
import edu.visang.vivasam.config.GlobalConfig;
import edu.visang.vivasam.cs.service.CsService;
import edu.visang.vivasam.exception.VivasamException;
import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.member.service.MemberRecommendationService;
import edu.visang.vivasam.member.service.MemberService;
import edu.visang.vivasam.myInfo.service.MyInfoService;
import edu.visang.vivasam.payload.LoginRequest;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.JwtTokenProvider;
import edu.visang.vivasam.security.UserPrincipal;
import edu.visang.vivasam.security.mapper.SecurityMapper;
import edu.visang.vivasam.sso.service.SsoRestfulService;
import edu.visang.vivasam.sso.vo.ParamVo;
import org.apache.commons.lang3.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.io.PrintWriter;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/member")
public class MemberController {

    private static final Logger logger = LoggerFactory.getLogger(MemberController.class);

//    CacheManager cacheManager = CacheManager.create();
//    Cache cache = cacheManager.getCache("members");
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    MemberService memberService;

    @Autowired
    MemberMileageService memberMileageService;

    @Autowired
    SecurityMapper securityMapper;

    @Autowired
    CheckXSSService checkXSSService;

    @Autowired
    CsService CsXSSService;

    @Autowired
    SsoRestfulService ssoRestfulService;

    @Autowired
    MyInfoService myInfoService;

    @Autowired
    Environment environment;

    @Autowired
    JwtTokenProvider jwtTokenProvider;

    @Autowired
    MemberRecommendationService memberRecommendationService;

    @Autowired
    UserSendTempLog userSendTempLog;

    @Autowired
    GlobalConfig globalConfig;

    @PostMapping("/checkExistPerson")
    public ResponseEntity<?> checkExistPerson(@RequestBody Map<String, String> requestParams) {

        String name = requestParams.get("name");
        String email = requestParams.get("email");

        logger.info("{} / {}", name, email);

        int result = memberService.checkExistPerson(name, email);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/checkExistId")
    public ResponseEntity<?> check_exist_Id(@RequestParam(value = "id", required = true) String id) throws Exception {

        String result = memberService.checkExistId(id);

        logger.info("{} / {}", id);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/insertJoin")
    public ResponseEntity<?> insertJoin(HttpServletRequest request, @RequestBody Map<String,Map<String, Object>> requestParamMap) {
        Map<String,Object> requestParams= requestParamMap.get("0");

        //필수 항목
        String id = VivasamUtil.isNull(String.valueOf(requestParams.get("userId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String password = VivasamUtil.isNull(String.valueOf(requestParams.get("password")));
        String Email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("telephone")));
        String myGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("myGrade")));
        String SchoolName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        String SchoolCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        String loc_dept1 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaCode")));
        String loc_dept2 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchCode")));
        String mainSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("mainSubject")));
        String secondSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("secondSubject")));

        String birthDay = VivasamUtil.isNull(String.valueOf(requestParams.get("birthDay")));
        String birth = birthDay.replaceAll("-","");

        String lunar = VivasamUtil.isNull(String.valueOf(requestParams.get("lunar")));
        String IPIN_CI = VivasamUtil.isNull(String.valueOf(requestParams.get("isIpin")));
        String EPKI_CERTDN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTDN")));
        String EPKI_CERTSN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTSN")));
        String VALID_YN = VivasamUtil.isNull(String.valueOf(requestParams.get("VALID_YN")));
        String authentication = VivasamUtil.isNull(String.valueOf(requestParams.get("authentication")));

        String sex = VivasamUtil.isNull(String.valueOf(requestParams.get("gender")));

        String zip = VivasamUtil.isNull(String.valueOf(requestParams.get("zipNo")));
        String addr1 = VivasamUtil.isNull(String.valueOf(requestParams.get("address")));
        String addr2 = VivasamUtil.isNull(String.valueOf(requestParams.get("addressDetail")));

        //비상교과서 채택여부
        String visangTbYN = VivasamUtil.isNull(String.valueOf(requestParams.get("visangTbYN")));

        //개인정보 유효기간설정
        String expiryTermNum = VivasamUtil.isNull(String.valueOf(requestParams.get("expiryTermNum")));

        String vMagazineYN = "N";

        String Agree1 = String.valueOf(requestParams.get("service"));
        String Agree2 = String.valueOf(requestParams.get("privacy"));
        String Agree3 = String.valueOf(requestParams.get("all"));
        String Agree4 = String.valueOf(requestParams.get("marketing"));

        logger.info("==============================================================x");
        logger.info("id   : " + id);
        logger.info("name   : " + name);
        logger.info("password   : " + password);
        logger.info("Email   : " + Email);
        logger.info("cellphone   : " + cellphone);
        logger.info("myGrade   : " + myGrade);
        logger.info("SchoolName   : " + SchoolName);
        logger.info("SchoolCode   : " + SchoolCode);
        logger.info("loc_dept1   : " + loc_dept1);
        logger.info("loc_dept2   : " + loc_dept2);
        logger.info("mainSubject   : " + mainSubject);
        logger.info("secondSubject   : " + secondSubject);
        logger.info("birth   : " + birth);
        logger.info("lunar   : " + lunar);
        logger.info("IPIN_CI   : " + IPIN_CI);
        logger.info("EPKI_CERTDN   : " + EPKI_CERTDN);
        logger.info("EPKI_CERTSN   : " + EPKI_CERTSN);
        logger.info("VALID_YN   : " + VALID_YN);
        logger.info("authentication   : " + authentication);

        logger.info("sex   : " + sex);

        logger.info("zip   : " + zip);
        logger.info("addr1   : " + addr1);
        logger.info("addr2   : " + addr2);

        logger.info("visangTbYN   : " + visangTbYN);
        logger.info("expiryTermNum   : " + expiryTermNum);
        logger.info("==============================================================x");

        id = checkXSSService.ReplaceValue(request, "id", id);
        name = checkXSSService.ReplaceValue(request, "name", name);
        Email = checkXSSService.ReplaceValue(request, "Email", Email);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        myGrade = checkXSSService.ReplaceValue(request, "myGrade", myGrade);
        SchoolName = checkXSSService.ReplaceValue(request, "SchoolName", SchoolName);
        SchoolCode = checkXSSService.ReplaceValue(request, "SchoolCode", SchoolCode);
        loc_dept1 = checkXSSService.ReplaceValue(request, "loc_dept1", loc_dept1);
        loc_dept2 = checkXSSService.ReplaceValue(request, "loc_dept2", loc_dept2);
        mainSubject = checkXSSService.ReplaceValue(request, "mainSubject", mainSubject);
        secondSubject = checkXSSService.ReplaceValue(request, "secondSubject", secondSubject);
        birth = checkXSSService.ReplaceValue(request, "birth", birth);
        lunar = checkXSSService.ReplaceValue(request, "lunar", lunar);
        IPIN_CI = checkXSSService.ReplaceValue(request, "IPIN_CI", IPIN_CI);
        EPKI_CERTDN = checkXSSService.ReplaceValue(request, "EPKI_CERTDN", EPKI_CERTDN);
        EPKI_CERTSN = checkXSSService.ReplaceValue(request, "EPKI_CERTSN", EPKI_CERTSN);
        VALID_YN = checkXSSService.ReplaceValue(request, "VALID_YN", VALID_YN);
        authentication = checkXSSService.ReplaceValue(request, "authentication", authentication);
        sex = checkXSSService.ReplaceValue(request, "sex", sex);
        zip = checkXSSService.ReplaceValue(request, "zip", zip);
        addr1 = checkXSSService.ReplaceValue(request, "addr1", addr1);
        addr2 = checkXSSService.ReplaceValue(request, "addr2", addr2);
        visangTbYN = checkXSSService.ReplaceValue(request, "visangTbYN", visangTbYN);
        expiryTermNum = checkXSSService.ReplaceValue(request, "expiryTermNum", expiryTermNum);
        Agree3 = checkXSSService.ReplaceValue(request, "Agree3", Agree3);
        Agree4 = checkXSSService.ReplaceValue(request, "Agree4", Agree4);

        Map<String, String> param = new HashMap<>();

        param.put("id", String.valueOf(id));
        param.put("name", String.valueOf(name));
        param.put("password", String.valueOf(password));
        param.put("Email", String.valueOf(Email));
        param.put("cellphone", String.valueOf(cellphone));
        param.put("myGrade", String.valueOf(myGrade));
        param.put("SchoolName", String.valueOf(SchoolName));
        param.put("SchoolCode", String.valueOf(SchoolCode));
        param.put("loc_dept1", String.valueOf(loc_dept1));
        param.put("loc_dept2", String.valueOf(loc_dept2));
        param.put("mainSubject", String.valueOf(mainSubject));
        param.put("secondSubject", String.valueOf(secondSubject));
        param.put("birth", String.valueOf(birth));
        param.put("lunar", String.valueOf(lunar));
        param.put("IPIN_CI", String.valueOf(IPIN_CI));
        param.put("EPKI_CERTDN", String.valueOf(EPKI_CERTDN));
        param.put("EPKI_CERTSN", String.valueOf(EPKI_CERTSN));
        param.put("VALID_YN", String.valueOf(VALID_YN));
        if(String.valueOf(VALID_YN).equals("") || String.valueOf(VALID_YN) == null) param.put("VALID_YN", "N");
        param.put("authentication", String.valueOf(authentication));

        param.put("sex", String.valueOf(sex));

        param.put("zip", String.valueOf(zip));
        param.put("addr1", String.valueOf(addr1));
        param.put("addr2", String.valueOf(addr2));

        param.put("visangTbYN", String.valueOf(visangTbYN));
        param.put("expiryTermNum", String.valueOf(expiryTermNum));

        param.put("Agree3", String.valueOf(Agree3)); //제3자 정보제공 동의 (선택)
        param.put("Agree4", String.valueOf(Agree4)); //마케팅 및 광고 활용 동의 (선택)
        param.put("snsJoin", null);
        //회원등록
        String result = memberService.insertJoin(param);

        logger.info("==================================================");
        logger.info("result");
        logger.info("==================================================");
        logger.info("result   : " + result);
        logger.info("==================================================");


        if (result.equals("0")) {

            //모바일 경로 가입 인증 업데이트
            memberService.updateMemberVia(id);

            // 학교 정보 직접 등록인지 아닌지 판단
            // True : 정보 검색 / False : 직접 등록
            String isSelect =  VivasamUtil.isNull(String.valueOf(requestParams.get("isSelect")));
            logger.info("isSelect   : " + isSelect);

            // 회원가입 성공시 Q&A작업
            // 학교 직접 등록인 경우 Q&A 등록하기
            if("false".equals(isSelect)){

                logger.info("==================================================");
                logger.info("school Q&A Insert");
                logger.info("==================================================");

                // 학교 직접 등록인 경우 학교급, 학교 지역을 판단하여 설문조사로 넣기 위해 작업
                String schoolGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolGrade")));
                String fkareaName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaName")));
                String fkbranchName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchName")));
                String requestedTerm = VivasamUtil.isNull(String.valueOf(requestParams.get("requestedTerm")));
                String qnaSchLvlCd = "";


                schoolGrade =  checkXSSService.ReplaceValue(request, "schoolGrade", schoolGrade);
                fkareaName = checkXSSService.ReplaceValue(request, "fkareaName", fkareaName);
                fkbranchName =  checkXSSService.ReplaceValue(request, "fkbranchName", fkbranchName);
                requestedTerm = checkXSSService.ReplaceValue(request,"requestedTerm", requestedTerm);

                // 학교 직접 등록시 학교급, 지역 코드 받아오기
                if("E".equals(schoolGrade)){
                    schoolGrade = "초등";
                    qnaSchLvlCd = "ES";
                }
                else if("M".equals(schoolGrade)){
                    schoolGrade = "중등";
                    qnaSchLvlCd = "MS";
                }else if("H".equals(schoolGrade)){
                    schoolGrade = "고등";
                    qnaSchLvlCd = "HS";
                }else if("H".equals(schoolGrade)){
                    schoolGrade = "고등";
                    qnaSchLvlCd = "HS";
                }else if("C".equals(schoolGrade)){
                    schoolGrade = "대학";
                    qnaSchLvlCd = "CS";
                }else if("K".equals(schoolGrade)){
                    schoolGrade = "유치원";
                    qnaSchLvlCd = "KS";
                }else if("O".equals(schoolGrade)){
                    schoolGrade = "교육기관";
                    qnaSchLvlCd = "OS";
                }

                // 해당되는 Q&A 값 넣어주기
                String qnaCd = "QA011";
                String member_id = id;
                String qnaTitle =  VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName"))) + "_학교등록신청";
                String qnaContents = "학교등록 신청\n\n- 학교급 : ";
                qnaContents += schoolGrade;
                qnaContents += "\n- 학교명  : ";
                qnaContents += SchoolName;
                qnaContents += "\n- 학교지역  : ";
                qnaContents += fkareaName + " > " + fkbranchName;
                qnaContents += "\n- 별도 요청사항  : "+ requestedTerm ;
                qnaContents += "\n";
                qnaContents += "- 학교변경 동의여부  : Y\n";

                qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", qnaTitle);
                qnaContents = checkXSSService.ReplaceValue(request,"qnaContents", qnaContents);

                logger.debug("==============================================================x");
                logger.debug("qnaCd   : " + qnaCd);
                logger.debug("qnaTitle   : " + qnaTitle);
                logger.debug("qnaContents   : " + qnaContents);
                logger.debug("==============================================================x");


                Map<String,String> resultMap = new HashMap<>();
                String regIp = request.getRemoteAddr();
                try {
                    int updateCount = CsXSSService.cQnaInsert(member_id, qnaCd, qnaTitle, qnaContents,
                            qnaSchLvlCd, "", "", "", "", "", regIp, "","","Y", null);
                    resultMap.put("code","0000");
                    resultMap.put("qnaId", updateCount + "") ;
                    resultMap.put("msg","성공");
                } catch (Exception e) {
                    resultMap.put("code","1111");
                    resultMap.put("msg","실패");
                    logger.error(e.toString());
                }
            }

            if (vMagazineYN.equals("Y")) {

                String ppp = id + "#" + SchoolName + "#" + zip + "#" + addr1 + "#" + addr2 + "#" + cellphone + "#" + SchoolCode;

                Map<String, String> params = new HashMap<String, String>();
                params.put("idx", "2");
                params.put("id", String.valueOf(id));
                params.put("cellphone", String.valueOf(cellphone));
                params.put("SchoolName", String.valueOf(SchoolName));
                params.put("SchoolCode", String.valueOf(SchoolCode));
                params.put("zip", String.valueOf(zip));
                params.put("addr1", String.valueOf(addr1));
                params.put("addr2", String.valueOf(addr2));
                params.put("etc", ppp);

                memberService.insertVmagazine(params);

            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/updateMemberInfo")
    public ResponseEntity<?> updateMemberInfo(HttpServletRequest request, @CurrentUser UserPrincipal currentUser, @RequestBody Map<String,Map<String, Object>> requestParamMap) {
        Map<String,Object> requestParams= requestParamMap.get("0");
        if(currentUser == null || !StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("INVALID");
        }

        //필수 항목
        String memberId = currentUser.getMemberId();
        String email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("telephone")));
        String schCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        String schName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        String directlyAgree = VivasamUtil.isNull(String.valueOf(requestParams.get("directlyAgree")));
        String myGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("myGrade")));
        String fkareacode = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaCode")));
        String fkbranchcode = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchCode")));
        String birth = VivasamUtil.isNull(String.valueOf(requestParams.get("birthDay")));
        birth = birth.replaceAll("-","");
        String lunar = VivasamUtil.isNull(String.valueOf(requestParams.get("lunar")));
        String zip = VivasamUtil.isNull(String.valueOf(requestParams.get("zipNo")));
        String addr1 = VivasamUtil.isNull(String.valueOf(requestParams.get("address")));
        String addr2 = VivasamUtil.isNull(String.valueOf(requestParams.get("addressDetail")));
        String sex = VivasamUtil.isNull(String.valueOf(requestParams.get("gender")));
        String visangTbYN = VivasamUtil.isNull(String.valueOf(requestParams.get("visangTbYN")));
        String expiryTermNum = VivasamUtil.isNull(String.valueOf(requestParams.get("expiryTermNum")));
        String mTypeCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mTypeCd")));

        Object marketingSms = requestParams.get("marketingSms");
        Object marketingEmail = requestParams.get("marketingEmail");
        Object marketingTel = requestParams.get("marketingTel");
        Object tschMarketingSms = requestParams.get("tschMarketingSms");
        Object tschMarketingEmail = requestParams.get("tschMarketingEmail");
        Object tschMarketingTel = requestParams.get("tschMarketingTel");
        String marketingSmsYn = "N";
        if((Boolean) marketingSms){
            marketingSmsYn = "Y";
        }
        String marketingEmailYn = "N";
        if((Boolean) marketingEmail){
            marketingEmailYn = "Y";
        }
        String marketingTelYn = "N";
        if((Boolean) marketingTel){
            marketingTelYn = "Y";
        }
        String tschMarketingSmsYn = "N";
        if ((Boolean) tschMarketingSms) {
            tschMarketingSmsYn = "Y";
        }
        String tschMarketingEmailYn = "N";
        if ((Boolean) tschMarketingEmail) {
            tschMarketingEmailYn = "Y";
        }
        String tschMarketingTelYn = "N";
        if ((Boolean) tschMarketingTel) {
            tschMarketingTelYn = "Y";
        }

        String loginType = jwtTokenProvider.parseLoginTypeFromRequest(request);
        if (loginType == null || LoginType.LOGIN.name().equals(loginType)) {
            /* ISMS 개인정보 수정시 비밀번호 일치하지 않고, 코드 입력후 넘어왔을떄, 입력값과 현재 DB상 비밀번호를 조회한후 일치하지 않으면 진행한다.
             * 2021-02-17 김인수 */
            boolean pwdNotExis = memberService.getMemberPasswordNotExistence(currentUser.getMemberId());
            if (!pwdNotExis) {
                String password = requestParams.get("password").toString().replaceAll("'", "''");
                int chkResult = myInfoService.checkPwd(password, memberId);
                if (chkResult < 1) {
                    return ResponseEntity.ok("INVALID");
                }
            } else {
                return ResponseEntity.ok("INVALID");
            }

        } else {
            // 로그인 방식이 SNS 로그인일 경우 accessToken 으로 유효성 검증, 유효하지 않은 accessToken 일 경우 업데이트 중지
            String accessToken = VivasamUtil.isNull(String.valueOf(requestParams.get("accessToken")));
            String apiId = VivasamUtil.isNull(String.valueOf(requestParams.get("apiId")));
            String idToken = VivasamUtil.isNull(String.valueOf(requestParams.get("idToken")));

            SnsLoginParameter snsLoginParameter = new SnsLoginParameter();
            snsLoginParameter.setType(loginType);
            snsLoginParameter.setAccessToken(accessToken);
            snsLoginParameter.setApiId(apiId);
            snsLoginParameter.setIdToken(idToken);
            SnsCheckResult x = memberService.userInfoValidationCheck(snsLoginParameter);
            if (x != null) return ResponseEntity.ok("INVALID");
        }

        String mainSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("mainSubject")));
        String secondSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("secondSubject")));

        logger.info("------------------------------------");
        logger.info("exeMyinfoModify");
        logger.info("------------------------------------");
        logger.info("memberId       : " + memberId         );
        logger.info("email          : " + email            );
        logger.info("cellphone      : " + cellphone        );
        logger.info("schCode        : " + schCode          );
        logger.info("schName        : " + schName          );
        logger.info("directlyAgree  : " + directlyAgree    );
        logger.info("myGrade        : " + myGrade          );
        logger.info("fkareacode     : " + fkareacode       );
        logger.info("fkbranchcode   : " + fkbranchcode     );
        logger.info("birth          : " + birth            );
        logger.info("lunar          : " + lunar            );
        logger.info("zip            : " + zip              );
        logger.info("addr1          : " + addr1            );
        logger.info("addr2          : " + addr2            );
        logger.info("sex            : " + sex              );
        logger.info("visangTbYN     : " + visangTbYN       );
        logger.info("mainSubject    : " + mainSubject      );
        logger.info("secondSubject  : " + secondSubject    );
        logger.info("mTypeCd        : " + mTypeCd);
        logger.info("------------------------------------");
        memberId = checkXSSService.ReplaceValue(request, "memberId", memberId);
        email = checkXSSService.ReplaceValue(request, "email", email);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        schCode = checkXSSService.ReplaceValue(request, "schCode", schCode);
        schName = checkXSSService.ReplaceValue(request, "schName", schName);
        directlyAgree = checkXSSService.ReplaceValue(request, "directlyAgree", directlyAgree);
        myGrade = checkXSSService.ReplaceValue(request, "myGrade", myGrade);
        fkareacode = checkXSSService.ReplaceValue(request, "fkareacode", fkareacode);
        fkbranchcode = checkXSSService.ReplaceValue(request, "fkbranchcode", fkbranchcode);
        birth = checkXSSService.ReplaceValue(request, "birth", birth);
        lunar = checkXSSService.ReplaceValue(request, "lunar", lunar);
        zip = checkXSSService.ReplaceValue(request, "zip", zip);
        addr1 = checkXSSService.ReplaceValue(request, "addr1", addr1);
        addr2 = checkXSSService.ReplaceValue(request, "addr2", addr2);
        sex = checkXSSService.ReplaceValue(request, "sex", sex);
        visangTbYN = checkXSSService.ReplaceValue(request, "visangTbYN", visangTbYN);
        expiryTermNum = checkXSSService.ReplaceValue(request, "expiryTermNum", expiryTermNum);
        mainSubject = checkXSSService.ReplaceValue(request, "mainSubject", mainSubject);
        secondSubject = checkXSSService.ReplaceValue(request, "secondSubject", secondSubject);

        Map<String, String> param = new HashMap<String, String>();

        param.put("memberId", memberId );
        param.put("email", email);
        param.put("cellphone", cellphone);
        param.put("schCode", schCode);
        param.put("schName", schName);
        param.put("directlyAgree", directlyAgree);
        param.put("myGrade", myGrade);
        param.put("fkareacode", fkareacode );
        param.put("fkbranchcode", fkbranchcode );
        param.put("birth", birth);
        param.put("lunar", lunar);
        param.put("zip", zip);
        param.put("addr1", addr1);
        param.put("addr2", addr2);
        param.put("sex", sex);
        param.put("visangTbYN", visangTbYN);
        param.put("expiryTermNum", expiryTermNum);
        param.put("marketingSmsYn", marketingSmsYn);
        param.put("marketingEmailYn", marketingEmailYn);
        param.put("marketingTelYn", marketingTelYn);
        param.put("tschMarketingSmsYn", tschMarketingSmsYn);
        param.put("tschMarketingEmailYn", tschMarketingEmailYn);
        param.put("tschMarketingTelYn", tschMarketingTelYn);
        param.put("mainSubject", mainSubject);
        param.put("secondSubject", secondSubject);
        param.put("mTypeCd", mTypeCd);
        //	정보 수정 시작!!!!
//        int modifyResult = memberService.updateMemberInfo(param);
        //[SSO] 통합회원인 경우 처리코드 추가
        int result = 0;
        try
        {
            result = memberService.exeSsoMyinfoModify(param);
        }catch(Exception ex)
        {
            ParamVo paramVo = new ParamVo();
            paramVo.setFail_log(ex.getMessage());
            paramVo.setV_AfterID(memberId);
            paramVo.setV_BeforeID(memberId);
            paramVo.setProc_gn("회원수정실패(모바일):updateMemberInfo");
            ssoRestfulService.insertToidAsidFailLog(paramVo);
        }

        if(result > 0) {
            return ResponseEntity.ok("0000");
        } else {
            return ResponseEntity.ok("1111");
        }

    }

    @PostMapping("/awake")
    public ResponseEntity<?> awake(@Valid @RequestBody LoginRequest loginRequest, @CurrentUser UserPrincipal currentUser) {
//        return ResponseEntity.ok(memberService.inactiveMovePersonal("0", loginRequest.getUsername(), loginRequest.getPassword()));
        String result = memberService.wakeupInactiveUser("0", loginRequest.getUsername(), loginRequest.getPassword());
        if ("0000".equals(result)) {
            UserPrincipal userInfo = securityMapper.findByUserId(loginRequest.getUsername());
            if (userInfo != null && "AU300".equals(userInfo.getMLevel()) && "Y".equals(userInfo.getValidYn()) && "0".equals(userInfo.getMTypeCd())) {
                // 휴면해지 마일리지를 지급
                Mileage mileage = new Mileage(loginRequest.getUsername(), MileageCode.AWAKE.getAmount(), MileageCode.AWAKE.getCode());
                memberMileageService.insertMileagePlus(mileage);
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/findId")
    public ResponseEntity<?> findId(HttpServletRequest request, @Valid @RequestBody FindId findId) {

        String memberName = findId.getMemberName();
        String certifyMethod = findId.getCertifyMethod();
        String searchString = findId.getSearchString();

        Map<String, String> resultMemberSimpleInfo = memberService.findId(memberName, certifyMethod, searchString);

        if (StringUtils.isEmpty(resultMemberSimpleInfo)) {
            throw new VivasamException("2001", "입력하신 정보와 일치하는 아이디가 없습니다. 다시 확인해 주세요");
        }
        else {
            // sns 가입이 되어있는지 확인
            if (org.apache.commons.lang3.StringUtils.isNotBlank(resultMemberSimpleInfo.get("memberId"))) {
                boolean pwdNotExis = memberService.getMemberPasswordNotExistence(resultMemberSimpleInfo.get("memberId"));
                if (pwdNotExis) {
                    List<SnsMemberInfo> snsMemberList = memberService.getSnsMemberList(resultMemberSimpleInfo.get("memberId"));
                    if (snsMemberList != null && snsMemberList.size() >= 1) {
                        // SNS 연동된 회원 정보가 존재하는경우
                        MemberResult result = new MemberResult();
                        result.setCode("success");
                        String msg = getSnsMsg(snsMemberList);
                        result.setMsg(msg + "(으)로 가입된 회원입니다.\n로그인 페이지에서 SNS 버튼을 통해 로그인해주세요.");

                        return ResponseEntity.ok(result);
                    }
                }
            }
        }
        return ResponseEntity.ok(resultMemberSimpleInfo);
    }

    private String getSnsMsg(List<SnsMemberInfo> snsMemberList) {
        String msg = "";
        for (int i = 0; i < snsMemberList.size() ; i++) {
            SnsMemberInfo object = snsMemberList.get(i);
            msg += i == 0 ? "" : ", ";

            if ("KAKAO".equals(object.getSnsType())) {
                msg += "카카오톡";
            }
            else if ("FACEBOOK".equals(object.getSnsType())) {
                msg += "페이스북";
            }
            else if ("NAVER".equals(object.getSnsType())) {
                msg += "네이버";
            }
            else if ("GOOGLE".equals(object.getSnsType())) {
                msg += "구글";
            }
            else if ("APPLE".equals(object.getSnsType())) {
                msg += "애플";
            }
            else if ("WHALESPACE".equals(object.getSnsType())) {
                msg += "웨일스페이스";
            }
        }
        return msg;
    }

    @PostMapping("/findSleepId")
    public ResponseEntity<?> findSleepId(HttpServletRequest request, @Valid @RequestBody FindId findId) {
        logger.info("memberName : {}, memberEmail : {}", findId.getMemberName(), findId.getMemberEmail());
        String memberName = findId.getMemberName();
        String memberEmail = findId.getMemberEmail();

        Map<String, String> resultMemberSimpleInfo = memberService.findSleepId(memberName, memberEmail);

        if (StringUtils.isEmpty(resultMemberSimpleInfo)) {
            throw new VivasamException("2001", "입력하신 정보와 일치하는 아이디가 없습니다. 다시 확인해 주세요");
        }

        return ResponseEntity.ok(resultMemberSimpleInfo);
    }

    @PostMapping("/findPwd")
    public ResponseEntity<?> findPwd(HttpServletRequest request, @RequestBody FindPwd findPwd) {
        logger.info("memberName : {}, memberId : {}, memberEmail : {}", findPwd.getMemberName(), findPwd.getMemberId(), findPwd.getMemberEmail());

        String resultId = memberService.findPw(findPwd);

        if (StringUtils.isEmpty(resultId) || !resultId.equals(findPwd.getMemberId())) {
            throw new VivasamException("2002", "입력하신 정보와 일치하는 회원이 없습니다.\n다시 확인해 주세요");
        }else {
            boolean pwdNotExis = memberService.getMemberPasswordNotExistence(findPwd.getMemberId());

            //2024 02 21 페이스북 로그인 종료 페이스북 먼저 체크 안내메세지 출력
            String facebookCheck = memberService.getMemberSnsJoinInfo(findPwd.getMemberId());

            if("FACEBOOK".equals(facebookCheck)){
                MemberResult result = new MemberResult();
                result.setCode("success");
                result.setMsg("페이스북 로그인 서비스가 종료되어, 고객센터(1544-7714)로 문의주시면 임시 비밀번호를 발송해드리겠습니다.\n" +
                        "발급받은 임시비밀번호 로그인하여 기존과 동일하게 비바샘을 이용하실 수 있습니다.");

                return ResponseEntity.ok(result);
            }

            if (pwdNotExis) {
                // 회원의 정보중 패스워드가 없는경우 SNS회원가입으로 인식함
                List<SnsMemberInfo> snsMemberList = memberService.getSnsMemberList(findPwd.getMemberId());
                if (snsMemberList != null && snsMemberList.size() >= 1) {
                    // SNS 연동된 회원 정보가 존재하는경우
                    MemberResult result = new MemberResult();
                    result.setCode("success");
                    String msg = getSnsMsg(snsMemberList);
                    result.setMsg(msg + "(으)로 가입된 회원입니다.\n로그인 페이지에서 SNS 버튼을 통해 로그인해주세요.");

                    if (globalConfig.isDev() || globalConfig.isLocal()) {
                        findPwd.setSnsYn("Y");
                    } else {
                        return ResponseEntity.ok(result);
                    }
                }
            }

            try {
                findPwd = memberService.sendCertificationNumByFindPwd(findPwd, request);
            } catch (Exception e) {
                logger.error(e.toString());
            }
        }

        return ResponseEntity.ok(findPwd);
    }

    @PostMapping("/findPwdIpin")
    public ResponseEntity<?> findPwdIpin(HttpServletRequest request, @RequestBody FindPwd findPwd) {
        logger.info("memberName : {}, memberId : {}, memberIpin : {}", findPwd.getMemberName(), findPwd.getMemberId(), findPwd.getMemberIpin());

        String resultId = null;
        Map<String, String> result = memberService.findPwdIpin(findPwd);
        if (result.size() > 0) {
            resultId = result.get("memberId");
            findPwd.setMemberEmail(result.get("memberEmail"));
        }

        if (StringUtils.isEmpty(resultId) || !resultId.equals(findPwd.getMemberId())) {
            throw new VivasamException("2002", "입력하신 정보와 일치하는 회원이 없습니다.\n다시 확인해 주세요");
        }else {
            String tempPwd = RandomStringUtils.randomAlphanumeric(8);
            findPwd.setTempPwd(tempPwd);

            int affectedRow = memberService.resetMemberPwd(findPwd,request);

            if (affectedRow < 1) {
                if(StringUtils.hasText(findPwd.getMemberEmail())) {
                    throw new VivasamException("7001", "이메일 전송 실패");
                }else if(StringUtils.hasText(findPwd.getCellPhone())) {
                    throw new VivasamException("7001", "메세지 전송 실패");
                }else {
                    throw new VivasamException("7001", "전송 실패");
                }
            } else {
                UserPrincipal userPrincipal = securityMapper.findByUserId(resultId);
                if("Y".equals(userPrincipal.getSsoMemberYN()) && userPrincipal != null) {
                    ApiInputData apiParam = new ApiInputData();
                    apiParam.setMemberId(resultId);
                    apiParam.setMemberPassword(tempPwd);

                    try {
                        ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                                .updateUserPassword(apiParam);
                        if (output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200) {

                        } else {
                            throw new VivasamException("7012", "통합 비밀번호 변경 실패");
                        }
                    } catch(Exception e) {
                        throw new VivasamException("7012", "통합 비밀번호 변경 실패");
                    }

                }
            }
        }

        return ResponseEntity.ok(findPwd);
    }

    @GetMapping("/getMarketingAgreeList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> getMarketingAgreeList(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(memberService.marketingAgreeInfoList(currentUser.getMemberId()));
    }

    @GetMapping("/marketingAgreeUpdate")
    @Secured("ROLE_USER")
    public ResponseEntity<?> marketingAgreeUpdate(@CurrentUser UserPrincipal currentUser, String marketingAgreeYn) {
        int cnt = memberService.marketingAgreeUpdate(currentUser.getMemberId(), marketingAgreeYn);
        String result = "";
        if(cnt > 0) {
            result = "SUCCESS";
        }else {
            result = "ERROR";
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/marketingAgreeUpdateThree")
    public ResponseEntity<?> marketingAgreeUpdateThree(HttpServletRequest request,
                                                       @CurrentUser UserPrincipal currentUser,
                                                       @RequestBody Map<String,Map<String, Object>> requestParamMap) {

        Map<String, Object> requestParams = requestParamMap.get("0");
        String marketingEmailYn = VivasamUtil.isNull(String.valueOf(requestParams.get("marketingEmailYn")));
        String marketingSmsYn = VivasamUtil.isNull(String.valueOf(requestParams.get("marketingSmsYn")));
        String marketingTelYn = VivasamUtil.isNull(String.valueOf(requestParams.get("marketingTelYn")));
        int cnt = memberService.marketingAgreeUpdateThree(currentUser.getMemberId(), marketingEmailYn, marketingSmsYn, marketingTelYn);
        String result = "";
        if(cnt > 0) {
            result = "SUCCESS";
        }else {
            result = "ERROR";
        }
        return ResponseEntity.ok(result);
    }

    //비밀번호 변경 이후 선택 시
    @RequestMapping(value = "/ajaxPassNextUpdate")
    @Secured("ROLE_USER")
    public ResponseEntity<?> ajaxPassNextUpdate(@CurrentUser UserPrincipal currentUser) {
        String result = "";
        try {
            memberService.insertPassModifyLog(currentUser.getMemberId());
            result = "SUCCESS";
        } catch (Exception e) {
            result = "ERROR";
        }
        return ResponseEntity.ok(result);
    }


    /** 2019.07 */


    /**
     * [SSO] 가입여부 확인
     */
    @PostMapping("/checkJoinedMember")
    public ResponseEntity<?> checkJoinedMember(@RequestBody Map<String, String> requestParams) {

        String name = requestParams.get("name");
        String email = requestParams.get("email");
        String cellphone = requestParams.get("cellphone");

        logger.info("{} / {} / {}", name, email, cellphone);

        MemberInfo result = memberService.checkJoinedMember(name, email, cellphone);
        return ResponseEntity.ok(result);
    }

    /**
     * [SSO] 아이디 중복 확인
     */
    @PostMapping("/checkAvailableSsoId")
    public ResponseEntity<?> checkAvailableSsoId(String ssoId) {
        boolean available = memberService.checkAvailableSsoId(ssoId);
        return ResponseEntity.ok(available);
    }

    /**
     * [SSO] 이메일 중복 확인
     */
    @PostMapping("/checkExistEmail")
    public ResponseEntity<?> checkExistEmail(String userId, String email) {
        int result = 0;
        if(!StringUtils.isEmpty(userId)) {
            result = memberService.checkExistPersonEmail(userId, email);
        } else {
            result = memberService.checkExistPerson(null, email);
        }
        boolean available = result == 0 ? true : false;
        return ResponseEntity.ok(available);
    }



    /** ******************************************
     *          [SSO] 본인 인증 스킵 - 테스트용
     ******************************************* */
    @PostMapping(value = "/skipIdentified")
    public ResponseEntity<?> skipIdentificationForTest( @RequestBody Map<String, Map<String, Object>> requestParamMap ) throws Exception {

        Map<String, Object> requestParams = requestParamMap.get("0");

        String memberId = (String) requestParams.get("skipMemberId");

        String skipci = null;
        if(requestParams.containsKey("skipci")) {
            skipci = (String) requestParams.get("skipci");
        }

        String ssoMember = String.valueOf(requestParams.get("skipIsSsoMember"));


        String sName = memberId;
        String uuid = UUID.randomUUID().toString(); //본인인증 스킵을 위해 uuid를 ci로 사용
        String sCoInfo1 = uuid;
        if(!StringUtils.isEmpty(skipci)) sCoInfo1 = skipci; //직접 입력한 ci값이 있는 경우

        String sGenderCode = String.valueOf(Math.round(Math.random()));
        String sex = "0".equals(sGenderCode) ? "F" : "M"; //0-여성, 1-남성

        String sBirthDate = "19900909";

        Map<String, Object> map = new HashMap<>();

        String rs = "";
        String existId = "";
        Map<String, String> rsm = null;
        String existIdActive = "N";

        if (!StringUtils.isEmpty(memberId)) {
            //로그인한 사용자가 본인 인증
            rsm = memberService.checkExistCiThenUpdateUserInfo(memberId, sName, sCoInfo1, sex, sBirthDate, null);
            rs = rsm.get("result");

            if (!"0".equals(rs) && !"1".equals(rs)) {
                existId = rsm.get("memberId");
                existIdActive = rsm.get("isActiveYN");
                rs = "-1";
            } else {

            }
            map.put("memberId", memberId);
        } else {
            // 신규 가입시 본인 인증
            rsm = memberService.checkExistCiThenGetUserId(sCoInfo1);
            rs = rsm.get("result");

            if (!"0".equals(rs)) {
                existId = rsm.get("memberId");
                existIdActive = rsm.get("isActiveYN");
                rs = "1";
            } else {
                if("true".equals(ssoMember)) {
                    logger.debug(">>>>>>>>>>>>>>>>>> is sso member");

                    Map<String, Object> tschoolUsers = memberService.findTschoolIdByIpinCiThenCheckAvailable(sCoInfo1);
                    map.put("tschool", tschoolUsers);
                } else {
                    //TODO 비바샘만 가입시 기가입 아이디 없으면
                }
            }
            sName = "테스트";

        }

        map.put("sName", sName);
        map.put("sCoInfo1", sCoInfo1);
        map.put("sGenderCode", sGenderCode);
        map.put("sex", sex);
        map.put("sBirthDate", sBirthDate);
        map.put("result", Integer.parseInt(rs));
        map.put("existId", existId);
        map.put("existIdActive", existIdActive);
        map.put("preStepData", requestParams);

        map.put("uuid", uuid);
        redisTemplate.opsForValue().set(uuid, map);
        //redisTemplate.opsForValue().put(new Element(uuid, map));

        return ResponseEntity.ok(map);
    }



    /**
     * [SSO] NICE / IPIN 본인 인증
     */
    @PostMapping(value="/getNiceEncData")
    public ResponseEntity<?> getNiceEncData(HttpServletRequest request, @RequestBody Map<String,Map<String, Object>> requestParamMap) {

        //cache setting required
        String uuid = UUID.randomUUID().toString();

        Map<String,Object> requestParams = requestParamMap.get("0");

        HashMap<String, String> encData = null;
        if(requestParams.get("TYPE") != null) {
            String identificationType = (String) requestParams.get("TYPE");
            if("NICE".equals(identificationType)) {
                encData = new NiceUtil(environment).getEncData(uuid);
            }
            else if ("NICE_SNS".equals(identificationType)) {
                encData = new NiceUtil(environment).getEncData(uuid);
            }
            else if ("NICE_SSO".equals(identificationType)) {
                encData = new NiceUtil(environment).getEncData(uuid);
            }
            else if("IPIN".equals(identificationType)) {
                encData = new IpinUtil(environment).getEncData(uuid, identificationType);
//                request.getSession().setAttribute("CPREQUEST", encData.get("CPREQUEST"));
            }
            else if("IPIN_SNS".equals(identificationType)) {
                encData = new IpinUtil(environment).getEncData(uuid, identificationType);
//                request.getSession().setAttribute("CPREQUEST", encData.get("CPREQUEST"));
            }
            else if ("IPIN_SSO".equals(identificationType)) {
                encData = new IpinUtil(environment).getEncData(uuid, identificationType);
//                request.getSession().setAttribute("CPREQUEST", encData.get("CPREQUEST"));
            }
            else if("IPIN_FIND_PW".equals(identificationType)) {
                encData = new IpinUtil(environment).getEncData(uuid, identificationType);
            } else {
                return ResponseEntity.badRequest().build();
            }

            redisTemplate.opsForValue().set(uuid, requestParams);
            return ResponseEntity.ok(encData);
        }

        return ResponseEntity.badRequest().build();
    }


    /**
     * [SSO] TODO IPIN 인증 성공시 인증정보로 회원정보 수정
     */
    @RequestMapping(value="/getIpinVerificationData/{uuid}/{target}", method = {RequestMethod.POST, RequestMethod.GET})
    public void getIpinVerificationData(HttpServletRequest request, HttpServletResponse response, @PathVariable String uuid, @PathVariable String target) throws Exception {

        String redirectURL = environment.getProperty("vivasam.front.domain") + "/#/verification/result?uuid=" + uuid;
        String encodeData = request.getParameter("enc_data");

        Map<String, String> map = new IpinUtil(environment).setDecodeData(encodeData);
        Map<String, Object> resultMap = new HashMap<>();

        String rs = "";
        String existId = "";
        String existVivaEmail = "";
        Map<String, String> rsm = null;
        String existIdActive = "N";

        if(redisTemplate.opsForValue().get(uuid) != null) {
            Map<String, Object> cacheMap = (Map<String, Object>) redisTemplate.opsForValue().get(uuid);
//            request.getSession().getAttribute("CPREQUEST");
//            map.get("sCPRequestNum");

            if ("1".equals(map.get("iRtn"))) {
                 String sex = "0".equals(map.get("sGenderCode")) ? "F" : "M"; //0-여성, 1-남성

                if (!StringUtils.isEmpty(cacheMap.get("memberId"))) { // 로그인 사용자의 본인인증
                    String memberId = String.valueOf(cacheMap.get("memberId"));
                    resultMap.put("memberId", memberId);

                    rsm = memberService.checkExistCiThenUpdateUserInfo(memberId, map.get("sName"), map.get("sCoInfo1"), sex, map.get("sBirthDate"), null);
                    rs = rsm.get("result");

                    if (!"0".equals(rs) && !"1".equals(rs)) { //기존 본인인증한 아이디가 존재
                        existId = rsm.get("memberId");
                        existIdActive = rsm.get("isActiveYN");
                        rs = "-1";
                    } else {

                    }
                } else {
                    // 신규 가입시 본인 인증
                    Map<String, Object> modelMap = memberService.checkJoinMemberInfo(map.get("sCoInfo1"));
                    rs = (String) modelMap.get("result");

                    if("0".equals(rs)) {
                        Map<String, Object> tschoolUsers = new HashMap<>();
                        tschoolUsers.put("tschoolUser", new ArrayList<>());
                        tschoolUsers.put("isActiveT", String.valueOf(true));

                        resultMap.put("tschool", tschoolUsers);
                        resultMap.put("checkCase", "0");
                    } else if("3".equals(rs) || "4".equals(rs)) {
                        resultMap.put("sMessage", modelMap.get("sMessage"));
                    } else {
                        existId = ObjectUtils.isEmpty(modelMap.get("existId")) ? "" : modelMap.get("existId").toString();
                        existVivaEmail = ObjectUtils.isEmpty(modelMap.get("existVivaEmail")) ? "" : modelMap.get("existVivaEmail").toString();
                        existIdActive = (String) modelMap.get("existIdActive");
                        rs = "1";

                        boolean isAvailable = (Boolean) modelMap.get("existIdInTschool") ? false : true;
                        resultMap.put("existIdUsable", isAvailable);

                        if("IPIN".equals(target) || "IPIN_SNS".equals(target)) {
                            String checkCase = "";

                            if(modelMap.containsKey("isSsoMember") && "1".equals(modelMap.get("isSsoMember"))) {
                                checkCase = "8"; // 이미 통합 회원
                            } else {
                                List<Map<String, String>> tUserList = new ArrayList<>();	// 티스쿨 유저 리스트
                                Map<String, Object> tschoolUsers = (Map<String, Object>) modelMap.get("tschoolUsers");
                                if(tschoolUsers != null) {
                                    tUserList = (List<Map<String, String>>) tschoolUsers.get("tschoolUser");
                                }
                                resultMap.put("tschool", tUserList);

                                if(!"".equals(existId)) {	// 비바샘 회원일때,


                                    if(ObjectUtils.isNotEmpty(tUserList) && tUserList.size() > 0) {
                                        checkCase = "6";
                                        for(Map<String, String> tUser : tUserList) {
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
                                } else {
                                    if(tUserList.size() > 0) {
                                        checkCase = "4";
                                        for (Map<String, String> tUser : tUserList) {
                                            if ("true".equals(tUser.get("isusable"))) {
                                                checkCase = "3";
                                            }
                                        }
                                    } else {
                                        checkCase = "0";
                                    }
                                }
                            }

                            resultMap.put("checkCase", checkCase);
                        }

                    }
                    switch (target) {
                        case "IPIN":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/join/verifyResult?uuid=" + uuid;
                            break;
                        case "IPIN_SNS":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/sns/join/verifyResult?uuid=" + uuid;
                            break;
                        case "IPIN_SSO":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/conversion/verifyResult?uuid=" + uuid;
                            break;
                        default:
                    }
                }

                resultMap.put("sName", map.get("sName"));
                resultMap.put("sCoInfo1", map.get("sCoInfo1"));
                resultMap.put("sGenderCode", map.get("sGenderCode"));
                resultMap.put("sex", sex);
                resultMap.put("sBirthDate", map.get("sBirthDate"));
                resultMap.put("result", Integer.parseInt(rs));
                resultMap.put("existId", existId);
                resultMap.put("existVivaEmail", existVivaEmail);
                resultMap.put("existIdActive", existIdActive);

                // 본인인증 로그 추가
                Map<String, String> param = new HashMap<String, String>();

                param.put("progress_type", target);
                param.put("req_member_id", cacheMap.get("memberId") != null ? cacheMap.get("memberId").toString() : "");
                param.put("cert_member_id", existId);
                param.put("cert_name", map.get("sName"));
                param.put("cert_birth", map.get("sBirthDate"));

                memberService.iIdentificationResultLog(param);
            } else {
                //TODO 본인인증 실패시 - 인증화면으로 가면 되나?
                resultMap.put("sMessage", map.get("sRtnMsg"));
                if (cacheMap.get("memberId") != null) {
                    redirectURL = environment.getProperty("vivasam.front.domain") + "/#/verification/main";
                } else {
                    switch (target) {
                        case "IPIN":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/join/agree?uuid=" + uuid;
                            break;
                        case "IPIN_SNS":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/sns/join/agree?uuid=" + uuid;
                            break;
                        case "IPIN_SSO":
                            redirectURL = environment.getProperty("vivasam.front.domain") + "/#/conversion/agree?uuid=" + uuid;
                            break;
                        default:
                    }
                }
            }

            resultMap.put("preStepData", cacheMap); //본인인증 이전 단계 데이터
        }
        redisTemplate.opsForValue().set(uuid, resultMap);
        //redisTemplate.opsForValue().put(new Element(uuid, resultMap));

        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println("<script>location.href='" + redirectURL + "';</script>");
        out.flush();
    }

    /**
     * [SSO] 휴대폰 인증 성공시 인증정보로 회원 정보 수정
     */
    @RequestMapping(value="/getNiceVerificationData/{uuid}", method = {RequestMethod.POST, RequestMethod.GET})
    public void getNiceVerificationData(HttpServletRequest request, HttpServletResponse response, @PathVariable String uuid) throws Exception {

        String redirectURL = environment.getProperty("vivasam.front.domain") + "/#/verification/result?uuid=" + uuid;

        String encodeData = request.getParameter("EncodeData");

        Map<String, String> map = new NiceUtil(environment).setDecodeData(encodeData);
        //String ci = map.get("sConnInfo").toString();

        Map<String, Object> resultMap = new HashMap<>();


        String rs = "";
        String existId = "";
        String existVivaEmail = "";
        Map<String, String> rsm = null;
        String existIdActive = "N";

        if(redisTemplate.opsForValue().get(uuid) != null) {
            Map<String, Object> cacheMap = (Map<String, Object>) redisTemplate.opsForValue().get(uuid);
//            map.put("memberId", cacheMap.get("memberId").toString());
            //map.put("memberId", redisTemplate.opsForValue().get(uuid).getObjectValue().toString());
//            result = memberService.updateUserCi(map);

            if("0".equals(map.get("iReturn"))) {
                String sex = "0".equals(map.get("sGender")) ? "F" : "M"; //0-여성, 1-남성

                if (!StringUtils.isEmpty(cacheMap.get("memberId"))) { // 로그인 사용자의 본인인증
                    String memberId = String.valueOf(cacheMap.get("memberId"));
                    resultMap.put("memberId", memberId);

                    //TODO 동일 인증 내역을 가진 아이디가 존재하는지 확인 후 미존재시 본인인증내역 저장.
                    rsm = memberService.checkExistCiThenUpdateUserInfo(memberId, map.get("sName"), map.get("sConnInfo"), sex, map.get("sBirthDate"), map.get("sMobileNo"));
                    rs = rsm.get("result");

                    if (!"0".equals(rs) && !"1".equals(rs)) { //기존 본인인증한 아이디가 존재
                        existId = rsm.get("memberId");
                        existIdActive = rsm.get("isActiveYN");
                        rs = "-1";
                    } else {
                        existId = memberId;
                        existIdActive = "Y";
                    }

                } else { //신규가입시 본인인증
                    Map<String, Object> modelMap = memberService.checkJoinMemberInfo(map.get("sConnInfo"));
                    rs = (String) modelMap.get("result");

                    if("0".equals(rs)) {
                        Map<String, Object> tschoolUsers = new HashMap<>();
                        tschoolUsers.put("tschoolUser", new ArrayList<>());
                        tschoolUsers.put("isActiveT", String.valueOf(true));

                        resultMap.put("tschool", tschoolUsers);
                        resultMap.put("checkCase", "0");
                    } else if("3".equals(rs) || "4".equals(rs)) {
                        resultMap.put("sMessage", modelMap.get("sMessage"));
                    } else {
                        existId = ObjectUtils.isEmpty(modelMap.get("existId")) ? "" : modelMap.get("existId").toString();
                        existVivaEmail = ObjectUtils.isEmpty(modelMap.get("existVivaEmail")) ? "" : modelMap.get("existVivaEmail").toString();
                        existIdActive = (String) modelMap.get("existIdActive");
                        rs = "1";

                        boolean isAvailable = (Boolean) modelMap.get("existIdInTschool") ? false : true;
                        resultMap.put("existIdUsable", isAvailable);

                        if("NICE".equals(cacheMap.get("TYPE")) || "NICE_SNS".equals(cacheMap.get("TYPE"))) {
                            String checkCase = "";

                            if (modelMap.containsKey("isSsoMember") && "1".equals(modelMap.get("isSsoMember"))) {
                                checkCase = "8"; // 이미 통합 회원
                            } else {
                                List<Map<String, String>> tUserList = new ArrayList<>();    // 티스쿨 유저 리스트
                                Map<String, Object> tschoolUsers = (Map<String, Object>) modelMap.get("tschoolUsers");
                                if (tschoolUsers != null) {
                                    tUserList = (List<Map<String, String>>) tschoolUsers.get("tschoolUser");
                                }
                                resultMap.put("tschool", tUserList);

                                if (!"".equals(existId)) {    // 비바샘 회원일때,


                                    if (ObjectUtils.isNotEmpty(tUserList) && tUserList.size() > 0) {
                                        checkCase = "6";
                                        for (Map<String, String> tUser : tUserList) {
                                            if ("true".equals(tUser.get("isusable")) && existId.equals(tUser.get("tid"))) {
                                                checkCase = "7";
                                                break;
                                            } else {
                                                if ("true".equals(tUser.get("isusable"))) {
                                                    checkCase = "5";
                                                }
                                            }
                                        }
                                    } else {
                                        checkCase = isAvailable ? "1" : "2";
                                    }
                                } else {
                                    if (tUserList.size() > 0) {
                                        checkCase = "4";
                                        for (Map<String, String> tUser : tUserList) {
                                            if ("true".equals(tUser.get("isusable"))) {
                                                checkCase = "3";
                                            }
                                        }
                                    } else {
                                        checkCase = "0";
                                    }
                                }
                            }

                            resultMap.put("checkCase", checkCase);
                        }

                    }

                    if ("NICE".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/join/verifyResult?uuid=" + uuid;
                    }else if ("NICE_SNS".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/sns/join/verifyResult?uuid=" + uuid;
                    }else if ("NICE_SSO".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/conversion/verifyResult?uuid=" + uuid;
                    }

                }

                String sMobileNo = map.get("sMobileNo");
                String regEx = "(\\d{3})(\\d{3,4})(\\d{4})";
                if(Pattern.matches(regEx, sMobileNo)) {
                    String regCellphone = sMobileNo.replaceAll(regEx, "$1-$2-$3");
                    resultMap.put("sMobileNo", regCellphone);
                } else {
                    resultMap.put("sMobileNo", sMobileNo);
                }

                resultMap.put("sName", map.get("sName"));
                resultMap.put("sCoInfo1", map.get("sConnInfo"));
                resultMap.put("sGenderCode", map.get("sGender"));
                resultMap.put("sex", sex);
                resultMap.put("sBirthDate", map.get("sBirthDate"));
//                resultMap.put("sMobileNo", map.get("sMobileNo"));
                resultMap.put("result", Integer.parseInt(rs));
                resultMap.put("existId", existId);
                resultMap.put("existVivaEmail", existVivaEmail);
                resultMap.put("existIdActive", existIdActive);

                // 본인인증 로그 추가
                Map<String, String> param = new HashMap<String, String>();

                param.put("progress_type", "NICE");
                param.put("req_member_id", cacheMap.get("memberId") != null ? cacheMap.get("memberId").toString() : "");
                param.put("cert_member_id", existId);
                param.put("cert_name", map.get("sName"));
                param.put("cert_birth", map.get("sBirthDate"));

                memberService.iIdentificationResultLog(param);

            } else {
                //TODO 본인인증 실패시
                resultMap.put("sMessage", map.get("sMessage"));
                if(cacheMap.get("memberId") != null) {
                    redirectURL = environment.getProperty("vivasam.front.domain") + "/#/verification/main";
                } else {
                    if ("NICE".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/join/agree?uuid=" + uuid;
                    }else if ("NICE_SNS".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/sns/join/agree?uuid=" + uuid;
                    }else if ("NICE_SSO".equals(cacheMap.get("TYPE"))) {
                        redirectURL = environment.getProperty("vivasam.front.domain") + "/#/conversion/agree?uuid=" + uuid;
                    }
                }
            }

            resultMap.put("preStepData", cacheMap); //본인인증 이전 단계 데이터
            //if(result > 0) redisTemplate.opsForValue().remove(uuid);
        }

        redisTemplate.opsForValue().set(uuid, resultMap);

        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();

        out.println("<script>location.href='" + redirectURL + "';</script>");

        out.flush();
    }


    /**
     *  [SSO] Cache에 저장한 인증 정보 가져오기
     */
    @RequestMapping(value="/getIdentificationData/{uuid}", method = RequestMethod.POST)
    public ResponseEntity getIdentificationData(HttpServletRequest request, HttpServletResponse response, @PathVariable String uuid) throws Exception {
        logger.info(uuid);
        Map<String, Object> cacheMap = new HashMap<>();
        if(redisTemplate.opsForValue().get(uuid) != null) {
            logger.info(redisTemplate.opsForValue().get(uuid).toString());
            logger.info(redisTemplate.opsForValue().get(uuid).toString());
            cacheMap = (Map<String, Object>) redisTemplate.opsForValue().get(uuid);
        }
        return ResponseEntity.ok(cacheMap);
    }


    /**
     *  [SSO] 통합 회원 전환 아이디 확인
     */
    @PostMapping(value = "/checkConversionId")
    @Secured("ROLE_USER")
    public ResponseEntity checkSelectableConversionId(@CurrentUser UserPrincipal currentUser,
              HttpServletRequest request, @RequestBody Map<String, Map<String, Object>> requestParamMap) {
        Map<String, Object> requestParams = requestParamMap.get("0");
        Map<String, Object> resultMap = new HashMap<>();

        if("Y".equals(currentUser.getSsoMemberYN())) {
            return ResponseEntity.ok("INVALID");
        }

        //본인이 사용중인 아이디 확인 및 통합회원으로 사용 가능 여부를 확인한다.
        String ci = memberService.getIpinCi(currentUser.getMemberId());
        Map<String, Object> modelMap = new HashMap<>();
        if(ci == null || "".equals(ci) || ci.contains("IPIN_CI")) {
            String uuid = VivasamUtil.isNull(String.valueOf(requestParams.get("uuid")));
            Map<String, Object> cacheMap = new HashMap<>();
            cacheMap = (Map<String, Object>) redisTemplate.opsForValue().get(uuid);

            String redisCi = (String)cacheMap.get("sCoInfo1");
            modelMap = memberService.checkJoinMemberInfo(redisCi);
        } else {
            modelMap = memberService.checkJoinMemberInfo(ci);
        }

        String rs = (String) modelMap.get("result");

        if("0".equals(rs)) {
            Map<String, Object> tschoolUsers = new HashMap<>();
            tschoolUsers.put("tschoolUser", new ArrayList<>());
            tschoolUsers.put("isActiveT", String.valueOf(true));

            resultMap.put("tschool", tschoolUsers);
            resultMap.put("checkCase", "1");
        } else if("3".equals(rs) || "4".equals(rs)) {
            resultMap.put("sMessage", modelMap.get("sMessage"));
        } else {
            String existId = ObjectUtils.isEmpty(modelMap.get("existId")) ? "" : modelMap.get("existId").toString();
            String existVivaEmail = ObjectUtils.isEmpty(modelMap.get("existVivaEmail")) ? "" : modelMap.get("existVivaEmail").toString();
            String existIdActive = (String) modelMap.get("existIdActive");
            rs = "1";

            boolean isAvailable = (Boolean) modelMap.get("existIdInTschool") ? false : true;
            resultMap.put("existIdUsable", isAvailable);

            String checkCase = "";

            if(modelMap.containsKey("isSsoMember") && "1".equals(modelMap.get("isSsoMember"))) {
                checkCase = "8"; // 이미 통합 회원
            } else {
                List<Map<String, String>> tUserList = new ArrayList<>();	// 티스쿨 유저 리스트
                Map<String, Object> tschoolUsers = (Map<String, Object>) modelMap.get("tschoolUsers");
                if(tschoolUsers != null) {
                    tUserList = (List<Map<String, String>>) tschoolUsers.get("tschoolUser");
                }
                resultMap.put("tschool", tUserList);

                if(!"".equals(existId)) {	// 비바샘 회원일때,


                    if(ObjectUtils.isNotEmpty(tUserList) && tUserList.size() > 0) {
                        checkCase = "6";
                        for(Map<String, String> tUser : tUserList) {
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
                } else {
                    if(tUserList.size() > 0) {
                        checkCase = "4";
                        for (Map<String, String> tUser : tUserList) {
                            if ("true".equals(tUser.get("isusable"))) {
                                checkCase = "3";
                            }
                        }
                    } else {
                        checkCase = "0";
                    }
                }
            }

            resultMap.put("checkCase", checkCase);
            resultMap.put("result", Integer.parseInt(rs));
            resultMap.put("existId", existId);
            resultMap.put("existVivaEmail", existVivaEmail);
            resultMap.put("existIdActive", existIdActive);

        }

        return ResponseEntity.ok(resultMap);
    }


    /**
     * [SSO] 통합 회원 가입
     */
    @PostMapping("/insertSsoJoin")
    public ResponseEntity<?> insertSsoJoin(HttpServletRequest request, @RequestBody Map<String,Map<String, Object>> requestParamMap) throws Exception {
        Map<String,Object> requestParams= requestParamMap.get("0");

        //필수 항목
        String id = VivasamUtil.isNull(String.valueOf(requestParams.get("userId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String password = VivasamUtil.isNull(String.valueOf(requestParams.get("password")));
        String Email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("telephone")));
        String myGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("myGrade")));
        String SchoolName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        String SchoolCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        String loc_dept1 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaCode")));
        String loc_dept2 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchCode")));
        String mainSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("mainSubject")));
        String secondSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("secondSubject")));
        String mTypeCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mTypeCd")));
        String checkCase = VivasamUtil.isNull(String.valueOf(requestParams.get("checkCase")));

        String memberValidateType = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateType")));
        String memberValidateEmail = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateEmail")));

        String birthDay = VivasamUtil.isNull(String.valueOf(requestParams.get("birthDay")));
        String birth = birthDay.replaceAll("-","");

        String lunar = VivasamUtil.isNull(String.valueOf(requestParams.get("lunar")));
        String IPIN_CI = VivasamUtil.isNull(String.valueOf(requestParams.get("isIpin")));
        String EPKI_CERTDN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTDN")));
        String EPKI_CERTSN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTSN")));
        String VALID_YN = VivasamUtil.isNull(String.valueOf(requestParams.get("VALID_YN")));
        String authentication = VivasamUtil.isNull(String.valueOf(requestParams.get("authentication")));

        String sex = VivasamUtil.isNull(String.valueOf(requestParams.get("gender")));

        String zip = VivasamUtil.isNull(String.valueOf(requestParams.get("zipNo")));
        String addr1 = VivasamUtil.isNull(String.valueOf(requestParams.get("address")));
        String addr2 = VivasamUtil.isNull(String.valueOf(requestParams.get("addressDetail")));

        //비상교과서 채택여부
        String visangTbYN = VivasamUtil.isNull(String.valueOf(requestParams.get("visangTbYN")));

        //개인정보 유효기간설정
        String expiryTermNum = VivasamUtil.isNull(String.valueOf(requestParams.get("expiryTermNum")));

        String vMagazineYN = "N";

        String Agree1 = String.valueOf(requestParams.get("service"));
        String Agree2 = String.valueOf(requestParams.get("privacy"));
        String Agree3 = String.valueOf(requestParams.get("all"));
        String Agree4 = String.valueOf(requestParams.get("marketing"));

        //통합회원 추가
        String Agree5 = String.valueOf(requestParams.get("thirdPrivacy"));
        String Agree6 = String.valueOf(requestParams.get("thirdMarketing"));
        String existTid = VivasamUtil.isNull(String.valueOf(requestParams.get("tschUserId")));
        String existVid = VivasamUtil.isNull(String.valueOf(requestParams.get("vUserId")));

        // 추천인 코드 및 가입 경로
        String via = String.valueOf(requestParams.get("via"));
        String reco = String.valueOf(requestParams.get("reco"));
        // 회원 가입 _ 추천인 아이디
        String recommendId = VivasamUtil.isNull(String.valueOf(requestParams.get("recommendId")));

        logger.info("==============================================================x");
        logger.info("id   : " + id);
        logger.info("name   : " + name);
        logger.info("password   : " + password);
        logger.info("Email   : " + Email);
        logger.info("cellphone   : " + cellphone);
        logger.info("myGrade   : " + myGrade);
        logger.info("SchoolName   : " + SchoolName);
        logger.info("SchoolCode   : " + SchoolCode);
        logger.info("loc_dept1   : " + loc_dept1);
        logger.info("loc_dept2   : " + loc_dept2);
        logger.info("mainSubject   : " + mainSubject);
        logger.info("secondSubject   : " + secondSubject);
        logger.info("birth   : " + birth);
        logger.info("lunar   : " + lunar);
        logger.info("IPIN_CI   : " + IPIN_CI);
        logger.info("EPKI_CERTDN   : " + EPKI_CERTDN);
        logger.info("EPKI_CERTSN   : " + EPKI_CERTSN);
        logger.info("VALID_YN   : " + VALID_YN);
        logger.info("authentication   : " + authentication);
        logger.info("mTypeCd   : " + mTypeCd);
        logger.info("checkCase   : " + checkCase);
        logger.info("memberValidateType   : " + memberValidateType);
        logger.info("memberValidateEmail   : " + memberValidateEmail);

        logger.info("sex   : " + sex);

        logger.info("zip   : " + zip);
        logger.info("addr1   : " + addr1);
        logger.info("addr2   : " + addr2);

        logger.info("visangTbYN   : " + visangTbYN);
        logger.info("expiryTermNum   : " + expiryTermNum);

        logger.info("agree5   : " + Agree5);
        logger.info("agree6   : " + Agree6);
        logger.info("existTid   : " + existTid);
        logger.info("existVid   : " + existVid);

        logger.info("via   : " + via);
        logger.info("reco   : " + reco);
        logger.info("==============================================================x");

        id = checkXSSService.ReplaceValue(request, "id", id);
        name = checkXSSService.ReplaceValue(request, "name", name);
        Email = checkXSSService.ReplaceValue(request, "Email", Email);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        myGrade = checkXSSService.ReplaceValue(request, "myGrade", myGrade);
        SchoolName = checkXSSService.ReplaceValue(request, "SchoolName", SchoolName);
        SchoolCode = checkXSSService.ReplaceValue(request, "SchoolCode", SchoolCode);
        loc_dept1 = checkXSSService.ReplaceValue(request, "loc_dept1", loc_dept1);
        loc_dept2 = checkXSSService.ReplaceValue(request, "loc_dept2", loc_dept2);
        mainSubject = checkXSSService.ReplaceValue(request, "mainSubject", mainSubject);
        secondSubject = checkXSSService.ReplaceValue(request, "secondSubject", secondSubject);
        birth = checkXSSService.ReplaceValue(request, "birth", birth);
        lunar = checkXSSService.ReplaceValue(request, "lunar", lunar);
        IPIN_CI = checkXSSService.ReplaceValue(request, "IPIN_CI", IPIN_CI);
        EPKI_CERTDN = checkXSSService.ReplaceValue(request, "EPKI_CERTDN", EPKI_CERTDN);
        EPKI_CERTSN = checkXSSService.ReplaceValue(request, "EPKI_CERTSN", EPKI_CERTSN);
        VALID_YN = checkXSSService.ReplaceValue(request, "VALID_YN", VALID_YN);
        authentication = checkXSSService.ReplaceValue(request, "authentication", authentication);
        sex = checkXSSService.ReplaceValue(request, "sex", sex);
        zip = checkXSSService.ReplaceValue(request, "zip", zip);
        addr1 = checkXSSService.ReplaceValue(request, "addr1", addr1);
        addr2 = checkXSSService.ReplaceValue(request, "addr2", addr2);
        visangTbYN = checkXSSService.ReplaceValue(request, "visangTbYN", visangTbYN);
        expiryTermNum = checkXSSService.ReplaceValue(request, "expiryTermNum", expiryTermNum);
        Agree3 = checkXSSService.ReplaceValue(request, "Agree3", Agree3);
        Agree4 = checkXSSService.ReplaceValue(request, "Agree4", Agree4);

        //통합회원 추가
        Agree5 = checkXSSService.ReplaceValue(request, "Agree5", Agree5);
        Agree6 = checkXSSService.ReplaceValue(request, "Agree6", Agree6);
        existTid = checkXSSService.ReplaceValue(request, "existTid", existTid);
        existVid = checkXSSService.ReplaceValue(request, "existVid", existVid);
        mTypeCd = checkXSSService.ReplaceValue(request, "mTypeCd", mTypeCd);
        checkCase = checkXSSService.ReplaceValue(request, "checkCase", checkCase);
        memberValidateType = checkXSSService.ReplaceValue(request, "memberValidateType", memberValidateType);
        memberValidateEmail = checkXSSService.ReplaceValue(request, "memberValidateEmail", memberValidateEmail);

        recommendId = checkXSSService.ReplaceValue(request, "recommendId", recommendId);

        String p = "(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})";
        String preCellphone = String.valueOf(cellphone);
        String parseCellphone = preCellphone.replaceAll(p, "$1-$2-$3");

        Map<String, String> param = new HashMap<>();

        param.put("id", String.valueOf(id));
        param.put("memberId", String.valueOf(id));
        param.put("name", String.valueOf(name));
        param.put("password", String.valueOf(password));
        param.put("Email", String.valueOf(Email));
        param.put("cellphone", String.valueOf(parseCellphone));
        param.put("myGrade", String.valueOf(myGrade));
        param.put("SchoolName", String.valueOf(SchoolName));
        param.put("SchoolCode", String.valueOf(SchoolCode));
        param.put("loc_dept1", String.valueOf(loc_dept1));
        param.put("loc_dept2", String.valueOf(loc_dept2));
        param.put("mainSubject", String.valueOf(mainSubject));
        param.put("secondSubject", String.valueOf(secondSubject));
        param.put("birth", String.valueOf(birth));
        param.put("lunar", String.valueOf(lunar));
        param.put("IPIN_CI", String.valueOf(IPIN_CI));
        param.put("EPKI_CERTDN", String.valueOf(EPKI_CERTDN));
        param.put("EPKI_CERTSN", String.valueOf(EPKI_CERTSN));
        param.put("VALID_YN", String.valueOf(VALID_YN));
        if(String.valueOf(VALID_YN).equals("") || String.valueOf(VALID_YN) == null) param.put("VALID_YN", "N");
        param.put("authentication", String.valueOf(authentication));
        param.put("mTypeCd", String.valueOf(mTypeCd));
        param.put("checkCase", String.valueOf(checkCase));
        param.put("memberValidateType", String.valueOf(memberValidateType));
        param.put("memberValidateEmail", String.valueOf(memberValidateEmail));

        param.put("sex", String.valueOf(sex));

        param.put("zip", String.valueOf(zip));
        param.put("addr1", String.valueOf(addr1));
        param.put("addr2", String.valueOf(addr2));

        param.put("visangTbYN", String.valueOf(visangTbYN));
        param.put("expiryTermNum", String.valueOf(expiryTermNum));

        param.put("Agree3", String.valueOf(Agree3)); //제3자 정보제공 동의 (선택)
        param.put("Agree4", String.valueOf(Agree4)); //마케팅 및 광고 활용 동의 (선택)

        //통합회원 추가
        param.put("Agree5", String.valueOf(Agree5));
        param.put("Agree6", String.valueOf(Agree6));
        param.put("existTid", String.valueOf(existTid));
        param.put("existVid", String.valueOf(existVid));
        param.put("snsJoin", null);

        // 학교 정보 직접 등록인지 아닌지 판단
        // True : 정보 검색 / False : 직접 등록
        String isSelect =  VivasamUtil.isNull(String.valueOf(requestParams.get("isSelect")));
        logger.info("isSelect   : " + isSelect);
        param.put("isSelectedSchool", isSelect);

        // 추천인 코드 및 가입경로
        param.put("via", via);
        param.put("reco", reco);
        param.put("recommendId", recommendId);

        // 회원가입 성공시 Q&A작업
        // 학교 직접 등록인 경우 Q&A 등록하기
        if("false".equals(isSelect)) {
            logger.info("==================================================");
            logger.info("school Q&A Insert");
            logger.info("==================================================");

            // 학교 직접 등록인 경우 학교급, 학교 지역을 판단하여 설문조사로 넣기 위해 작업
            String schoolGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolGrade")));
            String fkareaName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaName")));
            String fkbranchName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchName")));
            String requestedTerm = VivasamUtil.isNull(String.valueOf(requestParams.get("requestedTerm")));
            String qnaSchLvlCd = "";


            schoolGrade =  checkXSSService.ReplaceValue(request, "schoolGrade", schoolGrade);
            fkareaName = checkXSSService.ReplaceValue(request, "fkareaName", fkareaName);
            fkbranchName =  checkXSSService.ReplaceValue(request, "fkbranchName", fkbranchName);
            requestedTerm = checkXSSService.ReplaceValue(request,"requestedTerm", requestedTerm);

            // 학교 직접 등록시 학교급, 지역 코드 받아오기
            if("E".equals(schoolGrade)){
                schoolGrade = "초등";
                qnaSchLvlCd = "ES";
            }else if("M".equals(schoolGrade)){
                schoolGrade = "중등";
                qnaSchLvlCd = "MS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("C".equals(schoolGrade)){
                schoolGrade = "대학";
                qnaSchLvlCd = "CS";
            }else if("K".equals(schoolGrade)){
                schoolGrade = "유치원";
                qnaSchLvlCd = "KS";
            }else if("O".equals(schoolGrade)){
                schoolGrade = "교육기관";
                qnaSchLvlCd = "OS";
            }

            // 해당되는 Q&A 값 넣어주기
            String qnaCd = "QA011";
            String member_id = id;
            String qnaTitle =  VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName"))) + "_학교등록신청";
            String qnaContents = "학교등록 신청\n\n- 학교급 : ";
            qnaContents += schoolGrade;
            qnaContents += "\n- 학교명  : ";
            qnaContents += SchoolName;
            qnaContents += "\n- 학교지역  : ";
            qnaContents += fkareaName + " > " + fkbranchName;
            qnaContents += "\n- 별도 요청사항  : "+ requestedTerm ;
            qnaContents += "\n";
            qnaContents += "- 학교변경 동의여부  : Y\n";

            qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", qnaTitle);
            qnaContents = checkXSSService.ReplaceValue(request,"qnaContents", qnaContents);

            logger.debug("==============================================================x");
            logger.debug("qnaCd   : " + qnaCd);
            logger.debug("qnaTitle   : " + qnaTitle);
            logger.debug("qnaContents   : " + qnaContents);
            logger.debug("==============================================================x");

            param.put("qnaCd", qnaCd);
            param.put("qnaTitle", qnaTitle);
            param.put("qnaContents", qnaContents);
            param.put("qnaSchLvlCd", qnaSchLvlCd);
            param.put("regIp", request.getRemoteAddr());

        }


        //회원등록
//        String result = memberService.insertJoin(param);

        param.put("vId", existVid);
        param.put("tId", existTid);
        param.put("ssoId", id);

        String result = "";
        try {
            result = memberService.createSsoMember(param);
        } catch(Exception ex)
        {
            ParamVo paramVo = new ParamVo();
            paramVo.setFail_log(ex.getMessage());
            paramVo.setV_AfterID(String.valueOf(id));
            paramVo.setV_BeforeID(existTid);
            paramVo.setProc_gn("ID생성실패(모바일):insertSsoJoin");
            ssoRestfulService.insertToidAsidFailLog(paramVo);
        }


        logger.info("==================================================");
        logger.info("result");
        logger.info("==================================================");
        logger.info("result   : " + result);
        logger.info("==================================================");

        if (result.equals("0")) {

            // 모바일 경로 가입 인증 업데이트, 학교 직접 등록 원래 여기-- 서비스단에서 처리하도록 수정함

            if (vMagazineYN.equals("Y")) {

                String ppp = id + "#" + SchoolName + "#" + zip + "#" + addr1 + "#" + addr2 + "#" + cellphone + "#" + SchoolCode;

                Map<String, String> params = new HashMap<String, String>();
                params.put("idx", "2");
                params.put("id", String.valueOf(id));
                params.put("cellphone", String.valueOf(parseCellphone));
                params.put("SchoolName", String.valueOf(SchoolName));
                params.put("SchoolCode", String.valueOf(SchoolCode));
                params.put("zip", String.valueOf(zip));
                params.put("addr1", String.valueOf(addr1));
                params.put("addr2", String.valueOf(addr2));
                params.put("etc", ppp);

                memberService.insertVmagazine(params);
            }

            // 통합회원 전환 마일리지를 지급
            if(!"0".equals(checkCase) && "0".equals(mTypeCd)) {
                UserPrincipal userPrincipal = securityMapper.findByUserId(id);
                // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                if ("AU300".equals(userPrincipal.getMLevel()) && "Y".equals(userPrincipal.getValidYn()) && "0".equals(userPrincipal.getMTypeCd())) {
                    Mileage mileage = new Mileage(id, MileageCode.CHG_SSO.getAmount(), MileageCode.CHG_SSO.getCode());
                    int chkExist = memberMileageService.getMileageCntByMileageCode(mileage);
                    if (chkExist == 0) {
                        memberMileageService.insertMileagePlus(mileage);
                    }
                }
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/sns/insertSsoJoin")
    public ResponseEntity<?> insertSnsSsoJoin(HttpServletRequest request,
                                              @RequestBody Map<String, Map<String, Object>> requestParamMap) throws Exception {
        Map<String, Object> requestParams = requestParamMap.get("0");

        // 필수 항목
        String id = VivasamUtil.isNull(String.valueOf(requestParams.get("userId")));
        String name = VivasamUtil.isNull(String.valueOf(requestParams.get("userName")));
        String password = VivasamUtil.isNull(String.valueOf(requestParams.get("password")));
        String Email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        String cellphone = VivasamUtil.isNull(String.valueOf(requestParams.get("telephone")));
        String myGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("myGrade")));
        String SchoolName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        String SchoolCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        String loc_dept1 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaCode")));
        String loc_dept2 = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchCode")));
        String mainSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("mainSubject")));
        String secondSubject = VivasamUtil.isNull(String.valueOf(requestParams.get("secondSubject")));
        String mTypeCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mTypeCd")));
        String checkCase = VivasamUtil.isNull(String.valueOf(requestParams.get("checkCase")));

        String memberValidateType = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateType")));
        String memberValidateEmail = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateEmail")));

        String birthDay = VivasamUtil.isNull(String.valueOf(requestParams.get("birthDay")));
        String birth = birthDay.replaceAll("-", "");

        String lunar = VivasamUtil.isNull(String.valueOf(requestParams.get("lunar")));
        String IPIN_CI = VivasamUtil.isNull(String.valueOf(requestParams.get("isIpin")));
        String EPKI_CERTDN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTDN")));
        String EPKI_CERTSN = VivasamUtil.isNull(String.valueOf(requestParams.get("EPKI_CERTSN")));
        String VALID_YN = VivasamUtil.isNull(String.valueOf(requestParams.get("VALID_YN")));
        String authentication = VivasamUtil.isNull(String.valueOf(requestParams.get("authentication")));

        String sex = VivasamUtil.isNull(String.valueOf(requestParams.get("gender")));

        String zip = VivasamUtil.isNull(String.valueOf(requestParams.get("zipNo")));
        String addr1 = VivasamUtil.isNull(String.valueOf(requestParams.get("address")));
        String addr2 = VivasamUtil.isNull(String.valueOf(requestParams.get("addressDetail")));

        // 비상교과서 채택여부
        String visangTbYN = "N";
        // 개인정보 유효기간설정
        String expiryTermNum = VivasamUtil.isNull(String.valueOf(requestParams.get("expiryTermNum")));
        String vMagazineYN = "N";

        String Agree1 = String.valueOf(requestParams.get("service"));
        String Agree2 = String.valueOf(requestParams.get("privacy"));
        String Agree3 = String.valueOf(requestParams.get("all"));
        String Agree4 = String.valueOf(requestParams.get("marketing"));

        // 통합회원 추가
        String Agree5 = String.valueOf(requestParams.get("thirdPrivacy"));
        String Agree6 = String.valueOf(requestParams.get("thirdMarketing"));
        String existTid = VivasamUtil.isNull(String.valueOf(requestParams.get("tschUserId")));
        String existVid = VivasamUtil.isNull(String.valueOf(requestParams.get("vUserId")));

        // 추천인 코드 및 가입 경로
        String via = String.valueOf(requestParams.get("via"));
        String reco = String.valueOf(requestParams.get("reco"));
        // 회원 가입 _ 추천인 아이디
        String recommendId = VivasamUtil.isNull(String.valueOf(requestParams.get("recommendId")));

        id = checkXSSService.ReplaceValue(request, "id", id);
        name = checkXSSService.ReplaceValue(request, "name", name);
        Email = checkXSSService.ReplaceValue(request, "Email", Email);
        cellphone = checkXSSService.ReplaceValue(request, "cellphone", cellphone);
        myGrade = checkXSSService.ReplaceValue(request, "myGrade", myGrade);
        SchoolName = checkXSSService.ReplaceValue(request, "SchoolName", SchoolName);
        SchoolCode = checkXSSService.ReplaceValue(request, "SchoolCode", SchoolCode);
        loc_dept1 = checkXSSService.ReplaceValue(request, "loc_dept1", loc_dept1);
        loc_dept2 = checkXSSService.ReplaceValue(request, "loc_dept2", loc_dept2);
        mainSubject = checkXSSService.ReplaceValue(request, "mainSubject", mainSubject);
        secondSubject = checkXSSService.ReplaceValue(request, "secondSubject", secondSubject);
        birth = checkXSSService.ReplaceValue(request, "birth", birth);
        lunar = checkXSSService.ReplaceValue(request, "lunar", lunar);
        IPIN_CI = checkXSSService.ReplaceValue(request, "IPIN_CI", IPIN_CI);
        EPKI_CERTDN = checkXSSService.ReplaceValue(request, "EPKI_CERTDN", EPKI_CERTDN);
        EPKI_CERTSN = checkXSSService.ReplaceValue(request, "EPKI_CERTSN", EPKI_CERTSN);
        VALID_YN = checkXSSService.ReplaceValue(request, "VALID_YN", VALID_YN);
        authentication = checkXSSService.ReplaceValue(request, "authentication", authentication);
        sex = checkXSSService.ReplaceValue(request, "sex", sex);
        zip = checkXSSService.ReplaceValue(request, "zip", zip);
        addr1 = checkXSSService.ReplaceValue(request, "addr1", addr1);
        addr2 = checkXSSService.ReplaceValue(request, "addr2", addr2);
        visangTbYN = checkXSSService.ReplaceValue(request, "visangTbYN", visangTbYN);
        expiryTermNum = checkXSSService.ReplaceValue(request, "expiryTermNum", expiryTermNum);
        Agree3 = checkXSSService.ReplaceValue(request, "Agree3", Agree3);
        Agree4 = checkXSSService.ReplaceValue(request, "Agree4", Agree4);

        // 통합회원 추가
        Agree5 = checkXSSService.ReplaceValue(request, "Agree5", Agree5);
        Agree6 = checkXSSService.ReplaceValue(request, "Agree6", Agree6);
        existTid = checkXSSService.ReplaceValue(request, "existTid", existTid);
        existVid = checkXSSService.ReplaceValue(request, "existVid", existVid);
        mTypeCd = checkXSSService.ReplaceValue(request, "mTypeCd", mTypeCd);
        checkCase = checkXSSService.ReplaceValue(request, "checkCase", checkCase);
        memberValidateType = checkXSSService.ReplaceValue(request, "memberValidateType", memberValidateType);
        memberValidateEmail = checkXSSService.ReplaceValue(request, "memberValidateEmail", memberValidateEmail);

        recommendId = checkXSSService.ReplaceValue(request, "recommendId", recommendId);

        String p = "(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})";
        String preCellphone = String.valueOf(cellphone);
        String parseCellphone = preCellphone.replaceAll(p, "$1-$2-$3");

        Map<String, String> param = new HashMap<>();

        param.put("id", String.valueOf(id));
        param.put("memberId", String.valueOf(id));
        param.put("name", String.valueOf(name));
        param.put("password", String.valueOf(password));
        param.put("Email", String.valueOf(Email));
        param.put("cellphone", String.valueOf(parseCellphone));
        param.put("myGrade", String.valueOf(myGrade));
        param.put("SchoolName", String.valueOf(SchoolName));
        param.put("SchoolCode", String.valueOf(SchoolCode));
        param.put("loc_dept1", String.valueOf(loc_dept1));
        param.put("loc_dept2", String.valueOf(loc_dept2));
        param.put("mainSubject", String.valueOf(mainSubject));
        param.put("secondSubject", String.valueOf(secondSubject));
        param.put("birth", String.valueOf(birth));
        param.put("lunar", String.valueOf(lunar));
        param.put("IPIN_CI", String.valueOf(IPIN_CI));
        param.put("EPKI_CERTDN", String.valueOf(EPKI_CERTDN));
        param.put("EPKI_CERTSN", String.valueOf(EPKI_CERTSN));
        param.put("VALID_YN", String.valueOf(VALID_YN));
        if (String.valueOf(VALID_YN).equals("") || String.valueOf(VALID_YN) == null)
            param.put("VALID_YN", "N");
        param.put("authentication", String.valueOf(authentication));
        param.put("mTypeCd", String.valueOf(mTypeCd));
        param.put("checkCase", String.valueOf(checkCase));
        param.put("memberValidateType", String.valueOf(memberValidateType));
        param.put("memberValidateEmail", String.valueOf(memberValidateEmail));

        param.put("sex", String.valueOf(sex));

        param.put("zip", String.valueOf(zip));
        param.put("addr1", String.valueOf(addr1));
        param.put("addr2", String.valueOf(addr2));

        param.put("visangTbYN", String.valueOf(visangTbYN));
        param.put("expiryTermNum", String.valueOf(expiryTermNum));

        param.put("Agree3", String.valueOf(Agree3)); // 제3자 정보제공 동의 (선택)
        param.put("Agree4", String.valueOf(Agree4)); // 마케팅 및 광고 활용 동의 (선택)

        // 통합회원 추가
        param.put("Agree5", String.valueOf(Agree5));
        param.put("Agree6", String.valueOf(Agree6));
        param.put("existTid", String.valueOf(existTid));
        param.put("existVid", String.valueOf(existVid));

        // 학교 정보 직접 등록인지 아닌지 판단
        // True : 정보 검색 / False : 직접 등록
        String isSelect = VivasamUtil.isNull(String.valueOf(requestParams.get("isSelect")));
        logger.info("isSelect   : " + isSelect);
        param.put("isSelectedSchool", isSelect);

        // 추천인 코드 및 가입경로
        param.put("via", via);
        param.put("reco", reco);
        param.put("recommendId", recommendId);

        // 회원가입 성공시 Q&A작업
        // 학교 직접 등록인 경우 Q&A 등록하기
        if ("false".equals(isSelect)) {
            logger.info("==================================================");
            logger.info("school Q&A Insert");
            logger.info("==================================================");

            // 학교 직접 등록인 경우 학교급, 학교 지역을 판단하여 설문조사로 넣기 위해 작업
            String schoolGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolGrade")));
            String fkareaName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaName")));
            String fkbranchName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchName")));
            String requestedTerm = VivasamUtil.isNull(String.valueOf(requestParams.get("requestedTerm")));
            String qnaSchLvlCd = "";

            schoolGrade = checkXSSService.ReplaceValue(request, "schoolGrade", schoolGrade);
            fkareaName = checkXSSService.ReplaceValue(request, "fkareaName", fkareaName);
            fkbranchName = checkXSSService.ReplaceValue(request, "fkbranchName", fkbranchName);
            requestedTerm = checkXSSService.ReplaceValue(request, "requestedTerm", requestedTerm);

            // 학교 직접 등록시 학교급, 지역 코드 받아오기
            if ("E".equals(schoolGrade)) {
                schoolGrade = "초등";
                qnaSchLvlCd = "ES";
            }else if("M".equals(schoolGrade)){
                schoolGrade = "중등";
                qnaSchLvlCd = "MS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("C".equals(schoolGrade)){
                schoolGrade = "대학";
                qnaSchLvlCd = "CS";
            }else if("K".equals(schoolGrade)){
                schoolGrade = "유치원";
                qnaSchLvlCd = "KS";
            }else if("O".equals(schoolGrade)){
                schoolGrade = "교육기관";
                qnaSchLvlCd = "OS";
            }

            // 해당되는 Q&A 값 넣어주기
            String qnaCd = "QA011";
            String member_id = id;
            String qnaTitle = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName"))) + "_학교등록신청";
            String qnaContents = "학교등록 신청\n\n- 학교급 : ";
            qnaContents += schoolGrade;
            qnaContents += "\n- 학교명  : ";
            qnaContents += SchoolName;
            qnaContents += "\n- 학교지역  : ";
            qnaContents += fkareaName + " > " + fkbranchName;
            qnaContents += "\n- 별도 요청사항  : " + requestedTerm;
            qnaContents += "\n";
            qnaContents += "- 학교변경 동의여부  : Y\n";

            qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", qnaTitle);
            qnaContents = checkXSSService.ReplaceValue(request, "qnaContents", qnaContents);

            logger.debug("==============================================================x");
            logger.debug("qnaCd   : " + qnaCd);
            logger.debug("qnaTitle   : " + qnaTitle);
            logger.debug("qnaContents   : " + qnaContents);
            logger.debug("==============================================================x");

            param.put("qnaCd", qnaCd);
            param.put("qnaTitle", qnaTitle);
            param.put("qnaContents", qnaContents);
            param.put("qnaSchLvlCd", qnaSchLvlCd);
            param.put("regIp", request.getRemoteAddr());

        }


        // 회원등록
        param.put("isSsoMember", "1");
        param.put("vId", existVid);
        param.put("tId", existTid);
        param.put("ssoId", id);

        String result = "";

        // SNS회원가입 시 상태정보 업데이트
        String snsAccessToken = VivasamUtil.isNull(String.valueOf(requestParams.get("accessToken")));
        String snsId= VivasamUtil.isNull(String.valueOf(requestParams.get("snsId")));
        String snsType = VivasamUtil.isNull(String.valueOf(requestParams.get("snsType")));
        String snsPhoneNumber = VivasamUtil.isNull(String.valueOf(requestParams.get("snsPhoneNumber")));
        String snsYear = VivasamUtil.isNull(String.valueOf(requestParams.get("snsYear")));
        String snsName = VivasamUtil.isNull(String.valueOf(requestParams.get("snsName")));
        String snsEmail = VivasamUtil.isNull(String.valueOf(requestParams.get("snsEmail")));

        param.put("snsId", snsId);
        param.put("snsType", snsType);
        param.put("snsPhoneNumber", snsPhoneNumber);
        param.put("snsYear", snsYear);
        param.put("snsName", snsName);
        param.put("snsEmail", snsEmail);
        if("0".equals(checkCase) || "8".equals(checkCase)) {
            param.put("password", environment.getProperty("sso.sns.key"));
        }


        try {
            result = memberService.createSsoMember(param);

        } catch (Exception ex) {
            ParamVo paramVo = new ParamVo();
            paramVo.setFail_log(ex.getMessage());
            paramVo.setV_AfterID(String.valueOf(id));
            paramVo.setV_BeforeID(existTid);
            paramVo.setProc_gn("ID생성실패(모바일):insertSsoJoin");
            ssoRestfulService.insertToidAsidFailLog(paramVo);
        }

        logger.info("==================================================");
        logger.info("result");
        logger.info("==================================================");
        logger.info("result   : " + result);
        logger.info("==================================================");

        if (result.equals("0")) {

            // 모바일 경로 가입 인증 업데이트, 학교 직접 등록 원래 여기-- 서비스단에서 처리하도록 수정함

            if (vMagazineYN.equals("Y")) {

                String ppp = id + "#" + SchoolName + "#" + zip + "#" + addr1 + "#" + addr2 + "#" + cellphone + "#" + SchoolCode;

                Map<String, String> params = new HashMap<String, String>();
                params.put("idx", "2");
                params.put("id", String.valueOf(id));
                params.put("cellphone", String.valueOf(parseCellphone));
                params.put("SchoolName", String.valueOf(SchoolName));
                params.put("SchoolCode", String.valueOf(SchoolCode));
                params.put("zip", String.valueOf(zip));
                params.put("addr1", String.valueOf(addr1));
                params.put("addr2", String.valueOf(addr2));
                params.put("etc", ppp);

                memberService.insertVmagazine(params);
            }

            // 통합회원 전환 마일리지를 지급
            if(!"0".equals(checkCase) && "0".equals(mTypeCd)) {
                UserPrincipal userPrincipal = securityMapper.findByUserId(id);
                // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
                if ("AU300".equals(userPrincipal.getMLevel()) && "Y".equals(userPrincipal.getValidYn()) && "0".equals(userPrincipal.getMTypeCd())) {
                    Mileage mileage = new Mileage(id, MileageCode.CHG_SSO.getAmount(), MileageCode.CHG_SSO.getCode());
                    int chkExist = memberMileageService.getMileageCntByMileageCode(mileage);
                    if (chkExist == 0) {
                        memberMileageService.insertMileagePlus(mileage);
                    }
                }
            }
        }

        return ResponseEntity.ok(result);
    }

    /**
     * [SSO] 회원가입 시 통합 회원 전환
     */
    @PostMapping("/insertSsoConversionJoin")
    public ResponseEntity<?> insertSsoConversionJoin(HttpServletRequest request,
                                                     @RequestBody Map<String, Map<String, Object>> requestParamMap) {

        // 파라미터 정보
        Map<String, Object> requestParams = requestParamMap.get("0");
        String uuid = VivasamUtil.isNull(String.valueOf(requestParams.get("uuid"))); // 인증 정보
        String vId = VivasamUtil.isNull(String.valueOf(requestParams.get("vUserId"))); // 기존 비바샘 아이디
        String tId = VivasamUtil.isNull(String.valueOf(requestParams.get("tschUserId"))); // 기존 티스쿨 아이디
        String ssoId = VivasamUtil.isNull(String.valueOf(requestParams.get("newUserId"))); // 통합 회원 아이디
        String password = VivasamUtil.isNull(String.valueOf(requestParams.get("password"))); // 비밀번호
        String schoolName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        String schoolCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        String fkareaCode = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaCode")));
        String fkbranchCode = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchCode")));
        String mTypeCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mTypeCd")));
        String checkCase = VivasamUtil.isNull(String.valueOf(requestParams.get("checkCase")));

        // 필수데이터 체크
        if(redisTemplate.opsForValue().get(uuid) == null) {
            return ResponseEntity.ok("4444");
        }

        if("".equals(ssoId)) {
            return ResponseEntity.ok("4444");
        }

        // 캐시 정보
        logger.info(redisTemplate.opsForValue().get(uuid).toString());
        Map<String, Object> cacheMap  = (Map<String, Object>) redisTemplate.opsForValue().get(uuid);
        Map<String, Object> agreeMap = (Map<String, Object>) cacheMap.get("preStepData");

        String agree3 = String.valueOf(agreeMap.get("all"));
        agree3 = checkXSSService.ReplaceValue(request, "agree3", agree3);
        String agree4 = String.valueOf(agreeMap.get("marketing"));
        agree4 = checkXSSService.ReplaceValue(request, "agree4", agree4);
        String agree5 = String.valueOf(agreeMap.get("thirdPrivacy")); // 통합회원 약관 동의 여부
        agree5 = checkXSSService.ReplaceValue(request, "agree5", agree5);
        String agree6 = String.valueOf(agreeMap.get("thirdMarketing")); // 통합회원 마케팅 동의 여부
        agree6 = checkXSSService.ReplaceValue(request, "agree6", agree6);
        String promtCd = VivasamUtil.isNull(String.valueOf(requestParams.get("promtCd"))); // 오프라인 프로모션 코드 추가
        promtCd = checkXSSService.ReplaceValue(request, "promtCd", promtCd);

        // 통합 필수 약관 미동의
        if (!Boolean.valueOf(agree5)) {
            return ResponseEntity.ok("3333");
        }

        // 회원정보 조회
        MemberInfo userInfo = new MemberInfo();
        HashMap<String, String> param = new HashMap<>();
        //비바샘에 회원이 없는 경우(연수원만 있는경우)
        if("".equals(vId)) {
            String ci = (String) cacheMap.get("sCoInfo1");
            if(ci == null || "".equals(ci)) return ResponseEntity.ok("4444");

            ElasticLoginClient client = new ElasticLoginClient();
            List<Map<String, String>> tSchUsers = client.getTschoolUser(ci);
            if(tSchUsers == null || tSchUsers.size() == 0) return ResponseEntity.ok("4444");

            for(Map<String, String> tSchUser: tSchUsers) {
                userInfo.setName(tSchUser.get("name") != null ? tSchUser.get("name") : "");
                userInfo.setEmail(tSchUser.get("email") != null ? tSchUser.get("email") : "");
                userInfo.setCellphone(tSchUser.get("phone_number") != null ? tSchUser.get("phone_number") : "");
                userInfo.setIpinCi(ci);
                userInfo.setBirth(tSchUser.get("birthday") != null ? tSchUser.get("birthday") : "");
                userInfo.setExpiryTermNum(tSchUser.get("active_year") != null ? tSchUser.get("active_year") : "1");

                if(ssoId.equals(tSchUser.get("username"))) break;
            }

            param.put("id", ssoId);
            param.put("memberId", ssoId); // 현재 로그인 사용자의 아이디
            param.put("name", userInfo.getName());
            param.put("password", password);
            param.put("Email", userInfo.getEmail());
            param.put("cellphone", userInfo.getCellphone());
            param.put("myGrade", "");
            param.put("SchoolName", schoolName);
            param.put("SchoolCode", schoolCode);
            param.put("loc_dept1", fkareaCode);
            param.put("loc_dept2", fkbranchCode);
            param.put("mTypeCd", mTypeCd);
            param.put("checkCase", checkCase);
            param.put("mainSubject", "");
            param.put("secondSubject", "");
            param.put("birth", userInfo.getBirth());
            param.put("lunar", "");
            param.put("IPIN_CI", ci);
            param.put("EPKI_CERTDN", "");
            param.put("EPKI_CERTSN", "");
            param.put("VALID_YN", "");
            param.put("authentication", "");
            param.put("ArrayTbCd", "");
            param.put("sex", "");
            param.put("zip", "");
            param.put("addr1", "");
            param.put("addr2", "");
            param.put("visangTbYN", "");
            param.put("expiryTermNum", userInfo.getExpiryTermNum());
            param.put("existTid", tId);
            // 오프라인 프로모션 코드 추가
            param.put("promtCd", "");
            param.put("snsJoin", null);
        } else {
            userInfo = memberService.getSsoMemberInfo(vId);

            param.put("id", ssoId);
            param.put("memberName", userInfo.getName());
            param.put("name", userInfo.getName());
            param.put("password", password);
            param.put("passwordConfirm", password);
            param.put("ci", userInfo.getIpinCi());
            param.put("IPIN_CI", userInfo.getIpinCi());
            param.put("ssoId", ssoId); // 새롭게 사용할 아이디
            param.put("memberId", vId); // 현재 로그인 사용자의 아이디
            param.put("email", userInfo.getEmail());
            param.put("Email", userInfo.getEmail());
            param.put("cellphone", userInfo.getCellphone());
            param.put("SchoolCode", String.valueOf(userInfo.getSchCode()));
            param.put("SchoolName", userInfo.getSchName());
            param.put("schCode", String.valueOf(userInfo.getSchCode()));
            param.put("schName", userInfo.getSchName());
            param.put("fkareacode", fkareaCode);
            param.put("fkbranchcode", fkbranchCode);
            param.put("mTypeCd", mTypeCd);
            param.put("checkCase", checkCase);
            param.put("myGrade", "");
            param.put("birth", userInfo.getBirth());
            param.put("lunar", userInfo.getLunar());
            param.put("zip", userInfo.getZip());
            param.put("addr1", userInfo.getAddr1());
            param.put("addr2", userInfo.getAddr2());
            param.put("sex", userInfo.getSex());
            param.put("visangTbYN", userInfo.getVisangTbYN());
            param.put("expiryTermNum", userInfo.getExpiryTermNum());
            param.put("mainSubject", "");
            param.put("secondSubject", "");
            param.put("promtCd", promtCd);
        }

        // 학교 정보 직접 등록인지 아닌지 판단
        // True : 정보 검색 / False : 직접 등록
        String isSelect = VivasamUtil.isNull(String.valueOf(requestParams.get("isSelect")));
        logger.info("isSelect   : " + isSelect);
        param.put("isSelectedSchool", isSelect);

        // 회원가입 성공시 Q&A작업
        // 학교 직접 등록인 경우 Q&A 등록하기
        if ("false".equals(isSelect)) {
            logger.info("==================================================");
            logger.info("school Q&A Insert");
            logger.info("==================================================");

            // 학교 직접 등록인 경우 학교급, 학교 지역을 판단하여 설문조사로 넣기 위해 작업
            String schoolGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolGrade")));
            String fkareaName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkareaName")));
            String fkbranchName = VivasamUtil.isNull(String.valueOf(requestParams.get("fkbranchName")));
            String requestedTerm = VivasamUtil.isNull(String.valueOf(requestParams.get("requestedTerm")));
            String qnaSchLvlCd = "";

            schoolGrade = checkXSSService.ReplaceValue(request, "schoolGrade", schoolGrade);
            fkareaName = checkXSSService.ReplaceValue(request, "fkareaName", fkareaName);
            fkbranchName = checkXSSService.ReplaceValue(request, "fkbranchName", fkbranchName);
            requestedTerm = checkXSSService.ReplaceValue(request, "requestedTerm", requestedTerm);

            // 학교 직접 등록시 학교급, 지역 코드 받아오기
            if ("E".equals(schoolGrade)) {
                schoolGrade = "초등";
                qnaSchLvlCd = "ES";
            }else if("M".equals(schoolGrade)){
                schoolGrade = "중등";
                qnaSchLvlCd = "MS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("H".equals(schoolGrade)){
                schoolGrade = "고등";
                qnaSchLvlCd = "HS";
            }else if("C".equals(schoolGrade)){
                schoolGrade = "대학";
                qnaSchLvlCd = "CS";
            }else if("K".equals(schoolGrade)){
                schoolGrade = "유치원";
                qnaSchLvlCd = "KS";
            }else if("O".equals(schoolGrade)){
                schoolGrade = "교육기관";
                qnaSchLvlCd = "OS";
            }

            // 해당되는 Q&A 값 넣어주기
            String qnaCd = "QA011";
            String qnaTitle = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName"))) + "_학교등록신청";
            String qnaContents = "학교등록 신청\n\n- 학교급 : ";
            qnaContents += schoolGrade;
            qnaContents += "\n- 학교명  : ";
            qnaContents += schoolName;
            qnaContents += "\n- 학교지역  : ";
            qnaContents += fkareaName + " > " + fkbranchName;
            qnaContents += "\n- 별도 요청사항  : " + requestedTerm;
            qnaContents += "\n";
            qnaContents += "- 학교변경 동의여부  : Y\n";

            qnaTitle = checkXSSService.ReplaceValue(request, "qnaTitle", qnaTitle);
            qnaContents = checkXSSService.ReplaceValue(request, "qnaContents", qnaContents);

            logger.debug("==============================================================x");
            logger.debug("qnaCd   : " + qnaCd);
            logger.debug("qnaTitle   : " + qnaTitle);
            logger.debug("qnaContents   : " + qnaContents);
            logger.debug("==============================================================x");

            param.put("qnaCd", qnaCd);
            param.put("qnaTitle", qnaTitle);
            param.put("qnaContents", qnaContents);
            param.put("qnaSchLvlCd", qnaSchLvlCd);
            param.put("regIp", request.getRemoteAddr());

        }

        param.put("Agree3", agree3);
        param.put("Agree4", agree4);
        param.put("Agree5", agree5);
        param.put("Agree6", agree6);

        param.put("vId", vId);
        param.put("tId", tId);
        param.put("ssoId", ssoId);

        String result = "";

        // SNS회원가입 시 상태정보 업데이트
        String snsAccessToken = VivasamUtil.isNull(String.valueOf(requestParams.get("accessToken")));
        String snsId= VivasamUtil.isNull(String.valueOf(requestParams.get("snsId")));
        String snsType = VivasamUtil.isNull(String.valueOf(requestParams.get("snsType")));
        String snsPhoneNumber = VivasamUtil.isNull(String.valueOf(requestParams.get("snsPhoneNumber")));
        String snsYear = VivasamUtil.isNull(String.valueOf(requestParams.get("snsYear")));
        String snsName = VivasamUtil.isNull(String.valueOf(requestParams.get("snsName")));
        String snsEmail = VivasamUtil.isNull(String.valueOf(requestParams.get("snsEmail")));

        param.put("snsId", snsId);
        param.put("snsType", snsType);
        param.put("snsPhoneNumber", snsPhoneNumber);
        param.put("snsYear", snsYear);
        param.put("snsName", snsName);
        param.put("snsEmail", snsEmail);
        //param.put("password", environment.getProperty("sso.sns.key")); SNS회원이어도 통합 전환시에는 비밀번호를 입력 받으므로 필요없음

        try {
            result = memberService.createSsoMember(param);
        } catch (Exception ex) {
            ParamVo paramVo = new ParamVo();
            paramVo.setFail_log(ex.getMessage());
            paramVo.setV_AfterID(ssoId);
            paramVo.setV_BeforeID(vId);
            paramVo.setProc_gn("ID생성실패(모바일):insertSsoConversion");
            ssoRestfulService.insertToidAsidFailLog(paramVo);
        }

        if ("0".equals(result)) { // 업데이트 성공
            result = "0000";

           // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
            UserPrincipal userPrincipal = securityMapper.findByUserId(ssoId);
            if ("AU300".equals(userPrincipal.getMLevel()) && "Y".equals(userPrincipal.getValidYn()) && "0".equals(userPrincipal.getMTypeCd())) {
                // 통합회원 전환 마일리지를 지급
                Mileage mileage = new Mileage(ssoId, MileageCode.CHG_SSO.getAmount(), MileageCode.CHG_SSO.getCode());
                int chkExist = memberMileageService.getMileageCntByMileageCode(mileage);
                if (chkExist == 0) {
                    memberMileageService.insertMileagePlus(mileage);
                }
            }
        } else {
            result = "1111";
        }

        return ResponseEntity.ok(result);
    }

    /**
     * [SSO] 통합 회원 전환
     */
    @PostMapping("/insertSsoConversion")
    public ResponseEntity<?> insertSsoConversion(HttpServletRequest request, @CurrentUser UserPrincipal currentUser, @RequestBody Map<String,Map<String, Object>> requestParamMap) {
        Map<String,Object> requestParams= requestParamMap.get("0");
        if(currentUser == null || !StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("INVALID");
        }

        String vId = VivasamUtil.isNull(String.valueOf(requestParams.get("userId")), ""); // 기존 비바샘 아이디
        String tId = VivasamUtil.isNull(String.valueOf(requestParams.get("tschUserId")), ""); // 기존 티스쿨 아이디
        String ssoId = VivasamUtil.isNull(String.valueOf(requestParams.get("newUserId"))); // 통합 회원 아이디
        String password = VivasamUtil.isNull(String.valueOf(requestParams.get("password")));
        String mTypeCd = VivasamUtil.isNull(String.valueOf(requestParams.get("mTypeCd")));
        String checkCase = VivasamUtil.isNull(String.valueOf(requestParams.get("checkCase")));

        String Email = VivasamUtil.isNull(String.valueOf(requestParams.get("email")));
        Email = checkXSSService.ReplaceValue(request, "Email", Email);
        String myGrade = VivasamUtil.isNull(String.valueOf(requestParams.get("myGrade")));
        myGrade = checkXSSService.ReplaceValue(request, "myGrade", myGrade);
        String SchoolName = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolName")));
        SchoolName = checkXSSService.ReplaceValue(request, "SchoolName", SchoolName);
        String SchoolCode = VivasamUtil.isNull(String.valueOf(requestParams.get("schoolCode")));
        SchoolCode = checkXSSService.ReplaceValue(request, "SchoolCode", SchoolCode);

        String memberValidateType = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateType")));
        memberValidateType = checkXSSService.ReplaceValue(request, "memberValidateType", memberValidateType);
        String memberValidateEmail = VivasamUtil.isNull(String.valueOf(requestParams.get("memberValidateEmail")));
        memberValidateEmail = checkXSSService.ReplaceValue(request, "memberValidateEmail", memberValidateEmail);


        String agree5 = String.valueOf(requestParams.get("thirdPrivacy")); // 통합회원 약관 동의 여부
        agree5 = checkXSSService.ReplaceValue(request, "agree5", agree5);
        String agree6 = String.valueOf(requestParams.get("thirdMarketing")); // 통합회원 마케팅 동의 여부
        agree6 = checkXSSService.ReplaceValue(request, "agree6", agree6);

        String promtCd = VivasamUtil.isNull(String.valueOf(requestParams.get("promtCd"))); // 오프라인 프로모션 코드 추가
        promtCd = checkXSSService.ReplaceValue(request, "promtCd", promtCd);

        // 통합 필수 약관 미동의
        if (!Boolean.valueOf(agree5)) {
            return ResponseEntity.ok("3333");
        }

        // 필수 항목
        MemberInfo userInfo = memberService.getSsoMemberInfo(currentUser.getMemberId());
        Map<String, String> param = new HashMap<>();

        param.put("memberName", userInfo.getName());
        param.put("name", userInfo.getName());
        param.put("password", password);
        param.put("passwordConfirm", password);
        param.put("isSsoMember", agree5);
        param.put("thirdMarketingAgree", agree6);
        param.put("ci", userInfo.getIpinCi());
        param.put("IPIN_CI", userInfo.getIpinCi());
        param.put("Agree4", "Y".equals(userInfo.getMarketingEmailYn()) ? "true" : "false");
        param.put("Agree5", agree5);
        param.put("Agree6", agree6);
        param.put("id", ssoId);
        param.put("ssoId", ssoId); // 새롭게 사용할 아이디
        param.put("memberId", vId); // 현재 로그인 사용자의 아이디
        param.put("email", String.valueOf(Email));
        param.put("Email", String.valueOf(Email));
        param.put("cellphone", userInfo.getCellphone());
        param.put("schCode", String.valueOf(SchoolCode));
        param.put("SchoolCode", String.valueOf(SchoolCode));
        param.put("schName", String.valueOf(SchoolName));
        param.put("SchoolName", String.valueOf(SchoolName));
        param.put("fkareacode", userInfo.getFkareacode());
        param.put("fkbranchcode", userInfo.getFkbranchcode());
        param.put("mTypeCd", mTypeCd);
        param.put("checkCase", checkCase);
        param.put("myGrade", String.valueOf(myGrade));
        param.put("birth", userInfo.getBirth());
        param.put("lunar", userInfo.getLunar());
        param.put("zip", userInfo.getZip());
        param.put("addr1", userInfo.getAddr1());
        param.put("addr2", userInfo.getAddr2());
        param.put("sex", userInfo.getSex());
        param.put("visangTbYN", userInfo.getVisangTbYN());
        param.put("expiryTermNum", userInfo.getExpiryTermNum());
        param.put("mainSubject", userInfo.getMainSubject());
        param.put("secondSubject", userInfo.getSecondSubject());
        param.put("promtCd", promtCd);
        param.put("memberValidateType", String.valueOf(memberValidateType));
        param.put("memberValidateEmail", String.valueOf(memberValidateEmail));

        param.put("vId", vId);
        param.put("tId", tId);
        param.put("ssoId", ssoId);

        String result = "";

        try {
            result = memberService.createSsoMember(param);
        } catch (Exception ex) {
            ParamVo paramVo = new ParamVo();
            paramVo.setFail_log(ex.getMessage());
            paramVo.setV_AfterID(ssoId);
            paramVo.setV_BeforeID(vId);
            paramVo.setProc_gn("ID생성실패(모바일):insertSsoConversion");
            ssoRestfulService.insertToidAsidFailLog(paramVo);
        }

        if ("0".equals(result)) { // 업데이트 성공
            result = "0000";

            // 마일리지 자격 회원인지 체크 (정회원, 교사인증, 교사회원)
            if ("AU300".equals(currentUser.getMLevel()) && "Y".equals(currentUser.getValidYn()) && "0".equals(currentUser.getMTypeCd())) {
                // 통합회원 전환 마일리지를 지급
                Mileage mileage = new Mileage(ssoId, MileageCode.CHG_SSO.getAmount(), MileageCode.CHG_SSO.getCode());
                int chkExist = memberMileageService.getMileageCntByMileageCode(mileage);
                if (chkExist == 0) {
                    memberMileageService.insertMileagePlus(mileage);
                }
            }
        }else{
            result = "1111";
        }

        return ResponseEntity.ok(result);

    }

    /**
     * 2019.10.23 김대희
     * IPIN_CI 값을 통해 임시인증(IPIN_CI_아이디)인지, 정식인증인지 확인
     */
    @PostMapping("/checkAuthIPIN")
    public ResponseEntity<?> checkAuthIPIN(HttpServletRequest request,
                                              @CurrentUser UserPrincipal currentUser) {
        Map<String,Object> resultMap = new HashMap<>();

        String ipin = "";
        if (currentUser != null) ipin = memberService.getIpinCi(currentUser.getMemberId());
        if(ipin.contains("IPIN_CI")){ // 임시 인증인 경우
            ipin = "NotAllowAuth";
            logger.debug("> > > 임시 인증 회원의 통합회원 전환 페이지 이동 / 모바일");
            resultMap.put("IPIN_CHECK", ipin); //본인인증 이전 단계 데이터
        }else{ // 임시 인증이 아닌 경우
            ipin = "AllowAuth";
            logger.debug("> > > 정식 인증 회원의 통합회원 전환 페이지 이동 / 모바일 ");
            resultMap.put("IPIN_CHECK", ipin); //본인인증 이전 단계 데이터
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 2021.11.10 yunms 교사인증 및 서류인증 상태확인
     */
    @PostMapping("/checkEpkStatusInfo")
    public ResponseEntity<?> checkEpkStatusInfo(HttpServletRequest request, @CurrentUser UserPrincipal currentUser) {
        Map<String, Object> resultMap = new HashMap<>();
        if (currentUser != null) {
            String renewYn = memberService.getMemberTeacherCertifiedCheckYn(currentUser.getMemberId());
            resultMap.put("renewYn", renewYn);
            if(currentUser.getCeritfyCheck() == null || "N".equals(currentUser.getCeritfyCheck())){
                // 교사 미인증 상태인 경우
                String ceritfyCheck = memberService.checkCertifyCheck(currentUser.getMemberId());
                if("Y".equals(ceritfyCheck)){
                    currentUser.setCeritfyCheck("Y");
                    resultMap.put("ceritfyCheck", "Y");
                    if("Y".equals(renewYn)){
                        Map<String, Object> epkStatusInfo = memberService.getEpkStatusInfo(currentUser.getMemberId());
                        resultMap.put("epkStatusInfo", epkStatusInfo);
                    }
                }else{
                    Map<String, Object> epkStatusInfo = memberService.getEpkStatusInfo(currentUser.getMemberId());
                    resultMap.put("ceritfyCheck", "N");
                    resultMap.put("epkStatusInfo", epkStatusInfo);
                }
            }else{
                // 교사 인증 상태
                resultMap.put("ceritfyCheck", "Y"); // 본인인증 이전 단계 데이터
                if("Y".equals(renewYn)){
                    Map<String, Object> epkStatusInfo = memberService.getEpkStatusInfo(currentUser.getMemberId());
                    resultMap.put("epkStatusInfo", epkStatusInfo);
                }
            }
        }
        return ResponseEntity.ok(resultMap);
    }
    //SNS 로그인 관련 로직 시작
    @ResponseBody
    @PostMapping("/sns/login")
    public ResponseEntity<?> snsLogin(HttpServletRequest request, HttpServletResponse response,
                                      @CurrentUser UserPrincipal currentUser,
                                      @RequestBody SnsLoginParameter parameter, HttpSession session) {
        MemberResult result = new MemberResult();
        SnsCheckResult snsCheckResult = memberService.saveSnsLoginInfo(parameter, currentUser);
        if (snsCheckResult.isError()) {
            result.setCode("sns_fail");
            result.setMsg(snsCheckResult.getMsg());
            return ResponseEntity.ok(result);
        }
        else if (snsCheckResult.isResult() && !parameter.isInfoCheck()) {
            // 페이스북, 구글은 전화번호가 없는 관계로 본인인증 화면으로 전달되야함
            if (("FACEBOOK".equals(parameter.getType()) || "GOOGLE".equals(parameter.getType()) ||
                    "APPLE".equals(parameter.getType()) || "WHALESPACE".equals(parameter.getType())) &&
                    StringUtils.isEmpty(snsCheckResult.getMemberId())) {
                // 본인 인증화면으로 전달
                if (snsCheckResult.getList() != null) {

                    List<String> snsList = snsCheckResult.getList();
                    boolean ssoMember = false;
                    for(String userId : snsList) {
                        String isSsoMember = memberService.getSsoMemberByUserId(userId);
                        if ("1".equals(isSsoMember)) {
                            ssoMember = true;
                            break;
                        }
                    }

                    // 회원 계정이 통합회원이면 연동, 단독회원이면 신규가입
                    if(ssoMember) {
                        result.setCode("sns_success_identification_mapping");
                    } else {
                        result.setCode("sns_join");
                    }
                }
                else {
                    result.setCode("sns_join");
                }
                result.setObject(parameter);
                return ResponseEntity.ok(result);
            }

            if (snsCheckResult.getList() != null) {

                List<String> snsList = snsCheckResult.getList();
                boolean ssoMember = false;

                for(String userId : snsList) {
                    String isSsoMember = memberService.getSsoMemberByUserId(userId);
                    if ("1".equals(isSsoMember)) {
                        ssoMember = true;
                        break;
                    }
                }

                // 회원 계정이 통합회원이면 연동, 단독회원이면 신규가입
                if(ssoMember) {
                    // 연동 화면으로 이동, 세션에 로그인 정보 담기
                    result.setCode("sns_success_mapping");
                    result.setObject(parameter);
                    return ResponseEntity.ok(result);
                } else {
                    // 세션에 로그인 정보 담기
                    // 회원가입 화면으로 이동
                    result.setCode("sns_join");
                    result.setObject(parameter);
                    return ResponseEntity.ok(result);
                }

            }
            else {
                // 신규 회원가입
                if (snsCheckResult.isJoin()) {
                    // 세션에 로그인 정보 담기
                    // 회원가입 화면으로 이동
                    result.setCode("sns_join");
                    result.setObject(parameter);
                    return ResponseEntity.ok(result);
                }
            }
        }
        // 로그인 AJAX 호출하기
        result.setCode("sns_goLogin");
        parameter.setMemberId(snsCheckResult.getMemberId());

        // 개인정보 수정화면에서 로그인 성공시 리다이렉트 화면 URL 연결
        if (parameter.isInfoCheck()) {
            result.setRedirectURL("/myInfo/modify");
        }
        if (parameter.isLeaveCheck()) {
            result.setRedirectURL("/leave/complete");
        }
        result.setObject(parameter);
        return ResponseEntity.ok(result);
    }

    /**
     * 단독회원 계정의 아이디를 통해 데이터 조회 API
     */
    @GetMapping("/info/get")
    public ResponseEntity<?> getMemberInfoByMemberId(String existMemberId) {
        UserPrincipal userPrincipal = securityMapper.findByUserId(existMemberId);
        return ResponseEntity.ok(userPrincipal);
    }

    @ResponseBody
    @PostMapping("/sns/linkage")
    public ResponseEntity<?> getSnsMappingList(@RequestBody SnsLoginParameter parameter) {
        return ResponseEntity.ok(memberService.getSnsMappingIdList(parameter));
    }

    @ResponseBody
    @PostMapping("/sns/linkage/update")
    public ResponseEntity<?> getSnsMappingUpdate(@RequestBody SnsLoginParameter parameter) {
        return ResponseEntity.ok(memberService.getSnsMappingUpdate(parameter));
    }

    @ResponseBody
    @GetMapping("/sns/login/type")
    public ResponseEntity<?> getSnsLoginType(@CurrentUser UserPrincipal currentUser, HttpServletRequest request) {
        String loginType = jwtTokenProvider.parseLoginTypeFromRequest(request);
        if (loginType == null) loginType = LoginType.LOGIN.name();
        return ResponseEntity.ok(loginType);
    }

    @ResponseBody
    @GetMapping("/sns/modify/sns")
    public ResponseEntity<?> getModifySns(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(memberService.getSnsMemberList(currentUser.getMemberId()));
    }

    @ResponseBody
    @GetMapping("/pwd/exit")
    public ResponseEntity<?> getPwdExit(@RequestParam(value = "memberId", required = true) String memberId) {
        MemberResult result = new MemberResult();
        boolean pwdNotExit = memberService.getSleepMemberPasswordNotExistence(memberId);
        result.setSuccess(!pwdNotExit);
        if (pwdNotExit) {
            String cellPhone = memberService.getSleepMemberCellPhone(memberId);
            if (org.apache.commons.lang3.StringUtils.isNotBlank(cellPhone)) {
                result.setMsg(cellPhone);
            }
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 공직자 메일 인증
     */
    @PostMapping("/sendCertifyMail")
    public ResponseEntity<?> sendCertifyMail(HttpServletRequest request, @RequestBody MemberValidateEmail memberValidateEmail) {

        if (org.apache.commons.lang3.StringUtils.isBlank(memberValidateEmail.getEmail())) {
            memberValidateEmail.setResult(2);
            return ResponseEntity.ok(memberValidateEmail);
        }

        memberValidateEmail = memberService.sendCertificationNumByEmail(memberValidateEmail, request);
        return ResponseEntity.ok(memberValidateEmail);
    }

    /**
     * 공직자 메일 인증 확인
     */
    @PostMapping("/checkCertifyMail")
    public ResponseEntity<?> checkCertifyMail(HttpServletRequest request, @RequestBody MemberValidateEmail memberValidateEmail) {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        String clientCertifiNum = memberValidateEmail.getCertifiNum();
        String uuid = memberValidateEmail.getUuidForCertifiNum();
        String memberId = memberValidateEmail.getMemberId();

        if(StringUtils.isEmpty(clientCertifiNum)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        if (!StringUtils.isEmpty(memberId)) {
            uuid += memberId;
        }

        String originCertifiNum = (String) redisTemplate.opsForValue().get(uuid);
        if(originCertifiNum == null || StringUtils.isEmpty(originCertifiNum)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        if(!clientCertifiNum.equals(originCertifiNum)) {
            resultMap.put("code", "3");
            return ResponseEntity.ok(resultMap);
        }

        // 인증정보 DB저장
        memberService.updateMemberValidateEmail(memberValidateEmail);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 공직자 메일 인증 업데이트
     */
    @PostMapping("/updateCertifyMail")
    public ResponseEntity<?> updateCertifyMail(@RequestBody MemberValidateEmail memberValidateEmail
            , @CurrentUser UserPrincipal currentUser) {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        String email = memberValidateEmail.getEmail();
        String clientCertifiNum = memberValidateEmail.getCertifiNum();
        String uuid = memberValidateEmail.getUuidForCertifiNum();
        String memberId = memberValidateEmail.getMemberId();

        if(StringUtils.isEmpty(email) || StringUtils.isEmpty(clientCertifiNum) || StringUtils.isEmpty(uuid)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        if (!StringUtils.isEmpty(memberId)) {
            uuid += memberId;
        }

        String originCertifiNum = (String) redisTemplate.opsForValue().get(uuid);
        if(originCertifiNum == null || StringUtils.isEmpty(originCertifiNum)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        if(!clientCertifiNum.equals(originCertifiNum)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        redisTemplate.opsForValue().set(uuid, "");

        memberValidateEmail.setCertification("Y");
        memberValidateEmail.setMemberId(currentUser.getMemberId());

        // 인증정보 DB저장
        memberService.updateCertifyMail(memberValidateEmail);

        return ResponseEntity.ok(resultMap);
    }

    /**
     * 휴대폰 본인인증 (send)
     */
    @ResponseBody
    @GetMapping("/info/send/sms")
    public ResponseEntity<?> modifySendSMS(@RequestParam(value = "cellphone", required = true) String cellphone
            , Sms parameter) throws Exception {
        MemberResult result = new MemberResult();
        result.setCode("fail");
        // 1. 전화번호 값 확인
        if (org.apache.commons.lang3.StringUtils.isBlank(cellphone)) {
            result.setMsg("전화번호를 입력받지 못하였습니다.");
            return ResponseEntity.ok(result);
        }

        // 2. 인증번호 생성 후 문자 메세지 생성
        String randomNumber = org.apache.commons.lang3.RandomStringUtils.randomNumeric(6);
        String msg = "[비바샘 인증번호] : " + randomNumber;

        // 3. DB insert
        SmsInfo sms = new SmsInfo();
        sms.setSubject("비바샘 인증번호");
        sms.setMsg(msg);
        sms.setPhone(cellphone);
        memberService.saveMms(sms);

        // 5. 세션에 정보 입력
        result.setCode("success");
        result.setMsg(randomNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 휴대폰 본인인증 (send)
     */
    @ResponseBody
    @GetMapping("/info/sns/sms")
    public ResponseEntity<?> modifySendSMSJoin(HttpServletRequest request
                                                , @RequestParam(value = "cellphone", required = true) String cellphone
                                                , @RequestParam(value = "memberId") String memberId
                                                 ) throws Exception {
        /* 1분안에 다시 보낸기록이 없으면 */
        if(!userSendTempLog.isOneMinuteLate(request.getRemoteAddr(),"MOBILE_SEND")){
            throw new VivasamException("9001", "1분안에 메시지를 두번 보낼수 없습니다.");
        }

        MemberResult result = new MemberResult();
        result.setCode("fail");
        // 1. 전화번호 값 확인
        if (org.apache.commons.lang3.StringUtils.isBlank(cellphone)) {
            result.setMsg("전화번호를 입력받지 못하였습니다.");
            return ResponseEntity.ok(result);
        }

        boolean duplicatePhone = memberService.saveMmsJoin(cellphone);
        if (duplicatePhone) {
            result.setMsg("이미 가입한 전화번호입니다.");
            return ResponseEntity.ok(result);
        }

        // 2. 인증번호 생성 후 문자 메세지 생성
        String randomNumber = org.apache.commons.lang3.RandomStringUtils.randomNumeric(6);
        String uuid = UUID.randomUUID().toString();
        String uuidRedisKey = uuid;
        if (!StringUtils.isEmpty(memberId)) {
            uuidRedisKey += memberId;
        }

        redisTemplate.opsForValue().set(uuidRedisKey, randomNumber);
        if(redisTemplate.opsForValue().get(uuidRedisKey) != null) {
            String msg = "[비바샘 인증번호] : " + randomNumber;

            // 3. DB insert
            SmsInfo sms = new SmsInfo();
            sms.setSubject("비바샘 인증번호");
            sms.setMsg(msg);
            sms.setPhone(cellphone);
            memberService.saveMms(sms);
        } else {
            throw new VivasamException("7001", "uuid 저장 실패");
        }

        //레디스에 보낸기록 저장
        userSendTempLog.saveUserSendLog(request.getRemoteAddr(),"MOBILE_SEND");


        // 5. 세션에 정보 입력
        result.setCode("success");
        result.setUuidForCertifiNum(uuid);
        return ResponseEntity.ok(result);
    }

    /**
     * 휴대폰 본인인증 확인 (check)
     */
    @PostMapping("/check/sns/sms")
    public ResponseEntity<?> checkCertifySms(HttpServletRequest request, @RequestBody MemberResult memberResult) {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        String clientCertifiNum = memberResult.getCertifiNum();
        String uuid = memberResult.getUuidForCertifiNum();
        String memberId = memberResult.getMemberId();

        if(StringUtils.isEmpty(clientCertifiNum)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        if (!StringUtils.isEmpty(memberId)) {
            uuid += memberId;
        }

        String originCertifiNum = (String) redisTemplate.opsForValue().get(uuid);
        if(originCertifiNum == null || StringUtils.isEmpty(originCertifiNum)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        if(!clientCertifiNum.equals(originCertifiNum)) {
            resultMap.put("code", "3");
            return ResponseEntity.ok(resultMap);
        }

        redisTemplate.opsForValue().set(uuid, "");

        return ResponseEntity.ok(resultMap);
    }


    @ResponseBody
    @GetMapping("/sns/check")
    public ResponseEntity<?> isMemberSnsCheck(
            @RequestParam(value = "cellphone", required = true) String cellphone,
            @RequestParam(value = "email", required = true) String email) {
        SnsLoginParameter snsLoginParameter = new SnsLoginParameter();
        snsLoginParameter.setPhoneNumber(cellphone);
        snsLoginParameter.setEmail(email);
        boolean memberSnsCheck = memberService.isMemberSnsCheck(snsLoginParameter);
        return ResponseEntity.ok(memberSnsCheck);
    }

    @ResponseBody
    @GetMapping("/sso/ipinci")
    public ResponseEntity<?> ssoIpinCiUpdate(@RequestParam(value = "isIpin", required = true) String isIpin,
                                             @CurrentUser UserPrincipal currentUser) {
        SnsLoginParameter snsLoginParameter = new SnsLoginParameter();
        snsLoginParameter.setIsIpin(isIpin);
        snsLoginParameter.setMemberId(currentUser.getMemberId());
        boolean result = memberService.upateIpinCi(snsLoginParameter);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/checkCertifiNumResetPwd")
    public ResponseEntity<?> checkCertifiNumResetPwd(HttpServletRequest request, @RequestBody FindPwd findPwd) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("code", "0");

        String clientCertifiNum = findPwd.getCertifiNum();
        if(StringUtils.isEmpty(clientCertifiNum)) {
            resultMap.put("code", "1");
            return ResponseEntity.ok(resultMap);
        }

        String uuid = findPwd.getUuidForCertifiNum();
        String memberId = findPwd.getMemberId();
        if (!StringUtils.isEmpty(memberId)) {
            uuid += memberId;
        }
        String originCertifiNum = (String) redisTemplate.opsForValue().get(uuid);
        if(originCertifiNum == null || StringUtils.isEmpty(originCertifiNum)) {
            resultMap.put("code", "2");
            return ResponseEntity.ok(resultMap);
        }

        if(!clientCertifiNum.equals(originCertifiNum)) {
            resultMap.put("code", "3");
            return ResponseEntity.ok(resultMap);
        }

        return ResponseEntity.ok(resultMap);
    }


    @PostMapping("/recoCode")
    @Secured("ROLE_USER")
    public ResponseEntity<?> registerRecoCode(@CurrentUser UserPrincipal currentUser) {
        if (currentUser == null || !StringUtils.hasText(currentUser.getMemberId())) {
            return ResponseEntity.ok("INVALID");
        }

        String memberId = currentUser.getMemberId();
        // 추천인 코드 조회
        String recommendationCode = memberRecommendationService.getRecommendationCode(memberId);
        if (recommendationCode == null) {
            // 동시성 문제로 insert시 DB 오류 발생할 경우 다시 시도 요청
            try {
                recommendationCode = memberRecommendationService.insertRecommendationCode(memberId);
            } catch (Exception e) {
                e.printStackTrace();

                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("code", "99");
                return ResponseEntity.ok(resultMap);
            }
        }

        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("code", "0");
        resultMap.put("recoCode", recommendationCode);
        resultMap.put("encoded", recommendationCode);
        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/updateMemberMTypeCd")
    public ResponseEntity<?> updateMemberMTypeCd(@RequestBody Map<String, String> requestParams) {

        int result = memberService.updateMemberMTypeCd(requestParams);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recommenderCheck")
    public ResponseEntity<Map<String, Object>> recommenderCheck(Model model, @RequestParam(value = "recommender", defaultValue = "") String recommender) {
        recommender = recommender.trim();

        Map<String, Object> resultMap = new HashMap<>();

        boolean valid = memberService.recommenderCheck(recommender);
        resultMap.put("code", valid ? "0" : "1");

        if (valid) {
            logger.info("추인 코드 있는지 여부 valid  : {}", valid);
            String existRecommend = memberService.existRecommender(recommender);

            String validYn = memberService.validYn(recommender);
            UserPrincipal currentUser = new UserPrincipal();
            currentUser.setMemberName(existRecommend); // 추천인 아이디를 memberName에 임시로 넣음

            logger.info(" 추천인 코드 존재 existRecommend : {}", existRecommend);
            logger.info(" 추천인 코드 존재 valid : {}", valid);
            logger.info(" 교사 인증 validYn : ", validYn);

            // 모든 회원 교사 인증 완료시 --> 검색 조회 가능하도록
            if ("N".equals(validYn) || validYn == null || validYn.isEmpty()) {
                // validYn이 null 인경우도 있어서 N 으로 넣어주기
                resultMap.put("existRecommendN", validYn != null ? validYn : "N");
            } else {
                resultMap.put("existRecommend", existRecommend);
                model.addAttribute("existRecommend", currentUser.getMemberName());
            }

        }


        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/sendTempPwd")
    public ResponseEntity<?> sendTempPwd(HttpServletRequest request, @RequestBody FindPwd findPwd) {
        String resultId = memberService.findPw(findPwd);

        if (StringUtils.isEmpty(resultId) || !resultId.equals(findPwd.getMemberId())) {
            throw new VivasamException("2002", "입력하신 정보와 일치하는 회원이 없습니다.\n다시 확인해 주세요");
        }else {
            boolean pwdNotExis = memberService.getMemberPasswordNotExistence(findPwd.getMemberId());

            //2024 02 21 페이스북 로그인 종료 페이스북 먼저 체크 안내메세지 출력
            String facebookCheck = memberService.getMemberSnsJoinInfo(findPwd.getMemberId());

            if("FACEBOOK".equals(facebookCheck)){
                MemberResult result = new MemberResult();
                result.setCode("success");
                result.setMsg("페이스북 로그인 서비스가 종료되어, 고객센터(1544-7714)로 문의주시면 임시 비밀번호를 발송해드리겠습니다.\n" +
                        "발급받은 임시비밀번호 로그인하여 기존과 동일하게 비바샘을 이용하실 수 있습니다.");

                return ResponseEntity.ok(result);
            }

            if (pwdNotExis) {
                // 회원의 정보중 패스워드가 없는경우 SNS회원가입으로 인식함
                List<SnsMemberInfo> snsMemberList = memberService.getSnsMemberList(findPwd.getMemberId());
                if (snsMemberList != null && snsMemberList.size() >= 1) {
                    // SNS 연동된 회원 정보가 존재하는경우
                    MemberResult result = new MemberResult();
                    result.setCode("success");
                    String msg = getSnsMsg(snsMemberList);
                    result.setMsg(msg + "(으)로 가입된 회원입니다.\n로그인 페이지에서 SNS 버튼을 통해 로그인해주세요.");

                    return ResponseEntity.ok(result);
                }
            }

            try {
                findPwd = memberService.sendCertificationNumByTempPwd(findPwd, request);
            } catch (Exception e) {
                logger.error(e.toString());
            }
        }

        return ResponseEntity.ok(findPwd);
    }
}