package edu.visang.vivasam.opendata.controller;

import edu.visang.vivasam.opendata.model.EducourseInfo;
import edu.visang.vivasam.opendata.model.MetaCode;
import edu.visang.vivasam.opendata.model.MetaData;
import edu.visang.vivasam.opendata.model.PhotoZoneMain;
import edu.visang.vivasam.opendata.service.OpenDataService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/opendata")
public class OpenDataController {

    private static final Logger logger = LoggerFactory.getLogger(OpenDataController.class);
    @Autowired
    OpenDataService openDataService;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @GetMapping("/ChannelList")
    @Secured("ROLE_USER")
    public  List<EducourseInfo> channelList(@CurrentUser UserPrincipal currentUser) {
        logger.info("currentUser : {}", currentUser);
        List<EducourseInfo> channelList = openDataService.channelList(currentUser.getMemberId());

        return channelList;
    }

    @RequestMapping(value = "/metaCode")
    public ResponseEntity<?> metaCode(@RequestParam(value = "type", required = false, defaultValue = "image") String type,
                                       @RequestParam(value = "name", required = false, defaultValue = "") String name,
                                       @RequestParam(value = "code", required = false, defaultValue = "") String code,
                                       @RequestParam(value = "sname", required = false, defaultValue = "") String sname,
                                       @RequestParam(value = "scode", required = false, defaultValue = "") String scode) throws Exception
    {
        String typeCode;
        if("image".equals(type)){
            typeCode = "img";
        }else{
            typeCode = "mov";
        }

        Map<String,Object> resultMap = new HashMap<>();

        List<MetaCode> metaCode = openDataService.getCodeListByGroupCode();
        resultMap.put("metaCode",metaCode);

        if (name.equals("") && code.equals("")) {
            resultMap.put("name","전체 카테고리");
            resultMap.put("code","");
            resultMap.put("scode","");
            resultMap.put("sname","");
        } else {
            resultMap.put("name",name);
            resultMap.put("code",code);
            resultMap.put("sname",sname);
            resultMap.put("scode",scode);
        }
        return ResponseEntity.ok(resultMap);
    }


    @RequestMapping(value = "/metaData")
    public ResponseEntity<?> metaData(@RequestParam(value = "type", required = false, defaultValue = "image") String type,
                                      @RequestParam(value = "channel", required = false, defaultValue = "") String channel,
                                      @RequestParam(value = "word", required = false, defaultValue = "") String word,
                                      @RequestParam(value = "type1", required = false, defaultValue = "") String type1,
                                      @RequestParam(value = "type2", required = false, defaultValue = "") String type2,
                                      @RequestParam(value = "pageno", required = false, defaultValue = "1") String pageno,
                                      @RequestParam(value = "pagesize", required = false, defaultValue = "20") String pagesize) throws Exception
    {
        if("image".equals(type)){
            channel = "img";
        }else{
            channel = "mov";
        }
        String[] para = { pageno, pagesize, channel, type1, type2, word, "" };

        Page<MetaData> list = openDataService.metaData(Integer.parseInt(pageno), Integer.parseInt(pagesize), para);
        Resources<Map<String, Object>> resources = null;
        if(list != null) {
            resources = pagedResourcesAssembler.toResource(list);
        }
        return ResponseEntity.ok(resources);
    }



    /**
     * 내 폴더 담기
     * @param contentGubun
     * @param contentId
     * @return
     */
    @GetMapping("/addFolder")
    public ResponseEntity<?> addFolder(@CurrentUser UserPrincipal currentUser,
                                       @RequestParam(value = "contentGubun", required = false, defaultValue="") String contentGubun,
                                       @RequestParam(value = "contentId", required = false, defaultValue = "") String contentId) {


        Map<String,Object> resultMap = new HashMap<>();

        if(currentUser != null && StringUtils.hasText(currentUser.getMemberId())) {
            String memberId = currentUser.getMemberId();

            //내 폴더 ID를 가져온다
            String[] para = {"folderlist",memberId,contentId,contentGubun,""};
            List<MetaCode> metaCode = openDataService.metaCode(para);
            String folderId = metaCode.get(1).getCode();

            //폴더 담기
            String code = contentGubun+"-"+contentId;
            String[] addPara = {"addfolderContent", memberId, folderId, code, ""};
            metaCode = openDataService.metaCode(addPara);

            if (metaCode != null && metaCode.size() > 0 ) {
                resultMap.put("code","0");
                resultMap.put("metaCode",metaCode);
            }else{
                resultMap.put("code","1");
            }
        }else {
            //로그인 필요
            resultMap.put("code","2");
        }
        return ResponseEntity.ok(resultMap);
    }

    /**
     * 비바샘 포토존
     * 2019.12.19 김대희
     * @param PHOTO_IDX
     * @return
     */
    @GetMapping("/photoZone")
    public List<Map<String, Object>> photoZone(@CurrentUser UserPrincipal currentUser,
                                               @RequestParam(value = "PHOTO_IDX", required = false, defaultValue = "") String PHOTO_IDX) {


        /* 포토존 부분에 대해 List<Map 형태로 불러와야 > JS 단에서 Map 형태로 뿌릴 수 있음 */
        List<Map<String, Object>> photoZoneMains = openDataService.photoZoneMain(PHOTO_IDX);
        List<Map<String, Object>> photoZoneResult = new ArrayList<>();
        for (Map<String, Object> photoZone : photoZoneMains) {
            photoZoneResult.add(photoZone);

        }
        logger.info("photoZoneMains : {}", photoZoneMains);
        logger.info("photoZoneResult : {}", photoZoneResult);

        return photoZoneResult;
    }

    @PostMapping("/serviceNotificationApply")
    public ResponseEntity<?> serviceNotificationApply(@CurrentUser UserPrincipal currentUser
            , @RequestParam(value = "serviceNm", defaultValue = "vivaClass") String serviceNm) throws Exception {

        Map<String, Object> params = new HashMap<>();
        params.put("serviceNm", serviceNm);
        params.put("access", "mobile_middle");
        params.put("memberId", currentUser.getMemberId());
        Map<String, Object> result = openDataService.serviceNotificationApply(params);

        return ResponseEntity.ok(result);
    }

    @RequestMapping(value = "/fastMusicLibraryCode")
    public ResponseEntity<?>  fastMusicLibraryCode(@RequestParam(value = "codeGroupId", defaultValue = "663") String codeGroupId) {
        Map<String,Object> resultMap = new HashMap<>();

        List<MetaCode> metaCode = openDataService.fastMusicLibraryCode(codeGroupId);
        resultMap.put("metaCode", metaCode);
        return ResponseEntity.ok(resultMap);
    }

    @RequestMapping(value = "/fastMusicLibraryData")
    public ResponseEntity<?> metaData(@RequestParam(value = "type", required = false, defaultValue = "image") String type,
                                      @RequestParam(value = "pageNo", required = false, defaultValue = "1") String pageNo,
                                      @RequestParam(value = "type1", required = false, defaultValue = "") String type1,
                                      @RequestParam(value = "pageSize", required = false, defaultValue = "20") String pageSize) throws Exception {
        String para = type1;
        Map<String,Object> resultMap = new HashMap<>();

        List<MetaData> list = openDataService.fastMusicLibraryData(Integer.parseInt(pageNo), Integer.parseInt(pageSize), para);
        resultMap.put("list", list);
        resultMap.put("pageNo", pageNo);
        resultMap.put("pageSize", pageSize);
        return ResponseEntity.ok(resultMap);

    }

}
