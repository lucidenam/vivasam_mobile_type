import React, {Component, Fragment} from 'react';
import {MyClassSetup, MyTextBookSetup} from 'containers/educourse';
class MyClassSetupContainer extends Component {
    state = {
        tabName: 'class'
    };

    handleTabClick = (tabName) => {
        this.setState({
            tabName
        });
    }

    componentDidMount() {
        const { tab } = this.props;
        this.setState({
            tabName: tab
        });
    }

    render() {
        const { tabName } = this.state;
        return (
            <Fragment>
                <div className="tab_wrap">
                    <ul className="tab tab-col2">
                        <li className={'tab_item ta_r ' + (tabName==='class' ? 'active' : '')}>
                            <a
                                onClick={() => {this.handleTabClick('class')}}
                                className="tab_link">
                                <span>내 교과 설정</span>
                                {tabName==='class' ? <span className="blind">현재페이지</span> : ''}
                            </a>
                        </li>
                        <li className={'tab_item ta_l ' + (tabName==='textbook' ? 'active' : '')}>
                            <a
                                onClick={() => {this.handleTabClick('textbook')}}
                                className="tab_link">
                                <span>내 교과서 설정</span>
                                {tabName==='textbook' ? <span className="blind">현재페이지</span> : ''}
                            </a>
                        </li>
                    </ul>
                </div>
                {tabName==='class' ? <MyClassSetup/> : <MyTextBookSetup/>}
            </Fragment>
        );
    }
}

export default MyClassSetupContainer;
