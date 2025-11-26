package edu.visang.vivasam.cs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.common.utils.PageUtils;
import edu.visang.vivasam.cs.mapper.CsMapper;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CsService {

    private static final Logger logger = LoggerFactory.getLogger(CsService.class);
    private final String jisaDomain = "https://njisa.visang.com";

    @Autowired
    CsMapper csMapper;

    /**
     * 공지사항 목록
     */
    public Page<Map<String, Object>> noticeList(int page, int pageSize, String noticeId, String srchCategory) {
        PageRequest request = new PageRequest(page, pageSize);
        if ("".equals(srchCategory)) srchCategory = "MS";
        List<Map<String, Object>> list = csMapper.noticeList(request, noticeId, srchCategory);
        return PageUtils.generatePage(list, request, "noticeId");
    }

    /**
     * 공지사항 상세
     */
    public Map<String, Object> noticeView(String noticeId) {
        Map<String, Object> notice = new HashMap<>();
        Map<String, Object> current = csMapper.noticeView(noticeId);
        if (current == null) {
            return null;
        }
        Map<String, Object> pre = csMapper.preNotice(noticeId, current.get("noticeCd").toString());
        Map<String, Object> next = csMapper.nextNotice(noticeId, current.get("noticeCd").toString());
        notice.put("content", current);
        notice.put("pre", pre);
        notice.put("next", next);
        return notice;
    }

    /**
     * 공지사항 상세 - 이전글
     */
    public Map<String, Object> preNotice(String noticeId, String noticeCd) {
        return csMapper.preNotice(noticeId, noticeCd);
    }

    /**
     * 공지사항 상세 - 다음글
     */
    public Map<String, Object> nextNotice(String noticeId, String noticeCd) {
        return csMapper.nextNotice(noticeId, noticeCd);
    }


    /**
     * 내 문의내역 목록 - 교과 자료요청
     */
    public Page<Map<String, Object>> reqDataList(int page, int pageSize, String userId) {
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = csMapper.reqDataList(request, userId);
        return PageUtils.generatePage(list, request, "reqDataId");
    }

    public Map<String, Object> reqDataView(String userId, String reqDataId) {
        return csMapper.reqDataView(userId, reqDataId);
    }

    /**
     * 내 문의내역 목록 - 사이트 이용문의(QNA)
     */
    public Page<Map<String, Object>> qnaList(int page, int pageSize, String userId, String srchCategory) {
        PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = csMapper.qnaList(request, userId, srchCategory);
        return PageUtils.generatePage(list, request, "qnaId");
    }

    /**
     * 내 문의내역 상세 - 사이트 이용문의(QNA)
     */
    public Map<String, Object> qnaView(String qnaId) {
        return csMapper.qnaView(qnaId);
    }

    /**
     * 문의 및 신고 정보 등록
     */
    @Transactional
    public int cQnaInsert(String member_id, String qnaCd, String qnaTitle,
                             String qnaContents, String qnaSchLvlCd, String qnaSubjectCd,
                             String qnaTextBookCd, String qnaHighUnitCd, String qnaKindCd,
                             String qnaUnitTitle, String regIp, String callYn, String callType, String useYn, String reqDataCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("member_id", member_id);
        params.put("qnaCd", qnaCd);
        params.put("qnaTitle", qnaTitle);
        params.put("qnaContents", qnaContents);
        params.put("qnaSchLvlCd", qnaSchLvlCd);
        params.put("qnaSubjectCd", qnaSubjectCd);
        params.put("qnaTextBookCd", qnaTextBookCd);
        params.put("qnaHighUnitCd", qnaHighUnitCd);
        params.put("qnaKindCd", qnaKindCd);
        params.put("qnaUnitTitle", qnaUnitTitle);
        params.put("regIp", regIp);
        params.put("callYn", callYn);
        params.put("callType", callType);
        params.put("useYn", useYn);
        params.put("reqDataCd", reqDataCd);

        csMapper.cQnaInsert(params);
        return Integer.parseInt(params.get("QNA_ID").toString());
    }

    @Transactional
    public int cQnaFileInsert(String qnaId, String orgFileName, String realFileName, String fileSize, String fileGrpCd) throws Exception {
        return csMapper.cQnaFileInsert(qnaId, orgFileName, realFileName, fileSize, fileGrpCd);
    }

    /**
     * 시/도 목록
     */
    public List<Map<String, Object>> sidoCodeList(String codeflag, String pkcode) {
        /*Map<String, Object> params = new HashMap<>();
        params.put("codeflag", codeflag);
        params.put("pkcode", pkcode);
        return csMapper.sidoCodeList(params);*/
        List<Map<String, Object>> result = new ArrayList<>();

		try {
			String url = jisaDomain;
			if (StringUtils.isEmpty(pkcode)) {
				url += "/api/ma.partner.area?codeflag=" + codeflag + "&pkcode=";
			} else {
				url += "/api/ma.partner.area?codeflag=" + codeflag + "&pkcode=" + pkcode;
			}

			String response = callExternalAPI(url);
			ObjectMapper objectMapper = new ObjectMapper();
			List<Map> resultList = objectMapper.readValue(response, List.class);

			for (Map<String, Object> map : resultList) {
				int idx = (Integer) map.get("IDX");
				String code = (String) map.get("CODE");
				String name = (String) map.get("NAME");

				Map<String, Object> codeList = new HashMap<>();
				codeList.put("code",code);
				codeList.put("idx",idx);
				codeList.put("name",name);

				result.add(codeList);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
    }

    /**
     * 주변 지사 찾기 - 목록
     */
    public Page<Map<String, Object>> contactList(int page, int pageSize, String pkcode) {
        /*PageRequest request = new PageRequest(page, pageSize);
        List<Map<String, Object>> list = csMapper.contactList(request, pkcode);
        return PageUtils.generatePage(list, request, "codeNm");*/
        PageRequest request = new PageRequest(page, pageSize);
		List<Map<String,Object>> result = new ArrayList<>();

		try {
			if (page == 0) {
				page = 1;
			}
			String url = jisaDomain + "/api/ma.partner?pageno=" + page + "&pagesize=" + pageSize + "&schsidocd="+pkcode+"&schguguncd=";
			String response = callExternalAPI(url);
			ObjectMapper objectMapper = new ObjectMapper();
			List<Map> resultList = objectMapper.readValue(response, List.class);
			for (Map<String, Object> map : resultList) {
				map.put("ptnCd", map.get("ptnCd"));
				map.put("ptnNm", map.get("ptnNm"));
				map.put("ptnTel", map.get("ptnTel"));
				map.put("ptnSiDoNm", map.get("ptnSiDoNm"));
				map.put("ptnChargeGuGunNm", map.get("ptnChargeGuGunNm"));

				result.add(map);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return PageUtils.generatePage(result, request, "ptnCd");
    }

    public List<Map<String, Object>> allContactList() {
        return csMapper.allContactList();
    }

    public String callExternalAPI(String url) {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
			HttpGet httpGet = new HttpGet(url);
			//HttpResponse httpResponse = httpClient.execute(httpGet);
			//HttpEntity httpEntity = httpResponse.getEntity();
			CloseableHttpClient httpclient = HttpClients.createDefault();
			CloseableHttpResponse response = httpclient.execute(httpGet);
			HttpEntity httpEntity = response.getEntity();
			return EntityUtils.toString(httpEntity);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

    @Transactional
    public int cQnaEpkInsert(String member_id, String qnaCd, String qnaTitle,
                          String qnaContents, String qnaSchLvlCd, String qnaSubjectCd,
                          String qnaTextBookCd, String qnaHighUnitCd, String qnaKindCd,
                          String qnaUnitTitle, String regIp, String callYn, String callType, String useYn, String reqDataCd, String epkId) {
        Map<String, Object> params = new HashMap<>();
        params.put("member_id", member_id);
        params.put("qnaCd", qnaCd);
        params.put("qnaTitle", qnaTitle);
        params.put("qnaContents", qnaContents);
        params.put("qnaSchLvlCd", qnaSchLvlCd);
        params.put("qnaSubjectCd", qnaSubjectCd);
        params.put("qnaTextBookCd", qnaTextBookCd);
        params.put("qnaHighUnitCd", qnaHighUnitCd);
        params.put("qnaKindCd", qnaKindCd);
        params.put("qnaUnitTitle", qnaUnitTitle);
        params.put("regIp", regIp);
        params.put("callYn", callYn);
        params.put("callType", callType);
        params.put("useYn", useYn);
        params.put("reqDataCd", reqDataCd);
        params.put("epkId", epkId);

        csMapper.cQnaInsert(params);
        return Integer.parseInt(params.get("QNA_ID").toString());
    }

    public void updateQnaCheck(String qnaId) { csMapper.updateQnaCheck(qnaId); }

    public int getMemberNoticeCnt(String noticeId, String memberId) {
        return csMapper.getMemberNoticeCnt(noticeId,memberId);
    }

    public void insertNoticeCheck(String noticeId, String memberId) {
        csMapper.insertNoticeCheck(noticeId,memberId);
    }

    public void updateNoticeCheck(String noticeId, String memberId) {
        csMapper.updateNoticeCheck(noticeId,memberId);
    }
}
