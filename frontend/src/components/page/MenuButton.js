import React, {Component, Fragment} from 'react';
import {Link} from "react-router-dom";

class MenuButton extends Component{
    state = {
        moreBtn : false
    }

    render() {
        const {moreBtn} = this.state;

        function gtag(){
            window.dataLayer.push(arguments);
        }

        const handleMore = (e) => {
            e.preventDefault();

            this.setState({
                moreBtn: !moreBtn
            });

            gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '교과서 자료 요청(케밥)', 'parameter_url': window.location.href});
        }

        const menuButton = (
            <button type="button" className="classdetail_top_menu icon_menu" name={"moreBtn"}
                // ref={this.moreBtnRef}
                    onClick={handleMore}
            >
                <span className="blind">단원별자료 더보기</span>
            </button>
        );

        const innerMenu = (
            <div className="layer_help type3" hidden={!moreBtn}>
                <div className="layer_help_box">
                    <Link to="/cs/qna/new" name="reqData" className="layer_help_txt" onClick={() => {
                        gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '교과서 자료 요청', 'parameter_url': window.location.origin + "/#/cs/qna/new"})
                    }}>교과서 자료 요청</Link>
                </div>
            </div>
        );

        return (
            <Fragment>
                {menuButton}
                {innerMenu}
            </Fragment>
        )
    }
}

export default MenuButton;
