import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as api from 'lib/api';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";

class NoticeViewContainer extends Component {
    constructor(props){
        super(props);

        this.state = {
            notice : {},
            pre : {},
            next : {},
            loading: false
        };
    }

    getNotice = async (noticeId) => {
        this.setState({loading: true});
        try {
            const response = await api.noticeView(noticeId);
            const result = response.data;
            if (result === '') {
                window.location.href= "/#/cs/notice";
                return;
            }
            this.setState({
                notice: result.content,
                pre : result.pre,
                next : result.next
            });
            window.scrollTo(0, 0)
        } catch(e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
                this.setState({loading: false});
            }, 700);            
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
        this.getNotice(this.props.id);
    }

    shouldComponentUpdate(nextProps, nextStage) {
        if(this.props.id !== nextProps.id) {
            this.getNotice(nextProps.id);
            return false;
        }
        return (nextStage !== this.state);
    }

    render() {
        const {notice, pre, next, loading} = this.state;
        return (
            <div className="clientNotiDtl_view">
                {loading === true && 
                    <RenderLoading />
                }
				<div className="clientNotiDtl_subject">
					<h3 className="clientNotiDtl_title">[{notice.noticeCdNm}] {notice.title}</h3>
					<span className="post_date"> {notice.openDttm} </span>
				</div>
				<div className="clientNotiDtl_cont">
					<p dangerouslySetInnerHTML={{__html: notice.contents}}></p>
				</div>
				<div className="guideline"></div>
				<div className="clientNotiDtl_navi_wrap">
					<div className="clientNotiDtl_navi">
                        {pre ? (
                            <Link to={"/cs/notice/" + pre.noticeId} className="clientNotiDtl_navi_link">
                                <strong className="clientNotiDtl_navi_title">이전글</strong>
                                <span className="clientNotiDtl_navi_txt">{pre.title}</span>
                            </Link>
                        ) : (
                            <a className="clientNotiDtl_navi_link">
                                <strong className="clientNotiDtl_navi_title">이전글</strong>
                                <span className="clientNotiDtl_navi_txt">이전글이 없습니다.</span>
                            </a>
                        )}
					</div>
					<div className="clientNotiDtl_navi">
                        {next ? (
                            <Link to={"/cs/notice/" + next.noticeId} className="clientNotiDtl_navi_link">
                                <strong className="clientNotiDtl_navi_title">다음글</strong>
                                <span className="clientNotiDtl_navi_txt">{next.title}</span>
                            </Link>
                        ) : (
                            <a className="clientNotiDtl_navi_link">
                                <strong className="clientNotiDtl_navi_title">다음글</strong>
                                <span className="clientNotiDtl_navi_txt">다음글이 없습니다.</span>
                            </a>
                        )}

					</div>
				</div>
                {/* <div>{notice.noticeId}</div>
                <div>{notice.readCnt}</div>
                <div>{notice.htmlYn}</div>
                <div>{notice.openYn}</div>
                <div>{notice.contents}</div> */}
            </div>
        );
    }
}

export default NoticeViewContainer;
