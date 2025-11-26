import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class TermsThirdPrivacyPopup extends Component {


    componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/termsThirdPrivacy',
			'page_title': '개인정보 제3자 정보 제공에 대한 동의 | 회원가입｜비바샘'
		});
    }

    render() {
        
        return (
        
			<section id="pop_content">
				<div className="marketing">
					<table className="tbl_terms">
						<caption>개인정보 제3자 정보 제공에 대한 동의 테이블</caption>
						<colgroup>
							<col style={{width: '35%'}} />
							<col style={{width: '65%'}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col">구분</th>
								<th scope="col">내용</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th>제공받는 자</th>
								<td>(주)비상교육 티스쿨</td>
							</tr>
							<tr>
								<th>제공 목적</th>
								<td>
									<ul className="list_bar">
										<li>제휴사 웹사이트 로그인</li>
										<li>제휴사 서비스 제공</li>
										<li>교사 혜택 제공</li>
										<li>제휴사가 제공하는 홍보 정보 전송</li>
									</ul>
								</td>
							</tr>
							<tr>
								<th>제공 항목</th>
								<td>
									<ul className="list_bar">
										<li>아이디, 이름, 생년월일, 성별, 이메일, 휴대전화번호,개인정보 유효기간</li>
										<li>본인 확인 결과값 (CI)</li>
									</ul>
								</td>
							</tr>
							<tr>
								<th>보유 및 <br />이용 기간</th>
								<td>회원 탈퇴 혹은 제휴사 정보 제공 동의 철회 시까지</td>
							</tr>
						</tbody>
					</table>
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
)(withRouter(TermsThirdPrivacyPopup));
