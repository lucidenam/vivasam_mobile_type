import React, {Component,Fragment,PropTypes} from 'react';
import AsyncComponent from 'components/common/AsyncComponent';

class EventHandler extends Component{
    render () {
        const {eventId,handleClick} = this.props;
        let container;
        // EventId에 따른 Event Page 출력
        if({eventId}.eventId == null){
            container = null;
        }
        else{
            container = <AsyncComponent loader={() => import('containers/saemteo/event/' + {eventId}.eventId + '/Event')} eventId={eventId} tabId={this.props.tabId} handleClick={handleClick}/>;
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        )
    }
}

export default EventHandler;
