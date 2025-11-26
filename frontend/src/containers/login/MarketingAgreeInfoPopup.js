import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import { getMarketingAgreeList } from 'lib/api';
import moment from "moment";

const Marketing = ({gubunCd, agreeYn, agreeDt}) => {
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
                {agreeYn === 'Y' ? '수신동의':'수신거부'} 설정이 정상 처리되었습니다.
            </p>
            <p className="marketing_set">
                <span className="set_tit">설정일자</span>
                <span className="set_date">
                    {moment(agreeDt, "YYYY-MM-DD").format("YYYY년 MM월 DD일")}
                </span>
            </p>
        </li>
    )
}

class MarketingAgreeInfoPopup extends Component {
    state = {
        agrees: null
    }
    closeButtonClick = async(e) => {
        e.preventDefault();
        const { PopupActions, handleClose } = this.props;
        await PopupActions.closePopup();
        if(handleClose) {
            handleClose();
        }
    }

    _fnCompare = (gubunCd) => {
        let order = 0;
        switch (gubunCd) {
            case 'S' : order=1; break;
            case 'E' : order=2; break;
            case 'T' : order=3; break;
            default : order=4;
        }

        return order;
    }

    getMarketingAgreeList = async () => {
        const response = await getMarketingAgreeList();
        this.setState({
            agrees: response.data
        });
    }

    componentDidMount() {
        this.getMarketingAgreeList();
    }

    render() {
        const { agrees } = this.state;
        if(agrees === null) {
            return false;
        }


        const agreeList = agrees.sort((a,b) => this._fnCompare(a.gubunCd)-this._fnCompare(b.gubunCd)).map((agree, index) => (<Marketing {...agree} key={index}/>));

        return (
            <section id="pop_content">
                <div className="marketing">
                    <p>설정하신 마케팅 및 광고 활용 동의 여부는 아래와 같습니다.</p>
                    <ul className="marketing_agree">
                        {agreeList}
                    </ul>
                    <button
                        type="button"
                        className="btn_full_on"
                        onClick={this.closeButtonClick}
                    >확인</button>
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
)(withRouter(MarketingAgreeInfoPopup));
