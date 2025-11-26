import React, { Component } from 'react';

class RenderLoadingFull extends Component {
    render() {
        return (
            <div className="vivasam-loader-full">
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
export default RenderLoadingFull;
