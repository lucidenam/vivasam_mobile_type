package edu.visang.vivasam.common.model;

import lombok.Data;

import java.util.Arrays;

@Data
public class EducourseSearch {
    /** 공통 **/
    //검색어
    private String word;
    //검색유형
    private String type;

    /** 교과 자료 **/
    //학교급
    private String[] schoolLevels;
    //교육과정
    private String[] eduYears;
    //교과
    private String[] subjectCodes;
    //자료유형
    private String[] type1;
    //파일형식
    private String[] extNames;

    /** 라이브러리 **/
    //자료 유형
    private String[] fileTyles;
    //카테고리
    private String[] categories;

    @Override
    public String toString() {
        return "EducourseSearch{" +
                "word='" + word + '\'' +
                ", type='" + type + '\'' +
                ", schoolLevels=" + Arrays.toString(schoolLevels) +
                ", eduYears=" + Arrays.toString(eduYears) +
                ", type1=" + Arrays.toString(type1) +
                ", extNames=" + Arrays.toString(extNames) +
                ", subjectCodes=" + Arrays.toString(subjectCodes) +
                '}';
    }
}
