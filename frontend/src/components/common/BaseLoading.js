import React, { Component } from 'react';

class BaseLoading extends Component {
    render() {
        const { loadingType, isLoading } = this.props;
        let clazz = "vivasam-loader";

        switch (loadingType) {
            case "1" : clazz = "vivasam-loader type1"; break;
            case "2" : clazz = "vivasam-loader type2"; break;
            case "3" : clazz = "vivasam-loader type3"; break;
            default : clazz = "vivasam-loader-full";
        }

        return (
            <div className={clazz} hidden={!isLoading}>
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
export default BaseLoading;
