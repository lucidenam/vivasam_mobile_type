import React, {Component} from 'react';
import { withRouter, Link } from 'react-router-dom';
import { NoticeListContainer, NoticeViewContainer } from 'containers/cs';
import FooterContainer from 'containers/page/FooterContainer';

class NoticePage extends Component{
    goBack = () => {
        //this.props.history.goBack();
        const { history } = this.props;
        let pathname = history.location.pathname;
        if (pathname.indexOf("/cs/notice/") > -1) {
            history.replace('/');
            history.push('/cs/notice');
        } else if(pathname.indexOf("/cs/notice") > -1) {
            history.replace('/');
            history.push('/');
        } else {
            history.goBack();
        }
    }

    render () {
        return (
            <div>
                <header id="sticky" className="header_sub">
                    <h1 className="header_tit">공지사항</h1>
                    <div className="allMenu">
                        <a onClick={this.goBack} className="allMenu_back"><span className="blind">이전 페이지 이동</span></a>
                    </div>
                    <div className="rightMenu" style={{display: this.props.match.params.id ? 'block' : 'none'}}>
                        <Link to="/cs/notice" className="allMenu_right">목록</Link>
                    </div>
                </header>

                <section className="clinet_inquire">
                    <h2 className="blind">공지사항</h2>

                    {this.props.match.params.id ? (
                        <NoticeViewContainer id={this.props.match.params.id} />
                    ) : (
                        <NoticeListContainer />
                    )}

                </section>
                <FooterContainer />
            </div>
        )
    }
}

export default withRouter(NoticePage);
