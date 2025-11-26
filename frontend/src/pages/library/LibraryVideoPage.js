import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import MainHeaderPageTemplate from 'components/page/MainHeaderPageTemplate';
import TabMenuContainer from 'containers/menu/TabMenuContainer';
import SubTabMenuContainer from 'containers/menu/SubTabMenuContainer';
import LibraryListContainer from 'containers/library/LibraryListContainer';
import Sticky from 'react-sticky-el';

class LibraryVideoPage extends Component{
    state = {
        subTabName : 'video'
    }
    render () {
        const { subTabName } = this.state;
        return (
            <MainHeaderPageTemplate>
                <TabMenuContainer tabName='library'/>
                <Sticky >
                    <SubTabMenuContainer tabName='library' subTabName={subTabName}/>
                </Sticky>
                <section className="library">
                    <h2 className="blind">
                        동영상 자료
                    </h2>
                    <div className="guideline"></div>
                    <div className="library_wrap">
                        <LibraryListContainer subTabName={subTabName}/>
                    </div>
                </section>
            </MainHeaderPageTemplate>
        )
    }
}

export default withRouter(LibraryVideoPage);
