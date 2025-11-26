import React, { Component,Fragment } from 'react';
import { EventSlide } from 'components/main'
import * as api from 'lib/api';
import ContentLoader from "react-content-loader"

class EventSlideContainer extends Component {
    state = {
        events : [],
        loading : true
    };

    getMainBannerList = async () => {
        try {
            const response = await api.mainBannerList();
            if(this._isMounted) {
                this.setState({
                    events: response.data,
                    loading: false
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.getMainBannerList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const SliderLoding = props => (
            <ContentLoader
                rtl
                height={750}
                width={750}
                speed={2}
                primaryColor="#f3f3f3"
                secondaryColor="#ecebeb"
                {...props}
                >
                <rect x="0" y="0" rx="5" ry="5" width="750" height="760" />
            </ContentLoader>
        )
        const {loading} = this.state;
        return (
            <Fragment>
                {loading ? <SliderLoding/> : <EventSlide events={this.state.events}/>}
            </Fragment>
        );
    }
}

export default EventSlideContainer;
