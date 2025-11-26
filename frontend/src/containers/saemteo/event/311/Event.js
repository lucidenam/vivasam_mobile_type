import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{
    constructor(props) {
        super(props);
        this.state = {
            realDomain : 'm.vivasam.com',
            devDomain : 'mdev.vivasam.com',
            eventTitle : '오늘 뭐하지 시즌2(초등) : 선생님의 수업자료가 \'오늘 뭐하지\' 사례집으로 제작됩니다.',
            realUrl : 'https://m.vivasam.com/#/saemteo/event/view/311',
            devUrl : 'https://mdev.vivasam.com/#/saemteo/event/view/311',
            eventUrl : ''
        };
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
        document.getElementById("a_band").href = "https://band.us/plugin/share?body="+encodeURIComponent(eventTitle+' '+eventUrl)+"&route="+domain;
        this.setState({eventUrl: eventUrl});
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
        common.info('링크가 복사되었습니다.동료 선생님과\n함께 이벤트에 참여해 보세요.');
    };

    onKakaoFeed = (e) => {
        window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '선생님의 수업자료가 \'오늘 뭐하지\' 사례집으로 제작됩니다.',
                description: '오늘 뭐하지 시즌2',
                imageUrl: 'https://www.vivasam.com/vivasamfiledir/event/content/201012_casebk_kakao_V2.png',
                link: {
                    webUrl: 'https://www.vivasam.com/event/2020/viewEvent311.do',
                    mobileWebUrl: this.state.eventUrl
                },
            },
            buttons: [
                {
                    title: '자세히보기',
                    link: {
                        webUrl: 'https://www.vivasam.com/event/2020/viewEvent311.do',
                        mobileWebUrl: this.state.eventUrl
                    },
                }
            ]
        })
    }

    render () {
        return (
            <div className="event200922">
                <h1><img src="/images/events/2020/event200922/img01.jpg" alt="선생님의 수업자료가 오늘뭐하지 사례집으로 제작됩니다"/></h1>
                <div className="blind">
                    <dl>
                        <dt>공고기간</dt>
                        <dd>2020년 10월 12일~ 12월 31일</dd>
                        <dt>응모방법</dt>
                        <dd>4개의 주제에 알맞은 수업 자료를 등록해 주세요.</dd>
                        <dt>응모자료 구성</dt>
                        <dd>수업지도안/수업 활동 내용(구성자유)</dd>
                        <dt>공묘결과</dt>
                        <dd>2021년 1월 15일 선정작 발표</dd>
                    </dl>
                    <ul>
                        <li>역사와 친해지는 날</li>
                        <li>과학과 친해지는 날</li>
                        <li>내 마음을 돌아보는 날</li>
                        <li>책으로 여는 수업</li>
                    </ul>
                    <p>* 수업지도안 샘플 보기 및 수업자료 등록 등 자세한 사항은 비바샘 PC홈페이지에서 확인하실 수 있습니다.</p>
                    <h3>유의사항</h3>
                    <ul>
                        <li>‘오늘 뭐하지’ 시즌 2 사례집은 2021년 1학기에 책으로 제작되어
                        비바샘을 통해 배포됩니다.
                        </li>
                        <li>저작권과 초상권은 사례집 제작 시  별도 논의합니다. </li>
                        <li>선정되신 후에도 제출하신 자료를 수업용/강의용으로 언제든
                        활용하실 수 있습니다.</li>
                        <li>선정되신 선생님들께는 소정의 원고료를 드립니다. </li>
                    </ul>
                </div>

                <img src="/images/events/2020/event200922/link.png" alt="링크복사" className="eventIcon link" onClick={this.copyToClipboard}/>
                <img src="/images/events/2020/event200922/kakao.png" alt="카카오" className="eventIcon kakao" onClick={this.onKakaoFeed}/>
                <a href="" target="_blank" id="a_band">
                    <img src="/images/events/2020/event200922/band.png" alt="밴드" className="eventIcon band"/>
                </a>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;