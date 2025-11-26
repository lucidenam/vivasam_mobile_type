package edu.visang.vivasam.member.model;

import lombok.Data;

@Data
public class MemberRecommendationResult {

    private String memberId;
    private String name;
    private String cellphone;
    private String state;

    // 개인정보 마스킹처리
    public void masking() {
        this.memberId = this.memberId.replaceAll("(?<=.{3}).", "*");
        this.cellphone = this.cellphone.replaceAll("-[0-9]{4}-", "-****-");

        int len = this.name.length();
        StringBuilder sb = new StringBuilder();
        sb.append(this.name.charAt(0));
        for (int i = 0; i < len - 2; i++) {
            sb.append("*");
        }
        sb.append(this.name, len - 1, len);
        this.name = sb.toString();
    }

}

