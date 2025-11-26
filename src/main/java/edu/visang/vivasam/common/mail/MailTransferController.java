package edu.visang.vivasam.common.mail;

import edu.visang.vivasam.common.constant.VivasamConstant;
import edu.visang.vivasam.common.model.EpkStatusInfo;
import edu.visang.vivasam.common.policy.FileRenamePolicy;
import edu.visang.vivasam.common.service.CheckXSSService;
import edu.visang.vivasam.common.service.CommonService;
import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.cs.service.CsService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileOutputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mail")
public class MailTransferController {
	private final Log logger = LogFactory.getLog(this.getClass());
	
	@Autowired
	CheckXSSService checkXSSService;
	
	@Autowired
	CommonService commonService;

	@Autowired
	Environment environment;
    
    @Autowired
    private JavaMailSender mailSender; //servlet-context.xml에 등록한 bean

    @Autowired
    CsService csService;

	@RequestMapping(value = "/mailSending", method= RequestMethod.POST )
	public ResponseEntity<?> mailSending(HttpServletRequest request,
								@RequestParam(value = "filename", required = false, defaultValue = "") String filename,
								@RequestParam(value = "userId", required = false, defaultValue = "") String userId,
								@RequestParam(value = "fromMail", required = false, defaultValue = "") String fromMail,
								@RequestParam(value = "toMail", required = false, defaultValue = "") String toMail,
								@RequestParam(value = "title", required = false, defaultValue = "") String title,
								@RequestParam(value = "content", required = false, defaultValue = "") String content,
								@RequestParam(value = "mailType", required = false, defaultValue = "") String mailType
	) throws Exception {

		Map<String,String> resultMap = new HashMap<>();

		String real_file_name = "";

		logger.info("mailSending mailSending title System ===> " + title);
    	   
        fromMail = !"".equals(fromMail) ? checkXSSService.ReplaceValue(request, "fromMail", fromMail) : VivasamConstant.EMAIL_SENDER;	// 보내는 사람 이메일
        toMail = !"".equals(toMail) ? checkXSSService.ReplaceValue(request, "toMail", toMail) : VivasamConstant.EMAIL_SENDER;		// 받는 사람 이메일
        title = !"".equals(title) ? checkXSSService.ReplaceValue(request, "title", title) : "[" + userId + "] 서류인증 파일";	     // 이메일 제목
        content = !"".equals(content) ? checkXSSService.ReplaceValue(request, "content", content) : userId + " 서류인증 파일";  // 이메일 내용
        mailType = checkXSSService.ReplaceValue(request, "mailType", mailType); //빈값 => 비바샘, D => 개발자, A => 개발자 + 교과서웹기, T => 교과서웹기

        logger.info("mailSending mailSending title ===> " + title);
        
        try {
        	MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            
            List<MultipartFile> uploadFileList = multipartRequest.getFiles("uploadfile");
            
            String realpath = environment.getProperty("vivasam_fileroot") + environment.getProperty("vivasam_filepath_verifyfile");

        	logger.info("mailSending realpath 0 ===> " + realpath);

            
            if (uploadFileList.get(0) != null && uploadFileList.get(0).getSize() > 0) {
            	if(!new File(realpath).exists()){
        			new File(realpath).mkdirs();
        		}
            	
            	logger.info("mailSending realpath if ===> " + realpath);

                real_file_name = commonService.smartUploadImage(uploadFileList, filename, realpath);
                
                logger.info("mailSending real_file_name ===> " + real_file_name);
            	
            }
        	
        	MimeMessage message = mailSender.createMimeMessage();
        	MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "UTF-8");
          
        	messageHelper.setFrom(fromMail);   // 보내는사람 생략하거나 하면 정상작동을 안함
        	
        	//받는 사람이 특정되지 않은 경우 비바샘 계정 기본
        	if ("".equals(mailType)) {
        		messageHelper.setTo(toMail);      // 받는 사람 이메일
        	}
        	//받는 사람을 개발자로 특정함 또는 모두
        	if ("D".equals(mailType) || "A".equals(mailType)) {
        		messageHelper.addTo("shimwb@visang.com", "shimwb"); //받는 사람이 여러명인 경우
        		messageHelper.addTo("yunms@visang.com", "yunms"); //받는 사람이 여러명인 경우
        		messageHelper.addTo("yunyh@visang.com", "yunyh"); //받는 사람이 여러명인 경우
        	}
        	//받는 사람을 교과서웹서비스기획과로 특정함 또는 모두
        	if ("T".equals(mailType) || "A".equals(mailType)) {
        		messageHelper.addTo("haneh@visang.com", "haneh"); //받는 사람이 여러명인 경우
        		messageHelper.addTo("yangjs@visang.com", "yangjs"); //받는 사람이 여러명인 경우
        	}
        	
        	messageHelper.setSubject(title);  // 메일제목은 생략이 가능하다
        	messageHelper.setText(content);   // 메일 내용
        	
        	logger.info("mailSending file ext ===> " + real_file_name.substring(real_file_name.lastIndexOf("."), real_file_name.length()));
         
        	// 파일첨부
        	if (!"".equals(real_file_name)) {
        		DataSource dataSource = new FileDataSource(realpath + real_file_name);
        		//messageHelper.addAttachment(MimeUtility.encodeText("서류인증 파일" + real_file_name.substring(real_file_name.lastIndexOf(".") - 1, real_file_name.length()), "UTF-8", "B"), dataSource);
        		messageHelper.addAttachment(MimeUtility.encodeText(real_file_name, "UTF-8", "B"), dataSource);
        	}
         
        	mailSender.send(message);

			resultMap.put("code","0");
        	
        } catch(Exception e){
        	logger.info("mailSending ===> " + e.getMessage());
			resultMap.put("code","1");
        }
       
