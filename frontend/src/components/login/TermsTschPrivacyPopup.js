import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class TermsThirdMarketingPopup extends Component {

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/termsTschPrivacy',
            'page_title': '약관 | 회원가입｜비바샘'
        });
    }


    render() {
        
        return (
        
			<section id="pop_content">
                <div className="popup_content_etc">
                    <div className="access_txt">
                        <div className="terms_wrap tschool">
                            <div className="blind">티스쿨 - 개인정보 수집 및 이용 동의</div>

                            {/*티스쿨 소스 - br태그 col 인라인 스타일 수정해야함*/}
                            <div className="terms">
                                <p>비바샘 원격교육연수원은 회원에게 회원관리서비스, 그리고 보다 다양한 서비스 제공을 위하여 아래와 같이 회원의 개인정보를 수집, 활용합니다.<br />* 본 수집동의서 상의 용어의 정의는 “비바샘 원격교육연수원 이용약관 및 개인정보처리방침”에 준용하며 비바샘 원격교육연수원 서비스 제공을 위해서 필요한 최소한의 개인정보이므로 동의를 해주셔야만 서비스를 이용 하실 수 있습니다.</p>
                                <table className="qna_table_template">
                                    <caption>개인정보 수집·이용 동의 필수항목</caption>
                                    <colgroup>
                                        <col style={{width: '20%'}} />
                                        <col style={{width: '52%'}} />
                                        <col style={{width: '28%'}} />
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th>목적</th>
                                        <th>수집항목</th>
                                        <th>보유기간</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="ta_l">본인확인<br />ID/비밀번호 찾기</td>
                                        <td className="ta_l">성명, 생년월일, 성별, 휴대전화번호, 아이핀번호(아이핀본인인증시), CI, DI값 등 본인확인에 필요한 정보</td>
                                        <td className="ta_l" rowSpan="6">회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도
                                            보관됩니다.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">회원가입 및 관리</td>
                                        <td className="ta_l">-교직원 : 이름, 아이디, 비밀번호, 이메일 주소, 휴대폰번호, 학교명, 나이스 개인번호, 생년월일<br /><br />
                                        -일반회원 : 이름, 아이디, 비밀번호, 이메일 주소, 휴대폰번호, 생년월일
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">교재 및 교육물품 배송</td>
                                        <td className="ta_l">성명, 휴대전화번호, 이메일, 주소, 우편번호</td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">고객상담, 불만처리 등 민원 처리</td>
                                        <td className="ta_l">성명, 아이디, 이메일, 휴대전화</td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">구매 및 요금 결제</td>
                                        <td className="ta_l">아이디, 성명, 결제수단, 카드종류, 승인번호, 결제금액, PG거래번호</td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">이벤트 당첨결과 안내 및 경품배송</td>
                                        <td className="ta_l">아이디, 성명, 휴대전화번호, 주소, 이메일</td>
                                    </tr>
                                    <tr>
                                        <td className="ta_l">계좌 입금자 환불처리</td>
                                        <td className="ta_l">계좌번호, 은행명, 예금주명</td>
                                        <td className="ta_l">이용목적 달성 후 즉시 파기됩니다.</td>
                                    </tr>
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
)(withRouter(TermsThirdMarketingPopup));
