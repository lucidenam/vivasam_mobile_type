package edu.visang.vivasam.member.mapper;

import edu.visang.vivasam.member.model.*;
import edu.visang.vivasam.payload.LoginRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Mapper
public interface MemberMapper{

    public String AccountManageSignIn(@Param("memberId") String memberId);

    public int checkExistPerson(@Param("name") String name, @Param("email") String email);

    public int checkExistPersonEmail(@Param("memberId") String memberId, @Param("email") String email);

    public String checkExistId(@Param("id") String id);

    public String insertJoin(Map<String, String> param);

    public int updateMemberInfo(Map<String, String> param);

    public int updateMemberMTypeCd(Map<String, String> param);

    public String insertVmagazine(Map<String, String> params);

    public void updateSignInDateTime(String memberId);

    public void updateSsoSignInDateTime(String memberId);

    public String inactiveMovePersonal(@Param("isResting") String isResting, @Param("memberId") String memberId, @Param("password") String password);

    public int marketingAgreeInfoCheck(@Param("memberId") String memberId);

    public List<Map<String, String>> marketingAgreeInfoList(@Param("memberId") String memberId);

    public int marketingAgreeUpdate(MarketingAgree marketingAgree);
    public HashMap<String, String> marketingOldAgreeList(String memberId);
	public String getMailContent(HashMap<String, String> marketingInfo);

    public Map<String, String> findId(@Param("memberName") String memberName, @Param("certifyMethod") String certifyMethod, @Param("searchString") String searchString);

    public Map<String, String> findSleepId(@Param("memberName") String memberName, @Param("memberEmail") String memberEmail);

    public String findPw(FindPwd findPwd);

    public Map<String, String> findPwdIpin(FindPwd findPwd);

    public int resetMemberPwd(FindPwd findPwd);

    public MemberInfo getMemberInfo(@Param("memberId") String memberId);

    public int myInfoModify(HashMap<String, String> param);

    public void updateMemberVia(@Param("memberId") String memberId);

    public String checkCertifyCheck(@Param("memberId") String memberId);

    public int getMemberReqChk(@Param("memberId") String memberId);

    public int getMemberLoginfoCntForCheck(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int insertMemberLoginfoLog(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress, @Param("state") String state);

    public int delMemberLoginfo1(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int delMemberLoginfo2(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int getMemberLoginfoCntForAdd(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int updateMemberLoginfo(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int getMemberLoginfoCnt(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int insertMemberLoginfo(@Param("memberId") String memberId, @Param("jwt") String jwt, @Param("ipAddress") String ipAddress);

    public int getMemberModifyChk(@Param("memberId") String memberId);

    public void inserPwModifyLog(HashMap<String, String> params);



    /** SSO methods start - 2019.08.16 */

    public int setSsoMember(Map<String, String> param);

    public int setIpinCI(Map<String, String> params);

    public Map<String, String> getMemberAllByIpinCI(Map<String, String> param);

    public String getMemberByIpinCI(Map<String, String> param);

    public String getIpinCI(@Param("memberId") String memberId);

    public List<String> checkJoinedMember(@Param("name") String name, @Param("email") String email, @Param("cellphone") String cellphone);

    public MemberInfo getSsoMemberInfo(@Param("memberId") String memberId);

    //통합회원 여부 조회
    public String getSsoMemberByUserId(String memberId);

    /** SSO methods end */

    public String rMemberRequiredCheck(Map<String, String> param);

    public void iIdentificationResultLog(Map<String, String> param);

    public Map<String, Object> getEpkStatusInfo(@Param("memberId") String memberId);

    SnsMemberInfo getSnsMember(SnsLoginParameter parameter);

    List<String> checkSnsInfoUser(SnsLoginParameter parameter);

    int insertSnsMemberInfo(SnsLoginParameter parameter);

    void updateSnsMemberId(Map<String, String> param);

    String insertSnsJoin(Map<String, String> param);

    int updateMappinSnsMemberId(SnsLoginParameter parameter);

    boolean getMemberPasswordNotExistence(String memberId);

    boolean getSleepMemberPasswordNotExistence(String memberId);

    List<SnsMemberInfo> getSnsMemberList(String memberId);

    String getSleepMemberCellPhone(String memberId);

    int deleteSnsMemberInfo(SnsLoginParameter snsLoginParameter);

    String getMemberSnsJoinInfo(String memberId);

    void saveMms(SmsInfo smsInfo);

    int isMemberSnsCheck(SnsLoginParameter snsLoginParameter);

    int saveMmsJoin(String cellphone);

    int upateIpinCi(SnsLoginParameter snsLoginParameter);

    // 회원 교사 인증 여부 체크
    String getMemberTeacherCertifiedYn(String memberId);

    public String getMemberTeacherCertifiedCheckYn(@Param("memberId") String memberId);

    // 추천인코드 등록
    void updateMemberRecommenderCode(@Param("memberId") String memberId, @Param("recommenderCode") String recommenderCode);

    int updateMemberValidateEmail(MemberValidateEmail memberValidateEmail);

    int getMemberValidateEmailCnt(MemberValidateEmail memberValidateEmail);

    int updateMemberReCertify(Map<String, String> param);

    int insertMemberValidateLogInfo(Map<String, String> param);

    int updateMemberInfoOnlyViva(Map<String, String> param);

    void deleteMemberGradeInfoOnlyViva(String memberId);
	void insertMemberGradeInfoOnlyViva(MemberInfo memberInfo);

    String getWhalespaceSnsId(Map<String, Object> param);

    int updateWhalespaceSnsId(Map<String, Object> param);

    int recommenderCheck(String recommender);

    String existRecommender(String recommender);

    String validYn(String recommender);

    String selectRecommendId(String memberId);

    String findRecommendId(String memberId);

    HashMap<String, String> getMarketingAgreeInfo(Map<String, String> param);

    int saveMarketingInfoEach(MemberMarketingAgreeInfo param);

    int updateMemberUpdateSso(Map<String, String> param);

    int updateMemberMLevel(Map<String, String> param);

    int updateSnsIdForEncrypt(SnsLoginParameter parameter);

    int getMemberRetCnt(String memberId);

    String getMemberLoginInfo(LoginRequest loginRequest);

    void updateMemberRetCnt(LoginRequest loginRequest);

    void updateMemberPw(FindPwd findPwd);

    void updateMemberOldPassword(FindPwd findPwd);
}