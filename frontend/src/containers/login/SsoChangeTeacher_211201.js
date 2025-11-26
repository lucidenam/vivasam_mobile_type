import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as popupActions from 'store/modules/popup';
import * as ConversionActions from 'store/modules/conversion';
import * as baseActions from 'store/modules/base';
import * as api from 'lib/api';
import * as common from 'lib/common';
import {initializeGtag} from "../../store/modules/gtag";

class SsoChangeTeacher extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.nextButtonClick = debounce(this.nextButtonClick, 300);
        
    }
    
    state = {
        file: null,
        fileName: '없음',
        fileUrl: null,
        userId: '',
        visible: false,
        vivaBenefitVisible : false,
        tschBenefitVisible : false
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/teacher',
            'page_title': '전환 완료 및 교사 인증 | 통합전환｜비바샘'
        });
        const { logged, check, info, ConversionActions, history, BaseActions } = this.props;

        if(info.ssoMember) {
            // common.info('로그아웃되었습니다. 통합회원 로그인 해주세요.');
            BaseActions.logout();
        }

        if (info.userId) {
            this.setState({
                userId: info.userId
            });
        } else {
            history.replace("/");
        }

    }



    handleFiles = (e) => {
        const file = e.target.files[0];
        if (file) {
            window.URL = window.URL || window.webkitURL;
            var img = document.createElement("img");
            img.src = window.URL.createObjectURL(file);
            img.onload = function () {
                window.URL.revokeObjectURL(this.src);
            }
            this.setState({
                file: e.target.files[0],
                fileName: e.target.files[0].name ? e.target.files[0].name : '없음',
                fileUrl: img ? img.src : null,
                visible: true
            });
        }
    }

    openCamera = (e) => {
        const { isApp } = this.props;
        if (isApp) {
            api.openCamera().then(val => {
                console.log(val);
                if (val === true) {
                console.log('카메라를 실행합니다....');
                }
                else {
                e.preventDefault();
                }
            }).catch((err) => {
                e.preventDefault();
            });
        }
    }

    openPhoto = (e) => {
        const { isApp } = this.props;
        if (isApp) {
            api.openCamera().then(val => {
                console.log(val);
                if (val === true) {
                console.log('카메라를 실행합니다....');
                }
                else {
                e.preventDefault();
                }
            }).catch((err) => {
                e.preventDefault();
            });
        }
    }

    nextButtonClickSafe = (e) => {
        this.nextButtonClick(e.target);
    }

    nextButtonClick = async (target) => {
        const { BaseActions } = this.props;
        const { file, userId } = this.state;
        try {
            target.disabled = true;
            if (file) {
                BaseActions.openLoading();
                const formData = new FormData();
                formData.append('uploadfile', file);
                formData.append('filename', file.name);
                formData.append('userId', userId);
                formData.append('mailType', ''); //받는 그룹
                const response = await api.teacherCertifyUpload(formData);
                if (response.data.code && response.data.code === "0") {
                    // 인증 성공
                    console.log('인증 성공');
                } else {
                    common.error("파일을 등록에 실패하였습니다.");
                    target.disabled = false;
                }
            } else {
                common.error("파일을 등록해주세요.");
                target.disabled = false;
            }
        } catch (e) {
            target.disabled = false;
            console.log(e);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    handleVivaBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : true
        });
    }
    
    handleTschBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            tschBenefitVisible : true
        });
    }

    handleCloseBenefit = (e) => {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : false,
            tschBenefitVisible : false
        });
    }

    closeButtonClick = () => {
        window.location.href = "/";
    }

    render() {
        const { fileName, fileUrl, visible } = this.state;
        const { info } = this.props;
        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">
                        전환 완료 및 교사 인증
                    </h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>4</span>
                    </div>
                </div>
                <section className="join">
                        { info.validYN === 'Y' && (
                            <div className="join_info">
                                <div className="c_black">
                                    비상교육 선생님 통합회원 전환이 모두 완료되었습니다.<br />비바샘 교수지원 서비스와 티스쿨 원격교육연수원 사이트를 한 개의 아이디로 편리하게 이용하실 수 있습니다.
                                </div> 
                                <Fragment>
                                    <div className="certify_document">
                                        <p className="txt_marker">학교 선생님이시라면, 비바샘 교수지원 서비스 이용을 위해 교사 인증을 추가로 해 주세요. </p>
                                        <p className="certify_txt">아래의 안내에 따라 서류인증을 완료하여 주세요.</p>
                                        <p className="c_gray_soft mb25">(PC에서 로그인을 하시면 EPKI/GPKI 인증을 진행하실 수 있습니다.)</p>
                                    </div>

                                    <div className="certify_document">
                                        <h2 className="info_tit">인증서류 안내 <span className="info_tit_sub">(택 1)</span></h2>
                                        <span className="point_color_blue">재직증명서, 채용계약서, 근로계약서, 실습확인서</span>

                                        <h2 className="info_tit mt20">인증서류를 사진으로 찍어 파일을 직접 등록</h2>
                                        <p className="certify_txt c_gray_soft">인증서류는 전체 내용이 나오도록 찍어주세요</p>
                                        <div className="certify_file_wrap mt15">
                                            <ul className="certify_file">
                                                <li className="certify_file_list">
                                                    <div className="certify_file_inner file_photo">
                                                        <input
                                                            type="file"
                                                            id="file_photo"
                                                            onChange={this.handleFiles}
                                                            onClick={this.openCamera}
                                                            capture="camera"
                                                            className="ipt_file" />
                                                        <label htmlFor="file_photo"><span className="file_plus">사진 촬영</span></label>
                                                        <input type="file" id="file_photo" capture="camera" className="ipt_file" />
                                                    </div>
                                                </li>
                                                <li className="certify_file_list">
                                                    <div className="certify_file_inner file_gallary">
                                                        <input
                                                            type="file"
                                                            id="file_gallary"
                                                            accept="image/*"
                                                            onChange={this.handleFiles}
                                                            onClick={this.openPhoto}
                                                            className="ipt_file" />
                                                        <label htmlFor="file_gallary"><span className="file_plus">갤러리 첨부</span></label>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="certify_upload_file mt20">
                                            <div className="certify_upload_title">첨부파일</div>
                                            <div className="certify_upload_list">
                                                <a
                                                    href={fileUrl}
                                                    className="certify_upload_name">
                                                    {fileName}
                                                </a>
                                                <img src={fileUrl} style={{ display: visible ? 'block' : 'none' }} alt="첨부파일" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="join_info">
                                        <a onClick={this.nextButtonClickSafe} className="btn_round_off mb10">확인</a>
                                        <a onClick={this.closeButtonClick} className="btn_round_off">서류 인증 나중에 하기<span className="c_gray_txt">(메인으로 이동)</span></a>
                                    </div>
                                </Fragment>
                            </div>
                        )}
                        { info.validYN != 'Y' && (
                            <Fragment>
                                <div className="join_info">
                                    <div className="c_black">
                                        통합회원 전환이 모두 완료되었습니다.  <br />비바샘과 티스쿨원격교육연수원 사이트를 한 개의 아이디로 편리하게 이용하실 수 있습니다.
                                    </div>
                                </div>
                            </Fragment>
                        )}



                        <div className="benefit_wrap">
                            <img src="../images/member/benefit.png" alt="비상교육 선생님 통합회원에게 드리는 혜택" />
                            <div className="btn_wrap">
                                <a href="#" onClick={this.handleVivaBenefit} className="btn_service_v"><span>비바샘 서비스 <br />자세히 보기</span></a>
                                <a href="#" onClick={this.handleTschBenefit} className="btn_service_t"><span>비바샘 연수원 서비스 <br />자세히 보기</span></a>
                            </div>
                        </div>
                        
                        {/* <!-- 비바샘 혜택 레이어 팝업 --> */}
                        <div id="popIntegrated1" className="popIntegrated" style={{display: this.state.vivaBenefitVisible ? 'block' : 'none'}} >
                            <div className="layer_mask"></div>
                            <div className="layer_popup">
                                <img src="../images/member/pop_service_v.png" alt="비바샘 서비스" className="vivasam" />
                                <a href="#" onClick={this.handleCloseBenefit} className="btn_close"><span className="blind">닫기</span></a>
                            </div>
                        </div>
                        {/* <!-- // 비바샘 혜택 레이어 팝업 --> */}

                        {/* <!-- 티스쿨 혜택 레이어 팝업 --> */}
                        <div id="popIntegrated2" className="popIntegrated" style={{display: this.state.tschBenefitVisible ? 'block' : 'none'}} >
                            <div className="layer_mask"></div>
                            <div className="layer_popup">
                                <img src="../images/member/pop_service_t.png" alt="티스쿨 서비스" className="tschool" />
                                <a href="#" onClick={this.handleCloseBenefit} className="btn_close"><span className="blind">닫기</span></a>
                            </div>
                        </div>
                        {/* <!-- // 티스쿨 혜택 레이어 팝업 --> */}

                        <div className="join_info">
                            <Link to="/login" className="btn_round_on">통합회원 로그인</Link>
                        </div>

                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
    logged: state.base.get("logged"),
    agree: state.conversion.get('agree').toJS(),
    check: state.conversion.get('check').toJS(),
    info: state.conversion.get('info').toJS(),
    school: state.conversion.get('school').toJS(),
    isApp: state.base.get('isApp')
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch),
    ConversionActions: bindActionCreators(ConversionActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(SsoChangeTeacher));
