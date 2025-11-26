package edu.visang.vivasam.common.controller;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import edu.visang.vivasam.common.utils.VivasamUtil;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping({"/api/files"})
public class FileController {

    @Autowired
    private Environment env;

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity handleFileUpload(@RequestParam("file") MultipartFile file) {
        Map<String, String> resultMap = new HashMap<>();
        try {
            System.out.printf("File name=%s, size=%s\n", file.getOriginalFilename(),file.getSize());

            // 확장자 화이트 리스트  체크
            String extension = FilenameUtils.getExtension(file.getOriginalFilename());

            if(VivasamUtil.isFileUploadWhiteList(extension)) {

                String path = env.getProperty("vivasam_fileroot") + env.getProperty("vivasam_fileroot_qna") + file.getOriginalFilename();

                File fileToSave = new File(path);
                //copy file content from received file to new local file
                file.transferTo(fileToSave);
                // 파일업로드 성공
                resultMap.put("code", "0");
            }else{
                // 파일 확장자 불가
                resultMap.put("code", "1");
                resultMap.put("msg", extension+" 파일은 업로드 할 수 없습니다.");
            }
        } catch (IOException ioe) {
            //if something went bad, we need to inform client about it
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        //everything was OK, return HTTP OK status (200) to the client
        return ResponseEntity.ok(resultMap);
    }
}