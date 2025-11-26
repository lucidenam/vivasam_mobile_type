package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Data
@ToString
public class EventInfo {
    private String eventId;
    private String eventType;
    private String eventTypeName;
    private String eventName;
    private String eventBn;
    private String eventBnOrg;
    private String eventBnSav;
    private String eventBnPath;
    private String eventBnYn;
    private String eventMainBn;
    private String eventMainBnOrg;
    private String eventMainBnSav;
    private String eventMainBnPath;
    private String eventMainBnYn;
    private String eventPassBn;
    private String eventPassBnOrg;
    private String eventPassBnSav;
    private String eventPassBnPath;
    private String eventPassBnYn;
    private String eventSdate;
    private String eventEdate;
    private Date eventStartDate;
    private Date eventEndDate;
    private String eventPdate;
    private String eventUrl;
    private String eventAdmUrl;
    private String eventPubUrl;
    private String eventDesc;
    private String eventRegdate;
    private String eventRegid;
    private String eventRegname;
    private String eventModdate;
    private String eventModid;
    private String eventUseYn;
    private String eventDelYn;
    private String eventMobBnOrg;
    private String eventMobBnSav;
    private String eventMobBnPath;
    private String mobileApplyContents;
    private String mobileTerm;
    private String eventMobileBannerUseYn;

    /** 서브이벤트의 중복신청 허용여부 (Y: 서브이벤트 중복신청 가능 ,N: 서브이벤트 중복신청 불가), 이 속성은 상위이벤트에서만 의미를 가짐(서브이벤트에서 사용안함) */
    private String subDupYn;

    //	이벤트 리스트 페이징 관련 해서 추가된 부분이다.
    private String seq;
    private String pageNo;
    private String pageSize;
    private String schType;
    private String keyword;
    private String rowTotal;
    private String pageTotal;
    private int rowNum;

    /* 477 비버샘 팬클럽 이벤트*/
    private String joinSchCount;
    private String schName;
    private String orderNo;
    /* 477 비버샘 팬클럽 이벤트*/

    /* 485 비바샘 새학기를 부탁해 이벤트*/
    private String recommendId;
    private String recommendName;
    private String cnt;

    /* 이벤트 : 491 / 캠페인 : 3 중복참여로 인한 코드 추가 [ 2024-03-11 ~ 2024-03~12] */
    private String campaignId;
    private String memberId;

    /* 498 스승의날 좋아요 이벤트 */
    private String likeMemberId;
    private Boolean likeCheck;
    private String likeYn;
    private String eventAnswerDesc;

    /* 513 AI플랫폼 활용공모전 인기투표 이벤트*/
    private String item;
    private int totalCnt;

    /**
     * 이벤트 진행중 여부
     *
     * @return
     */
    public boolean isProgressing() {
        if (this.eventSdate == null || this.eventEdate == null) return false;
        Date now = new Date();
        return now.compareTo(this.eventStartDate) > 0 && now.compareTo(this.eventEndDate) < 0;
    }

}
