import React, { Component } from 'react';
import { withRouter,Prompt } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';

class HeaderPopupContainer extends Component {

    constructor(props){
        super(props);
        window.popupClose = this.popupClose;
    }

    popupClose = debounce(() => {
        const { PopupActions, handleClose } = this.props;
        PopupActions.closePopup();
        if(handleClose) {
            handleClose();
        }
        // Style 설정
        document.body.style = "";
    }, 300);

    render() {
        const { popupClose } = this;
        const { title, logged, children, closeButtonHidden, wrapClassName,counter } = this.props;
        const clazz = wrapClassName ? wrapClassName : '';
        return (
            <div id="pop_wrap" className={clazz}>
                <div id="pop_header" className="pop_header sticky">
                    <h1 className="header_tit">{title}{ wrapClassName === 'pop_type2' ? <span className="counter">{counter}</span> : ''}</h1>
                    <div className="btnClose" hidden={closeButtonHidden}>
                        <button
                            onClick={this.popupClose}
                            className="btn_close"
                            >
                            <span className="blind">
                                팝업 닫기
                            </span>
                        </button>
                    </div>
                    { wrapClassName === 'pop_type2' ? <div className="guideline new251"></div> : ''}
                </div>
                {children}
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        closeButtonHidden : state.popup.get('closeButtonHidden'),
        wrapClassName: state.popup.get('wrapClassName'),
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(HeaderPopupContainer));
