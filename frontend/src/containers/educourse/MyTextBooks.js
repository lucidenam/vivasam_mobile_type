import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import * as myclassActions from 'store/modules/myclass';
import * as baseActions from 'store/modules/base';
import { getTextbookListByCourse, insertMyTextbook, deleteMyTextbook } from 'lib/api';
import { MyTextBook } from 'containers/educourse';
import { groupBy, keys } from 'lodash';
import * as common from "../../lib/common";

class EduYearGroup extends Component {
    render() {
        const {eduYear, textbooks, handleCheckbox} = this.props;
        const textbookList = textbooks.map((book,idx) => {
            return <MyTextBook {...book} key={book[idx]} handleCheckbox={handleCheckbox} eduYear={book.eduYear} thumbnailPath={book.thumbnailPath}/>;
        });
        const size = textbookList.length;
        /* let mdClazz = " pointColor1"
        if(eduYear !== '2015') {
            mdClazz = ' pointColor2';
        } */
        if (size > 0) {
            return (
                <div className="setting_mybook_box">
                    {/* <em className={"myBook_lable"+mdClazz}>{eduYear} 개정</em> */}
                    {textbookList}
                </div>
            );
        } else {
            return (
                <div className="setting_mybook_box">
                    <p className="nodata">검색 결과가 없습니다.</p>
                </div>
            );
        }
    }
}

class MyTextBooks extends Component {
    state = {
        textbooks: []
    }

    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;
        try {
            const response = await MyclassActions.myTextBooks();
        } catch (e) {
            console.log(e);
        }
    }

    handleSaveTextBook = async (target) => {
        let response;
        if(target.checked) {
            response = await insertMyTextbook(target.id);
            common.toast("내 교과서가 추가 되었습니다.");
        }else {
            response = await deleteMyTextbook(target.id);
            common.toast("내 교과서가 삭제 되었습니다.");
        }

        this.getMyTextBookInfoList();
    }


    handleCheckbox = (e) => {
        console.log(e.target);
        console.log(e.target.checked);
        console.log(e.target.id);

        this.handleSaveTextBook(e.target);
    }

    getTextbookListByCourse = async (activeCourseCd,mdValue) => {
        const { BaseActions } = this.props;
        try {
            BaseActions.openLoading({loadingType:"2"});
            const response = await getTextbookListByCourse(activeCourseCd,mdValue);

            this.setState({
                textbooks: response.data
            });
        } catch (e) {
            console.log(e);
        } finally {
            BaseActions.closeLoading();
        }
    }

    componentDidMount() {
        const { activeCourseCd, mdValue } = this.props;
        this.getTextbookListByCourse(activeCourseCd,mdValue);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.activeCourseCd !== nextProps.activeCourseCd || this.props.mdValue !== nextProps.mdValue) {
            this.getTextbookListByCourse(nextProps.activeCourseCd,nextProps.mdValue);
        }
        if(this.state.textbooks !== nextState.textbooks) {
            return true;
        }
        return false;
    }

    render() {
        const { textbooks } = this.state;

        const eduYearGroup = groupBy(textbooks, "eduYear");
        /*const textBookGroups = keys(eduYearGroup).reverse().map(key => {
            return <EduYearGroup key={key} eduYear={key} textbooks={eduYearGroup[key]} handleCheckbox={this.handleCheckbox}/>;
        });*/
        const textBookGroups = <EduYearGroup textbooks={textbooks} handleCheckbox={this.handleCheckbox}/>;

        return (
            <div className="setting_mybook">
                {textBookGroups}
            </div>
        );
    }
}

export default connect(
    (state) => ({}),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(MyTextBooks);
