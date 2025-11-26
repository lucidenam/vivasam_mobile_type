import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Slider from "react-slick";

class RollingBanner extends Component {
  render() {
    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        className: 'banner_rolling'
      };
    return (
        <Slider {...settings}>
                <div className="banner_rolling_list">
                    <a className="banner_rolling_link">
                        <em className="banner_rolling_tit">비바샘 회원이 되시면?</em>
                        <div className="banner_rolling_content">온리원 온라인 강의 할인쿠폰</div>
                        <img className="banner_rolling_img" src="/images/contents/marketing_vivasam1.png" alt=""/>
                    </a>
                </div>
                <div className="banner_rolling_list">
                    <a className="banner_rolling_link">
                        <em className="banner_rolling_tit">비바샘 회원이 되시면?</em>
                        <div className="banner_rolling_content">시험 대비 문제은행 자료 제공 서비스</div>
                        <img className="banner_rolling_img" src="/images/contents/marketing_vivasam2.png" alt=""/>
                    </a>
                </div>
                <div className="banner_rolling_list">
                    <a className="banner_rolling_link">
                        <em className="banner_rolling_tit">비바샘 회원이 되시면?</em>
                        <div className="banner_rolling_content">차별화된 비바샘 만의 멤버십 혜택</div>
                        <img className="banner_rolling_img" src="/images/contents/marketing_vivasam3.png" alt=""/>
                    </a>
                </div>
        </Slider>
    );
  }
}

export default RollingBanner;