        return ResponseEntity.ok(resultMap);
    }

    // 메일 보내는 기능 빼고 파일3개로 늘림 mailSending -> teacherCertifyUpload
    @RequestMapping(value = "/teacherCertifyUpload", method = RequestMethod.POST)
    public ResponseEntity<?> teacherCertifyUpload(HttpServletRequest request,
                                                  @RequestParam(value = "userId", required = false, defaultValue = "") String userId,
                                                  @RequestParam(value = "filename", required = false, defaultValue = "") String[] filename,
                                                  @RequestParam(value = "content", required = false, defaultValue = "") String content,
                                                  @RequestParam(value = "type", required = false, defaultValue = "") String type) throws Exception {

        Map<String, String> resultMap = new HashMap<>();

        // 내용
        content = !"".equals(content) ? checkXSSService.ReplaceValue(request, "content", content) : userId + " 서류인증 파일"; // 이메일

        try {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;

            List<MultipartFile> uploadFileList = multipartRequest.getFiles("uploadfile");
            // String realpath = environment.getProperty("vivasam_fileroot") +
            // environment.getProperty("vivasam_filepath_verifyfile");
            String realpath = environment.getProperty("vivasam_fileroot") + environment.getProperty("vivasam_filepath_verifyfile");

            logger.info("teacherCertifyUpload realpath 0 ===> " + realpath);

            //파일이름을 리스트로 만들어서 저장한다.
            List<String> realFileNameList = new ArrayList<>();

            if (!uploadFileList.isEmpty()) {
                if (!new File(realpath).exists()) {
                    new File(realpath).mkdirs();
                }
                logger.info("teacherCertifyUpload realpath if ===> " + realpath);
                realFileNameList = commonService.smartUploadImageList(uploadFileList, realpath, filename);
            }

            /**
             *	회원학교 입력되었는지 체크
             */
            Map<String,Object> schoolInfo = commonService.getMemberSchoolYn(userId);
            if(schoolInfo == null){
                throw new Exception("회원정보수정 페이지 내 학교명이 \n입력되어야 서류 교사인증 신청이 가능합니다.");
            }
            String schCode = VivasamUtil.getStringOfObject(schoolInfo.get("schCode"));
            String schName = VivasamUtil.getStringOfObject(schoolInfo.get("schName"));
            if("0".equals(schCode) || "".equals(schCode) || "".equals(schName)){
                throw new Exception("회원정보수정 페이지 내 학교명이 \n입력되어야 서류 교사인증 신청이 가능합니다.");
            }

            //EpkStatus 로그 추가
            EpkStatusInfo epkInfo = new EpkStatusInfo();
            epkInfo.setRegId(userId);
            epkInfo.setEpkStatusCd("N");
            epkInfo.setAttachFile(realFileNameList.get(0));
            epkInfo.setComment(URLDecoder.decode(content, "UTF-8"));
            epkInfo.setType(type);
            if(realFileNameList.size() == 2){
                epkInfo.setAttachFile2(realFileNameList.get(1));
            }else if(realFileNameList.size() == 3){
                epkInfo.setAttachFile2(realFileNameList.get(1));
                epkInfo.setAttachFile3(realFileNameList.get(2));
            }
            commonService.insertEpkStatusInfoKEy(epkInfo);

            String title = "";
            if ("staff".equals(type)) title = "교육 전문 직원 인증";
            else if ("academic".equals(type)) title = "교육 대학생 인증";
            else title = "일반교사 / 기간제 교사 인증";

            int qnaId = csService.cQnaEpkInsert(epkInfo.getRegId(),"QA023",title,"",null,null,null,null,null,null,VivasamUtil.getClientIP(request),null,null,"N",null,Integer.toString(epkInfo.getEpkId()));

            String savePath = environment.getProperty("vivasam_fileroot") + environment.getProperty("vivasam_fileroot_qna");
            String originalFilename = uploadFileList.get(0).getOriginalFilename();

            File saveFolder = new File(savePath);
            if (!saveFolder.exists()) {
                saveFolder.mkdirs();
            }
            File saveFile = new FileRenamePolicy().rename(new File(savePath + File.separator + originalFilename));
            try {
                if (!uploadFileList.isEmpty()) {
                    FileCopyUtils.copy(uploadFileList.get(0).getInputStream(), new FileOutputStream(saveFile));
                }
            } catch (Exception e) { }

            Map<String, String> param = new HashMap<String, String>();
            param.put("qnaId", Integer.toString(qnaId));
            param.put("org_file_name", uploadFileList.get(0).getOriginalFilename());
            param.put("real_file_name", saveFile.getName());
            param.put("file_size", String.valueOf(uploadFileList.get(0).getSize()));
            param.put("fileGrpCd", "FS007");
            csService.cQnaFileInsert(param.get("qnaId"), param.get("org_file_name"),
                    param.get("real_file_name"), param.get("file_size"), param.get("fileGrpCd"));


            resultMap.put("code", "0");

        } catch (Exception e) {
            resultMap.put("code", "1");
            resultMap.put("msg", e.getMessage());
        }

        return ResponseEntity.ok(resultMap);
    }
}
