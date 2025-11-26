package edu.visang.vivasam.opendata.mapper;

import edu.visang.vivasam.opendata.model.EducourseInfo;
import edu.visang.vivasam.opendata.model.MetaCode;
import edu.visang.vivasam.opendata.model.MetaData;
import edu.visang.vivasam.opendata.model.PhotoZoneMain;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface OpenDataMapper {

    public List<EducourseInfo> channelList(@Param("memberId") String memberId);

    public List<MetaCode> metaCode(Map<String, Object> modelMap);

    public List<MetaCode> getCodeListByGroupCode();

    public List<MetaData> metaDataImg(Map<String, Object> modelMap);

    public List<MetaData> metaDataMov(Map<String, Object> modelMap);

    String getPhotoZoneIdx();

    public List<Map<String, Object>> photoZoneMain(@Param("PHOTO_IDX") String PHOTO_IDX);

    int chkServiceNotificationApply(Map<String, Object> params);

    int serviceNotificationApply(Map<String, Object> params);

    List<MetaCode> fastMusicLibraryCode(String codeGroupId);

    List<MetaData> fastMusicLibraryData(Map<String, Object> modelMap);

    public int metaDataCnt(Map<String, Object> modelMap);
}
