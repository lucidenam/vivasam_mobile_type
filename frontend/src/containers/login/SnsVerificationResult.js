import React, { Component,Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';
import * as api from 'lib/api';
import RenderLoading from 'components/common/RenderLoading';
// import {initializeGtag} from "../../store/modules/gtag";

class SnsVerificationResult extends Component {

    
    constructor(props) {
        super(props);
    }

    state = {
        memberId : '',
        query : {},
        result : {},
        loading : true
    }

    // componentDidMount(){
    //         initializeGtag();
    //         function gtag(){
    //             window.dataLayer.push(arguments);
    //         }
    //         gtag('config', 'G-B7GPBXLL3E', {
    //             'page_path': '/verification/result',
    //             'page_title': '본인 인증｜비바샘'
    //         });
    //
    //     if(this.props.logged) this.props.replace('/');
    //
    //     const { location } = this.props;
    //     let query = queryString.parse(location.search);
    //     this.setState({
    //         query : query
    //     });
    //
    //     if(!query.uuid || typeof query.uuid === 'undefined') {
    //         this.props.history.go(-1);
    //     }
    //     let encodeUuid = encodeURIComponent(query.uuid);
    //     this.getIdentificationData(encodeUuid);
    //
    // }
    //
    // componentWillUnmount() {
    //     this._isMounted = false;
    // }
    //
    // getIdentificationData = async (uuid) => {
    //
    //     const { baseActions } = this.props;
    //
    //     try {
    //         const result = await api.getIdentificationData(uuid);
    //         console.log( result );
    //         this.setState({result : result.data});
    //
    //         //TODO 인증정보 못불러온 경우 인증안내 화면으로 가야...
    //         console.log(this.props.check);
    //
    //         if(this._isMounted && this.state.result) {
    //             this.setState({loading:false});
    //         }
    //         window.scrollTo(0, 0);
    //     } catch(e) {
    //         console.log(e);
    //     } finally {
    //         setTimeout(()=>{
    //             this.setState({loading: false});
    //         }, 700);
    //     }
    //
    // }

    render() {
        const {loading, result} = this.state;

        if(loading) return <RenderLoading type={2} />

        return (
            <div id="pop_wrap">
                <div id="pop_header" className="pop_header">
                    <h1 className="header_tit">SNS 계정연동</h1>
                    <div className="btnClose">
                        {/* <a href="#" className="btn_close"><span className="blind">팝업 닫기</span></a> */}
                    </div>
                </div>
                <section id="pop_content">
                    
                    <Fragment>
                        {/* <!-- 본인인증 성공 --> */}
                        {result.result != -1 && result.result != -2 && (
                            <Fragment>
                                {/*<div className="teacher_certify">*/}
                                {/*    <div className="info_txt_box center">*/}
                                {/*        <em className="txt_marker">{result.memberId}</em> 아이디로 본인 인증이 완료되었습니다. 이제 비바샘 교수지원 서비스를 이용하실 수 있습니다. 다시 로그인해 주세요.*/}
                                {/*    </div>*/}
                                {/*    <div className="mt30">*/}
                                {/*        <Link to="/login" className="btn_round_on mt15">로그인</Link>*/}
                                {/*        /!* <Link to="/" className="btn_full_on">메인으로</Link> *!/*/}
                                {/*        /!* <a onClick={() => {*/}
                                {/*            this.handleGoPage("/");*/}
                                {/*            }} className="btn_full_on">메인으로</a> *!/*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                <div className="link_sns_wrap">
                                    <div className="link_sns">
                                        <h3 className="mb20">가입된 회원정보가 있습니다.</h3>
                                        <p className="sns_type mb25">선택한 계정을 연동하시면,<br /> <span id="snsType">카카오계정</span>으로도 로그인이
                                            가능합니다.</p>
                                        <div className="account_list_wrap">
                                            <div id="dataList" className="account_list">
                                                <ul>
                                                    <li className="pt0">
                                                        <input type="radio" name="account" id="sns_id1"/><label htmlFor="sns_id1">vivasam44</label>
                                                    </li>
                                                    <li className="pb0">
                                                        <input type="radio" name="account" id="sns_id2"/><label htmlFor="sns_id2">vivasam17</label>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="link_sns_btn_wrap mb25">
                                            <a href="javascript:void(0)" className="link_sns_btn" tabIndex="3"
                                               value="연동하기" onClick="onLink();">로그인</a>
                                        </div>
                                        <p className="call">확인이 필요하시다면 고객센터 1544-7714로 문의 바랍니다.</p>
                                    </div>
                                </div>
                            </Fragment>
                        )}
                        {/* <!-- //본인인증 성공 --> */}

                        {/* <!-- 본인인증 실패(이미 인증된 아이디 존재) --> */}
                        {result.result == -1 && result.existId != null && result.existId != '' && (
                            <Fragment>
                                <div className="teacher_certify renew07">
                                    <div className="info_txt_top">
                                        <span>이미 비바샘 통합회원으로 가입되어 있습니다.</span><br/>
                                        아래의 아이디로 로그인 해주세요.
                                    </div>
                                    <div className="certify_result">
                                        <span className="lb_txt">비바샘 아이디</span>
                                        <strong className="user_id">{result.existId}</strong>
                                    </div>
                                    <div className="mt15">
                                        <Link to="/login" className="btn_round_on">로그인</Link>
                                    </div>
                                    {/*<p className="find_validate_txt mt15">현재 아이디를 사용할 수 없으므로 <br />자동으로 로그아웃 됩니다.</p>*/}
                                </div>

                                {/*<div className="guideline"></div>
                                <div className="join_info">
                                    <span className="icon_noti_type3 txt_marker">아이디 사용 불가 안내</span>
                                    현재 로그인하신 <em className="txt_marker">{result.memberId}</em> 아이디는 사용이불가하니, 안전한 개인정보 관리를 위해 탈퇴하실 것을 권장해 드립니다. 탈퇴는 PC 웹 사이트에서 가능합니다.
                                     <div className="btn_right">
                                        <a href="#" className="txt_marker">PC 웹에서 탈퇴하기</a>
                                    </div>
                                </div>*/}
                                <div className="guideline"></div>
                                <div className="guide_box">
                                    <h2 className="guide_box_tit">본인 인증 및 아이디 사용 관련 문의</h2>
                                    <span className="guide_box_num">1544-7714</span><em className="txt_marker">(09:00~18:00)</em>
                                    <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
                                </div>
                            </Fragment>
                        )}

                        {/* <!-- 본인인증 실패(인증정보 매칭 실패) --> */}
                        {result.result == -2 && result.existId != null && result.existId != '' && (
                            <Fragment>
                                <div className="teacher_certify">
                                    <div className="info_txt_top">
                                    	죄송합니다.<br />본인 인증하신 정보와 비바샘 회원 정보가 일치하지 않습니다.<br />고객센터로 연락하여 확인해 주세요.<br /><br />선생님 전용 고객센터 : 1544-7714
                                    </div>
                                </div>

                                <div className="guideline"></div>
                                <div className="guide_box">
                                    <h2 className="guide_box_tit">본인 인증 및 아이디 사용 관련 문의</h2>
                                    <span className="guide_box_num">1544-7714</span><em className="txt_marker">(09:00~18:00)</em>
                                    <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
                                </div>
                            </Fragment>
                        )}
                        {/* <!-- //본인인증 실패 --> */}
                    </Fragment>

                </section>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SnsVerificationResult));
