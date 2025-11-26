import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as common from "../../lib/common";
import {MyTextBookSetupPopup} from "./index";
import {bindActionCreators} from "redux";
import * as baseActions from "../../store/modules/base";
import * as popupActions from "../../store/modules/popup";
import {DOWNLOAD_IMAGE_PATH, DOWNLOAD_IMAGE_PATH_22} from "../../constants";
//import { includes } from 'lodash';

class MyTextBook extends Component{
    state = {
        isChecked: false
    }

    handleClick = e => {
        e.preventDefault();

        const {myTextBooks, handleCheckbox, PopupActions} = this.props;

        if(e.target.checked && myTextBooks.length >= 12) {
            common.error('내 교과서는 최대 12개까지 등록하실 수 있습니다.');
            return;
        }

        this.setState({
            isChecked: e.target.checked
        });

        PopupActions.openPopup({title:"내 교과서 설정", componet:<MyTextBookSetupPopup />, wrapClassName: "pop_type2", counter: e.target.checked ? myTextBooks.length+1 : myTextBooks.length-1});

        handleCheckbox(e);
    }

    componentDidMount() {
        const { textbook, myTextBooks} = this.props;

        const isMyBook = myTextBooks.find(book => {
            return book.textbookCd === textbook;
        }) ? true : false;

        this.setState({
//            isChecked: isMyBook
        });
    }

    render() {
        const {textbook, labTextbook, schoolLvl, eduYear, thumbnailPath, myBookYn, myTextBooks} = this.props;
        let myBookChecked;
        if (myBookYn === 'Y') myBookChecked = true;
        else myBookChecked = false;
//        if (this.state.isChecked) myBookChecked = true;

        const isMyBook = myTextBooks.find(book => {
            return book.textbookCd === textbook;
        }) ? true : false;

        if (isMyBook) myBookChecked = true;

        let schoolLvlNm = "";
        let marker2Clazz = "";
        switch(schoolLvl) {
            case 'ES':
                schoolLvlNm = '초등';
                marker2Clazz = "myclass_marker_type2_2";
                break;
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
            <div className={"setting_mybook_list"+renewer_year}>
                <div className="book_img_box"><img src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + thumbnailPath} alt="" /></div>
                <div className="book_content_box">
                    <em className={"renewer_year"+renewer_year}>{eduYear == '2015' ? '15' : '22'} 개정</em>
                    <h3 className="setting_mybook_tit">
                        {/* <em className={marker2Clazz}>{schoolLvlNm}</em> */}
                        <span className="pipe">
                            <span className="classNm">{classNm}</span>
                            <span className="teacherNm">{teacherNm}</span>
                            {/* {classNm + " " + teacherNm} */}
                        </span>
                    </h3>
                    <input
                        type="checkbox"
                        id={textbook}
                        onChange={this.handleClick}
                        className="checkbox"
                        name="textbooks"
                        checked={myBookChecked}
                    />
                    <label htmlFor={textbook}>
                        <span className="blind">선택</span>
                    </label>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        myTextBooks: state.myclass.get('myTextBooks')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(MyTextBook);