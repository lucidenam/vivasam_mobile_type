import React, {Component} from 'react';
import Slider from "react-slick";
import { withRouter, Link } from 'react-router-dom';
import { connect } from "react-redux";
import {bindActionCreators} from "redux";
import * as popupActions from 'store/modules/popup';
import { Event, EventAllPopup } from 'components/main'
import { linkTo } from 'lib/common';

class EventSlide extends Component {
    handleGoEvent = (url) => {
        const { history } = this.props;
        //history.push(url);
        linkTo(history, url);
    }

    handleAllEventsPopup = e => {
        e.preventDefault();
        const { events, PopupActions } = this.props;
        PopupActions.openPopup({title:"전체보기", componet:<EventAllPopup events={events}/>});
        // Style 설정
        document.body.style = "overflow: hidden;";

    }

    render() {
        const {events} = this.props;
        if(!events || events.length === 0) return null;

        //slick option 설정
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            className: 'event_list',
            autoplay: true,
            autoplaySpeed: 2000
        };

        //이벤트 리스트
        const eventList = events.map(event => {
            const eventProps = {...event, key : event.bannerId};
            return (<Event {...eventProps} handleGoEvent={this.handleGoEvent}/>);
        });

        return (
            <section className="event">
                <h2 className="blind">이벤트</h2>
                <div className="event_wrap">
                    <Slider {...settings}>
                        {eventList}
                    </Slider>
                </div>
                {
                    eventList.length > 1 && (
                        <div className="event_all">
                            <a onClick={this.handleAllEventsPopup} className="event_all_link">
                                All <span className="event_all_plus" />
                            </a>
                        </div>
                    )
                }
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(EventSlide));