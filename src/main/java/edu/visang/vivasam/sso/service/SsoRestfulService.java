package edu.visang.vivasam.sso.service;

import edu.visang.vivasam.sso.vo.ParamVo;
import edu.visang.vivasam.sso.mapper.SsoRestfulMapper;
import edu.visang.vivasam.sso.vo.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SsoRestfulService {

	@Autowired
	SsoRestfulMapper ssoRestfulMapper;

	public Integer updateSsoMemPassWd(ParamVo param) {
		return ssoRestfulMapper.updateSsoMemPassWd(param);
	}

	public Status updateMemberDirectChange(ParamVo param){

		Status sts =	 new Status(true, 404, "fail", "member update fail");
		int return_value=0;
		param.setUsername(param.getV_AfterID());
		String beforeID=param.getV_BeforeID();
		String afterID=param.getV_AfterID();

		try {
			ParamVo r_vo=ssoRestfulMapper.selectId(param);
			if(r_vo == null)
			{
				param.setReturnIntValue(0);
				return_value = ssoRestfulMapper.updateMemberDirectChange(param);



				return new Status(200, "success", "success");
			}else
			{
				if(param.getV_AfterID().equals(param.getV_AfterID()))
				{
					return new Status(true, 404, "fail", "BeforeID equals AfterID");
				}
				else
				{
					return new Status(true, 404, "fail", "AfterID duplication");
				}

			}
		} catch (Exception e) {
			param.setProc_gn("realtime");
			param.setFail_log(e.toString());
			ssoRestfulMapper.insertToidAsidFailLog(param);
		//	param.setV_AfterID(beforeID);
		//	param.setV_BeforeID(afterID);
		//	ssoRestfulMapper.updateMemberDirectChange(param);
			return_value=-1;



			return new Status(true, 404, "fail", "member update fail");
		}
	}


    public Map<String,Object> updateMemberDirectChange_process(ParamVo param )
    {
        String  return_int="0";
        Map<String,Object> returnMap= new HashMap<String,Object>();
        //Map<String,Object> returnMa= new HashMap<String,Object>();
        Map<String, String> logMap = new HashMap<String, String>();
        logMap.put("after_id", param.getV_AfterID());
        logMap.put("before_id", param.getV_BeforeID());
        logMap.put("change_gb", "direct");
        logMap.put("change_method_method", "updateMemberDirectChange");
        param.setUsername(param.getV_BeforeID());
       // ParamVo r_vo1=ssoRestfulMapper.selectId(param);

        Map<String,Object> r_vo=ssoRestfulMapper.selectCheckChange(param);
        if("N".equals(r_vo.get("after_id_exist").toString())                  //to_be 아이디 존재여부 : 없어야함.
                &&"N".equals(r_vo.get("before_id_rest_exist").toString())     //as_is 아이디 휴면 존재여부 : 없어야함.
                && "N".equals(r_vo.get("ci_rest_yn").toString())              //ci 휴면 존재여부 : 없어야함.
        )
        {
            //return_value = srd.updateMemberDirectChange(param);

            ssoRestfulMapper.updateMemberDirectChange01(param);
            //logMap.put("change_seq", "01");
           // ssoRestfulMapper.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange02(param);
            logMap.put("change_seq", "02");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange03(param);
            logMap.put("change_seq", "03");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange04(param);
            logMap.put("change_seq", "04");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange05(param);
            logMap.put("change_seq","05");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange06(param);
            logMap.put("change_seq","06");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange07(param);
            logMap.put("change_seq", "07");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange08(param);
            logMap.put("change_seq", "08");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange09(param);
            logMap.put("change_seq", "09");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange10(param);
            logMap.put("change_seq", "10");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange11(param);
            logMap.put("change_seq", "11");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange12(param);
            logMap.put("change_seq","12");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange13(param);
            logMap.put("change_seq", "13");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange14(param);
            logMap.put("change_seq", "14");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange15(param);
            logMap.put("change_seq", "15");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange16(param);
            logMap.put("change_seq", "16");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange17(param);
            logMap.put("change_seq", "17");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange18(param);
            logMap.put("change_seq", "18");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange19(param);
            logMap.put("change_seq", "19");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange20(param);
            logMap.put("change_seq", "20");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange21(param);
            logMap.put("change_seq", "21");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange22(param);
            logMap.put("change_seq", "22");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange23(param);
            logMap.put("change_seq", "23");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange24(param);
            logMap.put("change_seq", "24");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange25(param);
            logMap.put("change_seq", "25");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange26(param);
            logMap.put("change_seq", "26");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange27(param);
            logMap.put("change_seq", "27");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange28(param);
            logMap.put("change_seq", "28");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange29(param);
            logMap.put("change_seq", "29");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange30(param);
            logMap.put("change_seq", "30");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange31(param);
            logMap.put("change_seq", "31");
            //srd.insertChangeLog(logMap);
            ssoRestfulMapper.updateMemberDirectChange32(param);
            logMap.put("change_seq", "32");
            //srd.insertChangeLog(logMap);

            return_int="1";

            //returnMap.put("return_value",return_int);
            //returnMap.put("afterid_yn","N");
            //returnMap.put("beforeid_rest_yn","N");
            //returnMap.put("ci_rest_yn","N");
            //returnMap.put("afterID_yn","N");
            logMap.put("change_method_method", "CHANG_SUCCESS");
            logMap.put("change_seq", "500");
          //  srd.insertChangeLog(logMap);

            returnMap.put("return_int","1");
            //	throw new RuntimeException();
            //	return new Status(200, "success", "success");
        } else {
            return_int="0";
            returnMap.put("return_int",return_int);

            logMap.put("change_method_method", "member_id change fail !");
            logMap.put("change_seq", "600");
          //  srd.insertChangeLog(logMap);




            if(	"Y".equals(r_vo.get("after_id_exist").toString())                  //to_be 아이디 존재여부 : 없어야함.
            )
            {
                returnMap.put("afterid_yn","Y");
                logMap.put("change_method_method", "afterId is exist!");
                logMap.put("change_seq", "601");
              //  ssoRestfulMapper.insertChangeLog(logMap);
            }

            if(
                    "Y".equals(r_vo.get("before_id_rest_exist").toString())     //as_is 아이디 휴면 존재여부 : 없어야함.
            )
            {
                returnMap.put("beforeid_rest_yn","Y");
                logMap.put("change_method_method", "beforeid_rest_yn is exist in rest !");
                logMap.put("change_seq", "602");
              //  ssoRestfulMapper.insertChangeLog(logMap);
            }

            if(
                    "Y".equals(r_vo.get("ci_rest_yn").toString())              //ci 휴면 존재여부 : 없어야함.
            )
            {
                returnMap.put("ci_rest_yn","Y");
                logMap.put("change_method_method", "ci is exist in rest !");
                logMap.put("change_seq", "603");
               // ssoRestfulMapper.insertChangeLog(logMap);
            }

        }

        return returnMap;
    }
    public Integer insertToidAsidFailLog(ParamVo param) {
        // TODO Auto-generated method stub

        return ssoRestfulMapper.insertToidAsidFailLog(param);
    }
}
