import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import * as api from "lib/api";
import {getContentInfo} from "lib/api";
import * as viewerActions from "store/modules/viewer";
import {getContentTarget} from "../../components/common/utils";
import DownloadInfo from "../../components/common/DownloadInfo";

function CalendarTBody(props) {

	let td = "";
	let data = props.data;

	if (data.showYn === "N") {
		td = <td key={props.index}/>;
	} else if (data.dataYn === "N") {
		td = <td key={props.index}>{data.day}</td>;
	} else if ((data.day + "") === (props.day + "")) {
		td = <td key={props.index}>
			<a href="javascript:void(0)"
			   onClick={function (event) {
				   props.parentEvent(event, props.month, data.day);
				   props.event(props.year, props.month, data.day);
			   }}
			   className="event current">{data.day}</a>
		</td>
	} else {
		td = <td key={props.index}>
			<a href="javascript:void(0);"
			   onClick={function (event) {
				   props.parentEvent(event, props.month, data.day);
				   props.event(props.year, props.month, data.day);
			   }}
			   className="event">{data.day}</a>
		</td>
	}

	return (
		td
	);
}

class MonthSelectLayer extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="layerpop" id="layermonth" style={{display: this.props.display ? "" : "none"}}>
				<div className="popwrap pop_month">
					<button type="button" className="btn_close" onClick={this.props.closeEvent}/>
					<h3>월 선택</h3>
					<div className="monthchoice">
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "1")
						}}
						   className={(this.props.month) === 1 ? "on" : ""}>
							1월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "2")
						}}
						   className={(this.props.month) === 2 ? "on" : ""}>
							2월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "3")
						}}
						   className={(this.props.month) === 3 ? "on" : ""}>
							3월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "4")
						}}
						   className={(this.props.month) === 4 ? "on" : ""}>
							4월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "5")
						}}
						   className={(this.props.month) === 5 ? "on" : ""}>
							5월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "6")
						}}
						   className={(this.props.month) === 6 ? "on" : ""}>
							6월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "7")
						}}
						   className={(this.props.month) === 7 ? "on" : ""}>
							7월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "8")
						}}
						   className={(this.props.month) === 8 ? "on" : ""}>
							8월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "9")
						}}
						   className={(this.props.month) === 9 ? "on" : ""}>
							9월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "10")
						}}
						   className={(this.props.month) === 10 ? "on" : ""}>
							10월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "11")
						}}
						   className={(this.props.month) === 11 ? "on" : ""}>
							11월
						</a>
						<a href="javascript:void(0);" onClick={(e) => {
							this.props.monthSelectEvent(e, "12")
						}}
						   className={(this.props.month) === 12 ? "on" : ""}>
							12월
						</a>
					</div>
				</div>
			</div>
		)
	}
}

// 월별 계기 수업 자료
class MonthContainer extends Component {

	constructor(props) {
		super(props);
		let now = new Date();
		this.state = {
			day: this.props.day != null ? this.props.day : now.getDate(),
			month: this.props.month != null ? this.props.month : now.getMonth() + 1,
			year: now.getFullYear(),
			displayAllView: false,
			displayMonthSelectView: false,
			calendarFolded: true,
			loading: false,
			classData: [],
			allClassData: [],
			calendarData: [],
			displayDim: false,
			allViewMonth: now.getMonth() + 1,
		}

		this.moreElement = [];
	}

	getClassDataCalendar = async (year, month, day) => {

		let paramMonth = (month + "").length === 1 ? "0" + month : month

		try {
			const response = await api.getClassDataCalendar(
				year,
				paramMonth,
				(day + "").length === 1 ? "0" + day : day
			);

			let nextDay = Number.parseInt(response.data.nextDay);
			let nextMonth = response.data.nextMonth;
			let nextYear = response.data.nextYear;

			this.setState({
				calendarData: response.data.calendar,
				day: nextDay,
				month: nextMonth,
				year: nextYear
			});

			this.getClassDayData(nextMonth, nextDay).finally(() => {
			});

		} catch (e) {
			console.log(e);
		}
	}

