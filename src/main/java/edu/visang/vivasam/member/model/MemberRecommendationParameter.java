package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class MemberRecommendationParameter {
    private int page = 1;
    private int size = 15;
    /** 추천인 아이디 */
    private String memberId;

}