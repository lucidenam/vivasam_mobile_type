import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class QnaTabMenu extends Component {
    render() {
        return (
            <div className="tab_wrap tabType02">
                <ul className="tab tabMulti">
                    <li className={"tab_item" + (this.props.currentTab === 'NEW' ? ' active' : '')}>
                        <Link to="/cs/qna/new" className="tab_link"><span>문의하기</span></Link>
                    </li>
                    <li className={"tab_item" + (this.props.currentTab === 'LIST' ? ' active' : '')}>
                        <Link to="/cs/qna" className="tab_link"><span>내 문의내역</span><span className="blind">현재페이지</span></Link>
                    </li>
                </ul>
            </div>
        );
    }
}

export default QnaTabMenu;
