package edu.visang.vivasam.common.mapper;

import org.apache.ibatis.annotations.Mapper;

import edu.visang.vivasam.common.model.SmsLog;

@Mapper
public interface CommonSmsMapper {
	int insertSmsLog(SmsLog parameter);
	int updateSmsLog(SmsLog parameter);
}
