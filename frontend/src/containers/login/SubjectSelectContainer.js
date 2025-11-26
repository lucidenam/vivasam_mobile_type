import React, { Component } from 'react';
import { SubjectSelect } from 'components/login';
import * as api from 'lib/api';

class SubjectSelectContainer extends Component {

    state = {
        subjects : []
    };

    getSubjectSelect = async () => {
        try {
            const response = await api.vscodeList(this.props.code);
            this.setState({
                subjects : response.data
            })
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this.getSubjectSelect();
    }

    render() {
        return (
            <div className="selectbox select_sm">
                <SubjectSelect name={this.props.name} value={this.props.value} subjects={this.state.subjects} handleChange={this.props.handleChange} schoolGrade={this.props.schoolGrade} />
            </div>
        );
    }
}

export default SubjectSelectContainer;
