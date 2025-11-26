package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.LogSignIn;
import edu.visang.vivasam.common.model.LogToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LogMapper {
    public int logSignIn(LogSignIn logSignIn);

    public int logMaterialView(@Param("memberId") String memberId, @Param("contentId") String contentId);

    int tokenGenerate(LogToken logToken);

    int deleteTokenByMemberId(String userId);

    String selectMemberIdFromSessionId(String sessId);
}
