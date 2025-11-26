import React, { Component } from 'react';

class RenderLoading extends Component {
    render() {
        const { loadingType } = this.props;
        let typeClass;

        switch (loadingType) {
            case "1" : typeClass = " type1"; break;
            case "2" : typeClass = " type2"; break;
            case "3" : typeClass = " type3"; break;
            default : typeClass = "";
        }

        return (
            <div className={"vivasam-loader"+typeClass}>
                <div className="vivasam-loader-box">
                    <img
                        className="vivasam-loader-img"
                        src="/images/common/loading.gif"
                        />
                </div>
            </div>
        )
    }
}
export default RenderLoading;
