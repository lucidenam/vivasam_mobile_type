import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class TermsPrivacyAgreePopup extends Component {


    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/termsPrivacyAgree',
            'page_title': '개인정보 수집 및 이용 동의 | 회원가입｜비바샘'
        });
    }

    render() {
        
        return (
        
			<section id="pop_content">
				<div className="popup_content_etc privacyDetails">
            <div className="terms_wrap privacy">
                <p>㈜비상교육 비바샘(이하 ‘비바샘’)는 이용자의 개인 정보를 소중하게 생각하고, 이용자의 개인정보를 보호하기 위하여 항상 최선을 다하고 있습니다. 비바샘은 정보통신서비스제공자가 준수 하여야 하는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보보호법」, 「통신비밀보호법」등 관련 법령상의 개인정보보호 규정을 준수하고 있습니다. 비바샘은 이용자의 권리를 적극적으로 보장하며, 개인정보의 처리(수집·이용·제공·파기), 보호조치, 고충 처리에 대한 내용을 다음과 같이 개인정보 처리방침을 통하여 알려드립니다.</p>
                <ul className="list_num">
                    <li>▶ 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                        <table summary="회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                                <col style={{'width': '10%'}}/>
                                <col style={{'width': '20%'}}/>
                                <col style={{'width': '20%'}}/>
                                <col style={{'width': '20%'}}/>
                                <col style={{'width': 'auto'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>구분</th>
                                <th colSpan="2">목적</th>
                                <th>항목</th>
                                <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td rowSpan="13" className="textC">필수</td>
                                <td rowSpan="8" className="textC">회원가입 및 관리</td>
                                <td>아이디 찾기</td>
                                <td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
                                <td rowSpan="3" className="textC txtLine">목적달성 시 즉시 파기</td>
                            </tr>
                            <tr>
                                <td>비밀번호 찾기</td>
                                <td>
                                    - 이메일 인증 시 : 이름, 아이디, 이메일<br/>
                                    - 휴대전화번호 인증 시 : 이름, 아이디, 휴대전화번호
                                </td>
                            </tr>
                            <tr>
                                <td>본인확인(식별)</td>
                                <td>
                                    &lt;휴대전화 인증 시&gt;<br />이름, 성별, 생년월일, 통신사구분, 본인인증 CI, 휴대폰번호<br /><br />
                                    &lt;아이핀 인증 시&gt;<br />아이핀ID, 비밀번호
                                </td>
                            </tr>
                            <tr>
                                <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                                <td>아이디, 비밀번호, 이름, 이메일, 휴대전화번호, 생년월일, 소속, 담당학년, 본인인증 CI, EPKI인증서 DN, EPKI인증서, 공직자 메일, 재직증명서, 근로계약서</td>
                                <td rowSpan="7" className="textC txtLine">회원 탈퇴 시 파기 <br/>(다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불·편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.)</td>
                            </tr>
                            <tr>
                                <td>SNS 간편가입</td>
                                <td>
                                    - 네이버, 카카오 : 성명, 이메일, 휴대전화번호, 연계정보(CI)<br/>
                                    - 구글 : 성명, 이메일<br/>
                                    - 애플 : 성명, 이메일<br/>
                                    - 웨일 스페이스 : 성명, 이메일
                                </td>
                            </tr>
                            <tr>
                                <td>이용자상담, 불만처리 등 민원 처리</td>
                                <td>이름, 아이디, 이메일, 휴대전화</td>
                            </tr>
                            <tr>
                                <td>분쟁조정 해결을 위한 기록보존</td>
                                <td>이름, 아이디, 휴대전화번호, 결제수단, 카드종류, 승인번호, 결제금액, PG거래번호</td>
                            </tr>
                            <tr>
                                <td>회원관리</td>
                                <td>이름, 아이디, 휴대전화번호, 생년월일, 이메일, 회원구분, 회원가입일, 최근접속일, 최근접속IP, 최근회원정보 수정일</td>
                            </tr>
                            <tr>
                                <td rowSpan="3" className="textC">서비스 제공 <br/>(계약이행/요금 정산)</td>
                                <td>무료 전자도서관 서비스 이용</td>
                                <td>아이디, 이름</td>
                            </tr>
                            <tr>
                                <td>구매 및 요금 결제</td>
                                <td>아이디, 이름, 결제수단, 카드종류, 승인번호, 결제금액, 할인수단, PG거래번호</td>
                            </tr>
                            <tr>
                                <td>계좌입금자 환불처리</td>
                                <td>계좌번호, 은행명, 예금주명</td>
                                <td className="txtLine">이용목적 달성 후 즉시 파기</td>
                            </tr>
                            <tr>
                                <td rowSpan="2" colSpan="2" className="textC">AI 디지털교과서<br/> 체험하기 서비스</td>
                                <td>영상/이미지</td>
                                <td className="textC txtLine">이용목적 달성 후, 즉시 파기</td>
                            </tr>
                            <tr>
                                <td>필체/음성</td>
                                <td className="textC txtLine">1년(단, 교과서 이용 계약 기간에 따라 변경될 수 있음)</td>
                            </tr>
                            <tr>
                                <td className="textC" rowSpan="7">선택</td>
                                <td colSpan="2" className="textC">
                                    회원가입 및 관리<br/>
                                    (신규 가입시)
                                </td>
                                <td>추천인 아이디</td>
                                <td className="txtLine">회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관됩니다.</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="textC">
                                    비바클래스 서비스<br/>
                                    이용
                                </td>
                                <td>학교, 반, 게시물, 댓글</td>
                                <td className="txtLine">회원탈퇴 후 30일 이후에 파기됩니다.</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="textC">
                                    샘퀴즈 서비스<br/>
                                    이용
                                </td>
                                <td>아이디</td>
                                <td rowSpan="2" className="txtLine">회원탈퇴 후 즉시 파기 됩니다.</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="textC">위챌 웹/앱 <br/>서비스 이용</td>
                                <td>아이디</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="textC">스마트 문제은행 <br/>서비스 이용</td>
                                <td>아이디, 관리하는 클래스 이름/학교명/학년/학생 정보</td>
                                <td rowSpan="2" className="txtLine">회원탈퇴 후 30일 이후에 파기됩니다.</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="textC">스마트 수업도구 <br/>서비스 이용</td>
                                <td>아이디, 관리하는 클래스 이름/학생 정보</td>
                            </tr>
                            </tbody>
                        </table>
                    </li>
                    <li>▶ 서비스 이용과정에서 생성되는 정보
                        <table summary="서비스 이용과정에서 생성되는 정보 테이블">
                            <colgroup>
                                <col style={{'width': '10%'}}/>
                                <col style={{'width': '15%'}}/>
                                <col style={{'width': '15%'}}/>
                                <col style={{'width': 'auto'}}/>
                                <col style={{'width': '20%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>구분</th>
                                <th colSpan="2">목적</th>
                                <th>항목</th>
                                <th>보유기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td rowSpan="3" className="textC">필수</td>
                                <td colSpan="2">본인확인</td>
                                <td className="em">본인확인값(CI)</td>
                                <td rowSpan="3" className="txtLine">회원 탈퇴시 또는 법정 의무 보유기간<br/>※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료</td>
                            </tr>
                            <tr>
                                <td colSpan="2">서비스 이용 통계 등</td>
                                <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br/>※ 모바일 서비스 이용시 모바일
                                    기기정보(고유기기식별정보, OS버전)
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">교수학습지원 서비스 회원정보수정</td>
                                <td className="em">학교선생님 : 내교과(중고등)</td>
                            </tr>
                            <tr>
                                <td rowSpan="4" className="textC">필수</td>
                                <td rowSpan="4">신규 서비스개발 마케팅 및 광고에 활용</td>
                                <td>원격교육연수 서비스 회원정보수정</td>
                                <td>
                                    -학교선생님, 교육전문직원: 나이스개인번호, 직위구분, 추천인아이디<br/>
                                    -교육대학생, 일반: 추천인아이디
                                </td>
                                <td className="txtLine">회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관됩니다.</td>
                            </tr>
                            <tr>
                                <td>모바일 기프티콘 발송</td>
                                <td>아이디, 이름, 휴대전화번호</td>
                                <td className="txtLine">이용 목적 달성 후 즉시 파기</td>
                            </tr>
                            <tr>
                                <td>정기 간행물 발송, 새로운 상품 또는 서비스 안내</td>
                                <td>이메일, 휴대전화번호</td>
                                <td rowSpan="2" className="txtLine">회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관됩니다.</td>
                            </tr>
                            <tr>
                                <td>전국 시도 교육청 위탁연수 안내 다양한 학습정보와 이벤트 소식 제공</td>
                                <td>이름, 아이디, 소속교육청, 휴대전화번호, 이메일, 내교과, 광고수신(SMS,유선안내,이메일DM) 여부</td>
                            </tr>
                            </tbody>
                        </table>
                    </li>
                    <li>▶ 기타 법정 의무 수집 정보 등
                        <table summary="기타 법정 의무 수집 정보 테이블">
                            <colgroup>
                                <col style={{'width': '25%'}}/>
                                <col style={{'width': 'auto'}}/>
                                <col style={{'width': '25%'}}/>
                                <col style={{'width': '15%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>관련법률</th>
                                <th>이용목적</th>
                                <th>수집항목</th>
                                <th>보유기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>통신비밀보호법</td>
                                <td>수사기관 제공 (법원 영장 등 정당한 절차의 경우에 제공)</td>
                                <td className="em">로그기록, IP 등</td>
                                <td className="textC txtLine">3개월</td>
                            </tr>
                            <tr>
                                <td rowSpan="3">전자상거래 등에서의 소비자보호에 관한 법률</td>
                                <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                                <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                                <td className="textC txtLine">3년</td>
                            </tr>
                            <tr>
                                <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                                <td rowSpan="2" className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                                <td rowSpan="2" className="textC txtLine">5년</td>
                            </tr>
                            <tr>
                                <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            </tbody>
                        </table>
                    </li>
                </ul>
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
)(withRouter(TermsPrivacyAgreePopup));
