import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';

class SubTabMenu extends Component {
    render() {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        const { text, link, isActive, blindName, tabName, handleTabClick, cafeSubjectCd, courseCd } = this.props;
        const clazz = isActive ? 'subTab_litem active' : 'subTab_litem';
        return (
            <Fragment>
                {
                    tabName === 'educourse_subject' ?
                    <li className={clazz} onClick={() => {handleTabClick(cafeSubjectCd, courseCd, text);}}>
                        <span className="subTab_link">
                            {text}
                        </span>
                    </li>
                    :
                    <li className={clazz}>
                        <Link
                            to={link}
                            onClick={() => {
                                if (text === "중학" || text === "고등") {
                                    gtag('event', '2025 개편', {'parameter': '교과서 자료', 'parameter_value': text, 'parameter_url': window.location.origin + "/#" + link});
                                }
                            }}
                            className="subTab_link">
                            {text}
                        </Link>
                    </li>
                }
            </Fragment>
        );
    }
}

export default SubTabMenu;
