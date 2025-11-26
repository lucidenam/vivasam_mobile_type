package edu.visang.vivasam.common.mapper;

import edu.visang.vivasam.common.model.EmailLogParameter;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmailLogMapper {
    int insertEmailLog(EmailLogParameter parameter);
    int updateEmailLog(EmailLogParameter parameter);
}
