import React, {Component} from 'react';
import {PUBLIC_DOMAIN} from "../../constants";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import {isProd} from "../../lib/TargetingUtils";
class Event extends Component {

    render() {
        const { title, openTitle, imagePath, imageName, colorR, url, handleGoEvent } = this.props;
        let imageSrc = PUBLIC_DOMAIN+imagePath+imageName;
        if(!isProd()) {
            imageSrc = "https://dev2-e.vivasam.com" + imagePath+imageName;
        }
        //const eventStyle = {backgroundColor : "#"+colorR}
        const eventStyle = {};
        function gtag(){
            window.dataLayer.push(arguments);
        }
        return (
            <div className="event_item" style={eventStyle}>
                <button className="block"
                    onClick={() => {
                        gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '홍보_' + title, 'parameter_url': window.location.origin + "/#" + url});
                        if(url.indexOf("http") === 0 ) {
                            onClickCallLinkingOpenUrl(url);
                        } else {
                            handleGoEvent(url);
                        }
                    }}>
                    <img
                        src={imageSrc}
                        alt={openTitle}
                    />
                </button>
            </div>
        );
    }
}

export default Event;