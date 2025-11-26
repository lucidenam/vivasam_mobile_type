package edu.visang.vivasam.member.service;

import edu.visang.vivasam.member.mapper.MemberMapper;
import edu.visang.vivasam.member.mapper.MemberMileageMapper;
import edu.visang.vivasam.member.model.Mileage;
import edu.visang.vivasam.member.model.MileageCode;
import edu.visang.vivasam.myInfo.model.MyInfoLeave;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class MemberMileageService {

    private static final Logger logger = LoggerFactory.getLogger(MemberMileageService.class);

    @Autowired
    MemberMapper memberMapper;

    @Autowired
    MemberMileageMapper memberMileageMapper;

    /**
     * 마일리지 적립
     * @param mileage 마일리지
     */
    @Transactional
    public boolean insertMileagePlus(Mileage mileage) {

        mileage.setTargetType(StringUtils.isEmpty(mileage.getTargetType()) ? "MV" : mileage.getTargetType());
        // 필수값 체크
        if(StringUtils.isEmpty(mileage.getMemberId())) {
            mileage.setError("Empty data : MEMBER_ID");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        if(StringUtils.isEmpty(mileage.getMileageCode())) {
            mileage.setError("Empty data : MILEAGE_CODE");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        boolean isNumeric =  String.valueOf(mileage.getAmount()).matches("[+-]?\\d*(\\.\\d+)?");
        if(!isNumeric) {
            mileage.setError("Not numeric : AMOUNT");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        if(mileage.getAmount() < 1) {
            mileage.setError("Empty data : AMOUNT");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        int result = memberMileageMapper.insertMileagePlus(mileage);
        if(result == 0) {
            mileage.setError("Not saved data (DB error)");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        return true;
    }

    /**
     * 마일리지 차감
     * @param mileage 마일리지
     */
    @Transactional
    public boolean insertMileageMinus(Mileage mileage) {

        mileage.setTargetType(StringUtils.isEmpty(mileage.getTargetType()) ? "MV" : mileage.getTargetType());

        // 필수값 체크
        if(StringUtils.isEmpty(mileage.getMemberId())) {
            mileage.setError("Empty data : MEMBER_ID");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        if(StringUtils.isEmpty(mileage.getMileageCode())) {
            mileage.setError("Empty data : MILEAGE_CODE");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        boolean isNumeric =  String.valueOf(mileage.getAmount()).matches("[+-]?\\d*(\\.\\d+)?");
        if(!isNumeric) {
            mileage.setError("Not numeric : AMOUNT");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }
        if(mileage.getAmount() < 1) {
            mileage.setError("Empty data : AMOUNT");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }

        // 마일리지 잔액 체크
        int usableMileage = memberMileageMapper.getMemberMileageUsableAmount(mileage.getMemberId()); // 사용가능 마일리지
        int neededMileage = mileage.getAmount();	// 지불할 마일리지

        int result = 0;
        if(usableMileage > neededMileage) {
            result =  memberMileageMapper.insertMileageMinus(mileage);
            if(result == 0) {
                mileage.setError("Not saved data (DB error)");
                memberMileageMapper.insertMileageError(mileage);
                return false;
            }
        } else {
            mileage.setError("Not enough mileage (usable : " + usableMileage + ", needed : " + neededMileage + ")");
            memberMileageMapper.insertMileageError(mileage);
            return false;
        }

        return true;
    }

    @Transactional
    public int getMemberMileageUsableAmount(String memberId) {
        return memberMileageMapper.getMemberMileageUsableAmount(memberId);
    }

    @Transactional
    public int getMileageCntByMileageCode(Mileage mileage) {
        return memberMileageMapper.getMileageCntByMileageCode(mileage);
    }

    @Transactional
    public int getMileageCntByEventId(Mileage mileage) {
		return memberMileageMapper.getMileageCntByEventId(mileage);
	}

    @Transactional
    public int getMileageCntByTodayLogin(Mileage mileage) {
        return memberMileageMapper.getMileageCntByTodayLogin(mileage);
    }

    public void saveRecoIdMileagePlus(String recommendId, String memberId) {
        // 신규회원 입장에서 recommendId(추천인) memberId는 본인(신규회원)id
        Mileage mileage = new Mileage(recommendId, MileageCode.JOIN_RECO.getAmount(), MileageCode.JOIN_RECO.getCode());
        mileage.setTargetMenu("RECOMMEND_ID_POINT_"+memberId);
        memberMileageMapper.saveRecoIdMileagePlus(mileage);
    }

    public void saveRecoIdMileageMinus(MyInfoLeave parameter) {
        String memberId = parameter.getDomMemberId();
        String recommendId = memberMapper.selectRecommendId(memberId);

        if (!StringUtils.isEmpty(recommendId)) {
            memberId = recommendId;
            Mileage mileage = new Mileage(memberId, MileageCode.JOIN_RECO.getAmount(), MileageCode.JOIN_RECO.getCode());
            mileage.setTargetMenu("RECOMMEND_ID_POINT_"+parameter.getDomMemberId());
            memberMileageMapper.saveRecoIdMileageMinus(mileage);
        }
    }

    // 비바샘이 간다 올해 참여 내역
	public int checkVivasamGoForYear(Mileage mParameter) {
		return memberMileageMapper.checkVivasamGoForYear(mParameter);
	}
}
