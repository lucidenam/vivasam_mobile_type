package edu.visang.vivasam.opendata.model;

public class MetaDataSub {
    String contentId;
    String contentGubun;
    String educourseId;
    String type1;
    String type1name;
    String type2;
    String type2name;
    String esummary;

    String schoolLevel;

    String textBook;
    String textbookCode;

    String Unit1;
    String Unit1Code;

    String schoolYear;


    //초등 국정 교과 정보 페이지에서 필요한 항목 추가, 심원보, 20160213
    private String schoolGrade = null;
    private String schoolTerm = null;
    private String courseCd = null;


    public String getSchoolGrade() {
        return schoolGrade;
    }
    public void setSchoolGrade(String schoolGrade) {
        this.schoolGrade = schoolGrade;
    }
    public String getSchoolTerm() {
        return schoolTerm;
    }
    public void setSchoolTerm(String schoolTerm) {
        this.schoolTerm = schoolTerm;
    }
    public String getCourseCd() {
        return courseCd;
    }
    public void setCourseCd(String courseCd) {
        this.courseCd = courseCd;
    }
    public String getSchoolYear() {
        return schoolYear;
    }
    public void setSchoolYear(String schoolYear) {
        this.schoolYear = schoolYear;
    }
    public String getSchoolLevel() {
        return schoolLevel;
    }
    public void setSchoolLevel(String schoolLevel) {
        this.schoolLevel = schoolLevel;
    }
    public String getTextBook() {
        return textBook;
    }
    public void setTextBook(String textBook) {
        this.textBook = textBook;
    }
    public String getTextbookCode() {
        return textbookCode;
    }
    public void setTextbookCode(String textbookCode) {
        this.textbookCode = textbookCode;
    }
    public String getUnit1() {
        return Unit1;
    }
    public void setUnit1(String unit1) {
        Unit1 = unit1;
    }
    public String getUnit1Code() {
        return Unit1Code;
    }
    public void setUnit1Code(String unit1Code) {
        Unit1Code = unit1Code;
    }

    public String getType1name() {
        return type1name;
    }
    public void setType1name(String type1name) {
        this.type1name = type1name;
    }
    public String getType2name() {
        return type2name;
    }
    public void setType2name(String type2name) {
        this.type2name = type2name;
    }
    public String getContentId() {
        return contentId;
    }
    public void setContentId(String contentId) {
        this.contentId = contentId;
    }
    public String getContentGubun() {
        return contentGubun;
    }
    public void setContentGubun(String contentGubun) {
        this.contentGubun = contentGubun;
    }
    public String getEducourseId() {
        return educourseId;
    }
    public void setEducourseId(String educourseId) {
        this.educourseId = educourseId;
    }
    public String getType1() {
        return type1;
    }
    public void setType1(String type1) {
        this.type1 = type1;
    }
    public String getType2() {
        return type2;
    }
    public void setType2(String type2) {
        this.type2 = type2;
    }
    public String getEsummary() {
        return esummary;
    }
    public void setEsummary(String esummary) {
        this.esummary = esummary;
    }
}
