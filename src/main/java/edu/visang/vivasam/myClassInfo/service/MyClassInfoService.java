package edu.visang.vivasam.myClassInfo.service;

import edu.visang.vivasam.common.service.CommonService;
import edu.visang.vivasam.common.model.PointInfo;
import edu.visang.vivasam.common.utils.PageUtils;
import edu.visang.vivasam.member.model.MemberInfo;
import edu.visang.vivasam.myClassInfo.mapper.MyClassInfoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;

@Service
public class MyClassInfoService {

    private static final Logger logger = LoggerFactory.getLogger(MyClassInfoService.class);

    @Autowired
    MyClassInfoMapper myClassInfoMapper;

    @Autowired
    CommonService commonService;

    public List<Map<String, Object>> myTextBookInfoList(String memberId) {
        return myClassInfoMapper.myTextBookInfoList(memberId);
    }

    public MemberInfo getMemberInfo(String memberId) {
        return myClassInfoMapper.getMemberInfo(memberId);
    }

    /**
     * 추천교과 자료
     */
    public List<Map<String, Object>> rRecommendArea(String subjectType , String areaType) {
        return myClassInfoMapper.rRecommendArea(subjectType,areaType);
    }

    /**
     * 내교과서 설정 (대표 교과명에 대한 103코드 조회)
     */
    public String getCourseCdInfo(String subjectNm, String schoolLvlCd) {
        return myClassInfoMapper.getCourseCdInfo(subjectNm, schoolLvlCd);
    }

    /**
     * 내교과서 설정 (설정대상 교과목조회)
     */
    //public List<Map<String,Object>> rTextbookList(String esCodelistId, String msCodelistId, String hsCodelistId, String memberId) {
    public List<Map<String,Object>> getTextbookListByCourse(String courseCd, String memberId, String mdValue) {
        return myClassInfoMapper.getTextbookListByCourse(courseCd,  memberId, mdValue);
    }
    /**
     * 내교과서 설정 (내교과목록 조회)
     */
    public List<Map<String, Object>> rSubjectList() {
        return myClassInfoMapper.rSubjectList();
    }

    /**
     * 최근 담은 자료
     * @return
     */
    public Page<Map<String, Object>> myPutDataList(int page, int pageSize, String memberId, String folderId) {
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = myClassInfoMapper.myPutDataList(request, memberId, folderId);
        int count = myClassInfoMapper.myPutDataListCount(request, memberId, folderId);
        return new PageImpl<>(list, request, count);
    }

    public void deletePutData(String memberId, String folderId, String contentGubun,String contentId) {

        PointInfo pointInfo = new PointInfo();
        pointInfo.setActionType("AC220");
        pointInfo.setMemberId(memberId);
        pointInfo.setRefContentType(contentGubun);
        pointInfo.setRefContentId(contentId);

        // 데이터에 존재할 경우
        int delete = myClassInfoMapper.deletePutData(memberId, folderId, contentGubun, contentId);
        if(delete > 0) {
            // 담기취소 포인트
            commonService.applyPoint(pointInfo);
        }

        // 백업 데이터에 존재할 경우
        int deleteBak = myClassInfoMapper.deletePutDataBak(memberId, folderId, contentGubun, contentId);
        if(deleteBak > 0) {
            // 담기취소 포인트
            commonService.applyPoint(pointInfo);
        }
    }

    public List<Map<String, Object>> myFolderList(String memberId) {
        List<Map<String, Object>> list = myClassInfoMapper.myFolderList(memberId);
        return list;
    }

    public Page<Map<String, Object>> myDownDataList(int page, int pageSize, String memberId, String folderId, String type1Cd) {
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = myClassInfoMapper.myDownDataList(request, memberId, folderId, type1Cd);
        int count = myClassInfoMapper.myDownDataListCount(request, memberId, folderId, type1Cd);
        return new PageImpl<>(list, request, count);
    }

    public List<Map<String, Object>> myDownDataTextbookList(String memberId) {
        List<Map<String, Object>> list = myClassInfoMapper.myDownDataTextbookList(memberId);
        return list;
    }

    /**
     * 교과 설정을 변경한다.
     * @return
     */
    public int changeMySubject(String mainSubject, String secondSubject,String memberId){
        int rltCnt = myClassInfoMapper.changeMySubject(mainSubject, secondSubject, memberId);
        return rltCnt;
    }

    /**
     * 교과서 삭제 처리
     * @return
     */
    public int deleteMyTextbook(String textbookCd,String memberId){
        int rltCnt = myClassInfoMapper.deleteMyTextbook(textbookCd,memberId);
        return rltCnt;
    }

    /**
     * 나의 교실 > 내 교과서 추가
     * @return
     */
    public int insertMyTextbook(String textbookCd,String memberId){
        int rltCnt = myClassInfoMapper.insertMyTextbook(textbookCd,memberId);
        return rltCnt;
    }


    public List<Map<String, Object>> myMaterialViewList(String memberId) {
        return myClassInfoMapper.myMaterialViewList(memberId);
    }

}