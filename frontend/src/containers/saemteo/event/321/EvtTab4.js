import React, { Component } from 'react';
import SlimEvt1 from './SlimEvt1';
import SlimEvt2 from './SlimEvt2';

class EvtTab4 extends Component {

    state = {
        onIdx: 0
    }

    onNextStep = () => {
        this.setState({
            onIdx: 1
        })
    }

    render() {
        const { onTabClick, eventApply } = this.props;
        const obj = {
            0: <SlimEvt1 onTabClick={onTabClick} onNextStep={this.onNextStep}/>,
            1: <SlimEvt2 eventApply={eventApply}/>,
        };
        return (
            <div className="evtTab4">
                {/* SlimEvt1에서 입력값 1/7/6 맞는 경우 SlimEvt2로 전환 */}
                {obj[this.state.onIdx]}
            </div>
        );
    }
}

export default EvtTab4;