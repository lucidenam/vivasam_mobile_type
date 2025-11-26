package edu.visang.vivasam.common.controller;

import edu.visang.vivasam.common.service.SoobakcService;
import edu.visang.vivasam.common.model.MetaCode;
import edu.visang.vivasam.common.utils.StringEncrypter;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/soobakc")
public class SoobakcController {

    private static final Logger logger = LoggerFactory.getLogger(SoobakcController.class);

    @Autowired
    SoobakcService soobakcService;

    @RequestMapping(value="/getSoobakcList")
    public List<Map<String, Object>> getLectureList(@RequestBody Map<String, String> requestParams) throws Exception {
        /**
         *  @ACTION_TYPE : LEC_LISTE - 초등, LEC_LIST - 중등, LEC_LISTH - 고등, LECTURE_LIST - 강의 리스트
         * 	@FKSUB			VARCHAR(10)=''	--과목명
         * 	초등 : '국어', '영어', '수학', '사회', '과학'
         * 	중등 : '국어', '영어', '수학', '사회', '역사', '과학'
         * 	고등 : '국어', '영어', '수학', '사회/역사', '한국사', '과학'
         * 	@SJCODE		VARCHAR(10)=''	--과목번호
         * 	초등 : 0, 1, 2, 10, 3
         * 	중등 : 0, 1, 2, 10, 4, 3
         * 	고등 : 0, 1, 2, 10, 4, 3
         * 	@LECTURECD		VARCHAR(10)=''	--강의코드
         * 	@LECCNT		INT=0	--강의수
         * 	@grade		INT=0	--학년
         * 	초등 : 5, 6
         */

        String actionType = null;
        String fkSub = null;
        String sjCode = null;
        Integer lecCnt = null;
        Integer grade = null;

        if(requestParams.get("0") != null) actionType = requestParams.get("0");
        if(requestParams.get("1") != null) fkSub = requestParams.get("1");
        if(requestParams.get("2") != null) sjCode = requestParams.get("2");
        if(requestParams.get("3") != null) lecCnt = Integer.parseInt(requestParams.get("3"));
        if(requestParams.get("4") != null) grade = Integer.parseInt(requestParams.get("4"));

        //{CALL SP_SOOBAKC_LEC_LIST(#{ACTION_TYPE}, #{FKSUB}, #{SJCODE}, #{LECTURECD}, #{LECCNT}, #{GRADE})}
        Map<String, Object> requestMap = new HashMap<String, Object>();
        requestMap.put("ACTION_TYPE", actionType);
        requestMap.put("FKSUB", fkSub);
        requestMap.put("SJCODE", sjCode);
        requestMap.put("LECCNT", lecCnt);
        requestMap.put("GRADE", grade);

        return soobakcService.getSoobakcList(requestMap);
    }

    @RequestMapping(value="/getSoobakcInfo")
    public Map<String, Object> getSoobakcInfo(@RequestBody Map<String, String> requestParams) throws Exception {
        String lectureCd = null;
        String lpIdx = null;
        String type = null;
        Integer grade = null;

        if(requestParams.get("0") != null) lectureCd = requestParams.get("0");
        if(requestParams.get("1") != null) lpIdx = requestParams.get("1");
        if(requestParams.get("2") != null) type = requestParams.get("2");
        if(requestParams.get("3") != null) grade = Integer.parseInt(requestParams.get("3"));

        Map<String, Object> requestMap = new HashMap<String, Object>();
        requestMap.put("ACTION_TYPE", type);
        requestMap.put("GRADE", grade);

        List<Map<String, Object>> list = soobakcService.getSoobakcList(requestMap);
        Map<String, Object> resultMap = null;
        if(list != null && list.size() > 0) {
            int count = 0;

            Map<String, Object> listMap = null;
            while(count < list.size()) {
                listMap = list.get(count);
                if(lectureCd.equals(listMap.get("LECTURECODE")) && lpIdx.equals(listMap.get("LP_IDX"))) {
                    resultMap = listMap;
                    break;
                }
                count++;
            }
        }

        return resultMap;
    }

    @RequestMapping(value="/getSoobakcDetail")
    public List<Map<String, Object>> getSoobakcDetail(@RequestBody Map<String, String> requestParams) throws Exception {
        //{CALL SP_SOOBAKC_LEC_DETAIL(#{LECTURECD}, #{SJCODE},#{LP_IDX},#{MEMBERID})}
        String lectureCd = null;
        String sjcode = null;
        String lpIdx = null;
        String memberId = null;
        Integer lecCnt = null;
        String type = null;
        Integer grade = null;

        //lectureCd, sjcode, lpIdx, leccnt, type, grade, memberId
        if(requestParams.get("0") != null) lectureCd = requestParams.get("0");
        if(requestParams.get("1") != null) sjcode = requestParams.get("1");
        if(requestParams.get("2") != null) lpIdx = requestParams.get("2");
        if(requestParams.get("3") != null) lecCnt = Integer.parseInt(requestParams.get("3"));
        if(requestParams.get("4") != null) memberId = requestParams.get("4");

        Map<String, Object> requestListMap = new HashMap<String, Object>();
        requestListMap.put("ACTION_TYPE", "LECTURE_LIST");
        requestListMap.put("FKSUB", null);
        requestListMap.put("SJCODE", sjcode);
        requestListMap.put("LECTURECD", lpIdx);
        requestListMap.put("LECCNT", lecCnt);
        requestListMap.put("GRADE", null);
        List<Map<String, Object>> lectureList = soobakcService.getSoobakcList(requestListMap);

        return lectureList;
    }

