package edu.visang.vivasam.creative.mapper;

import edu.visang.vivasam.creative.model.CreativeParam;
import edu.visang.vivasam.creative.model.CreativeResult;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CreativeMapper {
	List<CreativeResult> getClassDataCalendar(CreativeParam param);
	List<CreativeResult> getClassData(CreativeParam param);
	List<CreativeResult> getClassDataByRelation(CreativeParam param);
	List<CreativeResult> getAllClassData(CreativeParam param);

	/*

	CreativeResult getActivityData(CreativeParam param);

	List<CreativeResult> getActivityDataList(CreativeParam param);

	List<CreativeResult> getActivityRelationData(CreativeParam param);

	List<CreativeResult> getMediaData(CreativeParam param);

	int getMediaDataCnt(CreativeParam param);

	List<CreativeResult> getAllActivityData();*/
}
