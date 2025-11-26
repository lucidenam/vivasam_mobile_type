import React, {Component} from 'react';
import { withRouter, Link } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import { ContactHQContainer, ContactListContainer } from 'containers/cs';

class ContactPage extends Component{
    render () {
        const contact = this.props.match.params.name;
        let title = "주변 지사 찾기";
        let container = <ContactListContainer />
        if(contact === 'hq') {
            title = "본사 찾아오시는 길";
            container = <ContactHQContainer />
        }

        return (
            <PageTemplate title={title}>
                {container}
            </PageTemplate>
        )
    }
}

export default withRouter(ContactPage);