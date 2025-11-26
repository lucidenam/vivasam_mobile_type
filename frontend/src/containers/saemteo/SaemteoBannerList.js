import React, { Component,Fragment } from 'react';
import { PUBLIC_DOMAIN } from 'constants/index';
import SaemteoBanner from 'components/saemteo/SaemteoBanner';

class SaemteoBannerList extends Component {
    state = {
        bannerList: ''
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.bannerList!==prevState.bannerList){
            return {
                bannerList : nextProps.bannerList
            };
        } else {
            return null;
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        const {bannerList} = this.state;
        const {handleEventClick} = this.props;
        const {handleProgramClick} = this.props;
        const {handleSeminarClick} = this.props;
        let container;
        if (bannerList) {
            container = bannerList.map(
                (data, index) => {
                    let agrs = {};
                    agrs.key=index;
                    agrs.type=data.type;
                    agrs.typeName=data.typeName;

                    if(data.type === 'event'){
                        agrs.handleClick=handleEventClick;
                        agrs.name = data.name;
                        agrs.id = data.id;
                        agrs.endDate = data.endDate;
                        agrs.startDate = data.startDate;
                        let domain = PUBLIC_DOMAIN;
                        if( data.src.indexOf('http') > -1 ) domain = '';
                        agrs.src = domain+data.src;
                    }else{
                        if(data.type === 'program'){
                            agrs.handleClick=handleProgramClick;
                        }else{
                            agrs.handleClick=handleSeminarClick;
                        }

                        let title = data.name;
                        if(title.indexOf("#") > -1) title = title.replace(/#/gi, "");
                        if(title.indexOf("<br>") > -1 || (title.indexOf("<br/>") > -1) || title.indexOf("<br />") > -1 )
                            title = title.replace(/(<br>|<br\/>|<br \/>)/gi, " ");
                        // <br> 외에도 <br/> Or <br /> 제목또한 안뜨도록 설정 - 20190625
                        agrs.name = title;
                        agrs.id = data.id;
                        agrs.startDate = data.startDate;
                        agrs.endDate = data.endDate;
                        agrs.src = data.src;
                    }
                    return (
                        <SaemteoBanner {...agrs} />
                    )
                }
            );
        }else{
            return null;
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        )
    }
}

export default SaemteoBannerList;
