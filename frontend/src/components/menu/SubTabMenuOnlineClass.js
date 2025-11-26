import React, { Component } from 'react';

class SubTabMenuOnlineClass extends Component {
    render() {
        const { tabName, text, isActive, onTabMenuClick } = this.props;
        const clazz = isActive ? 'tab_item active' : 'tab_item';
        return (
            <li className={clazz}>
                <button
                    onClick={() =>{
                        onTabMenuClick(tabName);
                    }}
                    className="tab_link">
                    <span>
                        {text}
                    </span>
                </button>
            </li>
        );
    }
}

export default SubTabMenuOnlineClass;
