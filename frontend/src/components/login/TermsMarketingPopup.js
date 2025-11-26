import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class TermsMarketingPopup extends Component {

    state={
        termVersion: ''
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
                    <table className="tbl_terms">
                        <caption>마케팅 및 광고 활용 동의 테이블</caption>
                        <colgroup>
                            <col style={{width: '33.33%'}}/>
                            <col style={{width: '33.33%'}}/>
                            <col style={{width: '33.34%'}}/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th scope="col">목적</th>
                            <th scope="col">수집항목</th>
                            <th scope="col">보유기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>비바샘 자료 및 이벤트 안내(SMS, 이메일 , 전화)</td>
                            <td>이름, 휴대전화번호, 이메일</td>
                            <td className="txtLine">회원 탈퇴시까지또는 고객요청에 따라 개인정보 이용동의 철회 요청 시 까지</td>
                        </tr>
                        <tr>
                            <td>전국 시도 교육청 무료/유료 위탁연수 안내신규연수 과정 및 다양한 학습정보와 이벤트 소식 (SMS, 이메일, 전화)</td>
                            <td>이름, 아이디, 소속 교육청, 휴대전화번호(SMS, 유선안내), 이메일(DM), 담당교과</td>
                            <td className="txtLine">회원탈퇴 시 까지 또는 고객요청에 따라 개인정보 이용동의 철회 요청시 까지</td>
                        </tr>
                        </tbody>
                    </table>
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
)(withRouter(TermsMarketingPopup));
