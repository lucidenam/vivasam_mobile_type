import React, { Component,Fragment } from 'react';
import MyInfoEditContainer from 'containers/login/MyInfoEditContainer';
import MyInfoModifyContainer from 'containers/login/MyInfoModifyContainer';
import MyInfoPasswordContainer from 'containers/login/MyInfoPasswordContainer';

class MyInfoContainer extends Component {

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextProps.tabName !== this.props.tabName);
    }

    render() {
        const {tabName} = this.props;
        let container;
        if(tabName && tabName === 'password'){
            container = <MyInfoPasswordContainer/>
        } else if(tabName && tabName === 'modify'){
            container = <MyInfoModifyContainer/>
        }else{
            container = <MyInfoEditContainer/>
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        );
    }
}

export default MyInfoContainer;
