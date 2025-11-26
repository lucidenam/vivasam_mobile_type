import React, { Component, Fragment } from 'react';

class UiSelectBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchType: props.searchType,
        };
        this.selectBoxRef = React.createRef();
    }

    componentDidMount() {
        this.initUISelect();
    }

    componentDidUpdate() {
        this.initUISelect();
    }

    initUISelect = () => {
        const container = this.selectBoxRef.current;
        if (!container) return;

        const selected = container.querySelector('.selected');
        const optionsBox = container.querySelector('.select-options');
        const options = optionsBox.querySelectorAll('button');

        // 클릭 이벤트 제거 후 재등록 방지를 위해 이벤트 덮기
        selected.onclick = (e) => {
            e.stopPropagation();
            const isVisible = optionsBox.style.display === 'block';
            document.querySelectorAll('.select-options').forEach(box => {
                box.style.display = 'none';
            });
            optionsBox.style.display = isVisible ? 'none' : 'block';
        };

        options.forEach(optionBtn => {
            optionBtn.onclick = () => {
                const value = optionBtn.dataset.value;
                const select = container.querySelector('select');

                select.value = value;

                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);

                this.setState({ searchType: value });

                optionsBox.style.display = 'none';
            };
        });

        document.onclick = () => {
            optionsBox.style.display = 'none';
        };
    };

    render() {
        const { searchType } = this.props;

        return (
            <div className="ui-select" ref={this.selectBoxRef}>
                <div className="selected">
                    <button
                        type="button"
                        className={searchType === 'image' ? 'btn_image' : 'btn_video'}
                    >
                        {searchType === 'image' ? '이미지' : '동영상'}
                    </button>
                </div>
                <ul className="select-options" style={{ display: 'none' }}>
                    <li><button type="button" data-value="image" className={`btn_image${searchType === 'image' ? ' on' : ' '}`}>이미지</button></li>
                    <li><button type="button" data-value="video" className={`btn_video${searchType === 'image' ? ' ' : ' on'}`}>동영상</button></li>
                </ul>

                <select name="searchType" value={searchType} onChange={this.props.handleTypeSearch} className="blind">
                    <option value="image" selected={searchType === 'image'}>이미지</option>
                    <option value="video" selected={searchType === 'video'}>동영상</option>
                </select>
            </div>
        );
    }
}

class ContentSearch extends Component {
    render() {
        const { word,handleChange,handleClick,handleKeyPress, handleTypeSearch, searchType } = this.props;
        return (
            <div className="categori_search">
                {/* 검색아이콘 클릭시 cate_search 에 active 클래스 추가 */}
                <div className="cate_search active">
                    {/* <select name="searchType" onChange={handleTypeSearch} style={{width:'100px'}}>
                        <option value="image" selected={searchType === 'image'}>이미지</option>
                        <option value="video" selected={searchType === 'video'}>동영상</option>
                    </select> */}
                    <UiSelectBox 
                        handleTypeSearch={handleTypeSearch} 
                        searchType={searchType} 
                    />
                    <span className="searching_input">
                        <input
                            type="search"
                            name="word"
                            id={searchType}
                            value={word}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder={searchType === 'image' ? '이미지 검색' : '동영상 검색'} />
                    </span>
                    <button
                        type="button"
                        onClick={handleClick}
                        className="cate_icon">
                        <span className="blind">
                            게시물 검색
                        </span>
                    </button>
                </div>
            </div>
        );
    }
}

export default ContentSearch;
