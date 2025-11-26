import React, {Component} from 'react';


class HtmlViewer extends Component{

    componentDidMount(){
        this.startFunction();
    }

    startFunction = async() => {
        const { handleAuth, handleApplyPoint } = this.props;
        let auth = await handleAuth();
        if(!auth) return false;

        handleApplyPoint();
}

    calcHeight = (e) => {
        try{
            let the_height = document.getElementById('htmlIframe').contentWindow.document.body.scrollHeight;
            document.getElementById('htmlIframe').height = the_height;
            document.getElementById('htmlIframe').style.overflow = "hidden";
        }catch(e){
            //console.log(e);
        }
    }

    render () {
        const { target,handleDownload,handleAddFolder,type } = this.props;
        if(!target) return null;
        let src = target.dataset.src;

        return (
            <section className="viewer_content">
                <iframe title="htmlIframe" id="htmlIframe" src={'https://dn.vivasam.com'+target.dataset.siteurl} onLoad={this.calcHeight} className={'viewer_html'}></iframe>
                <div className="viewer_info">
                    <h2 className="viewer_info_tit">
                        {target.dataset.sourcename ? '출처 : '+target.dataset.sourcename : ''}
                    </h2>
                    <div className="viewer_info_btnbox">
                        <button
                            type="button"
                            onClick={()=>{handleDownload(target)}}
                            className={"viewer_info_btn"}>
                            다운로드
                        </button>
                        <button
                            type="button"
                            onClick={handleAddFolder}
                            className="viewer_info_btn icon_bookmark">
                            담기
                        </button>
                    </div>
                    </div>
                <div className="viewer_cont">
                    <p className="viewer_sent">
                        <span dangerouslySetInnerHTML={{__html: target.dataset.summary}}></span>
                    </p>
                </div>
            </section>
        )
    }
}

export default HtmlViewer;
