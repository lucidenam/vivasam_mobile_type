import React, {Component} from 'react';
import { withRouter, Link } from 'react-router-dom';
import { mainBottomBanner } from 'lib/api';
import {PUBLIC_DOMAIN} from "../../constants";
import { linkTo } from 'lib/common';

class EventBannerContainer extends Component {
    state = {
        eventBanner: null
    }

    getMainBottomBanner = async() => {
        try {
            const response = await mainBottomBanner();
            if(this._isMounted) {
                this.setState({
                    eventBanner: response.data
                });
            }
        }catch(e) {
            console.error(e);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.getMainBottomBanner();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { eventBanner } = this.state;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(!eventBanner) return false;
        return (
            <div className="article">
                <a onClick={() => {
                    gtag('event', '2025 개편', {
                        'parameter': '메인',
                        'parameter_value': eventBanner.bannerName,
                        'parameter_url': eventBanner.linkUrl
                    });
                    linkTo(this.props.history, eventBanner.linkUrl);
                }}
                    className="block">
                {/*<Link to={eventBanner.linkUrl}>*/}
                    <img
                        src={PUBLIC_DOMAIN+eventBanner.bannerFilePath+eventBanner.bannerFileSav}
                        alt={eventBanner.bannerName} />
                {/*</Link>*/}
                </a>
            </div>
        );
    }
}

export default withRouter(EventBannerContainer);