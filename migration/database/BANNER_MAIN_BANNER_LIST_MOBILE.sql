USE [vivasam_mobile]
GO

/****** Object:  StoredProcedure [dbo].[BANNER_MAIN_BANNER_LIST_MOBILE]    Script Date: 2019-01-08 오전 8:59:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		root
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BANNER_MAIN_BANNER_LIST_MOBILE]
	@pageNo	int = 1
	,@pageSize int = 10
	,@bannerType char(1) = 'L'
	,@USEYN		char(1) = 'N'
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
	SET NOCOUNT ON;
	
--  BANNER_MAIN_BANNER_LIST_MOBILE	1,10,'T','N'	
--  BANNER_MAIN_BANNER_LIST_MOBILE	1,10,'T','Y'
	
	declare @total int
	
	declare @temp table
	(
		num int primary key identity(1,1)
		,banner_id int
	)	
	
	IF @BANNERTYPE IN ('J') BEGIN	
		-- 메인 띠배너		
		--	BANNER_MAIN_BANNER_LIST_MOBILE 	1,10,'J','N'	
			IF  @USEYN = 'Y'  BEGIN

				SELECT
					0 as totCount
					,BANNER_ID as bannerId
					,TITLE AS bannerTitle
					
					,LINK_TYPE as linkType
					,URL as url
					,USE_YN as useYn
					,ADM_ID as admId
					
					,isnull(convert(varchar(10),OPEN_DATE,121),'-') as openDate
					,isnull(convert(varchar(10),CLOSE_DATE,121),'-') as closeDate		
					,REG_DTTM as regDate        
				FROM
					[dbo].MAIN_BANNER_LINE_INFO_MOBILE
				WHERE USE_YN = 'Y'			
				
			  
			
			END ELSE BEGIN
				
			  INSERT @TEMP (BANNER_ID)
			  SELECT BANNER_ID FROM DBO.MAIN_BANNER_LINE_INFO_MOBILE 
			  ORDER BY BANNER_ID DESC

			  select @total = COUNT(1) from @temp

			   SELECT
					@total as totCount
					,a.BANNER_ID as bannerId
					,TITLE AS bannerTitle
					
					,LINK_TYPE as linkType
					,URL as url
					,USE_YN as useYn
					,ADM_ID as admId
					
					,isnull(convert(varchar(10),OPEN_DATE,121),'-') as openDate
					,isnull(convert(varchar(10),CLOSE_DATE,121),'-') as closeDate		
					
					
					
					,REG_DTTM as regDate        
				FROM
					[dbo].MAIN_BANNER_LINE_INFO_MOBILE AS A
				JOIN @temp AS B ON a.BANNER_ID = b.banner_id
				WHERE 1=1
				and num Between  (@pageNo-1) * @pageSize + 1  AND @pageNo * @pageSize
				ORDER BY num asc

			END
		--종료
		RETURN
	END
	

	
--	BANNER_MAIN_BANNER_LIST_MOBILE 	1,10,'L','Y'
	
	if (@USEYN='Y') begin
	
		IF @bannerType IN ('L','T') BEGIN
		--top 5
		
			SELECT  --top 5
				BANNER_ID as bannerId
				,TITLE AS bannerTitle
				,END_DTTM as endDttm
				,IMAGE_CDN_YN as imageCdnYn
				,IMAGE_PATH as imagePath
				,IMAGE_NAME as imageName
				,ORDER_NO as orderNo
				,LINK_TYPE as linkType
				,URL as url
				,USE_YN as useYn
				,ADM_ID as admId
				,convert(varchar(10),OPEN_DATE,121) as openDate
				,convert(varchar(10),END_DTTM,121) as closeDate
				,REG_DTTM as regDate        
				,OPEN_TITLE as openTitle
				,LCOLOR as lColor
				,RCOLOR as rColor
			FROM
				[dbo].MAIN_BANNER_INFO_MOBILE
			WHERE
				BANNER_TYPE =  @bannerType
				AND USE_YN = 'Y'  AND (END_DTTM IS NULL OR END_DTTM >= getdate())
			ORDER BY
				ORDER_NO
				
		END ELSE IF @bannerType IN ('R','P') BEGIN
		-- top 3
			SELECT  top 3
				BANNER_ID as bannerId
				,TITLE AS bannerTitle
				,END_DTTM as endDttm
				,IMAGE_CDN_YN as imageCdnYn
				,IMAGE_PATH as imagePath
				,IMAGE_NAME as imageName
				,ORDER_NO as orderNo
				,LINK_TYPE as linkType
				,URL as url
				,USE_YN as useYn
				,ADM_ID as admId
				,convert(varchar(10),OPEN_DATE,121) as openDate
				,convert(varchar(10),END_DTTM,121) as closeDate
				,REG_DTTM as regDate        
			FROM
				[dbo].MAIN_BANNER_INFO_MOBILE
			WHERE
				BANNER_TYPE = @bannerType
				AND USE_YN = 'Y'   AND (END_DTTM IS NULL OR END_DTTM >= getdate())
			ORDER BY
				ORDER_NO
		END ELSE IF @bannerType IN ('M','O','C','S','N') BEGIN
		-- top 1
			SELECT  top 1
				BANNER_ID as bannerId
				,TITLE AS bannerTitle
				,END_DTTM as endDttm
				,IMAGE_CDN_YN as imageCdnYn
				,IMAGE_PATH as imagePath
				,IMAGE_NAME as imageName
				,ORDER_NO as orderNo
				,LINK_TYPE as linkType
				,URL as url
				,USE_YN as useYn
				,ADM_ID as admId
				,convert(varchar(10),OPEN_DATE,121) as openDate
				,convert(varchar(10),END_DTTM,121) as closeDate
				,REG_DTTM as regDate        
			FROM
				[dbo].MAIN_BANNER_INFO_MOBILE
			WHERE
				BANNER_TYPE = @bannerType
				AND USE_YN = 'Y'   AND (END_DTTM IS NULL OR END_DTTM >= getdate())
			ORDER BY
				ORDER_NO
		END ELSE BEGIN
		
			SELECT  
				BANNER_ID as bannerId
				,TITLE AS bannerTitle
				,END_DTTM as endDttm
				,IMAGE_CDN_YN as imageCdnYn
				,IMAGE_PATH as imagePath
				,IMAGE_NAME as imageName
				,ORDER_NO as orderNo
				,LINK_TYPE as linkType
				,URL as url
				,USE_YN as useYn
				,ADM_ID as admId
				,convert(varchar(10),OPEN_DATE,121) as openDate
				,convert(varchar(10),END_DTTM,121) as closeDate
				,REG_DTTM as regDate        
			FROM
				[dbo].MAIN_BANNER_INFO_MOBILE
			WHERE
				BANNER_TYPE = @bannerType
				AND USE_YN = 'Y'   AND (END_DTTM IS NULL OR END_DTTM >= getdate())
			ORDER BY
				ORDER_NO
		END
	
		RETURN;
	end
	



	
	insert @temp (banner_id)
	select BANNER_ID FROM
        [dbo].MAIN_BANNER_INFO_MOBILE
    WHERE
        BANNER_TYPE = @bannerType
        AND ( USE_YN = 'N'
					or (USE_YN = 'Y' and End_Dttm <= getdate())
	)
    order by  case when isnull(CLOSE_DATE,'') = '' then '1000-12-31' else convert(varchar(10),CLOSE_DATE,121) end desc,BANNER_ID desc
	
	
	
-- [BANNER_MAIN_BANNER_LIST_MOBILE] 1,10,'L','N'

	select @total = COUNT(1) from @temp

   SELECT
		@total as totCount
        ,a.BANNER_ID as bannerId
        ,TITLE AS bannerTitle
        ,END_DTTM as endDttm
        ,IMAGE_CDN_YN as imageCdnYn
        ,IMAGE_PATH as imagePath
        ,IMAGE_NAME as imageName
        ,ORDER_NO as orderNo
        ,LINK_TYPE as linkType
        ,URL as url
        ,USE_YN as useYn
	    ,ADM_ID as admId

		,convert(varchar(10),isnull(OPEN_DATE,''),121) as openDate
		,convert(varchar(10),isnull(CLOSE_DATE,''),121) as closeDate		
		,REG_DTTM as regDate        
    FROM
        [dbo].MAIN_BANNER_INFO_MOBILE AS A
    JOIN @temp AS B ON a.BANNER_ID = b.banner_id
    WHERE 1=1
	and num Between  (@pageNo-1) * @pageSize + 1  AND @pageNo * @pageSize
    ORDER BY
       num asc
/*

select * from MAIN_BANNER_INFO_MOBILE where BANNER_ID =115
select * from MAIN_BANNER_INFO_MOBILE where BANNER_ID =119
select * from MAIN_BANNER_INFO_MOBILE where BANNER_ID =116

BANNER_MAIN_BANNER_LIST 1,100,'L','N'

*/

END
GO

