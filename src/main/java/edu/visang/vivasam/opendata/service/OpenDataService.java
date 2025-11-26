package edu.visang.vivasam.opendata.service;

import edu.visang.vivasam.common.utils.PageUtils;
import edu.visang.vivasam.opendata.mapper.OpenDataMapper;
import edu.visang.vivasam.opendata.model.EducourseInfo;
import edu.visang.vivasam.opendata.model.MetaCode;
import edu.visang.vivasam.opendata.model.MetaData;
import edu.visang.vivasam.opendata.model.PhotoZoneMain;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class OpenDataService {
    @Autowired
    OpenDataMapper openDataMapper;

    public List<EducourseInfo> channelList(String memberId) {
        return  openDataMapper.channelList(memberId);
    }

    public List<MetaCode> metaCode(String[] para) {
        Map<String, Object> modelMap = new HashMap<>();
        modelMap.put("ctype", para[0]);
        modelMap.put("code", para[1]);
        for ( int i=1;i < para.length -1 ;i++ ) {
            modelMap.put("code"+i, para[i+1]);
        }
        return  openDataMapper.metaCode(modelMap);
    }

    public List<MetaCode> getCodeListByGroupCode() { return openDataMapper.getCodeListByGroupCode();}

    public Page<MetaData> metaData(int page, int pageSize, String[] para) {
        Map<String, Object> modelMap = new HashMap<>();
        modelMap.put("pageno", Integer.parseInt(para[0]));
        modelMap.put("pagesize", Integer.parseInt(para[1]));
        modelMap.put("ctype", para[2]);
        modelMap.put("code1", para[3]);
        modelMap.put("code2", para[4]);
        modelMap.put("code3", para[5]);
        int offset = (Integer.parseInt(para[0]) - 1) * Integer.parseInt(para[1]);
        modelMap.put("offset", offset);

        List<MetaData> list = null;
        int totalCnt = 0;
        try {
            if("img".equals(para[2])){
                list = openDataMapper.metaDataImg(modelMap);
                modelMap.put("fileType", "FT203");
                totalCnt = openDataMapper.metaDataCnt(modelMap);
                if (list.size() > 0) list.get(0).setTotalCnt(Integer.toString(totalCnt));
            }else{
                list = openDataMapper.metaDataMov(modelMap);
                modelMap.put("fileType", "FT201");
                totalCnt = openDataMapper.metaDataCnt(modelMap);
                if (list.size() > 0) list.get(0).setTotalCnt(Integer.toString(totalCnt));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        page = page - 1;
        PageRequest request = new PageRequest(page, pageSize);
        return PageUtils.generatePageMeta(list, request);
    }

    /* 비바샘 포토존 */
    public List<Map<String, Object>> photoZoneMain(@Param("PHOTO_IDX") String PHOTO_IDX){
        if(StringUtils.isBlank(PHOTO_IDX)) {
            PHOTO_IDX = openDataMapper.getPhotoZoneIdx();
        }
        return openDataMapper.photoZoneMain(PHOTO_IDX);
    };

    public Map<String, Object> serviceNotificationApply(Map<String, Object> params) throws Exception {
        Map<String, Object> result = new HashMap<String, Object>();
        String code = "0000";
        String msg = "알림 신청되었습니다.";
        int cnt = 0;

        try {
            String[] serviceArr = Objects.toString(params.get("serviceNm")).split(",");
            if(serviceArr.length > 0) {
                for(int i=0; i<serviceArr.length; i++) {
                    String serviceName = serviceArr[i];
                    params.put("serviceName", serviceName);
                    // 신청여부 조회
                    int chkCnt = openDataMapper.chkServiceNotificationApply(params);
                    if(chkCnt == 0) {
                        cnt += openDataMapper.serviceNotificationApply(params);
                    }
                }
                // 신청가능한 알림이 없는 경우
                if(cnt == 0) {
                    code = "1111";
                    msg = "이미 신청하셨습니다. 서비스 오픈 시 안내드리겠습니다.";
                }
            }
        } catch(Exception e) {
            e.printStackTrace();
            code = "2222";
            msg = "처리 중 오류가 발생하였습니다.";
        }
        result.put("code", code);
        result.put("msg", msg);

        return result;
    }

    public List<MetaCode> fastMusicLibraryCode(String codeGroupId) {
        return  openDataMapper.fastMusicLibraryCode(codeGroupId);
    }


    public List<MetaData> fastMusicLibraryData(int pageNo, int pageSize, String para) {
        Map<String, Object> modelMap = new HashMap<>();
        modelMap.put("pageNo", pageNo);
        modelMap.put("pageSize", pageSize);
        modelMap.put("type1", para);

        List<MetaData> list = null;
        list = openDataMapper.fastMusicLibraryData(modelMap);

        PageRequest request = new PageRequest(pageNo, pageSize);
        return list;
    }
}