	onClickFoldCalendarEvent = () => {
		this.setState(state => ({
			calendarFolded: !this.state.calendarFolded
		}));
	}

	onClickCalendarDayEvent = (year, month, day) => {
		this.getClassDataCalendar(year, month, day).finally(() => {
			this.setState(state => ({
				calendarFolded: true
			}));
		});
	}

	getClassDayData = async (month, day) => {

		try {
			const response = await api.getClassDayData(month, day);

			// console.log(response);

			this.setState({
				classData: response.data.classData
			});
		} catch (e) {
			console.log(e);
		}
	}

	getAllClassMonthData = async (month) => {

		try {
			const response = await api.getAllClassMonthData(month);

			this.setState({
				allViewMonth: month,
				allClassData: response.data.allClassData
			});

		} catch (e) {
			console.log(e);
		}
	}

	componentDidMount() {
		let {month, allViewMonth, day, year} = this.state;
		this.getAllClassMonthData(("" + allViewMonth).length === 1 ? "0" + allViewMonth : allViewMonth).finally();
		this.getClassDataCalendar(year, month, day).finally();
		const maxScrollLeft = document.body.scrollWidth;
		document.querySelector('.subTab_list').scrollLeft = maxScrollLeft*0.8;
	}

	componentWillUpdate = () => {

	}

	// 뷰어 핸들러
	handleViewer = async (cid) => {

		const {ViewerActions} = this.props;
		const target = getContentTarget((await getContentInfo(cid)).data);

		try {
			ViewerActions.openViewer({title: target.dataset.name, target: target});
		} catch (e) {
			console.log(e);
		}
	}

	// 다운로드 핸들러
	handleDownload = async (cid) => {

		/*const {PopupActions} = this.props;
		const target = getContentTarget((await getContentInfo(cid)).data);

		try {
			PopupActions.openPopup({
				title: '교수자료 저작권 안내',
				component: <DownloadInfo target={target}/>,
				wrapClassName: "copyright"
			});
		} catch (e) {
			console.log(e);
		}*/
	}

	onClickAllView = () => {
		this.setState(state => ({
			displayAllView: !this.state.displayAllView
		}));
	}

	onClickMonthSelectView = () => {
		this.setState(state => ({
			displayMonthSelectView: !this.state.displayMonthSelectView,
			displayDim: !this.state.displayDim
		}));
	}

	onClickMonthSelectEvent = (e, month) => {

		e.stopPropagation();

		if (this.state.displayAllView) {
			this.getAllClassMonthData(month.length === 1 ? "0" + month : month).finally();
		} else {
			this.getAllClassMonthData(month.length === 1 ? "0" + month : month).finally();
			this.getClassDataCalendar(this.state.year, month.length === 1 ? "0" + month : month, 1).finally();
		}

		this.setState({
			displayMonthSelectView: false,
			displayDim: false
		});
	}

	onClickDetailDescEvent = (e, index) => {
		e.stopPropagation();
		e.preventDefault();
		this.moreElement[index].offsetParent.className = "subtit_box viewall";
	}

	onClickCalendarEvent = (e, month, day) => {
		this.getClassDayData(month, day).finally();
	}

