package edu.visang.vivasam.member.service;

import edu.visang.vivasam.common.utils.AlphaNumCodeUtils;
import edu.visang.vivasam.member.mapper.MemberRecommendationMapper;
import edu.visang.vivasam.member.model.MemberRecommendationParameter;
import edu.visang.vivasam.member.model.MemberRecommendationResult;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberRecommendationService {

    @Autowired
    MemberRecommendationMapper memberRecommendationMapper;

    // 추천인 코드 등록
    public String insertRecommendationCode(String memberId) {
        String recoCode;

        boolean duplicated = true;
        do {
            recoCode = AlphaNumCodeUtils.generateRecommendationCode();
            // NULL 추천코드는 사용하지 않도록
            if ("NULL".equals(recoCode) || "WU11".equals(recoCode)) continue;
            
            String checkRecoCode = memberRecommendationMapper.getRecommendationCodeForCheckDuplicate(recoCode);
            if (checkRecoCode == null) {
                memberRecommendationMapper.insertRecommendationCode(memberId, recoCode);
                duplicated = false;
            }
        } while (duplicated);

        return recoCode;
    }

    public boolean validateRecommendationCode(String recoCode) {
        if (StringUtils.isBlank(recoCode)) return false;
        int cnt = memberRecommendationMapper.getValidateRecommendationCode(recoCode);
        return cnt == 1;
    }

    // 추천인 코드 조회
    public String getRecommendationCode(String memberId) {
        return memberRecommendationMapper.getRecommendationCode(memberId);
    }

    // 피추천인 건수 조회
    public int getMemberRecommendationCount(MemberRecommendationParameter parameter) {
        return memberRecommendationMapper.getMemberRecommendationCount(parameter);
    }

    // 피추천인 목록 조회
    public List<MemberRecommendationResult> getMemberRecommendationList(MemberRecommendationParameter parameter) {
        return memberRecommendationMapper.getMemberRecommendationList(parameter);
    }

    // 자신의 전체 포인트 조회
    public int getTotalPoint(String memberId) {
        Integer totalPoint = memberRecommendationMapper.getTotalPoint(memberId);
        if (totalPoint == null) return 0;
        return totalPoint;
    }

    // 사용한 포인트 조회
    public int getUsedPoint(String memberId) {
        // 451 : 2023년 스승의날 선물대잔치 이벤트
        Integer usedPoint = memberRecommendationMapper.getUsedPoint("451", memberId);
        if (usedPoint == null) return 0;
        return usedPoint;
    }

}
