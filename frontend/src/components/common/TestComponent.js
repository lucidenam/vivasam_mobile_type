import React, {Component} from 'react';
import '../../containers/today/Season1Done.css'
import * as common from 'lib/common';
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from 'react-router-dom';
import {getContentInfo} from 'lib/api';
import DownloadInfo from 'components/common/DownloadInfo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';

class TestComponent extends Component {
    state = {
        data: [
            {id:1, img_url: '/images/contents/today/season1_done/popCont01.jpg', img_alt: '오늘 뭐하지 시즌1. 새로운 친구와 만나는 날, 오늘 뭐하지?', cid:'272873'},
            {id:2, img_url: '/images/contents/today/season1_done/popCont02.jpg', img_alt: '오늘 뭐하지 시즌1. 세상을 바꾸고 싶은 날, 오늘 뭐하지?', cid:'272874'},
            {id:3, img_url: '/images/contents/today/season1_done/popCont03.jpg', img_alt: '오늘 뭐하지 시즌1. 수학과 친해지는 날, 오늘 뭐하지?', cid:'272876'},
            {id:4, img_url: '/images/contents/today/season1_done/popCont04.jpg', img_alt: '오늘 뭐하지 시즌1. 책으로 여는 수업, 오늘 뭐하지?', cid:'272875'},
        ],
        popIndex: 0,
        realDomain : 'm.vivasam.com',
        devDomain : 'mdev.vivasam.com',
        eventTitle : '오늘뭐하지 시즌1(초등) : 선생님의 수업 사례집을 공개합니다.',
        realUrl : 'https://m.vivasam.com/#/today/Season1Done',
        devUrl : 'https://mdev.vivasam.com/#/today/Season1Done',
        webUrl : 'https://www.vivasam.com/event/2020/viewEvent293.do',
        bandUrl : '',
        eventUrl : ''
    }

    componentDidMount() {
        let eventUrl = '';
        let domain = '';
        let eventTitle = this.state.eventTitle;
        if(window.location.href.indexOf('m.vivasam.com') > -1){
            eventUrl = this.state.realUrl;
            domain = this.state.realDomain;
        }else{
            eventUrl = this.state.devUrl;
            domain = this.state.devDomain;
        }
        this.setState({eventUrl: eventUrl});
        this.setState({bandUrl: "https://band.us/plugin/share?body="+encodeURIComponent(eventTitle+' '+eventUrl)+"&route="+domain});
    }

    popupOpen = num => {
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
        common.info('링크가 복사되었습니다.');
    };

    onKakaoFeed = (e) => {
        window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '선생님의 수업 사례집을 공개합니다.',
                description: '오늘뭐하지 시즌1(초등) ',
                imageUrl: 'https://www.vivasam.com/vivasamfiledir/event/content/201019_today_done_kakao.png',
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

    onGoEbook  = async(targetId) => {

        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }

        let ebookUrl = '';
        if(targetId == 1){
            ebookUrl = 'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지_새로운친구와만나는날(20)/index.html';
        }else if(targetId == 2){
            ebookUrl = 'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지_세상을바꾸고싶은날/index.html';
        }else if(targetId == 3){
            ebookUrl = 'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지_수학과친해지는날/index.html';
        }else if(targetId == 4){
            ebookUrl = 'https://dn.vivasam.com/VS/EBOOK/초등오늘뭐하지_책으로여는수업(20)/index.html';
        }
        let aux = document.createElement("a");
        aux.setAttribute("href", ebookUrl);
        aux.setAttribute("target", '_blank');
        aux.click();
        aux.remove();
    }

