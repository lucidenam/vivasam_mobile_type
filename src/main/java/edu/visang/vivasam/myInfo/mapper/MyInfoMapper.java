package edu.visang.vivasam.myInfo.mapper;

import edu.visang.vivasam.member.model.MemberInfo;
import edu.visang.vivasam.myInfo.model.MyInfoLeave;
import edu.visang.vivasam.myInfo.model.SsoCellphoneUpdateLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyInfoMapper {

    public int checkPwd(@Param("oldPwd") String oldPwd, @Param("memberId") String memberId);

    public int changePwd(@Param("newPwd") String newPwd, @Param("memberId") String memberId);

    
    int updateSchoolInfo(@Param("memberId") String memberId, @Param("fkareacode") String fkareacode, @Param("fkbranchcode") String fkbranchcode, @Param("schCode") Integer schCode, @Param("schName") String schName);
    
    void updateCellphone(@Param("memberId") String memberId, @Param("cellphone") String cellphone);
    
    void insertSsoCellphoneUpdateLog(SsoCellphoneUpdateLog updateLog);
    
    void updateSsoCellphoneUpdateLogTschool(@Param("id") Long logId, @Param("tschoolYn") String tschoolYn);
    
    void updateSsoCellphoneUpdateLogSso(@Param("id") Long logId, @Param("ssoYn") String ssoYn);
    
    void deleteSsoCellphoneUpdateLog(@Param("id") Long logId);

    List<MyInfoLeave> getMemberLeaveMessage();

    int saveMemberLeaveLog(MyInfoLeave parameter);

    int updateMemberLeave(MyInfoLeave parameter);

    int updateSnsMemberLeave(String domMemberId);

    MemberInfo getPrivateMemberInfo(String memberId);

    String getEncodeNewPassword(String newPwd);

    void updateChangeOldPwd(String memberId);
}
