import React, {Component} from 'react';
import { connect } from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import * as popupActions from 'store/modules/popup';
import { Event } from 'components/main'
import { linkTo } from 'lib/common';

class EventAllPopup extends Component {

    handleGoEvent = async (url) => {
        const { history, PopupActions } = this.props;
        await PopupActions.closePopup();
        //history.push(url);
        linkTo(history, url);
    }

    componentDidMount() {
        // Rendering 이후 Size 변경
        var listHeight = window.innerHeight - 55  + "px";
        document.getElementsByClassName("listview")[0].style.height = listHeight;
        //document.getElementById("pop_header").classList.remove("sticky");
    }

    render() {
        const { events } = this.props;
        //이벤트 리스트
        const eventList = events.map(event => {
            const eventProps = {...event, key : event.bannerId};
            return (<Event {...eventProps} handleGoEvent={this.handleGoEvent}/>);
        });

        return (
            <section className="pop_content">
                <div className="listview">
                    <div>
                        {eventList}
                    </div>
                </div>
            </section>
        );
    }

}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(EventAllPopup));
