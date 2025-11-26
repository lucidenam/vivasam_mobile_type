package edu.visang.vivasam.common.model;

public enum FileUploadWhiteList {
	FW001("jpg"),
	FW002("png"),
	FW003("jpeg"),
	FW004("gif"),
	FW005("bmp"),
	FW006("wav"),
	FW007("wma"),
	FW008("avi"),
	FW009("mp3"),
	FW010("mp4"),
	FW011("asf"),
	FW012("mpeg"),
	FW013("hwp"),
	FW014("txt"),
	FW015("doc"),
	FW016("docx"),
	FW017("xls"),
	FW018("xlsx"),
	FW019("ppt"),
	FW020("pptx"),
	FW021("pdf"),
	FW022("zip"),
	FW023("7z")
	;
	
	String ext;
	
	FileUploadWhiteList(String ext) {
		this.ext = ext;
	}
	
	public String getExt() {
		return ext;
	}
}
