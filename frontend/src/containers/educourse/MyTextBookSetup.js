import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as popupActions from 'store/modules/popup';
import * as myclassActions from 'store/modules/myclass';
import {MyTextBookSetupPopup} from 'containers/educourse';
import {deleteMyTextbook} from 'lib/api';
import * as common from "../../lib/common";
import {initializeGtag} from "../../store/modules/gtag";
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import {DOWNLOAD_IMAGE_PATH_22} from "../../constants";

class TextBook extends Component {

    render() {
        const {labCourse, labTextbook, schoolLvl, eduYear, handleDeleteTextBook, textbookCd, history, thumbnailPath} = this.props;

        let schoolLvlNm = "";
        let marker2Clazz = "";
        switch(schoolLvl) {
            case 'MS':
                schoolLvlNm = '중학';
                marker2Clazz = "myclass_marker_type2";
                break;
            case 'HS':
                schoolLvlNm = '고등';
                marker2Clazz = "myclass_marker_type2_3";
                break;
            default:
                schoolLvlNm = '';
        }

        let classNm = labTextbook.substring(0,labTextbook.lastIndexOf("(")).trim(); //과목명
        let teacherNm = labTextbook.substring(labTextbook.lastIndexOf("(")).trim(); //담당자명

        let renewer_year = " y15"
        if(eduYear !== '2015') {
            renewer_year = ' y22';
        }

        return (
            <li className={"set_mybook_list on"+renewer_year}>
                <div className="book_img_box"
                    onClick={() => {
                            history.push("/educourse/textbook/"+textbookCd);
                        }}>
                    <img src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + thumbnailPath} alt=""/>
                </div>
                <div className="book_content_box">
                    <em className={"renewer_year" + renewer_year}>{eduYear == '2015' ? '15' : '22'} 개정</em>
                    <div
                        onClick={() => {
                            history.push("/educourse/textbook/"+textbookCd);
                        }}>
                        <span className="set_mybook_title">
                            <span className="classNm">{classNm}</span>
                            <span className="teacherNm">{teacherNm}</span>
                            {/* {classNm + " " + teacherNm} */}
                        </span>
                    </div>
                    <a
                        onClick={() => {
                            if (window.confirm('삭제하시겠습니까?')) {
                                handleDeleteTextBook(textbookCd);
                            }
                        }}
                        className="myclass_top_del ico_del"
                    >
                        <span className="blind">리스트에서 삭제</span>
                    </a>
                </div>
                {/* <h3 className="set_mybook_tit"><em className={marker2Clazz}>{schoolLvlNm}</em> {labCourse}</h3>
                <div
                    onClick={() => {
                        history.push("/educourse/textbook/"+textbookCd);
                    }}>
                    <span className="set_mybook_title">{labTextbook}</span>
                    <em className={"myBook_lable"+mdClazz}>{eduYear} 개정</em>
                </div>
                <a
                    onClick={() => {
                        if (window.confirm('삭제하시겠습니까?')) {
                            handleDeleteTextBook(textbookCd);
                        }
                    }}
                    className="myclass_top_del ico_del"
                >
                    <span className="blind">리스트에서 삭제</span>
                </a> */}
            </li>
        );
    }
}

class MyTextBookSetup extends Component {
    state = {
        counter : 0
    }
    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;

        try {
            const response = await MyclassActions.myTextBooks();
            this.setState({
                counter : response.data.length
            })
        } catch (e) {
            console.log(e);
        }
    }

    handleDeleteTextBook = async (textbookCd) => {
        const response = await deleteMyTextbook(textbookCd);
        if(response.data === "SUCCESS") {
            common.toast("삭제하였습니다.");
            this.getMyTextBookInfoList();
        }
    }

    handleOpenTextBookSetupPopup = (e) => {
        e.preventDefault();
        const { PopupActions, loginInfo} = this.props;

        if (loginInfo.schoolLvlCd === 'ES') {
            alert('중고등 회원 전용 서비스입니다.');
            return false;
        }

        PopupActions.openPopup({title:"내 교과서 설정", componet:<MyTextBookSetupPopup />, wrapClassName: "pop_type2", counter: this.state.counter});

        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '2025 개편', {'parameter': '내 교과서', 'parameter_value': '내 교과서 추가', 'parameter_url': window.location.href});
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/myclassSetup',
            'page_title': '내 교과서 추가｜비바샘'
        });
        this.getMyTextBookInfoList();
    }

    render() {
        const { myTextBooks, history } = this.props;

        const myTextBookList = myTextBooks.map(book => <TextBook {...book} key={book.textbookCd} history={history} handleDeleteTextBook={this.handleDeleteTextBook}/>);

        return (
            <section className="set_myclass">
                <div className="guideline new251"></div>
                <h2 className="blind">내 교과서</h2>

                <div className="set_myclass_top">
                    <p className="set_myclass_guide"><strong>내 교과서</strong>를 설정하여 <br />빠르게 이동하실 수 있습니다.</p>
                    <ul className="sub_tit_description">
                        <li className="sub_tit_txt"><i className="wish"><span className="blind">교과서 추가</span></i>를 눌러 내 교과서를 추가/해제 하실 수 있습니다.</li>
                    </ul>
                </div>

                <div className="set_mybook">
                    <ul>
                        {myTextBookList}
                    </ul>
                </div>

                <div className="set_mybook_bottom fixed">
                    <button
                        onClick={this.handleOpenTextBookSetupPopup}
                        className="btn_add_class"
                    >
                        <span>내 교과서 설정</span>
                    </button>
                </div>

            </section>
        );
    }
}

export default connect(
    (state) => ({
        myTextBooks: state.myclass.get('myTextBooks'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(MyTextBookSetup));