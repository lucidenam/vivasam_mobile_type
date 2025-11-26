package edu.visang.vivasam.common.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CheckXSSMapper {
    public void insertLog(String remote_ip, String server_ip, String server_name, String join_link, String param_name, String param_value, String code, String port_no, String scheme);
}
