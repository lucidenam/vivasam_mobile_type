package edu.visang.vivasam.creative.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreativeResult {

	private String month;
	private String refCode;
	private String name;
	private String newYn;
	private String desc;
	private String day;
	private String issueId;
	private String useYn;

	private String areaType;
	private String clazz;
	private String title;
	private String contentId;
	private String contentGubun;
	private String educourseId;
	private String dataType;
	private String typeName;
	private String fileType;
	private String subject;
	private String sourceName;
	private String type1;
	private String type2;
	private String summary;
	private String mSummary;
	private String content;
	private String filePath;
	private String fileName;
	private String thumbnail;
	private String thumbnailL;
	private String fileCdnYn;
	private String newIcon;
	private String downYn;
	private String tnYn;

	private String prevId;

	private String showYn;
	private String dataYn;

	private String weekYn;

	private String fctId;
	private String fctSubjMm;
	private String fctSubj;
	private String fctTitle;
	private String coverImgUrl;
	private String activeValue;
	private String cidSection;
	private String cidSpead;
	private String cidHw;

	private String thumbnailPath;
	private String siteUrl;
	private String type;

	private List<CreativeResult> group;
}