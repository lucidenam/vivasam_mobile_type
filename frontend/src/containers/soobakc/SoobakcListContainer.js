import React, {Component} from 'react';
import * as api from 'lib/api';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as common from 'lib/common';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

class SoobakcListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            grade : 5,
            totalElements: 0,
            number: 0,
            visible: false,
            soobakc : [],
            soobakcAll : [],
            offset: 0,
            sjcode : null
        }
    }
    
    getSoobakcList = async(type, grade, sjcode, fksub) => {
        const { changeCount } = this.props;
        changeCount(1);

        var ACTION_TYPE = type;
        var leccnt = null;
        if(grade === "") grade = null;

        const response = await api.getSoobakcList(ACTION_TYPE, fksub, sjcode, leccnt, grade);
        let soobakc = [];
        let offset = 0;

        let visible = true

        if(response.data.length > 0) {
            for(var i = 0; i < 20; i++) {
                soobakc.push(response.data[i]);
                offset = i;
            }
            if(soobakc.length === response.data.length) visible = false;
        } else {
            visible = false;
        }

        this.setState({
            visible : visible,
            soobakc : soobakc,
            soobakcAll : response.data,
            offset : offset,
            sjcode : sjcode
        })
    }

    componentDidMount() {
        //this.getSoobakcList();
    }

    componentWillUpdate() {
        
    }

    goSoobakcDetailList = (path) => {
        const {loginInfo, history} = this.props;
        if(loginInfo.mLevel === 'AU400') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
        } else {
            history.push(path);
        }
    }

    render() {
        const { soobakcList, type, grade, sjcode, fksub, isMoreBtn, addMoreList, changeSelectBox, isLoading } = this.props;
        const SoobakcList = ({soobakcList, sjcode}) => {
            const Soobakc = soobakcList.map((soobak, index) => {
                //#{LECTURECD}, #{SJCODE}, #{LP_IDX}
                let linkUrl = '';
                if(soobak !== null && soobak !== undefined) {
                    linkUrl = "/soobakc/detail/" + soobak.NUMBER + "?lectureCd=" + soobak.LECTURECODE + "&sjcode=" + sjcode + "&lpIdx=" 
                              + soobak.LP_IDX + "&leccnt=" + soobak.LP_TOT_LEC2 + "&type=" + type + "&grade=" + grade;
                                    
                    return (
                        <li className="lecture_item" key={index}>
                            <a onClick={this.goSoobakcDetailList.bind(this, linkUrl)} className="lecture_link">
                                <span className="subject"><span>{soobak.SUBJECTNAME}</span></span>
                                <strong className="course">{soobak.LECTURENAME}</strong>
                                <span className="book">교재 : {soobak.BOOKNAME}</span>
                                <span className="c_num">{soobak.LP_TOT_LEC2}강</span> <span className="c_txt">{soobak.TEACHER}</span>
                            </a>
                        </li>
                    )
                }

            })

            return (
                <ul>
                    {Soobakc}
                </ul>
            )
        }

        return (
            <section className="soobakc">
                <h2 className="blind">온리원 추천강의</h2>
                <div className="guideline"></div>
                <div className="soobakc_wrap">
                    {type == 'LEC_LISTE' &&
                    <div className="selectbox selTypeA">
                        <select name="" id="" onChange={changeSelectBox}>
                            <option value="전체">전체</option>
                            <option value="국어">국어</option>
                            <option value="영어">영어</option>
                            <option value="수학">수학</option>
                            <option value="사회">사회</option>
                            <option value="과학">과학</option>
                        </select>
                    </div>
                    }
                    <div className="lecture">
                        {soobakcList.length === 0 && isLoading &&
                            <RenderLoading loadingType={"3"}/>
                        }
                        {soobakcList.length > 0 &&
                            <div>
                            <SoobakcList soobakcList={soobakcList} sjcode={sjcode}/>
                            {isLoading && 
                                <ContentLoading />
                            }
                            </div>
                        }
                        {isMoreBtn &&
                        <a onClick={addMoreList} className="btn_full_off btn_full_sm btn_txt_bold">더보기</a>
                        }
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    })
)(withRouter(SoobakcListContainer));