    handleDownload = async(cid) => {

        // 로그인 및 인증 체크
        let auth = await this.handleAuth();
        if(!auth){
            return false;
        }

        const {PopupActions} = this.props;
        const response = await getContentInfo(cid);

        const {contentId, contentGubun, filePath, saveFileName, fileType, subject, summary, copyrightName} = response.data;

        let type;
        if (fileType === 'FT201' || fileType === 'FT204') {
            type = 'video';
        } else if (fileType === 'FT202') {
            type = 'audio';
        } else if (fileType === 'FT203') {
            type = 'image';
        } else if (saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))) {
            type = 'etc';
        } else if (fileType === 'FT205') {
            type = 'document';
        } else if (contentGubun === 'CN070') {
            type = 'smart';
        } else {
            type = 'etc';
        }
        const target = {
            dataset: {
                type: type,
                src: DOWNLOAD_IMAGE_PATH + filePath + saveFileName,
                name: subject,
                id: contentId,
                gubun: contentGubun,
                summary: summary,
                sourcename: copyrightName
            }
        };

        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '다운로드', {
            'parameter': '뷰어',
            'parameter value': target.dataset.name
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

    render() {
        const { data, popIndex } = this.state

        return (
            <div className="evtWrap evtSeason1Done">
                <div className="evt">
                    <div className="evtTopWrap">
                        <img src="/images/contents/today/season1_done/cont01.png" alt="" />
                        <div className="blind">
                            <h4>오늘 뭐하지 시즌1 수업 사례집을 공개합니다!</h4>
                            <p>초등학교 선생님의 생생한 수업 이야기와 아이들의 모습을 만나 보세요.</p>
                        </div>
                        <div className="btnShareWrap">
                            <p className="blind">오늘 뭐하지 시즌1 ‘수업 사례집’ 공유하기</p>
                            <div className="btnShare">
                                <button type="button" className="btnLink"><img src="/images/contents/today/season1_done/btnLink.png" alt="링크 복사하기" onClick={this.copyToClipboard}/></button>
                                <button type="button" className="btnKakao"><img src="/images/contents/today/season1_done/btnKakao.png" alt="카카오 공유하기" onClick={this.onKakaoFeed}/></button>
                                <button type="button" className="btnBand"><img src="/images/contents/today/season1_done/btnBand.png" alt="밴드 공유하기" onClick={this.onBandFeed}/></button>
                            </div>
                        </div>
                    </div>
                    <ul className="evtListWrap">
                        <li>
                            <img src="/images/contents/today/season1_done/listItem01.png" alt="" />
                            <strong className="blind">새로운 친구와 만나는 날, 오늘 뭐하지?</strong>
                            <p className="blind">“두근두근 설레는 첫 만남! 우리 친구가 될 수 있을까?” 신학기의 긴장을 풀어주는 마법 같은 책</p>
                            <div className="btnWrap">
                                <button type="button"><img src="/images/contents/today/season1_done/btn01.png" alt="E book 보기" onClick={() => this.onGoEbook(1)}/></button>
                                <button type="button" onClick={ () => this.popupOpen(1) }>
                                    <img src="/images/contents/today/season1_done/btn02.png" alt="목록보기+다운로드" />
                                </button>
                            </div>
                        </li>
                        <li>
                            <img src="/images/contents/today/season1_done/listItem02.png" alt="" />
                            <strong className="blind">세상을 바꾸고 싶은 날, 오늘 뭐하지?</strong>
                            <p className="blind">“세상을 바꾸는 첫걸음을 교실에서!” 다양한 방법으로 더 좋은 미래를 만드는 수업을 만나보세요!</p>
                            <div className="btnWrap">
                                <button type="button"><img src="/images/contents/today/season1_done/btn01.png" alt="E book 보기" onClick={() => this.onGoEbook(2)}/></button>
                                <button type="button" onClick={ () => this.popupOpen(2) }>
                                    <img src="/images/contents/today/season1_done/btn02.png" alt="목록보기+다운로드" />
                                </button>
                            </div>
                        </li>
                        <li>
                            <img src="/images/contents/today/season1_done/listItem03.png" alt="" />
                            <strong className="blind">수학과 친해지는 날, 오늘 뭐하지?</strong>
                            <p className="blind">“이게 진짜 수학 수업이라고?” 수학인지, 놀이인지 헷갈릴 정도로 재미있는 꿀잼 수학 수업 모음집!</p>
                            <div className="btnWrap">
                                <button type="button"><img src="/images/contents/today/season1_done/btn01.png" alt="E book 보기" onClick={() => this.onGoEbook(3)}/></button>
                                <button type="button" onClick={ () => this.popupOpen(3) }>
                                    <img src="/images/contents/today/season1_done/btn02.png" alt="목록보기+다운로드" />
                                </button>
                            </div>
                        </li>
                        <li>
                            <img src="/images/contents/today/season1_done/listItem04.png" alt="" />
                            <strong className="blind">책으로 여는 수업, 오늘 뭐하지?</strong>
                            <p className="blind">“똑똑, 생각을 활짝 열어줄 독서 수업이 왔어요~” 아이들의 생각이 무럭무럭 자라는 독서 수업 아이디어를 담았습니다.</p>
                            <div className="btnWrap">
                                <button type="button"><img src="/images/contents/today/season1_done/btn01.png" alt="E book 보기" onClick={() => this.onGoEbook(4)}/></button>
                                <button type="button" onClick={ () => this.popupOpen(4) }>
                                    <img src="/images/contents/today/season1_done/btn02.png" alt="목록보기+다운로드" />
                                </button>
                            </div>
                        </li>
                    </ul>
                    <div className="evtTxtWrap">
                        <img src="/images/contents/today/season1_done/txt01.png" alt="오늘 뭐하지 시즌2가 진행중입니다. 선생님의 수업 아이디어를 보여주세요." />
                        <button type="button" onClick={this.eventEndMsg} className="btnEnter"><img src="/images/contents/today/season1_done/btnEnter.png" alt="오늘 뭐하지 시즌2 응모하기"/></button>
                        {/*
                        <a href="https://www.vivasam.com/event/2020/viewEvent311.do?deviceMode=pc" className="btnEnter" target="_blank"><img src="/images/contents/today/season1_done/btnEnter.png" alt="오늘 뭐하지 시즌2 응모하기"/></a>
                        */}
                    </div>
                </div>

                <div id="evtPopWrap" className={ popIndex > 0 ? 'on' : '' }>
                    {
                        data.map((item, idx) => {
                            return (
                                <div key={`evtPop ${idx}`} className={`evtPopCont${ popIndex === (idx + 1) ? ' on' : ''}`}>
                                    <div className="evtPopImg">
                                        <img src={ item.img_url } alt={ item.img_alt } />
                                    </div>
                                    <span className="btnPdfWrap"><button type="button" className="btnEvtPdf"><img src="/images/contents/today/season1_done/btnPdf.png" alt="PDF 다운로드" onClick={() => {this.handleDownload(item.cid)}}/></button></span>
                                    <span className="btnCloseWrap" onClick={ () => this.popupOpen(0) }><button type="button" className="btnEvtPopClose"><img src="/images/contents/today/season1_done/btnEvtPopClose.png" alt="팝업 닫기" /></button></span>
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
)(withRouter(TestComponent));