import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "store/modules/gtag";

class TermsPrivacyPopup extends Component {

    state={
        termVersion: ''
    }

    componentDidMount() {
      initializeGtag();
      function gtag(){
        window.dataLayer.push(arguments);
      }
      gtag('config', 'G-MZNXNH8PXM', {
        'page_path': '/privacy',
        'page_title': '개인정보 처리방침｜비바샘'
      });
  }

    handleChange = (e) => {
        var children = Array.from(document.getElementsByClassName('access_txt')[0].children);
        children.forEach(obj => {
            obj.classList.add('hide');
            if(obj.className.includes(e.target.value)){
                obj.classList.remove('hide');
            }
        });

        const { termVersion } = this.state;
        this.setState({
          termVersion : e.target.value
        })

    }

    render() {
        const { termVersion } = this.state;
        return (
        <section id="pop_content">
        <div className="popup_content_etc privacyDetails">
          <div className="input_wrap">
            <div className="selectbox select_sm">
              <select name="selectTerm" id="selectTerm" value={termVersion} onChange={this.handleChange}>
                <option value="privacy_ver15">이전 개인정보처리방침 보기</option>
                <option value="privacy_ver14">2023년 5월 10일 – 2023년 9월 23일</option>
                <option value="privacy_ver13">2022년 7월 11일 – 2023년 5월 9일 적용</option>
                <option value="privacy_ver12">2022년 4월 14일 – 2022년 7월 10일 적용</option>
                <option value="privacy_ver11">2021년 5월 20일 – 2022년 4월 13일 적용</option>
                <option value="privacy_ver10">2019년 12월 30일 – 2021년 5월 19일 적용</option>
                <option value="privacy_ver9">2019년 8월 31일 – 2019년 12월 29일 적용</option>
                <option value="privacy_ver8">2018년 11월 9일 – 2019년 8월 30일 적용</option>
                <option value="privacy_ver7">2018년 2월 26일 – 2018년 11월 8일 적용</option>
                <option value="privacy_ver6">2017년 12월 26일 – 2018년 2월 25일 적용</option>
                <option value="privacy_ver5">2016년 12월 9일 – 2017년 12월 25일 적용</option>
                <option value="privacy_ver4">2015년 12월 1일 – 2016년 12월 8일 적용</option>
                <option value="privacy_ver3">2015년 7월 31일 – 2015년 11월 30일 적용</option>
                <option value="privacy_ver2">2014년 2월 27일 – 2015년 7월 30일 적용</option>
                <option value="privacy_ver1">2013년 2월 18일 - 2014년 2월 26일 적용</option>
              </select>
            </div>
          </div>
          <div className="access_txt mt25">
            <div className="privacy_ver15">
              <div className="terms_wrap privacy">
                <div className="terms_tit" id="a1">1. 개인정보의 수집</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 수집 원칙
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시 사전에 이용자의 동의를 구하도록 하고 있습니다.
                          <dl>
                            <dt>※ 필수항목과 선택항목</dt>
                            <dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
                            <dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는 정보</dd>
                          </dl>
                        </li>
                        <li>- 비바샘은 법령에 따른 개인정보 보유, 이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.</li>
                        <li>- 비바샘은 사상·신념, 노동조합·정당의 가입·탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의 사생활을 현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.</li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 수집 방법
                      <ul className="list_hyp">
                        <li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를 수집합니다.</li>
                        <li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>
                      ③ 개인정보 수집 목적 및 항목
                      <ul className="list_arrow">
                        <li>
                          ▶ 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "10%"}}/>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
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
                              <td rowSpan="11" className="textC">필수</td>
                              <td rowSpan="8" className="textC">회원가입 및 관리</td>
                              <td>아이디 찾기</td>
                              <td>이름, 이메일, 휴대전화번호</td>
                              <td rowSpan="3" className="textC">목적달성 시 즉시 파기</td>
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
                              <td>&lt;휴대전화 인증 시&gt;<br/>
                                이름, 성별, 생년월일, 통신사구분, 본인인증 CI, 휴대전화번호<br/><br/>
                                &lt;아이핀 인증 시&gt;<br/>
                                아이핀ID, 비밀번호
                              </td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td>아이디, 비밀번호, 이름, 이메일, 휴대전화번호, 생년월일, 소속, 담당학년, 본인인증 CI, EPKI인증서 DN, EPKI인증서, 공직자 메일, 재직증명서, 근로계약서</td>
                              <td rowSpan="7" className="textC">
                                회원 탈퇴 시 파기<br/>
                                (다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불·편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.)
                              </td>
                            </tr>
                            <tr>
                              <td>SNS 간편 가입</td>
                              <td>
                                - 네이버, 카카오 : 성명, 이메일, 휴대전화번호, 연계정보(CI)<br/>
                                - 페이스북, 구글 : 성명, 이메일<br/>
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
                              <td>이용목적 달성 후 즉시 파기</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 서비스 이용과정에서 생성되는 정보
                          <table summary="서비스 이용과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{width: "10%"}}/>
                              <col style={{width: "15%"}}/>
                              <col style={{width: "15%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
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
                              <td rowSpan="3">필수</td>
                              <td colSpan="2">본인확인</td>
                              <td>본인인증 CI</td>
                              <td rowSpan="3">
                                회원 탈퇴시 또는 법정 의무 보유기간<br/>
                                ※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2">서비스 이용 통계 등</td>
                              <td>
                                IP Address, 쿠키, 방문일시, 서비스 이용기록<br/>
                                ※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2">교수학습지원 서비스 회원정보수정</td>
                              <td>학교선생님 : 내교과(중고등)</td>
                            </tr>
                            <tr>
                              <td rowSpan="4">선택</td>
                              <td rowSpan="4">신규 서비스개발 마케팅 및 광고에 활용</td>
                              <td>원격교육연수 서비스 회원정보수정</td>
                              <td>
                                -학교선생님, 교육전문직원: 나이스개인번호, 직위구분, 추천인아이디<br/>
                                -교육대학생, 일반: 추천인아이디
                              </td>
                              <td>회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관됩니다.</td>
                            </tr>
                            <tr>
                              <td>모바일 기프티콘 발송</td>
                              <td>아이디, 이름, 휴대전화번호</td>
                              <td>이용 목적 달성 후 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>정기 간행물 발송, 새로운 상품 또는 서비스 안내</td>
                              <td>이메일, 휴대전화번호</td>
                              <td rowSpan="2">회원탈퇴 후 파기됩니다. 다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관됩니다.</td>
                            </tr>
                            <tr>
                              <td>전국 시도 교육청 위탁연수 안내 다양한 학습정보와 이벤트 소식 제공</td>
                              <td>이름, 아이디, 소속교육청, 휴대전화번호, 이메일, 내교과, 광고수신(SMS,유선안내,이메일DM) 여부</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 기타 법정 의무 수집 정보 등
                          <table summary="서비스 이용과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "15%"}}/>
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
                              <td>로그기록, IP 등</td>
                              <td>3개월</td>
                            </tr>
                            <tr>
                              <td rowSpan="3">전자상거래 등에서의 소비자보호에 관한 법률</td>
                              <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                              <td>소비자 식별정보, 분쟁처리 기록 등</td>
                              <td>3년</td>
                            </tr>
                            <tr>
                              <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                              <td rowSpan="2">소비자 식별정보, 계약/청약철회 기록 등</td>
                              <td rowSpan="2">5년</td>
                            </tr>
                            <tr>
                              <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            </tbody>
                          </table>
                          <p>※ 비바샘은 이 외에 고객님이 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                        </li>
                        <li>
                          ▶ 이용자 동의 후 추가로 수집하는 정보
                          <p>개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수 있습니다. 개인정보 수집 시 이용자에게 수집하는 개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며, 동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을 함께 안내합니다.</p>
                          <table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "40%"}}/>
                              <col style={{width: "40%"}}/>
                              <col style={{width: "20%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>목적</th>
                              <th>수집항목</th>
                              <th>보관기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>교사참여 오프라인 행사참여 안내</td>
                              <td>[필수] 이름, 이메일, 휴대전화번호, 학교급, 소속</td>
                              <td rowSpan="2">이용 목적 달성 후 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td>[필수] 이름, 휴대전화번호, 주소(이벤트에 따라 필요 시, 소속</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ④ 쿠키를 설치, 운영하는 이용자의 거부권
                      <ul className="list_hyp">
                        <li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터에 저장됩니다.</li>
                        <li>
                          - 쿠키의 사용 목적
                          <ul className="mt0">
                            <li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스 이용 제공</li>
                            <li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과 관심에 특화된 서비스 및 광고 제공</li>
                          </ul>
                        </li>
                        <li>
                          - 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인 / 모든 쿠키 저장 거부를 선택할 수 있습니다.
                          <ul className="mt0">
                            <li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 > 인터넷 옵션 > 개인정보 > 설정</li>
                            <li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 > 화면 하단의 고급 설정 표시 > 개인정보의 콘텐츠 설정 버튼 > 쿠키</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
                <div className="terms_desc">
                  <p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전에 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <table summary="수집한 개인정보 구분, 이용 목적 테이블">
                    <colgroup>
                      <col style={{width: "30%"}}/>
                      <col style={{width: "auto"}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용 목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지, 회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                    </tr>
                    <tr>
                      <td>맞춤 서비스 제공</td>
                      <td>교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, 무료 전자도서관 서비스 이용 등</td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                    </tr>
                    <tr>
                      <td>통합 회원 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    <tr>
                      <td>교사 인증 서류 관리</td>
                      <td>교사 인증 서류 확인 및 답변</td>
                    </tr>
                    <tr>
                      <td>고객 문의 관리</td>
                      <td>고객 문의 내용 확인 및 답변 등</td>
                    </tr>
                    <tr>
                      <td>저작권 침해 제보 관리</td>
                      <td>저작권 침해 제보 내용 확인 및 답변 등</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 제3자 제공
                      <ul className="list_hyp">
                        <li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.</li>
                        <li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보 항목, 제공받는 자의 개인정보 이용목적, 제공받는 자의 보유․이용기간을 명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.</li>
                        <li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
                        <li>- 원격교육연수원은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보처리방침」의「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이 범위를 초과하여 이용하거나 타인 또는 다른 기업·기관에 제공하지 않습니다.</li>
                      </ul>
                      <table summary="개인정보의 제공 및 위탁 테이블">
                        <colgroup>
                          <col style={{width: "25%"}}/>
                          <col style={{width: "25%"}}/>
                          <col style={{width: "25%"}}/>
                          <col style={{width: "25%"}}/>
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
                          <td>소속 교육청 및 시도 교육연수원 (위탁연수 진행기관) 한국교육학술정보원(KERIS)</td>
                          <td>이수결과 통보 및 이수자정보관리 시스템 등록</td>
                          <td>나이스(NEIS)개인번호, 연수구분, 연수시간, 성적, 평점학점, 이수번호, 이름, 직급(직위), 생년월일, 학교명, 소속교육청, 초/중등 구분, 연수영역</td>
                          <td>소속 교육청 및 시도 교육연수원(위탁연수 진행기관), 한국교육학술정보원(KERIS) 자체 관리</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                    <li>
                      ② 개인정보처리의 위탁
                      <p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
                      <table summary="개인정보처리 위탁 정보 테이블">
                        <colgroup>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "auto"}}/>
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁 업체</th>
                          <th>위탁업무 내용</th>
                          <th>개인정보의 보유 및 이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td>Nice 평가정보</td>
                          <td>본인확인 인증</td>
                          <td rowSpan="10">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td>(주)북큐브네트웍스</td>
                          <td>무료 전자도서관 서비스 이용</td>
                        </tr>
                        <tr>
                          <td>
                            ㈜다우기술<br/>
                            ㈜ 모바일이앤엠애드<br/>
                            11번가(주)
                          </td>
                          <td>이벤트 기프티콘 경품 발송</td>
                        </tr>
                        <tr>
                          <td>㈜한진<br/>우리아트</td>
                          <td>이벤트 경품 배송</td>
                        </tr>
                        <tr>
                          <td>오케이커뮤니케이션즈</td>
                          <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                        </tr>
                        <tr>
                          <td>㈜코리아인</td>
                          <td>CS 접수 및 고객상담</td>
                        </tr>
                        <tr>
                          <td>CJ 올리브 네트웍스</td>
                          <td>비즈메시지 발송</td>
                        </tr>
                        <tr>
                          <td>유니위즈</td>
                          <td>비바샘 웹서비스 고도화 및 운영 유지보수</td>
                        </tr>
                        <tr>
                          <td>㈜한진</td>
                          <td>도서 배송</td>
                        </tr>
                        <tr>
                          <td>
                            교육숲<br/>
                            레드포인트<br/>
                            이든교육
                          </td>
                          <td>상품 배송</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a4">4. 개인정보의 파기</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 파기
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보 보관 의무를 부과하는 경우와 이용자에게 보관기간에 대해 별도 동의를 얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.</li>
                        <li>
                          - 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
                          <table summary="관계법령에 의해 보관해야 하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "15%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>관계법령</th>
                              <th>보존항목</th>
                              <th>보존기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="3">전자상거래 등에서의 소비자보호에 관한 법률</td>
                              <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                              <td className="textC">3년</td>
                            </tr>
                            <tr>
                              <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                              <td rowSpan="2" className="textC">5년</td>
                            </tr>
                            <tr>
                              <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            <tr>
                              <td>통신비밀보호법</td>
                              <td>인터넷 로그기록자료, 접속지 추적자료</td>
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td>정보통신망법 제50조</td>
                              <td>e메일, 문자와 관련된 개인정보<br/>※탈퇴회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</td>
                              <td className="textC">1년</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 파기 절차 및 방법
                      <ul className="list_hyp">
                        <li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 보호책임자 및 담당부서
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보 보호책임자와 담당부서를 지정하여 운영하고 있습니다.
                          <table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <tbody>
                            <tr>
                              <th rowSpan="2">개인정보보호책임자 (CPO)</th>
                              <td>소속 : IT전략 Core</td>
                            </tr>
                            <tr>
                              <td>이름 : 이정우</td>
                            </tr>
                            <tr>
                              <th>개인정보 담당부서</th>
                              <td>정보보안 Cell</td>
                            </tr>
                            <tr>
                              <th rowSpan="2">문의</th>
                              <td>전화 : 1544-0554</td>
                            </tr>
                            <tr>
                              <td>이메일 : <a href="mailto:privacy@visang.com"
                                           target="_blank">privacy@visang.com</a></td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 하실 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>
                      ② 권익침해 구제방법
                      <ul className="list_hyp">
                        <li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.</li>
                        <li>- 아래 기관은 비바샘과는 별개의 기관입니다.
                          <table summary="권익침해 구제방법 기관 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>홈페이지</th>
                              <th>전화</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 침해신고센터<br/>(한국인터넷진흥원 운영)</td>
                              <td><a href="http://privacy.kisa.or.kr"
                                     target="_blank">privacy.kisa.or.kr</a></td>
                              <td>(국번없이) 118</td>
                            </tr>
                            <tr>
                              <td>개인정보 분쟁조정위원회</td>
                              <td><a href="http://www.kopico.go.kr"
                                     target="_blank">www.kopico.go.kr</a></td>
                              <td>(국번없이) 1833-6972</td>
                            </tr>
                            <tr>
                              <td>대검찰청 사이버수사과</td>
                              <td><a href="http://www.spo.go.kr"
                                     target="_blank">www.spo.go.kr</a></td>
                              <td>(국번없이) 1301</td>
                            </tr>
                            <tr>
                              <td>경찰청 사이버수사국</td>
                              <td><a href="http://ecrm.police.go.kr"
                                     target="_blank">ecrm.police.go.kr</a></td>
                              <td>(국번없이) 182</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a6">6. 이용자·법정대리인의 권리행사방법 및 의무</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 권리행사방법
                      <ul className="list_hyp">
                        <li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
                          <table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>요청 방법</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
                              <td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 문의</td>
                            </tr>
                            <tr>
                              <td>개인정보 조회/수정</td>
                              <td>『회원정보변경』메뉴</td>
                            </tr>
                            <tr>
                              <td>동의 철회</td>
                              <td>제3자 마케팅 동의 등 철회 방법 안내</td>
                            </tr>
                            <tr>
                              <td>회원 탈퇴</td>
                              <td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를 이용하거나 제공하지 않습니다. 단, 잘못된 개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려 수정될 수 있도록 하겠습니다.</li>
                        <li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 처리 방법에 대한 고지 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</li>
                        <li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.</li>
                        <li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
                        <li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.</li>
                      </ul>
                    </li>
                    <li>② 이용자의 의무
                      <ul className="list_hyp">
                        <li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을 침해하여서는 아니 됩니다.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
                <div className="terms_desc">비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
                  <ul className="list_num">
                    <li>① 내부관리계획의 수립<p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p></li>
                    <li>② 개인정보 취급자 최소화(구)개인정보 처리방침<p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보 유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는 데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고 지속적인 감사를 시행하고 있습니다.</p></li>
                    <li>③ 정기 교육<p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의 중요성을 강조하고 있습니다.</p></li>
                    <li>④ 해킹이나 바이러스로부터 보호<p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한, 개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을 이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p></li>
                    <li>⑤ 개인정보의 암호화<p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을 사용하여 암호화 합니다.</p></li>
                    <li>⑥ 물리적 통제<p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류, 보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p></li>
                  </ul>
                </div>
                <div className="terms_tit" id="a8">8. 고지 의무</div>
                <div className="terms_desc">
                  <ul className="list_hyp">
                    <li>- 이 개인정보 처리방침은 2023. 9. 24부터 적용됩니다.</li>
                    <li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다. 이용자의 권리 또는 의무에 중요한 내용이 변경될 경우에는 최소 30일 전에 안내 드리겠습니다.</li>
                  </ul>
                </div>
              </div>

            </div>
            <div className="privacy_ver14 hide">
              <div className="terms_wrap privacy">
                <div className="terms_tit" id="a1">1. 개인정보의 수집</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 수집 원칙
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시
                          사전에 이용자의 동의를 구하도록 하고 있습니다.
                          <dl>
                            <dt>※ 필수항목과 선택항목</dt>
                            <dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
                            <dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는
                              정보
                            </dd>
                          </dl>
                        </li>
                        <li>- 비바샘은 법령에 따른 개인정보 보유․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간
                          내에서 개인정보를 처리․보유합니다.
                        </li>
                        <li>- 비바샘은 사상·신념, 노동조합·정당의 가입·탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의
                          사생활을 현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 수집 방법
                      <ul className="list_hyp">
                        <li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를
                          수집합니다.
                        </li>
                        <li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수
                          있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ③ 개인정보 수집 목적 및 항목
                      <ul className="list_arrow">
                        <li>
                          ▶ 회원가입 및 주문 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 주문 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th colSpan="2">목적</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="5" className="textC">회원가입 및 관리</td>
                              <td>아이디 찾기</td>
                              <td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
                              <td rowSpan="3" className="textC">목적달성 시 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>비밀번호 찾기</td>
                              <td>[필수]<br/>- 이메일 인증 시 : 성명, 아이디, 이메일<br/>- 휴대전화번호 인증 시 :
                                성명,
                                아이디, 휴대전화번호
                              </td>
                            </tr>
                            <tr>
                              <td>본인확인(식별)</td>
                              <td>&lt;휴대전화 인증 시&gt;<br/>[필수] 성명, 생년월일, 통신사구분, 본인인증 CI,
                                휴대폰번호<br/><br/>&lt;아이핀 인증 시&gt;<br/>[필수] 아이핀ID,
                                비밀번호
                              </td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td>[필수]<br/>아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 생년월일, 재직학교명,
                                담당학년, 내 교과(중고등), 본인인증 CI, EPKI인증서DN, EPKI인증서SN
                              </td>
                              <td rowSpan="4" className="textC">회원 탈퇴 시 파기<br/>(다만 관계법령에
                                의해
                                보존할 경우 그 의무기간 동안 별도 보관되며 불·편법 행위의 방지 및 대응의 목적으로
                                1년 보관됩니다.)
                              </td>
                            </tr>
                            <tr>
                              <td>단독 회원 SNS 간편 가입</td>
                              <td>[필수]<br/>
                                - 네이버, 카카오 : 성명, 이메일, 휴대전화번호, 출생연도, 생일, 연계정보(CI)<br/>
                                - 페이스북, 구글 : 성명, 이메일, 생년월일<br/>
                                - 애플 : 성명, 이메일<br/>
                                - 웨일 스페이스 : 성명, 이메일
                              </td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">교사맞춤 서비스<br/>제공</td>
                              <td>수업 및 평가 자료 메일링 서비스</td>
                              <td>[필수]<br/>아이디, 성명, 이메일, 재직학교명, 내 교과, 담당학년</td>
                            </tr>
                            <tr>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td>[필수]<br/>아이디, 성명</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 이용자 동의 후 추가로 수집하는 정보
                          <p>
                            개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수
                            있습니다. 개인정보 수집 시 이용자에게 수집하는 개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며,
                            동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을 함께
                            안내합니다.
                          </p>
                          <table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>목적</th>
                              <th>수집항목</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>교사참여 오프라인 행사참여 안내</td>
                              <td>[필수] 성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td>[필수] 성명, 휴대전화번호, 주소, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>V매거진 정기구독</td>
                              <td>[필수] 성명, 재직학교명, 주소, 휴대전화번호</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 서비스 이용 과정에서 생성되는 정보
                          <table summary="서비스 이용 과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>본인확인</td>
                              <td>본인인증 CI</td>
                              <td rowSpan="2">회원 탈퇴 시 또는 법정 의무 보유기간<br/>※ 쿠키의 경우, 브라우저 종료
                                시
                                또는 로그아웃 시 만료(단, 아이디 저장 선택 시 30일간 보관)
                              </td>
                            </tr>
                            <tr>
                              <td>서비스 이용 통계 등</td>
                              <td>IP Address, 쿠키, 방문 일시, 서비스 이용기록<br/>※ 모바일 서비스 이용 시 모바일
                                기기정보(고유기기식별정보, OS버전)
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ④ 쿠키를 설치, 운영하는 이용자의 거부권
                      <ul className="list_hyp">
                        <li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC
                          컴퓨터에 저장됩니다.
                        </li>
                        <li>
                          - 쿠키의 사용 목적
                          <ul className="mt0">
                            <li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스
                              이용 제공
                            </li>
                            <li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과
                              관심에 특화된 서비스 및 광고 제공
                            </li>
                          </ul>
                        </li>
                        <li>
                          - 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인
                          / 모든 쿠키 저장 거부를 선택할 수 있습니다.
                          <ul className="mt0">
                            <li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷
                              옵션 &gt; 개인정보 &gt; 설정
                            </li>
                            <li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의
                              콘텐츠 설정 버튼 &gt; 쿠키
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
                <div className="terms_desc">
                  <p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는
                    경우에는 사전에 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <table summary="수집한 개인정보 구분, 이용 목적 테이블">
                    <colgroup>
                      <col style={{width: "30%"}}/>
                      <col style={{width: "auto"}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용 목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리,
                        서비스 부정이용 방지, 회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록
                        보존 등
                      </td>
                    </tr>
                    <tr>
                      <td>교사 맞춤 서비스 제공</td>
                      <td>수업 및 평가 자료 메일링 서비스, 교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, V매거진 정기구독, 무료 전자도서관
                        서비스 이용 등
                      </td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및
                        홍보, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
                      </td>
                    </tr>
                    <tr>
                      <td>통합 회원 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    <tr>
											<td>교사 인증 서류 관리</td>
											<td>교사 인증 서류 확인 및 답변 등</td>
										</tr>
										<tr>
											<td>고객 문의 관리</td>
											<td>고객 문의 내용 확인 및 답변 등</td>
										</tr>
										<tr>
											<td>저작권 침해 제보 관리</td>
											<td>저작권 침해 제보 내용 확인 및 답변 등</td>
										</tr>
                    </tbody>
                  </table>
                </div>
                <div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 제3자 제공
                      <ul className="list_hyp">
                        <li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의
                          범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
                        </li>
                        <li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보
                          항목, 제공받는 자의 개인정보 이용목적, 제공받는 자의 보유․이용기간을
                          명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.
                        </li>
                        <li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보처리의 위탁
                      <p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
                      <table summary="개인정보처리 위탁 정보 테이블">
                        <colgroup>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "auto"}}/>
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁 업체</th>
                          <th>위탁업무 내용</th>
                          <th>개인정보의 보유 및<br/>이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td className="textC">Nice 평가정보</td>
                          <td className="textC">본인확인 인증</td>
                          <td rowSpan="9" className="textC">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)북큐브네트웍스</td>
                          <td className="textC">무료 전자도서관 서비스 이용</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)다우기술</td>
                          <td className="textC">이벤트 기프티콘 경품 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜한진<br/>우리아트</td>
                          <td className="textC">이벤트 경품 배송</td>
                        </tr>
                        <tr>
                          <td className="textC">오케이커뮤니케이션즈</td>
                          <td className="textC">SMS 문자 내 수신거부 080 호스팅 제공</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜코리아인</td>
                          <td className="textC">CS 접수 및 고객상담</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜서울디엠<br/>우정사업본부</td>
                          <td className="textC">V매거진 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">CJ 올리브 네트웍스</td>
                          <td className="textC">비즈메시지 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">유니위즈</td>
                          <td className="textC">비바샘 웹서비스 고도화 및 운영 유지보수</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a4">4. 개인정보의 파기</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 파기
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보
                          보관 의무를 부과하는 경우와 이용자에게 보관기간에 대해 별도 동의를
                          얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.
                        </li>
                        <li>
                          - 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
                          <table summary="관계법령에 의해 보관해야 하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>관계법령</th>
                              <th>보존항목</th>
                              <th>보존기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="3">전자상거래 등에서의<br/>소비자보호에 관한 법률</td>
                              <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                              <td className="textC">3년</td>
                            </tr>
                            <tr>
                              <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                              <td rowSpan="2" className="textC">5년</td>
                            </tr>
                            <tr>
                              <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            <tr>
                              <td>통신비밀보호법</td>
                              <td>인터넷 로그기록자료, 접속지 추적자료</td>
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td>정보통신망법 제50조</td>
                              <td>e메일, 문자와 관련된 개인정보<br/>※탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와
                                별도로 보관되며, 다른 목적으로 이용하지 않습니다.
                              </td>
                              <td className="textC">1년</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 유효기간제
                      <ul className="list_hyp">
                        <li>- 비바샘은 장기간 서비스 미 이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원
                          또는 직접 유효기간을 선택한 회원)의 개인정보를 별도의 DB에 분리보관하고
                          있습니다.
                        </li>
                        <li>- 미 이용의 기간은 로그인, 상담원 접촉일자 등으로 산정합니다.</li>
                        <li>- 비바샘은 미 이용자 개인정보 분리/저장시점 도래 30일 이전에 이메일 등을 통해 해당 이용자에게 관련내용을
                          공지합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ③ 개인정보 파기 절차 및 방법
                      <ul className="list_hyp">
                        <li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 보호책임자 및 담당부서
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보
                          보호책임자와 담당부서를 지정하여 운영하고 있습니다.
                          <table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <tbody>
                            <tr>
                              <th rowSpan="2">개인정보보호책임자 (CPO)</th>
                              <td>소속 : IT전략 Core</td>
                            </tr>
                            <tr>
                              <td>이름 : 이정우</td>
                            </tr>
                            <tr>
                              <th>개인정보 담당부서</th>
                              <td>정보보안 Cell</td>
                            </tr>
                            <tr>
                              <th rowSpan="2">문의</th>
                              <td>전화 : 1544-0554</td>
                            </tr>
                            <tr>
                              <td>이메일 : <a href="mailto:privacy@visang.com"
                                    target="_blank">privacy@visang.com</a></td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및
                          담당부서로 하실 수 있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 권익침해 구제방법
                      <ul className="list_hyp">
                        <li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.
                        </li>
                        <li>- 아래 기관은 비바샘과는 별개의 기관입니다.
                          <table summary="권익침해 구제방법 기관 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>홈페이지</th>
                              <th>전화</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 침해신고센터<br/>(한국인터넷진흥원 운영)</td>
                              <td><a href="http://privacy.kisa.or.kr"
                                target="_blank">privacy.kisa.or.kr</a></td>
                              <td>(국번없이) 118</td>
                            </tr>
                            <tr>
                              <td>개인정보 분쟁조정위원회</td>
                              <td><a href="http://www.kopico.go.kr"
                                target="_blank">www.kopico.go.kr</a></td>
                              <td>(국번없이) 1833-6972</td>
                            </tr>
                            <tr>
                              <td>대검찰청 사이버수사과</td>
                              <td><a href="http://www.spo.go.kr"
                                target="_blank">www.spo.go.kr</a></td>
                              <td>(국번없이) 1301</td>
                            </tr>
                            <tr>
                              <td>경찰청 사이버수사국</td>
                              <td><a href="http://ecrm.police.go.kr​"
                                target="_blank">ecrm.police.go.kr​</a></td>
                              <td>(국번없이) 182</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a6">6. 이용자·법정대리인의 권리행사방법 및 의무</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 권리행사방법
                      <ul className="list_hyp">
                        <li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
                          <table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>요청 방법</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
                              <td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX)
                                등을 통하여 문의
                              </td>
                            </tr>
                            <tr>
                              <td>개인정보 조회/수정</td>
                              <td>『회원정보변경』메뉴</td>
                            </tr>
                            <tr>
                              <td>동의 철회</td>
                              <td>제3자 마케팅 동의 등 철회 방법 안내</td>
                            </tr>
                            <tr>
                              <td>회원 탈퇴</td>
                              <td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를
                          이용하거나 제공하지 않습니다. 단, 잘못된 개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려
                          수정될 수 있도록 하겠습니다.
                        </li>
                        <li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 처리 방법에 대한
                          고지 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
                        </li>
                        <li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될
                          수 있습니다.
                        </li>
                        <li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수
                          없습니다.
                        </li>
                        <li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나
                          정당한 대리인인지를 확인합니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 이용자의 의무
                      <ul className="list_hyp">
                        <li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을
                          침해하여서는 아니 됩니다.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
                <div className="terms_desc">비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
                  <ul className="list_num">
                    <li>① 내부관리계획의 수립<p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p></li>
                    <li>② 개인정보 취급자 최소화<p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보
                      유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는 데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고
                      지속적인 감사를 시행하고 있습니다.</p></li>
                    <li>③ 정기 교육<p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의
                      중요성을 강조하고 있습니다.</p></li>
                    <li>④ 해킹이나 바이러스로부터 보호<p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한,
                      개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을 이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p></li>
                    <li>⑤ 개인정보의 암호화<p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을
                      사용하여 암호화 합니다.</p></li>
                    <li>⑥ 물리적 통제<p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류,
                      보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p></li>
                  </ul>
                </div>
                <div className="terms_tit" id="a8">8. 고지 의무</div>
                <div className="terms_desc">
                  <ul className="list_hyp">
                    <li>- 이 개인정보 처리방침은 2023. 5. 10부터 적용됩니다.</li>
                    <li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다.
                      이용자의 권리 또는 의무에 중요한 내용이 변경될 경우에는 최소
                      30일 전에 안내 드리겠습니다.
                    </li>
                    <li>- 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="privacy_ver13 hide">
              <div className="terms_wrap privacy">
                <div className="terms_tit" id="a1">1. 개인정보의 수집</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 수집 원칙
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시
                          사전에 이용자의 동의를 구하도록 하고 있습니다.
                          <dl>
                            <dt>※ 필수항목과 선택항목</dt>
                            <dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
                            <dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는
                              정보
                            </dd>
                          </dl>
                        </li>
                        <li>- 비바샘은 법령에 따른 개인정보 보유․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간
                          내에서 개인정보를 처리․보유합니다.
                        </li>
                        <li>- 비바샘은 사상·신념, 노동조합·정당의 가입·탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의
                          사생활을 현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 수집 방법
                      <ul className="list_hyp">
                        <li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를
                          수집합니다.
                        </li>
                        <li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수
                          있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ③ 개인정보 수집 목적 및 항목
                      <ul className="list_arrow">
                        <li>
                          ▶ 회원가입 및 주문 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 주문 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th colSpan="2">목적</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="6" className="textC">회원가입 및 관리</td>
                              <td>가입여부 확인</td>
                              <td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
                              <td rowSpan="4" className="textC">목적달성 시 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>아이디 찾기</td>
                              <td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
                            </tr>
                            <tr>
                              <td>비밀번호 찾기</td>
                              <td>[필수]<br/>- 이메일 인증 시 : 성명, 아이디, 이메일<br/>- 휴대전화번호 인증 시 :
                                성명,
                                아이디, 휴대전화번호
                              </td>
                            </tr>
                            <tr>
                              <td>본인확인(식별)</td>
                              <td>&lt;휴대전화 인증 시&gt;<br/>[필수] 성명, 생년월일, 통신사구분, 본인인증 CI,
                                휴대폰번호<br/><br/>&lt;아이핀 인증 시&gt;<br/>[필수] 아이핀ID,
                                비밀번호
                              </td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td>[필수]<br/>아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 주소, 생년월일, 재직학교명,
                                담당학년, 내 교과(중고등), 비상교과서 채택여부, 본인인증 CI,
                                EPKI인증서DN, EPKI인증서SN
                              </td>
                              <td rowSpan="4" className="textC">회원 탈퇴 시 파기<br/>(다만 관계법령에
                                의해
                                보존할 경우 그 의무기간 동안 별도 보관되며 불·편법 행위의 방지 및 대응의 목적으로
                                1년 보관됩니다.)
                              </td>
                            </tr>
                            <tr>
                              <td>단독 회원 SNS 간편 가입</td>
                              <td>[필수]<br/>
                                - 네이버, 카카오 : 성명, 이메일, 휴대전화번호, 출생연도, 생일, 연계정보(CI)<br/>
                                - 페이스북, 구글 : 성명, 이메일, 생년월일<br/>
                                - 애플 : 성명, 이메일<br/>
                                - 웨일 스페이스 : 성명, 이메일
                              </td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">교사맞춤 서비스<br/>제공</td>
                              <td>수업 및 평가 자료 메일링 서비스</td>
                              <td>[필수]<br/>아이디, 성명, 이메일, 재직학교명, 내 교과, 담당학년</td>
                            </tr>
                            <tr>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td>[필수]<br/>아이디, 성명</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 이용자 동의 후 추가로 수집하는 정보
                          <p>
                            개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수
                            있습니다. 개인정보 수집 시 이용자에게 수집하는 개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며,
                            동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을 함께
                            안내합니다.
                          </p>
                          <table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>목적</th>
                              <th>수집항목</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>교사참여 오프라인 행사참여 안내</td>
                              <td>[필수] 성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td>[필수] 성명, 휴대전화번호, 주소, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>V매거진 정기구독</td>
                              <td>[필수] 성명, 재직학교명, 주소, 휴대전화번호</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          ▶ 서비스 이용 과정에서 생성되는 정보
                          <table summary="서비스 이용 과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>본인확인</td>
                              <td>본인인증 CI</td>
                              <td rowSpan="2">회원 탈퇴 시 또는 법정 의무 보유기간<br/>※ 쿠키의 경우, 브라우저 종료
                                시
                                또는 로그아웃 시 만료(단, 아이디 저장 선택 시 30일간 보관)
                              </td>
                            </tr>
                            <tr>
                              <td>서비스 이용 통계 등</td>
                              <td>IP Address, 쿠키, 방문 일시, 서비스 이용기록<br/>※ 모바일 서비스 이용 시 모바일
                                기기정보(고유기기식별정보, OS버전)
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ④ 쿠키를 설치, 운영하는 이용자의 거부권
                      <ul className="list_hyp">
                        <li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC
                          컴퓨터에 저장됩니다.
                        </li>
                        <li>
                          - 쿠키의 사용 목적
                          <ul className="mt0">
                            <li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스
                              이용 제공
                            </li>
                            <li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과
                              관심에 특화된 서비스 및 광고 제공
                            </li>
                          </ul>
                        </li>
                        <li>
                          - 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인
                          / 모든 쿠키 저장 거부를 선택할 수 있습니다.
                          <ul className="mt0">
                            <li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷
                              옵션 &gt; 개인정보 &gt; 설정
                            </li>
                            <li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의
                              콘텐츠 설정 버튼 &gt; 쿠키
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
                <div className="terms_desc">
                  <p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는
                    경우에는 사전에 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <table summary="수집한 개인정보 구분, 이용 목적 테이블">
                    <colgroup>
                      <col style={{width: "30%"}}/>
                      <col style={{width: "auto"}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용 목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리,
                        서비스 부정이용 방지, 회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록
                        보존 등
                      </td>
                    </tr>
                    <tr>
                      <td>교사 맞춤 서비스 제공</td>
                      <td>수업 및 평가 자료 메일링 서비스, 교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, V매거진 정기구독, 무료 전자도서관
                        서비스 이용 등
                      </td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및
                        홍보, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
                      </td>
                    </tr>
                    <tr>
                      <td>통합 회원 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 제3자 제공
                      <ul className="list_hyp">
                        <li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의
                          범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
                        </li>
                        <li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보
                          항목, 제공받는 자의 개인정보 이용목적, 제공받는 자의 보유․이용기간을
                          명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.
                        </li>
                        <li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보처리의 위탁
                      <p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
                      <table summary="개인정보처리 위탁 정보 테이블">
                        <colgroup>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "33%"}}/>
                          <col style={{width: "auto"}}/>
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁 업체</th>
                          <th>위탁업무 내용</th>
                          <th>개인정보의 보유 및<br/>이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td className="textC">Nice 평가정보</td>
                          <td className="textC">본인확인 인증</td>
                          <td rowSpan="8" className="textC">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)북큐브네트웍스</td>
                          <td className="textC">무료 전자도서관 서비스 이용</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)다우기술</td>
                          <td className="textC">이벤트 기프티콘 경품 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜한진<br/>우리아트</td>
                          <td className="textC">이벤트 경품 배송</td>
                        </tr>
                        <tr>
                          <td className="textC">오케이커뮤니케이션즈</td>
                          <td className="textC">SMS 문자 내 수신거부 080 호스팅 제공</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜코리아인</td>
                          <td className="textC">CS 접수 및 고객상담</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜서울디엠<br/>우정사업본부</td>
                          <td className="textC">V매거진 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">CJ 올리브 네트웍스</td>
                          <td className="textC">비즈메시지 발송</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a4">4. 개인정보의 파기</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보의 파기
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보
                          보관 의무를 부과하는 경우와 이용자에게 보관기간에 대해 별도 동의를
                          얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.
                        </li>
                        <li>
                          - 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
                          <table summary="관계법령에 의해 보관해야 하는 정보 테이블">
                            <colgroup>
                              <col style={{width: "20%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "20%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>관계법령</th>
                              <th>보존항목</th>
                              <th>보존기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="3">전자상거래 등에서의<br/>소비자보호에 관한 법률</td>
                              <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                              <td className="textC">3년</td>
                            </tr>
                            <tr>
                              <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                              <td rowSpan="2" className="textC">5년</td>
                            </tr>
                            <tr>
                              <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            <tr>
                              <td>통신비밀보호법</td>
                              <td>인터넷 로그기록자료, 접속지 추적자료</td>
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td>정보통신망법 제50조</td>
                              <td>e메일, 문자와 관련된 개인정보<br/>※탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와
                                별도로 보관되며, 다른 목적으로 이용하지 않습니다.
                              </td>
                              <td className="textC">1년</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 개인정보 유효기간제
                      <ul className="list_hyp">
                        <li>- 비바샘은 장기간 서비스 미 이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원
                          또는 직접 유효기간을 선택한 회원)의 개인정보를 별도의 DB에 분리보관하고
                          있습니다.
                        </li>
                        <li>- 미 이용의 기간은 로그인, 상담원 접촉일자 등으로 산정합니다.</li>
                        <li>- 비바샘은 미 이용자 개인정보 분리/저장시점 도래 30일 이전에 이메일 등을 통해 해당 이용자에게 관련내용을
                          공지합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ③ 개인정보 파기 절차 및 방법
                      <ul className="list_hyp">
                        <li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>
                      ① 개인정보 보호책임자 및 담당부서
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보
                          보호책임자와 담당부서를 지정하여 운영하고 있습니다.
                          <table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <tbody>
                            <tr>
                              <th rowSpan="2">개인정보보호책임자 (CPO)</th>
                              <td>소속 : IT전략 Core</td>
                            </tr>
                            <tr>
                              <td>이름 : 이정우</td>
                            </tr>
                            <tr>
                              <th>개인정보 담당부서</th>
                              <td>정보보안 Cell</td>
                            </tr>
                            <tr>
                              <th rowSpan="2">문의</th>
                              <td>전화 : 1544-0554</td>
                            </tr>
                            <tr>
                              <td>이메일 : <a href="mailto:privacy@visang.com"
                                    target="_blank">privacy@visang.com</a></td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및
                          담당부서로 하실 수 있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      ② 권익침해 구제방법
                      <ul className="list_hyp">
                        <li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.
                        </li>
                        <li>- 아래 기관은 비바샘과는 별개의 기관입니다.
                          <table summary="권익침해 구제방법 기관 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                              <col style={{width: "30%"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>홈페이지</th>
                              <th>전화</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 침해신고센터<br/>(한국인터넷진흥원 운영)</td>
                              <td><a href="http://privacy.kisa.or.kr"
                                target="_blank">privacy.kisa.or.kr</a></td>
                              <td>(국번없이) 118</td>
                            </tr>
                            <tr>
                              <td>개인정보 분쟁조정위원회</td>
                              <td><a href="http://www.kopico.go.kr"
                                target="_blank">www.kopico.go.kr</a></td>
                              <td>(국번없이) 1833-6972</td>
                            </tr>
                            <tr>
                              <td>대검찰청 사이버수사과</td>
                              <td><a href="http://www.spo.go.kr"
                                target="_blank">www.spo.go.kr</a></td>
                              <td>(국번없이) 1301</td>
                            </tr>
                            <tr>
                              <td>경찰청 사이버수사국</td>
                              <td><a href="http://cyberbureau.police.go.kr"
                                target="_blank">cyberbureau.police.go.kr</a></td>
                              <td>(국번없이) 182</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a6">6. 이용자·법정대리인의 권리행사방법 및 의무</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 권리행사방법
                      <ul className="list_hyp">
                        <li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
                          <table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
                            <colgroup>
                              <col style={{width: "30%"}}/>
                              <col style={{width: "auto"}}/>
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>요청 방법</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
                              <td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX)
                                등을 통하여 문의
                              </td>
                            </tr>
                            <tr>
                              <td>개인정보 조회/수정</td>
                              <td>『회원정보변경』메뉴</td>
                            </tr>
                            <tr>
                              <td>동의 철회</td>
                              <td>제3자 마케팅 동의 등 철회 방법 안내</td>
                            </tr>
                            <tr>
                              <td>회원 탈퇴</td>
                              <td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를
                          이용하거나 제공하지 않습니다. 단, 잘못된 개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려
                          수정될 수 있도록 하겠습니다.
                        </li>
                        <li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 처리 방법에 대한
                          고지 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
                        </li>
                        <li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될
                          수 있습니다.
                        </li>
                        <li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수
                          없습니다.
                        </li>
                        <li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나
                          정당한 대리인인지를 확인합니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 이용자의 의무
                      <ul className="list_hyp">
                        <li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을
                          침해하여서는 아니 됩니다.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
                <div className="terms_desc">비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
                  <ul className="list_num">
                    <li>① 내부관리계획의 수립<p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p></li>
                    <li>② 개인정보 취급자 최소화<p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보
                      유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는 데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고
                      지속적인 감사를 시행하고 있습니다.</p></li>
                    <li>③ 정기 교육<p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의
                      중요성을 강조하고 있습니다.</p></li>
                    <li>④ 해킹이나 바이러스로부터 보호<p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한,
                      개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을 이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p></li>
                    <li>⑤ 개인정보의 암호화<p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을
                      사용하여 암호화 합니다.</p></li>
                    <li>⑥ 물리적 통제<p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류,
                      보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p></li>
                  </ul>
                </div>
                <div className="terms_tit" id="a8">8. 고지 의무</div>
                <div className="terms_desc">
                  <ul className="list_hyp">
                    <li>- 이 개인정보 처리방침은 2022. 7. 11부터 적용됩니다.</li>
                    <li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다.
                      이용자의 권리 또는 의무에 중요한 내용이 변경될 경우에는 최소
                      30일 전에 안내 드리겠습니다.
                    </li>
                    <li>- 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="privacy_ver12 hide">
							<div className="terms_wrap privacy">
								<div className="terms_tit" id="a1">1. 개인정보의 수집</div>
								<div className="terms_desc">
									<ul className="list_num">
										<li>
											① 개인정보 수집 원칙
											<ul className="list_hyp">
												<li>
													- 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시
													사전에 이용자의 동의를 구하도록 하고 있습니다.
													<dl>
														<dt>※ 필수항목과 선택항목</dt>
														<dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
														<dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는
															정보
														</dd>
													</dl>
												</li>
												<li>- 비바샘은 법령에 따른 개인정보 보유․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간
													내에서 개인정보를 처리․보유합니다.
												</li>
												<li>- 비바샘은 사상·신념, 노동조합·정당의 가입·탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의
													사생활을 현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.
												</li>
											</ul>
										</li>
										<li>
											② 개인정보 수집 방법
											<ul className="list_hyp">
												<li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를
													수집합니다.
												</li>
												<li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수
													있습니다.
												</li>
											</ul>
										</li>
										<li>
											③ 개인정보 수집 목적 및 항목
											<ul className="list_arrow">
												<li>
													▶ 회원가입 및 주문 등 필요시점에서 수집하는 정보
													<table summary="회원가입 및 주문 등 필요시점에서 수집하는 정보 테이블">
														<colgroup>
															<col style={{width: "20%"}}/>
															<col style={{width: "20%"}}/>
															<col style={{width: "auto"}}/>
															<col style={{width: "20%"}}/>
														</colgroup>
														<thead>
														<tr>
															<th colSpan="2">목적</th>
															<th>수집하는 개인정보 항목</th>
															<th>보유 기간</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td rowSpan="6" className="textC">회원가입 및 관리</td>
															<td>가입여부 확인</td>
															<td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
															<td rowSpan="4" className="textC">목적달성 시 즉시 파기</td>
														</tr>
														<tr>
															<td>아이디 찾기</td>
															<td>[필수]<br/>성명, 이메일, 휴대전화번호</td>
														</tr>
														<tr>
															<td>비밀번호 찾기</td>
															<td>[필수]<br/>- 이메일 인증 시 : 성명, 아이디, 이메일<br/>- 휴대전화번호 인증 시 :
																성명,
																아이디, 휴대전화번호
															</td>
														</tr>
														<tr>
															<td>본인확인(식별)</td>
															<td>&lt;휴대전화 인증 시&gt;<br/>[필수] 성명, 생년월일, 통신사구분, 본인인증 CI,
																휴대폰번호<br/><br/>&lt;아이핀 인증 시&gt;<br/>[필수] 아이핀ID,
																비밀번호
															</td>
														</tr>
														<tr>
															<td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
															<td>[필수]<br/>아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 주소, 생년월일, 재직학교명,
																담당학년, 내 교과(중고등), 비상교과서 채택여부, 본인인증 CI,
																EPKI인증서DN, EPKI인증서SN
															</td>
															<td rowSpan="4" className="textC">회원 탈퇴 시 파기<br/>(다만 관계법령에
																의해
																보존할 경우 그 의무기간 동안 별도 보관되며 불·편법 행위의 방지 및 대응의 목적으로
																1년 보관됩니다.)
															</td>
														</tr>
														<tr>
															<td>단독 회원 SNS 간편 가입</td>
															<td>[필수]<br/>
																- 네이버, 카카오 : 성명, 이메일, 휴대전화번호, 출생연도, 생일, 연계정보(CI)<br/>
																- 페이스북, 구글 : 성명, 이메일, 생년월일<br/>
																- 애플 : 성명, 이메일<br/>
															</td>
														</tr>
														<tr>
															<td rowSpan="2" className="textC">교사맞춤 서비스<br/>제공</td>
															<td>수업 및 평가 자료 메일링 서비스</td>
															<td>[필수]<br/>아이디, 성명, 이메일, 재직학교명, 내 교과, 담당학년</td>
														</tr>
														<tr>
															<td>무료 전자도서관 서비스 이용</td>
															<td>[필수]<br/>아이디, 성명</td>
														</tr>
														</tbody>
													</table>
												</li>
												<li>
													▶ 이용자 동의 후 추가로 수집하는 정보
													<p>
														개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수
														있습니다. 개인정보 수집 시 이용자에게 수집하는 개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며,
														동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을 함께
														안내합니다.
													</p>
													<table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
														<colgroup>
															<col style={{width: "30%"}}/>
															<col style={{width: "auto"}}/>
														</colgroup>
														<thead>
														<tr>
															<th>목적</th>
															<th>수집항목</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td>교사참여 오프라인 행사참여 안내</td>
															<td>[필수] 성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
														</tr>
														<tr>
															<td>경품 및 기프티콘 발송</td>
															<td>[필수] 성명, 휴대전화번호, 주소, 재직학교명</td>
														</tr>
														<tr>
															<td>V매거진 정기구독</td>
															<td>[필수] 성명, 재직학교명, 주소, 휴대전화번호</td>
														</tr>
														</tbody>
													</table>
												</li>
												<li>
													▶ 서비스 이용 과정에서 생성되는 정보
													<table summary="서비스 이용 과정에서 생성되는 정보 테이블">
														<colgroup>
															<col style={{width: "20%"}}/>
															<col style={{width: "auto"}}/>
															<col style={{width: "30%"}}/>
														</colgroup>
														<thead>
														<tr>
															<th>구분</th>
															<th>수집하는 개인정보 항목</th>
															<th>보유 기간</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td>본인확인</td>
															<td>본인인증 CI</td>
															<td rowSpan="2">회원 탈퇴 시 또는 법정 의무 보유기간<br/>※ 쿠키의 경우, 브라우저 종료
																시
																또는 로그아웃 시 만료(단, 아이디 저장 선택 시 30일간 보관)
															</td>
														</tr>
														<tr>
															<td>서비스 이용 통계 등</td>
															<td>IP Address, 쿠키, 방문 일시, 서비스 이용기록<br/>※ 모바일 서비스 이용 시 모바일
																기기정보(고유기기식별정보, OS버전)
															</td>
														</tr>
														</tbody>
													</table>
												</li>
											</ul>
										</li>
										<li>
											④ 쿠키를 설치, 운영하는 이용자의 거부권
											<ul className="list_hyp">
												<li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC
													컴퓨터에 저장됩니다.
												</li>
												<li>
													- 쿠키의 사용 목적
													<ul className="mt0">
														<li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스
															이용 제공
														</li>
														<li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과
															관심에 특화된 서비스 및 광고 제공
														</li>
													</ul>
												</li>
												<li>
													- 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인
													/ 모든 쿠키 저장 거부를 선택할 수 있습니다.
													<ul className="mt0">
														<li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷
															옵션 &gt; 개인정보 &gt; 설정
														</li>
														<li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의
															콘텐츠 설정 버튼 &gt; 쿠키
														</li>
													</ul>
												</li>
											</ul>
										</li>
									</ul>
								</div>
								<div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
								<div className="terms_desc">
									<p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는
										경우에는 사전에 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
									<table summary="수집한 개인정보 구분, 이용 목적 테이블">
										<colgroup>
											<col style={{width: "30%"}}/>
											<col style={{width: "auto"}}/>
										</colgroup>
										<thead>
										<tr>
											<th>구분</th>
											<th>이용 목적</th>
										</tr>
										</thead>
										<tbody>
										<tr>
											<td>회원 관리</td>
											<td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리,
												서비스 부정이용 방지, 회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록
												보존 등
											</td>
										</tr>
										<tr>
											<td>교사 맞춤 서비스 제공</td>
											<td>수업 및 평가 자료 메일링 서비스, 교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, V매거진 정기구독, 무료 전자도서관
												서비스 이용 등
											</td>
										</tr>
										<tr>
											<td>마케팅 및 광고</td>
											<td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및
												홍보, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
											</td>
										</tr>
										<tr>
											<td>통합 회원 서비스 제공</td>
											<td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
										</tr>
										</tbody>
									</table>
								</div>
								<div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
								<div className="terms_desc">
									<ul className="list_num">
										<li>
											① 개인정보의 제3자 제공
											<ul className="list_hyp">
												<li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의
													범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
												</li>
												<li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보
													항목, 제공받는 자의 개인정보 이용목적, 제공받는 자의 보유․이용기간을
													명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.
												</li>
												<li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
											</ul>
										</li>
										<li>
											② 개인정보처리의 위탁
											<p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
											<table summary="개인정보처리 위탁 정보 테이블">
												<colgroup>
													<col style={{width: "33%"}}/>
													<col style={{width: "33%"}}/>
													<col style={{width: "auto"}}/>
												</colgroup>
												<thead>
												<tr>
													<th>수탁 업체</th>
													<th>위탁업무 내용</th>
													<th>개인정보의 보유 및<br/>이용기간</th>
												</tr>
												</thead>
												<tbody>
                        <tr>
													<td className="textC">Nice 평가정보</td>
													<td className="textC">본인확인 인증</td>
													<td rowSpan="8" className="textC">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
												</tr>
												<tr>
													<td className="textC">(주)북큐브네트웍스</td>
													<td className="textC">무료 전자도서관 서비스 이용</td>
												</tr>
												<tr>
													<td className="textC">(주)다우기술</td>
													<td className="textC">이벤트 기프티콘 경품 발송</td>
												</tr>
												<tr>
													<td className="textC">㈜한진<br/>우리아트</td>
													<td className="textC">이벤트 경품 배송</td>
												</tr>
												<tr>
													<td className="textC">오케이커뮤니케이션즈</td>
													<td className="textC">SMS 문자 내 수신거부 080 호스팅 제공</td>
												</tr>
												<tr>
                          <td className="textC">㈜코리아인</td>
                          <td className="textC">CS 접수 및 고객상담</td>
                        </tr>
                        <tr>
                          <td className="textC">㈜서울디엠<br/>우정사업본부</td>
                          <td className="textC">V매거진 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">CJ 올리브 네트웍스</td>
                          <td className="textC">비즈메시지 발송</td>
                        </tr>
												</tbody>
											</table>
										</li>
									</ul>
								</div>
								<div className="terms_tit" id="a4">4. 개인정보의 파기</div>
								<div className="terms_desc">
									<ul className="list_num">
										<li>
											① 개인정보의 파기
											<ul className="list_hyp">
												<li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보
													보관 의무를 부과하는 경우와 이용자에게 보관기간에 대해 별도 동의를
													얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.
												</li>
												<li>
													- 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
													<table summary="관계법령에 의해 보관해야 하는 정보 테이블">
														<colgroup>
															<col style={{width: "20%"}}/>
															<col style={{width: "auto"}}/>
															<col style={{width: "20%"}}/>
														</colgroup>
														<thead>
														<tr>
															<th>관계법령</th>
															<th>보존항목</th>
															<th>보존기간</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td rowspan="3">전자상거래 등에서의<br/>소비자보호에 관한 법률</td>
															<td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
															<td className="textC">3년</td>
														</tr>
														<tr>
															<td>대금결제 및 재화 등의 공급에 관한 기록</td>
															<td rowspan="2" className="textC">5년</td>
														</tr>
														<tr>
															<td>계약 또는 청약철회 등에 관한 기록</td>
														</tr>
														<tr>
															<td>통신비밀보호법</td>
															<td>인터넷 로그기록자료, 접속지 추적자료</td>
															<td className="textC">3개월</td>
														</tr>
														<tr>
															<td>정보통신망법 제50조</td>
															<td>e메일, 문자와 관련된 개인정보<br/>※탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와
																별도로 보관되며, 다른 목적으로 이용하지 않습니다.
															</td>
															<td className="textC">1년</td>
														</tr>
														</tbody>
													</table>
												</li>
											</ul>
										</li>
										<li>
											② 개인정보 유효기간제
											<ul className="list_hyp">
												<li>- 비바샘은 장기간 서비스 미 이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원
													또는 직접 유효기간을 선택한 회원)의 개인정보를 별도의 DB에 분리보관하고
													있습니다.
												</li>
												<li>- 미 이용의 기간은 로그인, 상담원 접촉일자 등으로 산정합니다.</li>
												<li>- 비바샘은 미 이용자 개인정보 분리/저장시점 도래 30일 이전에 이메일 등을 통해 해당 이용자에게 관련내용을
													공지합니다.
												</li>
											</ul>
										</li>
										<li>
											③ 개인정보 파기 절차 및 방법
											<ul className="list_hyp">
												<li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
												<li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
											</ul>
										</li>
									</ul>
								</div>
								<div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
								<div className="terms_desc">
									<ul className="list_num">
										<li>
											① 개인정보 보호책임자 및 담당부서
											<ul className="list_hyp">
												<li>
													- 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보
													보호책임자와 담당부서를 지정하여 운영하고 있습니다.
													<table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
														<colgroup>
															<col style={{width: "30%"}}/>
															<col style={{width: "auto"}}/>
														</colgroup>
														<tbody>
														<tr>
															<th rowSpan="2">개인정보보호책임자 (CPO)</th>
															<td>소속 : IT전략 Core</td>
														</tr>
														<tr>
															<td>이름 : 이정우</td>
														</tr>
														<tr>
															<th>개인정보 담당부서</th>
															<td>정보보안 Cell</td>
														</tr>
														<tr>
															<th rowSpan="2">문의</th>
															<td>전화 : 1544-0554</td>
														</tr>
														<tr>
															<td>이메일 : <a href="mailto:privacy@visang.com"
															             target="_blank">privacy@visang.com</a></td>
														</tr>
														</tbody>
													</table>
												</li>
												<li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 하실 수 있습니다.
												</li>
											</ul>
										</li>
										<li>
											② 권익침해 구제방법
											<ul className="list_hyp">
												<li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.
												</li>
												<li>- 아래 기관은 비바샘과는 별개의 기관입니다.
													<table summary="권익침해 구제방법 기관 테이블">
														<colgroup>
															<col style={{width: "30%"}}/>
															<col style={{width: "auto"}}/>
															<col style={{width: "30%"}}/>
														</colgroup>
														<thead>
														<tr>
															<th>구분</th>
															<th>홈페이지</th>
															<th>전화</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td>개인정보 침해신고센터<br/>(한국인터넷진흥원 운영)</td>
															<td><a href="http://privacy.kisa.or.kr"
															       target="_blank">privacy.kisa.or.kr</a></td>
															<td>(국번없이) 118</td>
														</tr>
														<tr>
															<td>개인정보 분쟁조정위원회</td>
															<td><a href="http://www.kopico.go.kr"
															       target="_blank">www.kopico.go.kr</a></td>
															<td>(국번없이) 1833-6972</td>
														</tr>
														<tr>
															<td>대검찰청 사이버수사과</td>
															<td><a href="http://www.spo.go.kr"
															       target="_blank">www.spo.go.kr</a></td>
															<td>(국번없이) 1301</td>
														</tr>
														<tr>
															<td>경찰청 사이버수사국</td>
															<td><a href="http://cyberbureau.police.go.kr"
															       target="_blank">cyberbureau.police.go.kr</a></td>
															<td>(국번없이) 182</td>
														</tr>
														</tbody>
													</table>
												</li>
											</ul>
										</li>
									</ul>
								</div>
								<div className="terms_tit" id="a6">6. 이용자·법정대리인의 권리행사방법 및 의무</div>
								<div className="terms_desc">
									<ul className="list_num">
										<li>① 권리행사방법
											<ul className="list_hyp">
												<li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
													<table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
														<colgroup>
															<col style={{width: "30%"}}/>
															<col style={{width: "auto"}}/>
														</colgroup>
														<thead>
														<tr>
															<th>구분</th>
															<th>요청 방법</th>
														</tr>
														</thead>
														<tbody>
														<tr>
															<td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
															<td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX)
																등을 통하여 문의
															</td>
														</tr>
														<tr>
															<td>개인정보 조회/수정</td>
															<td>『회원정보변경』메뉴</td>
														</tr>
														<tr>
															<td>동의 철회</td>
															<td>제3자 마케팅 동의 등 철회 방법 안내</td>
														</tr>
														<tr>
															<td>회원 탈퇴</td>
															<td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
														</tr>
														</tbody>
													</table>
												</li>
												<li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를
													이용하거나 제공하지 않습니다. 단, 잘못된 개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려
													수정될 수 있도록 하겠습니다.
												</li>
												<li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 처리 방법에 대한 고지 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
												</li>
												<li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될
													수 있습니다.
												</li>
												<li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수
													없습니다.
												</li>
												<li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나
													정당한 대리인인지를 확인합니다.
												</li>
											</ul>
										</li>
										<li>② 이용자의 의무
											<ul className="list_hyp">
												<li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을
													침해하여서는 아니 됩니다.
												</li>
											</ul>
										</li>
									</ul>
								</div>
								<div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
								<div className="terms_desc">비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
									<ul className="list_num">
										<li>① 내부관리계획의 수립<p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p></li>
										<li>② 개인정보 취급자 최소화<p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보
											유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는 데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고
											지속적인 감사를 시행하고 있습니다.</p></li>
										<li>③ 정기 교육<p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의
											중요성을 강조하고 있습니다.</p></li>
										<li>④ 해킹이나 바이러스로부터 보호<p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한,
											개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을 이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p></li>
										<li>⑤ 개인정보의 암호화<p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을
											사용하여 암호화 합니다.</p></li>
										<li>⑥ 물리적 통제<p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류,
											보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p></li>
									</ul>
								</div>
								<div className="terms_tit" id="a8">8. 고지 의무</div>
								<div className="terms_desc">
									<ul className="list_hyp">
										<li>- 이 개인정보 처리방침은 2022. 4. 14부터 적용됩니다.</li>
										<li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다.
											이용자의 권리 또는 의무에 중요한 내용이 변경될 경우에는 최소
											30일 전에 안내 드리겠습니다.
										</li>
										<li>- 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
									</ul>
								</div>
							</div>
						</div>
            <div className="privacy_ver11 hide">
              <div className="terms_wrap privacy">
                <div className="terms_tit" id="a1">1. 개인정보의 수집</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보 수집 원칙
                      <ul className="list_hyp">
                        <li>- 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시 사전에 이용자의 동의를 구하도록 하고
                          있습니다.
                          <dl>
                            <dt>※ 필수항목과 선택항목</dt>
                            <dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
                            <dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는 정보</dd>
                          </dl>
                        </li>
                        <li>- 비바샘은 법령에 따른 개인정보 보유․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.</li>
                        <li>- 비바샘은 사상&middot;신념, 노동조합&middot;정당의 가입&middot;탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의 사생활을
                          현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보 수집 방법
                      <ul className="list_hyp">
                        <li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를 수집합니다.</li>
                        <li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>③ 개인정보 수집 목적 및 항목
                      <ul className="list_arrow">
                        <li>▶ 회원가입 및 주문 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 주문 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{'width': '20%'}} />
                              <col style={{'width': '20%'}} />
                              <col style={{'width': 'auto'}} />
                              <col style={{'width': '20%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th colSpan="2">목적</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="5" className="textC">회원가입 및 관리</td>
                              <td>가입여부 확인</td>
                              <td>[필수]<br />성명, 이메일, 휴대전화번호</td>
                              <td rowSpan="4" className="textC">목적달성 시 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>아이디 찾기</td>
                              <td>[필수]<br />성명, 이메일, 휴대전화번호</td>
                            </tr>
                            <tr>
                              <td>비밀번호 찾기</td>
                              <td>[필수]<br />
                                - 이메일 인증 시 : 성명, 아이디, 이메일<br />
                                - 휴대전화번호 인증 시 : 성명, 아이디, 휴대전화번호
                              </td>
                            </tr>
                            <tr>
                              <td>본인확인(식별)</td>
                              <td>
                                &lt;휴대전화 인증 시&gt;<br />[필수] 성명, 생년월일, 통신사구분, 본인인증 CI, 휴대폰번호<br /><br />
                                &lt;아이핀 인증 시&gt;<br />[필수] 아이핀ID, 비밀번호
                              </td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td>[필수]<br />아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 주소, 생년월일, 재직학교명, 담당학년, 내 교과(중고등), 비상교과서 채택여부,
                                본인인증 CI, EPKI인증서DN, EPKI인증서SN, 재직증명서, 근로계약서</td>
                              <td rowSpan="5" className="textC">회원 탈퇴 시 파기<br />(다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며
                                불&middot;편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.)</td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">SNS 간편 가입<br />및 관리</td>
                              <td>가입여부 확인</td>
                              <td>
                                [필수]<br />
                                - 네이버 : 이메일, 휴대전화번호<br />
                                - 카카오 : 이메일, 휴대전화번호
                                - 카카오 : 이메일
                                - 카카오 : 이메일
                              </td>
                            </tr>
                            <tr>
                              <td>
                                홈페이지 가입 및<br />이용, 본인 확인 및 회원제 서비스 제공<br />등
                              </td>
                              <td>[필수]<br />아이디, 성명, 이메일 휴대전화번호, 주소, 생년월일, 재직학교명, 담당학년, 내 교과<br />(중고등), 비상교과서 채택여부,
                                EPKI인증서DN, EPKI인증서SN</td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">교사맞춤 서비스<br />제공</td>
                              <td>수업 및 평가 자료 메일링 서비스</td>
                              <td>[필수]<br />아이디, 성명, 이메일, 재직학교명, 내 교과, 담당학년</td>
                            </tr>
                            <tr>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td>[필수]<br />아이디, 성명</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>▶ 이용자 동의 후 추가로 수집하는 정보
                          <p>개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수 있습니다. 개인정보 수집 시 이용자에게 수집하는
                            개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며, 동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을
                            함께 안내합니다.</p>
                          <table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>목적</th>
                              <th>수집항목</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>교사참여 오프라인 행사참여 안내</td>
                              <td>[필수] 성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td>[필수] 성명, 휴대전화번호, 주소, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>V매거진 정기구독</td>
                              <td>[필수] 아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>▶ 서비스 이용 과정에서 생성되는 정보
                          <table summary="서비스 이용 과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'30%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>본인확인</td>
                              <td>본인인증 CI</td>
                              <td rowSpan="2">회원 탈퇴 시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료 시 또는 로그아웃 시 만료(단, 아이디 저장 선택 시
                                30일간 보관)</td>
                            </tr>
                            <tr>
                              <td>서비스 이용 통계 등</td>
                              <td>IP Address, 쿠키, 방문 일시, 서비스 이용기록<br />※ 모바일 서비스 이용 시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>④ 쿠키를 설치, 운영하는 이용자의 거부권
                      <ul className="list_hyp">
                        <li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터에 저장됩니다.</li>
                        <li>- 쿠키의 사용 목적
                          <ul className="mt0">
                            <li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스 이용 제공</li>
                            <li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과 관심에 특화된 서비스 및 광고 제공</li>
                          </ul>
                        </li>
                        <li>- 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인 / 모든 쿠키 저장 거부를 선택할 수
                          있습니다.
                          <ul className="mt0">
                            <li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷 옵션 &gt; 개인정보 &gt; 설정</li>
                            <li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의 콘텐츠 설정 버튼 &gt; 쿠키</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
                <div className="terms_desc">
                  <p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전에 동의를 받는 등
                    필요한 조치를 이행할 예정입니다.</p>
                  <table summary="수집한 개인정보 구분, 이용 목적 테이블">
                    <colgroup>
                      <col style={{'width':'30%'}} />
                      <col style={{'width':'auto'}} />
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용 목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지, 회원에 대한
                        고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등
                      </td>
                    </tr>
                    <tr>
                      <td>교사 맞춤 서비스 제공</td>
                      <td>수업 및 평가 자료 메일링 서비스, 교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, V매거진 정기구독, 무료 전자도서관 서비스 이용 등</td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보, 접속 빈도 파악 또는 회원의
                        서비스 이용에 대한 통계
                      </td>
                    </tr>
                    <tr>
                      <td>통합 회원 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보의 제3자 제공
                      <ul className="list_hyp">
                        <li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지
                          않습니다.
                        </li>
                        <li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보 항목, 제공받는 자의 개인정보 이용목적,
                          제공받는 자의 보유․이용기간을 명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.
                        </li>
                        <li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
                        <li>- 비바샘은 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.
                          <table summary="개인정보 제3자에게 제공 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'25%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'25s%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>개인정보<br />제공받는자</th>
                              <th>제공받는자의<br />개인정보<br />이용목적</th>
                              <th>제공하는<br />개인정보<br />항목</th>
                              <th>제공받는자의<br />보유<br />이용기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="2" className="textC">(주)비상교육 티스쿨</td>
                              <td>
                                <ul className="list_hyp">
                                  <li>- 제휴사 웹사이트 로그인</li>
                                  <li>- 제휴사 서비스 제공</li>
                                  <li>- 교사 혜택 제공</li>
                                  <li>- 제휴사가 제공하는 홍보 정보 전송</li>
                                </ul>
                              </td>
                              <td>[필수]<br />아이디, 이름, 생년월일, 이메일, 휴대전화번호, 개인정보 유효기간, 본인 인증 CI</td>
                              <td>회원 탈퇴 혹은 제휴사 정보 제공 동의 철회 시까지</td>
                            </tr>
                            <tr>
                              <td>제휴사측에서 이벤트, 홍보용 안내 (SMS, 이메일, 전화)</td>
                              <td>[선택]<br />아이디, 이름, 생년월일, 이메일, 휴대전화번호</td>
                              <td>회원 탈퇴 혹은 제3자 마케팅 활용 동의 철회 시까지</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보처리의 위탁
                      <p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
                      <table summary="개인정보처리 위탁 정보 테이블">
                        <colgroup>
                          <col style={{'width':'33%'}} />
                          <col style={{'width':'33%'}} />
                          <col style={{'width':'auto'}} />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁 업체</th>
                          <th>위탁업무 내용</th>
                          <th>개인정보의 보유 및<br />이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
													<td className="textC">Nice 평가정보</td>
													<td className="textC">본인확인 인증</td>
													<td rowSpan="5" className="textC">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
												</tr>
												<tr>
													<td className="textC">(주)북큐브네트웍스</td>
													<td className="textC">무료 전자도서관 서비스 이용</td>
												</tr>
												<tr>
													<td className="textC">(주)다우기술</td>
													<td className="textC">이벤트 기프티콘 경품 발송</td>
												</tr>
												<tr>
													<td className="textC">롯데글로벌로지스㈜</td>
													<td className="textC">이벤트 경품 배송</td>
												</tr>
												<tr>
													<td className="textC">오케이커뮤니케이션즈</td>
													<td className="textC">SMS 문자 내 수신거부 080 호스팅 제공</td>
												</tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a4">4. 개인정보의 파기</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보의 파기
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보 보관 의무를 부과하는 경우와 이용자에게
                          보관기간에 대해 별도 동의를 얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.
                        </li>
                        <li>- 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
                          <table summary="관계법령에 의해 보관해야 하는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'20%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>관계법령</th>
                              <th>보존항목</th>
                              <th>보존기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>통신비밀보호법</td>
                              <td>인터넷 로그기록자료, 접속지 추적자료</td>
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td>정보통신망법 제50조</td>
                              <td>e메일, 문자와 관련된 개인정보<br />※탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.
                              </td>
                              <td className="textC">1년</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보 유효기간제
                      <ul className="list_hyp">
                        <li>- 비바샘은 장기간 서비스 미 이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의
                          개인정보를 별도의 DB에 분리보관하고 있습니다.
                        </li>
                        <li>- 미 이용의 기간은 로그인, 상담원 접촉일자 등으로 산정합니다.</li>
                        <li>- 비바샘은 미 이용자 개인정보 분리/저장시점 도래 30일 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>③ 개인정보 파기 절차 및 방법
                      <ul className="list_hyp">
                        <li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보 보호책임자 및 담당부서
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보 보호책임자와 담당부서를 지정하여 운영하고 있습니다.
                          <table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <tbody>
                            <tr>
                              <th rowSpan="2">개인정보보호책임자 (CPO)</th>
                              <td>소속 : IT전략 Core</td>
                            </tr>
                            <tr>
                              <td>이름 : 이정우</td>
                            </tr>
                            <tr>
                              <th>개인정보 담당부서</th>
                              <td>정보보안 Cell</td>
                            </tr>
                            <tr>
                              <th rowSpan="2">문의</th>
                              <td>전화 : 1544-0554</td>
                            </tr>
                            <tr>
                              <td>이메일 : <a href="mailto:privacy@visang.com" target="_blank">privacy@visang.com</a></td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 하실 수
                          있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 권익침해 구제방법
                      <ul className="list_hyp">
                        <li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.</li>
                        <li>- 아래 기관은 비바샘과는 별개의 기관입니다.
                          <table summary="권익침해 구제방법 기관 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'30%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>홈페이지</th>
                              <th>전화</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 침해신고센터<br />(한국인터넷진흥원 운영)</td>
                              <td><a href="http://privacy.kisa.or.kr" target="_blank">privacy.kisa.or.kr</a></td>
                              <td>(국번없이) 118</td>
                            </tr>
                            <tr>
                              <td>개인정보 분쟁조정위원회</td>
                              <td><a href="http://www.kopico.go.kr" target="_blank">www.kopico.go.kr</a></td>
                              <td>(국번없이) 1833-6972</td>
                            </tr>
                            <tr>
                              <td>대검찰청 사이버범죄수사단</td>
                              <td><a href="http://www.spo.go.kr" target="_blank">www.spo.go.kr</a></td>
                              <td>(국번없이) 1301</td>
                            </tr>
                            <tr>
                              <td>경찰청 사이버안전국</td>
                              <td><a href="http://cyberbureau.police.go.kr" target="_blank">cyberbureau.police.go.kr</a>
                              </td>
                              <td>(국번없이) 182</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a6">6. 이용자&middot;법정대리인의 권리행사방법 및 의무</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 권리행사방법
                      <ul className="list_hyp">
                        <li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
                          <table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>요청 방법</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
                              <td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 문의</td>
                            </tr>
                            <tr>
                              <td>개인정보 조회/수정</td>
                              <td>『회원정보변경』메뉴</td>
                            </tr>
                            <tr>
                              <td>동의 철회</td>
                              <td>제3자 마케팅 동의 등 철회 방법 안내</td>
                            </tr>
                            <tr>
                              <td>회원 탈퇴</td>
                              <td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를 이용하거나 제공하지 않습니다. 단, 잘못된
                          개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려 수정될 수 있도록 하겠습니다.
                        </li>
                        <li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른
                          위임장을 제출하셔야 합니다.
                        </li>
                        <li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제5항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.</li>
                        <li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
                        <li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정&middot;삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를
                          확인합니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 이용자의 의무
                      <ul className="list_hyp">
                        <li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을 침해하여서는 아니 됩니다.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
                <div className="terms_desc">
                  비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
                  <ul className="list_num">
                    <li>
                      ① 내부관리계획의 수립
                      <p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p>
                    </li>
                    <li>
                      ② 개인정보 취급자 최소화
                      <p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보 유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는
                        데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고 지속적인 감사를 시행하고 있습니다.</p>
                    </li>
                    <li>
                      ③ 정기 교육
                      <p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의 중요성을 강조하고 있습니다.</p>
                    </li>
                    <li>
                      ④ 해킹이나 바이러스로부터 보호
                      <p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한, 개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을
                        이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p>
                    </li>
                    <li>
                      ⑤ 개인정보의 암호화
                      <p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을 사용하여 암호화 합니다.</p>
                    </li>
                    <li>
                      ⑥ 물리적 통제
                      <p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류, 보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a8">8. 고지 의무</div>
                <div className="terms_desc">
                  <ul className="list_hyp">
                    <li>- 이 개인정보 처리방침은 2022. 01. 25부터 적용됩니다.</li>
                    <li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다. 이용자의 권리 또는 의무에 중요한
                      내용이 변경될 경우에는 최소 30일 전에 안내 드리겠습니다.
                    </li>
                    <li>- 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="privacy_ver10 hide">
              <div className="terms_wrap privacy">
                <div className="terms_tit" id="a1">1. 개인정보의 수집</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보 수집 원칙
                      <ul className="list_hyp">
                        <li>- 비바샘은 서비스 제공에 필요한 최소한의 개인정보만 수집하도록 필수항목과 선택항목으로 구분하여 수집하며, 수집 시 반드시 사전에 이용자의 동의를 구하도록 하고
                          있습니다.
                          <dl>
                            <dt>※ 필수항목과 선택항목</dt>
                            <dd>필수항목 : 서비스의 본질적 기능을 수행하기 위해 필요한 정보</dd>
                            <dd>선택항목 : 부가 가치를 제공하기 위해 추가로 수집하는 정보로써, 입력하지 않아도 서비스 이용의 제한이 없는 정보</dd>
                          </dl>
                        </li>
                        <li>- 비바샘은 법령에 따른 개인정보 보유․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.</li>
                        <li>- 비바샘은 사상&middot;신념, 노동조합&middot;정당의 가입&middot;탈퇴, 정치적 견해, 건강, 성생활 등에 관한 정보, 그 밖에 이용자의 사생활을
                          현저히 침해할 우려가 있는 민감한 개인정보를 수집하지 않습니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보 수집 방법
                      <ul className="list_hyp">
                        <li>- 비바샘은 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청 등의 방법으로 이용자의 개인정보를 수집합니다.</li>
                        <li>- 기기정보, 로그 분석 프로그램을 통한 생성정보는 PC웹, 모바일 웹/앱 이용 과정에서 자동으로 생성되어 수집될 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>③ 개인정보 수집 목적 및 항목
                      <ul className="list_arrow">
                        <li>▶ 회원가입 및 주문 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 주문 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{'width': '20%'}} />
                              <col style={{'width': '20%'}} />
                              <col style={{'width': 'auto'}} />
                              <col style={{'width': '20%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th colSpan="2">목적</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="5" className="textC">회원가입 및 관리</td>
                              <td>가입여부 확인</td>
                              <td>[필수]<br />성명, 이메일, 휴대전화번호</td>
                              <td rowSpan="4" className="textC">목적달성 시 즉시 파기</td>
                            </tr>
                            <tr>
                              <td>아이디 찾기</td>
                              <td>[필수]<br />성명, 이메일, 휴대전화번호</td>
                            </tr>
                            <tr>
                              <td>비밀번호 찾기</td>
                              <td>[필수]<br />
                                - 이메일 인증 시 : 성명, 아이디, 이메일<br />
                                - 휴대전화번호 인증 시 : 성명, 아이디, 휴대전화번호
                              </td>
                            </tr>
                            <tr>
                              <td>본인확인(식별)</td>
                              <td>
                                &lt;휴대전화 인증 시&gt;<br />[필수] 성명, 생년월일,  통신사구분, 본인인증 CI, 휴대폰번호<br /><br />
                                &lt;아이핀 인증 시&gt;<br />[필수] 아이핀ID, 비밀번호
                              </td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td>[필수]<br />아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 주소, 생년월일,  재직학교명, 담당학년, 내 교과(중고등), 비상교과서 채택여부,
                                본인인증 CI, EPKI인증서DN, EPKI인증서SN, 재직증명서, 근로계약서</td>
                              <td rowSpan="5" className="textC">회원 탈퇴 시 파기<br />(다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며
                                불&middot;편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.)</td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">SNS 간편 가입<br />및 관리</td>
                              <td>가입여부 확인</td>
                              <td>
                                [필수]<br />
                                - 네이버 : 이메일, 휴대전화번호<br />
                                - 카카오 : 이메일, 휴대전화번호
                                - 카카오 : 이메일
                                - 카카오 : 이메일
                              </td>
                            </tr>
                            <tr>
                              <td>
                                홈페이지 가입 및<br />이용, 본인 확인 및 회원제 서비스 제공<br />등
                              </td>
                              <td>[필수]<br />아이디, 성명, 이메일 휴대전화번호, 주소, 생년월일, 재직학교명, 담당학년, 내 교과<br />(중고등), 비상교과서 채택여부,
                                EPKI인증서DN, EPKI인증서SN</td>
                            </tr>
                            <tr>
                              <td rowSpan="2" className="textC">교사맞춤 서비스<br />제공</td>
                              <td>수업 및 평가 자료 메일링 서비스</td>
                              <td>[필수]<br />아이디, 성명, 이메일, 재직학교명, 내 교과, 담당학년</td>
                            </tr>
                            <tr>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td>[필수]<br />아이디, 성명</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>▶ 이용자 동의 후 추가로 수집하는 정보
                          <p>개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스 이용자에 한해 추가 개인정보 수집이 발생할 수 있습니다. 개인정보 수집 시 이용자에게 수집하는
                            개인정보의 항목, 이용목적, 보관기간을 안내하고 동의를 받으며, 동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용을
                            함께 안내합니다.</p>
                          <table summary="이용자 동의 후 추가로 수집하는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>목적</th>
                              <th>수집항목</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>교사참여 오프라인 행사참여 안내</td>
                              <td>[필수] 성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td>[필수] 성명, 휴대전화번호, 주소, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>V매거진 정기구독</td>
                              <td>[필수] 아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>▶ 서비스 이용 과정에서 생성되는 정보
                          <table summary="서비스 이용 과정에서 생성되는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'30%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>수집하는 개인정보 항목</th>
                              <th>보유 기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>본인확인</td>
                              <td>본인인증 CI</td>
                              <td rowSpan="2">회원 탈퇴 시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료 시 또는 로그아웃 시 만료(단, 아이디 저장 선택 시
                                30일간 보관)</td>
                            </tr>
                            <tr>
                              <td>서비스 이용 통계 등</td>
                              <td>IP Address, 쿠키, 방문 일시, 서비스 이용기록<br />※ 모바일 서비스 이용 시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>④ 쿠키를 설치, 운영하는 이용자의 거부권
                      <ul className="list_hyp">
                        <li>- 쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터에 저장됩니다.</li>
                        <li>- 쿠키의 사용 목적
                          <ul className="mt0">
                            <li>ㆍ이용자가 다시 웹사이트 방문 시 이용자가 설정한 서비스 이용 환경을 유지하여 보다 편리한 인터넷 서비스 이용 제공</li>
                            <li>ㆍ방문 서비스 정보, 접속 시간 및 빈도, 이용 과정 시 생성 또는 입력 정보를 분석하여 이용자 취향과 관심에 특화된 서비스 및 광고 제공</li>
                          </ul>
                        </li>
                        <li>- 이용자는 쿠키 제공에 대한 선택권을 가지고 있으며, 웹 브라우저에서 옵션 설정을 통해 쿠키 허용 / 쿠키 저장 시 확인 / 모든 쿠키 저장 거부를 선택할 수
                          있습니다.
                          <ul className="mt0">
                            <li>ㆍInternet Explorer : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷 옵션 &gt; 개인정보 &gt; 설정</li>
                            <li>ㆍChrome : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의 콘텐츠 설정 버튼 &gt; 쿠키</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a2">2. 수집한 개인정보 이용</div>
                <div className="terms_desc">
                  <p>비바샘은 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전에 동의를 받는 등
                    필요한 조치를 이행할 예정입니다.</p>
                  <table summary="수집한 개인정보 구분, 이용 목적 테이블">
                    <colgroup>
                      <col style={{'width':'30%'}} />
                      <col style={{'width':'auto'}} />
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용 목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지, 회원에 대한
                        고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등
                      </td>
                    </tr>
                    <tr>
                      <td>교사 맞춤 서비스 제공</td>
                      <td>수업 및 평가 자료 메일링 서비스, 교사참여 오프라인 행사 안내, 경품 및 기프티콘 발송, V매거진 정기구독, 무료 전자도서관 서비스 이용 등</td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보, 접속 빈도 파악 또는 회원의
                        서비스 이용에 대한 통계
                      </td>
                    </tr>
                    <tr>
                      <td>통합 회원 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div className="terms_tit" id="a3">3. 개인정보의 제공 및 위탁</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보의 제3자 제공
                      <ul className="list_hyp">
                        <li>- 비바샘은 원칙적으로 이용자의 개인정보를 ‘2.수집한 개인정보의 이용’내에서 명시한 범위 내에서만 처리하며, 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지
                          않습니다.
                        </li>
                        <li>- 더 나은 서비스 제공을 위하여 개인정보를 제3자에게 제공하거나 공유하게 되는 경우에는 제공받는 자, 제공하는 개인정보 항목, 제공받는 자의 개인정보 이용목적,
                          제공받는 자의 보유․이용기간을 명시하고 사전에 동의를 구하는 절차를 거치도록 하며, 동의하지 않는 경우에는 제3자에게 제공 및 공유하지 않습니다.
                        </li>
                        <li>- 단, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에는 개인정보를 제3자에게 제공합니다.</li>
                        <li>- 비바샘은 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.
                          <table summary="개인정보 제3자에게 제공 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'25%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'25s%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>개인정보<br />제공받는자</th>
                              <th>제공받는자의<br />개인정보<br />이용목적</th>
                              <th>제공하는<br />개인정보<br />항목</th>
                              <th>제공받는자의<br />보유<br />이용기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan="2" className="textC">(주)비상교육 티스쿨</td>
                              <td>
                                <ul className="list_hyp">
                                  <li>- 제휴사 웹사이트 로그인</li>
                                  <li>- 제휴사 서비스 제공</li>
                                  <li>- 교사 혜택 제공</li>
                                  <li>- 제휴사가 제공하는 홍보 정보 전송</li>
                                </ul>
                              </td>
                              <td>[필수]<br />아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호, 개인정보 유효기간, 본인 인증 CI</td>
                              <td>회원 탈퇴 혹은 제휴사 정보 제공 동의 철회 시까지</td>
                            </tr>
                            <tr>
                              <td>제휴사측에서 이벤트, 홍보용 안내 (SMS, 이메일, 전화)</td>
                              <td>[선택]<br />아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호</td>
                              <td>회원 탈퇴 혹은 제3자 마케팅 활용 동의 철회 시까지</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보처리의 위탁
                      <p>비바샘은 이용자에게 더 나은 서비스를 제공하기 위하여 다음과 같은 업무를 위탁하고 있습니다.</p>
                      <table summary="개인정보처리 위탁 정보 테이블">
                        <colgroup>
                          <col style={{'width':'33%'}} />
                          <col style={{'width':'33%'}} />
                          <col style={{'width':'auto'}} />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁 업체</th>
                          <th>위탁업무 내용</th>
                          <th>개인정보의 보유 및<br />이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td className="textC">Nice 평가정보</td>
                          <td className="textC">본인확인 인증</td>
                          <td rowSpan="5" className="textC">회원 탈퇴 시 혹은 위탁계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)북큐브네트웍스</td>
                          <td className="textC">무료 전자도서관 서비스 이용</td>
                        </tr>
                        <tr>
                          <td className="textC">(주)다우기술</td>
                          <td className="textC">이벤트 기프티콘 경품 발송</td>
                        </tr>
                        <tr>
                          <td className="textC">롯데글로벌로지스㈜</td>
                          <td className="textC">이벤트 경품 배송</td>
                        </tr>
                        <tr>
                          <td className="textC">오케이커뮤니케이션즈</td>
                          <td className="textC">SMS 문자 내 수신거부 080 호스팅 제공</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a4">4. 개인정보의 파기</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보의 파기
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보 수집/이용 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 법령에서 정보 보관 의무를 부과하는 경우와 이용자에게
                          보관기간에 대해 별도 동의를 얻은 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.
                        </li>
                        <li>- 다음 관계법령에 의해 보관해야 하는 정보는 법령에 명시된 기간 동안 보관 후 파기합니다.
                          <table summary="관계법령에 의해 보관해야 하는 정보 테이블">
                            <colgroup>
                              <col style={{'width':'20%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'20%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>관계법령</th>
                              <th>보존항목</th>
                              <th>보존기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>통신비밀보호법</td>
                              <td>인터넷 로그기록자료, 접속지 추적자료</td>
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td>정보통신망법 제50조</td>
                              <td>e메일, 문자와 관련된 개인정보<br />※탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.
                              </td>
                              <td className="textC">1년</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>② 개인정보 유효기간제
                      <ul className="list_hyp">
                        <li>- 비바샘은 장기간 서비스 미 이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의
                          개인정보를 별도의 DB에 분리보관하고 있습니다.
                        </li>
                        <li>- 미 이용의 기간은 로그인, 상담원 접촉일자 등으로 산정합니다.</li>
                        <li>- 비바샘은 미 이용자 개인정보 분리/저장시점 도래 30일 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>③ 개인정보 파기 절차 및 방법
                      <ul className="list_hyp">
                        <li>- 종이에 출력된 정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>- 전자적 파일형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a5">5. 개인정보 전담조직 운영</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 개인정보 보호책임자 및 담당부서
                      <ul className="list_hyp">
                        <li>
                          - 비바샘은 이용자의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 궁금증 해결, 불만처리를 위해 개인정보 보호책임자와 담당부서를 지정하여 운영하고 있습니다.
                          <table summary="개인정보 보호책임자 및 담당부서 정보 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <tbody>
                            <tr>
                              <th rowSpan="2">개인정보보호책임자 (CPO)</th>
                              <td>소속 : 경영지원 Core</td>
                            </tr>
                            <tr>
                              <td>이름 : 이우상</td>
                            </tr>
                            <tr>
                              <th>개인정보 담당부서</th>
                              <td>정보보안 Cell</td>
                            </tr>
                            <tr>
                              <th rowSpan="2">문의</th>
                              <td>전화 : 1544-0554</td>
                            </tr>
                            <tr>
                              <td>이메일 : <a href="mailto:privacy@visang.com" target="_blank">privacy@visang.com</a></td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 이용자는 비바샘 서비스를 이용하면서 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 하실 수
                          있습니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 권익침해 구제방법
                      <ul className="list_hyp">
                        <li>- 개인정보 침해에 대한 피해구제, 신고, 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움 받으실 수 있습니다.</li>
                        <li>- 아래 기관은 비바샘과는 별개의 기관입니다.
                          <table summary="권익침해 구제방법 기관 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                              <col style={{'width':'30%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>홈페이지</th>
                              <th>전화</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 침해신고센터<br />(한국인터넷진흥원 운영)</td>
                              <td><a href="http://privacy.kisa.or.kr" target="_blank">privacy.kisa.or.kr</a></td>
                              <td>(국번없이) 118</td>
                            </tr>
                            <tr>
                              <td>개인정보 분쟁조정위원회</td>
                              <td><a href="http://www.kopico.go.kr" target="_blank">www.kopico.go.kr</a></td>
                              <td>(국번없이) 1833-6972</td>
                            </tr>
                            <tr>
                              <td>대검찰청 사이버범죄수사단</td>
                              <td><a href="http://www.spo.go.kr" target="_blank">www.spo.go.kr</a></td>
                              <td>(국번없이) 1301</td>
                            </tr>
                            <tr>
                              <td>경찰청 사이버안전국</td>
                              <td><a href="http://cyberbureau.police.go.kr" target="_blank">cyberbureau.police.go.kr</a>
                              </td>
                              <td>(국번없이) 182</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a6">6. 이용자&middot;법정대리인의 권리행사방법 및 의무</div>
                <div className="terms_desc">
                  <ul className="list_num">
                    <li>① 권리행사방법
                      <ul className="list_hyp">
                        <li>- 이용자는 비바샘에 대해 언제든지 다음 방법으로 개인정보 보호 관련 권리를 행사할 수 있습니다.
                          <table summary="개인정보 보호 관련 권리 구분, 요청방법 테이블">
                            <colgroup>
                              <col style={{'width':'30%'}} />
                              <col style={{'width':'auto'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>요청 방법</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td>개인정보 열람, 정정, 삭제, 처리정정 등의 요구</td>
                              <td>‘5. 개인정보 전담조직 운영‘ 내에서 안내된 부서에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 문의</td>
                            </tr>
                            <tr>
                              <td>개인정보 조회/수정</td>
                              <td>『회원정보변경』메뉴</td>
                            </tr>
                            <tr>
                              <td>동의 철회</td>
                              <td>제3자 마케팅 동의 등 철회 방법 안내</td>
                            </tr>
                            <tr>
                              <td>회원 탈퇴</td>
                              <td>『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>- 개인정보의 정확성을 위해 이용자의 개인정보 정정/삭제 요구가 있을 경우 해당 요구사항 처리 완료 시까지 당해 개인정보를 이용하거나 제공하지 않습니다. 단, 잘못된
                          개인정보를 이미 제3자에게 제공한 경우 제공받은 자에게 지체 없이 사실을 알려 수정될 수 있도록 하겠습니다.
                        </li>
                        <li>- 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른
                          위임장을 제출하셔야 합니다.
                        </li>
                        <li>- 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제5항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.</li>
                        <li>- 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
                        <li>- 비바샘은 이용자 권리에 따른 열람의 요구, 정정&middot;삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를
                          확인합니다.
                        </li>
                      </ul>
                    </li>
                    <li>② 이용자의 의무
                      <ul className="list_hyp">
                        <li>- 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을 침해하여서는 아니 됩니다.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a7">7. 개인정보의 안전성 확보조치</div>
                <div className="terms_desc">
                  비바샘은 이용자의 개인정보를 소중히 여기며, 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
                  <ul className="list_num">
                    <li>
                      ① 내부관리계획의 수립
                      <p>개인정보의 안전한 처리를 위한 기준으로 내부관리계획을 수립 및 시행하고 있습니다.</p>
                    </li>
                    <li>
                      ② 개인정보 취급자 최소화
                      <p>개인정보를 처리하는 직원을 최소화 하며, 해당 직원들의 PC는 외부 인터넷망과 내부망을 분리하여 개인정보 유출 가능성을 줄이고 있습니다. 또한 개인정보를 처리하는
                        데이터베이스와 개인정보처리시스템에 대한 접근 통제 기준을 체계적으로 마련하고 지속적인 감사를 시행하고 있습니다.</p>
                    </li>
                    <li>
                      ③ 정기 교육
                      <p>개인정보 취급자들을 대상으로 정기 교육을 실시하고, 전사 직원을 대상으로 개인정보 이슈 사항을 전파하여 개인정보의 중요성을 강조하고 있습니다.</p>
                    </li>
                    <li>
                      ④ 해킹이나 바이러스로부터 보호
                      <p>시스템은 외부로부터 접근이 통제된 구역에 설치하여 개인정보의 유출이나 훼손으로부터 보호합니다. 또한, 개인정보 훼손에 대비하여 정기적 백업을 수행하고 백신프로그램을
                        이용하여 자료의 유출 및 손상을 방지하고 있습니다.</p>
                    </li>
                    <li>
                      ⑤ 개인정보의 암호화
                      <p>이용자의 개인정보 전송 시 암호화된 통신구간을 이용하고, 비밀번호 등 중요정보는 안전한 암호화 알고리즘을 사용하여 암호화 합니다.</p>
                    </li>
                    <li>
                      ⑥ 물리적 통제
                      <p>개인정보 처리와 관련된 시스템들은 통제구역에 위치하며, 출입을 통제합니다. 또한 개인정보가 포함된 서류, 보조저장매체는 잠금 장치가 있는 안전한 장소에 보관합니다.</p>
                    </li>
                  </ul>
                </div>
                <div className="terms_tit" id="a8">8. 고지 의무</div>
                <div className="terms_desc">
                  <ul className="list_hyp">
                    <li>- 이 개인정보 처리방침은 2019. 12. 30부터 적용됩니다.</li>
                    <li>- 개인정보 처리방침 내용에 대한 추가, 삭제 및 수정사항이 있을 경우에는 시행일 최소 7일전에 공지사항 등을 통해 안내 드리겠습니다. 이용자의 권리 또는 의무에 중요한
                      내용이 변경될 경우에는 최소 30일 전에 안내 드리겠습니다.
                    </li>
                    <li>- 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="privacy_ver9 hide">
			  <p className="mb25">비바샘은 이용자의 개인 정보를 소중하게 생각하고, 이용자의 개인정보를 보호하기 위하여 항상 최선을 다하고 있습니다.<br/>
                비바샘은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 정보통신서비스 제공자가 준수하여야 할 관련 법령상의 개인정보 보호규정을 지키며, 관련 법령에 따른 개인정보 처리방침을 정하여 이를 비바샘 홈페이지에 공개하여 이용자가 언제나 용이하게 열람할 수 있도록 하고 있습니다. 비바샘은 정부의 법률 및 지침 변경 등에 따라 수시로 개인정보 처리방침을 변경 할 수 있고, 이에 따른 개인정보 처리방침의 지속적인 개선을 위하여 필요한 절차를 정하고 있습니다.<br/>
                그리고 개인정보 처리방침을 개정하거나 변경할 때에는 홈페이지 첫 페이지에 해당 내용을 알리고 있습니다. 이용자들께서는 사이트 방문시 수시로 확인하시기 바랍니다.<br/><br/>
                비바샘의 「개인정보 처리방침」은 아래와 같은 내용을 담고 있습니다.</p>
              <dl>
                <dt id="a1">1. 개인정보 수집 및 이용목적</dt>
				<dd>
                  <p className="padT">비바샘은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <table>
                    <colgroup>
                      <col style={{'width': '15%'}} />
                      <col />
                    </colgroup>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>이용목적</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>회원 관리</td>
                      <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지, 회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                    </tr>
                    <tr>
                      <td>서비스 제공<br/>(교사 맞춤 서비스)</td>
                      <td>무료 전자도서관 서비스 이용, 교사참여 오프라인 행사 안내, 수업 및 평가 자료 메일링 서비스, 경품 및 기프티콘 발송, V매거진 정기구독 등</td>
                    </tr>
                    <tr>
                      <td>마케팅 및 광고</td>
                      <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                    </tr>
                    <tr>
                      <td>통합 아이디 서비스 제공</td>
                      <td>비상교육 선생님 통합회원 및 ONE ID를 통한 SSO 구현, 통합회원 혜택 제공</td>
                    </tr>
                    </tbody>
                  </table>
                </dd>
                <dt>2. 개인정보 수집 항목 및 방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공을 위한 필수 정보만을 수집하고 있으며 이용자 각각의 기호와 필요에 맞는 서비스를 제공하기 위하여 정보 수집 때 별도 동의를 얻고 있습니다. 선택 정보를 입력하지 않아도 서비스 이용에 제한은 없습니다.</li>
                    <li>나. 비바샘은 이용자의 기본적 인권을 침해할 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 미리 밝힌 목적 이외의 다른 목적으로는 사용하지 않으며 외부로 유출하지 않습니다.</li>
                    <li>다. 비바샘은 다음과 같이 개인정보를 수집하여 이용합니다.
                      <ul>
                        <li>1) 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                          <table>
                            <colgroup>
                              <col style={{'width': '13%'}} />
                              <col style={{'width': '20%'}} />
                              <col style={{'width': '20%'}} />
                              <col />
                              <col style={{'width': '28%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th colSpan={2}>목적</th>
                              <th>항목</th>
                              <th>보유기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan={7} className="textC">필수</td>
                              <td rowSpan={2}>회원 관리</td>
                              <td>본인확인 (식별) 등</td>
                              <td className="em">휴대전화 인증 : 성명, 생년월일, 성별, 통신사구분, 본인인증 CI, 휴대폰번호</td>
                              <td rowSpan={8}>회원 탈퇴 후 파기됩니다.<br/>다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불,편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.</td>
                            </tr>
                            <tr>
                              <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                              <td className="em">아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 비상교과서 채택여부,<br/>아이핀CI, EPKI인증서DN, EPKI인증서SN,
                                생년월일, 성별, 학교급,<br/>재직학교명, 담당학년</td>
                            </tr>
                            <tr>
                              <td rowSpan={5}>서비스 제공<br />(교사 맞춤 서비스)</td>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td className="em">아이디, 성명</td>
                            </tr>
                            <tr>
                              <td>교사참여 오프라인 행사<br />참여 안내</td>
                              <td className="em">성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>수업 및 평가 자료 메일링 서비스</td>
                              <td className="em">아이디, 성명, 이메일, 학교급, 재직학교명, 내 교과, 담당학년</td>
                            </tr>
                            <tr>
                              <td>경품 및 기프티콘 발송</td>
                              <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                            </tr>
                            <tr>
                              <td>V매거진 정기구독</td>
                              <td className="em">아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                            </tr>
                            <tr>
                              <td className="textC">선택</td>
                              <td>마케팅 및 광고</td>
                              <td>신규 서비스 및 이벤트 홍보</td>
                              <td className="em">아이디, 성명, 이메일, 휴대전화번호</td>
                            </tr>
                            </tbody>
                          </table>
                          <p className="comment">※ 비바샘은 이 외에 이용자가 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                        </li>
                        <li>2) 서비스 이용과정에서 생성되는 정보
                          <table>
                            <colgroup>
                              <col style={{'width': '13%'}} />
                              <col style={{'width': '15%'}} />
                              <col />
                              <col style={{'width': '32%'}} />
                            </colgroup>
                            <thead>
                            <tr>
                              <th>구분</th>
                              <th>이용목적</th>
                              <th>수집항목</th>
                              <th>보유기간</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                              <td rowSpan={2} className="textC">필수</td>
                              <td>본인확인</td>
                              <td className="em">본인확인값(CI)</td>
                              <td rowSpan={7}>회원 탈퇴시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료(단, 아이디 저장 선택 시 30일간 보관)</td>
                            </tr>
                            <tr>
                              <td>서비스 이용 통계 등</td>
                              <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br />※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>3) 기타 법정 의무 수집 정보 등
                          <table>
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
                              <td className="textC">3개월</td>
                            </tr>
                            <tr>
                              <td rowSpan={3}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                              <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                              <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                              <td className="textC">3년</td>
                            </tr>
                            <tr>
                              <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                              <td rowSpan={2} className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                              <td rowSpan={2} className="textC">5년</td>
                            </tr>
                            <tr>
                              <td>계약 또는 청약철회 등에 관한 기록</td>
                            </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>라. 개인정보 수집방법
                      <ul className="list_hyp">
                        <li>- 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청</li>
                        <li>- 로그 분석 프로그램을 통한 생성정보수집</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt>3. 쿠키에 의한 개인정보 수집</dt>
                <dd>
                  <ul>
                    <li>가. 쿠키란?
                      <p>비바샘은 이용자에 대한 정보를 저장하고 수시로 찾아내는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트가 이용자의 컴퓨터 브라우저(인터넷 익스플로러 등)에 전송하는 소량의 정보입니다.</p>
                    </li>
                    <li>나. 비바샘의 쿠키 사용 목적
                      <p>비바샘은 다음과 같은 목적을 위해 쿠키를 통하여 수집된 이용자의 개인정보를 사용합니다.</p>
                      <ul className="list_hyp">
                        <li>- 개인의 관심 분야에 따라 차별화된 정보를 제공</li>
                        <li>- 접속빈도 또는 방문시간 등을 분석하고 이용자의 관심분야를 파악하여 타겟(target) 마케팅 및 서비스 개선의 척도로 활용</li>
                        <li>- 품목들에 대한 정보와 관심있게 둘러본 품목을 추적하여 개인 맞춤 서비스 제공</li>
                      </ul>
                    </li>
                    <li>다. 쿠키 설정 / 운용 및 거부
                      <p>이용자는 쿠키 운용에 대한 선택권을 가지고 있습니다. 웹브라우저에 설정을 통해 모든 쿠키를 허용/거부하거나, 쿠키를 저장될 때마다 확인을 거치도록 할 수 있습니다. 쿠키 설정거부 방법은 다음과 같습니다.<br/>(Internet Explorer 기준) 웹브라우저 [도구] 메뉴 [인터넷 옵션] 선택 &gt; [개인정보] 탭을 선택 &gt; [고급]에서 원하는 옵션 선택</p>
                    </li>
                  </ul>
                </dd>
                <dt>4. 개인정보의 보유·이용기간 및 파기</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자의 개인정보를 고지 및 동의 받은 기간 동안 보유 및 이용합니다. 개인정보의 수집 및 이용목적 달성, 보유기간 만료, 회원의 수집 및 이용 동의 철회 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련법령의 규정에 의하여 다음과 같이 거래 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할 필요가 있을 경우에는 그 기간 동안 보유합니다.
                      <ul>
                        <li>1) 전자상거래 등에서의 소비자보호에 관한 법률 제6조
                          <ul className="list_hyp">
                            <li>- 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                            <li>- 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                            <li>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                          </ul>
                        </li>
                        <li>2) 통신비밀보호법
                          <ul className="list_hyp">
                            <li>- 인터넷 로그기록자료, 접속지 추적자료 : 3개월</li>
                          </ul>
                        </li>
                        <li>3) 기타 관련 법령 등<br />
                          <p className="comment type02">※ 그 외 정보통신망법 제50조(영리목적의 광고성 정보 전송 제한) 준수 이력을 증빙하기 위하여 e메일, 문자와 관련된 개인정보를 1년간 보관할 수 있습니다. 이 경우 탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</p>
                        </li>
                      </ul>
                    </li>
                    <li>나. 정보 파기방법은 아래와 같습니다.
                      <ul>
                        <li>1) 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>2) 전자적 파일형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                    <li>다. 개인정보 유효기간 제도
                      <ul>
                        <li>1) 비바샘 장기간 서비스 미이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의 개인정보를 다른 이용자의 정보와 분리하여 저장, 관리합니다.</li>
                        <li>2) 미이용의 기간은 로그인, 상담원 접촉일자 등으로 산정하며 법령에서 정의한 기간 동안 서비스 미이용자에 대하여 분리, 저장관리합니다.</li>
                        <li>3) 비바샘은 미이용자 개인정보 분리/저장시점 도래 1개월 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>라. 회원에서 탈퇴한 후 회원 재가입, 임의해지 등을 반복적으로 행하여 할인쿠폰, 이벤트 혜택 등으로 경제상의 이익을 취하거나 이 과정에서 명의를 무단으로 사용하는 편법과 불법행위를 하는 회원을 차단 하고자 비바샘의 홈페이지 회원 탈퇴 후 6개월 동안 회원의 이름, 아이디(ID), 로그기록, 접속아이피(IP) 등을 보관합니다.</li>
                  </ul>
                </dd>
                <dt>5. 수집한 개인정보의 이용 및 제3자 제공</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자의 개인정보를 가입신청서, 이용약관, 「개인정보 처리방침」의 「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 처리하며, 이용자의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</li>
                    <li>나. 비바샘은 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.
                      <table>
                        <colgroup>
                          <col style={{'width': '12%'}} />
                          <col style={{'width': '32%'}} />
                          <col style={{'width': '28%'}} />
                          <col style={{'width': '28%'}} />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>제공받는 자</th>
                          <th>제공 목적</th>
                          <th>제공 항목</th>
                          <th>보유 및 이용 기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td rowSpan={2} className="textC">(주)티스쿨이앤씨</td>
                          <td>
                            - 제휴사 웹사이트 로그인<br/>
                            - 제휴사 서비스 제공<br/>
                            - 교사 혜택 제공<br/>
                            - 제휴사가 제공하는 홍보 정보 전송
                          </td>
                          <td>필수 : 아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호,개인정보 유효기간, 본인 확인 결과값 (CI)</td>
                          <td>회원 탈퇴 혹은 제휴사 정보 제공 동의 철회 시까지</td>
                        </tr>
                        <tr>
                          <td>제휴사측에서 이벤트, 홍보용 안내 (SMS, 이메일, 전화)</td>
                          <td>선택 : 아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호</td>
                          <td>회원 탈퇴 혹은 제3자 마케팅 활용 동의 철회 시까지</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt>6. 이용자의 권리·의무 및 행사방법</dt>
                <dd>
                  <ul>
                    <li>가. 이용자는 비바샘에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                      <ul>
                        <li>1) 개인정보 열람요구</li>
                        <li>2) 오류 등이 있을 경우 정정 요구</li>
                        <li>3) 삭제요구</li>
                        <li>4) 처리정지 요구</li>
                      </ul>
                    </li>
                    <li>나. 이용자 개인정보의 열람 및 정정은 『회원정보변경』메뉴를 통해 할 수 있으며, 동의 철회는 『회원정보변경』에서 “회원정보수정 내 회원탈퇴”를 통해 가능합니다. 그 외 이용자의 권리 행사는 비바샘의 개인정보보호책임자 또는 담당자에게 서면이나 전화 또는 이메일(E-mail)을 통하여 하실 수 있으며 비바샘은 이에 대해 지체없이 조치하겠습니다.</li>
                    <li>다. 이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 비바샘은 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않으며, 개인정보의 수집에 대한 동의철회(회원탈퇴)를 개인정보를 수집하는 방법보다 쉽게 할 수 있도록 필요한 조치를 취합니다.</li>
                    <li>라. 이용자의 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</li>
                    <li>마. 이용자는 개인정보 보호법 등 관계법령을 위반하여 비바샘이 처리하고 있는 정보주체 본인이나 타인의 개인정보 및 사생활을 침해하여서는 아니됩니다.</li>
                    <li>바. 이용자가 개인정보 오류에 대한 정정 요청 시, 비바샘은 정정 완료 전까지 해당 개인 정보를 이용하거나 제공하지 않습니다. 또한, 잘못된 개인정보를 제3자에게 이미 제공했을 경우 정정 처리 결과를 제3자에게 곧바로 통지하여 정정 조치 합니다.</li>
                  </ul>
                </dd>
                <dt>7. 개인정보 처리 업무의 위탁</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공, 더 나은 서비스 제공, 이용자 편의 제공 등 원활한 업무 수행을 위하여 다음과 같이 개인정보 처리 업무를 외부전문업체에 위탁하여 운영하고 있습니다.
                      <table>
                        <colgroup>
                          <col style={{'width': '20%'}} />
                          <col style={{'width': '25%'}} />
                          <col />
                          <col style={{'width': '22%'}} />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>수탁자</th>
                          <th>개인정보 항목</th>
                          <th>위탁목적</th>
                          <th>보유 및 이용기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td>(주)북큐브네트웍스</td>
                          <td className="em">아이디, 성명</td>
                          <td>무료 전자도서관 서비스 이용</td>
                          <td rowSpan={4}>회원 탈퇴 시<br />또는 법정 의무보유기간</td>
                        </tr>
                        <tr>
                          <td>(주)다우기술</td>
                          <td className="em">휴대전화번호</td>
                          <td>이벤트 기프티콘 경품 발송</td>
                        </tr>
                        <tr>
                          <td>롯데글로벌로지스㈜</td>
                          <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                          <td>이벤트 경품 배송</td>
                        </tr>
                        <tr>
                          <td>오케이커뮤니케이션즈</td>
                          <td className="em">휴대전화번호</td>
                          <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                    <li>나. 비바샘은 위탁업무계약서 등을 통하여 위탁업무 수행목적 외 개인정보 처리 금지, 재위탁 제한, 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 개인정보의 제3자 제공 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 수탁자가 개인정보를 안전하게 처리하는지를 관리하고 있습니다.</li>
                  </ul>
                </dd>
                <dt>8. 개인정보 처리방침의 고지 또는 통지방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자가 동의한 범위를 넘어 이용자의 개인정보를 이용하거나 제3자에게 제공하기 위해 이용자에게서 추가적인 동의를 얻고자 할 때에는 미리 이용자에게 개별적으로 서면, 이메일(E- mail), 전화 등으로 해당사항을 알립니다.</li>
                    <li>나. 타인에게 이용자의 개인정보의 수집·보관·처리·이용·제공·관리·파기 등을 위탁할 때에는 그 사실을 가입화면, 서비스이용약관, 홈페이지의 개인정보 처리방침 등을 통하여 그 사실을 이용자에게 고지하고 알리고 동의를 얻습니다.</li>
                    <li>다. 비바샘은 영업의 전부 또는 일부를 양도하거나 합병·상속 등으로 그 권리와 의무를 이전할 때에는 서면·이메일(E-mail) 등을 통하여 이용자에게 개별적으로 알리는 동시에 해당 사실을 홈페이지 첫 화면에서 식별할 수 있도록 표기하고 30일 이상 그 사실을 공지합니다. 다만, 천재·지변이나 그 밖에 정당한 사유로 홈페이지 게시가 곤란한 경우에는  2곳 이상의 중앙일간지(이용자의 대부분이 특정 지역에 거주할 때에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다)에 1 회 이상 공고하는 것으로 대신합니다.</li>
                  </ul>
                </dd>
                <dt>9. 개인정보보호를 위한 기술 및 관리적 대책</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘에서는 이용자의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고 있습니다.</li>
                    <li>나. 기술적 대책
                      <p>비바샘은 이용자의 개인정보를 처리할 때 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적 대책을 마련하여 개인정보의 안전성을 확보하고 있습니다.</p>
                      <ul className="list_hyp">
                        <li>- 이용자의 개인정보는 비밀번호(Password)로 보호되며 중요한 데이터는 파일 및 전송데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하여 중요한 데이터는 별도의 보안기능으로 보호됩니다.</li>
                        <li>- 비바샘은 백신프로그램을 이용하여 컴퓨터 바이러스의 피해를 방지하는 조치를 하고 있습니다. 백신프로그램은 주기적으로 업데이트되며 바이러스가 갑자기 출현하면 백신이 나오는 즉시 이를 제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.</li>
                        <li>- 비바샘은 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를 채택하고 있습니다.</li>
                        <li>- 해킹 등 외부침입에 대비하여 침입차단시스템과 침입방지시스템 등을 이용하여 보안에 최선을 다하고 있습니다.</li>
                      </ul>
                    </li>
                    <li>다. 관리적 대책
                      <p>비바샘은 이용자의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있으며 이에 해당하는 자는 다음과 같습니다.</p>
                      <ul>
                        <li>1) 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
                        <li>2) 개인정보보호책임자와 담당자 등 개인정보보호업무를 수행하는 자</li>
                        <li>3) 기타 업무상 개인정보의 처리가 불가피한 자</li>
                      </ul>
                      <ul className="list_hyp">
                        <li>- 비바샘은 이용자의 개인정보에 대한 접근과 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고 지키도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육 등을 시행하고 있습니다.</li>
                        <li>- 전산실 등을 통제구역으로 설정하여 출입을 통제하고 있습니다.</li>
                        <li>- 비바샘은 신규로 채용된 직원에게 정보보호서약서 또는 개인정보보호서약서에 서명하게 하여 직원에 의한 정보유출을미리 방지하고 있으며, 개인정보처리방침에 대한 이행사항과 직원의 준수여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있습니다.</li>
                        <li>- 비바샘은 직원 퇴직시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된 개인정보를 훼손·침해 또는 누설하지 않도록 하고 있습니다.</li>
                        <li>- 그 밖에 내부 관리자의 실수나 기술관리 상의 사고로 이용자의 개인정보가 상실ㆍ유출ㆍ변조ㆍ훼손되면 비바샘은 즉각 이용자에게 해당 사실을 알리고 적절한 대책과 보상을 마련할 것입니다.</li>
                      </ul>
                    </li>
                    <li>라. 기타 보호대책
                      <ul>
                        <li>1) 개인정보 유출 등 통지∙신고제도
                          <p>비바샘은 개인정보의 분실, 도난, 유출 사고 발생 사실을 안 때에는 지체없이 이용자에게 해당 내용을 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                        </li>
                        <li>2) 개인정보 이용내역 통지 제도
                          <ul className="list_hyp">
                            <li>- 비바샘은 이용자의 개인정보 자기결정권을 보장하기 위해 개인정보 이용내역을 해당 이용자에게 주기적으로(연 1회이상) 통지합니다.</li>
                            <li>- 통지하는 개인정보 이용내역은 다음과 같습니다.
                              <ul className="list_cir">
                                <li>• 개인정보 수집∙이용목적 및 수집한 개인정보의 항목</li>
                                <li>• 개인정보를 제공받은 자, 그 제공 목적 및 제공한 개인정보의 항목</li>
                                <li>• 개인정보 처리위탁을 받은 자 및 그 처리위탁을 하는 업무의 내용</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt>10. 게시글 관리와 책임</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자의 게시물을 소중하게 생각하며 해당 게시물이 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우에는 그렇지 않습니다.
                      <ul className="list_cir">
                        <li>• 스팸(spam)성 게시물 (예 : 행운의 편지, 특정사이트에 대한 광고, 다른 사이트로의 유도 광고 및 링크 등)</li>
                        <li>• 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글</li>
                        <li>• 동의 없는 타인의 신상공개, 비바샘의 저작권, 혹은 제3자의 지적재산권 등의 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물</li>
                        <li>• 비바샘은 바람직한 게시판 문화를 활성화하기 위하여 타인의 신상을 동의 없이 공개할 때에는 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.</li>
                        <li>• 다른 주제의 게시판으로 이동할 수 있는 내용은 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.</li>
                        <li>• 그 밖의 경우에는 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>나. 근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또한 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고한 후 서비스를 이용해야 합니다.</li>
                  </ul>
                </dd>
                <dt>11. 이용자의 권리와 의무</dt>
                <dd>
                  <ul>
                    <li>가. 이용자의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 부정확한 정보 입력으로 말미암아 발생하는 사고의 책임은 이용자에게 있으며 타인의 정보를 무단으로 사용하는 등 허위정보를 입력하면 회원자격이 상실될 수 있습니다.</li>
                    <li>나. 이용자는 개인정보를 보호받을 권리와 함께 자신을 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 지니고 있습니다. 비밀번호(Password)를 포함한 이용자의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 때에는『정보통신망 이용촉진 및 정보보호 등 에 관한 법률』등에 의해 처벌받을 수 있습니다.</li>
                  </ul>
                </dd>
                <dt>12. 광고성 정보 전송</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 제50조에 의거, 전자우편, 휴대폰문자, 모바일앱, DM, TM 등의 채널로 영리목적의 광고성 정보를 전송할 수 있습니다.</li>
                    <li>나. 비바샘은 문서 또는 구술의 방법으로 이용자에게 명시적으로 수신동의를 받아 광고성 정보를 전송합니다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 사전동의를 받지 않습니다.
                      <ul>
                        <li>1. 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 자가 해당 재화 등의 거래가 종료된 날부터 6개월 이내에 자신이 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우</li>
                        <li>2. 「방문판매 등에 관한 법률」에 따른 전화권유판매자가 육성으로 전화권유를 하는 경우</li>
                      </ul>
                    </li>
                    <li>다. 비바샘은 광고성 정보가 시작되는 부분에 광고를 의미하는 표시를 안내하고, 본문에는 전송자의 명칭 및 연락처, 그리고 수신 거부 또는 수신동의 철회의 의사를 쉽게 표시할 수 있도록 하기 위한 안내문을 명시합니다.</li>
                    <li>라. 비바샘은 이용자가 광고성 정보의 수신거부, 사전 동의를 철회한 경우 영리목적의 광고성 정보를 전송하지 않습니다.</li>
                    <li>마. 비바샘은 법률에서 금지하는 재화 또는 서비스에 대한 광고성 정보를 전송하지 않습니다.</li>
                  </ul>
                </dd>
                <dt>13. 의견수렴 및 불만 처리</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자의 의견을 매우 소중하게 생각하며, 이용자는 의문사항으로부터 언제나 성실한 답변을 받을 권리가 있습니다.</li>
                    <li>나. 비바샘은 이용자와의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있습니다. 문의사항이 있으면 아래의 연락처로 문의하시기 바랍니다.
                      <p><strong>• 고객센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 연락처: 1544-7714</li>
                        <li>- 담당자 메일: vivasam@visang.com</li>
                        <li>- https://www.vivasam.com/eMail/20190718t/센터 운영시간: 평일 09:00~18:00 / 점심시간 12:30~13:30</li>
                      </ul>
                    </li>
                    <li>다. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청 사이버안전국 등으로 문의하실 수 있습니다.
                      <p><strong>• 대검찰청 사이버 범죄수사단</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 1301</li>
                        <li>- URL: http://spo.go.kr</li>
                      </ul>
                      <p><strong>• 경찰청 사이버안전국</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 182</li>
                        <li>- URL: http://cyberbureau.police.go.kr/index.do</li>
                      </ul>
                      <p><strong>• 개인정보침해신고센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 118</li>
                        <li>- URL: http://privacy.kisa.or.kr</li>
                      </ul>
                      <p><strong>• 개인정보분쟁조정위원회</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: 02-1833-6972</li>
                        <li>- URL: http://kopico.go.kr</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt>14. 개인정보보호책임자 및 담당자</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 이용자의 개인정보보호를 매우 소중하게 생각하며, 이용자의 개인정보가 훼손, 침해, 누설되지 않도록 최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의 위험성 때문에 예기치 못한 사고가 발생하여 정보가 훼손되거나 방문자가 작성한 게시물에 의해 각종 분쟁이 발생하는 것에 대해서는 책임을 지지 않습니다.</li>
                    <li>나. 비바샘의 고객센터에서는 이용자의 개인정보보호 관련 문의에 신속하고 성실하게 답변을 드리도록 하고 있습니다.
                      <p>비바샘의 개인정보보호 담당자와 연락하기를 원하시면 아래의 연락처나 이메일로 문의해 주시기 바랍니다. 개인정보 관련 문의사항에 대해 신속하고 성실하게 답변해 드리겠습니다.</p>
                      <table>
                        <colgroup>
                          <col />
                          <col style={{'width': '40%'}} />
                          <col style={{'width': '40%'}} />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>구분</th>
                          <th>개인정보보호책임자</th>
                          <th>개인정보보호담당자</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <th>이름</th>
                          <td className="textC em">이우상 CP</td>
                          <td className="textC em">이정우 CP</td>
                        </tr>
                        <tr>
                          <th>부서</th>
                          <td className="textC em">경영지원 Core</td>
                          <td className="textC em">IT전략 Cell</td>
                        </tr>
                        <tr>
                          <th>전화번호</th>
                          <td className="textC em">1544-7714</td>
                          <td className="textC em">1544-7714</td>
                        </tr>
                        <tr>
                          <th>e-mail</th>
                          <td className="textC em">privacy@visang.com</td>
                          <td className="textC em">privacy@visang.com</td>
                        </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt>15. 고지 의무</dt>
                <dd>
                  <p className="padT"><strong>현 개인정보 처리방침은 2018년 8월 31일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 필요하면 일반적 내용은 개정 최소 7일 전부터, 중요한 내용은 개정 최소 30일 전부터 홈페이지의 '공지'란을 통해 알릴 것입니다.</strong></p>
                  <ul className="lightFont listtopPad">
                    <li>- 개인정보 처리방침 공고일자 : 2019년 7월 19일</li>
                    <li>- 개인정보 처리방침 시행일자 : 2019년 8월 31일</li>
                  </ul>
                </dd>
              </dl>
            </div>
            <div className="privacy_ver8 hide">
              <dl>
                <dt>1. 개인정보 수집 및 이용목적</dt>
                <dd>
                  <table>
                    <colgroup>
                      <col style={{'width': '15%'}} />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>구분</th>
                        <th>이용목적</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>회원 관리</td>
                        <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지,<br />회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                      </tr>
                      <tr>
                        <td>서비스 제공<br />(교사 맞춤 서비스)</td>
                        <td>무료 전자도서관 서비스 이용, 교사참여 오프라인 행사 안내, 수업 및 평가 자료 메일링 서비스, 경품 및 기프티콘 발송, V매거진 정기구독 등</td>
                      </tr>
                      <tr>
                        <td>마케팅 및 광고</td>
                        <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보,<br />접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                      </tr>
                    </tbody>
                  </table>
                </dd>
                <dt id="a2">2. 개인정보 수집 항목 및 방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공을 위한 필수 정보만을 수집하고 있으며 고객 각각의 기호와 필요에 맞는 서비스를 제공하기 위하여 정보 수집 때 별도 동의를 얻고 있습니다.<br />선택 정보를 입력하지 않아도 서비스 이용에 제한은 없습니다.</li>
                    <li>나. 비바샘은 이용자의 기본적 인권을 침해할 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 미리 밝힌 목적 이외의 다른 목적으로는 사용하지 않으며 외부로 유출하지 않습니다.</li>
                    <li>다. 비바샘은 다음과 같이 개인정보를 수집하여 이용합니다.
                      <ul>
                        <li>1) 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                          <table>
                            <colgroup>
                              <col style={{'width': '20%'}} />
                              <col style={{'width': '20%'}} />
                              <col />
                              <col style={{'width': '28%'}} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th colSpan={2}>목적</th>
                                <th>항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>회원 관리</td>
                                <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                                <td className="em">아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 비상교과서 채택여부,<br />아이핀CI, EPKI인증서DN, EPKI인증서SN, 생년월일, 성별, 학교급,<br />재직학교명, 담당학년</td>
                                <td rowSpan={7}>회원 탈퇴 후 파기됩니다.<br />다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불,편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.</td>
                              </tr>
                              <tr>
                                <td rowSpan={5}>서비스 제공<br />(교사 맞춤 서비스)</td>
                                <td>무료 전자도서관 서비스 이용</td>
                                <td className="em">아이디, 성명</td>
                              </tr>
                              <tr>
                                <td>교사참여 오프라인 행사<br />참여 안내</td>
                                <td className="em">성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>수업 및 평가 자료 메일링 서비스</td>
                                <td className="em">아이디, 성명, 이메일, 학교급, 재직학교명, 내 교과, 담당학년</td>
                              </tr>
                              <tr>
                                <td>경품 및 기프티콘 발송</td>
                                <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>V매거진 정기구독</td>
                                <td className="em">아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                              </tr>
                              <tr>
                                <td>마케팅 및 광고</td>
                                <td>신규 서비스 및 이벤트 홍보</td>
                                <td className="em">아이디, 성명, 이메일, 휴대전화번호</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="comment">※ 비바샘은 이 외에 고객님이 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                        </li>
                        <li>2) 서비스 이용과정에서 생성되는 정보
                          <table>
                            <colgroup>
                              <col style={{'width': '13%'}} />
                              <col style={{'width': '15%'}} />
                              <col />
                              <col style={{'width': '32%'}} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>구분</th>
                                <th>이용목적</th>
                                <th>수집항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td rowSpan={2} className="textC">필수</td>
                                <td>본인확인</td>
                                <td className="em">본인확인값(CI)</td>
                                <td rowSpan={7}>회원 탈퇴시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료</td>
                              </tr>
                              <tr>
                                <td>서비스 이용 통계 등</td>
                                <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br />※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>3) 기타 법정 의무 수집 정보 등
                          <table>                            
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
                                <td className="textC">3개월</td>
                              </tr>
                              <tr>
                                <td rowSpan={3}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                                <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                                <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                                <td className="textC">3년</td>
                              </tr>
                              <tr>
                                <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                                <td rowSpan={2} className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                                <td rowSpan={2} className="textC">5년</td>
                              </tr>
                              <tr>
                                <td>계약 또는 청약철회 등에 관한 기록</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>라. 개인정보 수집방법
                      <ul className="list_hyp">
                        <li>- 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청</li>
                        <li>- 로그 분석 프로그램을 통한 생성정보수집</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a3">3. 쿠키에 의한 개인정보 수집</dt>
                <dd>
                  <ul>
                    <li>가. 쿠키란?
                      <p>비바샘은 고객에 대한 정보를 저장하고 수시로 찾아내는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트가 고객의 컴퓨터 브라우저(인터넷 익스플로러 등)에 전송하는 소량의 정보입니다.</p>
                    </li>
                    <li>나. 비바샘의 쿠키 사용 목적
                      <p>비바샘은 다음과 같은 목적을 위해 쿠키를 통하여 수집된 고객의 개인정보를 사용합니다.</p>
                      <ul className="list_hyp">
                        <li>- 개인의 관심 분야에 따라 차별화된 정보를 제공</li>
                        <li>- 접속빈도 또는 방문시간 등을 분석하고 이용자의 관심분야를 파악하여 타겟(target) 마케팅 및 서비스 개선의 척도로 활용</li>
                        <li>- 품목들에 대한 정보와 관심있게 둘러본 품목을 추적하여 개인 맞춤 서비스 제공</li>
                      </ul>
                    </li>
                    <li>다. 비바샘의 쿠키(cookie) 운용
                      <p>쿠키는 고객의 컴퓨터는 식별하지만 고객을 개인적으로 식별하지는 않습니다. 또한 고객은 웹브라우저에 설정을 통해 모든 쿠키를 허용/거부하거나, 쿠키를 저장될 때마다 확인을 거치도록 할 수 있습니다. 쿠키 설정거부 방법은 다음과 같습니다.<br />(Internet Explorer 기준) 웹브라우저 [도구] 메뉴 [인터넷 옵션] 선택 &gt; [개인정보] 탭을 선택 &gt; [고급]에서 원하는 옵션 선택</p>
                    </li>
                  </ul>
                </dd>
                <dt id="a4">4. 개인정보의 보유·이용기간 및 파기</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보를 고지 및 동의 받은 기간 동안 보유 및 이용합니다. 개인정보의 수집 및 이용목적 달성, 보유기간 만료, 회원의 수집 및 이용 동의 철회 시 수집된 개인정보는 열람하거나 이용할 수 없도록 파기 처리합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련법령의 규정에 의하여 다음과 같이 거래 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할 필요가 있을 경우에는 그 기간 동안 보유합니다.
                      <ul>
                        <li>1) 전자상거래 등에서의 소비자보호에 관한 법률 제6조
                          <ul className="list_hyp">
                            <li>- 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                            <li>- 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                            <li>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                          </ul>
                        </li>
                        <li>2) 통신비밀보호법
                          <ul className="list_hyp">
                            <li>- 인터넷 로그기록자료, 접속지 추적자료 : 3개월</li>
                          </ul>
                        </li>
                        <li>3) 기타 관련 법령 등<br />
                          <p className="comment type02">※ 그 외 정보통신망법 제50조(영리목적의 광고성 정보 전송 제한) 준수 이력을 증빙하기 위하여 e메일, 문자와 관련된 개인정보를 1년간 보관할 수 있습니다. 이 경우 탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</p>
                        </li>
                      </ul>
                    </li>
                    <li>나. 정보 파기방법은 아래와 같습니다.
                      <ul>
                        <li>1) 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>2) 전자적 파일형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                    <li>다. 개인정보 유효기간 제도
                      <ul>
                        <li>1) 비바샘 장기간 서비스 미이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의 개인정보를 다른 이용자의 정보와 분리하여 저장, 관리합니다.</li>
                        <li>2) 미이용의 기간은 로그인, 상담원 접촉일자 등으로 산정하며 법령에서 정의한 기간 동안 서비스 미이용자에 대하여 분리, 저장관리합니다.</li>
                        <li>3) 비바샘은 미이용자 개인정보 분리/저장시점 도래 1개월 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>라. 회원에서 탈퇴한 후 회원 재가입, 임의해지 등을 반복적으로 행하여 할인쿠폰, 이벤트 혜택 등으로 경제상의 이익을 취하거나 이 과정에서 명의를 무단으로 사용하는 편법과 불법행위를 하는 회원을 차단 하고자 비바샘의 홈페이지 회원 탈퇴 후 6개월 동안 회원의 이름, 아이디(ID), 로그기록, 접속아이피(IP) 등을 보관합니다.</li>
                  </ul>
                </dd>
                <dt id="a5">5. 수집한 개인정보의 이용 및 제3자 제공</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보 처리방침」의 「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이 범위를 초과하여 이용하거나 타인 또는 다른 기업 · 기관에 제공하지 않습니다. 단, 고객의 동의가 있거나 법령에 의하여 정해진 절차에 따라 정보를 요청받은 경우는 예외로 하며, 이 경우 주의를 기울여 개인정보를 이용 및 제공할 수 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a6">6. 개인정보의 열람 및 정정</dt>
                <dd>
                  <ul>
                    <li>가. 고객님은 언제든지 등록된 고객님의 개인정보를 열람하거나 정정하실 수 있습니다. 개인정보는 『회원정보변경』을 클릭하여 직접 열람하거나 정정할 수 있으며 개인정보보호책임자 또는 담당자에게 서면이나 전화 또는 이메일(E-mail)로 열람이나 정정을 요청하시면 곧바로 조치하겠습니다.</li>
                    <li>나. 고객님이 개인정보의 오류에 대해 정정을 요청하면, 비바샘은 정정을 완료하기 전까지 해당 개인 정보를 이용하거나 제공하지 않습니다.</li>
                    <li>다. 잘못된 개인정보를 제3자에게 이미 제공했을 때에는 정정 처리결과를 제3자에게 곧바로 통지하여 정정하도록 조치하겠습니다.</li>
                  </ul>
                </dd>
                <dt id="a7">7. 개인정보의 수집,이용,제공에 대한 동의철회</dt>
                <dd>
                  <ul>
                    <li>가. 회원가입 등을 통한 개인정보의 수집, 이용, 제공과 관련해 고객님은 동의하신 내용을 언제든지 철회하실 수 있습니다. 동의철회는 홈페이지 첫 화면의 『회원정보변경』에서 "회원정보수정 내 회원탈퇴"를 클릭하면 개인정보의 수집ㆍ이용ㆍ제공에 대한 동의를 바로 철회할 수 있으며, 개인정보보호책임자에게 서면, 전화, 이메일(E-mail) 등으로 연락하시면 비바샘은 즉시 회원 탈퇴를 위해 필요한 조치를 취합니다. 동의를 철회하고 개인정보를 파기하는 등의 조치가 있으면 그 사실을 고객님께 지체없이 통지하도록 하겠습니다.</li>
                    <li>나. 비바샘은 개인정보의 수집에 대한 동의철회(회원탈퇴)를 개인정보를 수집하는 방법보다 쉽게 할 수 있도록 필요한 조치를 취합니다.</li>
                  </ul>
                </dd>
                <dt id="a8">8. 개인정보 처리 업무의 위탁</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공, 더 나은 서비스 제공, 고객편의 제공 등 원활한 업무 수행을 위하여 다음과 같이 개인정보 처리 업무를 외부전문업체에 위탁하여 운영하고 있습니다.
                      <table>
                        <colgroup>
                          <col style={{'width': '20%'}} />
                          <col style={{'width': '25%'}} />
                          <col />
                          <col style={{'width': '22%'}} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>수탁자</th>
                            <th>개인정보 항목</th>
                            <th>위탁목적</th>
                            <th>보유 및 이용기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>(주)북큐브네트웍스</td>
                            <td className="em">아이디, 성명</td>
                            <td>무료 전자도서관 서비스 이용</td>
                            <td rowSpan={4}>회원 탈퇴 시<br />또는 법정 의무보유기간</td>
                          </tr>
                          <tr>
                            <td>(주)다우기술</td>
                            <td className="em">휴대전화번호</td>
                            <td>이벤트 기프티콘 경품 발송</td>
                          </tr>
                          <tr>
                            <td>롯데글로벌로지스㈜</td>
                            <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                            <td>이벤트 경품 배송</td>
                          </tr>
                          <tr>
                            <td>오케이커뮤니케이션즈</td>
                            <td className="em">휴대전화번호</td>
                            <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                    <li>나. 비바샘은 위탁업무계약서 등을 통하여 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 개인정보의 제3자 제공 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 이를 지키도록 관리하고 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a9">9. 개인정보 처리방침의 고지 또는 통지방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객이 동의한 범위를 넘어 고객의 개인정보를 이용하거나 제3자에게 제공하기 위해 고객에게서 추가적인 동의를 얻고자 할 때에는 미리 고객에게 개별적으로 서면, 이메일(E- mail), 전화 등으로 해당사항을 알립니다.</li>
                    <li>나. 타인에게 고객의 개인정보의 수집·보관·처리·이용·제공·관리·파기 등을 위탁할 때에는 그 사실을 가입화면, 서비스이용약관, 홈페이지의 개인정보 처리방침 등을 통하여 그 사실을 고객에게 고지하고 알리고 동의를 얻습니다.</li>
                    <li>다. 비바샘은 영업의 전부 또는 일부를 양도하거나 합병·상속 등으로 그 권리와 의무를 이전할 때에는 서면·이메일(E-mail) 등을 통하여 고객에게 개별적으로 알리는 동시에 해당 사실을 홈페이지 첫 화면에서 식별할 수 있도록 표기하고 30일 이상 그 사실을 공지합니다. 다만, 다만, 천재·지변이나 그 밖에 정당한 사유로 홈페이지 게시가 곤란한 경우에는  2곳 이상의 중앙일간지(고객의 대부분이 특정 지역에 거주할 때에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다)에 1 회 이상 공고하는 것으로 대신합니다.</li>
                  </ul>
                </dd>
                <dt id="a10">10. 개인정보보호를 위한 기술 및 관리적 대책</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘에서는 고객님의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고 있습니다.</li>
                    <li>나. 기술적 대책
                      <p>비바샘은 고객님의 개인정보를 처리할 때 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적 대책을 마련하여 개인정보의 안전성을 확보하고 있습니다.</p>
                      <ul className="list_hyp">
                        <li>- 고객님의 개인정보는 비밀번호(Password)로 보호되며 중요한 데이터는 파일 및 전송데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하여 중요한 데이터는 별도의 보안기능으로 보호됩니다.</li>
                        <li>- 비바샘은 백신프로그램을 이용하여 컴퓨터 바이러스의 피해를 방지하는 조치를 하고 있습니다. 백신프로그램은 주기적으로 업데이트되며 바이러스가 갑자기 출현하면 백신이 나오는 즉시 이를 제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.</li>
                        <li>- 비바샘은 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를 채택하고 있습니다.</li>
                        <li>- 해킹 등 외부침입에 대비하여 침입차단시스템과 침입방지시스템 등을 이용하여 보안에 최선을 다하고 있습니다.</li>
                      </ul>
                    </li>
                    <li>다. 관리적 대책
                      <p>비바샘은 고객님의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있으며 이에 해당하는 자는 다음과 같습니다.</p>
                      <ul>
                        <li>1) 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
                        <li>2) 개인정보보호책임자와 담당자 등 개인정보보호업무를 수행하는 자</li>
                        <li>3) 기타 업무상 개인정보의 처리가 불가피한 자</li>
                      </ul>
                      <ul className="list_hyp">
                        <li>- 비바샘은 고객의 개인정보에 대한 접근과 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고 지키도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육 등을 시행하고 있습니다.</li>
                        <li>- 전산실 등을 통제구역으로 설정하여 출입을 통제하고 있습니다.</li>
                        <li>- 비바샘은 신규로 채용된 직원에게 정보보호서약서 또는 개인정보보호서약서에 서명하게 하여 직원에 의한 정보유출을미리 방지하고 있으며, 개인정보처리방침에 대한 이행사항과 직원의 준수여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있습니다.</li>
                        <li>- 비바샘은 직원 퇴직시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된 개인정보를 훼손·침해 또는 누설하지 않도록 하고 있습니다.</li>
                        <li>- 그 밖에 내부 관리자의 실수나 기술관리 상의 사고로 고객님의 개인정보가 상실ㆍ유출ㆍ변조ㆍ훼손되면 비바샘은 즉각 고객님께 해당 사실을 알리고 적절한 대책과 보상을 마련할 것입니다.</li>
                      </ul>
                    </li>
                    <li>라. 기타 보호대책
                      <ul>
                        <li>1) 개인정보 유출 등 통지∙신고제도
                          <p>비바샘은 개인정보의 분실, 도난, 유출 사고 발생 사실을 안 때에는 지체없이 이용자에게 해당 내용을 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                        </li>
                        <li>2) 개인정보 이용내역 통지 제도
                          <ul className="list_hyp">
                            <li>- 비바샘은 이용자의 개인정보 자기결정권을 보장하기 위해 개인정보 이용내역을 해당 이용자에게 주기적으로(연 1회이상) 통지합니다.</li>
                            <li>- 통지하는 개인정보 이용내역은 다음과 같습니다.
                              <ul className="list_cir">
                                <li>• 개인정보 수집∙이용목적 및 수집한 개인정보의 항목</li>
                                <li>• 개인정보를 제공받은 자, 그 제공 목적 및 제공한 개인정보의 항목</li>
                                <li>• 개인정보 처리위탁을 받은 자 및 그 처리위탁을 하는 업무의 내용</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a11">11. 게시글 관리와 책임</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 게시물을 소중하게 생각하며 해당 게시물이 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우에는 그렇지 않습니다.
                      <ul className="list_cir">
                        <li>• 스팸(spam)성 게시물 (예 : 행운의 편지, 특정사이트에 대한 광고, 다른 사이트로의 유도 광고 및 링크 등)</li>
                        <li>• 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글</li>
                        <li>• 동의 없는 타인의 신상공개, 비바샘의 저작권, 혹은 제3자의 지적재산권 등의 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물</li>
                        <li>• 비바샘은 바람직한 게시판 문화를 활성화하기 위하여 타인의 신상을 동의 없이 공개할 때에는 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.</li>
                        <li>• 다른 주제의 게시판으로 이동할 수 있는 내용은 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.</li>
                        <li>• 그 밖의 경우에는 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>나. 근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또한 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고한 후 서비스를 이용해야 합니다.</li>
                  </ul>
                </dd>
                <dt id="a12">12. 고객의 권리와 의무</dt>
                <dd>
                  <ul>
                    <li>가. 고객님의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 부정확한 정보 입력으로 말미암아 발생하는 사고의 책임은 고객님께 있으며 타인의 정보를 무단으로 사용하는 등 허위정보를 입력하면 회원자격이 상실될 수 있습니다.</li>
                    <li>나. 고객은 개인정보를 보호받을 권리와 함께 자신을 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 지니고 있습니다. 비밀번호(Password)를 포함한 고객님의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 때에는『정보통신망 이용촉진 및 정보보호 등 에 관한 법률』등에 의해 처벌받을 수 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a13">13. 광고성 정보 전송</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 제50조에 의거, 전자우편, 휴대폰문자, 모바일앱, DM, TM 등의 채널로 영리목적의 광고성 정보를 전송할 수 있습니다.</li>
                    <li>나. 비바샘은 문서 또는 구술의 방법으로 고객에게 명시적으로 수신동의를 받아 광고성 정보를 전송합니다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 사전동의를 받지 않습니다.
                      <ul>
                        <li>1. 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 자가 해당 재화 등의 거래가 종료된 날부터 6개월 이내에 자신이 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우</li>
                        <li>2. 「방문판매 등에 관한 법률」에 따른 전화권유판매자가 육성으로 전화권유를 하는 경우</li>
                      </ul>
                    </li>
                    <li>다. 비바샘은 광고성 정보가 시작되는 부분에 광고를 의미하는 표시를 안내하고, 본문에는 전송자의 명칭 및 연락처, 그리고 수신 거부 또는 수신동의 철회의 의사를 쉽게 표시할 수 있도록 하기 위한 안내문을 명시합니다.</li>
                    <li>라. 비바샘은 고객이 광고성 정보의 수신거부, 사전 동의를 철회한 경우 영리목적의 광고성 정보를 전송하지 않습니다.</li>
                    <li>마. 비바샘은 법률에서 금지하는 재화 또는 서비스에 대한 광고성 정보를 전송하지 않습니다.</li>
                  </ul>
                </dd>
                <dt id="a14">14. 의견수렴 및 불만 처리</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 의견을 매우 소중하게 생각하며, 고객은 의문사항으로부터 언제나 성실한 답변을 받을 권리가 있습니다.</li>
                    <li>나. 비바샘은 고객과의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있습니다. 문의사항이 있으면 아래의 연락처로 문의하시기 바랍니다.
                      <p><strong>• 고객센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 연락처: 1544-7714</li>
                        <li>- 담당자 메일: vivasam@visang.com</li>
                        <li>- 고객센터 운영시간: 평일 09:00~18:00 / 점심시간 12:30~13:30</li>
                      </ul>
                    </li>
                    <li>다. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청 사이버안전국 등으로 문의하실 수 있습니다.
                      <p><strong>• 대검찰청 사이버 범죄수사단</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 1301</li>
                        <li>- URL: http://spo.go.kr</li>
                      </ul>
                      <p><strong>• 경찰청 사이버안전국</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 182</li>
                        <li>- URL: http://cyberbureau.police.go.kr/index.do</li>
                      </ul>
                      <p><strong>• 개인정보침해신고센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 118</li>
                        <li>- URL: http://privacy.kisa.or.kr</li>
                      </ul>
                      <p><strong>• 개인정보분쟁조정위원회</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: 02-1833-6972</li>
                        <li>- URL: http://kopico.go.kr</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a15">15. 개인정보보호책임자 및 담당자</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보보호를 매우 소중하게 생각하며, 고객의 개인정보가 훼손, 침해, 누설되지 않도록 최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의 위험성 때문에 예기치 못한 사고가 발생하여 정보가 훼손되거나 방문자가 작성한 게시물에 의해 각종 분쟁이 발생하는 것에 대해서는 책임을 지지 않습니다.</li>
                    <li>나. 비바샘의 고객센터에서는 고객의 개인정보보호 관련 문의에 신속하고 성실하게 답변을 드리도록 하고 있습니다.
                      <p>비바샘의 개인정보보호 담당자와 연락하기를 원하시면 아래의 연락처나 이메일로 문의해 주시기 바랍니다. 개인정보 관련 문의사항에 대해 신속하고 성실하게 답변해 드리겠습니다.</p>
                      <table>
                        <colgroup>
                          <col />
                          <col style={{'width': '40%'}} />
                          <col style={{'width': '40%'}} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>구분</th>
                            <th>개인정보보호책임자</th>
                            <th>개인정보보호담당자</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>이름</th>
                            <td className="textC em">이우상 CP</td>
                            <td className="textC em">이정우 CP</td>
                          </tr>
                          <tr>
                            <th>부서</th>
                            <td className="textC em">경영지원 Core</td>
                            <td className="textC em">IT전략 Cell</td>
                          </tr>
                          <tr>
                            <th>전화번호</th>
                            <td className="textC em">1544-7714</td>
                            <td className="textC em">1544-7714</td>
                          </tr>
                          <tr>
                            <th>e-mail</th>
                            <td className="textC em">privacy@visang.com</td>
                            <td className="textC em">privacy@visang.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt id="a16">16. 고지 의무</dt>
                <dd>
                  <p className="padT"><strong>현 개인정보 처리방침은 2018년 11월 9일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 필요하면 일반적 내용은 개정 최소 7일 전부터, 중요한 내용은 개정 최소 30일 전부터 홈페이지의 '공지'란을 통해 알릴 것입니다.</strong></p>
                  <ul className="lightFont listtopPad">
                    <li>- 개인정보 처리방침 공고일자 : 2018년 11월 2일</li>
                    <li>- 개인정보 처리방침 시행일자 : 2018년 11월 9일</li>
                  </ul>
                </dd>
              </dl>
            </div>
            <div className="privacy_ver7 hide">
              <div className="privacyDetails renew">
                <dl>
                  <dt id="a1">1. 개인정보 수집 및 이용목적</dt>
                  <dd>
                    <table summary="개인정보 수집 및 이용목적 테이블">
                      <colgroup>
                        <col className="col15" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>구분</th>
                          <th>이용목적</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>회원 관리</td>
                          <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지,<br />회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                        </tr>
                        <tr>
                          <td>서비스 제공<br />(교사 맞춤 서비스)</td>
                          <td>무료 전자도서관 서비스 이용, 교사참여 오프라인 행사 안내, 수업 및 평가 자료 메일링 서비스, 경품 및 기프티콘 발송, V매거진 정기구독 등</td>
                        </tr>
                        <tr>
                          <td>마케팅 및 광고</td>
                          <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보,<br />접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                        </tr>
                      </tbody>
                    </table>
                  </dd>
                  <dt id="a2">2. 개인정보 수집 항목 및 방법</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 기본적인 서비스 제공을 위한 필수 정보만을 수집하고 있으며 고객 각각의 기호와 필요에 맞는 서비스를 제공하기 위하여 정보 수집 때 별도 동의를 얻고 있습니다.<br />선택 정보를 입력하지 않아도 서비스 이용에 제한은 없습니다.</li>
                      <li>나. 비바샘은 이용자의 기본적 인권을 침해할 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 미리 밝힌 목적 이외의 다른 목적으로는 사용하지 않으며 외부로 유출하지 않습니다.</li>
                      <li>다. 비바샘은 다음과 같이 개인정보를 수집하여 이용합니다.
                        <ul>
                          <li>1) 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                            <table>
                              <colgroup>
                                <col className="col12" />
                                <col className="col20" />
                                <col />
                                <col className="col28" />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th colSpan={2}>목적</th>
                                  <th>항목</th>
                                  <th>보유기간</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>회원 관리</td>
                                  <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                                  <td className="em">아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 비상교과서 채택여부,<br />아이핀CI, EPKI인증서DN, EPKI인증서SN, 생년월일, 성별, 학교급,<br />재직학교명, 담당학년</td>
                                  <td rowSpan={7}>회원 탈퇴 후 파기됩니다.<br />다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불,편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.</td>
                                </tr>
                                <tr>
                                  <td rowSpan={5}>서비스 제공<br />(교사 맞춤 서비스)</td>
                                  <td>무료 전자도서관 서비스 이용</td>
                                  <td className="em">아이디, 성명</td>
                                </tr>
                                <tr>
                                  <td>교사참여 오프라인 행사<br />참여 안내</td>
                                  <td className="em">성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                                </tr>
                                <tr>
                                  <td>수업 및 평가 자료 메일링 서비스</td>
                                  <td className="em">아이디, 성명, 이메일, 학교급, 재직학교명, 내 교과, 담당학년</td>
                                </tr>
                                <tr>
                                  <td>경품 및 기프티콘 발송</td>
                                  <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                                </tr>
                                <tr>
                                  <td>V매거진 정기구독</td>
                                  <td className="em">아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                                </tr>
                                <tr>
                                  <td>마케팅 및 광고</td>
                                  <td>신규 서비스 및 이벤트 홍보</td>
                                  <td className="em">아이디, 성명, 이메일, 휴대전화번호</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="comment">※ 비바샘은 이 외에 고객님이 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                          </li>
                          <li>2) 서비스 이용과정에서 생성되는 정보
                            <table>
                              <colgroup>
                                <col className="col6" />
                                <col className="col15" />
                                <col />
                                <col className="col32" />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th>구분</th>
                                  <th>이용목적</th>
                                  <th>수집항목</th>
                                  <th>보유기간</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td rowSpan={2} className="textC">필수</td>
                                  <td>본인확인</td>
                                  <td className="em">본인확인값(CI)</td>
                                  <td rowSpan={7}>회원 탈퇴시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료</td>
                                </tr>
                                <tr>
                                  <td>서비스 이용 통계 등</td>
                                  <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br />※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                                </tr>
                              </tbody>
                            </table>
                          </li>
                          <li>3) 기타 법정 의무 수집 정보 등
                            <table>                              
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
                                  <td className="textC">3개월</td>
                                </tr>
                                <tr>
                                  <td rowSpan={3}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                                  <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                                  <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                                  <td className="textC">3년</td>
                                </tr>
                                <tr>
                                  <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                                  <td rowSpan={2} className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                                  <td rowSpan={2} className="textC">5년</td>
                                </tr>
                                <tr>
                                  <td>계약 또는 청약철회 등에 관한 기록</td>
                                </tr>
                              </tbody>
                            </table>
                          </li>
                        </ul>
                      </li>
                      <li>라. 개인정보 수집방법
                        <ul className="list_hyp">
                          <li>- 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청</li>
                          <li>- 로그 분석 프로그램을 통한 생성정보수집</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt id="a3">3. 쿠키에 의한 개인정보 수집</dt>
                  <dd>
                    <ul>
                      <li>가. 쿠키란?
                        <p>비바샘은 고객에 대한 정보를 저장하고 수시로 찾아내는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트가 고객의 컴퓨터 브라우저(인터넷 익스플로러 등)에 전송하는 소량의 정보입니다.</p>
                      </li>
                      <li>나. 비바샘의 쿠키 사용 목적
                        <p>비바샘은 다음과 같은 목적을 위해 쿠키를 통하여 수집된 고객의 개인정보를 사용합니다.</p>
                        <ul className="list_hyp">
                          <li>- 개인의 관심 분야에 따라 차별화된 정보를 제공</li>
                          <li>- 접속빈도 또는 방문시간 등을 분석하고 이용자의 관심분야를 파악하여 타겟(target) 마케팅 및 서비스 개선의 척도로 활용</li>
                          <li>- 품목들에 대한 정보와 관심있게 둘러본 품목을 추적하여 개인 맞춤 서비스 제공</li>
                        </ul>
                      </li>
                      <li>다. 비바샘의 쿠키(cookie) 운용
                        <p>쿠키는 고객의 컴퓨터는 식별하지만 고객을 개인적으로 식별하지는 않습니다. 또한 고객은 웹브라우저에 설정을 통해 모든 쿠키를 허용/거부하거나, 쿠키를 저장될 때마다 확인을 거치도록 할 수 있습니다. 쿠키 설정거부 방법은 다음과 같습니다.<br />(Internet Explorer 기준) 웹브라우저 [도구] 메뉴 [인터넷 옵션] 선택 &gt; [개인정보] 탭을 선택 &gt; [고급]에서 원하는 옵션 선택</p>
                      </li>
                    </ul>
                  </dd>
                  <dt id="a4">4. 개인정보의 보유·이용기간 및 파기</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객의 개인정보를 고지 및 동의 받은 기간 동안 보유 및 이용합니다. 개인정보의 수집 및 이용목적 달성, 보유기간 만료, 회원의 수집 및 이용 동의 철회 시 수집된 개인정보는 열람하거나 이용할 수 없도록 파기 처리합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련법령의 규정에 의하여 다음과 같이 거래 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할 필요가 있을 경우에는 그 기간 동안 보유합니다.
                        <ul>
                          <li>1) 전자상거래 등에서의 소비자보호에 관한 법률 제6조
                            <ul className="list_hyp">
                              <li>- 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                              <li>- 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                              <li>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                            </ul>
                          </li>
                          <li>2) 통신비밀보호법
                            <ul className="list_hyp">
                              <li>- 인터넷 로그기록자료, 접속지 추적자료 : 3개월</li>
                            </ul>
                          </li>
                          <li>3) 기타 관련 법령 등<br />
                            <p className="comment type02">※ 그 외 정보통신망법 제50조(영리목적의 광고성 정보 전송 제한) 준수 이력을 증빙하기 위하여 e메일, 문자와 관련된 개인정보를 1년간 보관할 수 있습니다. 이 경우 탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</p>
                          </li>
                        </ul>
                      </li>
                      <li>나. 정보 파기방법은 아래와 같습니다.
                        <ul>
                          <li>1) 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                          <li>2) 전자적 파일형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                        </ul>
                      </li>
                      <li>다. 개인정보 유효기간 제도
                        <ul>
                          <li>1) 비바샘 장기간 서비스 미이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의 개인정보를 다른 이용자의 정보와 분리하여 저장, 관리합니다.</li>
                          <li>2) 미이용의 기간은 로그인, 상담원 접촉일자 등으로 산정하며 법령에서 정의한 기간 동안 서비스 미이용자에 대하여 분리, 저장관리합니다.</li>
                          <li>3) 비바샘은 미이용자 개인정보 분리/저장시점 도래 1개월 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                        </ul>
                      </li>
                      <li>라. 회원에서 탈퇴한 후 회원 재가입, 임의해지 등을 반복적으로 행하여 할인쿠폰, 이벤트 혜택 등으로 경제상의 이익을 취하거나 이 과정에서 명의를 무단으로 사용하는 편법과 불법행위를 하는 회원을 차단 하고자 비바샘의 홈페이지 회원 탈퇴 후 6개월 동안 회원의 이름, 아이디(ID), 로그기록, 접속아이피(IP) 등을 보관합니다.</li>
                    </ul>
                  </dd>
                  <dt id="a5">5. 수집한 개인정보의 이용 및 제3자 제공</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보 처리방침」의 「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이 범위를 초과하여 이용하거나 타인 또는 다른 기업 · 기관에 제공하지 않습니다. 단, 고객의 동의가 있거나 법령에 의하여 정해진 절차에 따라 정보를 요청받은 경우는 예외로 하며, 이 경우 주의를 기울여 개인정보를 이용 및 제공할 수 있습니다.</li>
                    </ul>
                  </dd>
                  <dt id="a6">6. 개인정보의 열람 및 정정</dt>
                  <dd>
                    <ul>
                      <li>가. 고객님은 언제든지 등록된 고객님의 개인정보를 열람하거나 정정하실 수 있습니다. 개인정보는 『회원정보변경』을 클릭하여 직접 열람하거나 정정할 수 있으며 개인정보보호책임자 또는 담당자에게 서면이나 전화 또는 이메일(E-mail)로 열람이나 정정을 요청하시면 곧바로 조치하겠습니다.</li>
                      <li>나. 고객님이 개인정보의 오류에 대해 정정을 요청하면, 비바샘은 정정을 완료하기 전까지 해당 개인 정보를 이용하거나 제공하지 않습니다.</li>
                      <li>다. 잘못된 개인정보를 제3자에게 이미 제공했을 때에는 정정 처리결과를 제3자에게 곧바로 통지하여 정정하도록 조치하겠습니다.</li>
                    </ul>
                  </dd>
                  <dt id="a7">7. 개인정보의 수집,이용,제공에 대한 동의철회</dt>
                  <dd>
                    <ul>
                      <li>가. 회원가입 등을 통한 개인정보의 수집, 이용, 제공과 관련해 고객님은 동의하신 내용을 언제든지 철회하실 수 있습니다. 동의철회는 홈페이지 첫 화면의 『회원정보변경』에서 "회원정보수정 내 회원탈퇴"를 클릭하면 개인정보의 수집ㆍ이용ㆍ제공에 대한 동의를 바로 철회할 수 있으며, 개인정보보호책임자에게 서면, 전화, 이메일(E-mail) 등으로 연락하시면 비바샘은 즉시 회원 탈퇴를 위해 필요한 조치를 취합니다. 동의를 철회하고 개인정보를 파기하는 등의 조치가 있으면 그 사실을 고객님께 지체없이 통지하도록 하겠습니다.</li>
                      <li>나. 비바샘은 개인정보의 수집에 대한 동의철회(회원탈퇴)를 개인정보를 수집하는 방법보다 쉽게 할 수 있도록 필요한 조치를 취합니다.</li>
                    </ul>
                  </dd>
                  <dt id="a8">8. 개인정보 처리 업무의 위탁</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 기본적인 서비스 제공, 더 나은 서비스 제공, 고객편의 제공 등 원활한 업무 수행을 위하여 다음과 같이 개인정보 처리 업무를 외부전문업체에 위탁하여 운영하고 있습니다.
                        <table summary="개인정보 처리 업무의 위탁 테이블">
                          <colgroup>
                            <col className="col20" />
                            <col className="col25" />
                            <col />
                            <col className="col22" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>수탁자</th>
                              <th>개인정보 항목</th>
                              <th>위탁목적</th>
                              <th>보유 및 이용기간</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>(주)북큐브네트웍스</td>
                              <td className="em">아이디, 성명</td>
                              <td>무료 전자도서관 서비스 이용</td>
                              <td rowSpan={4}>회원 탈퇴 시<br />또는 법정 의무보유기간</td>
                            </tr>
                            <tr>
                              <td>(주)다우기술</td>
                              <td className="em">휴대전화번호</td>
                              <td>이벤트 기프티콘 경품 발송</td>
                            </tr>
                            <tr>
                              <td>롯데글로벌로지스㈜</td>
                              <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                              <td>이벤트 경품 배송</td>
                            </tr>
                            <tr>
                              <td>오케이커뮤니케이션즈</td>
                              <td className="em">휴대전화번호</td>
                              <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                            </tr>
                          </tbody>
                        </table>
                      </li>
                      <li>나. 비바샘은 위탁업무계약서 등을 통하여 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 개인정보의 제3자 제공 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 이를 지키도록 관리하고 있습니다.</li>
                    </ul>
                  </dd>
                  <dt id="a9">9. 개인정보 처리방침의 고지 또는 통지방법</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객이 동의한 범위를 넘어 고객의 개인정보를 이용하거나 제3자에게 제공하기 위해 고객에게서 추가적인 동의를 얻고자 할 때에는 미리 고객에게 개별적으로 서면, 이메일(E- mail), 전화 등으로 해당사항을 알립니다.</li>
                      <li>나. 타인에게 고객의 개인정보의 수집·보관·처리·이용·제공·관리·파기 등을 위탁할 때에는 그 사실을 가입화면, 서비스이용약관, 홈페이지의 개인정보 처리방침 등을 통하여 그 사실을 고객에게 고지하고 알리고 동의를 얻습니다.</li>
                      <li>다. 비바샘은 영업의 전부 또는 일부를 양도하거나 합병·상속 등으로 그 권리와 의무를 이전할 때에는 서면·이메일(E-mail) 등을 통하여 고객에게 개별적으로 알리는 동시에 해당 사실을 홈페이지 첫 화면에서 식별할 수 있도록 표기하고 30일 이상 그 사실을 공지합니다. 다만, 다만, 천재·지변이나 그 밖에 정당한 사유로 홈페이지 게시가 곤란한 경우에는  2곳 이상의 중앙일간지(고객의 대부분이 특정 지역에 거주할 때에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다)에 1 회 이상 공고하는 것으로 대신합니다.</li>
                    </ul>
                  </dd>
                  <dt id="a10">10. 개인정보보호를 위한 기술 및 관리적 대책</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘에서는 고객님의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고 있습니다.</li>
                      <li>나. 기술적 대책
                        <p>비바샘은 고객님의 개인정보를 처리할 때 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적 대책을 마련하여 개인정보의 안전성을 확보하고 있습니다.</p>
                        <ul className="list_hyp">
                          <li>- 고객님의 개인정보는 비밀번호(Password)로 보호되며 중요한 데이터는 파일 및 전송데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하여 중요한 데이터는 별도의 보안기능으로 보호됩니다.</li>
                          <li>- 비바샘은 백신프로그램을 이용하여 컴퓨터 바이러스의 피해를 방지하는 조치를 하고 있습니다. 백신프로그램은 주기적으로 업데이트되며 바이러스가 갑자기 출현하면 백신이 나오는 즉시 이를 제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.</li>
                          <li>- 비바샘은 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를 채택하고 있습니다.</li>
                          <li>- 해킹 등 외부침입에 대비하여 침입차단시스템과 침입방지시스템 등을 이용하여 보안에 최선을 다하고 있습니다.</li>
                        </ul>
                      </li>
                      <li>다. 관리적 대책
                        <p>비바샘은 고객님의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있으며 이에 해당하는 자는 다음과 같습니다.</p>
                        <ul>
                          <li>1) 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
                          <li>2) 개인정보보호책임자와 담당자 등 개인정보보호업무를 수행하는 자</li>
                          <li>3) 기타 업무상 개인정보의 처리가 불가피한 자</li>
                        </ul>
                        <ul className="list_hyp">
                          <li>- 비바샘은 고객의 개인정보에 대한 접근과 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고 지키도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육 등을 시행하고 있습니다.</li>
                          <li>- 전산실 등을 통제구역으로 설정하여 출입을 통제하고 있습니다.</li>
                          <li>- 비바샘은 신규로 채용된 직원에게 정보보호서약서 또는 개인정보보호서약서에 서명하게 하여 직원에 의한 정보유출을미리 방지하고 있으며, 개인정보처리방침에 대한 이행사항과 직원의 준수여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있습니다.</li>
                          <li>- 비바샘은 직원 퇴직시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된 개인정보를 훼손·침해 또는 누설하지 않도록 하고 있습니다.</li>
                          <li>- 그 밖에 내부 관리자의 실수나 기술관리 상의 사고로 고객님의 개인정보가 상실ㆍ유출ㆍ변조ㆍ훼손되면 비바샘은 즉각 고객님께 해당 사실을 알리고 적절한 대책과 보상을 마련할 것입니다.</li>
                        </ul>
                      </li>
                      <li>라. 기타 보호대책
                        <ul>
                          <li>1) 개인정보 유출 등 통지∙신고제도
                            <p>비바샘은 개인정보의 분실, 도난, 유출 사고 발생 사실을 안 때에는 지체없이 이용자에게 해당 내용을 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                          </li>
                          <li>2) 개인정보 이용내역 통지 제도
                            <ul className="list_hyp">
                              <li>- 비바샘은 이용자의 개인정보 자기결정권을 보장하기 위해 개인정보 이용내역을 해당 이용자에게 주기적으로(연 1회이상) 통지합니다.</li>
                              <li>- 통지하는 개인정보 이용내역은 다음과 같습니다.
                                <ul className="list_cir">
                                  <li>• 개인정보 수집∙이용목적 및 수집한 개인정보의 항목</li>
                                  <li>• 개인정보를 제공받은 자, 그 제공 목적 및 제공한 개인정보의 항목</li>
                                  <li>• 개인정보 처리위탁을 받은 자 및 그 처리위탁을 하는 업무의 내용</li>
                                </ul>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt id="a11">11. 게시글 관리와 책임</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객의 게시물을 소중하게 생각하며 해당 게시물이 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우에는 그렇지 않습니다.
                        <ul className="list_cir">
                          <li>• 스팸(spam)성 게시물 (예 : 행운의 편지, 특정사이트에 대한 광고, 다른 사이트로의 유도 광고 및 링크 등)</li>
                          <li>• 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글</li>
                          <li>• 동의 없는 타인의 신상공개, 비바샘의 저작권, 혹은 제3자의 지적재산권 등의 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물</li>
                          <li>• 비바샘은 바람직한 게시판 문화를 활성화하기 위하여 타인의 신상을 동의 없이 공개할 때에는 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.</li>
                          <li>• 다른 주제의 게시판으로 이동할 수 있는 내용은 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.</li>
                          <li>• 그 밖의 경우에는 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.</li>
                        </ul>
                      </li>
                      <li>나. 근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또한 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고한 후 서비스를 이용해야 합니다.</li>
                    </ul>
                  </dd>
                  <dt id="a12">12. 고객의 권리와 의무</dt>
                  <dd>
                    <ul>
                      <li>가. 고객님의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 부정확한 정보 입력으로 말미암아 발생하는 사고의 책임은 고객님께 있으며 타인의 정보를 무단으로 사용하는 등 허위정보를 입력하면 회원자격이 상실될 수 있습니다.</li>
                      <li>나. 고객은 개인정보를 보호받을 권리와 함께 자신을 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 지니고 있습니다. 비밀번호(Password)를 포함한 고객님의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 때에는『정보통신망 이용촉진 및 정보보호 등 에 관한 법률』등에 의해 처벌받을 수 있습니다.</li>
                    </ul>
                  </dd>
                  <dt id="a13">13. 광고성 정보 전송</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 제50조에 의거, 전자우편, 휴대폰문자, 모바일앱, DM, TM 등의 채널로 영리목적의 광고성 정보를 전송할 수 있습니다.</li>
                      <li>나. 비바샘은 문서 또는 구술의 방법으로 고객에게 명시적으로 수신동의를 받아 광고성 정보를 전송합니다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 사전동의를 받지 않습니다.
                        <ul>
                          <li>1. 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 자가 해당 재화 등의 거래가 종료된 날부터 6개월 이내에 자신이 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우</li>
                          <li>2. 「방문판매 등에 관한 법률」에 따른 전화권유판매자가 육성으로 전화권유를 하는 경우</li>
                        </ul>
                      </li>
                      <li>다. 비바샘은 광고성 정보가 시작되는 부분에 광고를 의미하는 표시를 안내하고, 본문에는 전송자의 명칭 및 연락처, 그리고 수신 거부 또는 수신동의 철회의 의사를 쉽게 표시할 수 있도록 하기 위한 안내문을 명시합니다.</li>
                      <li>라. 비바샘은 고객이 광고성 정보의 수신거부, 사전 동의를 철회한 경우 영리목적의 광고성 정보를 전송하지 않습니다.</li>
                      <li>마. 비바샘은 법률에서 금지하는 재화 또는 서비스에 대한 광고성 정보를 전송하지 않습니다.</li>
                    </ul>
                  </dd>
                  <dt id="a14">14. 의견수렴 및 불만 처리</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객의 의견을 매우 소중하게 생각하며, 고객은 의문사항으로부터 언제나 성실한 답변을 받을 권리가 있습니다.</li>
                      <li>나. 비바샘은 고객과의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있습니다. 문의사항이 있으면 아래의 연락처로 문의하시기 바랍니다.
                        <p><strong>• 고객센터</strong></p>
                        <ul className="list_hyp type02">
                          <li>- 연락처: 1544-7714</li>
                          <li>- 담당자 메일: vivasam@visang.com</li>
                          <li>- 고객센터 운영시간: 평일 09:00~18:00 / 점심시간 12:30~13:30</li>
                        </ul>
                      </li>
                      <li>다. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청 사이버테러 대응센터 등으로 문의하실 수 있습니다.
                        <p><strong>• 개인정보침해신고센터</strong></p>
                        <ul className="list_hyp type02">
                          <li>- 전화: (국번없이) 118</li>
                          <li>- URL: http://privacy.kisa.or.kr</li>
                        </ul>
                        <p><strong>• 경찰청 사이버테러대응센터</strong></p>
                        <ul className="list_hyp type02">
                          <li>- 전화: 182</li>
                          <li>- URL: http://www.netan.go.kr</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt id="a15">15. 개인정보보호책임자 및 담당자</dt>
                  <dd>
                    <ul>
                      <li>가. 비바샘은 고객의 개인정보보호를 매우 소중하게 생각하며, 고객의 개인정보가 훼손, 침해, 누설되지 않도록 최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의 위험성 때문에 예기치 못한 사고가 발생하여 정보가 훼손되거나 방문자가 작성한 게시물에 의해 각종 분쟁이 발생하는 것에 대해서는 책임을 지지 않습니다.</li>
                      <li>나. 비바샘의 고객센터에서는 고객의 개인정보보호 관련 문의에 신속하고 성실하게 답변을 드리도록 하고 있습니다.
                        <p>비바샘의 개인정보보호 담당자와 연락하기를 원하시면 아래의 연락처나 이메일로 문의해 주시기 바랍니다. 개인정보 관련 문의사항에 대해 신속하고 성실하게 답변해 드리겠습니다.</p>
                        <table>
                          <colgroup>
                            <col />
                            <col className="col40" />
                            <col className="col40" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>구분</th>
                              <th>개인정보보호책임자</th>
                              <th>개인정보보호담당자</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>이름</th>
                              <td className="textC em">이우상 SP</td>
                              <td className="textC em">이정우 IP</td>
                            </tr>
                            <tr>
                              <th>부서</th>
                              <td className="textC em">경영지원실</td>
                              <td className="textC em">IT전략과</td>
                            </tr>
                            <tr>
                              <th>전화번호</th>
                              <td className="textC em">1544-7714</td>
                              <td className="textC em">1544-7714</td>
                            </tr>
                            <tr>
                              <th>e-mail</th>
                              <td className="textC em">privacy@visang.com</td>
                              <td className="textC em">privacy@visang.com</td>
                            </tr>
                          </tbody>
                        </table>
                      </li>
                    </ul>
                  </dd>
                  <dt id="a16">16. 고지 의무</dt>
                  <dd>
                    <p className="padT" style={{color: '#666"}}'}}><strong>현 개인정보 처리방침은 2018년 2월 19일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 필요하면 일반적 내용은 개정 최소 7일 전부터, 중요한 내용은 개정 최소 30일 전부터 홈페이지의 '공지'란을 통해 알릴 것입니다.</strong></p>
                    <ul className="lightFont listtopPad">
                      <li>- 개인정보 처리방침 공고일자 : 2018년 2월 19일</li>
                      <li>- 개인정보 처리방침 시행일자 : 2018년 2월 26일</li>
                    </ul>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="privacy_ver6 hide">
              <dl>
                <dt id="a1">1. 개인정보 수집 및 이용목적</dt>
                <dd>
                  <table summary="개인정보 수집 및 이용목적 테이블">
                    <colgroup>
                      <col className="col15" />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>구분</th>
                        <th>이용목적</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>회원 관리</td>
                        <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지,<br />회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                      </tr>
                      <tr>
                        <td>서비스 제공<br />(교사 맞춤 서비스)</td>
                        <td>무료 전자도서관 서비스 이용, 교사참여 오프라인 행사 안내, 수업 및 평가 자료 메일링 서비스, 경품 및 기프티콘 발송, V매거진 정기구독 등</td>
                      </tr>
                      <tr>
                        <td>마케팅 및 광고</td>
                        <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보,<br />접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                      </tr>
                    </tbody>
                  </table>
                </dd>
                <dt id="a2">2. 개인정보 수집 항목 및 방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공을 위한 필수 정보만을 수집하고 있으며 고객 각각의 기호와 필요에 맞는 서비스를 제공하기 위하여 정보 수집 때 별도 동의를 얻고 있습니다.<br />선택 정보를 입력하지 않아도 서비스 이용에 제한은 없습니다.</li>
                    <li>나. 비바샘은 이용자의 기본적 인권을 침해할 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 미리 밝힌 목적 이외의 다른 목적으로는 사용하지 않으며 외부로 유출하지 않습니다.</li>
                    <li>다. 비바샘은 다음과 같이 개인정보를 수집하여 이용합니다.
                      <ul>
                        <li>1) 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                          <table>
                            <colgroup>
                              <col className="col12" />
                              <col className="col20" />
                              <col />
                              <col className="col28" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th colSpan={2}>목적</th>
                                <th>항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>회원 관리</td>
                                <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                                <td className="em">아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 비상교과서 채택여부,<br />아이핀CI, EPKI인증서DN, EPKI인증서SN, 생년월일, 성별, 학교급,<br />재직학교명, 담당학년</td>
                                <td rowSpan={7}>회원 탈퇴 후 파기됩니다.<br />다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불,편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.</td>
                              </tr>
                              <tr>
                                <td rowSpan={5}>서비스 제공<br />(교사 맞춤 서비스)</td>
                                <td>무료 전자도서관 서비스 이용</td>
                                <td className="em">아이디, 성명</td>
                              </tr>
                              <tr>
                                <td>교사참여 오프라인 행사<br />참여 안내</td>
                                <td className="em">성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>수업 및 평가 자료 메일링 서비스</td>
                                <td className="em">아이디, 성명, 이메일, 학교급, 재직학교명, 내 교과, 담당학년</td>
                              </tr>
                              <tr>
                                <td>경품 및 기프티콘 발송</td>
                                <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>V매거진 정기구독</td>
                                <td className="em">아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                              </tr>
                              <tr>
                                <td>마케팅 및 광고</td>
                                <td>신규 서비스 및 이벤트 홍보</td>
                                <td className="em">아이디, 성명, 이메일, 휴대전화번호</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="comment">※ 비바샘은 이 외에 고객님이 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                        </li>
                        <li>2) 서비스 이용과정에서 생성되는 정보
                          <table>
                            <colgroup>
                              <col className="col6" />
                              <col className="col15" />
                              <col />
                              <col className="col32" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>구분</th>
                                <th>이용목적</th>
                                <th>수집항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td rowSpan={2} className="textC">필수</td>
                                <td>본인확인</td>
                                <td className="em">본인확인값(CI)</td>
                                <td rowSpan={7}>회원 탈퇴시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료</td>
                              </tr>
                              <tr>
                                <td>서비스 이용 통계 등</td>
                                <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br />※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>3) 기타 법정 의무 수집 정보 등
                          <table>                            
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
                                <td className="textC">3개월</td>
                              </tr>
                              <tr>
                                <td rowSpan={3}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                                <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                                <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                                <td className="textC">3년</td>
                              </tr>
                              <tr>
                                <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                                <td rowSpan={2} className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                                <td rowSpan={2} className="textC">5년</td>
                              </tr>
                              <tr>
                                <td>계약 또는 청약철회 등에 관한 기록</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>라. 개인정보 수집방법
                      <ul className="list_hyp">
                        <li>- 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청</li>
                        <li>- 로그 분석 프로그램을 통한 생성정보수집</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a3">3. 쿠키에 의한 개인정보 수집</dt>
                <dd>
                  <ul>
                    <li>가. 쿠키란?
                      <p>비바샘은 고객에 대한 정보를 저장하고 수시로 찾아내는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트가 고객의 컴퓨터 브라우저(인터넷 익스플로러 등)에 전송하는 소량의 정보입니다.</p>
                    </li>
                    <li>나. 비바샘의 쿠키 사용 목적
                      <p>비바샘은 다음과 같은 목적을 위해 쿠키를 통하여 수집된 고객의 개인정보를 사용합니다.</p>
                      <ul className="list_hyp">
                        <li>- 개인의 관심 분야에 따라 차별화된 정보를 제공</li>
                        <li>- 접속빈도 또는 방문시간 등을 분석하고 이용자의 관심분야를 파악하여 타겟(target) 마케팅 및 서비스 개선의 척도로 활용</li>
                        <li>- 품목들에 대한 정보와 관심있게 둘러본 품목을 추적하여 개인 맞춤 서비스 제공</li>
                      </ul>
                    </li>
                    <li>다. 비바샘의 쿠키(cookie) 운용
                      <p>쿠키는 고객의 컴퓨터는 식별하지만 고객을 개인적으로 식별하지는 않습니다. 또한 고객은 웹브라우저에 설정을 통해 모든 쿠키를 허용/거부하거나, 쿠키를 저장될 때마다 확인을 거치도록 할 수 있습니다. 쿠키 설정거부 방법은 다음과 같습니다.<br />(Internet Explorer 기준) 웹브라우저 [도구] 메뉴 [인터넷 옵션] 선택 &gt; [개인정보] 탭을 선택 &gt; [고급]에서 원하는 옵션 선택</p>
                    </li>
                  </ul>
                </dd>
                <dt id="a4">4. 개인정보의 보유·이용기간 및 파기</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보를 고지 및 동의 받은 기간 동안 보유 및 이용합니다. 개인정보의 수집 및 이용목적 달성, 보유기간 만료, 회원의 수집 및 이용 동의 철회 시 수집된 개인정보는 열람하거나 이용할 수 없도록 파기 처리합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련법령의 규정에 의하여 다음과 같이 거래 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할 필요가 있을 경우에는 그 기간 동안 보유합니다.
                      <ul>
                        <li>1) 전자상거래 등에서의 소비자보호에 관한 법률 제6조
                          <ul className="list_hyp">
                            <li>- 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                            <li>- 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                            <li>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                          </ul>
                        </li>
                        <li>2) 통신비밀보호법
                          <ul className="list_hyp">
                            <li>- 인터넷 로그기록자료, 접속지 추적자료 : 3개월</li>
                          </ul>
                        </li>
                        <li>3) 기타 관련 법령 등<br />
                          <p className="comment type02">※ 그 외 정보통신망법 제50조(영리목적의 광고성 정보 전송 제한) 준수 이력을 증빙하기 위하여 e메일, 문자와 관련된 개인정보를 1년간 보관할 수 있습니다. 이 경우 탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</p>
                        </li>
                      </ul>
                    </li>
                    <li>나. 정보 파기방법은 아래와 같습니다.
                      <ul>
                        <li>1) 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>2) 전자적 파일형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                    <li>다. 개인정보 유효기간 제도
                      <ul>
                        <li>1) 비바샘 장기간 서비스 미이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의 개인정보를 다른 이용자의 정보와 분리하여 저장, 관리합니다.</li>
                        <li>2) 미이용의 기간은 로그인, 상담원 접촉일자 등으로 산정하며 법령에서 정의한 기간 동안 서비스 미이용자에 대하여 분리, 저장관리합니다.</li>
                        <li>3) 비바샘은 미이용자 개인정보 분리/저장시점 도래 1개월 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>라. 회원에서 탈퇴한 후 회원 재가입, 임의해지 등을 반복적으로 행하여 할인쿠폰, 이벤트 혜택 등으로 경제상의 이익을 취하거나 이 과정에서 명의를 무단으로 사용하는 편법과 불법행위를 하는 회원을 차단 하고자 비바샘의 홈페이지 회원 탈퇴 후 6개월 동안 회원의 이름, 아이디(ID), 로그기록, 접속아이피(IP) 등을 보관합니다.</li>
                  </ul>
                </dd>
                <dt id="a5">5. 수집한 개인정보의 이용 및 제3자 제공</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보 처리방침」의 「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이 범위를 초과하여 이용하거나 타인 또는 다른 기업 · 기관에 제공하지 않습니다. 단, 고객의 동의가 있거나 법령에 의하여 정해진 절차에 따라 정보를 요청받은 경우는 예외로 하며, 이 경우 주의를 기울여 개인정보를 이용 및 제공할 수 있습니다.</li>
                    <li>나. 개인정보 제3자 제공 동의
                      <table summary="개인정보 제3자 제공 동의 테이블">
                        <colgroup>
                          <col className="col16" />
                          <col className="col27" />
                          <col />
                          <col className="col25" />
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
                            <td>디지털교과서협회</td>
                            <td>교과서 출판사들의 통합 교수지원 서비스 제공</td>
                            <td className="em">성명, 아이디, 휴대전화번호, 이메일, 교사인증시작일,<br />교사인증만료일</td>
                            <td>회원 탈퇴시까지<br />또는 고객요청에 따라 개인정보 이용동의<br />철회 요청시까지</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt id="a6">6. 개인정보의 열람 및 정정</dt>
                <dd>
                  <ul>
                    <li>가. 고객님은 언제든지 등록된 고객님의 개인정보를 열람하거나 정정하실 수 있습니다. 개인정보는 『회원정보변경』을 클릭하여 직접 열람하거나 정정할 수 있으며 개인정보보호책임자 또는 담당자에게 서면이나 전화 또는 이메일(E-mail)로 열람이나 정정을 요청하시면 곧바로 조치하겠습니다.</li>
                    <li>나. 고객님이 개인정보의 오류에 대해 정정을 요청하면, 비바샘은 정정을 완료하기 전까지 해당 개인 정보를 이용하거나 제공하지 않습니다.</li>
                    <li>다. 잘못된 개인정보를 제3자에게 이미 제공했을 때에는 정정 처리결과를 제3자에게 곧바로 통지하여 정정하도록 조치하겠습니다.</li>
                  </ul>
                </dd>
                <dt id="a7">7. 개인정보의 수집,이용,제공에 대한 동의철회</dt>
                <dd>
                  <ul>
                    <li>가. 회원가입 등을 통한 개인정보의 수집, 이용, 제공과 관련해 고객님은 동의하신 내용을 언제든지 철회하실 수 있습니다. 동의철회는 홈페이지 첫 화면의 『회원정보변경』에서 "회원정보수정 내 회원탈퇴"를 클릭하면 개인정보의 수집ㆍ이용ㆍ제공에 대한 동의를 바로 철회할 수 있으며, 개인정보보호책임자에게 서면, 전화, 이메일(E-mail) 등으로 연락하시면 비바샘은 즉시 회원 탈퇴를 위해 필요한 조치를 취합니다. 동의를 철회하고 개인정보를 파기하는 등의 조치가 있으면 그 사실을 고객님께 지체없이 통지하도록 하겠습니다.</li>
                    <li>나. 비바샘은 개인정보의 수집에 대한 동의철회(회원탈퇴)를 개인정보를 수집하는 방법보다 쉽게 할 수 있도록 필요한 조치를 취합니다.</li>
                  </ul>
                </dd>
                <dt id="a8">8. 개인정보 처리 업무의 위탁</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공, 더 나은 서비스 제공, 고객편의 제공 등 원활한 업무 수행을 위하여 다음과 같이 개인정보 처리 업무를 외부전문업체에 위탁하여 운영하고 있습니다.
                      <table>
                        <colgroup>
                          <col className="col20" />
                          <col className="col25" />
                          <col />
                          <col className="col22" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>수탁자</th>
                            <th>개인정보 항목</th>
                            <th>위탁목적</th>
                            <th>보유 및 이용기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>(주)북큐브네트웍스</td>
                            <td className="em">아이디, 성명</td>
                            <td>무료 전자도서관 서비스 이용</td>
                            <td rowSpan={4}>회원 탈퇴 시<br />또는 법정 의무보유기간</td>
                          </tr>
                          <tr>
                            <td>(주)다우기술</td>
                            <td className="em">휴대전화번호</td>
                            <td>이벤트 기프티콘 경품 발송</td>
                          </tr>
                          <tr>
                            <td>롯데글로벌로지스㈜</td>
                            <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                            <td>이벤트 경품 배송</td>
                          </tr>
                          <tr>
                            <td>오케이커뮤니케이션즈</td>
                            <td className="em">휴대전화번호</td>
                            <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                    <li>나. 비바샘은 위탁업무계약서 등을 통하여 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 개인정보의 제3자 제공 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 이를 지키도록 관리하고 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a9">9. 개인정보 처리방침의 고지 또는 통지방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객이 동의한 범위를 넘어 고객의 개인정보를 이용하거나 제3자에게 제공하기 위해 고객에게서 추가적인 동의를 얻고자 할 때에는 미리 고객에게 개별적으로 서면, 이메일(E- mail), 전화 등으로 해당사항을 알립니다.</li>
                    <li>나. 타인에게 고객의 개인정보의 수집·보관·처리·이용·제공·관리·파기 등을 위탁할 때에는 그 사실을 가입화면, 서비스이용약관, 홈페이지의 개인정보 처리방침 등을 통하여 그 사실을 고객에게 고지하고 알리고 동의를 얻습니다.</li>
                    <li>다. 비바샘은 영업의 전부 또는 일부를 양도하거나 합병·상속 등으로 그 권리와 의무를 이전할 때에는 서면·이메일(E-mail) 등을 통하여 고객에게 개별적으로 알리는 동시에 해당 사실을 홈페이지 첫 화면에서 식별할 수 있도록 표기하고 30일 이상 그 사실을 공지합니다. 다만, 다만, 천재·지변이나 그 밖에 정당한 사유로 홈페이지 게시가 곤란한 경우에는  2곳 이상의 중앙일간지(고객의 대부분이 특정 지역에 거주할 때에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다)에 1 회 이상 공고하는 것으로 대신합니다.</li>
                  </ul>
                </dd>
                <dt id="a10">10. 개인정보보호를 위한 기술 및 관리적 대책</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘에서는 고객님의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고 있습니다.</li>
                    <li>나. 기술적 대책
                      <p>비바샘은 고객님의 개인정보를 처리할 때 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적 대책을 마련하여 개인정보의 안전성을 확보하고 있습니다.</p>
                      <ul className="list_hyp">
                        <li>- 고객님의 개인정보는 비밀번호(Password)로 보호되며 중요한 데이터는 파일 및 전송데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하여 중요한 데이터는 별도의 보안기능으로 보호됩니다.</li>
                        <li>- 비바샘은 백신프로그램을 이용하여 컴퓨터 바이러스의 피해를 방지하는 조치를 하고 있습니다. 백신프로그램은 주기적으로 업데이트되며 바이러스가 갑자기 출현하면 백신이 나오는 즉시 이를 제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.</li>
                        <li>- 비바샘은 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를 채택하고 있습니다.</li>
                        <li>- 해킹 등 외부침입에 대비하여 침입차단시스템과 침입방지시스템 등을 이용하여 보안에 최선을 다하고 있습니다.</li>
                      </ul>
                    </li>
                    <li>다. 관리적 대책
                      <p>비바샘은 고객님의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있으며 이에 해당하는 자는 다음과 같습니다.</p>
                      <ul>
                        <li>1) 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
                        <li>2) 개인정보보호책임자와 담당자 등 개인정보보호업무를 수행하는 자</li>
                        <li>3) 기타 업무상 개인정보의 처리가 불가피한 자</li>
                      </ul>
                      <ul className="list_hyp">
                        <li>- 비바샘은 고객의 개인정보에 대한 접근과 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고 지키도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육 등을 시행하고 있습니다.</li>
                        <li>- 전산실 등을 통제구역으로 설정하여 출입을 통제하고 있습니다.</li>
                        <li>- 비바샘은 신규로 채용된 직원에게 정보보호서약서 또는 개인정보보호서약서에 서명하게 하여 직원에 의한 정보유출을미리 방지하고 있으며, 개인정보처리방침에 대한 이행사항과 직원의 준수여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있습니다.</li>
                        <li>- 비바샘은 직원 퇴직시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된 개인정보를 훼손·침해 또는 누설하지 않도록 하고 있습니다.</li>
                        <li>- 그 밖에 내부 관리자의 실수나 기술관리 상의 사고로 고객님의 개인정보가 상실ㆍ유출ㆍ변조ㆍ훼손되면 비바샘은 즉각 고객님께 해당 사실을 알리고 적절한 대책과 보상을 마련할 것입니다.</li>
                      </ul>
                    </li>
                    <li>라. 기타 보호대책
                      <ul>
                        <li>1) 개인정보 유출 등 통지∙신고제도
                          <p>비바샘은 개인정보의 분실, 도난, 유출 사고 발생 사실을 안 때에는 지체없이 이용자에게 해당 내용을 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                        </li>
                        <li>2) 개인정보 이용내역 통지 제도
                          <ul className="list_hyp">
                            <li>- 비바샘은 이용자의 개인정보 자기결정권을 보장하기 위해 개인정보 이용내역을 해당 이용자에게 주기적으로(연 1회이상) 통지합니다.</li>
                            <li>- 통지하는 개인정보 이용내역은 다음과 같습니다.
                              <ul className="list_cir">
                                <li>• 개인정보 수집∙이용목적 및 수집한 개인정보의 항목</li>
                                <li>• 개인정보를 제공받은 자, 그 제공 목적 및 제공한 개인정보의 항목</li>
                                <li>• 개인정보 처리위탁을 받은 자 및 그 처리위탁을 하는 업무의 내용</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a11">11. 게시글 관리와 책임</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 게시물을 소중하게 생각하며 해당 게시물이 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우에는 그렇지 않습니다.
                      <ul className="list_cir">
                        <li>• 스팸(spam)성 게시물 (예 : 행운의 편지, 특정사이트에 대한 광고, 다른 사이트로의 유도 광고 및 링크 등)</li>
                        <li>• 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글</li>
                        <li>• 동의 없는 타인의 신상공개, 비바샘의 저작권, 혹은 제3자의 지적재산권 등의 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물</li>
                        <li>• 비바샘은 바람직한 게시판 문화를 활성화하기 위하여 타인의 신상을 동의 없이 공개할 때에는 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.</li>
                        <li>• 다른 주제의 게시판으로 이동할 수 있는 내용은 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.</li>
                        <li>• 그 밖의 경우에는 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>나. 근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또한 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고한 후 서비스를 이용해야 합니다.</li>
                  </ul>
                </dd>
                <dt id="a12">12. 고객의 권리와 의무</dt>
                <dd>
                  <ul>
                    <li>가. 고객님의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 부정확한 정보 입력으로 말미암아 발생하는 사고의 책임은 고객님께 있으며 타인의 정보를 무단으로 사용하는 등 허위정보를 입력하면 회원자격이 상실될 수 있습니다.</li>
                    <li>나. 고객은 개인정보를 보호받을 권리와 함께 자신을 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 지니고 있습니다. 비밀번호(Password)를 포함한 고객님의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 때에는『정보통신망 이용촉진 및 정보보호 등 에 관한 법률』등에 의해 처벌받을 수 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a13">13. 광고성 정보 전송</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 제50조에 의거, 전자우편, 휴대폰문자, 모바일앱, DM, TM 등의 채널로 영리목적의 광고성 정보를 전송할 수 있습니다.</li>
                    <li>나. 비바샘은 문서 또는 구술의 방법으로 고객에게 명시적으로 수신동의를 받아 광고성 정보를 전송합니다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 사전동의를 받지 않습니다.
                      <ul>
                        <li>1. 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 자가 해당 재화 등의 거래가 종료된 날부터 6개월 이내에 자신이 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우</li>
                        <li>2. 「방문판매 등에 관한 법률」에 따른 전화권유판매자가 육성으로 전화권유를 하는 경우</li>
                      </ul>
                    </li>
                    <li>다. 비바샘은 광고성 정보가 시작되는 부분에 광고를 의미하는 표시를 안내하고, 본문에는 전송자의 명칭 및 연락처, 그리고 수신 거부 또는 수신동의 철회의 의사를 쉽게 표시할 수 있도록 하기 위한 안내문을 명시합니다.</li>
                    <li>라. 비바샘은 고객이 광고성 정보의 수신거부, 사전 동의를 철회한 경우 영리목적의 광고성 정보를 전송하지 않습니다.</li>
                    <li>마. 비바샘은 법률에서 금지하는 재화 또는 서비스에 대한 광고성 정보를 전송하지 않습니다.</li>
                  </ul>
                </dd>
                <dt id="a14">14. 의견수렴 및 불만 처리</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 의견을 매우 소중하게 생각하며, 고객은 의문사항으로부터 언제나 성실한 답변을 받을 권리가 있습니다.</li>
                    <li>나. 비바샘은 고객과의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있습니다. 문의사항이 있으면 아래의 연락처로 문의하시기 바랍니다.
                      <p><strong>• 고객센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 연락처: 1544-7714</li>
                        <li>- 담당자 메일: vivasam@visang.com</li>
                        <li>- 고객센터 운영시간: 평일 09:00~18:00 / 점심시간 12:30~13:30</li>
                      </ul>
                    </li>
                    <li>다. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청 사이버테러 대응센터 등으로 문의하실 수 있습니다.
                      <p><strong>• 개인정보침해신고센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 118</li>
                        <li>- URL: http://privacy.kisa.or.kr</li>
                      </ul>
                      <p><strong>• 경찰청 사이버테러대응센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: 182</li>
                        <li>- URL: http://www.netan.go.kr</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a15">15. 개인정보보호책임자 및 담당자</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보보호를 매우 소중하게 생각하며, 고객의 개인정보가 훼손, 침해, 누설되지 않도록 최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의 위험성 때문에 예기치 못한 사고가 발생하여 정보가 훼손되거나 방문자가 작성한 게시물에 의해 각종 분쟁이 발생하는 것에 대해서는 책임을 지지 않습니다.</li>
                    <li>나. 비바샘의 고객센터에서는 고객의 개인정보보호 관련 문의에 신속하고 성실하게 답변을 드리도록 하고 있습니다.
                      <p>비바샘의 개인정보보호 담당자와 연락하기를 원하시면 아래의 연락처나 이메일로 문의해 주시기 바랍니다. 개인정보 관련 문의사항에 대해 신속하고 성실하게 답변해 드리겠습니다.</p>
                      <table summary="개인정보보호 책임자 및 담당자 테이블">
                        <colgroup>
                          <col />
                          <col className="col40" />
                          <col className="col40" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>구분</th>
                            <th>개인정보보호책임자</th>
                            <th>개인정보보호담당자</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>이름</th>
                            <td className="textC em">이우상 SP</td>
                            <td className="textC em">이정우 IP</td>
                          </tr>
                          <tr>
                            <th>부서</th>
                            <td className="textC em">경영지원실</td>
                            <td className="textC em">IT전략과</td>
                          </tr>
                          <tr>
                            <th>전화번호</th>
                            <td className="textC em">1544-7714</td>
                            <td className="textC em">1544-7714</td>
                          </tr>
                          <tr>
                            <th>e-mail</th>
                            <td className="textC em">privacy@visang.com</td>
                            <td className="textC em">privacy@visang.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt id="a16">16. 고지 의무</dt>
                <dd>
                  <p className="padT" style={{color: '#666"}}'}}><strong>현 개인정보 처리방침은 2017년 12월 19일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 필요하면 일반적 내용은 개정 최소 7일 전부터, 중요한 내용은 개정 최소 30일 전부터 홈페이지의 '공지'란을 통해 알릴 것입니다.</strong></p>
                  <ul className="lightFont listtopPad">
                    <li>- 개인정보 처리방침 공고일자 : 2017년 12월 19일</li>
                    <li>- 개인정보 처리방침 시행일자 : 2017년 12월 26일</li>
                  </ul>
                </dd>
              </dl>
            </div>
            <div className="privacy_ver5 hide">
              <dl>
                <dt id="a1">1. 개인정보 수집 및 이용목적</dt>
                <dd>
                  <table>
                    <colgroup>
                      <col className="col15" />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>구분</th>
                        <th>이용목적</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>회원 관리</td>
                        <td>홈페이지 가입 및 이용, 본인확인 및 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지,<br />회원에 대한 고지사항 전달, 고객센터 운영, VIP 회원 서비스 제공, 고충 처리, 분쟁 조정을 위한 기록 보존 등</td>
                      </tr>
                      <tr>
                        <td>서비스 제공<br />(교사 맞춤 서비스)</td>
                        <td>무료 전자도서관 서비스 이용, 교사참여 오프라인 행사 안내, 수업 및 평가 자료 메일링 서비스, 경품 및 기프티콘 발송, V매거진 정기구독 등</td>
                      </tr>
                      <tr>
                        <td>마케팅 및 광고</td>
                        <td>신규 서비스 및 제품 개발 안내, 이벤트 및 오프라인 행사 등 광고성 정보 전달, 인구통계학적 특성에 따른 맞춤 서비스 제공 및 홍보,<br />접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</td>
                      </tr>
                    </tbody>
                  </table>
                </dd>
                <dt id="a2">2. 개인정보 수집 항목 및 방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공을 위한 필수 정보만을 수집하고 있으며 고객 각각의 기호와 필요에 맞는 서비스를 제공하기 위하여 정보 수집 때 별도 동의를 얻고 있습니다.<br />선택 정보를 입력하지 않아도 서비스 이용에 제한은 없습니다.</li>
                    <li>나. 비바샘은 이용자의 기본적 인권을 침해할 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 미리 밝힌 목적 이외의 다른 목적으로는 사용하지 않으며 외부로 유출하지 않습니다.</li>
                    <li>다. 비바샘은 다음과 같이 개인정보를 수집하여 이용합니다.
                      <ul>
                        <li>1) 회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보
                          <table summary="회원가입 및 맞춤형 서비스 제공 등 필요시점에서 수집하는 정보 테이블">
                            <colgroup>
                              <col className="col12" />
                              <col className="col20" />
                              <col />
                              <col className="col28" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th colSpan={2}>목적</th>
                                <th>항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>회원 관리</td>
                                <td>홈페이지 가입 및 이용, 본인확인 및 회원제 서비스 제공 등</td>
                                <td className="em">아이디, 비밀번호, 성명, 이메일, 휴대전화번호, 비상교과서 채택여부,<br />아이핀CI, EPKI인증서DN, EPKI인증서SN, 생년월일, 성별, 학교급,<br />재직학교명, 담당학년</td>
                                <td rowSpan={7}>회원 탈퇴 후 파기됩니다.<br />다만 관계법령에 의해 보존할 경우 그 의무기간 동안 별도 보관되며 불,편법 행위의 방지 및 대응의 목적으로 1년 보관됩니다.</td>
                              </tr>
                              <tr>
                                <td rowSpan={5}>서비스 제공<br />(교사 맞춤 서비스)</td>
                                <td>무료 전자도서관 서비스 이용</td>
                                <td className="em">아이디, 성명</td>
                              </tr>
                              <tr>
                                <td>교사참여 오프라인 행사<br />참여 안내</td>
                                <td className="em">성명, 이메일, 휴대전화번호, 학교급, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>수업 및 평가 자료 메일링 서비스</td>
                                <td className="em">아이디, 성명, 이메일, 학교급, 재직학교명, 내 교과, 담당학년</td>
                              </tr>
                              <tr>
                                <td>경품 및 기프티콘 발송</td>
                                <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                              </tr>
                              <tr>
                                <td>V매거진 정기구독</td>
                                <td className="em">아이디, 성명, 재직학교명, 주소, 휴대전화번호</td>
                              </tr>
                              <tr>
                                <td>마케팅 및 광고</td>
                                <td>신규 서비스 및 이벤트 홍보</td>
                                <td className="em">아이디, 성명, 이메일, 휴대전화번호</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="comment">※ 비바샘은 이 외에 고객님이 이용한 서면, 문자, 게시판, 메신저 등 다양한 상담채널별 문의와 이벤트 응모시 수집 항목, 목적, 보유기간에 대한 별도 동의를 받아 개인정보를 수집할 수 있습니다.</p>
                        </li>
                        <li>2) 서비스 이용과정에서 생성되는 정보
                          <table>
                            <colgroup>
                              <col className="col6" />
                              <col className="col15" />
                              <col />
                              <col className="col32" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>구분</th>
                                <th>이용목적</th>
                                <th>수집항목</th>
                                <th>보유기간</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td rowSpan={2} className="textC">필수</td>
                                <td>본인확인</td>
                                <td className="em">본인확인값(CI)</td>
                                <td rowSpan={7}>회원 탈퇴시 또는 법정 의무 보유기간<br />※ 쿠키의 경우, 브라우저 종료시 또는 로그아웃시 만료</td>
                              </tr>
                              <tr>
                                <td>서비스 이용 통계 등</td>
                                <td className="em">IP Address, 쿠키, 방문일시, 서비스 이용기록<br />※ 모바일 서비스 이용시 모바일 기기정보(고유기기식별정보, OS버전)</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>3) 기타 법정 의무 수집 정보 등
                          <table>                          
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
                                <td className="textC">3개월</td>
                              </tr>
                              <tr>
                                <td rowSpan={3}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                                <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                                <td className="em">소비자 식별정보, 분쟁처리 기록 등</td>
                                <td className="textC">3년</td>
                              </tr>
                              <tr>
                                <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                                <td rowSpan={2} className="em">소비자 식별정보, 계약/청약철회 기록 등</td>
                                <td rowSpan={2} className="textC">5년</td>
                              </tr>
                              <tr>
                                <td>계약 또는 청약철회 등에 관한 기록</td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                      </ul>
                    </li>
                    <li>라. 개인정보 수집방법
                      <ul className="list_hyp">
                        <li>- 홈페이지, 서면양식, 상담게시판, 전화, 팩스, 이벤트응모, 배송 요청</li>
                        <li>- 로그 분석 프로그램을 통한 생성정보수집</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a3">3. 쿠키에 의한 개인정보 수집</dt>
                <dd>
                  <ul>
                    <li>가. 쿠키란?
                      <p>비바샘은 고객에 대한 정보를 저장하고 수시로 찾아내는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트가 고객의 컴퓨터 브라우저(인터넷 익스플로러 등)에 전송하는 소량의 정보입니다.</p>
                    </li>
                    <li>나. 비바샘의 쿠키 사용 목적
                      <p>비바샘은 다음과 같은 목적을 위해 쿠키를 통하여 수집된 고객의 개인정보를 사용합니다.</p>
                      <ul className="list_hyp">
                        <li>- 개인의 관심 분야에 따라 차별화된 정보를 제공</li>
                        <li>- 접속빈도 또는 방문시간 등을 분석하고 이용자의 관심분야를 파악하여 타겟(target) 마케팅 및 서비스 개선의 척도로 활용</li>
                        <li>- 품목들에 대한 정보와 관심있게 둘러본 품목을 추적하여 개인 맞춤 서비스 제공</li>
                      </ul>
                    </li>
                    <li>다. 비바샘의 쿠키(cookie) 운용
                      <p>쿠키는 고객의 컴퓨터는 식별하지만 고객을 개인적으로 식별하지는 않습니다. 또한 고객은 웹브라우저에 설정을 통해 모든 쿠키를 허용/거부하거나, 쿠키를 저장될 때마다 확인을 거치도록 할 수 있습니다. 쿠키 설정거부 방법은 다음과 같습니다.<br />(Internet Explorer 기준) 웹브라우저 [도구] 메뉴 [인터넷 옵션] 선택 &gt; [개인정보] 탭을 선택 &gt; [고급]에서 원하는 옵션 선택</p>
                    </li>
                  </ul>
                </dd>
                <dt id="a4">4. 개인정보의 보유·이용기간 및 파기</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보를 고지 및 동의 받은 기간 동안 보유 및 이용합니다. 개인정보의 수집 및 이용목적 달성, 보유기간 만료, 회원의 수집 및 이용 동의 철회 시 수집된 개인정보는 열람하거나 이용할 수 없도록 파기 처리합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련법령의 규정에 의하여 다음과 같이 거래 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할 필요가 있을 경우에는 그 기간 동안 보유합니다.
                      <ul>
                        <li>1) 전자상거래 등에서의 소비자보호에 관한 법률 제6조
                          <ul className="list_hyp">
                            <li>- 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                            <li>- 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                            <li>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                          </ul>
                        </li>
                        <li>2) 통신비밀보호법
                          <ul className="list_hyp">
                            <li>- 인터넷 로그기록자료, 접속지 추적자료 : 3개월</li>
                          </ul>
                        </li>
                        <li>3) 기타 관련 법령 등<br />
                          <p className="comment type02">※ 그 외 정보통신망법 제50조(영리목적의 광고성 정보 전송 제한) 준수 이력을 증빙하기 위하여 e메일, 문자와 관련된 개인정보를 1년간 보관할 수 있습니다. 이 경우 탈퇴회원 및 휴면회원의 발송이력은 일반 이용자의 개인정보와 별도로 보관되며, 다른 목적으로 이용하지 않습니다.</p>
                        </li>
                      </ul>
                    </li>
                    <li>나. 정보 파기방법은 아래와 같습니다.
                      <ul>
                        <li>1) 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                        <li>2) 전자적 파일형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      </ul>
                    </li>
                    <li>다. 개인정보 유효기간 제도
                      <ul>
                        <li>1) 비바샘 장기간 서비스 미이용자의 개인정보보호를 위하여 휴면회원(최근 12개월 동안 서비스를 이용하지 아니한 회원 또는 직접 유효기간을 선택한 회원)의 개인정보를 다른 이용자의 정보와 분리하여 저장, 관리합니다.</li>
                        <li>2) 미이용의 기간은 로그인, 상담원 접촉일자 등으로 산정하며 법령에서 정의한 기간 동안 서비스 미이용자에 대하여 분리, 저장관리합니다.</li>
                        <li>3) 비바샘은 미이용자 개인정보 분리/저장시점 도래 1개월 이전에 이메일 등을 통해 해당 이용자에게 관련내용을 공지합니다.</li>
                      </ul>
                    </li>
                    <li>라. 회원에서 탈퇴한 후 회원 재가입, 임의해지 등을 반복적으로 행하여 할인쿠폰, 이벤트 혜택 등으로 경제상의 이익을 취하거나 이 과정에서 명의를 무단으로 사용하는 편법과 불법행위를 하는 회원을 차단 하고자 비바샘의 홈페이지 회원 탈퇴 후 6개월 동안 회원의 이름, 아이디(ID), 로그기록, 접속아이피(IP) 등을 보관합니다.</li>
                  </ul>
                </dd>
                <dt id="a5">5. 수집한 개인정보의 이용 및 제3자 제공</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객님의 개인정보를 가입신청서, 이용약관, 「개인정보 처리방침」의 「개인정보의 수집 및 이용목적」에서 알린 범위 내에서 사용하며, 이 범위를 초과하여 이용하거나 타인 또는 다른 기업 · 기관에 제공하지 않습니다. 단, 고객의 동의가 있거나 법령에 의하여 정해진 절차에 따라 정보를 요청받은 경우는 예외로 하며, 이 경우 주의를 기울여 개인정보를 이용 및 제공할 수 있습니다.</li>
                    <li>나. 개인정보 제3자 제공 동의
                      <table>
                        <colgroup>
                          <col className="col16" />
                          <col className="col27" />
                          <col />
                          <col className="col25" />
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
                            <td>디지털교과서협회</td>
                            <td>교과서 출판사들의 통합 교수지원 서비스 제공</td>
                            <td className="em">성명, 아이디, 휴대전화번호, 이메일, 교사인증시작일,<br />교사인증만료일</td>
                            <td>회원 탈퇴시까지<br />또는 고객요청에 따라 개인정보 이용동의<br />철회 요청시까지</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt id="a6">6. 개인정보의 열람 및 정정</dt>
                <dd>
                  <ul>
                    <li>가. 고객님은 언제든지 등록된 고객님의 개인정보를 열람하거나 정정하실 수 있습니다. 개인정보는 『회원정보변경』을 클릭하여 직접 열람하거나 정정할 수 있으며 개인정보보호책임자 또는 담당자에게 서면이나 전화 또는 이메일(E-mail)로 열람이나 정정을 요청하시면 곧바로 조치하겠습니다.</li>
                    <li>나. 고객님이 개인정보의 오류에 대해 정정을 요청하면, 비바샘은 정정을 완료하기 전까지 해당 개인 정보를 이용하거나 제공하지 않습니다.</li>
                    <li>다. 잘못된 개인정보를 제3자에게 이미 제공했을 때에는 정정 처리결과를 제3자에게 곧바로 통지하여 정정하도록 조치하겠습니다.</li>
                  </ul>
                </dd>
                <dt id="a7">7. 개인정보의 수집,이용,제공에 대한 동의철회</dt>
                <dd>
                  <ul>
                    <li>가. 회원가입 등을 통한 개인정보의 수집, 이용, 제공과 관련해 고객님은 동의하신 내용을 언제든지 철회하실 수 있습니다. 동의철회는 홈페이지 첫 화면의 『회원정보변경』에서 "회원정보수정 내 회원탈퇴"를 클릭하면 개인정보의 수집ㆍ이용ㆍ제공에 대한 동의를 바로 철회할 수 있으며, 개인정보보호책임자에게 서면, 전화, 이메일(E-mail) 등으로 연락하시면 비바샘은 즉시 회원 탈퇴를 위해 필요한 조치를 취합니다. 동의를 철회하고 개인정보를 파기하는 등의 조치가 있으면 그 사실을 고객님께 지체없이 통지하도록 하겠습니다.</li>
                    <li>나. 비바샘은 개인정보의 수집에 대한 동의철회(회원탈퇴)를 개인정보를 수집하는 방법보다 쉽게 할 수 있도록 필요한 조치를 취합니다.</li>
                  </ul>
                </dd>
                <dt id="a8">8. 개인정보 처리 업무의 위탁</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 기본적인 서비스 제공, 더 나은 서비스 제공, 고객편의 제공 등 원활한 업무 수행을 위하여 다음과 같이 개인정보 처리 업무를 외부전문업체에 위탁하여 운영하고 있습니다.
                      <table>
                        <colgroup>
                          <col className="col20" />
                          <col className="col25" />
                          <col />
                          <col className="col22" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>수탁자</th>
                            <th>개인정보 항목</th>
                            <th>위탁목적</th>
                            <th>보유 및 이용기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>(주)북큐브네트웍스</td>
                            <td className="em">아이디, 성명</td>
                            <td>무료 전자도서관 서비스 이용</td>
                            <td rowSpan={4}>회원 탈퇴 시<br />또는 법정 의무보유기간</td>
                          </tr>
                          <tr>
                            <td>(주)다우기술</td>
                            <td className="em">휴대전화번호</td>
                            <td>이벤트 기프티콘 경품 발송</td>
                          </tr>
                          <tr>
                            <td>현대로지스틱스㈜</td>
                            <td className="em">성명, 휴대전화번호, 주소, 재직학교명</td>
                            <td>이벤트 경품 배송</td>
                          </tr>
                          <tr>
                            <td>오케이커뮤니케이션즈</td>
                            <td className="em">휴대전화번호</td>
                            <td>SMS 문자 내 수신거부 080 호스팅 제공</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                    <li>나. 비바샘은 위탁업무계약서 등을 통하여 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 개인정보의 제3자 제공 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 이를 지키도록 관리하고 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a9">9. 개인정보 처리방침의 고지 또는 통지방법</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객이 동의한 범위를 넘어 고객의 개인정보를 이용하거나 제3자에게 제공하기 위해 고객에게서 추가적인 동의를 얻고자 할 때에는 미리 고객에게 개별적으로 서면, 이메일(E- mail), 전화 등으로 해당사항을 알립니다.</li>
                    <li>나. 타인에게 고객의 개인정보의 수집·보관·처리·이용·제공·관리·파기 등을 위탁할 때에는 그 사실을 가입화면, 서비스이용약관, 홈페이지의 개인정보 처리방침 등을 통하여 그 사실을 고객에게 고지하고 알리고 동의를 얻습니다.</li>
                    <li>다. 비바샘은 영업의 전부 또는 일부를 양도하거나 합병·상속 등으로 그 권리와 의무를 이전할 때에는 서면·이메일(E-mail) 등을 통하여 고객에게 개별적으로 알리는 동시에 해당 사실을 홈페이지 첫 화면에서 식별할 수 있도록 표기하고 30일 이상 그 사실을 공지합니다. 다만, 다만, 천재·지변이나 그 밖에 정당한 사유로 홈페이지 게시가 곤란한 경우에는  2곳 이상의 중앙일간지(고객의 대부분이 특정 지역에 거주할 때에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다)에 1 회 이상 공고하는 것으로 대신합니다.</li>
                  </ul>
                </dd>
                <dt id="a10">10. 개인정보보호를 위한 기술 및 관리적 대책</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘에서는 고객님의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고 있습니다.</li>
                    <li>나. 기술적 대책
                      <p>비바샘은 고객님의 개인정보를 처리할 때 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적 대책을 마련하여 개인정보의 안전성을 확보하고 있습니다.</p>
                      <ul className="list_hyp">
                        <li>- 고객님의 개인정보는 비밀번호(Password)로 보호되며 중요한 데이터는 파일 및 전송데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하여 중요한 데이터는 별도의 보안기능으로 보호됩니다.</li>
                        <li>- 비바샘은 백신프로그램을 이용하여 컴퓨터 바이러스의 피해를 방지하는 조치를 하고 있습니다. 백신프로그램은 주기적으로 업데이트되며 바이러스가 갑자기 출현하면 백신이 나오는 즉시 이를 제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.</li>
                        <li>- 비바샘은 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를 채택하고 있습니다.</li>
                        <li>- 해킹 등 외부침입에 대비하여 침입차단시스템과 침입방지시스템 등을 이용하여 보안에 최선을 다하고 있습니다.</li>
                      </ul>
                    </li>
                    <li>다. 관리적 대책
                      <p>비바샘은 고객님의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있으며 이에 해당하는 자는 다음과 같습니다.</p>
                      <ul>
                        <li>1) 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
                        <li>2) 개인정보보호책임자와 담당자 등 개인정보보호업무를 수행하는 자</li>
                        <li>3) 기타 업무상 개인정보의 처리가 불가피한 자</li>
                      </ul>
                      <ul className="list_hyp">
                        <li>- 비바샘은 고객의 개인정보에 대한 접근과 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고 지키도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육 등을 시행하고 있습니다.</li>
                        <li>- 전산실 등을 통제구역으로 설정하여 출입을 통제하고 있습니다.</li>
                        <li>- 비바샘은 신규로 채용된 직원에게 정보보호서약서 또는 개인정보보호서약서에 서명하게 하여 직원에 의한 정보유출을미리 방지하고 있으며, 개인정보처리방침에 대한 이행사항과 직원의 준수여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있습니다.</li>
                        <li>- 비바샘은 직원 퇴직시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된 개인정보를 훼손·침해 또는 누설하지 않도록 하고 있습니다.</li>
                        <li>- 그 밖에 내부 관리자의 실수나 기술관리 상의 사고로 고객님의 개인정보가 상실ㆍ유출ㆍ변조ㆍ훼손되면 비바샘은 즉각 고객님께 해당 사실을 알리고 적절한 대책과 보상을 마련할 것입니다.</li>
                      </ul>
                    </li>
                    <li>라. 기타 보호대책
                      <ul>
                        <li>1) 개인정보 유출 등 통지∙신고제도
                          <p>비바샘은 개인정보의 분실, 도난, 유출 사고 발생 사실을 안 때에는 지체없이 이용자에게 해당 내용을 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                        </li>
                        <li>2) 개인정보 이용내역 통지 제도
                          <ul className="list_hyp">
                            <li>- 비바샘은 이용자의 개인정보 자기결정권을 보장하기 위해 개인정보 이용내역을 해당 이용자에게 주기적으로(연 1회이상) 통지합니다.</li>
                            <li>- 통지하는 개인정보 이용내역은 다음과 같습니다.
                              <ul className="list_cir">
                                <li>• 개인정보 수집∙이용목적 및 수집한 개인정보의 항목</li>
                                <li>• 개인정보를 제공받은 자, 그 제공 목적 및 제공한 개인정보의 항목</li>
                                <li>• 개인정보 처리위탁을 받은 자 및 그 처리위탁을 하는 업무의 내용</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a11">11. 게시글 관리와 책임</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 게시물을 소중하게 생각하며 해당 게시물이 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우에는 그렇지 않습니다.
                      <ul className="list_cir">
                        <li>• 스팸(spam)성 게시물 (예 : 행운의 편지, 특정사이트에 대한 광고, 다른 사이트로의 유도 광고 및 링크 등)</li>
                        <li>• 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글</li>
                        <li>• 동의 없는 타인의 신상공개, 비바샘의 저작권, 혹은 제3자의 지적재산권 등의 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물</li>
                        <li>• 비바샘은 바람직한 게시판 문화를 활성화하기 위하여 타인의 신상을 동의 없이 공개할 때에는 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.</li>
                        <li>• 다른 주제의 게시판으로 이동할 수 있는 내용은 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.</li>
                        <li>• 그 밖의 경우에는 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.</li>
                      </ul>
                    </li>
                    <li>나. 근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또한 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고한 후 서비스를 이용해야 합니다.</li>
                  </ul>
                </dd>
                <dt id="a12">12. 고객의 권리와 의무</dt>
                <dd>
                  <ul>
                    <li>가. 고객님의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 부정확한 정보 입력으로 말미암아 발생하는 사고의 책임은 고객님께 있으며 타인의 정보를 무단으로 사용하는 등 허위정보를 입력하면 회원자격이 상실될 수 있습니다.</li>
                    <li>나. 고객은 개인정보를 보호받을 권리와 함께 자신을 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 지니고 있습니다. 비밀번호(Password)를 포함한 고객님의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 때에는『정보통신망 이용촉진 및 정보보호 등 에 관한 법률』등에 의해 처벌받을 수 있습니다.</li>
                  </ul>
                </dd>
                <dt id="a13">13. 광고성 정보 전송</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 제50조에 의거, 전자우편, 휴대폰문자, 모바일앱, DM, TM 등의 채널로 영리목적의 광고성 정보를 전송할 수 있습니다.</li>
                    <li>나. 비바샘은 문서 또는 구술의 방법으로 고객에게 명시적으로 수신동의를 받아 광고성 정보를 전송합니다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 사전동의를 받지 않습니다.
                      <ul>
                        <li>1. 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 자가 해당 재화 등의 거래가 종료된 날부터 6개월 이내에 자신이 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우</li>
                        <li>2. 「방문판매 등에 관한 법률」에 따른 전화권유판매자가 육성으로 전화권유를 하는 경우</li>
                      </ul>
                    </li>
                    <li>다. 비바샘은 광고성 정보가 시작되는 부분에 광고를 의미하는 표시를 안내하고, 본문에는 전송자의 명칭 및 연락처, 그리고 수신 거부 또는 수신동의 철회의 의사를 쉽게 표시할 수 있도록 하기 위한 안내문을 명시합니다.</li>
                    <li>라. 비바샘은 고객이 광고성 정보의 수신거부, 사전 동의를 철회한 경우 영리목적의 광고성 정보를 전송하지 않습니다.</li>
                    <li>마. 비바샘은 법률에서 금지하는 재화 또는 서비스에 대한 광고성 정보를 전송하지 않습니다.</li>
                  </ul>
                </dd>
                <dt id="a14">14. 의견수렴 및 불만 처리</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 의견을 매우 소중하게 생각하며, 고객은 의문사항으로부터 언제나 성실한 답변을 받을 권리가 있습니다.</li>
                    <li>나. 비바샘은 고객과의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있습니다. 문의사항이 있으면 아래의 연락처로 문의하시기 바랍니다.
                      <p><strong>• 고객센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 연락처: 1544-7714</li>
                        <li>- 담당자 메일: vivasam@visang.com</li>
                        <li>- 고객센터 운영시간: 평일 09:00~18:00 / 점심시간 12:30~13:30</li>
                      </ul>
                    </li>
                    <li>다. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청 사이버테러 대응센터 등으로 문의하실 수 있습니다.
                      <p><strong>• 개인정보침해신고센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: (국번없이) 118</li>
                        <li>- URL: http://privacy.kisa.or.kr</li>
                      </ul>
                      <p><strong>• 경찰청 사이버테러대응센터</strong></p>
                      <ul className="list_hyp type02">
                        <li>- 전화: 182</li>
                        <li>- URL: http://www.netan.go.kr</li>
                      </ul>
                    </li>
                  </ul>
                </dd>
                <dt id="a15">15. 개인정보보호책임자 및 담당자</dt>
                <dd>
                  <ul>
                    <li>가. 비바샘은 고객의 개인정보보호를 매우 소중하게 생각하며, 고객의 개인정보가 훼손, 침해, 누설되지 않도록 최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의 위험성 때문에 예기치 못한 사고가 발생하여 정보가 훼손되거나 방문자가 작성한 게시물에 의해 각종 분쟁이 발생하는 것에 대해서는 책임을 지지 않습니다.</li>
                    <li>나. 비바샘의 고객센터에서는 고객의 개인정보보호 관련 문의에 신속하고 성실하게 답변을 드리도록 하고 있습니다.
                      <p>비바샘의 개인정보보호 담당자와 연락하기를 원하시면 아래의 연락처나 이메일로 문의해 주시기 바랍니다. 개인정보 관련 문의사항에 대해 신속하고 성실하게 답변해 드리겠습니다.</p>
                      <table summary="개인정보보호 책임자 및 담당자 테이블">
                        <colgroup>
                          <col />
                          <col className="col40" />
                          <col className="col40" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>구분</th>
                            <th>개인정보보호책임자</th>
                            <th>개인정보보호담당자</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>이름</th>
                            <td className="textC em">최성기 SP</td>
                            <td className="textC em">이정우 IP</td>
                          </tr>
                          <tr>
                            <th>부서</th>
                            <td className="textC em">미래전략실</td>
                            <td className="textC em">IT전략과</td>
                          </tr>
                          <tr>
                            <th>전화번호</th>
                            <td className="textC em">02-6970-6005</td>
                            <td className="textC em">02-6970-6072</td>
                          </tr>
                          <tr>
                            <th>e-mail</th>
                            <td className="textC em">choisk2@visang.com</td>
                            <td className="textC em">leejw5@visang.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </dd>
                <dt id="a16">16. 고지 의무</dt>
                <dd>
                  <p className="padT" style={{color: '#666"}}'}}><strong>현 개인정보 처리방침은 2016년 12월 1일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 필요하면 일반적 내용은 개정 최소 7일 전부터, 중요한 내용은 개정 최소 30일 전부터 홈페이지의 '공지'란을 통해 알릴 것입니다.</strong></p>
                  <ul className="lightFont listtopPad">
                    <li>- 개인정보 처리방침 공고일자 : 2016년 12월 1일</li>
                    <li>- 개인정보 처리방침 시행일자 : 2016년 12월 9일</li>
                  </ul>
                </dd>
              </dl>
            </div>
            <div className="privacy_ver4 hide">
              <div className="privacyDetails" style={{padding: '20px"}}'}}>
                <h2>(주)비상교육 비바샘 개인정보취급방침</h2>
                <p>(주)비상교육 비바샘(www.vivasam.com, 이하 '회사'라 함)은 이용자 개인 정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 정보통신서비스제공자가 준수해야 할 관련 법령상의 개인정보보호 규정을 준수하여 관련법령에 의거한 개인정보취급방침을 정하고 이용자 권익 보호에 최선을 다하고 있습니다.</p>
                <p style={{paddingBottom: '60px"}}'}}>회사는 개인정보취급방침을 통하여 이용자가 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다. 회사의 개인정보취급방침은 정부의 법률 및 지침변경이나 회사 내부의 방침변경 등으로 인하여 변경될 수 있으며, 개인정보취급방침을 개정할 경우 홈페이지에 게시하여 개정된 사항을 쉽게 알아볼 수 있도록 하고 있습니다. </p>
                <dl>
                  <dt><a name="first" />1. 수집하는 개인정보의 항목</dt>
                  <dd>
                    <ul>
                      <li>
                        1) 홈페이지 관리 및 서비스 제공
                        <ul>
                          <li>1-1) 홈페이지 회원가입 및 관리
                            <ul>
                              <li>아이디, 비밀번호, 성명, 이메일, 재직학교명, 휴대전화번호, 성별, 주소, 생년월일, 학교급, 담당학년, 비상교과서 채택여부</li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>2) 회원자격 유지∙관리, 서비스 부정이용 방지, 각종 고지∙통지, 고충처리, 분쟁 조정을 위한 기록 보존
                        <ul>
                          <li>서비스 이용과정이나 사업처리 과정에서 활용되는 IP주소, 접속 로그, 쿠키, MAC주소, PC고유번호, 서비스 이용기록, 방문기록, 불량 이용기록	</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="second" />2. 개인정보의 수집 및 이용 목적</dt>
                  <dd>
                    <p>회사는 다음의 목적을 위하여 개인정보를 수집 및 이용합니다. 수집한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 경우에는 별도의 동의를 받는 등 필요한 조치를 이행하고 있습니다.</p>
                    <ul>
                      <li>1) 홈페이지 회원가입 및 관리
                        <ul>
                          <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별∙인증, 회원자격 유지∙관리, 서비스 부정이용 방지, 각종 고지∙통지, 고충처리, 분쟁 조정을 위한 기록 보존 등</li>
                        </ul>
                      </li>
                      <li>2) 재화 또는 서비스 제공
                        <ul>
                          <li>물품배송, 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증 등</li>
                        </ul>
                      </li>
                      <li>3) 마케팅 및 광고에 활용
                        <ul>
                          <li>신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
                        </ul>
                      </li>
                      <li>4) 고충처리
                        <ul>
                          <li>민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락, 통지, 처리결과 통보 등</li>
                        </ul>
                      </li>
                      <li>5) 기타
                        <ul>
                          <li>가입횟수 제한, 분쟁조정을 위한 기록보존, 회원의 각종 통계자료 산출</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="third" />3. 개인정보의 보유 및 이용기간</dt>
                  <dd>
                    <p>회사는 법령에 따른 개인정보 이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유 이용기간 내에서 개인정보를 보유 및 이용합니다. 각각의 개인정보 보유 및 이용기간은 다음과 같습니다.</p>
                    <ul>
                      <li>1) 홈페이지 회원 가입 및 관리
                        <ul>
                          <li>홈페이지 탈퇴 시까지 다만, 법령 위반에 따른 수사, 조사 등이 진행중인 경우에는 해당 수사, 조사 종료 시까지</li>
                        </ul>
                      </li>
                      <li>2)「통신비밀보호법」제41조에 따른 통신사실확인자료 보관
                        <ul>
                          <li>2-1) 가입자 전기통신 일시, 개시․종료시간, 상대방 가입자번호, 사용도수, 발신기지국 위치추적자료: 1년</li>
                          <li>2-2) 컴퓨터통신, 인터넷 로그기록자료, 접속지 추적자료: 3개월</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="fourth" />4. 개인정보의 제3자 제공</dt>
                  <dd>
                    <p>회사는 이용자의 개인정보를 제2조(개인정보의 수집 및 이용목적)에서 명시한 범위 내에서만 처리하며, 동 범위를 초과하여 개인정보를 이용하거나 제3자에게 제공∙공개하지 않습니다.</p>
                    <table>
                      <colgroup>
                        <col className="col25" />
                        <col className="col25" />
                        <col className="col25" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>개인정보를 제공받는 자</th>
                          <th>제공받는 자의 개인정보 이용목적</th>
                          <th>제공하는 개인정보의 항목</th>
                          <th>제공받은 개인정보의 보유 및 이용기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="cell_align">디지털교과서협회</td>
                          <td className="cell_align">교과서 출판사들의 <br />통합 교수지원 서비스 제공</td>
                          <td className="cell_align">성명, 아이디, 휴대전화번호, 이메일, <br />교사인증시작일, 교사인증만료일</td>
                          <td className="cell_align">회원탈퇴시까지</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>다만, 관련 법령상 규정이 있는 경우에는 예외로 합니다.</p>
                  </dd>
                  <dt><a name="fifth" />5. 개인정보의 취급위탁</dt>
                  <dd>
                    <p>회사는 원활한 서비스 이행을 위해 다음과 같이 개인정보 처리를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.</p>
                    <table>
                      <colgroup>
                        <col className="col25" />
                        <col className="col25" />
                        <col className="col25" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>수탁자</th>
                          <th>개인정보를 위탁하는 목적</th>
                          <th>위탁 항목</th>
                          <th>위탁기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="cell_align">(주)LG U+</td>
                          <td className="cell_align">학습동영상 및 콘텐츠 서버 관련</td>
                          <td className="cell_align">인증여부</td>
                          <td className="cell_align">회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="cell_align">㈜북큐브네트웍스</td>
                          <td className="cell_align">무료 전자도서관 서비스 제공</td>
                          <td className="cell_align">아이디, 성명</td>
                          <td className="cell_align">회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="cell_align">㈜다우기술</td>
                          <td className="cell_align">이벤트 기프티콘 경품 발송</td>
                          <td className="cell_align">휴대전화번호</td>
                          <td className="cell_align">회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td className="cell_align">㈜현대로지스틱스</td>
                          <td className="cell_align">이벤트 경품 발송</td>
                          <td className="cell_align">성명, 휴대전화번호, 주소</td>
                          <td className="cell_align">회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>- 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 본 개인정보취급방침을 통하여 공개하고 있습니다.</p>
                  </dd>
                  <dt><a name="sixth" />6. 이용자의 권리∙의무 및 그 행사방법에 관한 사항</dt>
                  <dd>
                    <ul className="lightFont">
                      <li>1) 이용자는 회사에 대해 언제든지 회사가 처리하는 자신의 개인정보에 대한 열람, 정정∙삭제 및 처리정지를 요구하는 등 개인정보 보호 관련 권리를 행사할 수 있습니다. 다만, 관련 법령상 규정이 있는 경우에는 회사는 위와 같은 요구를 거절하거나 제한할 수 있습니다.</li>
                      <li>2) 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 할 수 있으며 회사는 이에 대해 지체 없이 조치합니다.</li>
                      <li>3) 이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
                      <li>4) 제1항에 따른 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 할 수 있으며, 이 경우 위임장을 제출해야 합니다.</li>
                    </ul>
                  </dd>
                  <dt><a name="seventh" />7. 개인정보의 파기절차 및 파기방법</dt>
                  <dd>
                    <p>회사는 개인정보 보유기간의 경과, 수집 및 이용목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                    <p>이용자로부터 동의 받은 개인정보 보유기간이 경과하거나 수집 및 이용목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.</p>
                    <p>개인정보의 파기 절차 및 방법은 다음과 같습니다.</p>
                    <ul>
                      <li>1) 파기절차
                        <ul>
                          <li>회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 관리책임자의 승인을 받아 개인정보를 파기합니다. </li>
                        </ul>
                      </li>
                      <li>2) 파기방법
                        <ul>
                          <li>회사는 전자적 파일 형태로 기록∙저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록∙저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="eighth" />8. 개인정보의 안전성 확보조치에 관한 사항</dt>
                  <dd>
                    <p>회사는 개인정보의 안전성 확보에 필요한 관리적, 기술적, 물리적 조치를 하고 있습니다.</p>
                    <ul>
                      <li>1) 관리적 조치
                        <ul>
                          <li>1-1) 내부관리계획의 수립 및 시행: 개인정보의 안전한 처리를 위하여 내부관리계획을 수립, 시행하고 있습니다. </li>
                          <li>1-2) 개인정보 취급 직원의 최소화 및 교육: 회사의 개인정보 취급 직원은 담당자에 한정시키고 이를 위한 별도의 비밀번호를 부여하여 정기적으로 갱신하고 있으며, 담당자에 대한 수시 교육을 통하여 개인정보 취급방침의 준수를 항상 강조하고 있습니다.</li>
                        </ul>
                      </li>
                      <li>2) 기술적 조치
                        <ul>
                          <li>2-1) 해킹 등에 대비한 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신∙점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적, 물리적으로 감시 및 차단하고 있습니다.</li>
                          <li>2-2) 비밀번호 암호화: 이용자 아이디의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다. </li>
                        </ul>
                      </li>
                      <li>3) 물리적 조치
                        <ul>
                          <li>3-1) 문서보안을 위한 잠금 장치 사용: 개인정보가 포함된 서류, 보조저장매체 등을 잠금 장치가 있는 안전한 장소에 보관하고 있습니다. </li>
                          <li>3-2) 비 인가자에 대한 출입 통제: 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="nineth" />9. 개인정보의 자동 수집 장치의 설치∙운영 및 그 거부에 관한 사항</dt>
                  <dd>
                    <p>회사는 이용자의 정보를 수시로 저장하고 찾아내는 쿠키(cookie) 등 개인정보를 자동으로 수집하는 장치를 설치, 운용합니다. 쿠키(cookie)란, 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키 등을 사용합니다.</p>
                    <ul>
                      <li>1) 쿠키의 사용 목적
                        <ul>
                          <li>회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타깃 마케팅 및 개인 맞춤 서비스 제공</li>
                        </ul>
                      </li>
                      <li>2) 쿠키의 설치/운영 및 거부
                        <ul>
                          <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
                        </ul>
                      </li>
                      <li>3) 쿠키설정 거부 방법
                        <ul>
                          <li>쿠키 설정을 거부하는 방법으로는 회원님이 사용하는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</li>
                          <li>* 설정방법 예(인터넷 익스플로어의 경우): 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보</li>
                          <li>단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="tenth" />10. 개인정보 관리책임자에 관한 사항</dt>
                  <dd>
                    <ul className="lightFont lightPad">
                      <li>1) 회사는 이용자의 개인정보를 보호하고, 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 수집 및 이용 등에 관한 업무를 총괄해서 책임지는 개인정보 관리책임자를 지정하고 있습니다.
                        <ul className="dePartment">
                          <li>▶ 개인정보 관리책임자</li>
                          <li>책임자: 미래전략실 최성기 SP</li>
                          <li>전화번호: 02-6970-6005</li>
                        </ul>
                        <ul className="dePartment">
                          <li>▶ 개인정보 관리 담당부서</li>
                          <li>부서명: 미래전략실 IT전략과</li>
                          <li>담당자: 이 정 우 IP</li>
                          <li>전화번호: 02-6970-6072</li>
                          <li>이메일: leejw5@visang.com</li>
                        </ul>
                      </li>
                      <li>2) 이용자는 회사의 서비스를 이용하며 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 관리책임자 및 담당부서로 문의하실 수 있습니다. 회사는 이용자의 문의에 대해 지체없이 답변 및 처리해드리고 있습니다.</li>
                      <li>3) 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
                        <ul className="externalLink">
                          <li>- 개인정보침해신고센터(http://privacy.kisa.or.kr / 국번없이 118)</li>
                          <li>- 개인정보분쟁조정위원회 (http://www.kopico.or.kr / 02-405-5150)</li>
                          <li>- 대검찰청 사이버범죄 수사단(http://www.spo.go.kr / 국번없이 1301)</li>
                          <li>- 경찰청 사이버안전국 (http://www.ctrc.go.kr / 02-3150-2659, 국번없이 182)</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <dt><a name="eleventh" />11. 개인정보 취급방침의 변경에 관한 사항</dt>
                  <dd>
                    <p>현 개인정보취급방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다. 다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.</p>
                    <ul className="lightFont listtopPad">
                      <li>- 개인정보취급방침 공고일자: 2015년 11월 24일</li>
                      <li>- 개인정보취급방침 시행일자: 2015년 12월 1일</li>
                    </ul>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="privacy_ver3 hide">
              <div className="privacyDetails">
                <h2>(주)비상교육 비바샘 개인정보취급방침</h2>
                <p>(주)비상교육 비바샘(www.vivasam.com, 이하 '회사'라 함)은 이용자 개인 정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을 준수하여 관련법령에 의거한 개인정보 취급방침을 정하고 이용자 권익 보호에 최선을 다하고 있습니다.</p>
                <p style={{paddingBottom: '60px"}}'}}>회사는 개인정보취급방침을 통하여 이용자가 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다. 회사의 개인정보취급방침은 정부의 법률 및 지침변경이나 회사 내부의 방침변경 등으로 인하여 변경될 수 있으며, 개인정보취급방침을 개정할 경우 홈페이지에 게시하여 개정된 사항을 쉽게 알아볼 수 있도록 하고 있습니다. </p>
                <dl>
                  <a name="first" />
                  <dt>1. 수집하는 개인정보의 항목 및 수집방법</dt>
                  <dd>
                    <ul>
                      <li>
                        1) 수집하는 개인정보 항목
                        <ul>
                          <li>1-1) 홈페이지 회원가입 및 관리
                            <ul>
                              <li>- 필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 학교구분, 휴대전화번호, 성별, 주소, 생년월일, 학교급, 담당학년</li>
                              <li>- 선택항목: 비상교과서 채택여부, 사용 교과서 정보</li>
                            </ul>
                          </li>
                          <li>1-2) 재화 또는 서비스 제공
                            <ul>
                              <li>- 필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 학교구분, 휴대전화번호, 성별, 주소, 생년월일, 학교급, 담당학년</li>
                              <li>- 선택항목: 비상교과서 채택여부, 사용 교과서 정보</li>
                            </ul>
                          </li>
                          <li>1-3) 마케팅, 광고, 홍보 목적
                            <ul>
                              <li>- 선택항목: 이메일, 휴대전화번호</li>
                            </ul>
                          </li>
                          <li>1-4) 기타
                            <ul>
                              <li>인터넷 서비스 이용과정이나 사업처리 과정에서 활용되는 IP주소, 접속 로그, 쿠키, MAC주소, PC고유번호, 서비스 이용기록, 방문기록, 불량 이용기록 등과 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.</li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>2) 개인정보 수집방법
                        <ul>
                          <li>홈페이지(회원가입, 상담게시판, 공개게시판, 기타 개인정보를 바탕으로 하는 서비스 이용 등), 서면양식, 전화/팩스를 통한 회원가입, 경품행사 응모, 배송 요청, 제휴사로부터의 제공, 생성정보 수집 툴을 통한 수집</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="second" />
                  <dt>2. 개인정보의 수집 및 이용 목적</dt>
                  <dd>
                    <p>회사는 다음의 목적을 위하여 개인정보를 수집 및 이용합니다. 수집한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 경우에는 별도의 동의를 받는 등 필요한 조치를 이행하고 있습니다.</p>
                    <ul>
                      <li>1) 홈페이지 회원가입 및 관리
                        <ul>
                          <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별∙인증, 회원자격 유지∙관리, 서비스 부정이용 방지, 각종 고지∙통지, 고충처리, 분쟁 조정을 위한 기록 보존 등</li>
                        </ul>
                      </li>
                      <li>2) 재화 또는 서비스 제공
                        <ul>
                          <li>물품배송, 서비스 제공, 계약서ㆍ청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금결제, 정산, 채권추심 등</li>
                        </ul>
                      </li>
                      <li>3) 마케팅 및 광고에 활용
                        <ul>
                          <li>신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
                        </ul>
                      </li>
                      <li>4) 고충처리
                        <ul>
                          <li>민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락, 통지, 처리결과 통보 등</li>
                        </ul>
                      </li>
                      <li>5) 기타
                        <ul>
                          <li>가입횟수 제한, 분쟁조정을 위한 기록보존, 회원의 각종 통계자료 산출 </li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="third" />
                  <dt>3. 개인정보의 보유 및 이용기간</dt>
                  <dd>
                    <p>회사는 법령에 따른 개인정보 이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유 이용기간 내에서 개인정보를 보유 및 이용합니다. 각각의 개인정보 보유 및 이용기간은 다음과 같습니다.</p>
                    <ul>
                      <li>1) 홈페이지 회원 가입 및 관리: 홈페이지 탈퇴 시까지
                        <ul>
                          <li>다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</li>
                          <li>1-1) 관계 법령 위반에 따른 수사, 조사 등이 진행중인 경우에는 해당 수사, 조사 종료 시까지</li>
                          <li>1-2) 홈페이지 이용에 따른 채권, 채무관계 잔존 시에는 해당 채권, 채무관계 정산 시까지</li>
                        </ul>
                      </li>
                      <li>2) 재화 또는 서비스 제공: 재화, 서비스 공급완료 및 요금결제, 정산 완료 시까지
                        <ul>
                          <li>다만, 다음의 사유에 해당하는 경우에는 해당 기간 종료 시까지 </li>
                          <li>2-1)「전자상거래 등에서의 소비자 보호에 관한 법률」에 따른 표시, 광고, 계약내용 및 이행 등 거래에 관한 기록
                            <ul>
                              <li>- 표시, 광고에 관한 기록: 6개월</li>
                              <li>- 소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
                            </ul>
                          </li>
                          <li>2-2)「통신비밀보호법」제41조에 따른 통신사실확인자료 보관
                            <ul>
                              <li>- 가입자 전기통신 일시, 개시․종료시간, 상대방 가입자번호, 사용도수, 발신기지국 위치추적자료: 1년</li>
                              <li>- 컴퓨터통신, 인터넷 로그기록자료, 접속지 추적자료: 3개월</li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="fourth" />
                  <dt>4. 개인정보의 제3자 제공</dt>
                  <dd>
                    <p>회사는 이용자의 개인정보를 제2조(개인정보의 수집 및 이용목적)에서 명시한 범위 내에서만 처리하며, 동 범위를 초과하여 개인정보를 이용하거나 제3자에게 제공∙공개하지 않습니다.</p>
                    <table>
                      <colgroup>
                        <col className="col25" />
                        <col className="col25" />
                        <col className="col25" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>개인정보를 제공받는 자</th>
                          <th>제공받는 자의 개인정보 이용목적</th>
                          <th>제공하는 개인정보의 항목</th>
                          <th>제공받은 개인정보의 보유 및 이용기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>디지털교과서협회</td>
                          <td>교과서 출판사들의 <br />통합 교수지원 서비스 제공</td>
                          <td>성명, 아이디(ID), 휴대전화번호, <br />이메일, 교사인증시작일, 교사인증만료일</td>
                          <td>회원탈퇴시까지</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>다만, 관련 법령상 규정이 있는 경우에는 예외로 합니다.</p>
                  </dd>
                  <a name="fifth" />
                  <dt>5. 개인정보의 취급위탁</dt>
                  <dd>
                    <p>회사는 원활한 서비스 이행을 위해 다음과 같이 개인정보 처리를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.</p>
                    <table>
                      <colgroup>
                        <col className="col25" />
                        <col className="col25" />
                        <col className="col25" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>수탁자</th>
                          <th>개인정보를 위탁하는 목적</th>
                          <th>위탁 항목</th>
                          <th>위탁기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>(주)LG U+</td>
                          <td>학습동영상 및 콘텐츠 서버 관련</td>
                          <td>인증여부</td>
                          <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td>㈜북큐브네트웍스</td>
                          <td>무료 전자도서관 서비스 제공</td>
                          <td>아이디</td>
                          <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td>㈜다우기술</td>
                          <td>이벤트 기프티콘 경품 발송</td>
                          <td>휴대전화번호</td>
                          <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                        <tr>
                          <td>㈜현대로지스틱스</td>
                          <td>이벤트 경품 발송</td>
                          <td>성명, 휴대전화번호, 주소</td>
                          <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>- 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 본 개인정보 취급방침을 통하여 공개하고 있습니다.</p>
                  </dd>
                  <a name="sixth" />
                  <dt>6. 이용자의 권리∙의무 및 그 행사방법에 관한 사항</dt>
                  <dd>
                    <ul className="lightFont">
                      <li>1) 이용자는 회사에 대해 언제든지 회사가 처리하는 자신의 개인정보에 대한 열람, 정정∙삭제 및 처리정지를 요구하는 등 개인정보 보호 관련 권리를 행사할 수 있습니다. 다만, 관련 법령상 규정이 있는 경우에는 회사는 위와 같은 요구를 거절하거나 제한할 수 있습니다.</li>
                      <li>2) 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 할 수 있으며 회사는 이에 대해 지체 없이 조치합니다.</li>
                      <li>3) 이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
                      <li>4) 제1항에 따른 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 할 수 있으며, 이 경우 위임장을 제출해야 합니다.</li>
                    </ul>
                  </dd>
                  <a name="seventh" />
                  <dt>7. 개인정보의 파기절차 및 파기방법</dt>
                  <dd>
                    <p>회사는 개인정보 보유기간의 경과, 수집 및 이용목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                    <p>이용자로부터 동의 받은 개인정보 보유기간이 경과하거나 수집 및 이용목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.</p>
                    <p>개인정보의 파기 절차 및 방법은 다음과 같습니다.</p>
                    <ul>
                      <li>1) 파기절차
                        <ul>
                          <li>회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 관리책임자의 승인을 받아 개인정보를 파기합니다. </li>
                        </ul>
                      </li>
                      <li>2) 파기방법
                        <ul>
                          <li>회사는 전자적 파일 형태로 기록∙저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록∙저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="eighth" />
                  <dt>8. 개인정보의 안전성 확보조치에 관한 사항</dt>
                  <dd>
                    <p>회사는 개인정보의 안전성 확보에 필요한 관리적, 기술적, 물리적 조치를 하고 있습니다.</p>
                    <ul>
                      <li>1) 관리적 조치
                        <ul>
                          <li>1-1) 내부관리계획의 수립 및 시행: 개인정보의 안전한 처리를 위하여 내부관리계획을 수립, 시행하고 있습니다. </li>
                          <li>1-2) 개인정보 취급 직원의 최소화 및 교육: 회사의 개인정보 취급 직원은 담당자에 한정시키고 이를 위한 별도의 비밀번호를 부여하여 정기적으로 갱신하고 있으며, 담당자에 대한 수시 교육을 통하여 개인정보 취급방침의 준수를 항상 강조하고 있습니다.</li>
                        </ul>
                      </li>
                      <li>2) 기술적 조치
                        <ul>
                          <li>2-1) 해킹 등에 대비한 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신∙점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적, 물리적으로 감시 및 차단하고 있습니다.</li>
                          <li>2-2) 비밀번호 암호화: 이용자 회원ID의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다. </li>
                        </ul>
                      </li>
                      <li>3) 물리적 조치
                        <ul>
                          <li>3-1) 문서보안을 위한 잠금 장치 사용: 개인정보가 포함된 서류, 보조저장매체 등을 잠금 장치가 있는 안전한 장소에 보관하고 있습니다. </li>
                          <li>3-2) 비 인가자에 대한 출입 통제: 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="nineth" />
                  <dt>9. 개인정보의 자동 수집 장치의 설치∙운영 및 그 거부에 관한 사항</dt>
                  <dd>
                    <p>회사는 이용자의 정보를 수시로 저장하고 찾아내는 쿠키(cookie) 등 개인정보를 자동으로 수집하는 장치를 설치, 운용합니다. 쿠키(cookie)란, 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키 등을 사용합니다.</p>
                    <ul>
                      <li>1) 쿠키의 사용 목적
                        <ul>
                          <li>회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타깃 마케팅 및 개인 맞춤 서비스 제공</li>
                        </ul>
                      </li>
                      <li>2) 쿠키의 설치/운영 및 거부
                        <ul>
                          <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
                        </ul>
                      </li>
                      <li>3) 쿠키설정 거부 방법
                        <ul>
                          <li>쿠키 설정을 거부하는 방법으로는 회원님이 사용하는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                          </li><li>* 설정방법 예(인터넷 익스플로어의 경우): 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보</li>
                          <li>단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="tenth" />
                  <dt>10. 개인정보 관리책임자에 관한 사항</dt>
                  <dd>
                    <ul className="lightFont lightPad">
                      <li>1) 회사는 이용자의 개인정보를 보호하고, 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 수집 및 이용 등에 관한 업무를 총괄해서 책임지는 개인정보 관리책임자를 지정하고 있습니다.
                        <ul className="dePartment">
                          <li>&lt;개인정보 관리책임자&gt;</li>
                          <li>- 정보보호 최고책임자 : 미래전략실 최성기SP </li>
                          <li>- 정보보호 실무담당자 : 미래전략실 IT전략과 김광중IP</li>
                          <li>- 전화번호 : 1544-0554</li>
                        </ul>
                      </li>
                      <li>2) 이용자께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 관리책임자 및 담당부서로 문의하실 수 있습니다. 회사는 이용자의 문의에 대해 지체없이 답변 및 처리해드리고 있습니다.</li>
                      <li>3) 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
                        <ul className="externalLink">
                          <li>- 개인정보침해신고센터(http://privacy.kisa.or.kr / 국번없이 118)</li>
                          <li>- 개인정보분쟁조정위원회 (http://www.kopico.or.kr / 02-405-5150)</li>
                          <li>- 대검찰청 사이버범죄 수사단(http://www.spo.go.kr / 국번없이 1301)</li>
                          <li>- 경찰청 사이버안전국 (http://www.ctrc.go.kr / 02-3150-2659, 국번없이 182)</li>
                        </ul>
                      </li>
                    </ul>
                  </dd>
                  <a name="eleventh" />
                  <dt>11. 개인정보 취급방침의 변경에 관한 사항</dt>
                  <dd>
                    <p>현 개인정보취급방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다. 다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.</p>
                    <ul className="lightFont listtopPad">
                      <li>- 개인정보취급방침 공고일자: 2015년 7월 23일</li>
                      <li>- 개인정보취급방침 시행일자: 2015년 7월 31일</li>
                    </ul>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="privacy_ver2 hide">
              <div className="agreeCnt">
                (주)비상교육 비바샘 개인정보 취급방침<br /><br />
                (주)비상교육 비바샘(www.vivasam.com 이하 '회사'라 함)은 이용자 개인 정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법, 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을 준수하여 관련법령에 의거한 개인정보 취급방침을 정하고 이용자 권익 보호에 최선을 다하고 있습니다.<br /><br />
                회사는 개인정보취급방침을 통하여 이용자가 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다. 회사의 개인정보취급방침은 정부의 법률 및 지침변경이나 회사 내부의 방침변경 등으로 인하여 변경될 수 있으며, 개인정보취급방침을 개정할 경우 홈페이지에 게시하여 개정된 사항을 쉽게 알아볼 수 있도록 하고 있습니다.<br /><br />
                1. 개인정보의 처리 목적<br />
                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br /><br />
                1) 홈페이지 회원가입 및 관리<br />
                회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별∙인증, 회원자격 유지∙관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정이용 방지, 만14세 미만 아동 개인정보 수집 시 법정대리인 동의 여부 확인, 각종 고지∙통지, 고충처리, 분쟁 조정을 위한 기록 보존 등<br /><br />
                2) 재화 또는 서비스 제공<br />
                물품배송, 서비스 제공, 계약서․청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금결제․정산, 채권추심 등<br /><br />
                3) 마케팅 및 광고에 활용 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계<br />
                4) 고충처리 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락․통지, 처리결과 통보 등 <br />
                5) 기타 가입횟수 제한, 분쟁조정을 위한 기록보존, 회원의 각종 통계자료 산출 <br /><br />
                2. 개인정보의 처리 및 보유기간<br />
                회사는 법령에 따른 개인정보․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.<br /><br />
                1) 홈페이지 회원 가입 및 관리: 홈페이지 탈퇴 시까지<br />
                다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지<br /><br />
                1-1) 관계 법령 위반에 따른 수사․조사 등이 진행중인 경우에는 해당 수사․조사 종료 시까지<br />
                1-2) 홈페이지 이용에 따른 채권․채무관계 잔존 시에는 해당 채권․채무관계 정산 시까지 <br /><br />
                2) 재화 또는 서비스 제공: 재화․서비스 공급완료 및 요금결제․정산 완료 시까지<br />
                다만, 다음의 사유에 해당하는 경우에는 해당 기간 종료 시까지 <br /><br />
                2-1) 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따른 표시․광고, 계약내용 및 이행 등 거래에 관한 기록<br />
                - 표시․광고에 관한 기록: 6월<br />
                - 계약 또는 청약철회, 대금결제, 재화 등의 공급기록: 5년<br />
                - 소비자 불만 또는 분쟁처리에 관한 기록: 3년<br /><br />
                2-2)「통신비밀보호법」제41조에 따른 통신사실확인자료 보관<br />
                - 가입자 전기통신 일시, 개시․종료시간, 상대방 가입자번호, 사용도수, 발신기지국 위치추적자료: 1년<br />
                - 컴퓨터통신, 인터넷 로그기록자료, 접속지 추적자료: 3개월<br />
                2-3) 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」시행령 제29조에 따른 본인확인정보 보관: 게시판에 정보 게시가 종료된 후 6개월<br /><br />
                <strong>3. 개인정보의 제3자 제공</strong><br />
                <strong>- 회사는 이용자의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 동 범위를 초과하여 개인정보를 이용하거나 제3자에게 제공∙공개하지 않습니다.</strong><br />
                <strong>- 다만, 관련 법령상 규정이 있는 경우에는 예외로 합니다.</strong><br /><br />
                <table className="priTbl">
                  <colgroup>
                    <col className="col20" />
                    <col className="col25" />
                    <col />
                    <col className="col20" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>개인정보를 <br />제공받는 자</th>
                      <th>제공받는 자의 <br />개인정보 이용목적</th>
                      <th>제공하는 <br />개인정보의 항목</th>
                      <th>제공받은 개인정보의 <br />보유 및 이용기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>디지털교과서협회</td>
                      <td>교과서 출판사들의  통합 교수지원 서비스 제공</td>
                      <td>성명, 아이디(ID), 휴대폰번호, 이메일, 교사인증시작일, 교사인증만료일</td>
                      <td>회원탈퇴시까지</td>
                    </tr>
                  </tbody>
                  <tbody><tr>
                    </tr>
                  </tbody></table>
                4. 개인정보처리의 위탁<br />
                1) 회사는 원활한 서비스 이행을 위해 다음과 같이 개인정보 처리를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.<br /><br />
                1-1) 서비스 운영 대행<br />
                - 수탁자: <strong>(주)비상교육</strong><br />
                - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지<br />
                1-2) 학습동영상 및 콘텐츠 서버 관련<br />
                - 수탁자: <strong>(주)LG U+</strong><br />
                - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지<br />
                1-3) V-Solution 대입 평가 시스템 운영<br />
                - 수탁자: <strong>(주)비상교평</strong><br />
                - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지<br /> <br />
                2) 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 본 개인정보 취급방침을 통하여 공개하도록 하겠습니다.<br />
                3) 필요에 따른 물품 배송의 경우 제휴 업체 정보를 공지사항 등을 통해 공개합니다. <br /><br />
                5. 이용자의 권리∙의무 및 그 행사방법에 관한 사항<br />
                1) 이용자는 회사에 대해 언제든지 회사가 처리하는 자신의 개인정보에 대한 열람, 정정∙삭제 및 처리정지를 요구하는 등 개인정보 보호 관련 권리를 행사할 수 있습니다. 다만, 관련 법령상 규정이 있는 경우에는 회사는 위와 같은 요구를 거절하거나 제한할 수 있습니다.<br />
                2) 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.<br />
                3) 이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.<br />
                4) 제1항에 따른 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 위임장을 제출하셔야 합니다.<br /><br />
                6. 처리하는 개인정보 항목<br />
                회사는 다음의 개인정보 항목을 처리하고 있습니다.<br /><br />
                1) 수집하는 개인정보 항목 및 수집방법<br />
                1-1) 홈페이지 회원 가입 및 관리<br />
                ․필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 사용 교과서 정보, 학교구분, 휴대전화번호, 성별, 주소<br />
                ․선택항목: 프로필사진, 생년월일<br />
                1-2) 재화 또는 서비스 제공<br />
                ․필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 사용 교과서 정보, 학교구분, 휴대전화번호, 성별, 주소<br />
                ․선택항목: 프로필사진, 생년월일, 자기소개, 담당학년<br />
                1-3) 또한 인터넷 서비스 이용과정이나 사업처리 과정에서 아래와 같은 개인정보 항목이 자동으로 생성되어 수집될 수 있습니다.<br />
                ․IP주소, 접속 로그, 쿠키, MAC주소, PC고유번호, 서비스 이용기록, 방문기록, 불량 이용기록 등<br /><br />
                2) 개인정보 수집방법<br />
                회사는 다음과 같은 방법으로 개인정보를 수집합니다.<br />
                - 홈페이지(회원가입, 상담게시판, 공개 게시판, 기타 개인정보를 바탕으로 하는 서비스 이용 등), 서면양식, 전화/팩스를 통한 회원가입, 경품행사 응모, 배송 요청, 제휴 사로부터의 제공, 생성정보 수집 툴을 통한 수집<br /><br />
                7. 개인정보의 파기에 관한 사항<br />
                - 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.<br />
                - 이용자로부터 동의 받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.<br />
                - 개인정보의 파기 절차 및 방법은 다음과 같습니다.<br /><br />
                1) 파기절차<br />
                회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.<br />
                2) 파기방법<br />
                회사는 전자적 파일 형태로 기록∙저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록∙저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.<br /><br />
                8. 개인정보의 안전성 확보조치에 관한 사항<br />
                회사는 개인정보의 안전성 확보에 필요한 관리적, 기술적, 물리적 조치를 하고 있습니다.<br /><br />
                1) 관리적 조치<br />
                1-1) 내부관리계획의 수립 및 시행: 개인정보의 안전한 처리를 위하여 내부관리계획을 수립, 시행하고 있습니다.<br />
                1-2) 개인정보 취급 직원의 최소화 및 교육: 회사의 개인정보 취급 직원은 담당자에 한정시키고 이를 위한 별도의 비밀번호를 부여하여 정기적으로 갱신하고 있으며, 담당자에 대한 수시 교육을 통하여 개인정보 취급방침의 준수를 항상 강조하고 있습니다.<br /><br />
                2) 기술적 조치<br />
                2-1) 해킹 등에 대비한 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신∙점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적, 물리적으로 감시 및 차단하고 있습니다.<br />
                2-2) 비밀번호 암호화: 이용자 회원ID의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다. 3) 물리적 조치<br />
                3-1) 문서보안을 위한 잠금 장치 사용: 개인정보가 포함된 서류, 보조저장매체 등을 잠금 장치가 있는 안전한 장소에 보관하고 있습니다.<br />
                3-2) 비 인가자에 대한 출입 통제: 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.<br />
                9. 개인정보의 자동 수집 장치의 설치∙운영 및 그 거부에 관한 사항<br />
                회사는 이용자의 정보를 수시로 저장하고 찾아내는 쿠키(cookie) 등 개인정보를 자동으로 수집하는 장치를 설치, 운용합니다. 쿠키(cookie)란 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키 등을 사용합니다.<br />
                1) 쿠키의 사용 목적<br />
                회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타깃 마케팅 및 개인 맞춤 서비스 제공<br /><br />
                2) 쿠키의 설치/운영 및 거부<br />
                이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.<br /><br />
                3) 쿠키설정 거부 방법<br />
                쿠키 설정을 거부하는 방법으로는 회원님이 사용하는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.<br />
                * 설정방법 예(인터넷 익스플로어의 경우): 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보<br />
                단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.<br /><br />
                10. 개인정보 보호책임자에 관한 사항<br />
                1) 회사는 이용자의 개인정보를 보호하고, 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 처리에 관한 업무를 총괄해서 책임지는 개인정보 보호책임자를 지정하고 있습니다.<br /><br />
                <strong>▶ 개인정보 관리책임자</strong><br />
                담당자 : 최 성 기<br />
                직책 : IT전략부 IP<br />
                전화번호 : 1544-0554<br /><br />
                <strong>▶ 개인정보 관리 담당부서</strong><br />
                부서명 : IT전략부<br />
                전화번호 : 1544-0554<br /><br />
                2) 이용자께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 이용자의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.<br />
                3) 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.<br />
                <strong>1. 개인정보분쟁조정위원회 (http://www.kopico.or.kr/02-405-5150)</strong><br />
                <strong>2. 정보보호마크인증위원회 (www.eprivacy.or.kr/02-550-9531~2)</strong><br />
                <strong>3. 경찰청 사이버테러대응센터 (www.ctrc.go.kr/02-3150-2659)</strong><br /><br />
                11. 개인정보 취급방침의 변경에 관한 사항<br />
                현 개인정보취급방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 14일전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다. 다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.<br />
                <strong>- 개인정보취급방침 공고일자: 2014년 1월 28일</strong><br />
                <strong>- 개인정보취급방침 시행일자: 2014년 2월 27일</strong><br /><br />
              </div>
            </div>
            <div className="privacy_ver1 hide">
              <div className="agreeCnt" id="serviceContent">
                <strong>(주)비상교육 개인정보 취급방침 개정안</strong><br /><br />
                (주)비상교육(이하 '회사'라 함)은 이용자 개인 정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법, 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을 준수하여 관련법령에 의거한 개인정보 취급방침을 정하고 이용자 권익 보호에 최선을 다하고 있습니다.<br /><br />
                회사는 개인정보취급방침을 통하여 이용자가 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다. 회사의 개인정보취급방침은 정부의 법률 및 지침변경이나 회사 내부의 방침변경 등으로 인하여 변경될 수 있으며, 개인정보취급방침을 개정할 경우 홈페이지에 게시하여 개정된 사항을 쉽게 알아볼 수 있도록 하고 있습니다.
                <br /><br />
                <strong>1. 개인정보의 처리 목적</strong><br />
                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br /><br />
                1) 홈페이지 회원가입 및 관리<br />
                회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별∙인증, 회원자격 유지∙관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정이용 방지, 만14세 미만 아동 개인정보 수집 시 법정대리인 동의 여부 확인, 각종 고지∙통지, 고충처리, 분쟁 조정을 위한 기록 보존 등<br /><br />
                2) 재화 또는 서비스 제공<br />
                물품배송, 서비스 제공, 계약서․청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금결제․정산, 채권추심 등
                <br /><br />
                3) 마케팅 및 광고에 활용
                신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
                <br /><br />
                4) 고충처리
                민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락․통지, 처리결과 통보 등
                <br /><br />
                5) 기타
                가입횟수 제한, 분쟁조정을 위한 기록보존, 회원의 각종 통계자료 산출
                <br /><br />
                <strong>2. 개인정보의 처리 및 보유기간</strong><br />
                회사는 법령에 따른 개인정보․이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.
                각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                <br /><br />
                1) 홈페이지 회원 가입 및 관리: 홈페이지 탈퇴 시까지<br />
                다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지
                <br /><br />
                1-1) 관계 법령 위반에 따른 수사․조사 등이 진행중인 경우에는 해당 수사․조사 종료 시까지<br />
                1-2) 홈페이지 이용에 따른 채권․채무관계 잔존 시에는 해당 채권․채무관계 정산 시까지
                <br /><br />
                2) 재화 또는 서비스 제공: 재화․서비스 공급완료 및 요금결제․정산 완료 시까지<br />
                다만, 다음의 사유에 해당하는 경우에는 해당 기간 종료 시까지
                <br /><br />
                2-1) 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따른 표시․광고, 계약내용 및 이행 등 거래에 관한 기록<br />
                - 표시․광고에 관한 기록: 6월<br />
                - 계약 또는 청약철회, 대금결제, 재화 등의 공급기록: 5년<br />
                - 소비자 불만 또는 분쟁처리에 관한 기록: 3년<br />
                2-2)「통신비밀보호법」제41조에 따른 통신사실확인자료 보관<br />
                - 가입자 전기통신 일시, 개시․종료시간, 상대방 가입자번호, 사용도수, 발신기지국 위치추적자료: 1년<br />
                - 컴퓨터통신, 인터넷 로그기록자료, 접속지 추적자료: 3개월<br />
                2-3) 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」시행령 제29조에 따른 본인확인정보 보관: 게시판에 정보 게시가 종료된 후 6개월<br /><br />
                <strong>3. 개인정보의 제3자 제공</strong><br />
                회사는 이용자의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 동 범위를 초과하여 개인정보를 이용하거나 제3자에게 제공∙공개하지 않습니다.<br />
                다만, 관련 법령상 규정이 있는 경우에는 예외로 합니다.<br /><br />
                <strong>4. 개인정보처리의 위탁</strong><br />
                1) 회사는 원활한 서비스 이행을 위해 다음과 같이 개인정보 처리를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.<br /><br />
                1-1) 서비스 운영 대행<br />
                - 수탁자: 비상esl<br />
                - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지<br />
                1-2) 학습동영상 및 콘텐츠 서버 관련<br />
                - 수탁자: LG U+<br />
                - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지<br />
                <span className="point">1-3) V-Solution 대입 평가 시스템 운영<br />
                  - 수탁자: 비상교평<br />
                  - 위탁 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지
                </span>
                <br /><br />
                2) 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 본 개인정보 취급방침을 통하여 공개하도록 하겠습니다.<br />
                3) 필요에 따른 물품 배송의 경우 제휴 업체 정보를 공지사항 등을 통해 공개합니다.
                <br /><br />
                <strong>5. 이용자의 권리∙의무 및 그 행사방법에 관한 사항</strong><br />
                1) 이용자는 회사에 대해 언제든지 회사가 처리하는 자신의 개인정보에 대한 열람, 정정∙삭제 및 처리정지를 요구하는 등 개인정보 보호 관련 권리를 행사할 수 있습니다. 다만, 관련 법령상 규정이 있는 경우에는 회사는 위와 같은 요구를 거절하거나 제한할 수 있습니다.
                <br /><br />
                2) 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.<br /><br />
                3) 이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.<br /><br />
                4) 제1항에 따른 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 위임장을 제출하셔야 합니다.<br /><br />
                <strong>6. 처리하는 개인정보 항목</strong><br />
                회사는 다음의 개인정보 항목을 처리하고 있습니다.<br /><br />
                1) 수집하는 개인정보 항목 및 수집방법<br />
                1-1) 홈페이지 회원 가입 및 관리<br />
                ․필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 사용 교과서 정보, 학교구분<br />
                ․선택항목: 프로필사진, 생년월일, 휴대전화번호<br />
                1-2) 재화 또는 서비스 제공<br />
                ․필수항목: 로그인ID, 비밀번호, 비밀번호 변경 질문, 비밀번호 변경 답변, 성명, 이메일, 재직학교명, 학교소재지(시도, 구군), 사용 교과서 정보, 학교구분<br />
                ․선택항목: 프로필사진, 생년월일, 휴대전화번호, 자기소개, 주소정보, 담당학년<br />
                1-3) 또한 인터넷 서비스 이용과정이나 사업처리 과정에서 아래와 같은 개인정보 항목이 자동으로 생성되어 수집될 수 있습니다.<br />
                ․IP주소, 접속 로그, 쿠키, MAC주소, PC고유번호, 서비스 이용기록, 방문기록, 불량 이용기록 등<br /><br />
                2) 개인정보 수집방법<br />
                회사는 다음과 같은 방법으로 개인정보를 수집합니다.<br />
                - 홈페이지(회원가입, 상담게시판, 공개 게시판, 기타 개인정보를 바탕으로 하는 서비스 이용 등), 서면양식, 전화/팩스를 통한 회원가입, 경품행사 응모, 배송 요청, 제휴 사로부터의 제공, 생성정보 수집 툴을 통한 수집<br /><br />
                <strong>7. 개인정보의 파기에 관한 사항</strong><br />
                - 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.<br />
                - 이용자로부터 동의 받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.<br />
                - 개인정보의 파기 절차 및 방법은 다음과 같습니다.<br /><br />
                1) 파기절차<br />
                회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.<br />
                2) 파기방법<br />
                회사는 전자적 파일 형태로 기록∙저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록∙저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.<br /><br />
                <strong>8. 개인정보의 안전성 확보조치에 관한 사항</strong><br />
                회사는 개인정보의 안전성 확보에 필요한 관리적, 기술적, 물리적 조치를 하고 있습니다.<br /><br />
                1) 관리적 조치<br />
                1-1) 내부관리계획의 수립 및 시행: 개인정보의 안전한 처리를 위하여 내부관리계획을 수립, 시행하고 있습니다.<br />
                1-2) 개인정보 취급 직원의 최소화 및 교육: 회사의 개인정보 취급 직원은 담당자에 한정시키고 이를 위한 별도의 비밀번호를 부여하여 정기적으로 갱신하고 있으며, 담당자에 대한 수시 교육을 통하여 개인정보 취급방침의 준수를 항상 강조하고 있습니다.<br /><br />
                2) 기술적 조치<br />
                2-1) 해킹 등에 대비한 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신∙점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적, 물리적으로 감시 및 차단하고 있습니다.<br />
                2-2) 비밀번호 암호화: 이용자 아이디의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다.
                3) 물리적 조치<br />
                3-1) 문서보안을 위한 잠금 장치 사용: 개인정보가 포함된 서류, 보조저장매체 등을 잠금 장치가 있는 안전한 장소에 보관하고 있습니다.<br />
                3-2) 비 인가자에 대한 출입 통제: 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.<br /><br />
                <strong>9. 개인정보의 자동 수집 장치의 설치∙운영 및 그 거부에 관한 사항</strong><br />
                회사는 이용자의 정보를 수시로 저장하고 찾아내는 쿠키(cookie) 등 개인정보를 자동으로 수집하는 장치를 설치, 운용합니다. 쿠키(cookie)란 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키 등을 사용합니다.<br /><br />
                1) 쿠키의 사용 목적<br />
                회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타깃 마케팅 및 개인 맞춤 서비스 제공<br /><br />
                2) 쿠키의 설치/운영 및 거부<br />
                이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.<br /><br />
                3) 쿠키설정 거부 방법<br />
                쿠키 설정을 거부하는 방법으로는 회원님이 사용하는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.<br />
                * 설정방법 예(인터넷 익스플로어의 경우): 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보<br />
                단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.<br /><br />
                <strong>10. 개인정보 보호책임자에 관한 사항</strong><br />
                1) 회사는 이용자의 개인정보를 보호하고, 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 처리에 관한 업무를 총괄해서 책임지는 개인정보 보호책임자를 지정하고 있습니다.<br /><br />
                <strong>▶ 개인정보 관리책임자</strong><br />
                담당자 : 최 규 호<br />
                직책 : IT전략부 IP<br />
                전화번호 : 1544-0554<br /><br />
                <strong>▶개인정보 관리 담당부서</strong><br />
                부서명 : IT전략부<br />
                전화번호: 1544-0554<br /><br />
                2) 이용자께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의,불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 이용자의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.<br /><br />
                3) 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.<br /><br />
                1. 개인분쟁조정위원회 (www.1336.or.kr/1336)<br />
                2. 정보보호마크인증위원회 (www.eprivacy.or.kr/02-580-0533~4)<br />
                3. 대검찰청 인터넷범죄수사센터 (http://icic.sppo.go.kr/02-3480-3600)<br />
                4. 경찰청 사이버테러대응센터 (<span className="point1">www.ctrc.go.kr/02-392-0330)</span><br /><br />
                <strong>11. 개인정보 취급방침의 변경에 관한 사항</strong><br />
                현 개인정보취급방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 14일전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다. 다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.<br />
                - 개인정보취급방침 공고일자: <span className="point">2013년 2월 4일</span><br />
                - 개인정보취급방침 시행일자: <span className="point">2013년 2월 18일</span><br />
              </div>
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
)(withRouter(TermsPrivacyPopup));
