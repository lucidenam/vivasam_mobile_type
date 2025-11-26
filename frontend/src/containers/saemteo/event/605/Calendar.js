import React, {Component} from 'react';

import './Event.css';

class Calendar extends Component {

	render() {

		return (
			<section className="vivasamter event605">
				<h2 className="blind">
					미리보기
				</h2>
				<div className="evtItemWRap">
					<img src="/images/events/2025/event251118/calendar1.jpg" alt="2026 달력" />
					<img src="/images/events/2025/event251118/calendar2.jpg" alt="2026 달력" />
					<img src="/images/events/2025/event251118/calendar3.jpg" alt="2026 달력" />
					<img src="/images/events/2025/event251118/calendar4.jpg" alt="2026 달력" />
					<img src="/images/events/2025/event251118/calendar5.jpg" alt="2026 달력" />
					<img src="/images/events/2025/event251118/calendar6.jpg" alt="2026 달력" />
				</div>
			</section>

		);
	}
}

export default Calendar;