	render() {

		return (
			<Fragment>
				<div className="flexwrap instrumental_class">
					{/* 달력 영역 */}
					<div className="calendar">
						<div className="month_head">
							<a href="javascript:void(0)" onClick={this.onClickMonthSelectView}
							   className="select_month">
								<span>{parseInt(this.state.month)}월</span>
							</a>
							<a href="javascript:void(0)" className="btn_all_pop"
							   onClick={this.onClickAllView}><span>전체보기</span></a>
						</div>
						<div className="monthbody">
							<table className={this.state.calendarFolded ? "" : "allview"}>
								<thead>
								<tr>
									<th>일</th>
									<th>월</th>
									<th>화</th>
									<th>수</th>
									<th>목</th>
									<th>금</th>
									<th>토</th>
								</tr>
								</thead>
								<tbody>
								{
									this.state.calendarData.map((week, index) =>
										<tr className={week.weekYn ? "week" : ""} key={index}>
											{
												week.group.map((day, childIndex) =>
													<CalendarTBody key={childIndex}
													               data={day}
													               event={this.onClickCalendarDayEvent}
													               parentEvent={this.onClickCalendarEvent}
													               day={this.state.day}
													               year={this.state.year}
													               month={this.state.month}
													               index={childIndex}/>)
											}
										</tr>
									)
								}
								</tbody>
							</table>
							<button type="button" onClick={this.onClickFoldCalendarEvent}
							        className={"btn_canendar_view " + (this.state.calendarFolded ? "" : "close")}>
								<span/>
							</button>
						</div>
					</div>

					<div className="historywrap">
						<ul className="historicDay">
							{
								this.state.classData.map((desc, index) =>
									<li key={index}>
										<h4>{desc.name}</h4>
										<div className="subtit_box">
											<p>{desc.desc.substring(100)}</p>
											<a href="javascript:void(0)" ref={ref => this.moreElement[index] = ref}
											   onClick={(e) => this.onClickDetailDescEvent(e, index)}
											   className={desc.desc.length > 200 ? "txt_more" : ""}>
												{desc.desc.length > 200 ? "더보기" : ""}
											</a>
										</div>
										<div className="library_list">
											{
												desc.group.map((relation, index) =>
														<div className="library_item item_video" key={index}>
															<a href="javascript:void(0)" className="library_thumb"
															   onClick={() => this.handleViewer(relation.contentId)}>
												<span className={
													"filetype " + (relation.fileType === "FT201" ? "mp4" :
														(relation.fileType === "FT207" ? "zip" :
															(relation.fileType === "FT203" ? "movie" : "visang")))
												}/>
																<img src={relation.thumbnail} className="thumb_img" alt=""/>
															</a>
															<p className="library_title">{relation.subject}</p>
														</div>
												)
											}
										</div>
									</li>
								)
							}
						</ul>
					</div>
					<div className="pop_wrap" id="month_all_pop"
					     style={{display: this.state.displayAllView ? '' : 'none'}}>
						<div className="pop_head">
							<h1 className="header_tit">계기 수업 자료 전체 보기</h1>
							<a href="javascript:void(0);" className="pop_btnClose" onClick={this.onClickAllView}/>
						</div>
						<section className="pop_content back_w">
							<div className="flexwrap">
								<div className="month_head">
									<a href="javascript:void(0);" onClick={this.onClickMonthSelectView}
									   className="select_month">
										<span>{parseInt(this.state.allViewMonth)}월</span>
									</a>
								</div>
								<ul className="monthcontent">
									{
										this.state.allClassData.map((data, index) =>
											<li key={index}>
												<dl>
													<dt>{data.refCode}</dt>
													<dd>
														{
															data.group.map((g, index) =>
																<p key={index}>{g.name}</p>
															)
														}
													</dd>
												</dl>
											</li>
										)
									}
								</ul>
							</div>
						</section>
					</div>
					<div className="dim" style={{display: this.state.displayDim ? "" : "none"}}/>
					<MonthSelectLayer month={this.state.displayAllView ? this.state.allViewMonth : this.state.month}
					                  monthSelectEvent={this.onClickMonthSelectEvent}
					                  closeEvent={this.onClickMonthSelectView}
					                  display={this.state.displayMonthSelectView}/>
				</div>
			</Fragment>
		)
	}
}

export default connect(
	null,
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		ViewerActions: bindActionCreators(viewerActions, dispatch)
	})
)(withRouter(MonthContainer));