import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import * as joinActions from "../../store/modules/join";
import * as baseActions from "../../store/modules/base";
import {initializeGtag} from "store/modules/gtag";
import Sticky from "react-sticky-el";

class JoinSearchBelongPopup extends Component {
    state = {


    }

    componentDidMount() {
        initializeGtag();
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-HRYH9929GX', {
            'page_path': '/join/searchBelong',
            'page_title': '비밀번호 입력｜비바샘'
        });

        this._isMounted = true;
        const {agree, info, history, JoinActions} = this.props;

        //패스워드 재입력하게함
        info.oldPassword = '';
        info.password = '';
        info.passwordCheck = '';
        JoinActions.pushValues({type: "info", object: info});

        // if (this.props.test) {
        // 	agree = {
        // 		service: true,
        // 		privacy: true,
        // 	};
        // 	info = {
        // 		userName: '홍길동',
        // 		email: 'test@naver.com',
        // 		gender: 'M',
        // 		birthDay: '1999-01-02'
        // 	}
        // }

    }

    componentWillUnmount() {

    }

    constructor(props) {
        super(props);
    }

    goOtherPage = async (path) => {

    }

    handleChange = (e) => {
        const {info, JoinActions} = this.props;
        info[e.target.name] = e.target.value;
        JoinActions.pushValues({type: "info", object: info});

        if (e.target.name === "oldPassword") {
            if (this.refs.NewPassword.value) {
                this.checkpassword2(this.refs.NewPassword.value);
            }
        } else if (e.target.name === "password") {
            this.checkpassword2(e.target.value);
            if (this.refs.Checkpassword.value) {
                this.setPassWordCheckMessage(this.refs.Checkpassword.value);
            }
        } else if (e.target.name === "passwordCheck") {
            this.setPassWordCheckMessage(e.target.value);
        }
    }


    render() {
        const {} = this.props;
        const {

        } = this.state;
        return (
            <Fragment>
                <Sticky className={'tab_wrap_base'}>
                    <ul className="tab tabMulti tab-col2">
                        <li className={'tab_item t_right'}>
                            <a
                                className="tab_link"
                            >
                                <span>검색하기</span>
                            </a>
                        </li>
                        <li className={'tab_item t_left' + 'active'}>
                            <a
                                className="tab_link"
                            >
                                <span>직접입력</span>
                            </a>
                        </li>
                    </ul>
                </Sticky>

                <section className="join search_belong renew07">
                    <div className="join_belong">

                        {/*검색하기*/}
                        {/*<div className="join_info">*/}
                        {/*	<div className="input_wrap">*/}
                        {/*		<input*/}
                        {/*			type="text"*/}
                        {/*			name="userBelong"*/}
                        {/*			ref="userBelong"*/}
                        {/*			placeholder="소속명을 입력해주세요."*/}
                        {/*			id="ipt_belong"*/}
                        {/*			// onChange={}*/}
                        {/*			// value={}*/}
                        {/*			className="input_sm"/>*/}
                        {/*		<button*/}
                        {/*			type="button"*/}
                        {/*			// onClick={this.duplicateIdClick}*/}
                        {/*			className="input_in_btn btn_gray">중복확인*/}
                        {/*		</button>*/}
                        {/*	</div>*/}
                        {/*</div>*/}
                        {/*<div className="guideline type02"></div>*/}
                        {/*<div className="guide_txt">*/}
                        {/*	<p className='point_color_blue'>소속명을 검색해주세요.</p>*/}
                        {/*</div>*/}
                        {/*<div className="guideline type02"></div>*/}
                        {/*<div className="join_info">*/}
                        {/*	<div className="tit_wrap">*/}
                        {/*		<div className="right_scrt">*/}
                        {/*			<select className="ck_term">*/}
                        {/*				<option value="">유형</option>*/}
                        {/*				<option value="">초등학교</option>*/}
                        {/*				<option value="">중학교</option>*/}
                        {/*				<option value="">고등학교</option>*/}
                        {/*				<option value="">대학교</option>*/}
                        {/*				<option value="">유치원</option>*/}
                        {/*				<option value="">교육기관</option>*/}
                        {/*			</select>*/}
                        {/*		</div>*/}
                        {/*	</div>*/}
                        {/*	<ul className="schoolList">*/}
                        {/*		<li>*/}
                        {/*			<a href="javascript:void(0)">*/}
                        {/*				<div className="listTit">*/}
                        {/*					<span className="level">초등</span>*/}
                        {/*					<span className="name">포남 초등학교</span>*/}
                        {/*				</div>*/}
                        {/*				<p className="address">강원도 강릉시 가작로 287번지 20 (포남동)</p>*/}
                        {/*			</a>*/}
                        {/*		</li>*/}
                        {/*		<li>*/}
                        {/*			<a href="javascript:void(0)">*/}
                        {/*				<div className="listTit">*/}
                        {/*					<span className="level">초등</span>*/}
                        {/*					<span className="name">포남 초등학교</span>*/}
                        {/*				</div>*/}
                        {/*				<p className="address">강원도 강릉시 가작로 287번지 20 (포남동)</p>*/}
                        {/*			</a>*/}
                        {/*		</li>*/}
                        {/*	</ul>*/}

                        {/*	<div className="noResult mt40">*/}
                        {/*		<p>*/}
                        {/*			검색 결과가 없습니다.<br />*/}
                        {/*			소속 등록을 요청해 주세요.*/}
                        {/*		</p>*/}
                        {/*		<a href="javascript:void(0)" className="btn_request">소속 등록 요청하기</a>*/}
                        {/*	</div>*/}
                        {/*</div>*/}


                        {/*직접입력*/}
                        <div className="join_info">
                            <h2 className="info_tit">
                                <label htmlFor="ipt_belongName">소속명</label>
                            </h2>
                            <div className="input_wrap mb20">
                                <input
                                    type="text"
                                    id="ipt_belongName"
                                    // value={}
                                    className="input_sm"
                                    placeholder="소속명을 입력해주세요"
                                />
                                <button
                                    type="button"
                                    // onClick={this.duplicateIdClick}
                                    className="input_in_btn btn_gray">중복확인
                                </button>
                            </div>
                            <h2 className="info_tit">
                                <label htmlFor="">유형</label>
                            </h2>
                            <div className="input_wrap mb20">
                                <ul className="rdoLevelList">
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel1"/>
                                        <label htmlFor="scLevel1">초등학교</label>
                                    </li>
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel2"/>
                                        <label htmlFor="scLevel2">중학교</label>
                                    </li>
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel3"/>
                                        <label htmlFor="scLevel3">고등학교</label>
                                    </li>
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel4"/>
                                        <label htmlFor="scLevel4">대학교</label>
                                    </li>
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel5"/>
                                        <label htmlFor="scLevel5">유치원</label>
                                    </li>
                                    <li>
                                        <input type="radio" name="scLevel" id="scLevel6"/>
                                        <label htmlFor="scLevel6">교육기관</label>
                                    </li>
                                </ul>
                            </div>
                            <h2 className="info_tit">
                                <label htmlFor="">소재지</label>
                            </h2>
                            <div className="input_wrap input_flex mb20">
                                <select name="" id="" className="join_style">
                                    <option value="">시/도</option>
                                    <option value=""></option>
                                    <option value=""></option>
                                </select>
                                <select name="" id="" className="join_style">
                                    <option value="">구/군</option>
                                </select>
                            </div>
                            <h2 className="info_tit">
                                <label htmlFor="">기타</label>
                            </h2>
                            <div className="textareaWrap joinTextarea">
								<textarea
                                    id="belongMore"
                                    name="belongMore"
                                    // value={comment}
                                    // onChange={ this.setComment }
                                    maxLength="300"
                                    placeholder="소속 홈페이지 주소를 입력해 주세요.&#13;&#10; 보다 빠르게 등록을 도와드리겠습니다."
                                ></textarea>
                            </div>
                            <div className="join_check_box box_pos_rel mt15">
                                <input type="checkbox" className="checkbox_circle txt_r"
                                       id="special"
                                    // checked={}
                                    // onChange={}
                                       ref="special"
                                       name="special"/>
                                <label htmlFor="special">
                                    <strong className="join_check_tit">입력한 소속으로 회원 정보 변경에 동의합니다.</strong>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
                <button
                    // onClick={this.insertJoinAfterHomeSafe}
                    className="btn_full_on">
                    등록 요청하기
                </button>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        test: state.join.get('test'),
        type: state.join.get('type').toJS(),
        agree: state.join.get('agree').toJS(),
        check: state.join.get('check').toJS(),
        info: state.join.get('info').toJS()
    }),
    (dispatch) => ({
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(JoinSsoPwdResetPwdPopup));
