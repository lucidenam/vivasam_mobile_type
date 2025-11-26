package edu.visang.vivasam.member.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class MarketingAgree {
    private String memberId;
    private String marketingSmsYn;
    private String marketingEmailYn;
    private String marketingTelYn;
    private String admId;
    private int result;
    // 2024 07 11 마케팅 활용동의 프로시저 분리하면서 추가
	private String recentMarketingSmsYn;
	private String recentMarketingEmailYn;
	private String recentMarketingTelYn;
}
