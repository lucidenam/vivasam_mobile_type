package edu.visang.vivasam.sso.mapper;

import edu.visang.vivasam.sso.vo.ParamVo;
import org.apache.ibatis.annotations.Mapper;

import java.util.Map;

@Mapper
public interface SsoRestfulMapper {

	public ParamVo selectId(ParamVo param);
	
	public Integer updateSsoMemPassWd(ParamVo param);

	public Integer insertToidAsidFailLog(ParamVo param);

	public Integer updateMemberDirectChange(ParamVo param);


    public Integer updateMemberDirectChange01(ParamVo param);

    public Integer updateMemberDirectChange02(ParamVo param);

    public Integer updateMemberDirectChange03(ParamVo param);

    public Integer updateMemberDirectChange04(ParamVo param);

    public Integer updateMemberDirectChange05(ParamVo param);

    public Integer updateMemberDirectChange06(ParamVo param);

    public Integer updateMemberDirectChange07(ParamVo param);

    public Integer updateMemberDirectChange08(ParamVo param);

    public Integer updateMemberDirectChange09(ParamVo param);

    public Integer updateMemberDirectChange10(ParamVo param);

    public Integer updateMemberDirectChange11(ParamVo param);

    public Integer updateMemberDirectChange12(ParamVo param);

    public Integer updateMemberDirectChange13(ParamVo param);

    public Integer updateMemberDirectChange14(ParamVo param);

    public Integer updateMemberDirectChange15(ParamVo param);

    public Integer updateMemberDirectChange16(ParamVo param);

    public Integer updateMemberDirectChange17(ParamVo param);

    public Integer updateMemberDirectChange18(ParamVo param);

    public Integer updateMemberDirectChange19(ParamVo param);

    public Integer updateMemberDirectChange20(ParamVo param);

    public Integer updateMemberDirectChange21(ParamVo param);

    public Integer updateMemberDirectChange22(ParamVo param);

    public Integer updateMemberDirectChange23(ParamVo param);

    public Integer updateMemberDirectChange24(ParamVo param);

    public Integer updateMemberDirectChange25(ParamVo param);

    public Integer updateMemberDirectChange26(ParamVo param);

    public Integer updateMemberDirectChange27(ParamVo param);

    public Integer updateMemberDirectChange28(ParamVo param);

    public Integer updateMemberDirectChange29(ParamVo param);

    public Integer updateMemberDirectChange30(ParamVo param);

    public Integer updateMemberDirectChange31(ParamVo param);

    public Integer updateMemberDirectChange32(ParamVo param);

    public Integer updateMemberDirectChange33(ParamVo param);

    public Map<String,Object> selectCheckChange(ParamVo param) ;



}
