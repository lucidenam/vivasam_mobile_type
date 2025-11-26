package edu.visang.vivasam.common.utils;

import edu.visang.vivasam.opendata.model.MetaData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PageUtils {
    private static final Logger logger = LoggerFactory.getLogger(PageUtils.class);

    public static Page<Map<String, Object>> generatePage(List<Map<String, Object>> list, Pageable pageable, String totalRowCountColumn/*, String totalPageCountColumn, String pageSizeColumn*/) {
        if(CollectionUtils.isEmpty(list)) {
            return null;
        }

        Map<String, Object> pageInfo = list.get(0);
        int totalRowCount = 0;
        /*int totalPageCount = 0;
        int pageSize = 0;*/

        try {
            if(StringUtils.hasText(totalRowCountColumn) && pageInfo.get(totalRowCountColumn) != null) {
                totalRowCount = Integer.parseInt(pageInfo.get(totalRowCountColumn).toString());
            }
            /*if(StringUtils.hasText(totalPageCountColumn) && pageInfo.get(totalPageCountColumn) != null) {
                totalPageCount =  (int)pageInfo.get(totalPageCountColumn);
            }
            if(StringUtils.hasText(pageSizeColumn) && pageInfo.get(pageSizeColumn) != null) {
                pageSize = (int)pageInfo.get(pageSizeColumn);
            }*/
        }catch(Exception e) {
            logger.error("[Generate Page Exception]", e);
        }

        //logger.info("totalRowCount : {} / totalPageCount : {} / pageSize : {}", totalRowCount, totalPageCount, pageSize);
        logger.info("totalRowCount : {}", totalRowCount);

        List<Map<String, Object>> contentsList = new ArrayList<>(list);
        contentsList.remove(0);
        logger.info("list : {}" , list);
        logger.info("contentsList : {}" , contentsList);

        Page<Map<String, Object>> page = null;
        if(pageable != null) {
            page = new PageImpl<>(contentsList, pageable, totalRowCount);
        }else {
            page = new PageImpl<>(contentsList);
        }

        return page;
    }

    public static Page<MetaData> generatePageMeta(List<MetaData> list, Pageable pageable ) {
        if(CollectionUtils.isEmpty(list)) {
            return null;
        }
        MetaData pageInfo = list.get(0);
        int totalRowCount = 0;

        try {
            totalRowCount = Integer.parseInt(pageInfo.getTotalCnt());
        }catch(Exception e) {
            logger.error("[Generate Page Exception]", e);
        }
        List<MetaData> contentsList = new ArrayList<>(list);
        Page<MetaData> page = new PageImpl<>(contentsList, pageable, totalRowCount);
        return page;
    }
//    public static Page<SurveyItemInfo> generatePageSurveyItemInfo(List<SurveyItemInfo> list, Pageable pageable ) {
//        if(CollectionUtils.isEmpty(list)) {
//            return null;
//        }
//        SurveyItemInfo pageInfo = list.get(0);
//        int totalRowCount = 0;
//
//        try {
//            totalRowCount = Integer.parseInt(pageInfo.getTotalCnt());
//        }catch(Exception e) {
//            logger.error("[Generate Page Exception]", e);
//        }
//        List<SurveyItemInfo> contentsList = new ArrayList<>(list);
//        Page<SurveyItemInfo> page = new PageImpl<>(contentsList, pageable, totalRowCount);
//        return page;
//    }

    public static Page<?> generatePageClazz(List<?> list, int totalRowCount, Pageable pageable ) {
        if(CollectionUtils.isEmpty(list)) {
            return null;
        }
        List<?> contentsList = new ArrayList<>(list);
        Page<?> page = new PageImpl<>(contentsList, pageable, totalRowCount);
        return page;
    }

    public static Slice<Map<String, Object>> generateSlice(List<Map<String, Object>> list, Pageable pageable, String totalPageCountColumn/*, String pageSizeColumn*/) {
        if(CollectionUtils.isEmpty(list)) {
            return null;
        }

        Map<String, Object> pageInfo = list.get(0);
        /*int totalRowCount = 0;*/
        int totalPageCount = 0;
        /*int pageSize = 0;*/

        try {
            /*if(StringUtils.hasText(totalRowCountColumn) && pageInfo.get(totalRowCountColumn) != null) {
                totalRowCount = (int)pageInfo.get(totalRowCountColumn);
            }*/
            if(StringUtils.hasText(totalPageCountColumn) && pageInfo.get(totalPageCountColumn) != null) {
                totalPageCount =  (int)pageInfo.get(totalPageCountColumn);
            }
            /*if(StringUtils.hasText(pageSizeColumn) && pageInfo.get(pageSizeColumn) != null) {
                pageSize = (int)pageInfo.get(pageSizeColumn);
            }*/
        }catch(Exception e) {
            logger.error("[Generate Page Exception]", e);
        }

        //logger.info("totalRowCount : {} / totalPageCount : {} / pageSize : {}", totalRowCount, totalPageCount, pageSize);
        logger.info("totalPageCount : {}", totalPageCount);

        List<Map<String, Object>> contentsList = new ArrayList<>(list);
        contentsList.remove(0);
        logger.info("list : {}" , list);
        logger.info("contentsList : {}" , contentsList);

        Slice<Map<String, Object>> slice = null;
        boolean hasNext = totalPageCount > pageable.getPageNumber();
        if(pageable != null) {
            slice = new SliceImpl<>(contentsList, pageable, hasNext);
        }else {
            slice = new SliceImpl<>(contentsList);
        }

        return slice;
    }
}
