import React, {Component, Fragment} from 'react';

class Address extends Component {
    shouldComponentUpdate(nextProps, nextStage) {
        return (nextProps.bdMgtSn !== this.props.bdMgtSn);
    }

    createMarkup = (text) => {
        text = text.replaceAll('&apos;', '\'');
        return text;
    }

    render() {
        const {zipNo, roadAddr, jibunAddr, handleSelect} = this.props;
        return (
            <li className="result_item" onClick={() => {handleSelect(zipNo, this.createMarkup(roadAddr))}}>
                <span className="result_ctg">{zipNo}</span>
                <p className="result_sbj" dangerouslySetInnerHTML = {{__html: '[도로명] ' + roadAddr}}>
                </p>
                <p className="result_desc" dangerouslySetInnerHTML = {{__html: '[지번] ' + jibunAddr}}>
                </p>
            </li>
        );
    }
}

class AddressList extends Component {
    shouldComponentUpdate(nextProps, nextStage) {
        return (nextProps.jusos !== this.props.jusos);
    }

    render() {
        const {jusos, totalCount, handleSelect} = this.props;
        if(Number(totalCount) <= 0) {
            return null;
        }
        //주소 리스트
        const jusoList = jusos.map((juso, index) => {
            return (<Address {...juso} key={index} handleSelect={handleSelect}/>);
        });

        return (
            <Fragment>
                <div className="guideline" />
                <div className="search_result">
                    <h2 className="blind">
                        우편번호 검색 결과
                    </h2>
                    <div className="result_count">총 <strong className="num">{totalCount}</strong>건</div>
                    <ul className="result_list">
                        {jusoList}
                    </ul>
                </div>
            </Fragment>
        );
    }
}

export default AddressList;
