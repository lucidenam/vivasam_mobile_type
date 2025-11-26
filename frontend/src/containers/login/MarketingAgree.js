import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as joinActions from 'store/modules/join';
import * as popupActions from 'store/modules/popup';

const Marketing = ({gubunCd, agree, agreeDate}) => {
    let title;
    switch (gubunCd) {
        case 'S' : title='SMS (문자)'; break;
        case 'E' : title='E-mail'; break;
        case 'T' : title='전화'; break;
        default : title='';
    }
    return (
        <li className="agree_item">
            <strong className="marketing_title">
                {title}
            </strong>
            <p>
                {agree ? '수신동의':'수신거부'} 설정이 정상 처리되었습니다.
            </p>
            <p className="marketing_set">
                <span className="set_tit">설정일자</span>
                <span className="set_date">
                    {agreeDate}
                </span>
            </p>
        </li>
    )
}

class MarketingAgree extends Component {

    closeButtonClick = async(e) => {
        e.preventDefault();
        const { JoinActions, PopupActions, handleClose, history, url } = this.props;
        JoinActions.defaultStore(); // store 초기화
        await PopupActions.closePopup();
        if(url){
            history.push(url);
        }
        if(handleClose) {
            handleClose();
        }
    }

    render() {
        const { agrees } = this.props;
        if(agrees === null || agrees.length === 0) {
            this.closeButtonClick();
            return null;
        }
        const agreeList = agrees.map((agree, index) => (<Marketing {...agree} key={index}/>));
        return (
            <section id="pop_content">
                <div className="marketing">
                    <div className="join_complete_txt">
                        <p>
                            회원가입 시 설정하신
                            <br/>
                            <span className="join_complete_marker">마케팅 및 광고 활용 동의 여부</span>는 아래와 같습니다.
                        </p>
                    </div>
                    <ul className="marketing_agree">
                        {agreeList}
                    </ul>
                </div>
                <button
                    onClick={this.closeButtonClick}
                    className="btn_full_on"
                >확인</button>
            </section>
        );
    }
}
export default connect(
    null,
    (dispatch) => ({
        JoinActions: bindActionCreators(joinActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(MarketingAgree));
