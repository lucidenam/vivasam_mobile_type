import React, { Component,Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import { MarketingAgree } from 'containers/login';
import queryString from 'query-string';
import * as api from 'lib/api';
import * as common from 'lib/common';
import {initializeGtag} from "../../store/modules/gtag";

class JoinTeacher extends Component {

    state = {
        file : null,
        fileName : '없음',
        fileUrl : null,
        visible : false,
        query : {}
    }

    constructor(props) {
        super(props);
        // Debounce
        this.nextButtonClick = debounce(this.nextButtonClick, 300);
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/join/teacher',
            'page_title': '가입 완료 및 교사 인증 | 회원가입｜비바샘'
        });
        const { history, location } = this.props;
        let query = queryString.parse(location.search);
        this.setState({
            query : query
        });
        
        if(!query.userId || typeof query.userId === 'undefined') {
            history.go(-1);
        }
    }

    popupMarketingAgree = () => {
        const { agree, PopupActions } = this.props;
        if(agree.agreeDate){
            const agrees = [
                {
                    gubunCd: 'S',
                    agree: agree.marketing,
                    agreeDate: agree.agreeDate
                },
                {
                    gubunCd: 'E',
                    agree: agree.marketing,
                    agreeDate: agree.agreeDate
                },
                {
                    gubunCd: 'T',
                    agree: agree.marketing,
                    agreeDate: agree.agreeDate
                },
            ];
            PopupActions.openPopup({title:"마케팅 및 광고 활용 동의", componet:<MarketingAgree url='/join/complete' agrees={agrees}/>});
        }
    }

    handleFiles = (e) => {
        const file = e.target.files[0];
        if(file){
            window.URL = window.URL || window.webkitURL;
            var img = document.createElement("img");
            img.src = window.URL.createObjectURL(file);
            img.onload = function() {
                window.URL.revokeObjectURL(this.src);
            }
            this.setState({
                file: e.target.files[0],
                fileName : e.target.files[0].name ? e.target.files[0].name : '없음',
                fileUrl : img ? img.src : null,
                visible : true
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
        const { BaseActions, history} = this.props;
        const { file, query } = this.state;
        try {
            target.disabled = true;
            if(file){
                BaseActions.openLoading();
                const formData = new FormData();
                formData.append('uploadfile',file);
                formData.append('filename',file.name);
                formData.append('userId',query.userId);
                formData.append('mailType',''); //받는 그룹
                const response = await api.teacherCertifyUpload(formData);
                if(response.data.code && response.data.code === "0"){
                    // this.insertJoinForm();
                    //서류 등록후 결과는 어떻게??
                    // history.push("/"); // 통합회원일 경우 작동안함. 왜?
                    window.location.href = "/";
                } else {
                    common.error("파일을 등록에 실패하였습니다.");
                    target.disabled = false;
                }
            }else{
                common.error("파일을 등록해주세요.");
                target.disabled = false;
            }
        } catch (e) {
            target.disabled = false;
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    closeButtonClick = () => {
        window.location.href = "/";
    }

    render() {
        const { fileName,fileUrl,visible } = this.state;
        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">가입 완료 및 교사 인증</h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num">4</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>5</span>
                    </div>
                </div>
                <section className="join">
                    <div className="join_info">
                        <div className="c_black">
                            가입이 완료되었습니다. 
                            {this.state.query.isSso === 'true' && (
                                <Fragment>
                                    {/* <!-- 통합회원일 경우에만 노출 --> */}
                                    <br />비바샘 교수지원 서비스와 티스쿨원격교육연수원 사이트를 한 개의 아이디로 편리하게 이용하실 수 있습니다.
                                    {/* <!-- //통합회원일 경우에만 노출 --> */}
                                </Fragment>
                            )}
                        </div>
                        <div className="certify_document">
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
                                            <label htmlFor="file_photo">
                                                <span className="file_plus">
                                                    사진 촬영
                                                </span>
                                            </label>
                                            <label htmlFor="file_photo" id="file_photo_label"><span className="file_plus">사진 촬영</span></label>
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
                                            <label htmlFor="file_gallary" id="file_gallary_label"><span className="file_plus">갤러리 첨부</span></label>
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
                                    <img src={fileUrl} style={{display: visible ? 'block' : 'none'}} alt="첨부파일"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <a className="btn_round_on mt30 mb10" onClick={this.nextButtonClickSafe}>확인</a>
                            <a onClick={this.closeButtonClick} className="btn_round_off">서류 인증 나중에 하기<span className="c_gray_txt">(메인으로 이동)</span></a>
                        </div>
                    </div>

                    <div className="guideline"></div>
                    <div className="join_info">
                        <div className="acco_notice_list">
                            <span className="acco_notice_tit icon_noti">
                                이메일, FAX로 인증 안내
                            </span>
                            <div className="notice_txt">
                                <dl className="join_notice_define">
                                    <dt className="join_define_tit">이메일</dt>
                                    <dd className="join_define_info">vivasam@visang.com</dd>
                                </dl>
                                <p className="join_define_txt">
                                    인증서류를 사진으로 찍어 회원ID와 함께 메일 보내기
                                </p>
                            </div>
                            <div className="notice_txt">
                                <dl className="join_notice_define">
                                    <dt className="join_define_tit">FAX</dt>
                                    <dd className="join_define_info">02-6970-6199</dd>
                                </dl>
                                <p className="join_define_txt">
                                    인증서류를 FAX로 보내주신 후 고객센터(1544-7714)로 전화
                                </p>
                            </div>
                        </div>
                        <div className="acco_notice_list join_list_border">
                            <span className="acco_notice_tit icon_noti">안내</span>
                            <p className="notice_txt">
                                서류인증으로 가입 시 인증기간은 1년이며, 이후 재인증을 통해 연장하실 수 있습니다. <br />교생 실습 중인 학생의 경우 실습확인서로 인증이 가능하며, 인증기간은 3개월입니다.
                            </p>
                        </div>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
      agree : state.join.get('agree').toJS(),
      isApp: state.base.get('isApp')
  }),
  (dispatch) => ({
      PopupActions: bindActionCreators(popupActions, dispatch),
      JoinActions: bindActionCreators(joinActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(JoinTeacher));
