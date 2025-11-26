import React, {Component, useRef} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import Slider from "react-slick";

class Event extends Component {


  render() {
    //slick option 설정
    const settings1 = {
      className: 'rollingBox',
      infinite: true,
      slidesToShow: 2,
      slidesToScroll:1,
      speed:3000,
      autoplay: true,
      autoplaySpeed: 0,
      cssEase: 'linear',
      arrows: false,
      dots:false,
      pauseOnHover:false,
      draggable:false,
      swipe:false,
      variableWidth:true,
    };
    return (
      <section className="event250604">
        <div className="evtCont01">
          <h1><img src="/images/events/2025/event250604/img1.png" alt="비상한 AIDT 챌린지"/></h1>
        </div>
        <div className="evtCont02">
          <h1><img src="/images/events/2025/event250604/img2.png" alt="이벤트 안내"/></h1>
        </div>
        <div className="evtCont03">
          <h1><img src="/images/events/2025/event250604/img3.png" alt="제작 가이드 - 숏츠 부문"/></h1>
          <Slider {...settings1}>
            <div className="slide">
              <img src="/images/events/2025/event250604/rollingItem1.png" alt="예시 주제"/>
            </div>
            <div className="slide">
              <img src="/images/events/2025/event250604/rollingItem2.png" alt="예시 주제"/>
            </div>
            <div className="slide">
              <img src="/images/events/2025/event250604/rollingItem3.png" alt="예시 주제"/>
            </div>
            <div className="slide">
              <img src="/images/events/2025/event250604/rollingItem4.png" alt="예시 주제"/>
            </div>
            <div className="slide">
              <img src="/images/events/2025/event250604/rollingItem5.png" alt="예시 주제"/>
            </div>
          </Slider>
        </div>
        <div className="evtCont04">
          <h1><img src="/images/events/2025/event250604/img4.png" alt="제작 가이드 - 사진 부문"/></h1>
        </div>
        <div className="evtCont05">
          <h1><img src="/images/events/2025/event250604/img5.png" alt="유의 사항"/></h1>
        </div>
      </section>
    );
  }
}

export default connect(
  (state) => ({
    logged: state.base.get('logged'),
    loginInfo: state.base.get('loginInfo').toJS(),
    event: state.saemteo.get('event').toJS(),
  }),
  (dispatch) => ({
    BaseActions: bindActionCreators(baseActions, dispatch),
  })
)(withRouter(Event));