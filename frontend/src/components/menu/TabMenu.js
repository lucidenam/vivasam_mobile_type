import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class TabMenu extends Component {
    render() {
        const { text, link, isActive, logged } = this.props;
        const clazz = isActive ? 'tab_item active' : 'tab_item';
        function gtag(){
            window.dataLayer.push(arguments);
        }
        return (
            <li className={clazz}>
                <Link
                    onClick={()=>{
                        gtag('event', text, {
                            'parameter': 'GNB',
                            'parameter value': '2 Depth'
                        });
                    }}
                    to={text === '교과서 자료' && !logged ? '/login' : link}
                    className="tab_link">
                    <span>
                        {text}
                    </span>
                    {isActive ? <span className="blind">현재페이지</span> : ''}
                </Link>
            </li>
        );
    }
}

export default TabMenu;
