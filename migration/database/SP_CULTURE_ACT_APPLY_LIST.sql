-- =============================================
-- Author:		이윤호
-- Create date: 2016-12-23(수정)
-- Description:	교사문화프로그램 신청하기 대상 회원정보 조회
-- EXEC SP_CULTURE_ACT_APPLY_LIST '1', '10', '38'
-- =============================================
CREATE PROCEDURE [dbo].[SP_CULTURE_ACT_APPLY_LIST]
@P_PAGE_NO			INT = 1,
@P_PAGE_SIZE		INT = 10,
@P_CULTURE_ACT_ID	INT = null,
@P_MEMBER_LEVEL		VARCHAR(10) = NULL,
@P_SCHLVL_CD		VARCHAR(10) = NULL,
@P_MGUBUN_CD		VARCHAR(10) = NULL,
@P_SCHTYPE			VARCHAR(10) = null,
@P_KEYWORD			NVARCHAR(100) = null,
@P_VIA					    NVARCHAR(100) = null
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

DECLARE @TEMP TABLE (
ID int identity(1,1),
MEMBER_ID VARCHAR(30),
APPLY_DTTM DATETIME,
WITH_PEOPLE_NUM VARCHAR(2),
QUESTION_CTNT NVARCHAR(1000),
VIA VARCHAR(20),
PRIMARY KEY (MEMBER_ID)
)

DECLARE   @ROW_TOTAL  int --전체 Row 수
DECLARE   @ROW_MAX    nvarchar(10) --조회할 Row 수 중 최대 Row수
DECLARE   @ROW_MIN    nvarchar(10) --조회할 Row수 중 최소 Row수
DECLARE   @PAGE_TOTAL int --전체 페이지 수
DECLARE   @SUMMARY  nvarchar(200) --전체 페이지 수

INSERT INTO @TEMP (MEMBER_ID, APPLY_DTTM, WITH_PEOPLE_NUM, QUESTION_CTNT, VIA)
SELECT
  CAAI.MEMBER_ID, CAAI.APPLY_DTTM, WITH_PEOPLE_NUM, QUESTION_CTNT, CAAI.VIA
FROM dbo.CULTURE_ACT_INFO AS CAI
       JOIN dbo.CULTURE_ACT_APPLY_INFO AS CAAI ON CAI.CULTURE_ACT_ID = CAAI.CULTURE_ACT_ID
       LEFT JOIN dbo.MEMBER AS M ON CAAI.MEMBER_ID = M.MEMBER_ID
       LEFT JOIN dbo.V_SCHOOL_INFO AS S ON M.SCH_CODE = S.CODE
WHERE 1 = 1
  AND CAI.CULTURE_ACT_ID = @P_CULTURE_ACT_ID
  AND M.[STATE] != 'D' --탈퇴 회원 제외
  AND ((CHARINDEX('Y', @P_MEMBER_LEVEL) > 0 AND M.M_LEVEL = 'AU300') /*정회원*/
  OR (CHARINDEX('N', @P_MEMBER_LEVEL) > 0 AND M.M_LEVEL = 'AU400') /*준회원*/
  OR (ISNULL(@P_MEMBER_LEVEL, '') = '' AND 1 = 1))
  AND ((CHARINDEX('E', @P_SCHLVL_CD) > 0 AND S.TAB = 'E') /*학교급*/
  OR (CHARINDEX('M', @P_SCHLVL_CD) > 0 AND S.TAB = 'M')
  OR (CHARINDEX('H', @P_SCHLVL_CD) > 0 AND S.TAB = 'H')
  OR (CHARINDEX('S', @P_SCHLVL_CD) > 0 AND S.TAB = 'S')
  OR (CHARINDEX('9', @P_SCHLVL_CD) > 0
  AND (ISNULL(M.SCH_CODE, '') = ''
  OR (ISNULL(M.SCH_CODE, '') != '' AND S.CODE IS NULL))) /*미설정*/
  OR ((@P_SCHLVL_CD = 'ALL' OR ISNULL(@P_SCHLVL_CD, '') = '') AND 1 = 1)
  )
  AND ((ISNULL(@P_MGUBUN_CD, '') != '' AND M.M_GUBUN_CD = @P_MGUBUN_CD) /*회원유형(관심회원,테스트회원)*/
  OR (ISNULL(@P_MGUBUN_CD, '') = 'GB001' AND ISNULL(M.M_GUBUN_CD, '') NOT IN ('GB002', 'GB009')) /*일반회원*/
  OR (ISNULL(@P_MGUBUN_CD, '') = '' AND 1 = 1)
  )
  AND (
    (ISNULL(@P_VIA, 'ALL') = 'ALL' AND ISNULL(CAAI.VIA, '') IN ('WEB', 'MOBILE', ''))
  OR
    (ISNULL(@P_VIA, 'ALL') = CAAI.VIA)
  )
  AND ((ISNULL(@P_KEYWORD, '') <> ''
  AND ((@P_SCHTYPE = 'MEMBER_ID' AND M.MEMBER_ID LIKE '%' + @P_KEYWORD + '%')
  OR (@P_SCHTYPE = 'NAME' AND M.NAME LIKE '%' + @P_KEYWORD + '%')
  OR (@P_SCHTYPE = 'SCH_NAME' AND M.SCH_NAME LIKE '%' + @P_KEYWORD + '%')))
  OR (ISNULL(@P_KEYWORD, '') = '' AND 1 = 1))



ORDER BY CAAI.APPLY_DTTM DESC

