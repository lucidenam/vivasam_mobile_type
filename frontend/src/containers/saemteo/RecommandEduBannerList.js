import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as api from 'lib/api';
import SliderBanner from 'components/common/SliderBanner';

class RecommandEduBannerList extends Component {

    state = {
        bannerList: ''
    }

    componentDidMount(){
        this._isMounted = true;
        this.getBannerList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    handleClick = (e) => {
        if(!e.target.dataset.url) return;
        let url = e.target.dataset.url;
        if(e.target.dataset.type === 'NEW'){
            if(url.indexOf('http') === -1){
                url = 'http://'+ url;
            }
            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }else{
            if(url.includes('m2.vivasam.com') && url.includes('#')){
                url = url.split('#').pop();
                const { history } = this.props;
                history.push(url);
            }else{
                if(url.indexOf('http') === -1){
                    url = 'http://'+ url;
                }
                window.location.href = url;
            }
        }
    }

    getBannerList = async() => {
        const response = await api.recommandEduBannerList();
        if(response.data.code && response.data.code === "0"){
            if(this._isMounted){
                this.setState({
                    bannerList: response.data.bannerList
                });
            }
        }
    }

    render() {
        const {bannerList} = this.state;
        let container;
        let clazz = 'viva_slider';
        if (bannerList) {
            container = bannerList.map(
                (data, index) => {
                    return (
                        <SliderBanner key={index} {...data} handleClick={this.handleClick}/>
                    )
                }
            );
            if(bannerList.length === 1){
                clazz = 'viva_slider standardalone';
            }else if(bannerList.length === 2){
                clazz = 'viva_slider standard';
            }
        }else{
            return null;
        }
        return (
            <div className={clazz}>
                {container}
            </div>
        )
    }
}

export default (withRouter(RecommandEduBannerList));
