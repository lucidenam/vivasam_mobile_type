import React, {Component, Fragment} from 'react';
import { CommonDataDetailList } from 'containers/educourse';
import { getUnitTypeList, getAllMenuList } from 'lib/api';

class CommonDataDetail extends Component {
    state = {
        activeType: '',
        visible: false
    }

    handleClickTab = (activeType) => {
        this.setState({
            activeType
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextState !== this.state);
    }

    componentDidMount() {

    }
    render() {
        const { textbookCd, types } = this.props;
        const { activeType, visible } = this.state;

        if(!textbookCd && types.length === 0) return false;

        let activeTypeStr = activeType;
        if(!activeTypeStr && types.length > 0) {
            activeTypeStr = types[0].class2Cd
        }

        if(!activeTypeStr) return false;

        return (
            <Fragment>
                <div className="tags_box">
                    <div className="tags_row">
                        {
                            types.map(type => {
                                return (<button
                                    key={type.class2Cd}
                                    onClick={() => {
                                        this.handleClickTab(type.class2Cd);
                                    }}
                                    type="button"
                                    className={"tags_link"+ (activeTypeStr === type.class2Cd ? " active" : "")}
                                >{type.class2Nm}</button>);
                            })
                        }
                    </div>
                </div>

                <CommonDataDetailList
                    textbookCd={textbookCd}
                    class2Cd={activeTypeStr}
                />
            </Fragment>
        );
    }
}

export default CommonDataDetail;