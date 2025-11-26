package edu.visang.vivasam.common.controller;

import com.konantech.ksf.client.CrzClient;
import com.konantech.ksf.client.KsfClient;
import com.konantech.ksf.client.QueryBuilder;
import com.konantech.ksf.client.SearchQuery;
import com.konantech.ksf.client.result.SearchResultSet;
import edu.visang.vivasam.common.service.SearchService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLDecoder;
import java.util.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    SearchService searchService;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @Autowired
    Environment environment;

    /**
     * 연관검색어 목록
     * @param requestParams
     * @return List<String>
     */
    @RequestMapping(value="/getSuggestCompletion", method=RequestMethod.POST)
    public Map<String, Object> getSuggestCompletion(@RequestBody Map<String, String> requestParams){
        String query = requestParams.get("query");
        Map<String, Object> resultMap = new HashMap<String, Object>();

        /**
         * TODO 개발서버 및 실계서버 배포시에는 아래의 주석을 반드시 풀어야 함!!!!!!
         * 연관검색어의 경우 검색엔진에서 제공하나 개발환경에서는 실제 검색엔진 서버에 붙을 수 없어(보안으로 인한 방화벽 미오픈)
         * 강제 리턴으로 교체
         */

        if(query != null && !"".equals(query)) {
            String ksfAddress = environment.getProperty("search.default.ksfUrl");
            int ksfDomain = Integer.parseInt(environment.getProperty("search.default.ksfDomain"));

            try {
                KsfClient ksfClient = new KsfClient(ksfAddress);
                resultMap.put("suggestRelated", ksfClient.suggestRelated(ksfDomain, query, 10));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return resultMap;
    }

    /**
     * 자동 완성 만들기
     * @param requestParams
     * @return
     */
    @RequestMapping(value="/getAutocompleted", method=RequestMethod.POST)
    public Map<String, Object> getAutocompleted(@RequestBody Map<String, String> requestParams) {
        String query = requestParams.get("query");
        List<String> resultList = new ArrayList<String>();
        Map<String, Object> resultMap = new HashMap<String, Object>();

        try {
            String apiAddress = environment.getProperty("search.default.ksfUrl") + "/api/suggest?target=complete&max_count=8&term=" + query;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Object> responseEntity = restTemplate.getForEntity(apiAddress, Object.class);
            HashMap<String, Object> body = (HashMap<String, Object>) responseEntity.getBody();

            resultMap = body;
            resultMap.put("apiAddress", apiAddress);
        } catch (Exception e) {
            e.printStackTrace();
        }

        /**
        resultList.add("국");
        resultList.add("국어");
        resultList.add("국어국");
        resultList.add("국어국문");
        resultList.add("국");
        resultList.add("국어");
        resultList.add("국어앱");
        return resultList;
        */
        return resultMap;
    }

    /**
     * 추천검색어 만들기
     * @param requestParams
     * @return
     * @throws Exception
     */
    @RequestMapping(value="/getSuggestQuery")
    public Map<String, Object> getSuggestQuery(@RequestBody Map<String, String> requestParams) throws Exception {
        String query = requestParams.get("query");
        Map<String, Object> resultMap = new HashMap<String, Object>();

        if(query != null && !"".equals(query)) {
            String ksfAddress = environment.getProperty("search.default.ksfUrl");

            try {
                KsfClient ksfClient = new KsfClient(ksfAddress);
                resultMap.put("suggestQuery", ksfClient.suggestSpell(query));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return resultMap;
    }

    /**
     * 통합 검색
     * @param requestParams
     * @return
     */
    @RequestMapping(value="/searchList", method= RequestMethod.POST)
    public Map<String, Object> searchList(@RequestBody Map<String, String> requestParams)  {
        String query = requestParams.get("query");
        if(query != null && !"".equals(query)) {
            try {
                query = URLDecoder.decode(query, "UTF-8");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Map<String, Object> resultMap = new HashMap<String, Object>();
        CrzClient crzClient = null;
        try {
            if(query != null && !"".equals(query)) {
                //TODO 실계에 올릴때에는 해당 주석을 풀어야 함
                crzClient = createCrzClient();

                //educourse
                SearchResultSet educourseSrs = crzClient.search(
                        this.createSearchQuery(query, "educourse", 0, 3, null, null, null, null, null, null, null, "DEFAULT")
                );

                resultMap.put("educourseCount", educourseSrs.getTotalCount()); //int
                resultMap.put("educourseList", educourseSrs.getRows());        //List<Map<String, Object>>

                //library
                SearchResultSet librarySrs = crzClient.search(
                        this.createSearchQuery(query, "library", 0, 4, null, null, null, null, null, null, null, "DEFAULT")
                );

                resultMap.put("libraryCount", librarySrs.getTotalCount());
                resultMap.put("libraryList", librarySrs.getRows());

                //cs
                SearchResultSet csSrs = crzClient.search(
                        this.createSearchQuery(query, "cs", 0, 3, null, null, null, null, null, null, null, "DEFAULT")
                );

                resultMap.put("csCount", csSrs.getTotalCount());
                resultMap.put("csList", csSrs.getRows());
                /**
                List<Map<String, Object>> educourseList = new ArrayList<Map<String, Object>>();
                List<Map<String, Object>> libraryList = new ArrayList<Map<String, Object>>();
                List<Map<String, Object>> csList = new ArrayList<Map<String, Object>>();

                Map<String, Object> map = null;
                for(int i = 0; i < 3; i++){
                    map = new HashMap<String, Object>();
                    map.put("PAGE_PATH", "초등 > 2009개정 > 미술 5~6(박은덕) > 수업자료");
                    map.put("CONTENT_GUBUN", "CN030");
                    map.put("EXT_NM", "jpeg");
                    map.put("SUBJECT", "제목입니다_" + i);
                    map.put("THUMBNAIL_PATH", "/VS/MS/KOR/106061/movie/thumbnail/thumB_9p_의견과 나눔.png");
                    map.put("PAGE_LINK_URL", "/viewer/contentsView.do?lnbCode=D40002&contentGubun=CN030&contentId=94952");
                    map.put("CONTENT_ID", 205920 + i);
                    educourseList.add(map);

                    map = new HashMap<String, Object>();
                    map.put("SUBJECT", "LIBRARY_제목_" + i);
                    map.put("THUMBNAIL_PATH", "/VS/MS/KOR/106061/movie/thumbnail/thumB_9p_의견과 나눔.png");
                    map.put("PAGE_LINK_URL", "/viewer/contentsView.do?lnbCode=D40002&contentGubun=CN030&contentId=94952");
                    libraryList.add(map);

                    map = new HashMap<String, Object>();
                    map.put("TITLE", "CS_제목_" + i);
                    map.put("PAGE_LINK_URL", "/cs/noticeView.do?noticeId=579" + i);
                    map.put("PAGE_PATH", "고객센터 > 공지사항");
                    map.put("REG_DTTM", "");
                   csList.add(map);
                }

                if(!"없음".equals(query)) {
                    resultMap.put("educourseCount", 10);
                    resultMap.put("libraryCount", 10);
                    resultMap.put("csCount", 10);
                    resultMap.put("educourseList", educourseList);
                    resultMap.put("libraryList", libraryList);
                    resultMap.put("csList", csList);
                } else {
                    resultMap.put("educourseCount", 0);
                    resultMap.put("libraryCount", 0);
                    resultMap.put("csCount", 0);
                    resultMap.put("educourseList", educourseList);
                    resultMap.put("libraryList", libraryList);
                    resultMap.put("csList", csList);
                }
                */
            }
        } catch(Exception e) {
            e.printStackTrace();
        }

        return resultMap;
    }

    /**
     * 교과 자료 검색
     * @param requestParams
     * @return
     */
    @RequestMapping(value = "/searchEducourseList", method=RequestMethod.POST)
    public Map<String, Object> searchEducourseList(@RequestBody Map<String, String> requestParams) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        CrzClient crzClient = null;
        SearchResultSet srs = null;

        String query = requestParams.get("query");
        String scenario = "educourse";
        int offset = 0;

        //schoolLevels ES : 초등, MS : 중등, HS : 고등
        //String[] schoolLevels = {"ES", "MS", "HS"};
        //eduYears : 2009, 2015
        //String[] eduYears = {"2009", "2015"};
        //educourseTypes : 1110001 : 수업자료, 1110002 : 평가자료, 1110003 : 멀티미디어자료, 1110005 : 이미지자료, 1110004 : 음원자료, 302 : 특화자료
        //String[] educourseTypes = {"1110001", "1110002", "1110003", "1110005", "1110004", "302"};
        //extNames : hwp, ppt, pdf, jpg, mp4, mp3, etc
        //String[] extNames = {"hwp", "ppt", "pdf", "jpg", "mp4", "mp3", "etc"};
        //subjectCodes : SC401 국어, SC402 영어, SC403 수학, SC404 사회, SC405 역사, SC406 도덕, SC407 과학, SC408 한문, SC409 기술/가정, SC410 정보, SC411 음악, SC412 미술, SC413 체육, SC414 실과, SC415 진로와 직업
        //String[] subjectCodes = {"SC401", "SC402", "SC403", "SC404", "SC405", "SC406", "SC407", "SC408", "SC409", "SC410", "SC411", "SC412", "SC413", "SC414", "SC415"};
        //sorting DEFAULT : 정확도순, REG_DTTM : 최신순, VIEW_CNT : 조회수순
        //String sorting = "DEFAULT";

        String[] schoolLevels = {};
        String[] eduYears = {};
        String[] educourseTypes = {};
        String[] extNames = {};
        String[] subjectCodes = {};
        String sorting = "DEFAULT";

        if(query != null && !"".equals(query)) {
            try {
                query = URLDecoder.decode(query, "UTF-8");

                if (requestParams.get("offset")         != null && !"".equals(requestParams.get("offset")))                 offset = Integer.parseInt(requestParams.get("offset"));
                if (requestParams.get("schoolLevels")   != null && !"".equals(requestParams.get("schoolLevels")))     schoolLevels = requestParams.get("schoolLevels").split(",");
                if (requestParams.get("eduYears")       != null && !"".equals(requestParams.get("eduYears")))             eduYears = requestParams.get("eduYears").split(",");
                if (requestParams.get("educourseTypes") != null && !"".equals(requestParams.get("educourseTypes"))) educourseTypes = requestParams.get("educourseTypes").split(",");
                if (requestParams.get("extNames")       != null && !"".equals(requestParams.get("extNames")))             extNames = requestParams.get("extNames").split(",");
                if (requestParams.get("subjectCodes")   != null && !"".equals(requestParams.get("subjectCodes")))     subjectCodes = requestParams.get("subjectCodes").split(",");
                if (requestParams.get("sorting")        != null && !"".equals(requestParams.get("sorting")))               sorting = requestParams.get("sorting");

                if("".equals(requestParams.get("schoolLevels"))) schoolLevels[0] = " ";
                if("".equals(requestParams.get("edyYears"))) eduYears[0] = " ";
                if("".equals(requestParams.get("educourseTypes"))) educourseTypes[0] = " ";
                if("".equals(requestParams.get("extNames"))) extNames[0] = " ";
                if("".equals(requestParams.get("subjectCodes"))) subjectCodes[0] = " ";

                //TODO 실계 배포 시 풀어야 함

                crzClient = createCrzClient();
                crzClient.setConnectionTimeout(3000);
                srs = crzClient.search(createSearchQuery(query, scenario, offset, 20, schoolLevels, eduYears, educourseTypes, extNames, subjectCodes, null, null, sorting));
                resultMap.put("educourseCount", srs.getTotalCount());
                resultMap.put("educourseList", srs.getRows());
                /**
                List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
                for(int i = 0; i < 10; i++){
                    Map<String, Object> map = new HashMap<String, Object>();
                    map.put("PAGE_PATH", "초등 > 2009개정 > 미술 5~6(박은덕) > 수업자료");
                    map.put("CONTENT_GUBUN", "CN030");
                    map.put("EXT_NM", "pdf");
                    map.put("SUBJECT", "<strong>123</strong> 제목입니다_" + i);
                    map.put("CONTENT_ID", 205920 + i);
                    list.add(map);
                }

                if(!"없음".equals(query)) {
                    resultMap.put("educourseCount", 10);
                    resultMap.put("educourseList", list);
                } else {
                    resultMap.put("educourseCount", 0);
                    resultMap.put("educourseList", list);
                }
                */
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return resultMap;
    }

    /**
     * 라이브러리 검색
     * @param requestParams
     * @return
     */
    @RequestMapping(value = "/searchLibraryList", method = RequestMethod.POST)
    public Map<String, Object> searchLibraryList(@RequestBody Map<String, String> requestParams) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        CrzClient crzClient = null;
        SearchResultSet srs = null;

        String query = requestParams.get("query");
        String scenario = "library";
        int offset = 0;

        //file_type : FT201 : 동영상, FT203 : 이미지
        String[] fileTypes = {"FT201", "FT203"};
        //type_1 : 304007 인물, 304001 인문, 304002 사회 304003 자연과학 304004 문화/예술/스포츠 304005 기술/공학 304006 생활/가정
        String[] libraryTypes = {"304007", "304001", "304002", "304003", "304004", "304005", "304006"};
        //sorting DEFAULT : 정확도순, REG_DTTM : 최신순, VIEW_CNT : 조회수순
        String sorting = "DEFAULT";

        if(query != null && !"".equals(query)) {
            try {
                query = URLDecoder.decode(query, "UTF-8");

                //TODO 화면에서 넘어오는 parameter setting 필요
                if(requestParams.get("offset")          != null && !"".equals(requestParams.get("offst")))          offset = Integer.parseInt(requestParams.get("offset"));
                if(requestParams.get("fileTypes")       != null && !"".equals(requestParams.get("fileTypes")))      fileTypes = requestParams.get("fileTypes").split(",");
                if(requestParams.get("libraryTypes")    != null && !"".equals(requestParams.get("libraryTypes")))   libraryTypes = requestParams.get("libraryTypes").split(",");
                if(requestParams.get("sorting")         != null && !"".equals(requestParams.get("sorting")))        sorting = requestParams.get("sorting");

                if("".equals(requestParams.get("fileTypes"))) {
                    fileTypes = new String[0];
                    fileTypes[0] = " ";
                }

                if("".equals(requestParams.get("libraryTypes"))) {
                    libraryTypes = new String[0];
                    libraryTypes[0] = " ";
                }

                crzClient = createCrzClient();
                srs = crzClient.search(createSearchQuery(query, scenario, offset, 20, null, null, null, null, null, fileTypes, libraryTypes, sorting));

                resultMap.put("libraryCount", srs.getTotalCount());
                resultMap.put("libraryList", srs.getRows());

                /**
                SearchQuery sq = createSearchQuery(query, scenario, offset, 20, null, null, null, null, null, fileTypes, libraryTypes, sorting);
                logger.info("===========> " + sq.getWhereClause());
                List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
                for(int i = 0; i < 10; i++){
                    Map<String, Object> map = new HashMap<String, Object>();
                    map.put("SUBJECT", "LIBRARY_제목_" + i);
                    map.put("THUMBNAIL_PATH", "/VS/MS/KOR/106061/movie/thumbnail/thumB_9p_의견과 나눔.png");
                    map.put("PAGE_LINK_URL", "/viewer/contentsView.do?lnbCode=D40002&contentGubun=CN030&contentId=94952");
                    list.add(map);
                }

                if(!"없음".equals(query)) {
                    resultMap.put("libraryCount", 100);
                    resultMap.put("libraryList", list);
                } else {
                    resultMap.put("libraryCount", 0);
                    resultMap.put("libraryList", list);
                }
                */
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return resultMap;
    }

    /**
     * 고객센터 검색
     * @param requestParams
     * @return
     */
    @RequestMapping(value = "/searchCsList", method = RequestMethod.POST)
    public Map<String, Object> searchCsList(@RequestBody Map<String, String> requestParams) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        CrzClient crzClient = null;
        SearchResultSet srs = null;

        String query = requestParams.get("query");
        String scenario = "cs";
        //sorting DEFAULT : 정확도순, REG_DTTM : 최신순, VIEW_CNT : 조회수순
        String sorting = "DEFAULT";
        int offset = 0;

        if(query != null && !"".equals(query)) {
            try {
                query = URLDecoder.decode(query, "UTF-8");
                if(requestParams.get("offset")  != null && !"".equals(requestParams.get("offset")))     offset = Integer.parseInt(requestParams.get("offset"));
                if(requestParams.get("sorting") != null && !"".equals(requestParams.get("sorting")))    sorting = requestParams.get("sorting");

                crzClient = createCrzClient();
                srs = crzClient.search(createSearchQuery(query, scenario, offset, 20, null, null, null, null, null, null, null, sorting));
                resultMap.put("csCount", srs.getTotalCount());
                resultMap.put("csList", srs.getRows());
                /**
                List<Map<String, Object>> csList = new ArrayList<Map<String, Object>>();
                for(int i = 0; i < 20; i++) {
                    Map<String, Object> map = new HashMap<String, Object>();
                    map.put("TITLE", "CS_제목_" + i);
                    map.put("PAGE_LINK_URL", "/cs/noticeView.do?noticeId=579");
                    map.put("PAGE_PATH", "고객센터 > 공지사항");
                    map.put("REG_DTTM", "");
                    csList.add(map);
                }

                if(!"없음".equals(query)) {
                    resultMap.put("csCount", 100);
                    resultMap.put("csList", csList);
                } else {
                    resultMap.put("csCount", 0);
                    resultMap.put("csList", csList);
                }
                */
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return resultMap;
    }

    /**
     * 검색엔진 Client 생성
     * @return
     */
    private CrzClient createCrzClient(){
        CrzClient crzClient = new CrzClient(environment.getProperty("search.default.searchEngineIp"), Integer.parseInt(environment.getProperty("search.default.searchEnginePort")));
        crzClient.setConnectionTimeout(Integer.parseInt(environment.getProperty("search.default.searchEngineTimeout")));
        crzClient.setCharset(environment.getProperty("search.default.searchEngineCharset"));

        return crzClient;
    }

    /**
     * 검색엔진 쿼리 만들기
     * @param query
     * @param scenario
     * @param offset
     * @param limitCount
     * @param schoolLevels
     * @param eduYears
     * @param educourseTypes
     * @param extNames
     * @param subjectCodes
     * @param fileTypes
     * @param libraryTypes
     * @param sorting
     * @return
     */
    private SearchQuery createSearchQuery(String query, String scenario, int offset, int limitCount,
                                   String[] schoolLevels, String[] eduYears, String[] educourseTypes, String[] extNames, String[] subjectCodes,
                                   String[] fileTypes, String[] libraryTypes, String sorting){
        QueryBuilder qb = new QueryBuilder();
        qb.where("text_idx = '" + query + "' allword synonym");

        //for educourse search
        if(scenario.equals("educourse")) {
            if(schoolLevels != null) {
                ArrayList<String> eduSchoolArr = new ArrayList<String>(Arrays.asList(schoolLevels));
                if(eduSchoolArr.contains("ES")) eduSchoolArr.add("NES");
                schoolLevels = eduSchoolArr.toArray(schoolLevels);

                qb.whereColumnInSet("SCHOOL_LVL", eduSchoolArr.toArray(new String[eduSchoolArr.size()]), true);
            }




            if(eduYears != null) qb.whereColumnInSet("EDU_YEAR", eduYears, true);

            if(educourseTypes != null) {
                boolean is302 = false;
                ArrayList<String> educourseTypeArr = new ArrayList<String>(Arrays.asList(educourseTypes));
                if(educourseTypeArr.contains("1110001")) educourseTypeArr.add("3000001");
                if(educourseTypeArr.contains("302")) {
                    is302 = true;
                    educourseTypeArr.remove("302");
                }
                educourseTypes = educourseTypeArr.toArray(educourseTypes);

                if(!is302) {
                    qb.whereColumnInSet("TYPE_1", educourseTypes, true);
                } else {
                    //특화자료만 있을 때
                    if(educourseTypeArr.size() == 0) {
                        qb.where("( TYPE_1 like '302*' or TYPE_2 like '303*' ) ");
                    } else {
                        QueryBuilder __qb = new QueryBuilder();
                        __qb.whereColumnInSet("TYPE_1", educourseTypeArr.toArray(new String[educourseTypeArr.size()]), true);
                        qb.where("( " + __qb.getWhereClause() + " or TYPE_1 like '302*' or TYPE_2 like '303*' ) ");
                    }
                }
            } else {
                //차시별 자료와 DVD 는 포함 안되게 NOT IN 을 넣자
                String [] notInTypes = {"PERIOD", "DVD"};
                qb.whereColumnNotInSet("TYPE_1", notInTypes, true);
            }

            if(extNames != null) {
                boolean isEtc = false;
                String fileExtAppend = "";

                Map<String, String> fileExtMap = new HashMap<>();
                fileExtMap.put("hwp", "hwp");
                fileExtMap.put("ppt", "ppt,pptx");
                fileExtMap.put("pdf", "pdf");
                fileExtMap.put("jpg", "jpg,jpeg,png");
                fileExtMap.put("mp4", "mp4");
                fileExtMap.put("mp3", "mp3,wma");
                fileExtMap.put("etc", "etc");

                for(String extName : extNames) {
                    if(extName.equals("etc")) {
                        isEtc = true;
                    } else {
                        if(!fileExtAppend.equals(""))
                            fileExtAppend += ",";
                        fileExtAppend += fileExtMap.get(extName);
                    }
                }

                if(!isEtc) {
                    qb.whereColumnInSet("EXT_NM", extNames, true);
                } else {
                    Set<String> set = fileExtMap.keySet();
                    //플래쉬 자료는 뺀다
                    String notEtc = "swf";
                    for (String key : set) {
                        if(!notEtc.equals(""))
                            notEtc += ",";
                        notEtc += fileExtMap.get(key);
                    }
                    QueryBuilder notEtcQb = new QueryBuilder();
                    QueryBuilder etcQb = new QueryBuilder();
                    notEtcQb.whereColumnInSet("EXT_NM", fileExtAppend.split(","), true);
                    etcQb.whereColumnNotInSet("EXT_NM", notEtc.split(","), true);
                    qb.setWhereClause(qb.getWhereClause() + " AND ("+ notEtcQb.getWhereClause() + " OR "+ etcQb.getWhereClause() +")");
                }
            } else {
                String[] notInExtArr = {"swf"};
                qb.whereColumnNotInSet("EXT_NM", notInExtArr, true);
            }

            if(subjectCodes != null) qb.whereColumnInSet("SUBJECT_CD", subjectCodes, true);
        }

        //for library search
        if(fileTypes != null) qb.whereColumnInSet("FILE_TYPE", fileTypes, true);
        if(libraryTypes != null) qb.whereColumnInSet("TYPE_1", libraryTypes, true);

        if(sorting.equals("REG_DTTM")) {
            qb.setSortingClause("order by REG_DTTM DESC");
        }

        if(sorting.equals("VIEW_CNT") || sorting.equals("READCNT")) {
            qb.setSortingClause("order by " + sorting + " DESC");
        }

        if(sorting.equals("DEFAULT")) {
            String field = "";
            if(!"cs".equals(scenario)) field = "SUBJECT";
            qb.setSortingClause("order by $MATCHFIELD(" + field  +") desc, $RELEVANCE desc absolute");
            qb.setSortingClause("order by $RELEVANCE desc absolute");
        }

        String[] textIdxColumns = null;
        String excludeBy = "";

        SearchQuery sq = new SearchQuery();
        sq.setQuery(query);
        sq.setScenario(scenario);
        sq.setOffset(offset);
        sq.setLimit(limitCount);
        sq.setSortingClause(qb.getSortingClause());

        if(scenario.equals("educourse")) {
            textIdxColumns = environment.getProperty("ks.textIdxColumn.educourse").split(",");
        } else if (scenario.equals("library")) {
            textIdxColumns = environment.getProperty("ks.textIdxColumn.library").split(",");
        } else if (scenario.equals("cs")) {
            textIdxColumns = environment.getProperty("ks.textIdxColumn.cs").split(",");
        }

        excludeBy = " exclude by " + StringUtils.join(textIdxColumns, "(0),") + "(0) ";
        sq.setWhereClause(qb.getWhereClause());
        sq.setWhereClause(sq.getWhereClause() + excludeBy);

        return sq;
    }
}
