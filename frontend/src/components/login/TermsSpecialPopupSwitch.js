import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import TermsServicePopupSwitch from 'components/login/TermsServicePopupSwitch';
import {initializeGtag} from "../../store/modules/gtag";

class TermsSpecialPopupSwitch extends Component {

    state = {
        termVersion: ''
    }

    handleChange = (e) => {
        var children = Array.from(document.getElementsByClassName('access_txt')[0].children);
        children.forEach(obj => {
            obj.classList.add('hide');
            if (obj.className.includes(e.target.value)) {
                obj.classList.remove('hide');
            }
        });

        const {termVersion} = this.state;
        this.setState({
            termVersion: e.target.value
        })
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/termsSpecial',
            'page_title': '약관 | 회원가입｜비바샘'
        });
    }

    switchingTermsPopup = (e) => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:'서비스 이용약관', componet:<TermsServicePopupSwitch/>});
    }

    render() {
        const { termVersion } = this.state;
        return (
            <section id="pop_content">
                <div>
                    <div className="tab_wrap">
                        <ul className="tab tabMulti">
                            <li className="tab_item ta_r" >
                                <a className="tab_link" onClick={this.switchingTermsPopup}><span>비바샘 이용약관</span></a>
                            </li>
                            <li className="tab_item active" >
                                <a className="tab_link"><span>비상교육 선생님 통합회원 특별약관</span></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="popup_content_etc popup_content termsDetails">
                    <div className="input_wrap">
                        <div className="selectbox select_sm">
                            <select id="selectTerm" value={termVersion} onChange={this.handleChange}>
                                <option value="access_ver3">이전 약관 보기</option>
                                <option value="access_ver2">2020년 07월 05일 - 2023년 01월 01일 적용</option>
                                <option value="access_ver1">2019년 08월 31일 - 2020년 7월 04일 적용</option>
                            </select>
                        </div>
                    </div>

                    <div className="access_txt mt25">
                        <div className="access_ver3">
                            <span className="access_desc">(주)비상교육이 운영하는 교수지원사이트 ‘비바샘’(이하 ‘비바샘’이라 함)과 (주)비상교육의 자회사 원격교육연수사이트 ‘비바샘 원격교육연수원’(이하 ‘비바샘 연수원’이라 함)은 상호 회원을 대상으로 보다 편리한 서비스를 제공하기 위하여 비상교육 선생님 통합회원(이하 ‘통합회원’이라 함) 서비스를 시행하고 있습니다. </span>

                            <div className="access_sub_tit">제1조 (정의 및 가입조건)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 통합회원 서비스란, 하나의 아이디와 비밀번호로 두 사이트를 모두 로그인하여 이용할 수 있는 서비스를 말합니다.</li>
                                    <li>2. 통합회원 서비스는, 비바샘과 비바샘 연수원의 가입 조건을 허용하는 회원이 대상이긴 하나, 현직 교사들을 대상으로 하는 비바샘 사이트의 특성상 비바샘 교사
                                        인증(EPKI/GPKI 인증 또는 서류 인증) 조건이 충족되지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제2조 (통합회원 가입 및 탈퇴 방법)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 비바샘, 비바샘 연수원 각 홈페이지 회원가입 절차를 통해 통합회원으로 가입할 수 있으며, 신규회원의 경우 신규 회원가입, 기존 회원의 경우 통합회원 전환
                                        신청을 하고 각 사이트에서 본인 인증을 완료한 후 가입할 수 있습니다.
                                    </li>
                                    <li>2. 통합회원으로 가입한 경우, 각 사이트에서 필요한 필수 회원정보 입력을 요청할 수 있습니다. 입력이 되지 않았을 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>3. 통합회원 가입 이후 비바샘에서는 EPKI/GPKI 또는 서류인증을 요청할 수 있습니다. 이는 학교 현직교사임을 확인하기 위한 인증 절차로 인증이
                                        완료된 회원에게 비바샘 정회원 서비스가 제공됩니다. 그렇지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>4. 회원이 탈퇴를 원하는 경우 원하는 사이트에서 선택적으로 탈퇴할 수 있습니다.</li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제3조 (통합회원 아이디 &amp; 비밀번호 관리)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 회원의 아이디 및 비밀번호에 관한 관리책임은 회원 본인에게 있으며 제3자에게 자신의 아이디 및 비밀번호를 알려주거나 이용하게 해서는 안됩니다.
                                    </li>
                                    <li>2. 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 비바샘 또는 비바샘 연수원에 통보하여 그 안내에 따라야
                                        합니다.
                                    </li>
                                    <li>3. 비바샘과 비바샘 연수원은 각 사이트의 귀책사유 없이 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 유출한 데 따른 손해에 대해서는 법적 책임을
                                        부담하지 않습니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제4조 (비바샘, 비바샘 연수원간 서비스 연계 불가)</div>
                            <div className="access_desc">
                                비바샘과 비바샘 연수원 두 사이트가 하나의 사이트로 서비스를 통합하는 것은 아니므로, 각 사이트는 기존과 동일하게 독립적으로 운영되며, 이에 따라 각 사이트에서 제공하는
                                기본 서비스 및 이벤트, 마케팅 등과 같은 부가 서비스 또한 상호 호환, 전환, 연계되지 않습니다. <br/>
                                따라서 비바샘과 비바샘 연수원이 회원에게 개별적으로 제공했거나 제공하고 있는 기존 서비스는 본 통합회원 서비스 가입과 상관 없이, 비바샘과 비바샘 연수원에서 각각 정한 정책에 따라
                                이용 가능합니다.
                            </div>

                            <strong className="access_tit mt25">부칙 (2023. 01. 02.)</strong>
                            <div className="access_desc">
                                제 1 조 (시행일) : 이 약관은 2023년 1월 2일부터 적용합니다.<br />
                                2020년 7월 5일부터 시행되었던 종전의 약관은 본 약관으로 대체합니다
                            </div>
                        </div>
                        <div className="access_ver2 hide">
                            <span className="access_desc">(주)비상교육이 운영하는 교수지원사이트 ‘비바샘’(이하 ‘비바샘’이라 함)과 (주)비상교육의 자회사 (주)비상교육 티스쿨이 운영하는 원격교육연수사이트 ‘비상 티스쿨 원격교육연수원’(이하 ‘티스쿨’이라 함)은 상호 회원을 대상으로 보다 편리한 서비스를 제공하기 위하여 비상교육 선생님 통합회원(이하 ‘통합회원’이라 함) 서비스를 시행하고 있습니다. </span>

                            <div className="access_sub_tit">제1조 (정의 및 가입조건)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 통합회원 서비스란, 하나의 아이디와 비밀번호로 두 사이트를 모두 로그인하여 이용할 수 있는 서비스를 말합니다.</li>
                                    <li>2. 통합회원 서비스는, 비바샘과 티스쿨의 가입 조건을 허용하는 회원이 대상이긴 하나, 현직 교사들을 대상으로 하는 비바샘 사이트의 특성상 비바샘 교사
                                        인증(EPKI/GPKI 인증 또는 서류 인증) 조건이 충족되지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제2조 (통합회원 가입 및 탈퇴 방법)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 비바샘, 티스쿨 각 홈페이지 회원가입 절차를 통해 통합회원으로 가입할 수 있으며, 신규회원의 경우 신규 회원가입, 기존 회원의 경우 통합회원 전환
                                        신청을 하고 각 사이트에서 본인 인증을 완료한 후 가입할 수 있습니다.
                                    </li>
                                    <li>2. 통합회원으로 가입한 경우, 각 사이트에서 필요한 필수 회원정보 입력을 요청할 수 있습니다. 입력이 되지 않았을 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>3. 통합회원 가입 이후 비바샘에서는 EPKI/GPKI 또는 서류인증을 요청할 수 있습니다. 이는 학교 현직교사임을 확인하기 위한 인증 절차로 인증이
                                        완료된 회원에게 비바샘 정회원 서비스가 제공됩니다. 그렇지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>4. 회원이 탈퇴를 원하는 경우 원하는 사이트에서 선택적으로 탈퇴할 수 있습니다.</li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제3조 (통합회원 아이디 &amp; 비밀번호 관리)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 회원의 아이디 및 비밀번호에 관한 관리책임은 회원 본인에게 있으며 제3자에게 자신의 아이디 및 비밀번호를 알려주거나 이용하게 해서는 안됩니다.
                                    </li>
                                    <li>2. 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 비바샘 또는 티스쿨에 통보하여 그 안내에 따라야
                                        합니다.
                                    </li>
                                    <li>3. 비바샘과 티스쿨은 각 사이트의 귀책사유 없이 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 유출한 데 따른 손해에 대해서는 법적 책임을
                                        부담하지 않습니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제4조 (비바샘, 티스쿨간 서비스 연계 불가)</div>
                            <div className="access_desc">
                                비바샘과 티스쿨 두 사이트가 하나의 사이트로 서비스를 통합하는 것은 아니므로, 각 사이트는 기존과 동일하게 독립적으로 운영되며, 이에 따라 각 사이트에서 제공하는
                                기본 서비스 및 이벤트, 마케팅 등과 같은 부가 서비스 또한 상호 호환, 전환, 연계되지 않습니다. <br/>
                                따라서 비바샘과 티스쿨이 회원에게 개별적으로 제공했거나 제공하고 있는 기존 서비스는 본 통합회원 서비스 가입과 상관 없이, 비바샘과 티스쿨에서 각각 정한 정책에 따라
                                이용 가능합니다.
                            </div>

                            <strong className="access_tit mt25">부칙 (2020. 07. 05.)</strong>
                            <div className="access_desc">
                                제 1 조 (시행일) : 이 약관은 2020년 7월 05일부터 시행합니다.
                            </div>
                        </div>
                        <div className="access_ver1 hide">
                            <span className="access_desc">(주)비상교육이 운영하는 교수지원사이트 ‘비바샘’(이하 ‘비바샘’이라 함)과 (주)비상교육의 자회사 (주)비상교육 티스쿨이 운영하는 원격교육연수사이트 ‘비상 티스쿨 원격교육연수원’(이하 ‘티스쿨’이라 함)은 상호 회원을 대상으로 보다 편리한 서비스를 제공하기 위하여 비상교육 선생님 통합회원(이하 ‘통합회원’이라 함) 서비스를 시행하고 있습니다. </span>

                            <div className="access_sub_tit">제1조 (정의 및 가입조건)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 통합회원 서비스란, 하나의 아이디와 비밀번호로 두 사이트를 모두 로그인하여 이용할 수 있는 서비스를 말합니다.</li>
                                    <li>2. 통합회원 서비스는, 티스쿨과 비바샘의 가입 조건을 허용하는 회원이 대상이긴 하나,
                                        현직 교사들을 대상으로 하는 비바샘 사이트의 특성상 비바샘 교사 인증(EPKI/GPKI 인증 또는 서류 인증) 조건이 충족되지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제2조 (통합회원 가입 및 탈퇴 방법)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 티스쿨, 비바샘 각 홈페이지 회원가입 절차를 통해 통합회원으로 가입할 수 있으며, 신규 회원의 경우 신규 회원가입, 기존 회원의 경우 통합회원 전환 신청을 하고 각 사이트에서 본인 인증을 완료한 후 가입할 수 있습니다.
                                    </li>
                                    <li>2. 통합회원으로 가입한 경우, 각 사이트에서 필요한 필수 회원정보 입력을 요청할 수 있습니다. 입력이 되지 않았을 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>3. 통합회원 가입 이후 비바샘에서는 EPKI/GPKI 또는 서류 인증을 요청할 수 있습니다. 이는 학교 현직 교사임을 확인하기 위한 인증 절차로 인증이 완료된 회원에게 비바샘 정회원 서비스가 제공됩니다. 그렇지 않은 경우 서비스 이용이 제한됩니다.
                                    </li>
                                    <li>4. 회원이 탈퇴를 원하는 경우 원하는 사이트에서 선택적으로 탈퇴할 수 있습니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제3조 (통합회원 아이디 &amp; 비밀번호 관리)</div>
                            <div className="access_desc">
                                <ul className="list_num">
                                    <li>1. 회원의 아이디 및 비밀번호에 관한 관리 책임은 회원 본인에게 있으며 제3자에게 자신의 아이디 및 비밀번호를 알려주거나 이용하게 해서는 안 됩니다.
                                    </li>
                                    <li>2. 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 티스쿨 또는 비바샘에 통보하여 그 안내에 따라야 합니다.
                                    </li>
                                    <li>3. 티스쿨과 비바샘은 각 사이트의 귀책사유 없이 회원이 자신의 아이디 및 비밀번호를 도용 당하거나 유출한 데 따른 손해에 대해서는 법적 책임을 부담하지 않습니다.
                                    </li>
                                </ul>
                            </div>

                            <div className="access_sub_tit">제4조 (비바샘, 티스쿨간 서비스 연계 불가)</div>
                            <div className="access_desc">
                                티스쿨과 비바샘 두 사이트가 하나의 사이트로 서비스를 통합하는 것은 아니므로, 각 사이트는 기존과 동일하게 독립적으로 운영되며, 이에 따라 각 사이트에서 제공하는 기본 서비스 및 이벤트, 마케팅 등과 같은 부가 서비스 또한 상호 호환, 전환, 연계되지 않습니다.
                                따라서 티스쿨과 비바샘이 회원에게 개별적으로 제공했거나 제공하고 있는 기존 서비스는 본 통합회원 서비스 가입과 상관없이, 티스쿨과 비바샘에서 각각 정한 정책에 따라 이용 가능합니다.
                            </div>

                            <strong className="access_tit mt25">부칙 (2019. 08. 31.)</strong>
                            <div className="access_desc">
                                제 1 조 (시행일) : 이 약관은 2019년 08월 31일부터 시행합니다.
                            </div>
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
)(withRouter(TermsSpecialPopupSwitch));
