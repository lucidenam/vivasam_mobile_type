package edu.visang.vivasam.opendata.model;

import java.util.List;

public class MetaCode {

    String code;
    String name;
    String refCode;
    String totalCnt;

    String codeGroupId;

    String ext1;
    String ext2;
    String ext3;
    String ext4;

    public String getExt4() {
        return ext4;
    }
    public void setExt4(String ext4) {
        this.ext4 = ext4;
    }
    public String getExt1() {
        return ext1;
    }
    public void setExt1(String ext1) {
        this.ext1 = ext1;
    }
    public String getExt2() {
        return ext2;
    }
    public void setExt2(String ext2) {
        this.ext2 = ext2;
    }
    public String getExt3() {
        return ext3;
    }
    public void setExt3(String ext3) {
        this.ext3 = ext3;
    }
    public String getCodeGroupId() {
        return codeGroupId;
    }

    public void setCodeGroupId(String codeGroupId) {
        this.codeGroupId = codeGroupId;
    }
    List<MetaCodeSub> codeSub = null;



    public List<MetaCodeSub> getCodeSub() {
        return codeSub;
    }
    public void setCodeSub(List<MetaCodeSub> codeSub) {
        this.codeSub = codeSub;
    }
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getRefCode() {
        return refCode;
    }
    public void setRefCode(String refCode) {
        this.refCode = refCode;
    }
    public String getTotalCnt() {
        return totalCnt;
    }
    public void setTotalCnt(String totalCnt) {
        this.totalCnt = totalCnt;
    }

}
