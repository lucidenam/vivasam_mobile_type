package edu.visang.vivasam.common.model;

import lombok.Data;

@Data
public class PointInfo {
    /**
     * 포인트 적용 대상 활동 (VS_CODE의 AC100, AC200, AC300, AC400, AC500의 하위 분류)
     */
    private String actionType = null;
    /**
     * 컨텐츠 구분 (VS_CODE의 CN000의 하위 분류)
     */
    private String contentType = null;
    /**
     * 컨텐츠 ID
     */
    private String contentId = null;
    /**
     * 회원ID
     */
    private String memberId = null;
    /**
     * 관련 컨텐츠 구분 (VS_CODE의 CN000의 하위 분류)
     */
    private String refContentType = null;
    /**
     * 관련 컨텐츠 ID
     */
    private String refContentId = null;
    /**
     * 관련 회원ID
     */
    private String refMemberId = null;
    /**
     * 개인정보 공개시 변경된 갯수
     */
    private int count = 0;

    /**
     * 2024.07.31 프로시저 parameter용 변수
     * */
    private int point = 0;
    private String type = null;
    private String ref = null;
    private String contentGubun = null;
    private String contentTypeId = null;

    public  PointInfo(){}

    public PointInfo(String memberId, String contentGubun, String contentId, String type, int point, String ref){
        this.memberId = memberId;
        this.contentGubun = contentGubun;
        this.contentId = contentId;
        this.type = type;
        this.point = point;
        this.ref = ref;
    }

    public PointInfo(String memberId, String contentType, String contentId, String pointType){
        this.memberId = memberId;
        this.contentType = contentType;
        this.contentId = contentId;
        this.type = pointType;
    }

    public PointInfo(String memberId, String type, int point, String contentType, String contentTypeId){
        this.memberId = memberId;
        this.type = type;
        this.point = point;
        this.contentType = contentType;
        this.contentTypeId = contentTypeId;
    }
}
