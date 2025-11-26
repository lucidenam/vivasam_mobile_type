import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import moment from 'moment';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common';
import InfoText from 'components/login/InfoText';
import FindSchool from "../../../containers/login/FindSchool";
import * as api from "../../../lib/api";
import {initializeGtag} from "../../../store/modules/gtag";
import {isProd} from "../../../lib/TargetingUtils";

let tmpIntervalForCountdown; //휴대전화 인증번호 카운트다운용 변수

class JoinInfo extends Component {

	state = {
		duplicateIdCheck: false,
		duplicateEmailCheck: false,
		duplicateTelephoneCheck: false,
		randomNumber : '',
		msgText : '',
		authCode : '',
		phoneCheckMessage: '',
		phoneCheckClassName: '',
		telephoneCheck: false,
		gradeVisible: false,
		gradeSubVisible: false,
		findOnclick: false, // true : 클릭 불가 상태 , false : 클릭 가능 상태
		joinComplete:false,
		email : '',
		name : '',
		telephone : '',
		visibleTel : false,
		telInputcelphoneReadOnly : false,
		celphoneReadOnly : false,
		passwordRule: false,
		passwordMessage: '',
		passwordClassName: '',
		passwordCheckMessage: '',
		passwordCheckClassName: '',
		min: moment().subtract(74, 'years').format("YYYY-MM-DD"),
		max: moment().subtract(24, 'years').format("YYYY-MM-DD"),
		countMinutes : 3,
		countSeconds : 0,
		cellphoneReValid : true,

		// 450 이벤트 관련 속성
		checkEvent450Progress: true, /* 449, 450 이벤트 종료후 false 로 처리 하여 불필요한 체크 없도록 변경할 것 */
		progressReco: false,
		initReco: '',
		validInitReco: false,
		validReco: false,

		// 교사 인증
		file: null,
		fileName: '[+]버튼을 눌러 파일을 첨부해주세요.',
		fileUrl: null,
		comment: '',
		certification: 4, // 교사인증 방식 ( 1:공직자메일, 2:서류인증, 0:나중에하기)
		validCertifyMail: false, // 공직자 메일인증 여부
		certifiNum: '',	// 인증코드
		uuidForCertifiNum: '',	// 인증uuid
		uuidForCertifiNumCellphone: '',	// 전화번호 인증uuid
		validCertifyFile: false, // 서류인증 여부
		eMailDomain: '',
		anotherEmailDomain: '',
		certifyConfirmMessage: '',

		recommendMsg: '',
		idExist: '',
		tmpIsRealizeId:'',
	}

