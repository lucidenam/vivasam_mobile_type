import React, {Component, Fragment} from 'react';
import {deleteMyTextbook, getTextbookListbyGrpCd, insertMyTextbook} from 'lib/api';
import {Link} from 'react-router-dom';
import {groupBy, keys} from "lodash";
import {RenderLoading} from 'components/common';
import * as common from "../../lib/common";
import {DOWNLOAD_IMAGE_PATH, DOWNLOAD_IMAGE_PATH_22} from "../../constants";

class TextBook extends Component {
    render() {
        const { textbooknm, textbook, eduYear, schoolLvlCd, thumbnailPath, handleCheckbox, myTextbookList, history, logged } = this.props;
        const isMyBook = myTextbookList.find(book => {
            return book.textbookCd === textbook;
        }) ? true : false;

        let classNm = textbooknm.substring(0,textbooknm.lastIndexOf("(")).trim(); //과목명
        let teacherNm = textbooknm.substring(textbooknm.lastIndexOf("(")).trim(); //담당자명

        let renewer_year = " y15"
        if(eduYear !== '2015') {
            renewer_year = ' y22';
        }
        return (
            <div className={"eleResult_list"}>
                {schoolLvlCd === 'ES' ? <Link to={"/educourse/textbook/"+textbook}
                      className="eleResult_link"
                >
                    <p className="eleResult_tit">
                        {classNm + " " + teacherNm}
                    </p>
                </Link> : <div className={"book_item"+renewer_year}> 
                    <div className="book_img_box" onClick={() => {
                            history.push("/educourse/textbook/"+textbook);
                        }}>
                        <img src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + thumbnailPath} alt="" />
                    </div>
                    <div className="book_content_box">
                        <em className={"renewer_year"+renewer_year}>{eduYear == '2015' ? '15' : '22'} 개정</em>
                        <Link to={"/educourse/textbook/"+textbook} className="book_link">
                            <p className="book_title">
                                <span className="classNm">{classNm}</span>
                                <span className="teacherNm">{teacherNm}</span>
                                {/* {classNm + " " + teacherNm} */}
                            </p>
                        </Link>
                    </div>
                </div>}
            </div>
        );
    }
}

class EduYearGroup extends Component {
    render() {
        const {eduYear, textbooks, schoolLvlCd, idx, handleCheckbox, myTextbookList, history, logged} = this.props;
        const textbookList = textbooks.map(book => {
            let key = book.textbook;
            return <TextBook {...book} key={key} handleCheckbox={handleCheckbox} thumbnailPath={book.thumbnailpath} myTextbookList={myTextbookList} history={history} logged={logged}/>;
        });

        let mdClazz = " pointColor1"
        if(eduYear !== '2015') {
            mdClazz = ' pointColor2';
        }
        return (
            <div className={"eleResult"+ ( idx === 0 && schoolLvlCd !== 'ES' ? " first" : "")}>
                {schoolLvlCd === 'ES' ? <em className={"myBook_lable"+mdClazz}>{eduYear} 개정</em> : ''}
                {textbookList}
            </div>
        );
    }
}

class TextBookList extends Component {
    state = {
        textbooks: null,
        counter : 0,
        isChecked : false
    }


    handleSaveTextBook = async (target) => {
        const {getMyTextBookInfoList} = this.props;
        let response;
        if(target.checked) {
            response = await insertMyTextbook(target.id);
            common.toast("내 교과서가 추가 되었습니다.");
        }else {
            response = await deleteMyTextbook(target.id);
            common.toast("내 교과서가 삭제 되었습니다.");
        }

        getMyTextBookInfoList();
    }

    handleCheckbox = (e) => {
        console.log(e.target);
        console.log(e.target.checked);
        console.log(e.target.id);

        this.handleSaveTextBook(e.target);
    }

    sendData = () => {
        this.props.sendDataToParent(this.state.counter);
    };

    getTextBookList = async (subjectCdStr, grade, mdValue, subjectTypeCd) => {
        if(!subjectCdStr) {
            return false;
        }
        try {
            const response = await getTextbookListbyGrpCd(subjectCdStr, grade, mdValue, subjectTypeCd);
            if(this._isMounted) {
                this.setState({
                    textbooks: response.data,
                    counter : response.data.length
                });
            }

            this.sendData();
        }catch(e) {
            console.log(e);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.subjectCdStr !== nextProps.subjectCdStr || this.props.grade !== nextProps.grade || this.props.mdValue !== nextProps.mdValue || this.props.subjectTypeCd !== nextProps.subjectTypeCd) {
            this.getTextBookList(nextProps.subjectCdStr, nextProps.grade, nextProps.mdValue, nextProps.subjectTypeCd);
            this.setState({
                textbooks: null
            });
            return false;
        }

        return (this.props !== nextProps || this.state !== nextState);
    }

    componentDidMount() {
        this._isMounted = true;
        const { subjectCdStr, grade, mdValue, subjectTypeCd } = this.props;

        this.getTextBookList(subjectCdStr, grade, mdValue, subjectTypeCd);

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { textbooks } = this.state;
        const { schoolLvlCd, myTextbookList, history, logged } = this.props;

        if(textbooks === null) {
            return <RenderLoading loadingType={"3"}/>;
        }

        const eduYearGroup = groupBy(textbooks, "eduYear");
        const textBookGroups = <EduYearGroup schoolLvlCd={schoolLvlCd} idx={0} textbooks={textbooks} handleCheckbox={this.handleCheckbox} myTextbookList={myTextbookList} history={history} logged={logged}/>;
        /*const textBookGroups = keys(eduYearGroup).reverse().map((key, index) => {
            return <EduYearGroup key={key} eduYear={key} schoolLvlCd={schoolLvlCd} idx={index} textbooks={eduYearGroup[key]} handleCheckbox={this.handleCheckbox}/>;
        });*/

        return (
            <Fragment>
                {textBookGroups}
            </Fragment>
        );
    }
}

export default TextBookList;