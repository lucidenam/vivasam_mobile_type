import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

	constructor(props) {
		super(props);
		this.state = {
			popState : 0, // 서비스 더보기 ( 0 : 안보임 / 1 : 비바샘 서비스 / 2: 티스쿨 서비스)
			agreeCheck : 0 // 개인정보 체크
		};

		this.vivasamPopClick();
		this.tschoolPopClick();
		this.popClose();
	}

	// 개인정보 선택
	updateAgreeCheckChange = () => {
		const { logged, loginInfo , history, BaseActions } = this.props;
		this.setState({
			agreeCheck:!this.state.agreeCheck
		});
	};

	// 이벤트 신청 검사
	eventApply = () => {
		const { logged, loginInfo, history, BaseActions} = this.props;
		if(!logged){ // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
			history.push("/login");
		}else{ // 로그인시
			if(this.state.agreeCheck == 0){
				common.info("개인정보 수집 및 이용에 동의해 주세요.");
				return;
			}else{
				if( loginInfo.ssoMemberYN == "Y" ){
					common.info("이미 통합회원으로 전환 하셨습니다.");
					return;
				}
				history.push("/conversion/agree");
			}
		}
	};

	vivasamPopClick = () => {
		this.setState({
			popState : 1
		});
	}

	tschoolPopClick = () => {
		this.setState({
			popState : 2
		});
	}

	popClose = () =>{
		this.setState({
			popState : 0
		});
	}

    render () {

        return (
        		<section class="event190824">
        		<h1><img src="/images/events/2019/event190824/img.jpg" alt="비바샘 + 티스쿨원격교육연수원 비상교육 선생님 통합회원 전환 EVENT"/></h1>
        		<div class="blind">
        			<h2>비상교육 선생님 통합회원 전환 EVENT</h2>
        			<p>2019년 8월 31일부터 비바샘, 티스쿨원격교육연수원 선생님들께 통합회원 혜택을 제공합니다. 이벤트 기간 내 통합회원으로 전환하시면 2배의 선물을 드립니다.</p>
        			<dl>
        				<dt>이벤트 기간</dt>
        				<dd>2019년 8월 31일 ~ 10월 31일</dd>
        			</dl>
        		</div>

        		<div>
        			<img src="/images/events/2019/event190824/img2.jpg" alt="" />
        			<div class="blind">
        				<dl>
        					<dt>비바샘</dt>
        					<dd>
        						<ul>
        							<li>30만 개의 과목별 수업 자료</li>
        							<li>국내 최대 규모의 문제은행</li>
        							<li>현장맞춤형 창의융합/수업혁신 자료</li>
        							<li>비상교육 네트워크 자료 (교재/이러닝/입시)</li>
        						</ul>
        					</dd>
        					<dt>티스쿨원격교육원수원</dt>
        					<dd>
        						<ul>
        							<li>차별화된 선생님 맞춤형 원격연수</li>
        							<li>전국 17개 시 도 교육청 연수 실시</li>
        							<li>신규 선생님 전원 무료 수강권</li>
        							<li>가입 포인트 1,000점 + 누적 포인트 현금화</li>
        						</ul>
        					</dd>
        				</dl>
        				<ul>
        					<li>선생님 전용 연수/문화행사</li>
        					<li>선생님 전용 이벤트/캠페인</li>
        					<li>맞춤형 메일 서비스 (교육청/과목/테마별)</li>
        					<li>선생님 전용 고객센터</li>
        				</ul>
        			</div>

        			<div id="btnPopIntegrated" class="btn_wrap">
						<a class="left vivasam" onClick={this.vivasamPopClick}><img src="/images/events/2019/event190824/btn_service_v.png" alt="비바샘 서비스 자세히 보기" /></a>
        				<a class="right tschool" onClick={this.tschoolPopClick}><img src="/images/events/2019/event190824/btn_service_t.png" alt="티스쿨 서비스 자세히 보기" /></a>
        			</div>

        			<div id="popIntegrated" style={{ visibility : this.state.popState != 0 ? 'visible' : 'hidden' }}>
        				<div class="layer_mask"></div>
        				<div class="layer_popup">
        					<img src="/images/member/pop_service_v.png" alt="비바샘 서비스" class="vivasam" style={{ display : this.state.popState == 1 ? 'block' : 'none' }}/>
        					<img src="/images/member/pop_service_t.png" alt="티스쿨 서비스" class="tschool" style={{ display : this.state.popState == 2 ? 'block' : 'none' }}/>
        					<button class="btn_close" onClick={this.popClose}  style={{ visibility : this.state.popState != 0 ? 'visible' : 'hidden' }}><span class="blind">닫기</span></button>
        				</div>
        			</div>
        		</div>

        		<div class="cont_wrap">
        			<dl class="agree_info">
        				<dt>개인정보 수집 및 이용 동의</dt>
        				<dd>
        					<ul>
        						<li>- 이용목적 : 경품 배송 및 고객문의 응대</li>
        						<li>- 수집하는 개인정보 : 성명, 배송지 정보, 휴대전화번호</li>
        						<li>- 개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
        						<li>- 선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다. ㈜다우기술-사업자번호: 220-81-02810)</li>
        					</ul>
        				</dd>
        			</dl>
        			<p class="agree">
        				<input type="checkbox" id="infoCheck01" value="" class="checkbox" checked={this.state.agreeCheck == 1} onChange={this.updateAgreeCheckChange}/>
        				<label for="infoCheck01"><span>본인은 개인정보 수집 및 이용에 동의합니다.</span></label>
        			</p>

        			<div class="btn_wrap2">
        				<button type="button" id="eApply" class="btn_apply" onClick={this.eventApply}><img src="/images/events/2019/event190824/btn_apply.png" alt="통합 회원 전환하기" /></button>
        			</div>
        		</div>

        		<div>
        			<img src="/images/events/2019/event190824/img3.jpg" alt="" />
        			<ul class="blind">
        				<li>지금, 선생님 통합회원으로 전환하시면 비바샘 + 티스쿨원격교육연수원 서비스를 1개의 ID로 동시에 이용하실 수 있습니다.</li>
        				<li>티스쿨원격연수원에서 지급되는 포인트는 해당 사이트에서만 사용하실 수 있습니다. (비바샘에서 포인트 사용 불가)</li>
        				<li>초·중·고 학교 선생님, EPKI/GPKI 인증서를 갖고 계신 경우 비바샘 정회원 서비스를 이용하실 수 있습니다. 선생님 인증이 어려운 경우, 비바샘 자료 이용이 일부 제한됩니다.</li>
        			</ul>
        		</div>
        	</section>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;

