package edu.visang.vivasam.myInfo.service;

import edu.visang.vivasam.api.ApiConnectionUtil;
import edu.visang.vivasam.api.data.ApiInputData;
import edu.visang.vivasam.api.data.ApiOutputData;
import edu.visang.vivasam.common.elasticlogin.ElasticLoginClient;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.member.mapper.MemberMapper;
import edu.visang.vivasam.member.model.MemberInfo;
import edu.visang.vivasam.member.model.SnsLoginParameter;
import edu.visang.vivasam.member.service.MemberMileageService;
import edu.visang.vivasam.myInfo.mapper.AdminMemberMapper;
import edu.visang.vivasam.myInfo.mapper.MyInfoMapper;
import edu.visang.vivasam.myInfo.model.AdminLogParameter;
import edu.visang.vivasam.myInfo.model.MyInfoLeave;
import edu.visang.vivasam.myInfo.model.SsoCellphoneUpdateLog;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MyInfoService {

    private static final Logger logger = LoggerFactory.getLogger(MyInfoService.class);

    @Autowired
    MyInfoMapper myInfoMapper;
    
    @Autowired
    MemberMapper memberMapper;

    @Autowired
    AdminMemberMapper adminMemberMapper;

    @Autowired
    Environment environment;

    @Autowired
    MemberMileageService memberMileageService;

    public int checkPwd(String oldPwd, String memberId) {
        return myInfoMapper.checkPwd(oldPwd, memberId);
    }

    public int changePwd(String newPwd, String memberId) {
        return myInfoMapper.changePwd(newPwd, memberId);
    }


    /**
     * 통합 회원 비밀번호 변경
     */
    @Transactional
    public int changeSsoPwd( String newPwd , String memberId, String isSsoMemberYN, Boolean isFindPwd) {

        int result = 0;

        if ("Y".equals(isSsoMemberYN)) {
            ApiInputData apiParam = new ApiInputData();
            apiParam.setMemberId(memberId);
            apiParam.setMemberPassword(newPwd);

            try {
                ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .updateUserPassword(apiParam);
                if (output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200) {
                    result = 1;
                }
            }catch(Exception e) {
                result = -1;
            }
        } else {
            result = myInfoMapper.changePwd(newPwd, memberId);
        }

        // 비밀번호 찾기 페이지일때만 실행
        if(isFindPwd) {
            // 동일한 아이디로 어드민 계정이 있다면 해당 계정도 동일한 비번으로 변경
            if (adminMemberMapper.selectAdmMemberCnt(memberId) > 0) {
                int admResult = adminMemberMapper.updateAdmMemberPwdSha2(newPwd, memberId);
                if (admResult > 0) {
                    HttpServletRequest request =
                            ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                                    .getRequest();

                    AdminLogParameter adminLogParameter = new AdminLogParameter();
                    adminLogParameter.setMemberId(memberId);
                    adminLogParameter.setIpAddress(VivasamUtil.getClientIP(request));
                    adminLogParameter.setAction("로그인");
                    adminLogParameter.setTarget(memberId);
                    adminLogParameter.setLogState("S");

                    adminMemberMapper.insertAdmLog(adminLogParameter);
                }
            }
        }

        return result;
    }


    public int changeMySchoolInfo(String memberId, String fkareacode, String fkbranchcode, Integer schCode, String schName) {
        if (StringUtils.isBlank(memberId)
                || StringUtils.isBlank(fkareacode)
                || StringUtils.isBlank(fkbranchcode)
                || schCode == null
                || StringUtils.isBlank(schName)) return 0 ;

        return myInfoMapper.updateSchoolInfo(memberId, fkareacode, fkbranchcode, schCode, schName);
    }

    /**
     * 휴대폰 정보 변경, SSO 멤버일 경우 tschool과 sso 측에도 변경
     * @param memberId 사용자 아이디 
     * @param cellphone 휴대폰 번호
     */
    @Async
    public void changeCellphoneAsync(String memberId, String cellphone) {
        
        // 1. 비바샘 업데이트
        try {
            myInfoMapper.updateCellphone(memberId, cellphone);
        } catch (Exception e) {
            e.printStackTrace();
            return; // 에러 발생시 작업 종료
        }

        // 2. 통합회원일 경우 tschool과 sso 측 cellphone 번호 변경
        MemberInfo memberInfo = memberMapper.getSsoMemberInfo(memberId);
        if (memberInfo != null && "1".equals(memberInfo.getSsoMember())) {

            // 2.1. UpdateLog 등록
            SsoCellphoneUpdateLog ssoCellphoneUpdateLog = new SsoCellphoneUpdateLog(memberId, cellphone);
            myInfoMapper.insertSsoCellphoneUpdateLog(ssoCellphoneUpdateLog);
            Long logId = ssoCellphoneUpdateLog.getId();
            
            // 2.2. sso 정보 변경
            ElasticLoginClient client = new ElasticLoginClient();
            
            Map<String, String> ssoParam = new HashMap<>();
            ssoParam.put("ssoId", memberId);
            ssoParam.put("email", memberInfo.getEmail());
            ssoParam.put("ci", memberInfo.getIpinCi());
            ssoParam.put("memberName", memberInfo.getName());
            ssoParam.put("sex", memberInfo.getSex());
            ssoParam.put("birth", memberInfo.getBirth());
            ssoParam.put("cellphone", cellphone);
            ssoParam.put("thirdMarketingAgree", memberInfo.getThirdMarketingAgree());
            ssoParam.put("expiryTermNum", memberInfo.getExpiryTermNum());
            
            boolean tResult = client.updateUser(ssoParam);
            if (tResult) {
                myInfoMapper.updateSsoCellphoneUpdateLogTschool(logId, "Y");
            } else {
                myInfoMapper.updateSsoCellphoneUpdateLogTschool(logId, "N");
                return;
            }

            // 2.3. tschool 변경
            Map<String, String> tschoolParam = new HashMap<>();
            tschoolParam.put("memberName", memberInfo.getName());
            tschoolParam.put("email", memberInfo.getEmail());
            tschoolParam.put("cellphone", cellphone);
            tschoolParam.put("ci", memberInfo.getIpinCi());
            tschoolParam.put("expiryTermNum", memberInfo.getExpiryTermNum());
            tschoolParam.put("birth", memberInfo.getBirth());
            
            boolean ssoResult = client.updateTuser(memberId, tschoolParam, false);
            if (ssoResult) {
                myInfoMapper.updateSsoCellphoneUpdateLogSso(logId, "Y");
            } else {
                myInfoMapper.updateSsoCellphoneUpdateLogSso(logId, "N");
                return;
            }

            // 2.4 변경작업 성공시 UpdateLog 삭제
            myInfoMapper.deleteSsoCellphoneUpdateLog(logId);
        }
    }

    /**
     * 탈퇴 사유 리스트 출력
     * @return
     */
    public List<MyInfoLeave> getMemberLeaveMessage() {
        return myInfoMapper.getMemberLeaveMessage();
    }

    /**
     * 회원 탈퇴
     * @param parameter
     * @return
     * @throws Exception
     */
    @Transactional
    public boolean leaveSsoMember(MyInfoLeave parameter) throws Exception {

        // 통합 회원인 경우
        if("1".equals(parameter.getSsoMember())) {
            ApiInputData apiParam = new ApiInputData();
            apiParam.setMemberId(parameter.getDomMemberId());
            apiParam.setDomId(String.valueOf(parameter.getDomId()));
            apiParam.setDomMessage(parameter.getDomMessage());
            //탈퇴사유 등록 해야됨
            try {
                ApiOutputData output = new ApiConnectionUtil(environment.getProperty("api.key"), environment.getProperty("api.ver"), environment.getProperty("api.url"))
                        .leaveUser(apiParam);

                if(output != null && !output.getStatus().isError() && output.getStatus().getCode() == 200 ) {
                    // 회원가입시 추천인 아이디 있으면 추천인 마일리지 차감
                    memberMileageService.saveRecoIdMileageMinus(parameter);
                    // MEMBER_GRADE 테이블 데이터 삭제처리 진행
					memberMapper.deleteMemberGradeInfoOnlyViva(parameter.getDomMemberId());
                    return true;
                }else {
                    throw new Exception();
                }
            }catch(Exception e) {
                throw new Exception();
            }
        } else {

            int logResult = myInfoMapper.saveMemberLeaveLog(parameter);
            if(logResult == 0) {
                throw new Exception();
            }

            int leaveResult = myInfoMapper.updateMemberLeave(parameter);
            if(leaveResult == 0) {
                throw new Exception();
            }

            // SNS 로그인 가입자의 경우 -> 회원정보 삭제
            SnsLoginParameter snsLoginParameter = new SnsLoginParameter();
            snsLoginParameter.setMemberId(parameter.getDomMemberId());
            myInfoMapper.updateSnsMemberLeave(parameter.getDomMemberId());
            memberMileageService.saveRecoIdMileageMinus(parameter);

            // MEMBER_GRADE 테이블 데이터 삭제처리 진행
            memberMapper.deleteMemberGradeInfoOnlyViva(parameter.getDomMemberId());
        }

        return true;
    }

    public MemberInfo getPrivateMemberInfo(String memberId) {
        return myInfoMapper.getPrivateMemberInfo(memberId);
    }

    public String getEncodeNewPassword(String newPwd) {
        return myInfoMapper.getEncodeNewPassword(newPwd);
    }

    public void updateChangeOldPwd(String memberId) {
        myInfoMapper.updateChangeOldPwd(memberId);
    }
}
