import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as api from 'lib/api';
import { connect } from "react-redux";
import {bindActionCreators} from "redux";
import * as popupActions from 'store/modules/popup';
import * as common from 'lib/common';

class TeacherCertify extends Component {
    state = {
        file : null,
        fileName : '없음',
        fileUrl : null,
        userId : '',
        visible : false
    }
    componentDidMount(){
        const { userId, history } = this.props;
        if(userId){
            this.setState({
                userId: userId
            });
        }else{
           history.push("/");
        }
    }

    closeButtonClick = async(e) => {
        e.preventDefault();
        const { PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push("/");
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

    handleClick = async (e) => {
        let target = e.target;
        target.disabled = true;
        const { file,userId } = this.state;
        if(file){
            const formData = new FormData();
            formData.append('uploadfile',file);
            formData.append('filename',file.name);
            formData.append('userId',userId);
            formData.append('mailType',''); //받는 그룹
            const response = await api.teacherCertifyUpload(formData);
            //로딩이미지 고려
            if(response.data.code && response.data.code === "0"){
                common.info('보내주신 서류는 담당자 검토 후 인증이 완료되면 알림을 통해 공유 드리니 ‘전체 메뉴>설정’ 에서 PUSH 알림을 설정해주세요. 감사합니다.');
                this.closeButtonClick(e);
            } else {
                common.error("파일을 등록에 실패하였습니다.");
                target.disabled = false;
            }
        }else{
            common.error("파일을 등록해주세요.");
            target.disabled = false;
        }
    }

    render() {
        const { fileName,fileUrl,visible } = this.state;
        return (
            <section id="pop_content">
                <div className="teacher_certify">
                    <p className="certify_txt">
                        아래의 안내에 따라 서류 인증을 완료하여 주세요.
                    </p>
                    <p className="c_gray_soft">
                        (PC에서 로그인을 하시면 EPKI/GPKI 인증을 진행하실 수 있습니다.)
                    </p>
                    <div className="certify_document">
                        <h2 className="info_tit">
                            인증서류 안내 <span className="info_tit_sub">
                            (택 1)
                        </span>
                    </h2>
                    <span className="point_color_blue">
                        재직증명서, 채용계약서, 근로계약서, 실습확인서
                    </span>
                    <h2 className="info_tit mt20">
                        인증서류를 사진으로 찍어 파일을 직접 등록
                    </h2>
                    <p className="certify_txt c_gray_soft">
                        인증서류는 전체 내용이 나오도록 찍어주세요
                    </p>
                    <div className="certify_file_wrap mt15">
                        <ul className="certify_file">
                            <li className="certify_file_list">
                                <div className="certify_file_inner file_photo"
                                     ref={(div) => this.cameraDiv = div}
                                     onClick={(e) => {
                                         if(this.cameraDiv === e.target) {
                                             this.cameraRef.click();
                                         }
                                     }}
                                >
                                    <input
                                        type="file"
                                        id="file_photo"
                                        accept="image/*"
                                        onChange={this.handleFiles}
                                        onClick={this.openCamera}
                                        ref={input => this.cameraRef = input}
                                        capture="camera"
                                        className="ipt_file" />
                                    <label htmlFor="file_photo">
                                        <span className="file_plus">
                                            사진 촬영
                                        </span>
                                    </label>
                                </div>
                            </li>
                            <li className="certify_file_list">
                                <div className="certify_file_inner file_gallary"
                                     ref={(div) => this.gallrayDiv = div}
                                     onClick={(e) => {
                                         if(this.gallrayDiv === e.target) {
                                             this.gallaryRef.click();
                                         }
                                     }}
                                >
                                    <input
                                        type="file"
                                        id="file_gallary"
                                        accept="image/*"
                                        onChange={this.handleFiles}
                                        onClick={this.openPhoto}
                                        ref={input => this.gallaryRef = input}
                                        className="ipt_file" />
                                    <label htmlFor="file_gallary">
                                        <span className="file_plus">
                                            갤러리 첨부
                                        </span>
                                    </label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="certify_upload_file mt20" hidden={!this.state.file}>
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
                    <button
                        onClick={this.handleClick}
                        className="btn_round_on mt30">
                        확인
                    </button>
                    <a
                        onClick={this.closeButtonClick}
                        className="btn_round_on mt10">서류 인증 나중에 하기(메인으로 이동)</a>
                </div>
            </div>
            <div className="guideline">
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
                            <p>
                                인증서류를 사진으로 찍어 회원ID와 함께 메일 보내기
                            </p>
                        </div>
                        <div className="notice_txt">
                            <dl className="join_notice_define">
                                <dt className="join_define_tit">FAX</dt>
                                <dd className="join_define_info">02-6970-6199</dd>
                            </dl>
                            <p>
                                인증서류를 FAX로 보내주신 후 고객센터(1544-7714)로 전화
                            </p>
                        </div>
                    </div>
                    <div className="acco_notice_list join_list_border">
                        <span className="acco_notice_tit icon_noti">안내</span>
                        <p className="notice_txt">
                            서류인증으로 가입 시 인증기간은 1년이며, 이후 재인증을 통해 연장하실 수 있습니다.<br /> 교생 실습 중인 학생의 경우 실습확인서로 인증이 가능하며, 인증기간은 3개월입니다.
                        </p>
                        <p className="notice_txt">
                            EPKI/GPKI 인증서를 이용하여 인증하시면 기간연장 신청없이 비바샘을 이용하실 수 있으며 EPKI/GPKI인증은 PC웹사이트에서 가능합니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>



        );
    }
}

export default connect(
    (state) => ({
        isApp: state.base.get('isApp')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(TeacherCertify));
