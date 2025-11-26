import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
      <div className="nodata_page nodata_404">
          <div className="nodata_content_404">
              <p>
                  현재 페이지를 표시할 수 없습니다.
              </p>
              <button type="button" className="btn_refresh">
                  <Link to="/" >
                      홈으로
                  </Link>
              </button>
          </div>
      </div>
  );
};

export default NotFoundPage;
