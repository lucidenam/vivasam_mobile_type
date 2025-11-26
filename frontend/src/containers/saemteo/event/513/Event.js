import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import {FooterCopyright} from "../../../../components/page";


class Event extends Component {

	state = {
		isEventApply: false,    // 신청여부
		imgId:'',
		isShowDetail:false,
		popupClass:'',
		eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/513',
		choosedItems: {
			video: '',
			image: '',
			music: ''
		},
		popularCnt:[],
		isPlayings:[false, false, false, false, false, false],
		playingClass:['', '', '', '', '', ''],
		isPlaying: false,
		audio: null,
		currentAudioUrl: null,
	};

	handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        SaemteoActions.pushValues({type: "event", object: event});
    };

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.getPopularCnt(); // 인기투표수 가져오기

		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	};

	// 인기투표수
	getPopularCnt = async () => {
		const {eventId} = this.props;
		const params = {
			eventId: eventId,
			eventAnswerSeq: 2,
		};

		let response2 = await api.getPopularCnt(params);
		this.setState({
			popularCnt: response2.data.popularCnt
		});
	};

	eventApplyCheck = async () => {
		const {logged, eventId, event} = this.props;
		if (logged) {
			const response = await api.chkEventJoin({eventId});
			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}
		}
	}

	prerequisite = (e) => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {isEventApply} = this.state;

		if (!logged) {
			// 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return;
		}

		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 신청하셨습니다.");
			return;
		}

		return true;
	};

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {event} = this.props;
		const {isEventApply, choosedItems} = this.state;

		if (!this.prerequisite(e)) {
			return false;
		}

		const {video, image, music} = choosedItems;
		if (!video || !image || !music) {
			common.info("모든 부문에 투표해 주세요.");
			return false;
		}

		if(!event.agree){
			common.info("필수 동의 선택 후 이벤트 신청을 완료해 주세요.");
			return false ;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		try {
			// 신청 처리
			await this.insertApplyForm();
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	};

	insertApplyForm = async () => {
		const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

		try {
			BaseActions.openLoading();

			const eventAnswerDesc2 = this.state.choosedItems.video + "^||^" + this.state.choosedItems.image  + "^||^" + this.state.choosedItems.music;

			var params = {
				eventId: eventId,
				eventAnswerDesc: "",
				// eventAnswerDesc2: this.state.choosedItems,
				eventAnswerDesc2: eventAnswerDesc2,
				cellphone: "",
				userInfo: "",
				schCode: "",
			};

			let response = await SaemteoActions.insertEventApply(params);

			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				if (event.schCode && event.schCode !== this.state.initialSchCode) {
					MyclassActions.myClassInfo();
				}
				common.info("투표에 참여해 주셔서 감사합니다.");
				window.location.reload();
				// history.push('/saemteo/event/view/' + eventId);

			} else if (response.data.code === '5') {
				common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
			} else if (response.data.code === '6') {
				common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			} else {
				common.error("신청이 정상적으로 처리되지 못하였습니다.");
			}

		} catch (e) {
			console.log(e);
			common.info(e.message);
			history.push('/saemteo/event/view/' + eventId);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	}

	detailPop = (type, item, claz) => {
		const {isShowDetail, imgId, isPlayings} = this.state;

		if (type == "video") {
			const videoUrl = item;
			this.handlePreviewClick(videoUrl);
		}

		if(type == "img"){
			this.setState({
				isShowDetail:true,
				imgId:item,
				popupClass: claz == '' ? '' : claz
			});
		}
	};

	// 비디오
	handlePreviewClick = async (videoUrl) => {
		const {history,eventId,SaemteoActions} = this.props;
		const pathUrl = '/saemteo/event/preview/'+ eventId +'/EventDetail';
		let test = {url : videoUrl};
		SaemteoActions.pushValues({type:"eventAnswer", object:test});
		history.push(pathUrl);
	}

	// 음원
	audioControls = (tar, idx) => {
		const { isPlayings } = this.state

		if(isPlayings[idx - 1]){
			tar.pause();
			this.updateElement(idx);
		}else{
			tar.play();
			this.updateElement(idx);

		}
	}
	updateElement = (idx) => {
		this.setState((prevState) => {
			const newPlaying = [...prevState.isPlayings];
			const newPlayingClass = [...prevState.playingClass];

			newPlaying[idx - 1] = newPlaying[idx - 1] == true ? false : true;
			newPlayingClass[idx - 1] = newPlayingClass[idx - 1] == '' ? 'playing' : '';

			return {isPlayings: newPlaying, playingClass: newPlayingClass};
		});
	}

	choosedItems = (e) => {
		if (!this.prerequisite(e)) {
			e.target.checked = false;
			return false;
		}

		const {name, value} = e.target;

		this.setState(prevState => ({
			choosedItems: {
	                ...prevState.choosedItems,
	                [name]: value,
	            }
	        }), () => {
	            console.log("choosedItems items:", this.state.choosedItems);
	        });
	};

	detailPopHide = () => {
		const {isShowDetail} = this.state;
		this.setState({
			isShowDetail:false,
		});
	}

	copyToClipboard = (e) => {
		// 글을 쓸 수 있는 란을 만든다.
		let aux = document.createElement("input");
		// 지정된 요소의 값을 할당 한다.
		aux.setAttribute("value", this.state.eventUrl);
		// bdy에 추가한다.
		document.body.appendChild(aux);
		// 지정된 내용을 강조한다.
		aux.select();
		// 텍스트를 카피 하는 변수를 생성
		document.execCommand("copy");
		// body 로 부터 다시 반환 한다.
		document.body.removeChild(aux);
		common.info('링크가 복사되었습니다.');
	};

	render () {
		const {imgId, isShowDetail, popupClass, playingClass, popularCnt} = this.state;
		return (
			<section className="event240809">
				<div className="evtTitWrap">
					<button className="btnShare" onClick={this.copyToClipboard}><span className="blind">이벤트 공유하기</span></button>
					<div className="evtTit">
						<h1><img src="/images/events/2024/event240809/img1.png" alt="AI 인기투표"/></h1>
						<div className="blind">

						</div>
					</div>
				</div>

				<div className="evtCont evtCont01">
					<h1 className="evtLabel"><img src="/images/events/2024/event240809/evtLabel1.png" alt="영상"/></h1>
					<div className="evtItemWrap">
						<ul>
							<li>
								<div className="thumb vdo" onClick={()=>{this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/1.푸른꿈 비바샘_정도행.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb01.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보1</p>
									<p className="txt">푸른꿈 비바샘</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[0].totalCnt >= 999 ? '999+' : popularCnt[0].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video01" value="영상 후보1" onClick={this.choosedItems}/>
									<label htmlFor="video01"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb vdo" onClick={()=>{this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/2.비바샘 Song MV_정복영.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb02.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보2</p>
									<p className="txt">비바샘 Song MV</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[1].totalCnt >= 999 ? '999+' : popularCnt[1].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video02" value="영상 후보2" onClick={this.choosedItems}/>
									<label htmlFor="video02"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb vdo" onClick={() => {this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/3.셜록홈즈, 최고의 수업플랫폼을 향한 여정_김시온.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb03.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보3</p>
									<p className="txt">셜록 홈즈, 최고의 수업 플랫폼을 향한 여정</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[2].totalCnt >= 999 ? '999+' : popularCnt[2].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video03" value="영상 후보3" onClick={this.choosedItems}/>
									<label htmlFor="video03"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb vdo" onClick={() => {this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/4.선생님의 특별한 친구 비바샘_황민영.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb04.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보4</p>
									<p className="txt">선생님의 특별한 친구, 비바샘</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[3].totalCnt >= 999 ? '999+' : popularCnt[3].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video04" value="영상 후보4" onClick={this.choosedItems}/>
									<label htmlFor="video04"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb vdo" onClick={() => {this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/5.OX 퀴즈를 풀어보자!_김수민.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb05.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보5</p>
									<p className="txt">OX 퀴즈를 풀어보자!</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[4].totalCnt >= 999 ? '999+' : popularCnt[4].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video05" value="영상 후보5" onClick={this.choosedItems}/>
									<label htmlFor="video05"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb vdo" onClick={() => {this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/6.비바샘과 함께 하는 스마트 학습_이화영.mp4')}}>
									<img src="/images/events/2024/event240809/vdo_thumb06.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보6</p>
									<p className="txt">비바샘과 함께 하는 스마트 학습</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[5].totalCnt >= 999 ? '999+' : popularCnt[5].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="video" id="video06" value="영상 후보6" onClick={this.choosedItems}/>
									<label htmlFor="video06"><span className="blind">좋아요</span></label>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div className="evtCont evtCont02">
					<h1 className="evtLabel"><img src="/images/events/2024/event240809/evtLabel2.png" alt="이미지"/></h1>
					<div className="evtItemWrap">
						<ul>
							<li>
								<div className="thumb img" onClick={()=>{this.detailPop("img", 'img01.jpg', '')}}>
									<img src="/images/events/2024/event240809/thumb01.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보1</p>
									<p className="txt">내 수업은 내 색깔대로</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[6].totalCnt >= 999 ? '999+' : popularCnt[6].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image01" value="이미지 후보1" onClick={this.choosedItems}/>
									<label htmlFor="image01"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb img" onClick={()=>{this.detailPop("img", 'img02.jpg', '')}}>
									<img src="/images/events/2024/event240809/thumb02.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보2</p>
									<p className="txt">우리 곁의 자료실</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[7].totalCnt >= 999 ? '999+' : popularCnt[7].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image02" value="이미지 후보2" onClick={this.choosedItems}/>
									<label htmlFor="image02"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb img" onClick={() => {this.detailPop("img", 'img03.jpg', 'pdSide')}}>
									<img src="/images/events/2024/event240809/thumb03.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보3</p>
									<p className="txt">바로 되는 수업 준비</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[8].totalCnt >= 999 ? '999+' : popularCnt[8].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image03" value="이미지 후보3" onClick={this.choosedItems}/>
									<label htmlFor="image03"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb img" onClick={() => {this.detailPop("img", 'img04.png', '')}}>
									<img src="/images/events/2024/event240809/thumb04.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보4</p>
									<p className="txt">비바샘을 찾습니다.</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[9].totalCnt >= 999 ? '999+' : popularCnt[9].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image04" value="이미지 후보4" onClick={this.choosedItems}/>
									<label htmlFor="image4"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb img" onClick={() => {this.detailPop("img", 'img05.png', '')}}>
									<img src="/images/events/2024/event240809/thumb05.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보5</p>
									<p className="txt">나의 든든한 동료샘~ 비바샘!</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[10].totalCnt >= 999 ? '999+' : popularCnt[10].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image05" value="이미지 후보5" onClick={this.choosedItems}/>
									<label htmlFor="image05"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className="thumb img" onClick={() => {this.detailPop("img", 'img06.png', '')}}>
									<img src="/images/events/2024/event240809/thumb06.png" alt="썸네일"/>
								</div>
								<div className="info">
									<p className="badge">후보6</p>
									<p className="txt">에듀테크 시대의 초등 비바샘</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[11].totalCnt >= 999 ? '999+' : popularCnt[11].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="image" id="image06" value="이미지 후보6" onClick={this.choosedItems}/>
									<label htmlFor="image06"><span className="blind">좋아요</span></label>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div className="evtCont evtCont03">
					<h1 className="evtLabel"><img src="/images/events/2024/event240809/evtLabel3.png" alt="음원"/></h1>
					<div className="evtItemWrap">
						<ul>
							<li>
								<div className={"thumb mp3 " + playingClass[0]} onClick={()=>{this.audioControls(this.itemRef1, 1)}}>
									<img src="/images/events/2024/event240809/mp3Thumb01.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/1.비바샘이 간다_강지우.mp3"
											ref={(ref) => this.itemRef1 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보1</p>
									<p className="txt">비바샘이 간다</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[12].totalCnt >= 999 ? '999+' : popularCnt[12].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music01" value="음원 후보1" onClick={this.choosedItems}/>
									<label htmlFor="music01"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className={"thumb mp3 " + playingClass[1]} onClick={()=>{this.audioControls(this.itemRef2, 2)}}>
									<img src="/images/events/2024/event240809/mp3Thumb02.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/2.마르지 않는 샘_손성준.mp3"
											ref={(ref) => this.itemRef2 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보2</p>
									<p className="txt">마르지 않는 샘</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[13].totalCnt >= 999 ? '999+' : popularCnt[13].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music02" value="음원 후보2" onClick={this.choosedItems}/>
									<label htmlFor="music02"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className={"thumb mp3 " + playingClass[2]} onClick={() => {this.audioControls(this.itemRef3, 3)}}>
									<img src="/images/events/2024/event240809/mp3Thumb03.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/3.VIVA! 선생님 걱정마세요!_김효정.mp3"
											ref={(ref) => this.itemRef3 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보3</p>
									<p className="txt">VIVA! 선생님 걱정 마세요!</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[14].totalCnt >= 999 ? '999+' : popularCnt[14].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music03" value="음원 후보3" onClick={this.choosedItems}/>
									<label htmlFor="music03"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className={"thumb mp3 " + playingClass[3]} onClick={() => {this.audioControls(this.itemRef4, 4)}}>
									<img src="/images/events/2024/event240809/mp3Thumb04.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/4.비바샘이 궁금해, 들어봐_박해준.mp3"
											ref={(ref) => this.itemRef4 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보4</p>
									<p className="txt">비바샘이 궁금해, 들어봐</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[15].totalCnt >= 999 ? '999+' : popularCnt[15].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music04" value="음원 후보4" onClick={this.choosedItems}/>
									<label htmlFor="music04"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className={"thumb mp3 " + playingClass[4]} onClick={() => {this.audioControls(this.itemRef5, 5)}}>
									<img src="/images/events/2024/event240809/mp3Thumb05.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/5.Happy쌤, Viva쌤_문상필.mp3"
											ref={(ref) => this.itemRef5 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보5</p>
									<p className="txt">Happy쌤, Viva쌤</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[16].totalCnt >= 999 ? '999+' : popularCnt[16].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music05" value="음원 후보5" onClick={this.choosedItems}/>
									<label htmlFor="music05"><span className="blind">좋아요</span></label>
								</div>
							</li>
							<li>
								<div className={"thumb mp3 " + playingClass[5]} onClick={() => {this.audioControls(this.itemRef6, 6)}}>
									<img src="/images/events/2024/event240809/mp3Thumb06.png" alt="썸네일"/>
									<audio
											className="react-player"
											src="https://dn.vivasam.com/vs/event/movie/contents/6.VIVA beat!_김나경.mp3"
											ref={(ref) => this.itemRef6 = ref}
									/>
								</div>
								<div className="info">
									<p className="badge">후보6</p>
									<p className="txt">VIVA beat!</p>
									<p className="like">{popularCnt.length > 0 ? (popularCnt[17].totalCnt >= 999 ? '999+' : popularCnt[17].totalCnt) : 0}</p>
								</div>
								<div className="rdo">
									<input type="radio" name="music" id="music06" value="음원 후보6" onClick={this.choosedItems}/>
									<label htmlFor="music06"><span className="blind">좋아요</span></label>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div className="evtCont04">
					<h1><img src={"/images/events/2024/event240809/img2.png"} alt="개인정보 수집 및 이용동의"/></h1>
					<div className="blind">
						<strong>※ 개인정보 수집 및 이용동의</strong>
						<ul>
							<li><p>- 이용목적:</p> <span>인기투표 이벤트 참여 확인 및 CS 문의 응대</span></li>
							<li><p>- 수집하는 개인정보:</p> <span>성명, 비바샘 ID</span></li>
							<li><p>- 개인정보 보유 및 이용기간:</p> <span>2024년 9월 15일까지 <br/>(이용목적 달성 시 즉시 파기)</span></li>
						</ul>
						<p>
							선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다.<br/>
							단, 동의를 거부할 경우 인기투표 참여가 불가합니다.
						</p>
					</div>

					<div className="agree_form">
						<input
								type="checkbox"
								name="agree"
								onChange={this.handleChange}
								// checked={agree}
								id="join_agree"/>
						<label htmlFor="join_agree">
								본인은 개인정보 수집 및 이용 내역을 확인하였으며, <br/>이에 동의합니다.
						</label>
					</div>

					<button type="button" className="btnApply" onClick={this.eventApply}>
						<img src={"/images/events/2024/event240809/btn_apply.png"} alt="투표 완료"/>
					</button>
				</div>

				<div className={"evtDetailPop " + popupClass} style={{display: isShowDetail ? '' : 'none'}}>
					<div className="evtPopWrap">
						<button type="button" className="btn_evt_pop_close" onClick={this.detailPopHide}><span><em className="blind">닫기</em></span></button>
						<img src={"/images/events/2024/event240809/"+ imgId} alt="이미지"/>
					</div>
				</div>

				<div className="evtFooter">
					<h1><img src={"/images/events/2024/event240809/img3.png"} alt="유의사항"/></h1>
					<div className="blind">
						<strong>유의사항</strong>
						<ul className="info">
							<li><span>1</span>부문당 1인 1회 투표 가능합니다.</li>
							<li><span>2</span>영상 / 이미지 / 음원 당 응모작 1개씩만 선택 가능합니다.</li>
							<li><span>3</span>비바샘에 가입한 회원만 투표하실 수 있습니다.</li>
							<li><span>4</span>투표가 완료되면, 취소, 수정, 재참여는 불가능합니다.</li>
						</ul>
					</div>
				</div>
				<FooterCopyright handleLogin={this.handleLogin}/>
			</section>
		)
	}
}


export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS(),
		event: state.saemteo.get('event').toJS(),
		answerPage: state.saemteo.get('answerPage').toJS(),
		eventAnswer: state.saemteo.get('eventAnswer').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(saemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(Event));