	constructor(props) {
		super(props);

		this.userId = React.createRef();
		this.telephone = React.createRef();
		this.email = React.createRef();
		this.password = React.createRef();
		this.Checkpassword = React.createRef();
		this.recommendId = React.createRef();
	}

	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/info',
			'page_title': '회원 정보 입력 | 회원가입｜비바샘'
		});
		let {agree, info, history, JoinActions, sso} = this.props;

		if (this.props.test) {
			agree = {
				service: true,
				privacy: true,
			};
			info = {
				userName: '홍길동',
				email: 'test@naver.com',
			}
		}

		let snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo != null) {
			snsLoginInfo.email = this.getUserEmail();
			snsLoginInfo.phoneNumber = this.getUserPhoneNumber();
			snsLoginInfo.name = this.getUserName();

			this.setState( {
				email : snsLoginInfo.email,
				name : snsLoginInfo.name,
			})

			// 이름에 영어 포함시 빈값으로 출력
			if (snsLoginInfo.name != null && snsLoginInfo.name != '') {
				if (this.checkEng(snsLoginInfo.name)) {
					this.setState({
						name : ''
					})
				}
			}

			//휴대전화정보 존재시 check값 변경
			if (snsLoginInfo.phoneNumber != null && snsLoginInfo.phoneNumber != '') {
				this.setState({
					telephoneCheck: true,
					telInputcelphoneReadOnly : true,
					celphoneReadOnly : true,
					telephone : snsLoginInfo.phoneNumber
				});
			}
			else {
				this.setState({
					visibleTel : true
				})
			}
		}

		// event449 선물 대잔치 이벤트용 임시 코드
		if (this.state.checkEvent450Progress) {
			this.setupRecoJoinInfo();
		}
	}

	countdown = async () => {
		const {countMinutes, countSeconds} = this.state;

		if (parseInt(countSeconds) > 0) {
			this.setState({
				countSeconds : parseInt(countSeconds) - 1
			});
		}
		if (parseInt(countSeconds) === 0 && parseInt(countMinutes) > 0) {
			this.setState({
				countMinutes : parseInt(countMinutes) - 1,
				countSeconds : 59
			});
		}
	}

	setupRecoJoinInfo = async () => {
		const {JoinActions} = this.props;

		// 450 이벤트가 진행중인지 체크하여 추천코드 체크 추가
		const chkEventProgressResp = await api.chkEventProgress('450');
		if (chkEventProgressResp.data.progress) {
			const recoJoinInfoStr = localStorage.getItem("recoJoinInfo");
			let recoJoinInfo;
			// 추천코드가 localStorage에 저장된 경우
			if (recoJoinInfoStr) {
				recoJoinInfo = JSON.parse(recoJoinInfoStr);
			} else {
				recoJoinInfo = {reco:'', via: ''}
			}

			// 추천코드가 있을 경우
			if (recoJoinInfo.reco) {
				// 추천인 코드 오류 제거
				if (recoJoinInfo.reco.indexOf('?test=1234') > 0) {
					recoJoinInfo.reco = recoJoinInfo.reco.replace('?test=1234', '');
				}

				const chkValidRecoResp = await api.chkValidReco(recoJoinInfo.reco);
				this.setState({
					progressReco: chkEventProgressResp.data.progress,
					initReco: recoJoinInfo.reco,
					validInitReco: chkValidRecoResp.data.valid,
					validReco: chkValidRecoResp.data.valid
				});
			} else {
				this.setState({
					progressReco: chkEventProgressResp.data.progress
				});
			}

			JoinActions.pushValues({type: "recoJoinInfo", object: recoJoinInfo});
			localStorage.removeItem("recoJoinInfo");
		}

	}

	handleFiles = (e) => {
		const {school} = this.props;
		const files = e.target.files;

		// if (school.schoolCode === "") {
		// 	common.error("소속을 먼저 입력해주세요.");
		// 	return false;
		// }

		if (school.schoolCode === 99999 || school.schoolCode === 99998 || school.schoolCode === 99997 || school.schoolCode === 99991 || school.schoolCode === 99992 || school.schoolCode === 99993) {
			common.error("소속 등록 신청이 완료되어야 서류 인증 신청이 가능합니다.");
			return false;
		}

		if (files && files.length > 0) {
			let fileLength = files.length;
			let fileName = files[0].name;
			let fileNameLen = fileName.length;
			let lastDot = fileName.lastIndexOf('.');
			let fileExt = fileName.substring(lastDot+1, fileNameLen).toLowerCase();
			let whiteList = ['jpg','png','jpeg','gif','pdf'];
			let checkExt = false;

			for(let i=0; i<whiteList.length; i++){
				if(whiteList[i].toLowerCase() === fileExt.toLowerCase()){
					checkExt = true;
					break;
				}
			}
			if(!checkExt) {
				common.error("파일 첨부는 jpg, gif, png, pdf 파일만 가능합니다.");
				return false;
			}

			if(fileLength > 3) {
				common.info("파일은 최대 3개까지만 등록됩니다.");
				return false;
			}

			if(fileLength > 1){
				fileName += ' 외 ' + (fileLength-1) + '개';
			}

			this.setState({
				file: files,
				fileName: files[0].name ? fileName : '없음',
				validCertifyFile: true,
			});

		}
	}

	setComment = (e) => {
		let comment = e.target.value;

		this.setState({
			comment: comment,
		});
	};

	setEmailDomain = (e) => {
		this.setState({
			eMailDomain: e.target.value,
			validCertifyMail: false,
		});
	};

	setAnotherEmailDomain = (e) => {
		if (e.target.name === 'emailDomain') {
			this.setState({
				anotherEmailDomain: e.target.value,
				validCertifyMail: false,
			})
		}
	};

	// 인증코드 발송
	sendCertifyMail = async () => {
		const {eMailDomain, anotherEmailDomain} = this.state;

		if(eMailDomain === "" || anotherEmailDomain === "") {
			common.error('메일 주소를 입력해 주세요.');
			return;
		}

		let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
		let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
		if (!reg_email.test(memberValidateEmail)) {
			common.error('정확한 이메일 주소를 입력해 주세요.');
			return;
		}

		const isEmailTest = !isProd();
		const response = await api.sendCertifyMail(memberValidateEmail, isEmailTest);
		let uuidForCertifiNum = '';

		if(response.data != '' && response.data.result == 0) {
			uuidForCertifiNum = response.data.uuidForCertifiNum

			//메일 테스트 코드. 개발에서는 메일발송 지원을 안하여 만든 검수용 코드입니다.
			if(isEmailTest) common.info('인증코드가 발송되었습니다. \n테스트용 인증 코드 : ' + response.data.certifiNum);
			else common.info('인증코드가 발송되었습니다.');
		} else if(response.data != '' && response.data.result == 1) {
			common.info('이미 교사인증받은 메일 주소입니다.');
			return;
		} else {
			common.error("처리 중 오류가 발생 하였습니다.");
			return;
		}

		this.setState({
			validCertifyMail: false,
			uuidForCertifiNum: uuidForCertifiNum,
		})

	}

	// 인증코드 인증하기
	checkCertifyMail = async () => {
		const {info, JoinActions} = this.props;
		const {eMailDomain, anotherEmailDomain, certifiNum, uuidForCertifiNum} = this.state;

		if(certifiNum !== '' && certifiNum.length === 6 && uuidForCertifiNum !== '') {
			//서버에서 인증번호 확인
			let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
			const response = await api.checkCertifyMail(certifiNum, uuidForCertifiNum, memberValidateEmail);
			if(response.data.code === '0') {
				this.setState({
					certifyConfirmMessage: '인증 완료',
					validCertifyMail: true,
				});
				info['memberValidateType'] = "1";
				info['memberValidateEmail'] = memberValidateEmail;
				JoinActions.pushValues({type: "info", object: info});
			} else if(response.data.code === '1') {
				common.error("인증코드를 확인해주세요.");
			} else if(response.data.code === '3') {
				common.error("인증코드가 일치하지 않습니다.\n정확한 인증 코드를 다시 확인해 주세요.\n만약 어려움이 있으시다면, ‘나중에 하기’를 선택하셔서 가입 완료 후에 교사 인증을 진행하실 수 있습니다.");
			} else {
				common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
			}
		} else {
			common.error("인증코드를 확인해주세요.");
		}
	}

	handleChange = (e) => {
		const {info, JoinActions} = this.props;
		info[e.target.name] = e.target.value;
		JoinActions.pushValues({type: "info", object: info});

		if (e.target.name === "userId") {
			this.setState({
				duplicateIdCheck: false
			});
		} else if (e.target.name === "email") {
			this.setState({
				duplicateEmailCheck: false
			});
		} else if (e.target.name === "password") {
			if (this.refs.Checkpassword.value) {
				this.setPassWordCheckMessage(this.refs.Checkpassword.value);
			}
		} else if (e.target.name === "passwordCheck") {
			this.setPassWordCheckMessage(e.target.value);
		}
	}

	handleRecommendInfo = (e) => {
		const { info, JoinActions, SaemteoActions, PopupActions } = this.props;

		info.recommendInfo = e.target.value;

		if(e.target.value === 'N'){
			info.recommendId = '';
		}
		JoinActions.pushValues({type: "info", object: info});
	}

	handleChangeRecommender = (e) => {

		const {info, JoinActions} = this.props;
		info['recommendId'] = e.target.value;

		JoinActions.pushValues({type: "info", object: info});
	}

	recommenderCheck = async (e) => {
		const {info, JoinActions } = this.props;
		const {idExist, isRealizeId} = this.state;
		let tmpIsRealizeId = false;

		const response = await api.recommendCheck(info.recommendId);

		let recommendTxt;

		console.log("response.data ----> ", response.data);
		if (response.data.code === "0") {
			let existRecommend = response.data.existRecommend;
			var existRecommendN = response.data.existRecommendN; // 추천인 대상 아이디 아님

			// 추천인 아이디가 교사인증 했을 때
			if (existRecommend){
				var stars = '*'.repeat(Math.max(0, existRecommend.length - 2));
				recommendTxt = "* 확인 결과 : " + existRecommend.charAt(0) + stars + existRecommend.charAt(existRecommend.length - 1) + ' 선생님';
				console.log(" recommendTxt ", recommendTxt);
				tmpIsRealizeId = true;

				this.setState({
					recommendMsg : recommendTxt,
					idExist : true,
					isRealizeId: tmpIsRealizeId

				})
			}
			// 추천인 아이디가 교사인증 안했을 때
			if (existRecommendN) {
				recommendTxt = "* 추천인 아이디 대상자가 아닙니다.";
				console.log(" recommendMsg ", recommendTxt);
				tmpIsRealizeId = false;

				this.setState({
					recommendMsg : recommendTxt,
					idExist : false,
					isRealizeId: tmpIsRealizeId
				})
			}

		}
		else if (response.data.code === '1') {
			recommendTxt = "* 아이디를 다시 확인하고 입력해 주세요.";
			console.log(" recommendMsg ", recommendTxt);
			tmpIsRealizeId = false;


			this.setState({
				recommendMsg : recommendTxt,
				idExist : false,
				isRealizeId: tmpIsRealizeId
			})
		}

		JoinActions.pushValues({type: "info", object: info});
	}

	setPassWordCheckMessage = (value) => {
		let clazz = 'mt5 point_red';
		let text = "입력하신 비밀번호와 일치하지 않습니다.";
		if (this.checkpassword()) {
			clazz = 'mt5 point_color_blue';
			text = "동일한 비밀번호 입니다.";
		} else if (value === "") {
			text = "";
		}
		this.setState({
			passwordCheckMessage: text,
			passwordCheckClassName: clazz
		});
	}

	//동일 암호 확인
	checkpassword = () => {
		const {info} = this.props;
		if (info.password !== info.passwordCheck) {
			return false;
		}
		return true;
	}

	handleChangeSchool = (e) => {
		const {school, JoinActions} = this.props;

		if (e.target.name === "grade") {
			let myGrades = [];

			school.grade[e.target.id].checked = e.target.checked;
			//school.myGrade setting
			for (var key in school.grade) {
				if (school.grade[key].checked) {
					myGrades.push(school.grade[key].value);
				}
			}
			school.myGrade = myGrades.toString();
		} else {
			school[e.target.name] = e.target.value;
		}

		JoinActions.pushValues({ type: "school", object: school });
	}

	emailHandleChange = (e) => {
		const email = e.target.value;
		this.setState({
			email,
			duplicateEmailCheck : false
		});
	}

	//핸드폰번호 체크
	telephoneHandleChange = (e) => {
		const telephone = common.autoHypenPhone(e.target.value);
		this.setState({
			telephone : telephone,
		});
	}

	nameHandleChange = (e) => {
		let name = e.target.value;
		const str_space = /\s/; // 공백 체크
		if(str_space.exec(name)){     // 공백 체크
			common.info("해당 항목에는 공백을 사용할 수 없습니다. 공백 제거됩니다.");
			name = name.replace(' ','');
		}
		// 영문자일경우 무시
		const regExp = /[a-zA-Z]/g;
		if(regExp.test(name)){
			this.setState({
				name : name.slice(0, -1)
			});
		}else{
			this.setState({
				name : name
			});
		}
	}

	//중복 아이디 체크
	duplicateIdClick = async (e) => {
		const {info, JoinActions} = this.props;
		var idCheck = /^[a-z0-9]{3,12}$/g;
		if (!idCheck.test(info.userId)) {
			common.error("아이디는 영소문자로 시작하는 4~12자 영문자 또는 영문자+숫자이어야 합니다.");
			this.refs.userId.focus();
			return false;
		}
		try {
			let code = await JoinActions.checkSsoUserId(info.userId);
			console.log(this.props.info.duplicateId);
			if (this.props.info.duplicateId) {
				common.error("이미 사용중인 아이디 입니다.");
				this.refs.userId.focus();
			} else {
				common.info("사용할 수 있는 아이디입니다.");
				this.setState({
					duplicateIdCheck: true
				});
			}
		} catch (e) {
			console.log(e);
		}
	}

	//중복 이메일 체크
	duplicateEmailClick = async (e) => {
		const {info, JoinActions} = this.props;
		const {email} = this.state;
		let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
		if (!reg_email.test(email)) {
			common.error("정확한 이메일 주소를 입력해 주세요.");
			this.refs.email.focus();
			return false;
		}

		this.setState({
			duplicateEmailCheck: true
		});
		return true;

		//통합회원api에서만 이메일 중복체크 진행
		// try {
		// 	let {data} = await JoinActions.checkUserEmail('', email);
		// 	if (this.props.info.duplicateEmail) {
		// 		common.error('이미 사용중인 이메일입니다.');
		// 		this.refs.email.focus();
		// 		return false;
		// 	} else {
		// 		//common.info("사용할 수 있는 이메일입니다.");
		// 		this.setState({
		// 			duplicateEmailCheck: true
		// 		});
		// 		return true;
		// 	}
		// } catch (e) {
		// 	console.log(e);
		// }
		// return false;
	}

	//핸드폰번호 체크
	phonecheck = (e) => {
		e.target.value = common.autoHypenPhone(e.target.value);
		let tel = e.target.value;
		let text = '';
		let checkFlag = false;
		let clazz = 'point_red';
		if (tel === '') {
			text = "";
		} else if (!this.checkPhoneNum(tel)) {
			text = "휴대폰 번호가 유효하지 않습니다.";
		} else {
			clazz = 'point_color_blue';
			text = "등록가능한 휴대폰 번호입니다.";
			checkFlag = true;
		}
		this.setState({
			phoneCheckClassName: clazz,
			phoneCheckMessage: text,
			telephoneCheck: checkFlag
		});
		this.handleChange(e);
	}

	checkPhoneNum = (value) => {
		if (value === '' || value.length === 0) {
			return false;
		} else if (value.indexOf("01") !== 0) {
			return false;
		} else if (value.length < 12 || value.length > 13) {
			return false;
		}
		return true;
	}

	//값 입력 확인
	validateInfo = () => {
		const {info, school, agree, check} = this.props;
		const {duplicateIdCheck, telephoneCheck, duplicateEmailCheck, file} = this.state;
		let obj = {result: false, message: '', focus: ''}

		if (check.checkCase !== "0" && !this.checkpassword()) {
			obj.message = '입력하신 비밀번호와 일치하지 않습니다.';
			obj.focus = this.refs.Checkpassword;
		} else if(!this.state.celphoneReadOnly || !this.state.telInputcelphoneReadOnly) {
			obj.message = '휴대전화번호 인증을 해주세요.';
		} else if (this.state.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
			obj.focus = this.refs.telephone;
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
			obj.focus = this.refs.telephone;
		} else if ((agree.mTypeCd === "0" || agree.mTypeCd === "1" || agree.mTypeCd === "2") && (school.schoolName === "" || school.schoolCode === "")) {
			obj.message = '소속을 입력해주세요';
			obj.focus = this.refs.schoolName;
		} else if (agree.mTypeCd === "0" && this.state.gradeSubVisible && school.myGrade === "") {
			obj.message = '담당학년은 필수 선택 항목입니다.';
			obj.focus = this.refs.grade;
		} else if (info.validYN != 'Y' && (agree.mTypeCd == 0 || agree.mTypeCd == 2) && this.state.certification === 4) {
			obj.message = (agree.mTypeCd === "0" ? '교사' : '재학') + ' 인증을 선택해주세요.';
			obj.focus = this.refs.certification;
		} else if (this.state.certification === 1 && !this.state.validCertifyMail) {
			obj.message = '공직자 메일 인증을 완료해주세요.';
			obj.focus = this.refs.certification;
		} else if (this.state.certification === 2 && !this.state.validCertifyFile) {
			obj.message = '서류 인증을 완료해주세요.';
			obj.focus = this.refs.certification;
		} else if(file && file.length > 3){
			obj.message = '파일은 최대 3개까지만 등록됩니다.';
			obj.focus = this.refs.gallrayDiv;
		} else {
			obj.result = true;
		}
		return obj;
	}

	isUserInfoCheck = () => {
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo.phoneNumber == null) {
			return true;
		}
		return false;
	}

	getUserEmail = () => {
		const {info} = this.props;
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (info.email != null) {
			return info.email;
		}
		return snsLoginInfo.email;
	}

	getUserPhoneNumber = () => {
		const {info} = this.props;
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo.phoneNumber == null) {
			if (info.telephone == null) {
				return '';
			} else {
				return info.telephone;
			}

		}
		return snsLoginInfo.phoneNumber;
	}
	getUserName = () => {
		const {info} = this.props;
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (info.userName == null) {
			if (snsLoginInfo.name == null) {
				return '';
			} else {
				return snsLoginInfo.name;
			}
		}
		return info.userName;
	}

	// 영문(영어) 체크
	checkEng = (str) =>{
		const regExp = /[a-zA-Z]/g;
		// 영어
		if(regExp.test(str)) {
			return true;
		} else {
			return false;
		}
	}

	openPopupSchool = () => {
		const { PopupActions } = this.props;
		PopupActions.openPopup({ title: "소속 검색", componet: <FindSchool handleSetSchool={this.handleSetSchool} />, wrapClassName:"auto_content" });
	}

	handleSetSchool = async (obj) => {
		let { school, PopupActions, JoinActions } = this.props;

		//학년, 내교과 hidden
		this.setState({
			gradeVisible: obj.schoolGrade != 'E' ? false : true,
			gradeSubVisible: obj.schoolGrade != 'E' && obj.schoolGrade != 'M' && obj.schoolGrade != 'H' ? false : true,
		});
		//내교화 초기화
		school.mainSubject = '';
		school.secondSubject = '';
		//담당 학년 초기화
		school.myGrade = '';
		for (var key in school.grade) {
			school.grade[key].checked = false;
		}

		await JoinActions.pushValues({ type: "school", object: { ...school, ...obj } });

		PopupActions.closePopup();
	}

	insertJoinAfterHomeSafe = (e) => {
		this.insertJoinAfterHome(e.target);
	}

	insertJoinAfterHome = async (target) => {
		if (this.state.findOnclick === false) {
			this.setState({
				findOnclick: true
			});

			const {info, school, agree, sso, check} = this.props;
			const {duplicateIdCheck, telephoneCheck, passwordRule, duplicateEmailCheck, file, visibleTel, isRealizeId} = this.state;
			target.disabled = true;

			if (info.userId === "") {
				common.error('아이디를 입력해주세요.');
				this.setState({
					findOnclick: false
				});
				target.disabled = false;
				this.refs.userId.focus();
				return false;
			}
			if ((sso.newUserId === undefined || sso.newUserId === "") && (!duplicateIdCheck || info.duplicateId)) {
				common.error('아이디 중복확인 버튼을 눌러주세요.');
				this.setState({
					findOnclick: false
				});
				target.disabled = false;
				this.refs.userId.focus();
				return false;
			}
			if(check.checkCase !== '0' && check.checkCase !== '8') {
				if (info.password === "") {
					common.error('비밀번호를 입력해주세요.');
					this.setState({
						findOnclick: false
					});
					target.disabled = false;
					this.refs.password.focus();
					return false;
				}
				if (info.passwordCheck === "") {
					common.error('비밀번호 확인을 입력해주세요.');
					this.setState({
						findOnclick: false
					});
					target.disabled = false;
					this.refs.Checkpassword.focus();
					return false;
				}
				if (!passwordRule) {
					common.error('비밀번호를 규칙을 확인해주세요.');
					this.setState({
						findOnclick: false
					});
					target.disabled = false;
					this.refs.password.focus();
					return false;
				}
			}
			if (this.state.email === "") {
				common.error('이메일을 입력해주세요.');
				this.setState({
					findOnclick: false
				});
				target.disabled = false;
				this.refs.email.focus();
				return false;
			}
			if (!duplicateEmailCheck || info.duplicateEmail) {
				await this.duplicateEmailClick();
				if(!this.state.duplicateEmailCheck) {
					this.setState({
						findOnclick: false
					});
					target.disabled = false;
					this.refs.email.focus();
					return false;
				}
			}
			if (visibleTel && !this.state.telephoneCheck) {
				common.error('휴대전화번호 인증을 해주세요.');
				this.setState({
					findOnclick: false
				});
				target.disabled = false;
				this.refs.telephone.focus();
				return false;
			}

			// 추천인 아이디 있음 체크시
			if (info.recommendInfo === 'Y') {
				if (!isRealizeId || isRealizeId === 'undefined') {
					common.error('추천인 아이디를 확인해주세요.')
					this.setState({
						findOnclick: false
					});
					target.disabled = false;

					return false;
				}
			}

			let obj = this.validateInfo();
			if (!obj.result) {
				common.error(obj.message);
				target.disabled = false;

				this.setState({
					findOnclick: false
				});

				try{
					if(obj.focus !== undefined) {
						obj.focus.focus();
					}
				}catch (e) {
					// error 메세지
				}finally {
					return false;
				}
				return false;
			}
			// 450 종료시 불필요코드
			if (this.state.checkEvent450Progress && this.state.progressReco) {
				const {BaseActions} = this.props;

				// 추천코드가 있을 때만 추천인 코드 체크
				if (this.props.recoJoinInfo.reco) {
					let response = await api.chkValidReco(this.props.recoJoinInfo.reco);
					let validReco = response.data.valid;

					if (!validReco) {
						BaseActions.closeLoading();
						this.setState({ // 가입 취소시 클릭 가능 상태 전환
							findOnclick: false,
							validReco: validReco
						});
						target.disabled = false;
						return;
					} else {
						this.setState({
							validReco: validReco
						})
					}
				}
			}

			if (window.confirm('가입하시겠습니까?')) {
				this.insertJoinForm(target);
			} else {
				// 가입 취소시 클릭 가능 상태 전환
				this.setState({findOnclick: false});
				target.disabled = false;
			}
		}
	}

	insertJoinForm = async (target) => {
		const { agree, check, info, school, sso, recoJoinInfo, history, JoinActions, BaseActions } = this.props;

		try {
			if (this.state.findOnclick === true) {
				// 더블클릭 방지
				// Api 호출이후 클릭 가능 상태로 만들어 놓아야 됨
				BaseActions.openLoading();

				let snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
				let snsObject = {
					'snsId': snsLoginInfo.id,
					'snsType': snsLoginInfo.type,
					'accessToken': snsLoginInfo.accessToken,
					'snsPhoneNumber': snsLoginInfo.phoneNumber,
					'snsYear': snsLoginInfo.year,
					'snsName': snsLoginInfo.name,
					'snsEmail': snsLoginInfo.email,
				}

				if (info.isIpin == '') {
					info.isIpin = 'IPIN_CI_SNS_' + info.userId;
				}

				info.email = this.state.email;
				info.telephone = this.state.telephone;
				info.userName = this.state.name;

				let code = await JoinActions.insertSnsJoin({...agree, ...check, ...info, ...school, ...snsObject, ...recoJoinInfo, ...sso });
				if (code.data == 1) {
					common.error("아이디를 입력해주세요.");
					this.setState({
						findOnclick: false
					});
				} else if (code.data == 2) {
					common.error("이름을 입력해주세요.");
					this.setState({
						findOnclick: false
					});
				} else if (code.data == 3) {
					common.error("비밀번호를 입력해주세요.");
					this.setState({
						findOnclick: false
					});
				} else if (code.data == 4) {
					common.error("이미 사용중인 아이디 입니다.");
					this.setState({
						findOnclick: false
					});
				} else if (code.data == 5) {
					common.error("이미 사용중인 이메일 입니다.");
					this.setState({
						findOnclick: false
					});
				} else if (code.data == 0) {

					// 서류인증 파일
					if (this.state.certification === 2 && this.state.file) {
						this.teacherCertifyUpload(info.userId);
					}

					if (window.__isApp) {
						window.webViewBridge.send('getPushToken', '', function (res) { //Browser 에서는 동작하지 않습니다. WebView 에서만.
							if (res.value) {
								api.syncAppToken(res.value, info.userId);
							}
						}, function (err) {
							//Do nothing.
						});
					}
					this.setState({
						findOnclick: false
					});
					//회원가입 성공
					//history.push('/sns/join/teacher');
					this.setState({
						joinComplete: true
					});
				} else {
					common.error("회원가입이 정상적으로 처리되지 못하였습니다.");
					this.setState({
						findOnclick: false
					});
				}
				target.disabled = false;
				return code.data;
			}
		} catch (e) {
			console.log(e);
			target.disabled = false;
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	}

	teacherCertifyUpload = async (userId) => {
		const {BaseActions} = this.props;
		const {file, comment} = this.state;
		// 파일체크
		const formData = new FormData();
		for(let i=0; i<file.length; i++){
			formData.append('uploadfile', file[i]);
			formData.append('filename', encodeURI(file[i].name));
		}
		formData.append('userId', userId);
		formData.append('content', encodeURI(comment.trim()));

		BaseActions.openLoading();
		try{
			const response = await api.teacherCertifyUpload(formData);
			//로딩이미지 고려
			if (response.data.code && response.data.code === "0") {
				return true;
			} else if (response.data.code && response.data.code === "1") {
				common.error(response.data.msg);
				return false;
			} else {
				return false;
			}
		} catch (e) {
			console.log(e);
		}
	}

	duplicateCelPhoneClick =  (e) => {
		const {telephone, cellphoneReValid} = this.state;
		var regExpPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
		if (!regExpPhone.test(telephone)) {
			common.error("올바른 휴대전화번호 형식이 아닙니다.");
			return false;
		}

		if(!cellphoneReValid) {
			alert('인증번호 재발송은 3분 후에 가능합니다.');
			return;
		}


		this.sendSms(e);
	}

	sendSms = async (e) => {
		const {telephone} = this.state;
		if (telephone == '') {
			alert('휴대전화번호를 입력해주세요.')
			return;
		}
		const response = await api.sendMsgSnsJoin(telephone);
		if (response.data.code == 'success') {
			this.setState({
				uuidForCertifiNumCellphone : response.data.uuidForCertifiNum,
				msgText : '인증번호를 발송했습니다.',
				telInputcelphoneReadOnly : true,
				cellphoneReValid : false,
				countMinutes : 3,
				countSeconds : 0,
			})
			if(!isProd()) {
				alert("인증번호 확인 :: " + response.data.msg);
			}

			tmpIntervalForCountdown = setInterval(() => {
				this.countdown();
				if(this.state.countMinutes <= 0 && this.state.countSeconds <= 0) {
					this.setState({
						cellphoneReValid : true,
					});
					clearInterval(tmpIntervalForCountdown);
				}
			}, 1000);
		}
		else if (response.data.code == 'fail') {
			alert(response.data.msg);
		}
		else {
			alert('문자전송중 오류가 발생하였습니다. 다시한번 시도해주세요.');
		}
	}

	snsSleepWakeUp = async (e) => {
		const { authCode, telephone, uuidForCertifiNumCellphone } = this.state;

		if (authCode == '') {
			alert('인증번호를 입력해 주세요.');
		}

		const response = await api.checkCertifySms(authCode, uuidForCertifiNumCellphone, telephone);

		if(response.data.code === '0') {
			alert('인증이 완료되었습니다.');
			this.setState({
				celphoneReadOnly : true,
				telephoneCheck : true,
				duplicateTelephoneCheck : true,
				authCode : '',
				countMinutes : 3,
				countSeconds : 0,
				cellphoneReValid : true,
			});
			clearInterval(tmpIntervalForCountdown);
		} else if(response.data.code === '1') {
			common.error("인증코드를 확인해주세요.");
		} else if(response.data.code === '3') {
			common.error("인증번호가 일치하지 않습니다. 인증번호를 다시 확인해 주세요.");
		} else {
			common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
		}
	}

	handleNumberChange = (e) => {
		const { value } = e.target
		const onlyNumber = value.replace(/[^0-9]/g, '')
		this.setState({
			[e.target.name]: onlyNumber
		})
	}

	handleChangeCertifiNum = (e) => {
		this.setState({
			certifiNum: e.target.value
		});
	}

	handleChangeReco = async (e) => {
		const {recoJoinInfo, JoinActions} = this.props;
		recoJoinInfo.reco = e.target.value;

		JoinActions.pushValues({type: "recoJoinInfo", object: recoJoinInfo});

		if (recoJoinInfo.reco.length >= 4) {
			let response = await api.chkValidReco(this.props.recoJoinInfo.reco);
			let validReco = response.data.valid;

			this.setState({
				validReco: validReco
			});
		} else {
			this.setState({
				validReco: false
			});
		}

	}

	handlerCertification = (e) => {
		const { certification } = this.state;

		if(e.target.value == 1){
			this.setState({
				certification: 1
			});
		}else if(e.target.value == 2){
			this.setState({
				certification: 2
			});
		}else if(e.target.value == 0){
			this.setState({
				certification: 0
			});
		}
	}

	//암호 규칙 확인
	checkpassword2 = (e) => {
		const {info} = this.props;
		let pass = e.target.value;
		let pattern1 = /[0-9]/;
		let pattern2 = /[a-zA-Z]/;
		let pattern3 = /[!@#$%^&*()?_~]/;
		let chk = 0;
		let text = '';
		let clazz = 'mt5 point_red';
		let ruleCheck = false;
		if (pass.search(/[0-9]/g) !== -1) chk++;
		if (pass.search(/[a-zA-Z]/ig) !== -1) chk++;
		if (pass.search(/[!@#$%^&*()?_~]/g) !== -1) chk++;
		if (pass === "") {
			clazz = ''
			text = "";
		} else if (pass.length < 8) {
			text = "최소 8자리 이상으로 입력해주세요.";
		} else if (chk < 2) {
			text = "비밀번호는 숫자, 영문, 특수문자를 두가지이상 혼용하여야 합니다.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
			text = "영문+숫자+특수문자인 경우 8자리 이상으로 구성하여야 합니다.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
			text = "영문+숫자인 경우 10자리 이상으로 구성하여야 합니다.";
		} else if (pass.indexOf(info.userId) > -1 && info.userId !== "") {
			text = "비밀번호는 아이디를 포함할 수 없습니다.";
		} else {
			clazz = 'mt5 point_color_blue';
			text = "사용하실 수 있는 비밀번호 입니다.";
			ruleCheck = true;
		}
		this.setState({
			passwordClassName: clazz,
			passwordMessage: text,
			passwordRule: ruleCheck
		});
		this.handleChange(e);
	}


	render() {
		const {check, info, school, agree, sso} = this.props;

		const {
			recommendMsg,
			idExist,
			phoneCheckMessage,
			phoneCheckClassName,
			gradeVisible,
			gradeSubVisible,
			certification,
			fileName,
			comment,
			email,
			telephone,
			name,
			authCode,
			celphoneReadOnly,
			visibleTel,
			telInputcelphoneReadOnly,
			passwordMessage,
			passwordCheckMessage,
			passwordClassName,
			passwordCheckClassName,
		} = this.state;

		let {msgText} = this.state;

		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">회원 정보 입력</h2>
					<div className="step_num_box">
						<span className="step_num">1</span>
						<span className="step_num">2</span>
						<span className="step_num active"><span className="blind">현재페이지</span>3</span>
					</div>
				</div>
				<section className="join renew07">
					<div className="join_use">
						<div className="join_info">
							<h2 className="info_tit">
								<label htmlFor="ipt_name">이름</label>
							</h2>
							<div className="input_wrap">
								<input
									type="text"
									id="ipt_name"
									onChange={this.nameHandleChange}
									value={name}
									className="input_sm"
									readOnly/>
							</div>
							{/*<div className="input_wrap mb25" style={{color:'red'}}>※ 실명으로 입력해 주세요.</div>*/}

							<h2 className="info_tit"><label htmlFor="ipt_id">아이디</label></h2>
							{sso.newUserId === undefined || sso.newUserId === "" ?
								<Fragment>
									<div className="input_wrap">
										<input
											type="text"
											name="userId"
											ref="userId"
											autoCapitalize="none"
											placeholder="4~12자 영문 또는 영문, 숫자 조합"
											id="ipt_id"
											onChange={this.handleChange}
											value={info.userId}
											className="input_sm"/>
										<button
											type="button"
											onClick={this.duplicateIdClick}
											className="input_in_btn btn_gray">중복확인
										</button>
									</div>
								</Fragment>
								:
								<Fragment>
									<div className="input_wrap">
										<input
											type="text"
											id="ipt_id"
											value={info.userId}
											className="input_sm"
											readOnly/>
									</div>
									<h2 className="info_tit mt25">
										<label htmlFor="ipt_pw">비밀번호</label>
									</h2>
									<div className="input_wrap mb5">
										<input
											type="password"
											placeholder="영문+숫자+특수문자 8자 이상/영문+숫자 10자 이상"
											id="ipt_pw"
											name="password"
											ref="password"
											onChange={this.checkpassword2}
											value={info.password}
											className="input_sm"/>
									</div>
									<InfoText message={passwordMessage} className={passwordClassName}/>
									<h2 className="info_tit mt25">
										<label htmlFor="ipt_pw_certify">
											비밀번호 확인
										</label>
									</h2>
									<div className="input_wrap">
										<input
											type="password"
											placeholder="비밀번호를 입력하세요"
											id="ipt_pw_certify"
											name="passwordCheck"
											onChange={this.handleChange}
											value={info.passwordCheck}
											ref="Checkpassword"
											className="input_sm"/>
									</div>
									<InfoText message={passwordCheckMessage} className={passwordCheckClassName}/>
								</Fragment>
							}
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_email">이메일</label>
							</h2>
							<div className="input_wrap mb25 has_btn">
								<input
									type="email"
									placeholder="이메일을 입력하세요."
									id="ipt_email"
									name="email"
									ref="email"
									onChange={this.emailHandleChange}
									value={email}
									className="input_sm"/>
								{/*<button type="button"
										className="input_in_btn btn_gray"
										onClick={this.duplicateEmailClick}>중복확인
								</button>*/}
							</div>

							{ visibleTel &&
							<Fragment>
								<h2 className="info_tit">
									<label htmlFor="ipt_phone">휴대전화번호</label>
								</h2>
								<div className="input_wrap mb5">
									<input
										type="tel"
										placeholder="휴대전화번호 입력하세요."
										id="ipt_phone"
										name="telephone"
										ref="telephone"
										onChange={this.telephoneHandleChange}
										value={telephone}
										maxLength="13"
										className="input_sm"
										readOnly={telInputcelphoneReadOnly}/>
									<button type="button"
											className="input_in_btn btn_gray"
											onClick={this.duplicateCelPhoneClick}>인증번호 발송
									</button>
								</div>

								<p>{msgText} </p>
								<h2 className="info_tit mt25">인증번호</h2>
								<div className="input_wrap mb5">
									<input type="text"
										   className=""
										   maxLength={6}
										   name="authCode"
										   value={authCode}
										   onChange={this.handleNumberChange}
										   readOnly={celphoneReadOnly}/>
									<button type="button"
											className="input_in_btn btn_gray"
											onClick={this.snsSleepWakeUp}>인증번호 확인
									</button>
								</div>
								{telInputcelphoneReadOnly &&
								<Fragment>
									{this.state.countMinutes}:{this.state.countSeconds < 10 ? `0${this.state.countSeconds}` : this.state.countSeconds}
								</Fragment>
								}
								<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
							</Fragment>
							}

							{agree.mTypeCd != 3 && agree.mTypeCd != 4 &&
							<Fragment>
								<h2 className="info_tit mt25"><label htmlFor="ipt_belong">소속</label></h2>
								<div className="input_wrap">
									<input
										type="text"
										placeholder="소속을 선택해 주세요"
										className="input_sm bgfff"
										value={school.schoolName}
										ref="schoolName"
										readOnly/>
									<button
										className="input_in_btn btn_gray"
										onClick={this.openPopupSchool}>소속 검색
									</button>
								</div>
							</Fragment>
							}
							{agree.mTypeCd == 0 &&
							<Fragment>
								<div style={{display: gradeSubVisible ? 'block' : 'none'}}>
									<h2 className="info_tit mt25">
										<label htmlFor="g01">담당학년</label>
									</h2>
									<div className="input_wrap">
										<ul className="join_ipt_chk">
											<li className="join_chk_list">
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g01"
													name="grade"
													ref="grade"
													checked={school.grade.g01.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g01">1학년</label>
											</li>
											<li className="join_chk_list">
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g02"
													name="grade"
													checked={school.grade.g02.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g02">2학년</label>
											</li>
											<li className="join_chk_list">
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g03"
													name="grade"
													checked={school.grade.g03.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g03">3학년</label>
											</li>
											<li className="join_chk_list"
												style={{display: gradeVisible ? 'block' : 'none'}}>
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g04"
													name="grade"
													checked={school.grade.g04.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g04">4학년</label>
											</li>
											<li className="join_chk_list"
												style={{display: gradeVisible ? 'block' : 'none'}}>
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g05"
													name="grade"
													checked={school.grade.g05.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g05">5학년</label>
											</li>
											<li className="join_chk_list"
												style={{display: gradeVisible ? 'block' : 'none'}}>
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g06"
													name="grade"
													checked={school.grade.g06.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g06">6학년</label>
											</li>
											<li className="join_chk_list"
												style={{display: gradeVisible ? 'block' : 'none'}}>
												<input
													type="checkbox"
													className="checkbox_circle"
													id="g07"
													name="grade"
													checked={school.grade.g07.checked}
													onChange={this.handleChangeSchool}
												/>
												<label htmlFor="g07">교과전담</label>
											</li>
										</ul>
									</div>
								</div>
							</Fragment>
							}


							{/*	교사 인증 및 재학인증*/}
							{info.validYN != 'Y' &&  (agree.mTypeCd == 0 || agree.mTypeCd == 2) ?
								<Fragment>
									<h2 className="info_tit mt25">
										{ agree.mTypeCd == 0 ? "교사 인증" : "재학 인증"}
									</h2>
									<div className="radio_rect join_radio_rect rect_blue">
										{agree.mTypeCd == 0 ?
											<span className="radio_rect_item">
												<input
													type="radio"
													id="tc1"
													name="teacherCertification"
													value="1"
													ref="certification"
													onChange={this.handlerCertification}
												/>
												<label htmlFor="tc1">공직자 메일 인증</label>
											</span>
											: ""
										}
										<span className="radio_rect_item">
											<input
												type="radio"
												id="tc2"
												name="teacherCertification"
												value="2"
												onChange={this.handlerCertification}
											/>
											<label htmlFor="tc2">서류 인증</label>
										</span>
										<span className="radio_rect_item">
											<input
												type="radio"
												id="tc3"
												name="teacherCertification"
												value="0"
												onChange={this.handlerCertification}
											/>
											<label htmlFor="tc3">나중에 하기</label>
										</span>
									</div>
									<p className="point_color_blue txt_certification mt10">EPKI/GPKI 인증은 PC에서 가능합니다</p>
								</Fragment>
								:
								""
							}

							{/* 공직자 메일 인증*/}
							{ certification == 1 ?
								<Fragment>

									<p className="mt20">
										공직자 메일로 발송한 인증코드를 입력 후 인증하실 수 있습니다.<br />
										인증용으로만 사용됩니다.
									</p>

									<div className="mail_area mt10">
										<div className="input_wrap multi_wrap email">
											<input
												type="text"
												name="email"
												ref="email"
												onChange={this.setEmailDomain}
												className="input_sm input_fix_wrap"
												value={this.state.eMailDomain}
												id="ipt_email"/>
											<span className="label_txt">@</span>
											<div className="selectbox select_sm">
												<select name="emailDomain" ref="emailDomain" id="ipt_email" className="" onChange={this.setAnotherEmailDomain}>
													<option value="">선택</option>
													<option value="korea.kr">korea.kr</option>
													<option value="sen.go.kr">sen.go.kr</option>
												</select>
											</div>
										</div>
										<button className='btn_full_on btn_full_gray btn_t_mid mt8 noPosition' onClick={this.sendCertifyMail}>인증코드 발송</button>
									</div>

									<div>
										<input type="number" name="certifiNum" placeholder="인증코드를 입력해주세요."
											   onChange={this.handleChangeCertifiNum} value={this.state.certifiNum} maxLength="13" className="mt15"/>
										<button className="btn_full_on btn_full_red btn_t_mid mt8 noPosition" onClick={this.checkCertifyMail}>인증하기</button>
										<InfoText message={this.state.certifyConfirmMessage} class={"point_color_blue"}/>
									</div>
								</Fragment>
								:
								""
							}

							{/* 서류 인증 */}
							{ certification == 2 ?
								<Fragment>

									<div className="fileUploadWrap mt20">
										<div className="fileWrap">
											{/* 첨부 서류 파일명 */}
											<input
												type="text"
												className="fileUpload"
												value={ fileName }
												readOnly
											/>
											{/* 첨부 버튼 */}
											<div className="btnAdd"
												 ref={(div) => this.gallrayDiv = div}
												 onClick={(e) => {
													 if (this.gallrayDiv === e.target) {
														 this.gallaryRef.click();
													 }
												 }}
											>
												<input
													multiple = "multiple"
													type="file"
													id="file_gallary"
													name="file_gallary[]"
													accept=".jpg, .gif, .png, .pdf"
													onChange={this.handleFiles}
													onClick={this.openPhoto}
													ref={input => this.gallaryRef = input}
													className="ipt_file"/>
												<label htmlFor="file_gallary">+</label>
											</div>
										</div>
										<div className="textareaWrap">
										<textarea
											id="applyContent"
											name="applyContent"
											value={comment}
											onChange={ this.setComment }
											maxLength="300"
											placeholder="서류 인증에 참고할 내용이 있다면 기입해 주세요."
										></textarea>
										</div>

										{agree.mTypeCd == 0 ?
											<Fragment>
												<p className="fileUpload_txt mt10">교사인증 서류 기준을 확인해주세요.</p>

												<ul className="mt10">
													<li>최근 6개월 이내 발급</li>
													<li>학교장 직인 서류</li>
													<li>재직기간 명시</li>
												</ul>

												<p className="info mt10">
													서류 인증에는 1~2일정도 소요될 수 있습니다.<br />
													(주말, 공휴일 제외)
												</p>
											</Fragment>
											:
											<Fragment>
												<p className="fileUpload_txt mt10">교육대학생 인증 서류 기준을 확인해 주세요.</p>

												<ul className="mt10">
													<li>당해연도 발급한 재학증명서</li>
												</ul>

												<p className="info mt10">
													서류 인증에는 1~2일정도 소요될 수 있습니다.<br />
													(주말, 공휴일 제외)
												</p>
												<p className="info mt10">
													교육대학생은 비바샘 일부 서비스 이용이 제한됩니다.
												</p>
											</Fragment>
										}
									</div>
								</Fragment>
								:
								""
							}


							{(sso.newUserId === undefined || sso.newUserId === "") ?
								<Fragment>
									<h2 className="info_tit mt25">
										<label htmlFor="ipt_email">추천인 아이디(선택)</label>
									</h2>
									<div className="input_wrap has_btn">
										<ul className="join_ipt_chk">
											<li className="join_chk_list half">
												<input
													id="recommendN"
													type="radio"
													className="checkbox_circle"
													name="recommend"
													value="N"
													// checked={info.recommendInfo == 'N'}
													checked={info.recommendInfo === 'N' || info.recommendInfo === undefined}
													onChange={this.handleRecommendInfo}
												/>
												<label htmlFor="recommendN">없음</label>
											</li>
											<li className="join_chk_list half">
												<input
													id="recommendY"
													type="radio"
													className="checkbox_circle"
													name="recommend"
													value="Y"
													checked={info.recommendInfo == 'Y'}
													onChange={this.handleRecommendInfo}
												/>
												<label htmlFor="recommendY">있음</label>
											</li>

										</ul>
									</div>

									<div className={"recommend_form"}
										 style={{display: info.recommendInfo == 'Y' ? 'block' : 'none'}}>
										<div className="input_wrap school_wrap style2 mt10">
											<input
												type="text"
												placeholder="추천인 아이디 입력"
												id="ipt_recommend"
												name="recommendId"
												value={info.recommendId}
												// onChange={this.handleChange}
												onChange={this.handleChangeRecommender}
												className="input_sm input_school"
											/>
											<button
												className="input_in_btn btn_gray"
												onClick={this.recommenderCheck}>
												아이디 확인
											</button>
										</div>
										<p className={"recommedCheck mt7 ml4 " + (idExist ? "c_b" : "c_r")}>
											{recommendMsg}
										</p>
										<p className={"c_o recommendNoti pl17"}>*추천인 아이디는 회원가입 시 1회만 등록 가능합니다.</p>
										<p className={"c_o recommendNoti pl17"}>*대소문자 및 띄어쓰기에 유의해주세요</p>
										<p className={"c_o recommendNoti pl17"}>*추천인 아이디는 교사인증 완료한 비바샘 학교 선생님 회원만 입력
											가능합니다.</p>
									</div>
								</Fragment>
								:
								""
							}

						</div>
						<button
							onClick={this.insertJoinAfterHomeSafe}
							className="btn_full_on">
							가입완료
						</button>
					</div>
				</section>
				{/* 회원가입 완료 팝업 */}
				{ this.state.joinComplete ?
					// "/components/login/JoinCompletePopup"에 있음
					<div className="join_complete_popup">
						<div className="popup_wrap">
							<div className="txt_box">
								<h4>환영합니다!</h4>
								<p>비바샘 통합회원 가입이 완료되었습니다. <br/>로그인 후 하나의 아이디로 <br/>비바샘의 다양한 서비스를 이용해 보세요.</p>
							</div>
							<Link className="btn" to="/login">로그인 하기<i></i></Link>
						</div>
					</div> : ''
				}
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		test: state.join.get('test'),
		agree: state.join.get('agree').toJS(),
		check: state.join.get('check').toJS(),
		info: state.join.get('info').toJS(),
		school: state.join.get('school').toJS(),
		recoJoinInfo: state.join.get('recoJoinInfo').toJS(),
		sso: state.join.get('sso').toJS(),
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinInfo));
