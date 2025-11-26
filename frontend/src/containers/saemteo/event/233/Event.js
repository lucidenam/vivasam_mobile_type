import React, {Component,Fragment} from 'react';
import './Event.css';

class Event extends Component{

    validate = () => {
        return true;
    };

    render () {
        return (
            <div className="evt_180827">
                <img src="/images/events/event-233.jpg"/>
            </div>
        )
    }
}

export default Event;
