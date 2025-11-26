import React, {Component} from 'react';
import './Season2.css'
import * as common from 'lib/common';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from 'react-router-dom';
import DownloadInfo from 'components/common/DownloadInfo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';

class Season2 extends Component {
    state = {
        data: [
            {id: 1, imgAlt: '역사와 친해지는 날, 오늘 뭐하지?', subTxt: '“어린이가 주인공인 오늘의 역사 수업!”\n멀기만 한 역사를 실생활 속에서 가깝게 배워보는 책.'},
            {id: 2, imgAlt: '과학과 친해지는 날, 오늘 뭐하지?', subTxt: '“교실 속 꼬마 과학자들의 과학 이야기”\n어려운 과학 이론도 재미있는 실험과 놀이로 술술 풀어 갑니다.'},
            {id: 3, imgAlt: '내 마음을 돌아보는 날, 오늘 뭐하지?', subTxt: '“오늘 하루 어땠니? 괜찮아. 잘 될 거야!”\n아이들의 마음을 보듬어 주고 응원해 주는 수업을 공유합니다.'},
            {id: 4, imgAlt: '책으로 여는 수업, 오늘 뭐하지?', subTxt: '“똑똑, 생각을 활짝 열어줄 독서 수업이 왔어요~”\n아이들의 생각이 무럭무럭 자라는 독서 수업 아이디어를\n담았습니다.'}
        ],

        popIndex: 0,
        realDomain : 'mv.vivasam.com',
        devDomain : 'dev-mv.vivasam.com',
        eventTitle : '[오늘뭐하지 시즌2 수업 사례집]',
        realUrl : 'https://mv.vivasam.com/#/liveLesson/WhatToday2',
        devUrl : 'https://dev-mv.vivasam.com/#/liveLesson/WhatToday2',
        webUrl : 'https://www.vivasam.com/event/2020/viewEvent311.do',
        bandUrl : '',
        eventUrl : '',
        
        contentInfo: [
            {
                title:'역사와친해지는날',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_역사와친해지는날/오늘뭐하지(시즌2)_역사와친해지는날.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_역사와친해지는날/index.html'
            },
            {
                title:'과학과친해지는날',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_과학과친해지는날/오늘뭐하지(시즌2)_과학과친해지는날.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_과학과친해지는날/index.html'
            },
            {
                title:'내마음을돌아보는날',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_내마음을돌아보는날/오늘뭐하지(시즌2)_내마음을돌아보는날.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_내마음을돌아보는날/index.html'
            },
            {
                title:'책으로여는수업',
                downUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_책으로여는수업/오늘뭐하지(시즌2)_책으로여는수업.pdf',
                htmlUrl:'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지시즌2_책으로여는수업/index.html'
            }
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

    popupOpen = async(num) => {
        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }
        
        this.setState({
            popIndex: num
        })
        window.scrollTo(0, 0)
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
        common.info('링크가 복사되었습니다. 동료 선생님께\n비상교육 오늘 뭐하지 시즌2 자료집을 공유해 보세요.');
    };

    onKakaoFeed = (e) => {
        window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: this.state.eventTitle,
                description: '초등학교 선생님의 생생한 수업 이야기와 아이들의 모습을 만나보세요.',
                imageUrl: 'https://www.vivasam.com/vivasamfiledir/event/content/210412_today_season2_kakao.png',
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
        gtag('event', '오늘 뭐하지 시즌2', {
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
        gtag('event', '오늘 뭐하지 시즌2', {
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
            <div className="evtWrap evtSeason2">
                <div className="evt">
                    <div className="evtTopWrap">
                        <h2><img src="/images/contents/today/season2/img01.jpg" alt="오늘 뭐하지 시즌2 수업 사례집을 공개합니다!" /></h2>
                        <p className="blind">초등학교 선생님의 생생한 수업 이야기와 아이들의 모습을 만나 보세요.</p>
                        <div className="btnShareWrap">
                            <p>오늘 뭐하지 시즌2 사례집 공유하기</p>
                            <div className="btnShare">
                                <button type="button" className="btnLink"><img src="/images/contents/today/season1_done/btnLink.png" alt="링크 복사하기" onClick={this.copyToClipboard}/></button>
                                <button type="button" className="btnKakao"><img src="/images/contents/today/season1_done/btnKakao.png" alt="카카오 공유하기" onClick={this.onKakaoFeed}/></button>
                                <button type="button" className="btnBand"><img src="/images/contents/today/season1_done/btnBand.png" alt="밴드 공유하기" onClick={this.onBandFeed}/></button>
                            </div>
                        </div>
                    </div>
                    <ul className="evtListWrap">
                        {
                            data.map((item, idx) => {
                                return (
                                    <li key={`evtList ${idx}`}>
                                        <img src={`/images/contents/today/season2/img0${idx + 2}.jpg`} alt={ item.imgAlt } />
                                        <div className="listCont">
                                            <p>{ item.subTxt }</p>
                                            <div className="btnWrap">
                                                <button type="button" className="btnEbook" onClick={() => this.onGoEbook(idx)}>E book 보기</button>
                                                <button type="button" className="btnDown" onClick={() => this.popupOpen(idx + 1)}>목록 보기 + 다운로드</button>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div id="evtPopWrap" className={ popIndex > 0 ? 'on' : '' }>
                    {
                        data.map((item, idx) => {
                            return (
                                <div key={`evtPop ${idx}`} className={`evtPopCont${ popIndex === (idx + 1) ? ' on' : ''}`}>
                                    <div className="evtPopImg">
                                        <img src={`/images/contents/today/season2/img_pop0${idx + 1}.jpg`} alt={`오늘뭐하지 시즌2. ${ item.imgAlt }`} />
                                    </div>
                                    <button type="button" className={`btnEvtPdf0${idx + 1}`} onClick={() => {this.handleDownload(idx)} }>PDF 다운로드</button>
                                    <button type="button" className="btnEvtPopClose" onClick={ () => this.popupOpen(0) }><span className="blind">팝업 닫기</span></button>
                                </div>
                            )
                        })
                    }
                    <div className="dimed"></div>
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
)(withRouter(Season2));