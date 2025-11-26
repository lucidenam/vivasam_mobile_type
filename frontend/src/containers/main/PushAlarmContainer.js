import React, { Component } from 'react';
import { keys, every, some } from 'lodash';
import { getAppPermission, setAppPermission, getPushAlarms, setPushAlarms } from 'lib/api';
import { RenderLoading } from 'components/common';
import * as common from 'lib/common'
import {isAndroid, isIOS} from "react-device-detect";

class PushAlarmContainer extends Component {
    state = {
        all: false,
        event: false,
        dataUpdate: false,
        qnaFeedback: false,
        notice: false,
        isLoaded: false,
        isPushEnabled: true,
    }

    constructor() {
        super();
        this.handleAppActivated = this.handleAppActivated.bind(this);
    }

    handleChecked = (e) => {
        if (this.state.isPushEnabled === true || isAndroid) {
            let nextState = {};
            if(e.target.name === 'all') {
                keys(this.state).forEach(s => {
                    if(s !== 'isLoaded') nextState[s] = e.target.checked;
                });
            }else {
                const isAllOn = every([...keys(this.state).filter(p => p !== 'all' &&  p !== 'isLoaded' && p !== e.target.name).map(key => this.state[key]), e.target.checked]);
                nextState = {...this.state, [e.target.name]: e.target.checked, all: isAllOn};
            }

            //const isSomeOn = some(keys(nextState).filter(p => p !== 'all' && p !== 'isLoaded').map(key => nextState[key]));
            this.setState({...nextState}, ()=>{
                this.savePushData();
            });
        }
        else {
            e.preventDefault();
        }
    }

    resolveAppPermission = () => {
        this.setState({isLoaded: false})
        getAppPermission('checkPmsPush').then(res => {
            this.setState({isPushEnabled: res.value})
            if (res.value === false) {
                this.setState({
                    event: false,
                    dataUpdate: false,
                    qnaFeedback: false,
                    notice: false,
                    isLoaded: true
                }); 
            }
            else {
                this.fetchAlarmSettings();
            }
        }).catch(err=>{
            this.setState({
                event: false,
                dataUpdate: false,
                qnaFeedback: false,
                notice: false,
                isLoaded: true
            }); 
        });
    }    

    fetchAlarmSettings = async () => {
        const response = await getPushAlarms();
        if(response.data) {

            const event = response.data.eventYn === "Y";
            const dataUpdate = response.data.materialUpdateYn === "Y";
            const qnaFeedback = response.data.qnaAnswerYn === "Y";
            const notice = response.data.notiYn === "Y";

            this.setState({
                all: event && dataUpdate && qnaFeedback && notice,
                event,
                dataUpdate,
                qnaFeedback,
                notice
            });
        }        
        this.setState({isLoaded: true})
    }

    savePushData = async () => {
        const { event, dataUpdate, qnaFeedback, notice } = this.state;
        const eventYn = event ? "Y" : "N";
        const materialUpdateYn = dataUpdate ? "Y" : "N";
        const qnaAnswerYn = qnaFeedback ? "Y" : "N";
        const notiYn = notice ? "Y" : "N";

        const response = await setPushAlarms(eventYn, materialUpdateYn, qnaAnswerYn, notiYn);
        console.log(response.data);
    }

    handleToggle = async () => {
        setAppPermission('checkPmsPush', true).then((res) => {
            
        }).catch(function (err) {
            common.info('설정 변경에 실패하였습니다.');
            console.error(err);
            //설정변경실패(아무것도 하지 않음, 아직 상태변경전)
        });
    }

    handleAppActivated = (e) => {
        console.log('Received event in react component!!!');
        try {
            if (e.detail.event === 'app-activated') {
                this.setState({isPushEnabled: null});
                this.resolveAppPermission();
                console.log('Vivasam Mobile App was activated');
            }
            else if (e.detail.event == 'app-shaked') {
                console.log('App shaked...');
            }
        }
        catch(err) {
            console.error("failed to parse message from react-native " + err);  
            return;
        }
    }

    componentDidMount() {
        this.resolveAppPermission();
        //Native 에서 보내주는 메시지 처리
        window.document.addEventListener('appStateChanged', this.handleAppActivated, false);
    }

    componentWillUnmount() {
        window.document.removeEventListener('appStateChanged', this.handleAppActivated, false);
    }

    render() {
        const { all, event, dataUpdate, qnaFeedback, notice, isLoaded, isPushEnabled } = this.state;

        if(!isLoaded) {
            return <RenderLoading loadingType={"1"}/>;
        }

        return (
            <section id="pop_content">        
                <div className="popup_contet_case2">
                    {/*{isPushEnabled === false &&
                        <div>
                            <div className="popup_content_setting">
                                <strong>알림 사용이 중지됨</strong>
                                <p>비바샘에서 제공해 드리는 다양한 소식을 바로 받아보시려면 알림 기능을 사용해 주셔야 합니다.</p>
                                <button className="popup_content_links" onClick={this.handleToggle}>사용하기</button>
                            </div>                               
                            <div className="guideline"></div>
                        </div>
                    }*/}
                    <div className="pop_setting_wrap">
                        {/*<div className="pop_setting_list">
                            <div className="pop_setting_txt">
                                <strong className="pop_setting_tit">
                                    이벤트 알림
                                </strong>
                            </div>
                            <div className="pop_setting_btn">
                                <div className="popup_chk_btn">
                                    <input
                                        type="checkbox"
                                        id="chk_push_onoff02"

                                    className="checkbox_round"
                                        name={"event"}
                                        checked={event}
                                        onChange={this.handleChecked}
                                    />
                                    <label htmlFor="chk_push_onoff02" />
                                </div>
                            </div>
                        </div>*/}
                        <div className="pop_setting_list">
                            <div className="pop_setting_txt">
                                <strong className="pop_setting_tit">
                                    교과자료 업데이트 알림
                                </strong>
                            </div>
                            <div className="pop_setting_btn">
                                <div className="popup_chk_btn">
                                    <input
                                        type="checkbox"
                                        id="chk_push_onoff03"
                                        className="checkbox_round"
                                        name={"dataUpdate"}
                                        checked={dataUpdate}
                                        onChange={this.handleChecked}
                                    />
                                    <label htmlFor="chk_push_onoff03" />
                                </div>
                            </div>
                        </div>
                        <div className="pop_setting_list">
                            <div className="pop_setting_txt">
                                <strong className="pop_setting_tit">
                                    내 문의 답변 알림
                                </strong>
                            </div>
                            <div className="pop_setting_btn">
                                <div className="popup_chk_btn">
                                    <input
                                        type="checkbox"
                                        id="chk_push_onoff04"
                                        className="checkbox_round"
                                        name={"qnaFeedback"}
                                        checked={qnaFeedback}
                                        onChange={this.handleChecked}
                                    />
                                    <label htmlFor="chk_push_onoff04" />
                                </div>
                            </div>
                        </div>
                        <div className="pop_setting_list">
                            <div className="pop_setting_txt">
                                <strong className="pop_setting_tit">
                                    공지사항 알림
                                </strong>
                            </div>
                            <div className="pop_setting_btn">
                                <div className="popup_chk_btn">
                                    <input
                                        type="checkbox"
                                        id="chk_push_onoff05"
                                        className="checkbox_round"
                                        name={"notice"}
                                        checked={notice}
                                        onChange={this.handleChecked}
                                    />
                                    <label htmlFor="chk_push_onoff05" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default PushAlarmContainer;
