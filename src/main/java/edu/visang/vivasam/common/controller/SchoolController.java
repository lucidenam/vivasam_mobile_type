package edu.visang.vivasam.common.controller;

import edu.visang.vivasam.common.service.SchoolService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/school")
public class SchoolController {
    private static final Logger logger = LoggerFactory.getLogger(SchoolController.class);

    @Autowired
    SchoolService schoolService;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @GetMapping("/searchSchool")
    public ResponseEntity<?> searchSchool(
            @RequestParam(value = "page", required = true) int page,
            @RequestParam(value = "size", required = true) int size,
            @RequestParam(value = "schoolName", required = true) String schoolName,
            @RequestParam(value = "tab", required = false) String tab
    ) {
        return ResponseEntity.ok(schoolService.selectSchoolList(page, size, schoolName, tab));
    }

    @GetMapping("/area")
    public List<Map<String, String>> schoolArea(@RequestParam(value = "codeflag", required = true) String codeflag, String fkcode, String pkcode) {
        return schoolService.selectSchoolArea(pkcode, codeflag, fkcode);
    }
}
