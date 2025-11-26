import React, {Component} from 'react';
import './Season3.css'
import * as common from 'lib/common';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from 'react-router-dom';
import DownloadInfo from 'components/common/DownloadInfo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';

class Season3 extends Component {
    state = {
        popIndex: 0,
        realDomain : 'mv.vivasam.com',
        devDomain : 'dev-mv.vivasam.com',
        eventTitle : '[오늘뭐하지 시즌3]',
        realUrl : 'https://mv.vivasam.com/#/liveLesson/WhatToday3',
        devUrl : 'https://dev-mv.vivasam.com/#/liveLesson/WhatToday3',
        webUrl : 'https://www.vivasam.com/event/2021/viewEvent342.do',
        bandUrl : '',
        eventUrl : '',
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
        common.info('링크가 복사되었습니다. 동료 선생님께\n비상교육 오늘 뭐하지 시즌3 자료집을 공유해 보세요.');
    };

    onKakaoFeed = (e) => {
        window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: this.state.eventTitle,
                description: '초등학교 선생님의 생생한 수업 이야기와 아이들의 모습을 만나보세요.',
                imageUrl: 'https://www.vivasam.com/vivasamfiledir/event/content/210412_today_season3_kakao.png',
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
        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }
        
        const ebookUrl = this.state.contentInfo[targetIdx].htmlUrl;
        
        let aux = document.createElement("a");
        aux.setAttribute("href", ebookUrl);
        aux.setAttribute("target", '_blank');
        aux.click();
        aux.remove();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '오늘 뭐하지 시즌3', {
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
        gtag('event', '오늘 뭐하지 시즌3', {
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

    render() {
        const { data, popIndex } = this.state

        return (
            <div className="evtWrap evtSeason3">
                <div className="evt">
                    <div className="evtTopWrap">
                        <h2><img src="/images/contents/today/season3/img01.png" alt="선생님의 수업자료가 오늘 뭐하지 사례집으로 제작됩니다." /></h2>
                        <div className="btnShareWrap">
                            <p>오늘 뭐하지 시즌3 이벤트 공유하기</p>
                            <div className="btnShare">
                                <button type="button" className="btnLink"><img src="/images/contents/today/season1_done/btnLink.png" alt="링크 복사하기" onClick={this.copyToClipboard}/></button>
                                <button type="button" className="btnKakao"><img src="/images/contents/today/season1_done/btnKakao.png" alt="카카오 공유하기" onClick={this.onKakaoFeed}/></button>
                                <button type="button" className="btnBand"><img src="/images/contents/today/season1_done/btnBand.png" alt="밴드 공유하기" onClick={this.onBandFeed}/></button>
                            </div>
                        </div>
                        <div className="evtInfo">
                            <div className="infoItem">
                                <span className="tit">공모기간</span>
                                <p>2021년 5월 3일 ~ 6월 30일</p>
                            </div>
                            <div className="infoItem">
                                <span className="tit">응모방법</span>
                                <p>4개의 주제에 알맞은 수업 자료를 등록해 주세요.</p>
                            </div>
                            <div className="infoItem">
                                <span className="tit">응모자료 구성</span>
                                <p>수업지도안 / 수업 활동 내용(구성 자유)</p>
                            </div>
                            <div className="infoItem">
                                <span className="tit">공모결과</span>
                                <p>2021년 7월 9일 선정작 발표</p>
                            </div>
                        </div>
                    </div>
                    <div className="evtListWrap">
                        <ul>
                            <li>우리 동네를<br />탐험하는 날</li>
                            <li>미래의 내가<br />궁금한 날</li>
                            <li>다양한 문화를 가진<br />친구들과 함께</li>
                            <li>책으로 여는<br />수업</li>
                        </ul>
                        <span className="listInfoTxt">※ 수업지도안 샘플 보기 및 수업자료 등록 등<br />자세한 사항은 비바샘 PC에서 확인하실 수 있습니다.</span>
                    </div>
                    <div className="evtNotiWrap">
                        <h2>유의사항 안내</h2>
                        <ul>
                            <li>‘오늘 뭐하지’ 시즌3 사례집은 <strong>2021년 2학기에 책으로 제작</strong>되어 비바샘을 통해 배포됩니다.</li>
                            <li>제출한 원고는 반환되지 않습니다. 저작권과 초상권은 사례집 제작 시 별도 논의합니다. <strong>선정되신 후에도 제출하신 자료를 수업용/강의용으로 언제든 활용하실 수 있습니다.</strong></li>
                            <li>선정되신 선생님들께는 <strong>소정의 원고료</strong>를 드립니다. </li>
                        </ul>
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
)(withRouter(Season3));