package edu.visang.vivasam.common.model;

import lombok.Data;

@Data
public class ConvertedDocCondition {
    private String mediaGubun = null;
    private String mediaId = null;
    private int pageNo = 0;
    private int retainCnt = 0;
    private int docCnt = 0;
    private String docConvertYn = null;
    private String fileCdnYn = null;
    private String thumbnailPath = null;
    private String filePath = null;
    private int orderNo = 0;
}
