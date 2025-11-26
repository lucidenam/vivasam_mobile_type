package edu.visang.vivasam.common.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.Map;

@Mapper
public interface EmailMapper {

	Map<String,Object> selectJoinMailContent(Map<String, Object> map);

	void inserJoinMailSendLog(Map<String, Object> sendMailInfo);

	Map<String,Object> selectAgreeMailContent(Map<String, String> map);
}
