import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class TermsThirdMarketingPopup extends Component {

    state={
        termVersion: ''
    }

    componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/termsThirdMarketing',
			'page_title': '약관 | 회원가입｜비바샘'
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
				<div className="popup_content_etc">
					<div className="access_txt">
						<div className="terms_wrap tschool">
							<div className="blind">티스쿨 - 교육청 위탁연수 정보 및 마케팅 활용 동의</div>

							{/*티스쿨 소스 - br태그 col 인라인 스타일 수정해야함*/}
							<div className="terms">
								<table className="qna_table_template mt0">
									<caption>교육청 위탁연수 정보 및 마케팅 정보</caption>
									<colgroup>
										<col style={{width:'33%'}} />
										<col style={{width:'33%'}} />
										<col style={{width:'34%'}} />
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
										<td className="ta_l">전국 시도 교육청 무료/유료 위탁연수 안내 신규연수 과정 및 다양한 학습정보와 이벤트 소식 (SMS,
											이메일, 전화)
										</td>
										<td className="ta_l">성명, 아이디, 소속 교육청, 휴대전화번호(SMS, 유선안내), 이메일(DM), 담당교과</td>
										<td className="ta_l">회원탈퇴 시 까지 또는 고객요청에 따라 개인정보 이용동의 철회 요청시 까지</td>
									</tr>
									</tbody>
								</table>
								<p className="mt10">※ 위의 개인정보의 마케팅 광고 활용에 대한 선택 동의를 거부하셔도 회원가입은 가능하나, 다양한 교육청 위탁연수 정보 및 이수독려 안내, 이벤트 혜택안내가 제한 될 수 있습니다.</p>
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
