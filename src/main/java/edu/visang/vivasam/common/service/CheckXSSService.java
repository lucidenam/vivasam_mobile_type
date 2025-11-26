package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.CheckXSSMapper;
import edu.visang.vivasam.common.utils.VivasamUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.Iterator;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class CheckXSSService {

    @Autowired
    CheckXSSMapper checkXSSMapper;

    /**
     * 2017-11-12 추가 INTERCODE
     * 파라미터 전체를 Map으로 받아서 통채로 검사
     * @param request
     * @param paramName
     * @param paramValue
     * @return
     * @throws Exception
     */
    public String ReplaceValue(HttpServletRequest request, String paramName, String paramValue) {
        String returnStr = "";
        if ("".equals(VivasamUtil.isNull(paramValue))) {
            return returnStr;
        }

        returnStr = paramValue;
        returnStr = VivasamUtil.replace(returnStr, "'", "''");
        returnStr = returnStr.trim();

        if (CheckXSS(returnStr)) {

            returnStr = returnStr.replaceAll("(?i)script", "")
                    .replaceAll("(?i)iframe", "")
                    .replaceAll("(?i)frameset", "")
                    .replaceAll("(?i)onmouse", "")
                    .replaceAll("(?i)onerror", "")
                    .replaceAll("(?i)embed", "");

        }

        if (Check_SQLInjection(request, paramName, paramValue)) {

            returnStr = returnStr.replaceAll("(?i)select", "")
                    .replaceAll("(?i)sp_cacreate", "")
                    .replaceAll("(?i)create", "")
                    .replaceAll("(?i)delete", "")
                    .replaceAll("(?i)update", "")
                    .replaceAll("(?i)insert", "")
                    .replaceAll("(?i)drop ", "")
                    .replaceAll("(?i)drop\\(", "")              // 괄호는 패턴에서 예약 문자이므로 앞에 \\를 붙여줘야 괄호를 이용하는 패턴에서 사용할 수 있다
                    .replaceAll("(?i)execmaster", "")
                    .replaceAll("(?i)exec", "")
                    .replaceAll("(?i)xp_cmdshell", "")
                    .replaceAll("(?i)shutdown", "")
                    .replaceAll("(?i)kill", "")
                    .replaceAll("(?i)truncate", "")

                    .replaceAll("(?i)netlocalgroupadministratthens", "");

        }

        return returnStr;
    }


    public String ReplaceValueNoSingleQuote(HttpServletRequest request, String paramName, String paramValue) {
        String returnStr = "";
        if ("".equals(VivasamUtil.isNull(paramValue))) {
            return null;
        }

        returnStr = paramValue;
        returnStr = returnStr.trim();

        if (CheckXSS(returnStr)) {

            returnStr = returnStr.replaceAll("(?i)script", "")
                    .replaceAll("(?i)iframe", "")
                    .replaceAll("(?i)frameset", "")
                    .replaceAll("(?i)onmouse", "")
                    .replaceAll("(?i)onerror", "")
                    .replaceAll("(?i)embed", "");

        }

        if (Check_SQLInjection(request, paramName, paramValue)) {

            returnStr = returnStr.replaceAll("(?i)select", "")
                    .replaceAll("(?i)sp_cacreate", "")
                    .replaceAll("(?i)create", "")
                    .replaceAll("(?i)delete", "")
                    .replaceAll("(?i)update", "")
                    .replaceAll("(?i)insert", "")
                    .replaceAll("(?i)drop ", "")
                    .replaceAll("(?i)drop\\(", "")              // 괄호는 패턴에서 예약 문자이므로 앞에 \\를 붙여줘야 괄호를 이용하는 패턴에서 사용할 수 있다
                    .replaceAll("(?i)execmaster", "")
                    .replaceAll("(?i)exec", "")
                    .replaceAll("(?i)xp_cmdshell", "")
                    .replaceAll("(?i)shutdown", "")
                    .replaceAll("(?i)kill", "")
                    .replaceAll("(?i)truncate", "")

                    .replaceAll("(?i)netlocalgroupadministratthens", "");

        }

        return returnStr;
    }

    public Map<String, String[]> ReplaceValue(HttpServletRequest request) throws Exception {
        // TODO Auto-generated method stub
        Map<String, String[]> result = request.getParameterMap();
        Iterator<String> iterator = result.keySet().iterator();
        while (iterator.hasNext()) {
            String key = (String) iterator.next();
            String[] val = result.get(key);
            int length = val.length;
            for (int i = 0; i < length; i++) {
                val[i] = ReplaceValue(request, key, val[i]);
            }
            result.put(key, val);
        }
        return result;
    }

    //2017-11-12 추가 INTERCODE
    public Map ReplaceValue(HttpServletRequest request, Map param) throws Exception {
        Iterator<String> iterator = param.keySet().iterator();
        while (iterator.hasNext()) {
            String key = (String) iterator.next();

            //파라미터가 배열일때
            if(param.get(key) instanceof String[]){
                String vals[] = (String[])param.get(key);
                int i = 0;
                for(String val : vals){
                    val = this.ReplaceValue(request, key, val);
                    vals[i++] = val;
                }

                param.put(key, vals);

            }else{
                String val = param.get(key).toString();
                val = this.ReplaceValue(request, key, val);

                param.put(key, val);
            }
        }
        return param;
    }

    private boolean CheckXSS(String param) {
        boolean isXSS = false;
        String temp = param;
        temp = temp.toUpperCase();
        temp = VivasamUtil.replace(temp, " ", "");
        temp = VivasamUtil.replace(temp, "&#x09", "");
        temp = VivasamUtil.replace(temp, "&#x0A", "");
        temp = VivasamUtil.replace(temp, "&#x0D", "");

        if ((temp.indexOf("SCRIPT") == -1) && (temp.indexOf("IFRAME") == -1) && (temp.indexOf("FRAMESET") == -1) && (temp.indexOf("+ONMOUSEOVER=") == -1) && (temp.indexOf("ONERROR") == -1)
                && (temp.indexOf("EMBED") == -1)) {
            isXSS = false;
        } else {
            isXSS = true;
        }

        return isXSS;
    }

    private boolean Check_SQLInjection(HttpServletRequest request, String paramName, String paramValue) {
        boolean Check = false;
        int cnt = 0;
        String checkcode = "SIJ";
        String temp = paramValue;

        temp = temp.toUpperCase();
        if ((temp.indexOf("'") > -1) || (temp.indexOf("\"\"") > -1)) {
            cnt = cnt + 1;
            checkcode = checkcode + ",1";
        }
        if (temp.indexOf(" OR ") > -1) {
            cnt = cnt + 2;
            checkcode = checkcode + ",2";
        }
        if (temp.indexOf("--") > -1) {
            cnt = cnt + 2;
            checkcode = checkcode + ",3";
        }

        if ((temp.indexOf("SELECT") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",4";
        }

        if ((temp.indexOf("CREATE") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",5";
        }

        if ((temp.indexOf("DELETE") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",6";
        }

        if ((temp.indexOf("UPDATE") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",7";
        }

        if ((temp.indexOf("INSERT") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",8";
        }

        if ((temp.indexOf("DROP") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",9";
        }

        if ((temp.indexOf("EXEC") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",10";
        }

        if (temp.indexOf("XP_CMDSHELL") > -1) {
            cnt = cnt + 3;
            checkcode = checkcode + ",11";
        }

        if (temp.indexOf("SP_OACREATE") > -1) {
            cnt = cnt + 3;
            checkcode = checkcode + ",12";
        }

        if ((temp.indexOf("SHUTDOWN") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",13";
        }

        if ((temp.indexOf("ISHOTKILL") > -1) && (temp.indexOf("KILL") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",14";
        }

        if ((temp.indexOf("TRUNCATE") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",15";
        }

        if (temp.indexOf("EXECMASTER") > -1) {
            cnt = cnt + 3;
            checkcode = checkcode + ",16";
        }

        if (temp.indexOf("NETLOCALGROUPADMINISTRATTHENS") > -1) {
            cnt = cnt + 3;
            checkcode = checkcode + ",17";
        }

        if ((temp.indexOf("DROP") > -1) && ((temp.indexOf(" ") > -1) || (temp.indexOf("%20") > -1))) {
            cnt = cnt + 3;
            checkcode = checkcode + ",18";
        }

        if (cnt < 3) {            // 정상
            Check = false;
        } else {
            Check = true;
            // 로그 생성
            String Remote_IP = request.getRemoteAddr();
            String Server_IP = request.getLocalAddr();
            String Server_Name = request.getServerName();
            String Join_Link = request.getRequestURI().trim();
            String port_no = request.getServerPort() == 80 ? "" : String.valueOf(request.getServerPort());
            String scheme = request.getScheme();

            // temp는 위에서 toUpperCase() 함수를 통하여 대문자로 변환이 되어버렸기 때문에 사용자가 입력한 값이 유지가 되지 않은 상태다
            // 그래서 paramValue값을 다시 넣음으로써 사용자가 입력한 값으로 환원한 뒤에 replace를 해준다
            temp = paramValue;
            temp = temp.replaceAll("--", "**").replaceAll(";", "|").replaceAll("'", "''");

            checkXSSMapper.insertLog(Remote_IP, Server_IP, Server_Name, Join_Link, paramName, temp, checkcode, port_no, scheme);
        }

        return Check;
    }
}
