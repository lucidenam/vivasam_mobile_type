package edu.visang.vivasam.device.mapper;

import edu.visang.vivasam.device.model.AppToken;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppTokenMapper {

    int saveAppToken(AppToken appToken);

    int updateAppToken(AppToken appToken);

    String findByToken(String token);

    int findByMemberId(String memberId);
}

