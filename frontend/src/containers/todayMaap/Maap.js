import React, {Component} from 'react';
import './Maap.css'
import * as common from 'lib/common';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from 'react-router-dom';
import DownloadInfo from 'components/common/DownloadInfo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';
import EvtTab1 from './EvtTab1';
import EvtTab2 from './EvtTab2';
import EvtTab3 from './EvtTab3';
import EvtTab4 from './EvtTab4';

class Maap extends Component {
    state = {
        realDomain : 'mv.vivasam.com',
        devDomain : 'dev-mv.vivasam.com',
        eventTitle : '[오늘뭐하지 음악,미술,체육,실과]',
        realUrl : 'https://mv.vivasam.com/#/liveLesson/WhatTodayMaap',
        devUrl : 'https://dev-mv.vivasam.com/#/liveLesson/WhatTodayMaap',
        webUrl : 'https://www.vivasam.com/event/2021/viewEvent339.do',
        bandUrl : '',
        eventUrl : '',
        tabCtrl: ['음악', '미술', '체육', '실과'],
        onIdx: 0,
        contentInfo:[
            {
                title:'초등음악3~4학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등음악3~4학년/신나는 음악수업_초등 음악 3~4학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등음악3~4학년/index.html'},
            {
                title:'초등음악5~6학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등음악5~6학년/신나는 음악수업_초등 음악 5~6학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등음악5~6학년/index.html'},
            {
                title:'초등미술3학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술3학년/재미있는 미술수업_초등 미술 3학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술3학년/index.html'},
            {
                title:'초등미술4학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술4학년/재미있는 미술수업_초등 미술 4학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술4학년/index.html'},
            {
                title:'초등미술5학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술5학년/재미있는 미술수업_초등 미술 5학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술5학년/index.html'},
            {
                title:'초등미술6학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술6학년/재미있는 미술수업_초등 미술 6학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등미술6학년/index.html'},
            {
                title:'초등체육3~4학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등체육3~4학년/즐거운 체육수업_초등 체육 3~4학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등체육3~4학년/index.html'},
            {
                title:'초등체육5~6학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등체육5~6학년/즐거운 체육수업_초등 체육 5~6학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등체육5~6학년/index.html'},
            {
                title:'초등실과5~6학년',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등실과5~6학년/호기심 실과 수업_초등 실과 5~6학년.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지음미체실_초등실과5~6학년/index.html'}
        ]
    }

    componentDidMount() {
        let eventUrl = '';
        let domain = '';
        let eventTitle = this.state.eventTitle;
        if(!window.location.href.indexOf('dev-mv.vivasam.com') > -1){
            eventUrl = this.state.realUrl;
            domain = this.state.realDomain;
        }else{
            eventUrl = this.state.devUrl;
            domain = this.state.devDomain;
        }
        this.setState({eventUrl: eventUrl});
        this.setState({bandUrl: "https://band.us/plugin/share?body="+encodeURIComponent(eventTitle+' '+eventUrl)+"&route="+domain});
    }

    copyToClipboard = (e) => {
        // 글을 쓸 수 있는 란을 만든다.
        let aux = document.createElement("input");
        // 지정된 요소의 값을 할당 한다.
        aux.setAttribute("value", this.state.eventUrl);
        // bdy에 추가한다.
        document.body.appendChild(aux);
        // 지정된 내용을 강조한다.
        aux.select();
        // 텍스트를 카피 하는 변수를 생성
        document.execCommand("copy");
        // body 로 부터 다시 반환 한다.
        document.body.removeChild(aux);
        common.info('링크가 복사되었습니다. 동료 선생님께\n비상교육 과목별 활동 자료집을 공유해 보세요.');
    };

    onKakaoFeed = (e) => {
        window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: this.state.eventTitle,
                description: '즐겁고 신선한 활동으로 수업의 흥미를 더해 줄 과목별 활동자료집을 제공합니다.',
                imageUrl: 'https://www.vivasam.com/vivasamfiledir/event/content/210409_today_maap_kakao.png',
                link: {
                    webUrl: this.state.webUrl,
                    mobileWebUrl: this.state.eventUrl
                },
            },
            buttons: [
                {
                    title: '자세히보기',
                    link: {
                        webUrl: this.state.webUrl,
                        mobileWebUrl: this.state.eventUrl
                    },
                }
            ]
        })
    }

    onBandFeed  = (e) => {
        let aux = document.createElement("a");
        aux.setAttribute("href", this.state.bandUrl);
        aux.setAttribute("target", '_blank');
        aux.click();
        aux.remove();
    }

    onGoEbook  = async(targetIdx) => {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }

        let ebookUrl = this.state.contentInfo[targetIdx].htmlUrl;

        let aux = document.createElement("a");
        aux.setAttribute("href", ebookUrl);
        aux.setAttribute("target", '_blank');
        aux.click();
        aux.remove();

        gtag('event', '오늘 뭐하지 음,미,체,실', {
            'parameter': '수업혁신',
            'parameter value': this.state.contentInfo[targetIdx].title + ' E-book'
        });
    }

    handleDownload = async(targetIdx) => {
        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }

        const {PopupActions} = this.props;

        const target = {
            dataset: {
                type: 'document',
                src: this.state.contentInfo[targetIdx].downUrl,
                name: this.state.contentInfo[targetIdx].title,
                id: '',
                gubun: '',
                summary: '',
                sourcename: '비상교육'
            }
        };
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '오늘 뭐하지 음,미,체,실', {
            'parameter': '수업혁신',
            'parameter value': this.state.contentInfo[targetIdx].title + ' 다운로드'
        });

        PopupActions.openPopup({title: target.dataset.name, componet: <DownloadInfo target={target}/>});
    }

    handleAuth = async() => {
        const { logged, BaseActions, ViewerActions, loginInfo } = this.props;
        try {
            BaseActions.openLoading();
            if(!logged){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                window.location.hash = "/login";
                window.viewerClose();
                return false;
            }

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            //평가자료 준회원 제한 체크
            ViewerActions.pushValues({type:"auth", object:true});
            return true;
        }catch(e) {
            console.log(e);
        }finally {
            BaseActions.closeLoading();
        }
    }

    eventEndMsg = async() => {
        common.info("이벤트가 종료되었습니다.");
    }

    onClickTab = (idx) => {
        const { onIdx } = this.state

        this.setState({
            onIdx: idx
        })
    }

    render() {
        const { tabCtrl, onIdx } = this.state
        const tabCont = {
            0: <EvtTab1
                    onBook={ this.onGoEbook }
                    onDown={ this.handleDownload }
                />,
            1: <EvtTab2 
                    onBook={ this.onGoEbook }
                    onDown={ this.handleDownload }
                />,
            2: <EvtTab3 
                    onBook={ this.onGoEbook }
                    onDown={ this.handleDownload }
                />,
            3: <EvtTab4 
                    onBook={ this.onGoEbook }
                    onDown={ this.handleDownload }
                />
        }

        return (
            <div className="evtWrap evtMaap">
                <div className="evt">
                    <div className="evtTopWrap">
                        <p>즐겁고 신선한 활동으로 수업의 흥미를 더해 줄<br /><strong>과목별 활동 자료집</strong>을 제공합니다.</p>
                        <div className="btnShareWrap">
                            <p>오늘 뭐하지<br />과목별 활동 자료집 공유하기</p>
                            <div className="btnShare">
                                <button type="button" className="btnLink"><img src="/images/contents/today/season1_done/btnLink.png" alt="링크 복사하기" onClick={this.copyToClipboard}/></button>
                                <button type="button" className="btnKakao"><img src="/images/contents/today/season1_done/btnKakao.png" alt="카카오 공유하기" onClick={this.onKakaoFeed}/></button>
                                <button type="button" className="btnBand"><img src="/images/contents/today/season1_done/btnBand.png" alt="밴드 공유하기" onClick={this.onBandFeed}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="evtTabWrap">
                        <div className="btnTabWrap">
                            {
                                tabCtrl.map((item, idx) => {
                                    return (
                                        <button 
                                            type="button" 
                                            className={`btnTab ${onIdx === idx ? 'on' : ''}`}
                                            key={`btnTab${idx}`}
                                            onClick={ () => this.onClickTab(idx) }
                                        >{ item }</button> 
                                    )
                                })
                            }
                        </div>
                        <div className="tabContWrap">
                            { tabCont[onIdx] }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(Maap));