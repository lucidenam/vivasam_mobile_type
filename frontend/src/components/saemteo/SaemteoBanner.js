import React, { Component } from 'react';

class SaemteoBanner extends Component {
    render() {
        const { typeName, id, name, startDate, endDate, src, handleClick } = this.props;
        return (
            <div className="picDesc_banner" style={id === '491' ? {display : "none"} : {display : "block"}}>
                <a
                    href=""
                    name={id}
                    onClick={handleClick}
                    className="picDesc_link">
                    <div className="picDesc_pic">
                        <img
                            src={src}
                            className="picDesc_pic_img" />
                    </div>
                    <div className="picDesc_desc">
                        <span className="cir_tec">{typeName}</span>
                        <p className="picDesc_txt">
                            {name}
                        </p>
                        <span className="picDesc_date">
                            {startDate} ~ {endDate}
                        </span>
                    </div>
                </a>
            </div>
        );
    }
}

export default SaemteoBanner;
