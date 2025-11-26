package edu.visang.vivasam.api.data;

import edu.visang.vivasam.member.model.SnsLoginParameter;

import java.util.Map;

public class ApiInputDataMapping {
    public void mappingInputParam(Map<String, String> inputParam, ApiInputData apiParam) {
        apiParam.setMemberId(inputParam.get("id"));
        apiParam.setMemberCi(inputParam.get("IPIN_CI"));
        apiParam.setMemberTypeCd(inputParam.get("mTypeCd"));
        apiParam.setMemberPassword(inputParam.get("password"));
        apiParam.setMemberName(inputParam.get("name"));
        apiParam.setMemberHp(inputParam.get("cellphone"));
        apiParam.setMemberEmail(inputParam.get("Email"));
        apiParam.setMemberBirthday(inputParam.get("birth"));
        apiParam.setMemberSchCd(inputParam.get("SchoolCode"));
        apiParam.setMemberSchNm(inputParam.get("SchoolName"));
        apiParam.setMemberSiteRegCase("MV");
        apiParam.setMemberMainSubjectCd(inputParam.get("mainSubject"));
        apiParam.setMemberSecondSubjectCd(inputParam.get("secondSubject"));
        apiParam.setMemberSrcPath("0");
        apiParam.setMemberRecommendId(inputParam.get("recommendId"));

        String vId = inputParam.get("vId");
        String tId = inputParam.get("tId");
        String ssoId = inputParam.get("ssoId");
        String processStr = "";
        String memberRegCase = "case0";

        if("0".equals(inputParam.get("checkCase"))) {
            memberRegCase = "case0";
        } else if("7".equals(inputParam.get("checkCase"))) {
            memberRegCase = "case1";
        } else if("1".equals(inputParam.get("checkCase")) || "3".equals(inputParam.get("checkCase")) || "5".equals(inputParam.get("checkCase"))) {
            memberRegCase = "case2";
        } else if("2".equals(inputParam.get("checkCase")) || "4".equals(inputParam.get("checkCase")) || "6".equals(inputParam.get("checkCase"))) {
            memberRegCase = "case3";
        } else {
            if(ssoId.equals(vId)) {
                memberRegCase = "case1";
            } else {
                memberRegCase = "case3";
            }
        }
        apiParam.setMemberRegCase(memberRegCase);

        if("".equals(vId)) {
            // 비바샘 신규
            processStr += "0^^" + ssoId;
        } else {
            // 비바샘 ASIS -> TOBE 변경
            processStr += "0^" + vId + "^" + ssoId;
        }
        processStr += "|";

        if("".equals(tId)) {
            // 티스쿨 신규
            processStr += "1^^" + ssoId;
        } else {
            // 티스쿨 ASIS -> TOBE 변경
            processStr += "1^" + tId + "^" + ssoId;
        }
        apiParam.setProcessStr(processStr);

        //TODO 마케팅 정책 확정후 변경해야됨
        apiParam.setMemberMktAgrYn("0^N|1^N");
        
        //TODO SNS 관련 가입 진행시 매핑
        //apiParam.setMemberSnsType(inputParam.getSnsJoin());

    }

    public void mappingInputSnsParamByMap(Map<String, String> snsParam, ApiInputData apiParam) {
        apiParam.setMemberSnsId(snsParam.get("snsId"));
        apiParam.setMemberSnsType(snsParam.get("snsType"));
        apiParam.setMemberSnsEmail(snsParam.get("snsEmail"));
        apiParam.setMemberSnsHp(snsParam.get("snsPhoneNumber"));
        apiParam.setMemberSnsName(snsParam.get("snsName"));
        apiParam.setMemberSnsYear(snsParam.get("snsYear"));
    }

    public void mappingInputSnsParam(SnsLoginParameter snsParam, ApiInputData apiParam) {
        apiParam.setMemberSnsId(snsParam.getId());
        apiParam.setMemberSnsType(snsParam.getType());
        apiParam.setMemberSnsEmail(snsParam.getEmail());
        apiParam.setMemberSnsHp(snsParam.getPhoneNumber());
        apiParam.setMemberSnsName(snsParam.getName());
        apiParam.setMemberSnsYear(snsParam.getYear());
    }

    public void mappingInputMyInfoParam(Map<String, String> updateParam, ApiInputData apiParam) {
        apiParam.setMemberId(updateParam.get("memberId"));
        apiParam.setMemberTypeCd(updateParam.get("mTypeCd"));
        apiParam.setMemberName(updateParam.get("memberName"));
        apiParam.setMemberCi(updateParam.get("ci"));
        apiParam.setMemberHp(updateParam.get("cellphone"));
        apiParam.setMemberEmail(updateParam.get("email"));
        apiParam.setMemberBirthday(updateParam.get("birth"));
        apiParam.setMemberSchNm(updateParam.get("schName"));
        apiParam.setMemberSchCd(updateParam.get("schCode"));
        apiParam.setMemberMainSubjectCd(updateParam.get("mainSubject"));
        apiParam.setMemberSecondSubjectCd(updateParam.get("secondSubject"));
        apiParam.setMemberRecommendId(updateParam.get("recommendId"));

    }
}