SET @ROW_TOTAL= @@ROWCOUNT

SELECT @SUMMARY = TITLE FROM CULTURE_ACT_INFO WHERE CULTURE_ACT_ID = @P_CULTURE_ACT_ID

                                                  -- 총페이지 수
  IF @ROW_TOTAL % @P_PAGE_SIZE = 0
SET @PAGE_TOTAL = @ROW_TOTAL/@P_PAGE_SIZE
    ELSE
SET @PAGE_TOTAL = (@ROW_TOTAL/@P_PAGE_SIZE) + 1

SET @ROW_MIN = (@P_PAGE_NO-1) * @P_PAGE_SIZE + 1
SET @ROW_MAX = @P_PAGE_NO * @P_PAGE_SIZE

-- 결과 반환시 총 건수, 해당 페이지에 조회된 레코드 수를 첫번째 레코드에 반환하기 위한 처리
SELECT
  ID AS idx,
  member_id,
  name,
  schLvlNm,
  schName,
  mainSubjectNm,
  visangTbYn,
  email,
  cellPhone,
  memberRegDt,
  fkareacode_name,
  fkbranchcode_name,
  addr,
  addr1,
  addr2,
  validState,
  applyDt,
  applyPeopleCnt,
  questionCtnt,
  mygrade,
  mGubunCd,
  attentionReason,
  mlevel,
  via

FROM (
       (
         SELECT 0 AS ID,
                CAST(@ROW_TOTAL as NVARCHAR) AS member_id,
                CAST(@PAGE_TOTAL as NVARCHAR) AS name,
                NULL AS schLvlNm,
                NULL AS schName,
                @SUMMARY AS mainSubjectNm,
                NULL AS visangTbYn,
                NULL AS email,
                NULL AS cellPhone,
                NULL AS memberRegDt,
                NULL AS fkareacode_name,
                NULL AS fkbranchcode_name,
                NULL AS addr,
                NULL AS addr1,
                NULL AS addr2,
                NULL AS validState,
                NULL AS applyDt,
                NULL AS applyPeopleCnt,
                NULL AS questionCtnt,
                NULL AS mygrade,
                NULL AS mGubunCd,
                NULL AS attentionReason,
                NULL AS mlevel,
                NULL AS via
       )
       UNION ALL
       (
         -- 페이징 처리된 컨텐츠 반환
         SELECT TMCI.ID,
                M.MEMBER_ID,
                M.NAME,
                CASE S.TAB WHEN 'E' THEN '초등' WHEN 'M' THEN '중등' WHEN 'H' THEN '고등' ELSE '' END,
                dbo.FN_SCHOOL_NM(M.SCH_CODE) AS schName,
                VC.NAME + CASE WHEN ISNULL(VC2.NAME, '') <> '' THEN ', ' + VC2.NAME ELSE '' END AS MAIN_SUBJECT,
                ISNULL(M.VISANG_TEXTBOOK_YN, 'N'),
                M.EMAIL,
                M.CELLPHONE,
                M.REG_DATE,
                ( SELECT CODENAME
                  FROM dbo.SCHOOL_AREA
                  WHERE PKCODE = S.FKCODE AND CODEFLAG = 'B'
                ) AS fkareacode_name,
                ( SELECT CODENAME
                  FROM dbo.SCHOOL_AREA
                  WHERE PKCODE = S.PKCODE AND CODEFLAG = 'S'
                ) AS fkbranchcode_name,
                M.ADDR1 + ' ' + M.ADDR2 AS ADDR,
                M.ADDR1,
                M.ADDR2,
                CASE WHEN M.VALID_YN = 'Y'
                  AND ((M.EPKI_CERTDN IS NOT NULL AND M.EPKI_CERTDN <> '')
                    OR ((M.EPKI_CERTDN IS NULL OR M.EPKI_CERTDN = '')
                      AND CONVERT(VARCHAR(10), M.VAL_END_DATE, 121) >= CONVERT(VARCHAR(10), GETDATE(), 121))
                            ) THEN '인증' +
                                   (CASE WHEN M.EPKI_CERTDN IS NULL OR M.EPKI_CERTDN = '' THEN '(' + CAST(M.VAL_END_DATE AS VARCHAR(10)) + ')' ELSE '' END)
                     ELSE '미인증' END AS VALID_STATE,
                CONVERT(VARCHAR(10), TMCI.APPLY_DTTM, 121) AS APPLY_DT,
                ISNULL(TMCI.WITH_PEOPLE_NUM, 0) AS APPLY_PEOPLE_CNT,
                TMCI.QUESTION_CTNT,
                M.MY_GRADE,
                M.M_GUBUN_CD,
                M.ATTENTION_REASON,
                M.M_LEVEL,
                TMCI.VIA
         FROM @TEMP as TMCI
                LEFT JOIN dbo.MEMBER AS M ON TMCI.MEMBER_ID = M.MEMBER_ID
                LEFT JOIN dbo.V_SCHOOL_INFO AS S ON M.SCH_CODE = S.CODE AND S.USE_YN = 'Y'
                LEFT JOIN dbo.VS_CODE AS VC ON M.MAIN_SUBJECT = VC.CODE
                LEFT JOIN dbo.VS_CODE AS VC2 ON M.SECOND_SUBJECT = VC2.CODE
         WHERE TMCI.ID >=  @ROW_MIN AND TMCI.ID <= @ROW_MAX
       )
     ) AS RSLT
ORDER BY RSLT.ID

END


go

