import React, { Component } from 'react';
import { NoticeList } from 'components/cs';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';
import * as api from 'lib/api';
import connect from 'react-redux/es/connect/connect';
import { withRouter } from 'react-router';
import {initializeGtag} from "store/modules/gtag";

class NoticeListContainer extends Component {

    state = {
        totalElements: 0,
        number: 0,
        notices : [],
        visible : false,
        categoryCodes : [],
        noticeCode : 'NT000',
        selectedCate : '',
        loading: null,
    };
    
    getNoticeList = async (pageNo, changeCate) => {
        this.setState({loading: true}, ()=>{
            this.el.scrollIntoView(false);            
        });        
        try {
            const isChangeFilter = typeof changeCate === 'undefined' ? false : (this.state.selectedCate === changeCate ? false : true);
            
            if(!isChangeFilter) changeCate = this.state.selectedCate;

            const response = await api.noticeList(pageNo, changeCate);
            const result = response.data;
            const notices = result.content ? result.content : [];
            const {totalElements, totalPages, number} = result.page;

            let visible = false;

            if(totalElements > 0 && totalPages > number+1) visible = true;

            setTimeout(()=>{
                this.setState({
                    notices : isChangeFilter ? [...notices.map(n => n.content)] : [...this.state.notices, ...notices.map(n => n.content)],
                    visible,
                    totalElements,
                    number,
                    selectedCate : changeCate
                })
                this.setState({loading: false});
            }, 1000);//의도적 지연. 
        } catch (e) {
            console.log(e);
            this.setState({loading: false});
        }
    }

    getNoticeCategoryList = async() => {
        try {
            const response = await api.vscodeList(this.state.noticeCode);
            this.setState({
                categoryCodes : response.data
            })
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
            'page_path': '/cs/notice',
            'page_title': '공지사항｜비바샘'
        });
        window.scrollTo(0, 0);
        this.getNoticeCategoryList().then(()=>{            
            this.getNoticeList();
        });
        const logged = this.props.logged;
        if (logged) {
          console.log(this.props.myClassInfo);
          const schoolLvlCd = this.props.myClassInfo.schoolLvlCd;
          console.log(`schoolLvlCd : ${schoolLvlCd}`);
          if (schoolLvlCd == 'ES' || schoolLvlCd == 'MS') {
            this.setState({
              selectedCate: schoolLvlCd
            });
          }
        }
    }   

    handleMoreButton = () => {
        if (this.state.loading !== true) {            
            this.getNoticeList(this.state.number+1);            
        } 
    }

    handleChangeCategory = (e) => {
        this.setState({notices: [], loading: true, visible: false});
        this.getNoticeList(null, e.target.value);
    }
    
    render() {
        const {notices, visible, selectedCate, categoryCodes, loading} = this.state;
        let defaultValue = 'ES';
        return (
            <div ref={el => { this.el = el; }} className="client_notice">
                {loading === false && 
                    <div className="selectbox_align">
                        <div className="selectbox selTypeA">
                            <select value={selectedCate} name="srchCate" onChange={this.handleChangeCategory}>
                                <option value="MS">중/고등</option>
                                <option value="ES">초등</option>
                          </select>
                        </div>
                    </div>
                }                

                {notices.length === 0 && loading === true && 
                    <RenderLoading loadingType={"1"}/>
                }
                <div className="client_post">
                    <NoticeList notices={notices} />
                    {notices.length > 0 && loading === true && 
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
      myClassInfo: state.myclass.get('myClassInfo'),
  })
)(withRouter(NoticeListContainer));