    @RequestMapping(value="/getSoobakcMovs")
    public Map<String, String> getSoobakcMovs(@RequestBody Map<String, String> requestParams) throws Exception {
        String lectureCd = null;
        String lpIdx = null;
        String memberId = null;
        String type = null;

        if(requestParams.get("0") != null) lectureCd = requestParams.get("0");
        if(requestParams.get("1") != null) lpIdx = requestParams.get("1");
        if(requestParams.get("2") != null) type = requestParams.get("2");
        if(requestParams.get("3") != null) memberId = requestParams.get("3");

        Map<String, Object> requestMap = new HashMap<String, Object>();
        requestMap.put("LECTURECD", lectureCd);
        requestMap.put("SJCODE", null);
        requestMap.put("LP_IDX", lpIdx);
        requestMap.put("MEMBERID", memberId);

        //{CALL SP_SOOBAKC_LEC_DETAIL(#{LECTURECD}, #{SJCODE}, #{LP_IDX},#{MEMBERID})}
        List<Map<String, Object>> resultList = soobakcService.getSoobakcDetail(requestMap);
        String urls = "";
        if(resultList.size() > 0 ) {
            if (type.equals("L")) {
                urls = (String) resultList.get(0).get("ld_mov2"); //일반화질
            } else {
                urls = (String) resultList.get(0).get("ld_mov5"); //고화질
                if ("".equals(urls)) {
                    urls = (String) resultList.get(0).get("ld_mov4"); //고화질 , ld_mov5 가 없는 경우
                    if ("".equals(urls)) {
                        urls = (String) resultList.get(0).get("ld_mov2"); //고화질 정보가 없으면 일반화질
                    }
                }
            }
        }

//        String url = "http://mi-visangst.xcdn.uplus.co.kr"+urls;
        String url = "http://soobakc-visangst.lgucdn.com"+urls;
        Map<String, String> resultMap = new HashMap<String, String>();
        resultMap.put("url", url);
        return resultMap;
    }

    @RequestMapping(value="/streamingStarplayer", produces = "application/json", headers="Accept=text/html", method= RequestMethod.GET)
    public ResponseEntity<String> streamingStarplayer(HttpServletRequest request, HttpServletResponse response, @CurrentUser UserPrincipal currentUser) throws Exception {
        logger.debug("======================>" + request.getParameter("content"));

        String memberId = "";
        try {
            if(currentUser != null) {
                memberId = currentUser.getMemberId();
            } else {
                memberId = "ANONYMOUS";
            }
        } catch (Exception e) {
            memberId = "ANONYMOUS";
        }

        if (request.getParameter("memberId") != null && !"".equals(request.getParameter("memberId"))) {
            memberId = request.getParameter("memberId");
        }

        String content = URLDecoder.decode(request.getParameter("content"), "UTF-8");
        String[] arr = content.split("/");
        String filename = arr[arr.length - 1];

        String[] para = {"APPID", memberId, filename, "", ""};
        List<MetaCode> metaCode = soobakcService.rmetaCode(para);

        String keyid = "";
        String keyname = "";

        if (!metaCode.isEmpty()) {
            if (metaCode.size() > 0) {
                keyid = metaCode.get(0).getCode();
                keyname = metaCode.get(0).getName();
            }
        } else {
            keyid = "0000";
            keyname = "0000";
        }

        if ("0000".equals(keyname)) {
            String[] arr1 = content.split("/");
            keyname = arr1[arr1.length - 1];
            keyname = keyname.substring(0, keyname.indexOf("."));
            int keynum = (int) Math.random() * 100000;
            keyid = String.valueOf(keynum);
        }

        String data;
        data = "<?xml version='1.0' encoding='UTF-8' ?>";
        data += "<axis-app>";
        data += "<action-type>streaming</action-type>";
        data += "<user-id><![CDATA["+ memberId +"]]></user-id>";
        data += 	"<content>";
        data += 		"<id><![CDATA["+ keyid +"]]></id>";
        data += 		"<url><![CDATA[" + content +"]]></url>";
        data += 		"<title><![CDATA["+ keyname +"]]></title>";
        data += 		"<position>0</position>";
        data += 		"<category><![CDATA[비바샘]]></category>";
        data += 		"<limit-date><![CDATA[20431210120000]]></limit-date>";
        data += 	"</content>";
        data += "</axis-app>";

        StringEncrypter encrypter = new StringEncrypter("31856D1F-57EA-415A-8DDA-6B86C978788E", "starplayer");
        String encrypted_url = encrypter.encrypt(data);

        response.setHeader("Content-Type", "text/html");

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/html");
        headers.add("Cache-Control", "no-cache");
        headers.add("Pragma", "no-cache");

        return new ResponseEntity<String>(encrypted_url, headers, HttpStatus.OK);
    }

    @RequestMapping(value="/getSoobakcImage")
    public Map<String, String> getSoobakcImage(@RequestBody Map<String, Object> requestParams) throws Exception {
        Map<String, String> map = new HashMap<String, String>();
        map.put("imagePath", soobakcService.getSoobakcImagePath(requestParams));
        return map;
    }

    @RequestMapping(value="/getSoobakcImageBanner")
    public Map<String, Object> getSoobakcImageBanner(@RequestBody Map<String, Object> requestParams) throws Exception {
        return soobakcService.getSoobakcImageBanner(requestParams);
    }
}
