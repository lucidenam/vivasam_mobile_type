import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "store/modules/gtag";
import TermsServicePopupHistory from "./TermsServicePopupHistory";
import TermsPrivacyPopupHistory from "./TermsPrivacyPopupHistory";

class TermsService extends Component {


	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-HRYH9929GX', {
			'page_path': '/termOfService',
			'page_title': '서비스 이용약관｜비바샘'
		});
	}

	handlePopup = (e) => {
		const {PopupActions} = this.props;
		let title = e.target.dataset.name;
		let container = <TermsServicePopupHistory activeTermItem={e.target.value}/>;

		PopupActions.openPopup({title:title, componet:container, wrapClassName: "auto_content"});
	}

	render() {
		return (
			<section className="terms_content">
				<div className="termsDetails">
					<div className="terms_conts">
						<div className="access_txt">

							<div className="access_ver8">
								<strong className="access_tit">제 1장 총칙</strong>

								<span className="access_sub_tit">제 1조 [목적]</span>
								<span className="access_desc">이 약관은 (주)비상교육(이하 “회사”라 합니다)이 운영하는 비바샘 (이하 “사이트”라 합니다)의 이용과 관련하여 회사와 이용자와의 권리·의무, 책임사항 및 기타 필요한 사항 등을 규정함을 목적으로 합니다.</span>

								<span className="access_sub_tit">제 2조 [정의]</span>
								<span className="access_desc">① 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</span>
								<span className="access_desc">1. “서비스”라 함은, 비바샘 교수학습지원 서비스(이하 “교수학습지원 서비스”라 합니다)와 비바샘 원격교육연수원 서비스(이하 “원격교육연수원 서비스”라 합니다)를 말하며 다음과 같이 구분됩니다.</span>
								<span className="access_desc">- 교수학습지원 서비스 : 비바샘 웹사이트와 응용프로그램(어플리케이션, 앱), 기타 제반 서비스 등을 통해 제공되는 교육콘텐츠 및 온라인교수 지원 서비스</span>
								<span className="access_desc">- 원격교육연수원 서비스 : 교원 또는 일반회원에게 필요한 학점 취득이나 직무수행능력 향상을 위해 제공하는 온라인교육 연수 서비스</span>
								<span className="access_desc">2. “이용자”라 함은, 회사의 사이트에 접속하여 이 약관에 따라 회사가 제공하는 콘텐츠 및 제반 서비스를 이용하는 회원 및 비회원을 말합니다.</span>
								<span className="access_desc">3. “회원”이라 함은, 회사와 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 이용자로서 회사의 정보를 지속적으로 제공받으며 아래 회사가 제공하는 서비스를 지속적으로 이용할 수 있는 자를 말하며 회원별 서비스 이용범위는 아래와 같습니다.</span>
								<span className="access_desc">(1) 교수학습지원 서비스</span>
								<span className="access_desc">- 인증회원: EPKI/GPKI 인증 또는 공직자 메일 인증, 서류 인증 등의 교사인증을 받은 회원을 말합니다.  서류 인증이란 특수학교 재직 교사, 기간제 교사, 사범대생의 경우 회사가 특정 서류(재직증명서, 교생실습학교장 확인서, 교생실습일지 등)를 통해 회원으로서의 자격 요건을 검토, 인증하는 것을 말합니다. 단, 서류 인증회원의 경우 1년마다 재인증을 거친 후 서비스를 이용할 수 있습니다.</span>
								<span className="access_desc">- 미인증회원: 상기에서 규정한 인증회원에 해당하지 않은 회원으로서, 콘텐츠 이용에 제한이 있습니다.</span>
								<span className="access_desc">- 정회원: 인증회원 중에서 비바샘의 모든 콘텐츠와 서비스를 이용할 수 있는 회원을 말합니다.</span>
								<span className="access_desc">- 준회원: 인증회원 중에서 비바샘이 규정한 일부 콘텐츠와 서비스를 이용할 수 있는 회원을 말합니다.</span>
								<span className="access_desc">(2) 원격교육연수원 서비스</span>
								<span className="access_desc">- 교원회원: 유∙무료 직무연수 수강 시 교육청 이수보고를 위한 나이스 (NEIS) 개인번호를 등록한 회원을 말합니다.</span>
								<span className="access_desc">- 일반회원: 유∙무료 직무나 자율연수 수강 시 별도의 교육청 이수보고가 필요하지 않은 회원을 말합니다.</span>
								<span className="access_desc">4. “비회원” 이라 함은, 회원에 가입하지 않고 "사이트"가 제공하는 서비스를 이용하는 자를 말합니다.</span>
								<span className="access_desc">5. “콘텐츠”라 함은, 정보통신망이용촉진 및 정보보호 등에 관한 법률 제2조 제1항 제1호의 규정에 의한 정보통신망에서 사용되는 부호·문자·음성·음향·이미지 또는 영상 등으로 표현된 자료 또는 정보로서, 그 보존 및 이용에 있어서 효용을 높일 수 있도록 전자적 형태로 제작 또는 처리된 것을 말합니다.</span>
								<span className="access_desc">6. “아이디(ID)”라 함은, 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자 또는 숫자의 조합을 말합니다.</span>
								<span className="access_desc">7. “비밀번호(PASSWORD)”라 함은, 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 영문, 숫자 및 특수문자의 조합을 말합니다.</span>
								<span className="access_desc">8. “운영자(관리자)”라 함은, 서비스의 전반적인 관리와 원활한 운영을 위하여 회사에서 선정한 사람 혹은 기관(회사)를 말합니다.</span>
								<span className="access_desc">9. “마일리지”라 함은, 회원이 교수학습지원 서비스에서 비바콘 등의 명칭으로 통용되는 가상의 지불수단으로 이벤트 참여시 사용할 수 있으며, 사이트내 별도의 이용안내를 게시합니다.</span>
								<span className="access_desc">10. “포인트”라 함은, 회사의 원격교육연수원 서비스에서 포인트 등의 명칭으로 통용되는 가상의 지불수단으로 콘텐츠 및 서비스 등을 구매할 수 있으며, 사이트내 별도의 이용안내를 게시합니다.</span>
								<span className="access_desc">11. “게시물”이라 함은, 회원이 서비스를 이용함에 있어 회사의 사이트에 게시한 문자, 부호, 음향, 화상, 동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크, 댓글 등의 정보를 말합니다.</span>
								<span className="access_desc">② 전항 각호의 용어를 제외한 용어의 정의는 거래 관행 및 관계 법령에 따릅니다.</span>

								<span className="access_sub_tit">제 3조 [회사정보 등의 제공]</span>
								<span className="access_desc">회사는 이 약관의 내용, 상호, 대표자명, 주소(소비자의 불만을 처리할 수 있는 곳의 주소를 포함), 전화번호, 모사전송번호, 전자우편주소, 사업자등록번호, 통신판매업 신고번호 및 개인정보관리책임자 등을 이용자가 쉽게 알 수 있도록 온라인 서비스초기화면에 게시합니다. 다만, 약관은 이용자가 연결화면을 통하여 볼 수 있도록 할 수 있습니다.</span>

								<span className="access_sub_tit">제 4조 [약관의 게시 등]</span>
								<span className="access_desc">회사는 이 약관을 이용자가 별도의 연결화면을 통하여 약관의 내용을 확인할 수 있도록 사이트 내에 게시합니다.</span>

								<span className="access_sub_tit">제 5조 [약관의 개정 등]</span>
								<span className="access_desc">① 회사는 콘텐츠산업진흥법, 전자상거래 등에서의 소비자보호에 관한 법률, 약관의 규제에 관한 법률 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</span>
								<span className="access_desc">② 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스초기화면에 그 적용일자 7일(이용자에게 불리한 변경 또는 중대한 사항의 변경은 30일) 이전부터 적용일 후 상당한 기간 동안 공지하고, 기존회원에게는 개정약관, 적용일자 및 변경사유를 전자우편(이메일), 문자메시지 등으로 고지합니다.</span>
								<span className="access_desc">③ 회원이 개정약관의 적용에 동의하지 않는 경우 회원은 서비스 이용을 중단하고, 회원탈퇴를 할 수 있습니다.</span>
								<span className="access_desc">④ 기존 회원이 동조 2항에 따른 고지 또는 통지에도 불구하고, 동 기간 내에 이의를 제기하지 않는 경우에는 변경된 약관에 동의한 것으로 봅니다.</span>

								<span className="access_sub_tit">제 6조 [약관의 해석 등]</span>
								<span className="access_desc">이 약관에서 정하지 아니한 사항과 이 약관의 해석에 관하여는 관계법령, 회사가 정한 서비스의 개별이용 약관, 세부 이용 지침 및 규칙 등의 규정 또는 상관례에 따르게 됩니다.</span>

								<strong className="access_tit mt25">제 2장 회원가입</strong>

								<span className="access_sub_tit">제 7조 [회원가입]</span>
								<span className="access_desc">① 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고, 회사가 제공하는 소정의 신청양식에 관련사항을 기재하여 회원가입을 신청한 후 회사가 이러한 신청에 대하여 승낙함으로써 완료됩니다.</span>
								<span className="access_desc">1. 학교선생님, 교육대학생, 교육전문직원, 일반의 회원유형으로 선택한 후 가입할 수 있습니다.</span>
								<span className="access_desc">2. 비바샘 통합회원으로 가입되며 교수학습지원 서비스와 원격교육연수원 서비스를 동시에 이용할 수 있습니다.</span>
								<span className="access_desc">3. 교수학습지원 서비스의 경우 일부 서비스는 별도의 교사인증이 필요합니다.</span>
								<span className="access_desc">4. 일반 회원유형으로 가입한 경우, 일부 서비스 이용이 제한될 수 있습니다.</span>
								<span className="access_desc">② 전항의 신청양식에 이용자가 기재하는 모든 정보는 실제 데이터인 것으로 간주하며 실명이나 실제 정보를 입력하지 않은 사용자는 법적인 보호를 받을 수 없으며, 서비스 이용의 제한을 받을 수 있습니다.</span>
								<span className="access_desc">③ 회사는 본조 제1항 이용자의 신청에 대하여 회원가입을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 유보할 수 있으며, 승낙한 이후라도 취소할 수 있습니다.</span>
								<span className="access_desc">1. 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</span>
								<span className="access_desc">2. 실명이 아니거나 타인의 명의를 이용한 경우</span>
								<span className="access_desc">3. 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</span>
								<span className="access_desc">4. 이용자의 귀책사유로 승인이 불가능하거나 기타 제반 사항을 위반하며 신청하는 경우</span>
								<span className="access_desc">5. 본 약관의 16조의 회원의 의무를 위반한 경우</span>
								<span className="access_desc">6. 회원가입 신청 시 기재하여 회사에 제공된 사항(ID, 비밀번호, 주소 등)이 선량한 풍속 기타 사회질서에 위배되거나 타인을 모욕하는 경우</span>
								<span className="access_desc">7. 기타 회사가 정한 이용신청 요건이 미비된 경우</span>
								<span className="access_desc">④ 회사는 서비스 관련 설비의 여유가 없거나, 기술상 또는 업무상 문제가 있는 경우에는 승낙을 유보할 수 있습니다.</span>
								<span className="access_desc">⑤ 제3항과 제4항에 따라 회원가입신청의 승낙을 하지 아니하거나 유보한 경우, 회사는 이를 신청자에게 알려야 합니다. 단, 회사의 귀책사유 없이 신청자에게 통지할 수 없는 경우에는 예외로 합니다.</span>

								<span className="access_sub_tit">제 8조 [회원정보의 변경]</span>
								<span className="access_desc">① 회원은 회원정보관리화면 등을 통하여 비밀번호를 정확히 입력하면, 언제든지 자신의 개인정보를 열람하고 수정할 수 있습니다.</span>
								<span className="access_desc">② 회원이 회원가입 신청 시 기재한 사항이 변경되었음에도 그 변경사항을 “회사”에 알리지 않아 발생한 불이익에 대하여 “회사”는 책임지지 않습니다.</span>

								<span className="access_sub_tit">제 9조 [회원의 아이디 및 비밀번호의 관리에 대한 의무]</span>
								<span className="access_desc">① 회원의 아이디와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다.</span>
								<span className="access_desc">② 회원은 아이디 및 비밀번호가 도용되거나 제3자에 의해 사용되고 있음을 인지한 경우에는 이를 즉시 회사에 통지하여야 합니다.</span>
								<span className="access_desc">③ 회사는 제2항의 경우에 회원의 개인정보보호 및 기타 부정이용행위 등의 방지를 위하여 회원에게 비밀번호의 변경 등 필요한 조치를 요구할 수 있으며, 회원이 회사의 요구를 따르지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.</span>

								<span className="access_sub_tit">제 10조 [회원에 대한 통지]</span>
								<span className="access_desc">① 회사는 회원에게 알려야 할 사항이 발생할 경우, 회원이 제공한 전자우편주소 또는 쪽지, 팝업창, 유·무선 등의 방법으로 통지할 수 있습니다.</span>
								<span className="access_desc">② 회사는 회원 전체에 대한 통지의 경우 7일 이상 회사 웹사이트 게시판에 게시함으로써 전항의 통지에 갈음할 수 있습니다. 단, 회원 본인의 유료 서비스 이용 등 거래와 관련하여 중대한 사항에 대해서는 제1항의 통지를 합니다.</span>

								<span className="access_sub_tit">제 11조 [회원탈퇴 및 자격 상실 등]</span>
								<span className="access_desc">① 회원이 회원탈퇴를 하고자 하는 경우 회사 고객센터에 전화하거나, 온라인으로 회사에 탈퇴를 요청할 수 있으며, 이 경우 회사는 지체 없이 회원탈퇴 처리하고 그 사실을 회원에게 통지합니다.</span>
								<span className="access_desc">② 회사는 회원이 본 약관 또는 관계법령을 위반하는 경우, 서비스 이용을 제한하거나 회원자격을 상실시킬 수 있습니다.</span>

								<strong className="access_tit mt25">제 3장 서비스 이용계약</strong>

								<span className="access_sub_tit">제 12조 [콘텐츠의 내용 등의 게시]</span>
								<span className="access_desc">① 회사는 다음 사항을 해당 콘텐츠(연결화면 포함) 또는 그 포장에 이용자가 알기 쉽게 표시합니다.</span>
								<span className="access_desc">1. 콘텐츠의 명칭 및 종류</span>
								<span className="access_desc">2. 콘텐츠의 가격 및 이용시간</span>
								<span className="access_desc">3. 콘텐츠 제작자의 성명</span>
								<span className="access_desc">4. 콘텐츠의 내용, 이용방법, 이용료 기타 이용조건</span>
								<span className="access_desc">② 회사는 콘텐츠별 이용가능기기 및 이용에 필요한 최소한의 기술사양에 관한 정보를 이용자에게 제공합니다.</span>

								<span className="access_sub_tit">제 13조 [이용계약의 성립 등]</span>
								<span className="access_desc">① 회원은 회사가 제공하는 다음 또는 이와 유사한 절차에 의하여 이용신청을 합니다. 회사는 계약 체결 전에 각 호의 사항에 관하여 이용자가 정확하게 이해하고 실수 또는 착오 없이 거래할 수 있도록 정보를 제공합니다.</span>
								<span className="access_desc">1. 콘텐츠 목록의 열람 및 선택</span>
								<span className="access_desc">2. 콘텐츠의 상세정보</span>
								<span className="access_desc">3. 주문 상품 및 결제 금액 확인(환불규정 안내)</span>
								<span className="access_desc">4. 콘텐츠의 이용신청에 관한 확인 또는 회사의 확인에 대한 동의</span>
								<span className="access_desc">5. 결제방법의 확인 및 선택</span>
								<span className="access_desc">6. 결제금액의 재확인</span>
								<span className="access_desc">② 회사는 회원의 이용신청이 다음 각 호에 해당하는 경우에는 승낙하지 않거나 승낙을 유보할 수 있습니다.</span>
								<span className="access_desc">1. 실명이 아니거나 타인의 명의를 이용한 경우</span>
								<span className="access_desc">2. 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</span>
								<span className="access_desc">3. 서비스 관련 설비의 여유가 없거나, 기술상 또는 업무상 문제가 있는 경우</span>
								<span className="access_desc">4. 회사가 통제하기 곤란한 사정으로 정상적인 서비스 이용에 지장이 있는 경우</span>
								<span className="access_desc">5. 유료 서비스 이용 요금을 납입하지 않은 경우</span>
								<span className="access_desc">6. 유료 서비스 신청 금액과 입금 금액이 일치하지 않은 경우</span>
								<span className="access_desc">③ 회사는 회원이 제1항에 따라 콘텐츠(서비스) 이용신청을 할 경우, 승낙의 의사표시로서 제10조 제 1항의 방법으로 회원에게 통지하고 승낙의 통지가 회원에게 도달한 시점에 계약이 성립한 것으로 봅니다.</span>
								<span className="access_desc">④ 회사의 승낙의 의사표시에는 회원의 이용신청에 대한 확인 및 서비스제공 가능여부, 이용신청의 정정, 취소 등에 관한 정보 등을 포함합니다.</span>
								<span className="access_desc">⑤ 본조 제3항에 따른 회사의 승낙의 통지 이후에도 제2항의 3호 부터 6호의 사유가 발생할 경우, 회사는 그 사유가 해소될 때까지 회원의 콘텐츠(서비스) 이용을 제한할 수 있습니다.</span>

								<span className="access_sub_tit">제 14조 [교재 등의 판매 및 배송]</span>
								<span className="access_desc">① 회사의 각 사이트에서 교재 등의 제품을 판매할 경우 다음과 같이 서비스합니다.</span>
								<span className="access_desc">1. 회사의 사이트에서 콘텐츠 서비스와 관련하여 판매하는 교재의 구매는 회사의 사이트에서 가능합니다.</span>
								<span className="access_desc">2. 교재 등의 제품은 회사 사이트에 회원가입을 완료한 회원에 한하여 판매합니다.</span>
								<span className="access_desc">3. 회사는 회원의 교재 구매신청이 있는 경우 회원에게 수신확인통지를 합니다.</span>
								<span className="access_desc">4. 회사는 회원이 교재 배송 과정을 온라인으로 확인 할 수 있도록 제공합니다.</span>
								<span className="access_desc">5. 교재 배송은 회원의 구매 결제가 완료된 시점에서 7일 이내에 배송하는 것을 원칙으로 하며, 천재지변, 교재의 재고 부족 등으로 인하여 지연 될 수 있습니다.</span>
								<span className="access_desc">② 회사와 교재 구매계약을 체결한 회원은 교재를 수령한 날로부터 7일 이내에 청약의 철회(주문 취소)를 할 수 있습니다. 단 회원이 교재 등을 배송 받은 경우 다음 각 호의 1에 해당하는 경우에 반품 및 교환을 할 수 없습니다.</span>
								<span className="access_desc">1. 회원의 책임있는 사유로 교재 등이 멸실 또는 훼손된 경우</span>
								<span className="access_desc">2. 회원의 사용 또는 일부 소비에 의하여 교재 등의 가치가 현저히 감소한 경우</span>
								<span className="access_desc">③ 본 조 제 2항의 청약철회 기간에도 불구하고 배송 받은 교재를 다음 각 호의 사유로 반품 및 교환하고자 할 경우 문제점 발견 후 30일 혹은 수령일로 부터 3개월 이내로 하며 반품, 교환비용은 회사가 부담합니다. 단, 이때 이미 배송 받은 교재는 회사에 반송하여야 합니다.</span>
								<span className="access_desc">1. 배송된 교재가 주문내용과 상이하거나 회사가 제공한 정보와 상이할 경우</span>
								<span className="access_desc">2. 배송된 교재가 회사의 유통, 취급 중 발생된 외관상 하자가 있는 경우</span>
								<span className="access_desc">3. 배송된 교재가 파본(인쇄·제본오류 등 교재 제작 시 발생된 것으로 추정)인 경우</span>
								<span className="access_desc">④ 본 조 제3항의 각호에 해당하지 않는 사유로 배송 된 교재 등을 반품, 교환하는 경우 추가비용 일체를 회원이 부담해야 합니다. 이 때 회원이 부담할 배송비는 교재 등 구입 당시 배송비를 기준으로 하며 제주도 등의 섬과 산간지역 및 국외 배송인 경우 일반 배송업체의 배송비를 기준으로 합니다.</span>
								<span className="access_desc">⑤ 청약철회 등에 따라 교재를 환불할 때는 포인트, 쿠폰 등으로 할인받은 금액을 제외한 실 결제금액을 환불합니다.</span>

								<span className="access_sub_tit">제 15조 [회사의 의무]</span>
								<span className="access_desc">① 회사는 법령과 이 약관이 정하는 권리의 행사와 의무의 이행을 신의에 좇아 성실하게 하여야 합니다.</span>
								<span className="access_desc">② 회사는 회원이 안전하게 콘텐츠를 이용할 수 있도록 개인정보(신용정보 포함)보호를 위해 보안시스템을 갖추어야 하며 개인정보 처리방침을 공시하고 준수합니다.</span>
								<span className="access_desc">③ 회사는 회원이 콘텐츠이용 및 상품 구매에 대한 대금내역을 수시로 확인할 수 있도록 조치합니다.</span>
								<span className="access_desc">④ 회사는 콘텐츠이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 지체 없이 처리합니다. 회원이 제기한 의견이나 불만사항에 대해서는 게시판을 활용하거나 전자우편 등을 통하여 그 처리과정 및 결과를 전달합니다.</span>
								<span className="access_desc">⑤ 회사는 이 약관에서 정한 의무 위반으로 인하여 발생한 이용자가 입은 손해를 배상합니다.</span>

								<span className="access_sub_tit">제 16조 [회원의 의무]</span>
								<span className="access_desc">① 회원은 다음 행위를 하여서는 아니 되며, 회원이 이를 위반할 경우 회사는 기간을 정하여 서비스의 전부 또는 일부의 이용을 제한하거나 상당기간 최고 후 이용계약을 해지할 수 있습니다. 다만, 회사는 상기 제재가 있는 경우에 일정기간동안 회원에게 소명할 수 있는 기회를 부여하며, 회원이 자신의 고의나 과실이 없었음을 입증한 경우 회사는 서비스 제공 정지기간만큼 이용기간을 연장합니다.</span>
								<span className="access_desc">1. 신청 또는 변경 시 허위내용의 기재나 타인의 정보(ID 등 개인정보) 도용</span>
								<span className="access_desc">2. 서비스를 이용하여 얻은 정보(콘텐츠)를 회사의 사전 승낙 없이 이용자의 이용 이외의 목적으로 복제하거나 이를 출판, 전송 등에 사용하거나 제3자에게 제공하는 행위</span>
								<span className="access_desc">3. 회사에 게시된 정보의 변경</span>
								<span className="access_desc">4. 회사가 금지한 정보(컴퓨터 프로그램 등)의 송신 또는 게시</span>
								<span className="access_desc">5. 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</span>
								<span className="access_desc">6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</span>
								<span className="access_desc">7. 외설 또는 폭력적인 말이나 글, 화상, 음향, 기타 공서양속에 반하는 정보를 “회사”의 사이트에 공개 또는 게시하는 행위</span>
								<span className="access_desc">8. 다른 이용자의 서비스 이용을 방해하거나 회사의 운영진, 직원, 관계자로 사칭하는 행위</span>
								<span className="access_desc">9. 기타 불법적이거나 부당한 행위</span>
								<span className="access_desc">② 회원은 관계법령, 이 약관의 규정, 이용안내 및 콘텐츠와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</span>
								<span className="access_desc">③ 회원은 회사의 명시적인 동의나 승낙이 없는 한 서비스의 이용권한, 기타 이용 계약상의 지위를 타인에게 양도, 증여하거나 담보로 제공할 수 없습니다.</span>
								<span className="access_desc">④ 회원은 자신의 ID 및 비밀번호를 안전하게 관리하여야 하며, 관리소홀, 부정사용에 의하여 발생하는 결과에 대한 책임은 회원에게 있습니다.</span>

								<span className="access_sub_tit">제 17조 [지급방법]</span>
								<span className="access_desc">콘텐츠의 이용 및 상품 구매에 대한 대금지급방법은 다음 각 호의 방법 중 회사가 제시한 가능한 방법으로 할 수 있습니다.</span>
								<span className="access_desc">① 폰뱅킹, 인터넷뱅킹, 메일 뱅킹 등의 각종 계좌이체</span>
								<span className="access_desc">② 선불카드, 직불카드, 신용카드 등의 각종 카드결제</span>
								<span className="access_desc">③ 온라인무통장입금</span>
								<span className="access_desc">④ 전자화폐에 의한 결제</span>
								<span className="access_desc">⑤ 마일리지 등 회사가 지급한 포인트에 의한 결제</span>
								<span className="access_desc">⑥ 회사와 계약을 맺었거나 회사가 인정한 상품권에 의한 결제</span>
								<span className="access_desc">⑦ 전화 또는 휴대전화를 이용한 결제</span>
								<span className="access_desc">⑧ 기타 전자적 지급방법에 의한 대금지급 등</span>

								<span className="access_sub_tit">제 18조 [서비스의 제공 및 중단]</span>
								<span className="access_desc">① 콘텐츠서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</span>
								<span className="access_desc">② 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 콘텐츠서비스의 제공을 일시적으로 중단할 수 있습니다. 이 경우 회사는 제10조 2항에 정한 방법으로 회원에게 통지합니다. 다만, 회사가 사전에 통지할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.</span>
								<span className="access_desc">③ 회사는 귀책사유로 인하여 유료 (콘텐츠)서비스의 제공이 일시적으로 중단됨으로 인하여 회원이 입은 손해에 대하여 서비스를 사용하지 못한 기간만큼 서비스 기간을 연장하는 등의 방식으로 배상합니다. 단, 제3자의 고의 또는 과실로 인하여 서비스가 중지되거나 장애가 발생한 경우에는 회사는 책임이 없습니다.</span>
								<span className="access_desc">④ 회사가 사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우, 제10조에서 정한 방법으로 회원에게 통지하고 제25조 6항에 따라 환불조치 합니다.</span>
								<span className="access_desc">⑤ 회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 서비스제공화면에 공지한 바에 따릅니다.</span>

								<span className="access_sub_tit">제 19조 [콘텐츠서비스의 변경]</span>
								<span className="access_desc">① 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 콘텐츠서비스를 변경할 수 있습니다.</span>
								<span className="access_desc">② 회사는 제1항에 따라 서비스가 변경되는 경우 변경사유 및 변경 내용을 제10조의 방법으로 회원에게 통지합니다.</span>

								<span className="access_sub_tit">제 20조 [정보의 제공 및 광고의 게재]</span>
								<span className="access_desc">① 회사는 회원이 서비스이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 전자우편 등의 방법으로 회원에게 제공할 수 있습니다. 다만, 회원은 언제든지 전자우편 등을 통하여 수신 거절을 할 수 있습니다.</span>
								<span className="access_desc">② 회사는 서비스 제공과 관련하여 해당 서비스화면, 회사의 각 사이트, 전자우편 등에 광고를 게재할 수 있습니다. 광고가 게재된 전자우편 등을 수신한 회원은 수신거절을 할 수 있습니다.</span>

								<span className="access_sub_tit">제 21조 [회원의 게시물 및 삭제]</span>
								<span className="access_desc">① 회사는 회원이 등록한 게시물 중 본 약관과 정보통신망이용촉진 및 정보보호 등에 관한 법률 등 관계 법률을 위반한 게시물 또는 다음 각 호에 해당하는 경우에는 이를 즉시 삭제할 수 있습니다. 단 제 10호의 경우에는 당해 사항을 사전에 회사의 공지사항에 공지합니다.</span>
								<span className="access_desc">1. 회사, 다른 회원 또는 제3자를 비방하거나 명예를 손상시키는 내용인 경우</span>
								<span className="access_desc">2. 공공질서 및 미풍양속에 위반되는 내용을 유포하는 경우</span>
								<span className="access_desc">3. 범죄적 행위에 결부된다고 인정되는 내용인 경우</span>
								<span className="access_desc">4. 회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 내용인 경우</span>
								<span className="access_desc">5. 법령을 위반하거나 타인의 권리를 침해하는 방식으로 분쟁을 야기하는 경우</span>
								<span className="access_desc">6. 불필요하거나 승인되지 않은 광고, 판촉물을 게재하는 경우</span>
								<span className="access_desc">7. 타인의 개인정보를 도용, 사칭하여 작성한 내용이거나, 타인이 입력한 정보를 무단으로 위·변조한 내용인 경우</span>
								<span className="access_desc">8. 동일한 내용을 중복하여 다수 게시하는 등 게시의 목적에 어긋나는 경우</span>
								<span className="access_desc">9. 회사의 게시판 운영지침 등에 위반된다고 판단되는 경우</span>
								<span className="access_desc">10. 회사는 서비스용 설비의 용량에 여유가 없다고 판단되는 경우</span>
								<span className="access_desc">② 회사가 운영하는 게시판 등에 게시된 정보로 인하여 법률상 이익이 침해된 자는 회사에게 당해 정보의 삭제 또는 반박내용의 게재를 요청할 수 있습니다. 이 경우 회사는 지체 없이 필요한 조치를 취하고 이를 즉시 신청인에게 통지합니다.</span>

								<span className="access_sub_tit">제 21조의 1[회원의 클래스 및 삭제 등]</span>
								<span className="access_desc">① 비바클래스 서비스를 이용하는 회원은 자신의 클래스를 개설할 수 있으며, 개설된 클래스 및 클래스 구성원 등에 대한 관리와 운영의 책임은 클래스를 개설한 회원(이하 “클래스 관리자”라 합니다)에게 있습니다.</span>
								<span className="access_desc">② “클래스 관리자”는 자신의 클래스에 참여할 학생 또는 다른 회원을 초대하거나 참여를 수락함으로써 클래스 구성원을 생성하며, 클래스에 속한 학생이 만 14세 미만인 경우 “클래스 관리자”는 학생의 법정대리인으로부터 서비스 이용에 따른 개인정보 수집이용, 제3자 제공 동의를 받아야 합니다. 이때 회사는 “클래스 관리자”에게 그 동의 여부를 확인할 수 있습니다.</span>
								<span className="access_desc">③ “클래스 관리자”는 클래스 구성원이 부적절한 게시글을 등록했을 경우 이를 삭제 또는 신고 등의 조치를 취해야 합니다.</span>
								<span className="access_desc">④ 회원이 클래스의 구성원인 경우 해당 “클래스 관리자”의 지시에 따라야 합니다.</span>
								<span className="access_desc">⑤ 회사는 회원의 귀책 사유와 서비스 탈퇴에 따라 비바클래스의 클래스를 정지 및 폐쇄 조치할 수 있으며, 회사의 해당 조치에 의해 회원에게 발생한 손해에 대해 책임을 지지 않습니다.</span>
								<span className="access_desc">⑥ 비바클래스 서비스 내에서 클래스 관리자인 회원이 탈퇴하는 경우는 이용계약 해지가 아닌 비바샘에서의 탈퇴를 의미하므로 게시물이 본인 계정에의 기록이 아닌, 클래스 기록으로 구분하여 자동 삭제되지 않습니다.</span>
								<span className="access_desc">⑦ 본 조 제1항부터 6항의 내용은 샘퀴즈 플레이 서비스 및 스마트 문제은행을 이용하는 회원에게 준용하며, 이 때 “클래스 관리자”와 “클래스”는 각각 다음 각호와 같이 봅니다.</span>
								<span className="access_desc">1. 샘퀴즈 플레이 서비스 : 샘퀴즈 플레이를 개설한 회원 / 퀴즈, 보드</span>
								<span className="access_desc">2. 스마트 문제은행 : 스마트 문제은행 평가를 URL 응시로 발행한 회원 / 평가 URL</span>

								<span className="access_sub_tit">제 22조 [저작권 등의 귀속]</span>
								<span className="access_desc">① 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</span>
								<span className="access_desc">② 이용자는 회사가 제공하는 서비스를 이용함으로써 얻은 정보 중 회사 또는 제공업체에 지적재산권이 귀속된 정보를 회사 또는 제공업체의 사전승낙 없이 복제, 전송, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</span>
								<span className="access_desc">③ 이용자가 서비스 내에 게시한 게시물의 저작권은 저작권법에 의해 보호를 받습니다. 회사는 회사의 홍보를 위해 제한된 용도에 한해 회원의 게시물을 활용할 수 있습니다. 단, 회원이 이의를 제기할 경우 사용을 중단합니다.</span>
								<span className="access_desc">④ 이용자는 자신이 게시한 게시물을 회사가 국내외에서 다음 각 호의 목적으로 사용하는 것을 허락합니다. 단, 제2호 및 3호의 경우 이용자가 이의를 제기할 경우 회사는 이의를 제기한 시점부터 전시, 배포를 중단합니다.</span>
								<span className="access_desc">1. 서비스 내에서 이용자 게시물의 복제, 전송, 전시, 배포 및 우수 게시물을 서비스화면에 노출하기 위하여 이용자게시물의 크기를 변환하거나 단순화하는 등의 방식으로 수정 하는 것</span>
								<span className="access_desc">2. 회사에서 운영하는 관련 사이트의 서비스 내에서 이용자 게시물을 전시, 배포 하는 것</span>
								<span className="access_desc">3. 회사의 서비스를 홍보하기 위한 목적으로 미디어, 통신사 등에게 이용자의 게시물 내용을 보도, 방영하도록 하는 것</span>
								<span className="access_desc">⑤ 제4항의 규정에도 불구하고, 회사가 이용자의 게시물을 제4항 각 호에 기재된 목적 이외에 상업적 목적(예 : 제3자에게 게시물을 제공하고 금전적 대가를 지급받는 경우 등)으로 사용할 경우에는 사전에 해당 이용자로부터 동의를 얻어야 합니다. 게시물에 대한 회사의 사용 요청, 이용자의 동의 및 동의철회는 전화, 전자우편, 팩스 등 회사가 요청하는 방식에 따릅니다.</span>
								<span className="access_desc">⑥ 회사는 회원이 탈퇴하거나 제16조 1항에 의하여 회원 자격을 상실한 경우 별도의 동의 또는 통보절차 없이 회원의 게시물을 삭제할 수 있습니다.</span>
								<span className="access_desc">⑦ 회사는 회사의 합병, 영업양도, 회사가 운영하는 사이트간의 통합 등의 사유로 원래의 게시물의 내용을 변경하지 않고 게시물의 게시 위치를 변경할 수 있습니다.</span>

								<span className="access_sub_tit">제 23조 [게시물 내용에 따른 책임]</span>
								<span className="access_desc">① 회원이 게시한 게시물에 대한 저작권을 포함한 모든 권리 및 책임은 해당 게시물을 게재한 회원에게 있으며, 게시물 게재로 회원은 회사에게 저장, 복제, 수정, 공중 송신, 전시, 배포 등의 이용 권한을 부여하게 되므로 회원은 이에 필요한 권리를 보유하고 있어야 합니다.</span>
								<span className="access_desc">② 회사는 회원이 게시, 게재하거나 서비스를 통해 전송, 배포한 자료에 대해서는 책임을 지지 않습니다.</span>
								<span className="access_desc">③ 회원은 본인의 게시물에 대한 삭제, 비공개 처리를 할 수 있고 타인의 이용 또는 접근을 통제할 수 있습니다.</span>
								<span className="access_desc">④ 회원의 게시물에 대하여 권리자로부터 저작권 침해로 이의가 제기된 경우 회사는 저작권법에 따라 해당 게시물은 삭제하거나, 복제·전송중단 조치를 할 수 있으며, 게시자는 저작권법에 따라 게시중단요청서비스를 통해 복제·전송중단 재게를 요청할 수 있습니다.</span>
								<span className="access_desc">⑤ 회원이 이용하는 서비스 중 회원의 선택으로 비회원의 서비스 접속 및 이용을 허용할 수 있는 경우, 비회원 및 비회원이 게시한 게시물의 관리와 그 책임은 이를 허용한 회원에게 있습니다.</span>

								<span className="access_sub_tit">제 24조 [제3자 서비스 정보 공유]</span>
								<span className="access_desc">① 회원은 일부 서비스를 통해 제3자 서비스(YouTube 동영상 등)를 이용하거나 다른 회원이 제공한 정보를 제3자 서비스와 공유하도록 선택할 수 있습니다.</span>
								<span className="access_desc">② 회사는 제3자 서비스가 링크된 사이트 또는 서비스를 제공하는 제3자를 포함하여 제3자의 개인 정보 보호, 권리 또는 기타 관행에 대해 책임을 지지 않습니다.</span>
								<span className="access_desc">③ 제1항에 따라 제3자 서비스에 회사가 제공한 서비스 링크가 포함되어 있다고 해서 회사가 링크된 사이트 또는 서비스를 보증한다는 의미는 아닙니다.</span>

								<span className="access_sub_tit">제 25조 [개인정보보호]</span>
								<span className="access_desc">① 회사는 정보통신망이용촉진 및 정보보호에 관한 법률 및 개인정보보호법 등 관계 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보 처리방침이 적용됩니다.</span>
								<span className="access_desc">② 회사가 이용자의 개인 식별이 가능한 개인정보를 수집하는 때에는 당해 이용자의 동의를 받으며, 이용자는 언제든지 회사가 가지고 있는 자신의 개인정보에 대해 열람 및 오류의 정정을 요구할 수 있으며, 회사는 이에 대해 지체 없이 필요한 조치를 취할 의무를 집니다.</span>
								<span className="access_desc">③ 회사는 이용자가 이용신청 등에서 제공한 정보와 제1항에 의하여 수집한 정보를 당해 이용자의 동의 없이 목적 외로 이용하거나 제3자에게 제공할 수 없습니다. 다만, 다음의 경우에는 예외로 합니다.</span>
								<span className="access_desc">1. 통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 식별할 수 없는 형태로 제공하는 경우</span>
								<span className="access_desc">2. 콘텐츠 제공에 따른 요금정산을 위하여 필요한 경우</span>
								<span className="access_desc">3. 도용방지를 위하여 본인확인에 필요한 경우</span>
								<span className="access_desc">4. 약관의 규정 또는 법령에 의하여 필요한 불가피한 사유가 있는 경우</span>
								<span className="access_desc">④ 회사는 개인정보보호를 위하여 관리자를 한정하여 그 수를 최소화하며, 개인정보의 분실, 도난, 유출, 변조 등으로 인한 이용자의 손해에 대하여 책임을 집니다.</span>
								<span className="access_desc">⑤ 회사 또는 그로부터 개인정보를 제공받은 자는 이용자가 동의한 범위 내에서 개인정보를 사용할 수 있으며, 목적이 달성된 경우에는 당해 개인정보를 지체 없이 파기합니다.</span>

								<strong className="access_tit mt25">제 4장 서비스 이용계약의 취소와 환불</strong>

								<span className="access_sub_tit">제 26조 [회원의 서비스 이용계약 취소]</span>
								<span className="access_desc">① 회사와 서비스의 이용에 관한 계약을 체결한 회원은 서비스 이용계약의 취소를 요청할 수 있습니다. 다만, 본 약관 및 관계법령에 위반되지 않는 범위 내에서 회사의 각 서비스마다 달리 적용할 수 있습니다.</span>
								<span className="access_desc">② 회원은 제1항의 청약철회(취소)를 하고자 하는 경우 회사의 고객센터에 전화를 하거나 모사전송(FAX) 등의 방법으로 회사에 그 의사를 표시하여야 합니다.</span>

								<span className="access_sub_tit">제 27조 [회원의 취소와 변경 및 환불정책 ]</span>
								<span className="access_desc">① 회사는 회원이 서비스 이용계약의 취소 의사표시를 한 경우 이를 즉시 접수하고 회원의 요청과 환불규정을 확인한 후, 3일 이내(영업일 기준)에 환불하여 드립니다. 단, 청약철회(취소)가 불가한 콘텐츠(서비스)임을 고지하는 등 관계법령에 따른 조치를 취한 경우에는 회원의 청약철회권이 제한될 수 있습니다.</span>
								<span className="access_desc">② 회사가 환불할 경우에 회원이 서비스이용으로부터 얻은 이익에 해당하는 금액과 위약금 등 회사가 해당 사례에 따라 공제하기로 명시한 금액을 공제하고 환불할 수 있습니다.</span>
								<span className="access_desc">③ 회사는 환불시, 이용자가 대금을 결제한 방법과 동일한 방법으로 결제대금의 전부 또는 일부를 환급합니다. 단, 동일한 방법으로 환급이 불가능할 경우에 즉시 이를 이용자에게 고지하고, 이용자가 선택한 방법으로 환급합니다.</span>
								<span className="access_desc">④ 회사는 회원의 청약 철회 시 다음의 기준에 따라 환불합니다.</span>

								<span className="access_desc">● 원격교육연수원 서비스 수강료 환불 기준</span>
								<table className="tbl_terms">
									<caption></caption>
									<colgroup>
										<col style={{width: '21%'}}/>
										<col style={{width: '37%'}}/>
										<col style={{width: 'auto'}}/>
									</colgroup>
									<thead>
									<tr>
										<th>구분</th>
										<th>반환사유 발생일</th>
										<th>환불금액</th>
									</tr>
									</thead>
									<tbody>
									<tr>
										<th rowSpan="3">연수기간이 30일 이내</th>
										<td>연수 시작일 전</td>
										<td>결제금액 전액 환불</td>
									</tr>
									<tr>
										<td>총 연수 기간의 1/2 경과 전</td>
										<td>이용한 콘텐츠(강의내용을 실제 수강한 차시를 말한다)의 결제금액 차감 후 환불</td>
									</tr>
									<tr>
										<td>총 연수 기간의 1/2 경과 후</td>
										<td>환불 불가</td>
									</tr>
									<tr>
										<th rowSpan="2">연수기간이 30일 초과</th>
										<td>연수 시작일 전</td>
										<td>결제금액 전액 환불</td>
									</tr>
									<tr>
										<td>연수 시작일 후</td>
										<td>반환 사유가 발생한 해당월의 반환 대상 결제금액(연수기간이 1개월 이내인 경우의 기준에 따라 산출한 금액을 말한다)과 나머지 월의 결제금액의 전액을 합산</td>
									</tr>
									<tr>
										<th>비고</th>
										<td colSpan="2">
											<p>1. 원격교육의 경우 환불금액은 이용한 콘텐츠 즉, 강의내용을 실제 수강한 차시(인터넷으로 수강하거나 학습기기로 저장한 것을 말한다)에 해당하는 금액을 뺀 금액으로 한다.</p>
											<p>2. 연수과정을 수강연기(연수 시작일 후 연수 기간을 변경한 것을 말한다)한 경우는 환불이 불가합니다.</p>
											<p>3. 직무연수 4학점의 경우는 오프라인 시험(출석평가)을 응시한 경우 환불이 불가합니다.</p>
											<p>4. 교재 및 상품을 받으신 경우 반송 확인 후 처리됩니다.</p>
										</td>
									</tr>
									</tbody>
								</table>

								<span className="access_desc">⑤ 회원이 서비스 이용계약을 취소할 경우 해당 이용계약에 따라 적립·지급된 포인트, 캐쉬는 차감되며, 회사의 유료 서비스 결제 시 해당 사이트에서 통용되는 포인트를 사용한 경우에는 환불금액에서 해당 포인트는 제외됩니다. 다만 현금으로 구매한 캐쉬의 경우 현금 또는 캐쉬로 환불합니다.</span>
								<span className="access_desc">⑥ 회사가 부득이한 사정으로 서비스를 지속할 수 없게 되는 경우 회사는 이를 회원에게 공지한 후 유료 서비스 이용 회원에게 최대한 신속하게 환불하여 드립니다.</span>
								<span className="access_desc">⑦ 서비스 이용 중인 콘텐츠를 다른 콘텐츠로 변경하고자 하는 경우 제1항 등 청약철회 또는 취소의 방법으로 환불처리 한 후 재신청하여야 하며, 직접 변경은 할 수 없습니다.</span>
								<span className="access_desc">⑧ 이용자가 체결한 구매계약에 의해서 제공되는 상품(서비스)에 콘텐츠(동영상 등)와 학습비와 재화(도서,교재,학습기기 등)가 포함되었을 경우, 각각 구분하여 학습비 반환 및 환급 기준을 적용합니다.</span>

								<span className="access_sub_tit">제 28조 [과오금의 환급]</span>
								<span className="access_desc">① 회사의 귀책사유로 과오금이 발생한 경우 회사는 과오금 전액을 환급합니다. 단, 이용자의 귀책사유로 과오금이 발생한 경우 회사는 환급하는데 소요되는 비용을 합리적인 범위 내에서 공제하고 환급할 수 있습니다.</span>
								<span className="access_desc">② 회사는 환불시, 이용자가 대금을 결제한 방법과 동일한 방법으로 결제대금의 전부 또는 일부를 환급합니다. 단, 동일한 방법으로 환급이 불가능할 경우에 즉시 이를 이용자에게 고지하고, 이용자가 선택한 방법으로 환급합니다.</span>

								<span className="access_sub_tit">제 29조 [회사의 계약해제·해지 및 이용제한]</span>
								<span className="access_desc">① 회사는 이용자가 제13조 2항 및 제16조 1항에서 정한 행위를 하였을 경우 사전통지 없이 계약을 해제·해지하거나 또는 기간을 정하여 서비스이용을 제한할 수 있습니다.</span>
								<span className="access_desc">② 제1항의 해제·해지는 회사가 자신이 정한 통지방법에 따라 이용자에게 그 의사를 표시한 때에 효력이 발생합니다.</span>
								<span className="access_desc">③ 이용자의 귀책사유에 따른 이용계약의 해제·해지의 경우 제25조의 환불규정을 적용하지 않을 수 있습니다.</span>

								<span className="access_sub_tit">제 30조 [정회원 마일리지 정책_교수학습지원 서비스]</span>
								<span className="access_desc">① 교수학습지원 서비스에서 “회사”는 “정회원”의 서비스 이용 및 이벤트 참여 등에 따라 마일리지를 적립해 줄 수 있습니다.</span>
								<span className="access_desc">② 마일리지 적립 및 사용에 관한 상세한 사항은 회사가 정한 정책에 따르며, “회사”는 교수학습지원서비스 내 별도 게시를 통하여 이를 안내합니다.</span>
								<span className="access_desc">③ “회사＂는 마일리지를 부당한 방법으로 적립하거나 사용한 경우 해당 마일리지의 적립 및 사용을 철회하고 서비스 이용을 제한하거나 회원탈퇴 등의 조치를 취할 수 있습니다.</span>
								<span className="access_desc">④ “정회원”은 본인의 마일리지를 타인에게 양도 또는 증여할 수 없습니다.</span>
								<span className="access_desc">⑤ 마일리지는 매년 1월 1일부터 12월 31일까지 적립을 기준으로 하며, 다음 연도 1월 1일 자동소멸 됩니다.</span>
								<span className="access_desc">⑥ “정회원”의 회원탈퇴 시 보유한 마일리지는 모두 소멸됩니다.</span>
								<span className="access_desc">⑦ 마일리지는 현금으로 환불되지 않으며, 유효기간이 지나 소멸된 마일리지는 복구되지 않습니다.</span>

								<span className="access_sub_tit">제 31조 [포인트 정책_원격교육연수원 서비스]</span>
								<span className="access_desc">원격교육연수원 서비스에서 “회사”는 아래와 같이 포인트 정책을 운영합니다. 그 외의 포인트 적립 및 사용에 관한 자세한 사항은 원격교육 서비스 내에 별도 안내합니다.</span>
								<span className="access_desc">① 포인트 적립포인트는 사이트 이용(회원가입, 로그인, 연수 신청, 연수 후기 작성, 이벤트 등)을 통해 적립됩니다.</span>
								<span className="access_desc">② 포인트 소멸</span>
								<span className="access_desc">1. 포인트는 적립된 연도부터 다음 해 12월 말일까지 사용할 수 있으며, 유효 기간 내 미사용 한 포인트는 1월 첫째 주 월요일에 자동 소멸됩니다.</span>
								<span className="access_desc">2. 회원탈퇴 시 보유한 포인트는 모두 소멸됩니다.</span>
								<span className="access_desc">3. 회사는 포인트 소멸 30일 전 포인트 소멸 사실을 전자우편으로 회원에게 통지합니다.</span>
								<span className="access_desc">③ 포인트 환불 및 복구</span>
								<span className="access_desc">1. 포인트는 현금으로 환불되지 않습니다.</span>
								<span className="access_desc">2. 유효기간이 지나 소멸된 포인트는 복구되지 않습니다.</span>
								<span className="access_desc">3. 회원의 포인트 적립에 오류가 있거나 일부 포인트가 차감된 경우에는 회원이 회사에 이의 신청을 할 수 있습니다. 이의신청에 따라 그 내역을 확인한 후 정당한 경우에는 차감된 포인트를 복구한 후 그 결과를 회원에게 통지합니다.</span>
								<span className="access_desc">④ 포인트 사용 시 유의사항</span>
								<span className="access_desc">1. 포인트는 10점부터 1점 단위로 사용이 가능합니다.</span>
								<span className="access_desc">2. 포인트는 연수과정 구매 시에만 사용할 수 있습니다.</span>
								<span className="access_desc">3. 포인트는 타인에게 양도할 수 없습니다.</span>

								<strong className="access_tit mt25">제 5장 기 타</strong>

								<span className="access_sub_tit">제 32조 [면책조항]</span>
								<span className="access_desc">① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 콘텐츠를 제공할 수 없는 경우에는 콘텐츠 제공에 관한 책임이 면제됩니다.</span>
								<span className="access_desc">② 회사는 이용자의 귀책사유로 인한 콘텐츠이용의 장애에 대하여는 책임을 지지 않습니다.</span>
								<span className="access_desc">③ 회사는 회원이 콘텐츠와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</span>
								<span className="access_desc">④ 회사는 이용자 상호간 또는 이용자와 제3자 간에 콘텐츠를 매개로 하여 발생한 분쟁 등에 대하여 책임을 지지 않습니다.</span>

								<span className="access_sub_tit">제 33조 [분쟁의 해결]</span>
								<span className="access_desc">① 회사는 분쟁이 발생하였을 경우에 이용자가 제기하는 정당한 의견이나 불만을 반영하여 적절하고 신속한 조치를 취합니다. 다만, 신속한 처리가 곤란한 경우에 회사는 이용자에게 그 사유와 처리일정을 통보합니다.</span>
								<span className="access_desc">② 분쟁이 발생하였을 경우 회사 또는 이용자는 콘텐츠산업 진흥법 제30조 제1항에 따라 콘텐츠 이용과 관련한 피해의 구제와 분쟁의 조정을 위하여 콘텐츠분쟁조정위원회에 분쟁조정을 신청할 수 있습니다.</span>

								<span className="access_sub_tit">제 34조 [전속관할]</span>
								<span className="access_desc">① 회사와 이용자간의 콘텐츠계약에 관한 소의 관할은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우 거소를 관할하는 지방법원의 전속관할로 합니다.</span>
								<span className="access_desc">② 제소 당시 이용자의 주소 또는 거소가 분명하지 아니한 경우에는 “민사소송법”에 따라 관할법원을 정합니다.</span>

								<strong className="access_tit mt25">[부칙]</strong>
								<span className="access_desc">이 약관은 2025년 3월 11일부터 적용합니다.</span>
							</div>

						</div>
						<div className="access_history">
							<h5>이전의 이용 약관은 아래에서 확인하실 수 있습니다.</h5>
							<p>[교수학습지원 서비스 단독회원 이용약관]</p>
							<button onClick={this.handlePopup} value="access_ver1_6" data-name="이용약관 2021년 12월 1일 - 2023년 9월 23일">▶이전 이용약관 보기(2021년 12월 1일 - 2023년 9월 23일)</button>
							<button onClick={this.handlePopup} value="access_ver1_5" data-name="이용약관 2021년 6월 30일 - 2021년 11월 30일">▶이전 이용약관 보기(2021년 6월 30일 - 2021년 11월 30일)</button>
							<button onClick={this.handlePopup} value="access_ver1_4" data-name="이용약관 2016년 12월 9일 - 2021년 6월 29일">▶이전 이용약관 보기(2016년 12월 9일 - 2021년 6월 29일)</button>
							<button onClick={this.handlePopup} value="access_ver1_3" data-name="이용약관 2015년 12월 1일 - 2016년 12월 8일">▶이전 이용약관 보기(2015년 12월 1일 - 2016년 12월 8일)</button>
							<button onClick={this.handlePopup} value="access_ver1_2" data-name="이용약관 2015년 7월 31일 - 2015년 11월 30일">▶이전 이용약관 보기(2015년 7월 31일 - 2015년 11월 30일)</button>
							<button onClick={this.handlePopup} value="access_ver1_1" data-name="이용약관 2013년 2월 12일 - 2015년 7월 30일">▶이전 이용약관 보기(2013년 2월 12일 - 2015년 7월 30일)</button>

							<p>[원격교육연수원 서비스 단독회원 이용약관]</p>
							<button onClick={this.handlePopup} value="access_ver2_6" data-name="이용약관 2023년 7월 5일 - 2023년 9월 23일">▶이전 이용약관 보기(2023년 7월 5일 - 2023년 9월 23일)</button>
							<button onClick={this.handlePopup} value="access_ver2_5" data-name="이용약관 2020년 1월 13일 - 2020년 7월 4일">▶이전 이용약관 보기(2020년 1월 13일 - 2020년 7월 4일)</button>
							<button onClick={this.handlePopup} value="access_ver2_4" data-name="이용약관 2018년 2월 26일 - 2020년 1월 12일">▶이전 이용약관 보기(2018년 2월 26일 - 2020년 1월 12일)</button>
							<button onClick={this.handlePopup} value="access_ver2_3" data-name="이용약관 2017년 2월 11일 - 2018년 2월 25일">▶이전 이용약관 보기(2017년 2월 11일 - 2018년 2월 25일)</button>
							<button onClick={this.handlePopup} value="access_ver2_2" data-name="이용약관 2016년 7월 25일 - 2017년 2월 10일">▶이전 이용약관 보기(2016년 7월 25일 - 2017년 2월 10일)</button>
							<button onClick={this.handlePopup} value="access_ver2_1" data-name="이용약관 2013년 11월 15일 - 2016년 7월 24일">▶이전 이용약관 보기(2013년 11월 15일 - 2016년 7월 24일)</button>

							<p>[통합회원 특별약관]</p>
							<button onClick={this.handlePopup} value="access_ver3_7" data-name="이용약관 2025년 1월 2일 - 2025년 3월 10일">▶이전 이용약관 보기(2025년 1월 2일 - 2025년 3월 10일)</button>
							<button onClick={this.handlePopup} value="access_ver3_6" data-name="이용약관 2024년 4월 3일 - 2025년 1월 1일">▶이전 이용약관 보기(2024년 4월 3일 - 2025년 1월 1일)</button>
							<button onClick={this.handlePopup} value="access_ver3_5" data-name="이용약관 2023년 3월 20일 - 2024년 4월 2일">▶이전 이용약관 보기(2023년 3월 20일 - 2024년 4월 2일)</button>
							<button onClick={this.handlePopup} value="access_ver3_4" data-name="이용약관 2023년 9월 24일 – 2024년 3월 19일">▶이전 이용약관 보기(2023년 9월 24일 – 2024년 3월 19일)</button>
							<button onClick={this.handlePopup} value="access_ver3_3" data-name="이용약관 2023년 1월 2일 - 2023년 9월 23일">▶이전 이용약관 보기(2023년 1월 2일 - 2023년 9월 23일)</button>
							<button onClick={this.handlePopup} value="access_ver3_2" data-name="이용약관 2020년 7월 5일 - 2023년 1월 1일">▶이전 이용약관 보기(2020년 7월 5일 - 2023년 1월 1일)</button>
							<button onClick={this.handlePopup} value="access_ver3_1" data-name="이용약관 2019년 8월 31일 - 2020년 7월 4일">▶이전 이용약관 보기(2019년 8월 31일 - 2020년 7월 4일)</button>
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
)(withRouter(TermsService));