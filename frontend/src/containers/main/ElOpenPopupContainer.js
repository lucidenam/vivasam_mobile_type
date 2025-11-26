import React, {Component, Fragment} from 'react';
import {Cookies} from 'react-cookie';
import moment from "moment";
import {SITE_DOMAIN_MOBILE_ELEMENTARY} from '../../constants';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

const cookies = new Cookies();

class ElOpenPopupContainer extends Component {
	state = {
		loading: true,
		visible: false
	};

	componentDidMount() {
		this._isMounted = true;
		const cookiesChk = cookies.get("popSemesterCookies");
		if (!cookiesChk) {
			/*
			let today = new Date();
			let chkDate = new Date(2021, 8, 1);
			if(today.getTime() < chkDate.getTime()){
				this.setState({
					visible: true,
				});
			}
			*/
			this.setState({
				visible: true,
			});
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	handleCloseEventNotice = (e) => {
		e.preventDefault();

		this.setState({
			visible: false
		});

		if (this.refs.todayEl.checked) {
			cookies.set("popSemesterCookies", true, {
				expires: moment().add(24, 'hours').toDate()
			});
		}
	};


	// 링크열기
	openLinkUrl = (url) => {
		if (this.props.isApp) {
			return new Promise(function (resolve, reject) {
				window.webViewBridge.send('callLinkingOpenUrl', {value: url}, (retVal) => {
					resolve(retVal);
				}, (err) => {
					reject(err);
				});
			});
		} else {
			window.open(url, '_blank'); // web
		}
	}

	render() {

		const {loading} = this.state;
		return (
			<Fragment>
				{loading && (
					<Fragment>
						{/* 2021-06-27 초등 오픈 레이어 팝업 
						<div id="popOpenEl"
							style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event pop_main_210627"
						>
							<div className="btnElTabWrap">
								<Link to="/elopenpop" className="btnElTab">
									<div className="blind">
										<strong>비바샘 초등 100배 즐기기</strong>
										<p>전문가 선생님 수업자료, 국내 1위 문제은행, 샘퀴즈, 오픈 이벤트, 최신 차시창, 과목별 특화관</p>
									</div>
								</Link>
							</div>
							<div className="control">
								<input type="checkbox" ref="todayEl" id="todayElChk" />
								<label
									htmlFor="todayElChk"
								>오늘 하루 보지 않기</label>
								<button type="button" onClick={ this.handleCloseEventNotice } className="btnClose">
									<span className="blind">비바샘 초등 100배 즐기기 팝업 닫기</span>
								</button>
							</div>
						</div>
						*/}

						{/* 2021-08-20 visang 초등 검정 교과서 */}
						{/* <div id="popVisangtextbook"
							 style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event"
						>
							<div className="popCont">
								<div className="blind">
									<strong>2015개정 VISANG 초등 검정 교과서. 수학, 사회, 과학 4종 최종 합격!</strong>
									<p>초등 수학 / 과학 국정교과서 발행사 VISANG이 더욱 풍성한 초등 수업을 책임집니다.</p>
								</div>*/}
								{/* <a href="javascript:void(0);" onClick={() => {
									this.openLinkUrl(SITE_DOMAIN_MOBILE_ELEMENTARY + "/#/visangTextbook/2015/Intro");
								}} className="btnLink"> */}
						{/* 		<a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://me.vivasam.com/#/visangTextbook/2015Upper/Intro')}
								   className="btnLink">
									<span className="blind">교과서 자세히 보기</span>
								</a>
							</div>
							<div className="control">
								<input type="checkbox" ref="todayEl" id="todayElChk"/>
								<label
									htmlFor="todayElChk"
								>오늘 하루 보지 않기</label>
								<button type="button" onClick={this.handleCloseEventNotice} className="btnClose">
									<span className="blind">팝업 닫기</span>
								</button>
							</div>
						</div>
 */}
						{/*<div id="popVisangtextbook25"
							 style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event"
						>
							<div className="popCont">
								<div className="blind">
									<strong>2022 개정 교육과정 비상교과서</strong>
									<p>초중고 전과목 100% 합격, 오직 비상교육뿐!</p>
								</div>
								<a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://text.vivasam.com/')}
								   className="btnLink">
									<span className="blind">비상교과서를 소개합니다.</span>
								</a>
								<button type="button" onClick={this.handleCloseEventNotice} className="btnClose">
									<span className="blind">팝업 닫기</span>
								</button>
							</div>
							<div className="control">
								<input type="checkbox" ref="todayEl" id="todayElChk"/>
								<label
									htmlFor="todayElChk"
								>오늘 하루 보지 않기</label>
							</div>
						</div>*/}
					</Fragment>
				)}
			</Fragment>
		);
	}
}

export default ElOpenPopupContainer;
