package edu.visang.vivasam.opendata.model;

import lombok.Data;

import java.util.List;

@Data
public class MetaData {
    String num;
    String contentId;
    String contentGubun;

    String fileType;
    String subject;
    String summary;

    String content;
    String filePath;
    String filename;
    String thumbnail;
    String thumbnailL;
    String sourceName;

    String totalCnt;
    String filecdnyn;

    String newIcon;

    String downyn;
    String tnyn;

    String ext1;
    String ext2;
    String ext3;
    String ext4;

    String ext5;
    String ext6;

    String educourseId;
    String type1;
    String saveFileName;

    List<MetaDataSub> dataSub = null;

}
