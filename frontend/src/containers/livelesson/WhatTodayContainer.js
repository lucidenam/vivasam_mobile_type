import React, { Component } from 'react';
import { Season1Done } from 'containers/today';
import { Season2 } from 'containers/today2';
import { Season3 } from 'containers/today3';
import { Maap } from 'containers/todayMaap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import { LiveLessonDownloadContainer } from 'containers/livelesson';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';

class WhatTodayContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    componentWillUnmount = () => {

    }

    render() {
        const {tooltipActive} = this.state;
        const subTabName = this.props.subTabName;
        
        let container;
        switch (subTabName) {
            case 'WhatToday':
                container = <Season1Done/>;
                break;
            case 'WhatToday2':
                container = <Season2/>;
                break;
            case 'WhatToday3':
                container = <Season3/>;
                break;
            case 'WhatTodayMaap':
                container = <Maap/>;
                break;
            default :
                container = <Season1Done/>;
        }
        return container;
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(WhatTodayContainer));