package edu.visang.vivasam.security.mapper;


import edu.visang.vivasam.security.Passwords;
import edu.visang.vivasam.security.UserPrincipal;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface SecurityMapper {
    public Passwords encode(@Param("password") String password);
    public UserPrincipal findByUserId(@Param("memberId")String memberId);
    public void changeMemberPwdSha2(@Param("memberId") String memberId,@Param("password") String password);
    public Map<String,String> checkVaildEndDate(@Param("memberId")String memberId);
}
