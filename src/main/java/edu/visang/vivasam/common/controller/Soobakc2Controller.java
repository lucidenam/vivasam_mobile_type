package edu.visang.vivasam.common.controller;


import edu.visang.vivasam.common.model.MetaCode;
import edu.visang.vivasam.common.service.SoobakcService;
import edu.visang.vivasam.common.utils.StringEncrypter;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URLDecoder;
import java.util.List;

@RequestMapping("/api/soobakcTest")
public class Soobakc2Controller {
    private static final Logger logger = LoggerFactory.getLogger(Soobakc2Controller.class);

    @Autowired
    SoobakcService soobakcService;

    @RequestMapping(value="/streamingStarplayer", produces = "text/html;charset=UTF-8", headers="Accept=text/html", method= RequestMethod.GET)
    public ResponseEntity<String> streamingStarplayer(HttpServletRequest request, HttpServletResponse response, @CurrentUser UserPrincipal currentUser) throws Exception {
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

        if(request.getParameter("memberId") != null && !"".equals(request.getParameter("memberId"))) {
            memberId = request.getParameter("memberId");
        }

        String content =  URLDecoder.decode(request.getParameter("content"),"UTF-8");
        String[] arr = content.split("/");
        String filename = arr[arr.length-1];

        String[] para = {"APPID", memberId, filename, "" , ""};
        List<MetaCode> metaCode = soobakcService.rmetaCode(para);

        String keyid = "";
        String keyname = "";

        if(!metaCode.isEmpty()) {
            if (metaCode.size() > 0 ) {
                keyid = metaCode.get(0).getCode();
                keyname = metaCode.get(0).getName();
            } else {
                keyid = "";
                keyname = "";
            }
        } else {
            keyid = "0000";
            keyname = "0000";
        }

        if ("0000".equals(keyname)) {
            String[] arr1 = content.split("/");
            keyname=arr1[arr1.length-1];
            keyname = keyname.substring(0, keyname.indexOf("."));
            int keynum =(int)Math.random() * 100000;
            keyid =   String.valueOf(keynum);
        }

        String data = "";
        data = "<?xml version='1.0' encoding='UTF-8' ?>";
        data += "<axis-app>";
        data += "<action-type>streaming</action-type>";
        data += "<user-id><![CDATA["+ memberId +"]]></user-id>";
        data += 	"<content>";
        data += 		"<id><![CDATA["+ keyid +"]]></id>";
        //data += 		"<url><![CDATA[" + content +"]]></url>";
        data +=         "<url><![CDATA[http://m.starplayer.net/dev/syd/sample/file/sample.mp4]]></url>";
        data += 		"<title><![CDATA["+ keyname +"]]></title>";
        data += 		"<position>0</position>";
        data += 		"<category><![CDATA[비바샘]]></category>";
        data += 		"<limit-date><![CDATA[20131210120000]]></limit-date>";
        data += 	"</content>";
        data += "</axis-app>";

        StringEncrypter encrypter = new StringEncrypter("31856D1F-57EA-415A-8DDA-6B86C978788E", "starplayer");
        String encrypted_url = encrypter.encrypt(data);

        response.addHeader("Cache-Control", "no-cache");
        response.addHeader("Pragma", "no-cache");
        response.setHeader("contentType", "text/html");
        response.setHeader("Content-Type", "text/html");

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/html");
        headers.add("Cache-Control", "no-cache");
        headers.add("Pragma", "no-cache");

        return new ResponseEntity<String>(encrypted_url, headers, HttpStatus.OK);
    }

}
