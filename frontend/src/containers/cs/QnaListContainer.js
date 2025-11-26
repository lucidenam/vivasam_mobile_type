import React, { Component } from 'react';
import { QnaList, ReqDataList } from 'components/cs';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as baseActions from 'store/modules/base';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';
import * as common from 'lib/common';
import {initializeGtag} from "../../store/modules/gtag";

class QnaListContainer extends Component {

    state = {
        totalElements: 0,
        number: 0,
        qnas : [],
        visible : false,
        selectedFilter : 'ALL',
        codeList : [],
        isLoading : false
    };
    
    getCodeList = async(code) => {
        try {
            const response = await api.vscodeList('QA000');
            this.setState({
                codeList : response.data
            })
        } catch (e) {
            console.log(e);
        }
    }

    getQnaList = async (pageNo, changeFilter) => {
        try {
            const { BaseActions } = this.props;
            if(pageNo === null || pageNo === undefined) this.setState({ qnas : [] })

            const isChangeFilter = typeof changeFilter === 'undefined' ? false : (this.state.selectedFilter === changeFilter ? false : true);
            
            if(!isChangeFilter) changeFilter = this.state.selectedFilter;

            const response = await api.qnaList(pageNo, changeFilter);
            const result = response.data;
            const qnas = result.content ? result.content : [];
            const {totalElements, totalPages, number} = result.page;

            let visible = false;

            if(totalElements > 0 && totalPages > number+1) visible = true;

            this.setState({
                qnas : isChangeFilter ? [...qnas.map(n => n.content)] : [...this.state.qnas, ...qnas.map(n => n.content)],
                visible,
                totalElements,
                number,
                selectedFilter : changeFilter,
                isLoading : false
            })

            var qnaInfo = {
                changeFilter : this.state.selectedFilter
            }
            BaseActions.pushValues({type:"qnaInfo", object: qnaInfo});
        } catch (e) {
            console.log(e);
        } 
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/cs/qna',
            'page_title': '내 문의 내역｜비바샘'
        });
        const {history, qnaInfo, logged, BaseActions} = this.props;
        var vm = this;
        let changeFilter;

        if(!logged) { // 미로그인시
            common.info("로그인후 문의내역을 확인하실 수 있습니다.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }

        if(history !== undefined && history.action === 'POP') {
            if(qnaInfo != null && qnaInfo.changeFilter != null) {
                changeFilter = qnaInfo.changeFilter;
            }
        } else {
            changeFilter = this.state.changeFilter;
        }

        this.setState({
            isLoading : true,
            changeFilter : changeFilter
        })

        setTimeout(function(){
            vm.getCodeList();
            vm.getQnaList(null, changeFilter);
        }, 100);
    }   

    handleMoreButton = () => {
        this.getQnaList(this.state.number+1);
    }

    handleChangeFilter = (e) => {
        var vm = this;
        const targetValue = e.target.value;
        this.setState({ isLoading : true })
        setTimeout(function(){ vm.getQnaList(null, targetValue); }, 100);
    }
    
    render() {
        const {qnas, visible, selectedFilter, codeList, isLoading} = this.state;
        const myQnaListTemplate = <QnaList qnas={qnas} isLoading={isLoading}></QnaList>;

        const qnaCodeOptionList = codeList.map((code, index) => {
            return <option value={code.codeId} key={index}>{code.codeName}</option>
        });

        return (
            <div className="client_notice">
				<div className="selectbox_align">
					<div className="selectbox selTypeA">
                        <select name="srchFilter" value={selectedFilter} onChange={this.handleChangeFilter}>
                            <option value="ALL">전체</option>
                            {qnaCodeOptionList}
                        </select>
					</div>
				</div>
                <div className="client_post">
                    {isLoading && qnas.length === 0 &&
                        <RenderLoading loadingType={"2"}/>
                    }
                    {myQnaListTemplate}
                    {isLoading && qnas.length > 0 &&
                        <ContentLoading />
                    }
                    <a onClick={this.handleMoreButton} className="btn_full_off btn_full_sm btn_txt_bold" style={{display: visible ? 'block' : 'none'}}>더보기</a>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        qnaInfo : state.base.get('qnaInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(QnaListContainer));