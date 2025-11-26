package edu.visang.vivasam.common.controller;

import edu.visang.vivasam.common.service.DownloadService;
import edu.visang.vivasam.security.CurrentUser;
import edu.visang.vivasam.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/download")
public class DownloadController {

    private static final Logger logger = LoggerFactory.getLogger(DownloadController.class);

    @Autowired
    DownloadService downloadService;

    @Autowired
    Environment environment;

    @PostMapping(value="/getFileInfoList")
    @Secured("ROLE_USER")
    public ResponseEntity<?> getFileInfoList(@RequestBody Map<String, String> requestParams,
                                          @CurrentUser UserPrincipal user) {
        //type : ID, URL 등
        String type = null;
        String keyval = null;

        type = requestParams.get("0");
        keyval = requestParams.get("1");

        Map<String, Object> requestMap = new HashMap<String, Object>();

        int totalCount = 0;
        List<Map<String, Object>> fileLists = null;

        if("url".equals(type.toLowerCase())) {

        } else {
            String[] fileInfos = keyval.split("-");
            if(fileInfos.length == 2) {
                //{CALL DBO.SP_FILE_INFO_LIST( #{userid}, #{contentid}, #{contentgubun}, #{filename}, #{where}, #{ipaddress}, #{downType}, #{fdTotalCnt}, #{fdCurCnt} ) }
                //(file[0], userid, fileinfo[1], fileinfo[0],"", "", fdTotalCnt, fdCurCnt);
                //(filename, userid, contentid, contentgubun,where,downType,fdTotalCnt,fdCurCnt);
                requestMap.put("filename", type);
                requestMap.put("contentid", fileInfos[1]);
                requestMap.put("contentgubun", fileInfos[0]);
                requestMap.put("userid", user.getMemberId());
                fileLists = downloadService.getFileList(requestMap);
                if(!CollectionUtils.isEmpty(fileLists)) {
                    for (Map<String, Object> map : fileLists) {
                        String result = String.valueOf(map.get("result"));
                        logger.info("{} / {} / {}", result.length(), result.indexOf("x%x"), result.substring(0, result.indexOf("x%x")));
                        map.put("result", result.substring(0, result.indexOf("x%x")));
                    }
                }
            }
        }

        return ResponseEntity.ok(fileLists);
    }

    @RequestMapping(value = "/verifyfileDown")
    public ResponseEntity<Resource> verifyfileDown(@RequestParam(value = "fileName", required = false, defaultValue = "") String fileName) throws IOException {
        // 파일 경로 + 파일
        String path = environment.getProperty("vivasam_fileroot") + environment.getProperty("vivasam_filepath_verifyfile") + fileName;
        File file = new File(path);
        // 파일 존재 유무
        if (file.isFile()) {
            String newFileName = file.getName();
            // 파일 확장자
            String ext = newFileName.substring(newFileName.lastIndexOf(".") + 1);
            HttpHeaders header = new HttpHeaders();
            Path fPath = Paths.get(file.getAbsolutePath());
            header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + newFileName);
            header.add("Cache-Control", "no-cache, no-store, must-revalidate");
            header.add("Pragma", "no-cache");
            header.add("Expires", "0");

            InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

            return ResponseEntity.ok()
                    .headers(header)
                    .contentLength(file.length())
                    .contentType(MediaType.parseMediaType("application/octet-stream"))
                    .body(resource);
        }
        return null;
    }
}
