import React, { Component } from 'react';
import * as api from 'lib/api';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class QnaCodeSelect extends Component {

    state = {
        codeList : []
    }

    componentWillReceiveProps({name, code}) {
        if(name === 'qnaSubjectCd') {
            this.getSubjectList(code);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        const {name, code, grpCode, refCode} = this.props;
        switch(name) {
            case 'qnaCd':
                this.getVScodeList(code);
                break;
            case 'qnaSchLvlCd':
                this.getCodeList(grpCode, refCode);
                break;
            case 'qnaSubjectCd':
                this.getSubjectList(code);
                break;
            default:
                this.getVScodeList(code);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getVScodeList = async(code) => {
        if(!code) return false;
        try {
            const response = await api.vscodeList(code);
            if(this._isMounted){
                this.setState({
                    codeList : response.data
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    getCodeList = async(grpCode, refCode) => {
        if(!grpCode) return false;
        try {
            const response = await api.codeList(grpCode, refCode);
            if(this._isMounted){
                this.setState({
                    codeList : response.data
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    getSubjectList = async(code) => {
        if(!code) return false;
        try {
            const response = await api.subjectList(code);
            if(this._isMounted){
                this.setState({
                    codeList : response.data
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const {value, name, handleChange, defaultName, isDisabled} = this.props;

        const categoryOption = this.state.codeList.map(code => {
            if ( name == "qnaSchLvlCd" && (code.codeId=="NES" || code.codeId=="NHS" || code.codeId=="NMS" || code.codeId == "KS" || code.codeId == "CS" || code.codeId == "OS") ) {
                return null;
            }
            return <option key={code.codeId} value={code.codeId}>{code.codeName}</option>;
        });

        return (
            <select value={value || ''} name={name} onChange={handleChange} disabled={isDisabled}>
                <option value="">{defaultName ? defaultName : '선택해주세요'}</option>
                {categoryOption}
            </select>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    })
)
(withRouter(QnaCodeSelect));
