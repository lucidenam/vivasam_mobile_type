package edu.visang.vivasam.myInfo.mapper;

import edu.visang.vivasam.myInfo.model.AdminLogParameter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminMemberMapper {
    public int selectAdmMemberCnt(String memberId);

    public int updateAdmMemberPwdSha2(@Param("newPwd") String newPwd, @Param("memberId") String memberId);

    public int insertAdmLog(AdminLogParameter parameter);
}
