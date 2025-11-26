import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from '../../../../lib/StringUtils';
import Slider from "react-slick";
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";

class Event extends Component {
  state = {
    eventId: 591,
    isEventApply: false, // 신청여부
    schoolLvlCd: '',
  }

  componentDidMount = async () => {
    const {BaseActions} = this.props;
    BaseActions.openLoading();
    try {
      await this.eventApplyCheck();
    } catch (e) {
      console.log(e);
      common.info(e.message);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }
    await this.setEventInfo();

  };

  // 기 신청 여부 체크
  eventApplyCheck = async () => {
    const {logged} = this.props;
    const {isEventApply} = this.state;

    if (logged) {
      const response = await api.chkEventJoin({eventId: 571});

      if (response.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply: true
        });
      }
    }
  }

  setEventInfo = async () => {
    const {event, SaemteoActions} = this.props;

    event.teacherAnnual = '';
    event.teacherHope = '';
    SaemteoActions.pushValues({type: "event", object: event});
  }

  render() {
    //slick option 설정
    const settings = {
      slidesToShow:3,
      slidesToScroll:1,
      swipe:false,
      speed: 5000,
      vertical:true,
      autoplay: true,
      autoplaySpeed:0,
      pauseOnFocus:false,
      dots: false,
      infinite: true,
      arrows: false,
      cssEase: 'linear',
      className: 'text-book-swiper-vertical'
    };
    const settings2 = {
      slidesToShow:3,
      slidesToScroll:1,
      swipe:false,
      speed: 5000,
      vertical:true,
      rtl:true,
      autoplay: true,
      autoplaySpeed:0,
      pauseOnFocus:false,
      dots: false,
      infinite: true,
      arrows: false,
      cssEase: 'linear',
      className: 'text-book-swiper-vertical'
    };

    return (
      <section className="event250922">
        <div className="evtTitWrap">
          <div className="evt-swiper-wrapper">
            <Slider {...settings}>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item01.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item02.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item03.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item04.jpg" alt="표지 이미지"/></div>
            </Slider>
            <Slider {...settings2}>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item05.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item06.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item07.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item08.jpg" alt="표지 이미지"/></div>
            </Slider>
            <Slider {...settings}>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item09.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item10.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item11.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item12.jpg" alt="표지 이미지"/></div>
            </Slider>
            <Slider {...settings2}>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item13.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item14.jpg" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item15.png" alt="표지 이미지"/></div>
              <div className="thumb"><img src="/images/events/2025/event250922/book_item16.jpg" alt="표지 이미지"/></div>
            </Slider>
          </div>
        </div>

        <div className="evtContWrap">
          <div className="evtCont evtCont01">
            <img src="/images/events/2025/event250922/img2.png" alt="참여 혜택"/>
            <a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://www.vivasam.com/event/2025/viewEvent591')} target="_blank" className="btnEvtLink"><span className="blind">PC 버전으로 보기</span></a>
          </div>
        </div>
      </section>
    )
  }
}

export default connect(
  (state) => ({
    logged: state.base.get('logged'),
    loginInfo: state.base.get('loginInfo').toJS(),
    event: state.saemteo.get('event').toJS(),
    answerPage: state.saemteo.get('answerPage').toJS(),
    eventAnswer: state.saemteo.get('eventAnswer').toJS()
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch),
    SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
    MyclassActions: bindActionCreators(myclassActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch),
  })
)(withRouter(Event));