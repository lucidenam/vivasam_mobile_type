package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.CommonMapper;
import edu.visang.vivasam.common.model.*;
import edu.visang.vivasam.common.policy.FileRenamePolicy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CommonService {

    @Autowired
    CommonMapper commonMapper;

    @Autowired
    EmailService emailService;

    public List<Map<String, Object>> vscodeList(String code) {
        return commonMapper.vscodeList(code);
    }

    public List<Map<String, Object>> codeList(String grpCode, String refCode) {
        Map<String, Object> params = new HashMap<>();
        params.put("grpCode", grpCode);
        params.put("refCode", refCode);
        return commonMapper.codeList(params);
    }

    public List<Map<String, Object>> subjectCodeList(String schLvlCd) {
        return commonMapper.subjectCodeList(schLvlCd);
    }

    public String smartUploadImage(List<MultipartFile> uploadFileList,
                                   String realpath) throws Exception {
        String org_file_name = "";
        String real_file_name = "";

        // 업로드된 파일에 대한 작업을 진행한다
        for (MultipartFile file : uploadFileList) {
            org_file_name = file.getOriginalFilename();
            if ("".equals(org_file_name)) {
                continue;
            }
            real_file_name = fileCopy(org_file_name, realpath, file);
        }
        return real_file_name;
    }

    public String smartUploadImage(List<MultipartFile> uploadFileList,
                                   String filename,
                                   String realpath) throws Exception {
        String org_file_name = "";
        String real_file_name = "";

        // 업로드된 파일에 대한 작업을 진행한다
        for (MultipartFile file : uploadFileList) {
            org_file_name = file.getOriginalFilename();

            if ("".equals(org_file_name) && "".equals(filename)) {
                continue;
            }
            real_file_name = fileCopy(org_file_name, realpath, file);
        }
        return real_file_name;
    }

    public List<String> smartUploadImageList(List<MultipartFile> uploadFileList, String realpath, String[] filename) throws Exception {
        List<String> fileList = new ArrayList<>();
        String org_file_name = "";
        String real_file_name = "";

        // 업로드된 파일에 대한 작업을 진행한다
        for (int i=0; i<uploadFileList.size();i++) {
            MultipartFile file = uploadFileList.get(i);
            org_file_name = URLDecoder.decode(filename[i], "UTF-8");
            //org_file_name = file.getOriginalFilename();

            if ("".equals(org_file_name)) {
                continue;
            }
            // StandardServletMultipartResolver encoding 문제
            real_file_name = fileCopy(org_file_name, realpath, file);
            //real_file_name = fileCopy(new String(org_file_name.getBytes("ISO-8859-1"), "UTF-8"), realpath, file);
            fileList.add(real_file_name);
        }
        return fileList;
    }


    public String fileCopy(String filename, String realpath, MultipartFile file) throws IOException {
        String real_file_name;
        File realFile = new File(realpath + File.separator + filename);
        realFile = new FileRenamePolicy().rename(realFile);
        real_file_name = realFile.getName();

        // 업로드된 파일을 다른 이름으로 복사(System 타임을 사용)
        File destination = new File(realpath + File.separator + real_file_name);
        FileCopyUtils.copy(file.getInputStream(), new FileOutputStream(destination));
        return real_file_name;
    }

    @Transactional
    public int sendEMail(EmailInfo emailInfo) {
        emailService.saveEMail(emailInfo);

        return 1;
    }

    public List<ConvertedDocCondition> convertedSmartDocumentList(ConvertedDocCondition cdc) {
        return commonMapper.convertedSmartDocumentList(cdc);
    }

    public List<ConvertedDocCondition> convertedDocumentList(ConvertedDocCondition cdc) {
        return commonMapper.convertedDocumentList(cdc);
    }

    @Transactional
    public void applyPoint(PointInfo point) {
        // SP_POINT 프로시저 변환
        String actionType = point.getActionType();

        if (!StringUtils.hasText(actionType) || actionType.length() != 5) {
            throw new IllegalArgumentException("INVALID PARAMETER [ACTION_TYPE]");
        }

        // PO200 : 담기(COKE), PO300 : 추천(GOOD), PO600 : 조회(VIEW), PO700(DOWN) : 다운
        String pointType = "PO" + actionType.substring(2, 3) + "00";

        String memberId = point.getMemberId();
        String refMemberId = point.getRefMemberId();
        String contentType = point.getContentType();
        String refContentType = point.getRefContentType();
        String contentId = point.getContentId();
        String refContentId = point.getRefContentId();
        int count = point.getCount();

        if ("AC310".equals(actionType)) { // 굿 하기
            if (!StringUtils.hasText(refMemberId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_MEMBER_ID]");}
            if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
            if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 1, refContentType, refContentId));
            commonMapper.insertSocialContentHis(new PointInfo(refMemberId, refContentType, refContentId, pointType, 1, actionType));
        } else if ("AC320".equals(actionType)) { // 굿 취소
            if (!StringUtils.hasText(refMemberId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_MEMBER_ID]");}
            if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
            if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, -1, refContentType, refContentId));
            commonMapper.insertSocialContentHis(new PointInfo(refMemberId, refContentType, refContentId, pointType, -1, actionType));
        } else if ("AC110".equals(actionType) && "SN100".equals(contentType)) { // 톡 작성
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 2, contentType, contentId));
            if (refContentType != null && refContentId != null) {
                commonMapper.insertSocialContentHis(new PointInfo(memberId, refContentType, refContentId, pointType, 2, actionType));
            }
        } else if ("AC120".equals(actionType) && "SN100".equals(contentType)) { // 톡 삭제
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -2, contentType, contentId));
            if (StringUtils.hasLength(refContentType) && StringUtils.hasLength(refContentId)) {
                commonMapper.insertSocialContentHis(new PointInfo(memberId, refContentType, refContentId, pointType, -2, actionType));
            }
        } else if ("AC110".equals(actionType) && "SN201".equals(contentType)) { // 댓글 작성
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            if (!StringUtils.hasText(refMemberId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_MEMBER_ID]");}
            if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
            if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 1, contentType, contentId));
            commonMapper.insertSocialContentHis(new PointInfo(memberId, contentType, contentId, pointType, 1, actionType));
            commonMapper.insertSocialContentHis(new PointInfo(memberId, refContentType, refContentId, pointType, 1, actionType));
            commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 1, contentType, contentId));
        } else if ("AC210".equals(actionType)) { // 콕 하기
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
            if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 1, refContentType, refContentId));
            commonMapper.insertSocialContentHis(new PointInfo(memberId, refContentType, refContentId, pointType, 1, actionType));
            if (StringUtils.hasLength(refMemberId)) {
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 1, refContentType, refContentId));
            }
        } else if ("AC220".equals(actionType)) { // 콕 취소
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
            if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -1, refContentType, refContentId));
            commonMapper.insertSocialContentHis(new PointInfo(memberId, refContentType, refContentId, pointType, -1, actionType));
            if (StringUtils.hasLength(refMemberId)) {
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, -1, refContentType, refContentId));
            }
        } else if ("AC401".equals(actionType)) { // 공개 교안 작성
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 7, contentType, contentId));
            if (StringUtils.hasLength(refMemberId)) { // 타인 교안 이용시 원본교안 작성자에게 포인트 적립
                if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
                if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 2, refContentType, refContentId));
            }
        } else if ("AC402".equals(actionType)) { // 비공개 교안 작성
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 5, contentType, contentId));
            if (StringUtils.hasLength(refMemberId)) { // 타인 교안 이용시 원본교안 작성자에게 포인트 적립
                if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
                if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 2, refContentType, refContentId));
            }
        } else if ("AC403".equals(actionType)) { // 공개 교안 삭제
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -7, contentType, contentId));
            if (StringUtils.hasLength(refMemberId)) { // 타인 교안 이용시 원본교안 작성자에게 포인트 차감
                if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
                if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, -2, refContentType, refContentId));
            }
        } else if ("AC404".equals(actionType)) { // 비공개 교안 삭제
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -5, contentType, contentId));
            if (StringUtils.hasLength(refMemberId)) { // 타인 교안 이용시 원본교안 작성자에게 포인트 차감
                if (!StringUtils.hasText(refContentType)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_TYPE]");}
                if (!StringUtils.hasText(refContentId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_CONTENT_ID]");}
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, -2, refContentType, refContentId));
            }
        } else if ("AC501".equals(actionType)) { // 회원가입
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 10, null, null));
            if (StringUtils.hasLength(refMemberId)) { // 회원가입 (추천자)
                commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 2, null, null));
            }
        } else if ("AC502".equals(actionType)) { // 개인 정보 공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (count < 1) {throw new IllegalArgumentException("INVALID PARAMETER [COUNT]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, count, null, null));
        } else if ("AC503".equals(actionType)) { // 개인 정보 비공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (count < 1) {throw new IllegalArgumentException("INVALID PARAMETER [COUNT]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -1 * count, null, null));
        } else if ("AC504".equals(actionType)) { // 로그인
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            String selectMemberId = commonMapper.selectMemberSpPointCheck(memberId);
            if (StringUtils.hasLength(selectMemberId)) {
                commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 1, null, null));
            }
        } else if ("AC507".equals(actionType) || "AC508".equals(actionType)) { // 즐겨찾기 설정 || HOME으로 설정
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 1, null, null));
        } else if ("AC505".equals(actionType)) { // Follow
            if (!StringUtils.hasText(refMemberId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_MEMBER_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, 1, null, null));
        } else if ("AC506".equals(actionType)) { // Unfollow
            if (!StringUtils.hasText(refMemberId)) {throw new IllegalArgumentException("INVALID PARAMETER [REF_MEMBER_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(refMemberId, pointType, -1, null, null));
        } else if ("AC509".equals(actionType) || "AC510".equals(actionType) || "AC512".equals(actionType) || "AC515".equals(actionType)) { // 제안항목 등록 || 문의항목 등록 || 비공개 업자료 등록 || 업자료 공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 1, contentType, contentId));
        } else if ("AC514".equals(actionType) || "AC516".equals(actionType)) { // 비공개 업자료 삭제 || 업자료 비공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -1, contentType, contentId));
        } else if("AC511".equals(actionType) || "AC405".equals(actionType)) { // 공개 업자료 등록 || 교안 공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, 2, contentType, contentId));
        } else if("AC513".equals(actionType) || "AC406".equals(actionType)) { // 공개 업자료 삭제 || 교안 비공개
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            commonMapper.insertPointHistoryInfo(new PointInfo(memberId, pointType, -2, contentType, contentId));
        } else if("AC601".equals(actionType)) { // 컨텐츠 조회
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}
            int socialContentHisCount = commonMapper.selectSocialContentHisCount(new PointInfo(memberId, contentType, contentId, pointType));
            if (socialContentHisCount <= 0) {
                commonMapper.insertSocialContentHis(new PointInfo(memberId, contentType, contentId, pointType, 1, actionType));
            }
        } else if("AC701".equals(actionType)) { // 컨텐츠 다운로드
            if (!StringUtils.hasText(memberId)) {throw new IllegalArgumentException("INVALID PARAMETER [MEMBER_ID]");}
            if (!StringUtils.hasText(contentType)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_TYPE]");}
            if (!StringUtils.hasText(contentId)) {throw new IllegalArgumentException("INVALID PARAMETER [CONTENT_ID]");}

            int socialContentHisCount = commonMapper.selectSocialContentHisCount(new PointInfo(memberId, contentType, contentId, pointType));
            if (socialContentHisCount <= 0) {
                commonMapper.insertSocialContentHis(new PointInfo(memberId, contentType, contentId, pointType, 1, actionType));
            }
        } else {
            throw new IllegalArgumentException("NO ACTION [NO ACTION]");
        }
    }

    public int getContentMemLevelCheck(String contentGubun, String contentId) {
        return commonMapper.getContentMemLevelCheck(contentGubun, contentId);
    }

    public int setPushAlarms(PushAlarms pushAlarms) {
        return commonMapper.setPushAlarms(pushAlarms);
    }

    public PushAlarms getPushAlarms(String memberId) {
        return commonMapper.getPushAlarms(memberId);
    }

    public int insertEpkStatusInfo(EpkStatusInfo epkStatusInfo) {
        return commonMapper.insertEpkStatusInfo(epkStatusInfo);
    }

    /**
     * 회원학교 입력되었는지 체크
     * @param memberId 사용자 아이디
     * @return
     */
    public Map<String,Object> getMemberSchoolYn(String memberId) {
        return commonMapper.getMemberSchoolYn(memberId);
    }

    public int insertEpkStatusInfoKEy(EpkStatusInfo epkStatusInfo) {
        return commonMapper.insertEpkStatusInfoKEy(epkStatusInfo);
    }

    public DocumentContentInfo getDocumentContentInfo(DocumentContentInfo dci) {
        return commonMapper.getDocumentContentInfo(dci);
    }
}