import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { NoticeList } from 'components/main'
import * as api from 'lib/api';

class NoticeListContainer extends Component {

    state = {
        notices : []
    };

    getMainNoticeList = async () => {
        try {
            const response = await api.mainNoticeList();
            if(this._isMounted){
                this.setState({
                    notices : response.data
                })
            }
        } catch (e) {
            console.log(e);
        } 
    }

    componentDidMount() {
        this._isMounted = true;
        this.getMainNoticeList(); 
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        return (
            <div className="section notice">
                <h2 className="title">공지사항</h2>
                <NoticeList notices={this.state.notices}/>
                <Link to="/cs/notice" 
                    onClick={()=>{
                        gtag('event', '2025 개편', {
                            'parameter': '메인',
                            'parameter_value': '공지사항_더보기',
                            'parameter_url': window.location.origin + "/#/cs/notice"
                        });
                    }}
                    className="notice_more"><span className="blind">공지사항</span>더보기</Link>
            </div>
        );
    }
}

export default NoticeListContainer;