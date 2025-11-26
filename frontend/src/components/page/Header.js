import React, {Fragment} from 'react';
//import Sticky from 'react-sticky-el';
import Sticky from 'components/common/Sticky';

const Header = ({title, onClick, rightMenu, disableSticky}) => {
    const header = (
        <header className="header_sub">
            <h1 className="header_tit">{title}</h1>
            <div className="allMenu">
                <a
                    onClick={onClick}
                    className="allMenu_back">
                    <span className="blind">
                        이전 페이지 이동
                    </span>
                </a>
            </div>
            {rightMenu}
        </header>
    )
    return (
        <Fragment>
            {
                disableSticky ? header : (
                    <Sticky ignoreTranslate={true}>
                        {header}
                    </Sticky>
                )
            }
        </Fragment>
    )
}

export default Header;
