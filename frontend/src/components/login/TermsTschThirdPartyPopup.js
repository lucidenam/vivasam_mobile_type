import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class TermsTschThirdPartyPopup extends Component {

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/termsTschThirdParty',
            'page_title': '약관 | 회원가입｜비바샘'
        });
    }

    render() {
        
        return (
        
			<section id="pop_content">
                <div className="popup_content_etc">
                    <div className="access_txt">
                        <div className="terms_wrap tschool">
                            <div className="blind">티스쿨 - 개인정보 제3자 제공에 대한 동의</div>

                            {/*티스쿨 소스 - br태그 col 인라인 스타일 수정해야함*/}
                            <div className="terms">
                                <p>비상 티스쿨 원격교육연수원은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보처리방침」의「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이
                                    범위를 초과하여 이용하거나 타인 또는 다른 기업·기관에 제공하지 않습니다.</p>
                                <table className="qna_table_template">
                                    <caption>개인정보 제3자 제공에 대한 동의</caption>
                                    <colgroup>
                                        <col style={{width: '25%'}} />
                                        <col style={{width: '25%'}} />
                                        <col style={{width: '25%'}} />
                                        <col style={{width: '25%'}} />
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th>개인정보를 제공받는자</th>
                                        <th>개인정보 이용 목적</th>
                                        <th>제공하는 개인정보항목</th>
                                        <th>개인정보 보유 및 이용기간</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="ta_l">소속 교육청 및 시도 교육연수원 (위탁연수 진행기관) 한국교육 학술정보원(KERIS)</td>
                                        <td className="ta_l">이수결과 통보 및 이수자정보관리 시스템 등록</td>
                                        <td className="ta_l">나이스(NEIS)개인번호, 연수구분, 연수시간, 성적, 평점학점, 이수번호, 성명, 직급(직위), 생년월일, 학교명, 소속교육청, 초/중등 구분, 연수영역</td>
                                        <td className="ta_l">소속 교육청 및 시도 교육연수원(위탁연수 진행기관), 한국교육학술정보원(KERIS) 자체 관리</td>
                                    </tr>
                                    {/* <tr>
                                        <td className="ta_l">(주)비상교육(비바샘)</td>
                                        <td className="ta_l">
                                            <ul>
                                                <li>- 제휴사 웹사이트 로그인</li>
                                                <li>- 제휴사 서비스 제공</li>
                                                <li>- 교사 혜택 제공</li>
                                                <li>- 제휴사가 제공하는 홍보 정보 전송</li>
                                            </ul>
                                        </td>
                                        <td className="ta_l">
                                            <ul>
                                                <li>- 아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호, 개인정보 유효기간, 최종 접속일</li>
                                                <li>- 본인 확인 결과값 (CI)</li>
                                            </ul>
                                        </td>
                                        <td className="ta_l">회원 탈퇴 혹은 제휴사 정보 제공 동의 철회 시까지</td>
                                    </tr> */}
                                    </tbody>
                                </table>
                            </div>
                            {/*티스쿨 소스*/}

                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(TermsTschThirdPartyPopup));
