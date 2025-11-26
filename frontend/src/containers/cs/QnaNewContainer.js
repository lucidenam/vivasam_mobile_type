import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as api from 'lib/api';
import * as common from 'lib/common';
import {QnaCodeSelect} from 'components/cs';
import connect from "react-redux/es/connect/connect";
import $ from 'jquery';
import {FileService} from '../../components/cs/FileService.jsx';
import {isFileUploadWhiteList} from "../../lib/FileUtils";
import {bindActionCreators} from "redux";
import * as baseActions from 'store/modules/base';
import queryString from 'query-string';
import '../../css/common.css';
import {initializeGtag} from "../../store/modules/gtag";
import {isAndroid, isIOS} from "react-device-detect";
import {Cookies} from "react-cookie";
import moment from "moment";

const cookies = new Cookies();

const QNA_EXCE_CODE = {
    EXCE_CODE_ID: ['QA001', 'QA003', 'QA014', 'QA015', 'QA016', 'QA018', 'QA022', 'QA025']
};

class QnaNewContainer extends Component {

    constructor(props) {
        super(props);
        this.fileService = new FileService();
        this.state = {
          newQnA : {
            qnaSchLvlCd : this.props.myClassInfo.schoolLvlCd,
            qnaSubjectCd : '',
            qnaCd : '',
            qnaCdDtl : '',
          },
          qnaVsCdList : [],
          qnaVsCdDtlList : [],
          qnaSelectState : true,
          qnaSchLvlCdState : false,
          qnaSubjectCdState : false,
          fileName : '선택된 파일 없음',
          privacy: false,
          showYn: '',
      }
    }
    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/cs/qna/new',
            'page_title': '문의하기｜비바샘'
        });
        this._isMounted = true;
        const { myClassInfo , location } = this.props;

        if(this._isMounted){
            this.setState({
                newQnA : {
                  ...this.state.newQnA,
                  qnaSubjectCd: myClassInfo.mainSubject,
                  qnaCall: myClassInfo.qnaCall ? myClassInfo.qnaCall : 'N',
                  qnaCallTime: myClassInfo.qnaCallTime ? myClassInfo.qnaCallTime : ''
                }
            });
        }
        this.exceCode = QNA_EXCE_CODE.EXCE_CODE_ID;
        this.getQnaVsCdList();
        this.getQnaVsCdDtlList();

        let query = queryString.parse(location.search);
        if(query.qnaCd  != null) {
            this.setState({
                newQnA: {
                    ...this.state.newQnA,
                    qnaVsCd: query.qnaCd,
                    qnaCd: query.qnaCd,
                }
            });
        }
    }

    //분류 상단 조회
    getQnaVsCdList = async (e) => {
      const response = await api.vscodeList("QA000");
      this.setState({
        qnaVsCdList : response.data
      });
    }

    //분류 하단 조회
    getQnaVsCdDtlList = async (e) =>{
      const response = await api.vscodeList("AS000");
      this.setState({
        qnaVsCdDtlList : response.data
      });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
      const {BaseActions, loginInfo} = this.props;
      let exceCode = this.exceCode;
      let breakExce = false;
      let selVal = e.target.value;
      if (this._isMounted) {
        //상단 분류 중 특정 분류 선택 시 교과 항목 비활성화
        if (e.target.name == 'qnaCd') {
          // 회원가입인증이거나 , 개인정보 변경인 경우 교사미인증은 문의할 수없다.
          if (selVal != '' && selVal != 'QA001' && selVal != 'QA003' && selVal != 'QA011') {
            if (loginInfo.certifyCheck === 'N') {
              if (window.confirm("교사 인증 후 이용 가능합니다.\n지금 인증을 진행하시겠습니까?")) {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                window.location.hash = "/login/require";
                window.viewerClose();
                document.activeElement.blur();
              } else {
                // 선택값 초기화
                selVal = '';
                $('select[name=qnaCd] option:eq(0)').prop('selected', true);
              }
            }
          }
          exceCode.forEach((item) => {
            if (item == selVal) {
              this.setState({
                qnaSchLvlCdState: true,
                qnaSubjectCdState: true,
                newQnA: {
                  ...this.state.newQnA,
                  qnaSchLvlCd: '',
                  qnaSubjectCd: '',
                  [e.target.name]: selVal,
                  qnaCdDtl: ''
                }
              })
              breakExce = true;
            }
          });
          console.log("exceCode : " + exceCode + " / selVal : " + selVal + " / breakExce : " + breakExce);
          if (!breakExce) {
            this.setState({
              qnaSchLvlCdState: false,
              qnaSubjectCdState: false,
            });
          }
        }
        //분류가 교과 선택불가능 항목의 경우 함수 종료
        if (breakExce) return;
        //분류 자료 요청 선택 시
        if (e.target.name == 'qnaCd' && selVal != 'QA019') {
          this.setState({
            newQnA: {
              ...this.state.newQnA,
              [e.target.name]: selVal,
              qnaCdDtl: ''
            }
          });
        }
        //교과 학교급을 기본값 선택 시 교과 과목을 초기화 시켜줘야함.
        else if (e.target.name == 'qnaSchLvlCd' && selVal == '') {
          this.setState({
            newQnA: {
              ...this.state.newQnA,
              qnaSubjectCd: '',
              [e.target.name]: selVal
            }
          });
        } else if (e.target.name == 'showYn') {
          this.setState({
            showYn: e.target.value
          });
        } else {
          this.setState({
            newQnA: {
              ...this.state.newQnA,
              [e.target.name]: selVal,
            }
          });
        }
      }
    }

    readySubmit() {
      const{showYn} = this.state;
      const qna = this.state.newQnA;
      const exceCode = this.exceCode;
      let breakExce = false;
      if (!qna.qnaCd || qna.qnaCd == '' ) {
        common.error("분류를 입력해주세요.");
        return false;
      }
      if ((!qna.qnaCdDtl || qna.qnaCdDtl == '') && qna.qnaCd == 'QA019'){
        common.error("분류를 입력해주세요.");
        return false;
      }

      if (exceCode.indexOf(qna.qnaCd) < 0) {
        if (!qna.qnaSchLvlCd || qna.qnaSchLvlCd == '') {
          common.error("교과(학교)를 선택해 주세요.");
          breakExce = true;
          return;
        } else if (!qna.qnaSubjectCd || qna.qnaSubjectCd == '') {
          common.error("교과(과목)을 선택해 주세요");
          breakExce = true;
          return;
        }
      }

      if (!qna.qnaTitle || qna.qnaTitle == '') {
        common.error("제목을 입력해주세요.");
        this.titleInput.focus();
        return false;
      }
      if (!qna.qnaContents || qna.qnaContents == '') {
        common.error("내용을 입력해주세요.");
        this.contentsTextarea.focus();
        return false;
      }

        if(qna.qnaCd === 'QA019' && (showYn !== 'Y' && showYn !== 'N')) {
            common.error("자료요청시 공개/비공개 여부를 선택해 주세요.");
            this.showYn.focus();
            return false;
        }


        return true;
    }

    handleSubmit = async (e) => {
        const{showYn} = this.state;
        e.preventDefault();
        const qna = this.state.newQnA;
        if(this.readySubmit()) {
            try {
                let file = this.state.file;
                let privacy = this.state.privacy;
                if(file){
                    let filename = file.name;
                    let fileNameLen = filename.length;
                    let lastDot = filename.lastIndexOf('.');
                    let fileExt = filename.substring(lastDot+1, fileNameLen).toLowerCase();
                    if(!isFileUploadWhiteList(fileExt)){
                        common.info(fileExt+' 파일은 업로드 할 수 없습니다.');
                        return false;
                    }
                }

                if(!privacy){
                    common.info("위 필수 내용에 동의 후 진행 가능합니다.");
                    return false;
                }

                //자료요청시 공개/비공개 별도처리
                let useYn = 'Y';
                if(qna.qnaCd === 'QA019') {
                    useYn = showYn;
                }

                const response = await api.qnaNew(qna.qnaCd, qna.qnaSchLvlCd, qna.qnaSubjectCd, qna.qnaCdDtl, qna.qnaTitle, qna.qnaContents, qna.qnaCall, qna.qnaCallTime, useYn);
                // response 값에서 qnaId 를 전달 받아서 state 에 셋팅해야함.
                if (this.state.file != null) {
                    let result = this.handleUploadFile(this.state.file, response.data.qnaId);
                    console.log("TEST result upload : " + result);
                }
                if (response.data.code === "0000") {
                  common.info('문의해 주신 내용은 검토 후 답변 드리며, 내 문의함에서 확인하실 수 있습니다. 확인을 선택하시면 내 문의함으로 이동됩니다.');
                    this.props.history.push('/cs/qna');
                } else {
                    common.error('정상적으로 등록되지 못하였습니다.');
                }
                return false;
            } catch (e) {
                console.log(e);
            }
        }
        return false;
    }

    handleChangeAgree = (e) => {
        this.setState({
            privacy: e.target.checked
        });
    }

    //쿠키조회
    getCookie = (cName) => {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if (start != -1) {
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if (end == -1) end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    btnFileClick = async(e) => {
        const { isApp } = this.props;
        const cookie = this.getCookie("appFileAccessConfirm");

        // isms 용 알럿 추가
        if (isApp && cookie != "true") {
            if (window.confirm('비바샘에서 기기의 사진, 미디어, 파일에 액세스하도록 허용하시겠습니까?')) {
                // 접근 허가 얼럿 한번만 보이게 쿠키 설정
                cookies.set("appFileAccessConfirm", true, {
                    expires: moment().add(1000, 'days').toDate()
                });

                $('#file_gallary').trigger('click');
            } else {
                e.preventDefault();
            }
        } else {
            $('#file_gallary').trigger('click');
        }
    }

    handleFiles = (e) => {
        const file = e.target.files[0];
        if(file){
            window.URL = window.URL || window.webkitURL;
            var img = document.createElement("img");
            img.src = window.URL.createObjectURL(file);
            img.onload = function() {
                window.URL.revokeObjectURL(this.src);
            }
            this.setState({
                file: e.target.files[0],
                fileName : e.target.files[0].name ? e.target.files[0].name : '선택된 파일 없음',
                fileUrl : img ? img.src : null,
                visible : true
            });
        }
    }

    openPhoto = async(e) => {
        const { isApp } = this.props;

        if (isApp) {
            api.openCamera().then(val => {
                console.log(val);
                if (val === true) {
                    console.log('카메라를 실행합니다....');
                }
                else {
                    e.preventDefault();
                }
            }).catch((err) => {
                e.preventDefault();
            });
        }
    }

    handleUploadFile = async (file, qnaId) => {
        const data = new FormData();
        //using File API to get chosen file
        console.log("Uploading file" + file);
        data.append('file', file);
        data.append('name', 'QNA');
        data.append('description', 'QNA');
        let self = this;

        //calling async Promise and handling response or error situation
        console.log("TEST upload file data : " + JSON.stringify(data));

        this.fileService.uploadFileToServer(data).then(async(response) => {
            console.log("File " + file.name + " is uploaded");
            if(response.data.code === '0'){
                const res = await api.qnaFileInsert(qnaId, file.name, file.name, file.size, "FS007");
                console.log("TEST qnaFileInsert : " + res + " / qnaId : " + qnaId);
            }else if(response.data.code === '1'){
                common.info(response.data.msg);
            }
        }).catch(function (error) {
            console.log(error);
            if (error.response) {
                //HTTP error happened
                console.log("Upload error. HTTP error/status code=",error.response.status);
            } else {
                //some other error happened
                console.log("Upload error. HTTP error/status code=",error.message);
            }
        });
    };

    encodeUTF8 = (str) =>{
        return str.replace("&middot;", "·");
    }

    render() {
        const {newQnA, showYn, qnaSchLvlCdState, qnaSubjectCdState} = this.state;

        return (
          <Fragment>
            <div className="inquire_sort">
              {/* <!--[D] 필수값 표시 tit_bullet_star 클래스 추가 및 필수 마크업 추가 --> */}
              <h2 className="info_tit tit_bullet_star"><span className="blind">필수</span>분류</h2>
              <div className="input_wrap">
                <div className="selectbox select_sm">
                  <select name="qnaCd"
                          onChange={this.handleChange}
                          value={newQnA.qnaVsCd}>
                    <option value="">선택해 주세요</option>
                    {
                      this.state.qnaVsCdList.map(item =>
                        <option key={item.codeId} value={item.codeId} key={item.codeId}>{this.encodeUTF8(item.codeName)}</option>
                      )
                    }
                  </select>
                </div>
                <div className="selectbox select_sm">
                  <select name="qnaCdDtl"
                          onChange={this.handleChange}
                          disabled={this.state.newQnA.qnaCd == 'QA019' ? false : true}
                          value={this.state.newQnA.qnaCdDtl}>
                    <option value="">선택해 주세요</option>
                    {
                      this.state.qnaVsCdDtlList.map(item =>
                        <option key={item.codeId} value={item.codeId} key={item.codeId}>{item.codeName}</option>
                      )
                    }
                  </select>
                </div>
              </div>
              <h2 className="info_tit mt25">교과</h2>
              <div className="input_wrap select_col2_wrap">
                <div className="select_col2">
                  <div className="selectbox select_sm">
                    <QnaCodeSelect name="qnaSchLvlCd" grpCode="101" value={newQnA.qnaSchLvlCd} isDisabled={qnaSchLvlCdState}
                                   handleChange={this.handleChange}/>
                  </div>
                </div>
                <div className="select_col2">
                  <div className="selectbox select_sm">
                    <QnaCodeSelect name="qnaSubjectCd" code={newQnA.qnaSchLvlCd} value={newQnA.qnaSubjectCd} isDisabled={qnaSubjectCdState}
                                   handleChange={this.handleChange}/>
                  </div>
                </div>
              </div>

              <h2 className="info_tit tit_bullet_star mt25"><label htmlFor="ipt_title"><span className="blind">필수</span>제목</label></h2>
              <input type="text" placeholder="제목을 입력해주세요" className="input_sm" id="ipt_title" name="qnaTitle" onKeyUp={this.handleChange} ref={(input) => {
                this.titleInput = input;
              }}/>

              <h2 className="info_tit tit_bullet_star mt25"><label htmlFor="ipt_cont"><span className="blind">필수</span>내용</label></h2>
              <textarea id="ipt_cont" placeholder="불편 내용을 자세히 적어 주세요." className="ipt_textarea" name="qnaContents" onKeyUp={this.handleChange} ref={(textarea) => {
                this.contentsTextarea = textarea;
              }}></textarea>

              <h2 className="info_tit mt25">이미지 등록</h2>
              <p className="c_gray txt">오류 화면을 캡쳐하여 등록해 주시면 보다 정확한 답변이 가능합니다. </p>

              <div className="file_wrap">
                <button type="button" onClick={this.btnFileClick} className="btn_file">파일 선택</button>
                <span className="file_name">{this.state.fileName}</span>
                <input type="file" id="file_gallary" accept="image/*" onChange={this.handleFiles} className="file_custom"/>
              </div>

              {/* 자료요청 시 공개/비공개여부 */}
              {this.state.newQnA.qnaCd == 'QA019' &&
                <div className="inquire_private">
                  <h2 className="info_tit tit_bullet_star">공개 여부</h2>
                  <ul className="show_yn_chk join_ipt_chk">
                    <li className="show_yn_list join_chk_list">
                      <input
                        id="showYnY"
                        type="radio"
                        name="showYn"
                        value="Y"
                        checked={showYn === 'Y'}
                        onChange={this.handleChange}
                        ref={(input) => {
                          this.showYn = input;
                        }}
                        className="checkbox_circle"
                      />
                      <label htmlFor="showYnY">공개</label>
                    </li>
                    <li className="show_yn_list join_chk_list">
                      <input
                        id="showYnN"
                        type="radio"
                        name="showYn"
                        value="N"
                        checked={showYn === 'N'}
                        onChange={this.handleChange}
                        className="checkbox_circle"
                      />
                      <label htmlFor="showYnN">비공개</label>
                    </li>
                  </ul>
                </div>
              }

              <div className="sort_alert">
                <p>- 문의한 내역은 나의 교실 &gt; 내 문의함에서 확인하실 수 있습니다.</p>
                <p>- 요청된 자료는 제작 기간에 따라 업데이트 일정이 늦어질 수 있습니다.</p>
                <p className="alert_txt2">
                  ※ 비바샘은 고객문의의 접수, 문의 내용 확인 및 답변 등을 위해 <br/> 회원가입 시  입력한 선생님의 개인정보를 수집하고 있습니다.
                </p>
                <div className="indent_box">
                  <p>
                    <strong>- 수집항목 : </strong> 성명, 아이디, 연락처(휴대폰 번호), 문의 내용
                  </p>
                  <p>
                    <strong>- 개인정보 수집방법 :</strong> 비바샘 고객센터 문의하기 페이지를 통한 수집
                  </p>
                  <p>
                    <strong>- 개인정보의 보유 및 이용 기간 : </strong><br/>
                    선생님의 개인정보는 비바샘의 문의내역에 저장되어,<br/> 해당 문의에 답변을 위해 이용됩니다. <br/>
                    개인정보는 삭제를 요청하기 전까지 비바샘 문의내역에 저장되어<br/> 관리됩니다.
                  </p>
                </div>
              </div>
              <div className="cs_check">
                <input
                  type="checkbox"
                  name="privacy"
                  onChange={this.handleChangeAgree}
                  className="checkbox"
                  id="agree_privacy"/>
                <label
                  htmlFor="agree_privacy"
                  className="checkbox_tit">
                  <strong>
                    개인정보 수집 및 이용에 대해 동의합니다.
                  </strong>
                </label>
              </div>

              <a onClick={this.handleSubmit} className="btn_full_on mt30">등록</a>
            </div>
            <div className="guideline"></div>
            <div className="guide_box guide_box_type02">
              <h2 className="guide_box_tit">고객센터 1544-7714</h2>
              <span className="guide_box_tel">평일 오전 9시 ~오후 6시, 토/공휴일 휴무</span>
              <a href="tel:1544-7714" className="ico_tel ico_tel_txt">전화연결</a>
            </div>
            <div className="guideline"></div>
            <div className="guide_box guide_box_type02 guide_box_office">
              <h2 className="guide_box_tit">주변지사 찾기</h2>
              <span className="guide_box_tel">필요하신 자료는 가까운 지사에 바로 요청할 수 있습니다.</span>
              <Link to="/cs/contact" className="ico_office ico_office_txt">바로가기</Link>
            </div>
            <div className="guideline"></div>
            <div className="guide_box guide_box_type02 guide_box_aidt">
              <span className="ico_aidt"></span>
              <a href="https://ktbook.metahub.co.kr:25750/visang/" target="_blank" className="guide_box_tit"><span>비상교육 AIDT 교육자료 1:1 문의</span></a>
              <span className="guide_box_tel">1661-0777(AIDT 교육자료 공동 고객센터)</span>
            </div>
          </Fragment>
        );
    }
}

export default connect(
  (state) => ({
    logged: state.base.get('logged'),
    loginInfo: state.base.get('loginInfo').toJS(),
    myClassInfo: state.myclass.get('myClassInfo'),
    isApp: state.base.get('isApp')
  }),
  (dispatch) => ({
    BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(QnaNewContainer));
