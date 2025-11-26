USE [vivasam_mobile]
GO

/****** Object:  StoredProcedure [dbo].[SP_SURVEY_INFO_LIST]    Script Date: 2019-01-09 오후 4:44:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		심원보
-- Create date: 2012-11-28
-- Description:	비바샘 > 비바샘터 > 설문 리스트
-- EXEC SP_SURVEY_INFO_LIST 1, 5, '', '', '', '', ''
-- EXEC SP_SURVEY_INFO_LIST 1, 5, '', '', '', '', 'Y'
-- =============================================
ALTER PROCEDURE [dbo].[SP_SURVEY_INFO_LIST]
	@P_PAGE_NO			INT = 1,
	@P_PAGE_SIZE		INT = 10,
	@P_SURVEY_YEAR		VARCHAR(5) = null,
	@P_SURVEY_MONTH		VARCHAR(2) = null,
	@P_KEYWORD			NVARCHAR(100) = null,
	@P_USE_YN			VARCHAR(1) = null,
	@P_END_YN			VARCHAR(1) = null /*Y : 종료된 설문만 조회*/
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;  
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
    DECLARE @TBL_IDX TABLE (ID int identity(1,1) PRIMARY KEY, SURVEY_ID INT, SURVEY_REG_DTTM DATETIME)  
  
	DECLARE   @ROW_TOTAL  int --전체 Row 수    
	DECLARE   @ROW_MAX    nvarchar(10) --조회할 Row 수 중 최대 Row수     
	DECLARE   @ROW_MIN    nvarchar(10) --조회할 Row수 중 최소 Row수    
	DECLARE   @PAGE_TOTAL int --전체 페이지 수
	
	-- 조회 조건에 따른 컨텐츠만 임시테이블에 저장하기 위한 동적쿼리 작성
	INSERT INTO @TBL_IDX (SURVEY_ID, SURVEY_REG_DTTM) 
	SELECT TMP.SURVEY_ID, TMP.SURVEY_REG_DTTM 
	FROM 
	( 
		SELECT 
			S.SURVEY_ID
			,S.SURVEY_REG_DTTM 
		FROM dbo.SURVEY_INFO AS S 
		WHERE 1 = 1	
			AND ((ISNULL(@P_USE_YN, '') = 'Y'
					AND (S.SURVEY_USE_YN = @P_USE_YN 
					AND ((ISNULL(@P_END_YN, '') != 'Y' 
						AND S.SURVEY_START_DT <= CONVERT(VARCHAR(10), GETDATE(), 121) + ' 00:00:00' 
							AND S.SURVEY_END_DT >= CONVERT(VARCHAR(10), GETDATE(), 121) + ' 00:00:00')
						OR (ISNULL(@P_END_YN, '') = 'Y' AND S.SURVEY_END_DT < CONVERT(VARCHAR(10), GETDATE(), 121) + ' 00:00:00'))))
				OR (ISNULL(@P_USE_YN, '') = 'N' AND S.SURVEY_USE_YN = @P_USE_YN)
				OR (ISNULL(@P_USE_YN, '') = '' AND 1 = 1))
			--AND ((ISNULL(@P_END_YN, '') = 'Y' AND S.SURVEY_END_DT < CONVERT(VARCHAR(10), GETDATE(), 121) + ' 00:00:00')
			--	OR (ISNULL(@P_END_YN, '') = '' AND 1 = 1))	
			AND ((ISNULL(@P_SURVEY_YEAR, '') <> '' AND S.SURVEY_YEAR = @P_SURVEY_YEAR)
				OR (ISNULL(@P_SURVEY_YEAR, '') = '' AND 1 = 1))
			AND ((ISNULL(@P_SURVEY_MONTH, '') <> '' AND S.SURVEY_MONTH = @P_SURVEY_MONTH)
				OR (ISNULL(@P_SURVEY_MONTH, '') = '' AND 1 = 1))
			AND ((ISNULL(@P_KEYWORD, '') <> '' AND S.SUBJECT LIKE '%' + @P_KEYWORD + '%')
				OR (ISNULL(@P_KEYWORD, '') = '' AND 1 = 1))
	) AS TMP
	ORDER BY TMP.SURVEY_REG_DTTM DESC
	
	SET @ROW_TOTAL= @@ROWCOUNT

	-- 총페이지 수    
	IF @ROW_TOTAL % @P_PAGE_SIZE = 0    
		SET @PAGE_TOTAL = @ROW_TOTAL/@P_PAGE_SIZE
	ELSE    
		SET @PAGE_TOTAL = (@ROW_TOTAL/@P_PAGE_SIZE) + 1       

	SET @ROW_MIN = (@P_PAGE_NO-1) * @P_PAGE_SIZE + 1    
	SET @ROW_MAX = @P_PAGE_NO * @P_PAGE_SIZE 
	
	-- 결과 반환시 총 건수, 해당 페이지에 조회된 레코드 수를 첫번째 레코드에 반환하기 위한 처리
	SELECT 
		ID AS idx 
		,surveyId 
		,subject 
		,surveyYear 
		,surveyMonth 
		,surveyStartDt 
		,surveyEndDt 
		,surveyTypeCd
		,surveyDuplSelCnt
		,surveyUseYn
		,surveyRegDt
		,surveyApplyCnt
		,surveyApplyWebCnt
		,surveyApplyMobCnt
		,surveyType
	FROM ( 
		( 
		SELECT 0 AS ID, 
			CAST(@ROW_TOTAL as NVARCHAR) AS surveyId, 
			CAST(@PAGE_TOTAL as NVARCHAR)AS subject, 
			NULL AS surveyYear, 
			NULL AS surveyMonth,
			NULL AS surveyStartDt, 
			NULL AS surveyEndDt, 
			NULL AS surveyTypeCd, 
			NULL AS surveyDuplSelCnt,
			NULL AS surveyUseYn,
			NULL AS surveyRegDt,
			NULL AS surveyApplyCnt,
			NULL AS surveyApplyWebCnt,
			NULL AS surveyApplyMobCnt,
			NULL AS surveyType
		)   
		UNION ALL 
		( 
		-- 페이징 처리된 컨텐츠 반환 
		SELECT TMCI.ID, 
				CAST(TMCI.SURVEY_ID AS VARCHAR(20)) AS surveyId, 
				S.SUBJECT AS subject,
				S.SURVEY_YEAR AS surveyYear,
				S.SURVEY_MONTH AS surveyMonth,
				CONVERT(VARCHAR(10), S.SURVEY_START_DT, 121) AS surveyStartDt,
				CONVERT(VARCHAR(10), S.SURVEY_END_DT, 121) AS surveyEndDt,
				S.SURVEY_TYPE_CD AS surveyTypeCd,
				S.SURVEY_DUPL_SEL_CNT AS surveyDuplSelCnt,
				S.SURVEY_USE_YN AS surveyUseYn,
				CONVERT(VARCHAR(10), S.SURVEY_REG_DTTM, 121) AS surveyRegDt,
				(SELECT COUNT(1) FROM dbo.SURVEY_APPLY_INFO WHERE SURVEY_ID = S.SURVEY_ID) AS surveyApplyCnt,
				(SELECT COUNT(1) FROM dbo.SURVEY_APPLY_INFO WHERE SURVEY_ID = S.SURVEY_ID AND VIA = 'WEB') AS surveyApplyWebCnt,
				(SELECT COUNT(1) FROM dbo.SURVEY_APPLY_INFO WHERE SURVEY_ID = S.SURVEY_ID AND VIA = 'MOBILE') AS surveyApplyMobCnt,
				S.SURVEY_TYPE AS surveyType
		FROM @TBL_IDX as TMCI 
		LEFT OUTER JOIN dbo.SURVEY_INFO S ON TMCI.SURVEY_ID = S.SURVEY_ID		
		WHERE TMCI.ID >=  @ROW_MIN AND TMCI.ID <=  @ROW_MAX
		) 
	) AS RSLT 
	ORDER BY RSLT.ID

END
GO

