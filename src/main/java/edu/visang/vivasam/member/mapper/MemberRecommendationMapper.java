package edu.visang.vivasam.member.mapper;

import edu.visang.vivasam.member.model.MemberRecommendationParameter;
import edu.visang.vivasam.member.model.MemberRecommendationResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MemberRecommendationMapper {

    void insertRecommendationCode(@Param("memberId") String memberId, @Param("recoCode") String recoCode);
    // 추천인 코드 조회
    String getRecommendationCode(String memberId);

    String getRecommendationCodeForCheckDuplicate(String recoCode);

    int getValidateRecommendationCode(String recoCode);

    // 피추천인 건수 조회
    int getMemberRecommendationCount(MemberRecommendationParameter parameter);

    // 피추천인 목록 조회
    List<MemberRecommendationResult> getMemberRecommendationList(MemberRecommendationParameter parameter);

    // 사용자의 전체 포인트 조회
    Integer getTotalPoint(String memberId);

    // 사용자의 사용한 포인트 조회
    Integer getUsedPoint(@Param("eventId") String eventId, @Param("memberId") String memberId);

}
