import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from 'lib/common';
import { connect } from 'react-redux';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "store/modules/gtag";

class FindSleep extends Component {
    state = {
        memberName: '',
        memberEmail: '',
        isValid: true,
        isProceeding: false
    }

    componentDidMount = () => {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/find/sleep',
            'page_title': '휴면회원 안내｜비바샘'
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            isValid: true
        })
    }
    handleFindId = async (e) => {
        const { BaseActions, history } = this.props;
        this.setState({
            isValid: true
        })
        const {memberName, memberEmail} = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        if(!reg_name.test(memberName)) {
            common.error("올바른 성명 형식이 아닙니다.");
            return false;
        }
        let reg_email=/^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
        if(!reg_email.test(memberEmail)) {
            common.error("올바른 이메일 형식이 아닙니다.");
            return false;
        }


        try {
            BaseActions.openLoading({loadingType:"1"});
            const response = await BaseActions.findSleep(memberName, memberEmail);
            if(response.data && response.data.memberId) {
                history.push("/login/sleep");
            }else {
                this.setState({
                    isValid: false
                })
            }

        }catch(e) {
            console.log(e);
            if(e.response.data && e.response.data.code === '2001') {
                this.setState({
                    isValid: false
                });
            }
        }finally {
            BaseActions.closeLoading();
        }
    }

    render() {
        const {isValid} = this.state;
        return (
            <section className="login dormant">
                <h2 className="blind">휴면 아이디 찾기</h2>

                <div className="find_id">
                    <div className="find_info">
                        <p className="mb25">성명과 회원가입시 등록한 이메일을 입력해주세요.</p>

                        <h2 className="info_tit">성명</h2>
                        <input
                            type="text"
                            name="memberName"
                            placeholder="성명을 입력하세요"
                            onChange={this.handleChange}
                            value={this.state.memberName}
                            className="mb25"
                        />

                        <h2 className="info_tit">이메일</h2>
                        <input
                            type="email" 
                            name="memberEmail"
                            placeholder="이메일 주소를 입력하세요"
                            className="mb30"
                            onChange={this.handleChange}
                            value={this.state.memberEmail}
                        />

                        <div>
                            <a
                                onClick={this.handleFindId}
                                className="btn_round_on"
                            >아이디 찾기</a>
                        </div>

                        <div className="find_validate" hidden={isValid}>
                            <p className="find_validate_txt">일치하는 아이디가 없습니다.<br/>다시 확인해 주세요</p>
                        </div>
                    </div>

                    <div className="guideline"></div>

                    <div className="guide_box">
                        <p className="guide_box_tel">회원정보가 기억나지 않으실 경우,<br/>
                            선생님전용 고객센터 <em className="guide_box_marker">1544-7714</em>로 연락 주시면
                            본인 확인 후 안내해 드리고 있습니다.</p>
                        <a
                            href="tel:1544-7714"
                            className="ico_tel"
                        >
                            <span className="blind">전화걸기</span>
                        </a>
                    </div>

                    {/*
                    <div className="guideline"></div>

                    <div className="find_info">
                        <h2 className="info_tit">휴면회원 안내</h2>
                        <p className="pb15">
                            휴면회원(1년이상 로그인 기록이 없는 회원)인 경우,
                            아이디/비밀번호 찾기 서비스를 이용하실 수 없습니다.
                        </p>
                        <p className="pb20">
                            메뉴의 [휴면아이디 찾기]나 고객센터<span>(1544-7714)</span>로
                            연락 주시면, 본인확인 후 정상회원으로 전환 가능합니다.
                        </p>
                        <Link
                            to="find/sleep"
                            className="btn_square"
                        >휴면회원 조회서비스 바로가기</Link>
                    </div>
                    */}
                </div>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(FindSleep));
