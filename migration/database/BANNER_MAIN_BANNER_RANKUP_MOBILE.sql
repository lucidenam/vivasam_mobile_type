USE [vivasam_mobile]
GO

/****** Object:  StoredProcedure [dbo].[BANNER_MAIN_BANNER_RANKUP_MOBILE]    Script Date: 2019-01-08 오전 9:00:15 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		root
-- Create date: 2016.09.19
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[BANNER_MAIN_BANNER_RANKUP_MOBILE]
	@rank nvarchar(4000)
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
	SET NOCOUNT ON;

-- BANNER_MAIN_BANNER_RANKUP '0|100|103|109|81|69|79|74'

	UPDATE MAIN_BANNER_INFO_MOBILE
	SET ORDER_NO = A.NUM - 1
	FROM DBO.FN_SPLIT_V2(@rank,'|') AS A
	JOIN MAIN_BANNER_INFO_MOBILE AS B
	ON A.VALUE = B.BANNER_ID
	

	


    SELECT @@ERROR AS code
    
    
    
    
END
GO

