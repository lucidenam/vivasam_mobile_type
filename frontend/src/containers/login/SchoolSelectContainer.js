import React, { Component } from 'react';
import { SchoolSelect } from 'components/login';
import * as api from 'lib/api';

class SchoolSelectContainer extends Component {

    state = {
        schools : []
    };

    getSchoolSelect = async () => {
        try {
            const response = await api.schoolCodeList(this.props.code);
            this.setState({
                schools : response.data
            })
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this.getSchoolSelect();
    }

    render() {
        return (
            <SchoolSelect name={this.props.name} value={this.props.value} schools={this.state.schools} handleChange={this.props.handleChange} />
        );
    }
}

export default SchoolSelectContainer;
