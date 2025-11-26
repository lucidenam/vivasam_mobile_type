package edu.visang.vivasam.member.mapper;

import edu.visang.vivasam.member.model.Mileage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMileageMapper {

	int getMemberMileageUsableAmount(String memberId);

	int insertMileagePlus(Mileage mileage);

	int insertMileageMinus(Mileage mileage);

	int insertMileageError(Mileage mileage);

	int getMileageCntByMileageCode(Mileage mileage);

	int getMileageCntByTodayLogin(Mileage mileage);

	void saveRecoIdMileagePlus(Mileage mileage);

	void saveRecoIdMileageMinus(Mileage mileage);

	int getMileageCntByEventId(Mileage mileage);

	int checkVivasamGoForYear(Mileage mParameter);
}
