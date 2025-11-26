import React, {Component,Fragment} from 'react';
import './Event.css';

class Event extends Component{

    validate = () => {
        return true;
    };

    render () {
        return (
            <div className="evt_190308_2">
                <img src="/images/events/event-246.jpg"/>
            </div>
        )
    }
}

export default Event;
