-- =============================================
-- Author:		심원보
-- Create date: 2016-09-06
-- Description:	비비샘 > 이벤트 > 이벤트 참여자 리스트
-- 학교정보 V_SCHOOL_INFO 뷰를 사용하도록 수정(20180914)
-- 학교명 검색 로직에 학교명 직접 입력의 경우 처리(20180914)
-- EXEC SP_EVENT_INFO_MEMBER_APPLY_LIST 1, 50, '184', '', '', 'GB009,GB002', 'member_id'
-- =============================================
CREATE PROCEDURE [dbo].[SP_EVENT_INFO_MEMBER_APPLY_LIST]
@P_PAGE_NO					INT = 1,
@P_PAGE_SIZE				INT = 50,
@P_EVENT_ID					INT,
@P_MEMBER_LEVEL			VARCHAR(10) = NULL,
@P_SCHLVL_CD				VARCHAR(10) = NULL,
@P_MGUBUN_CD				VARCHAR(50) = NULL,
@P_SCHTYPE					VARCHAR(10) = null,
@P_KEYWORD					NVARCHAR(100) = null,
@P_VIA					    NVARCHAR(100) = null
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

DECLARE @TEMPTABLE_DATA TABLE
(
IDX				INT PRIMARY KEY,
MEMBER_ID		VARCHAR(30)
)

DECLARE   @ROW_TOTAL  int --전체 Row 수
DECLARE   @ROW_MAX    nvarchar(10) --조회할 Row 수 중 최대 Row수
DECLARE   @ROW_MIN    nvarchar(10) --조회할 Row수 중 최소 Row수
DECLARE   @PAGE_TOTAL int --전체 페이지 수



INSERT @TEMPTABLE_DATA
SELECT
  ROW_NUMBER() OVER(ORDER BY EJ.EVENT_JOIN_DATE DESC) AS IDX,
  EJ.MEMBER_ID
FROM DBO.EVENT_JOIN AS EJ
       JOIN dbo.MEMBER AS M ON EJ.MEMBER_ID = M.MEMBER_ID
       LEFT JOIN dbo.V_SCHOOL_INFO AS S ON M.SCH_CODE = S.CODE
WHERE 1 = 1
  AND EJ.EVENT_ID = @P_EVENT_ID
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

  AND (

    (
  -- GB001
  ISNULL(@P_MGUBUN_CD, '') != ''
  AND isnull(M.M_GUBUN_CD,'GB001')  in ( select value From dbo.FN_SPLIT_V2(@P_MGUBUN_CD,',')  )

  ) /*회원유형(관심회원,테스트회원)*/

  OR (
  ISNULL(@P_MGUBUN_CD, '') = 'GB001' AND ISNULL(M.M_GUBUN_CD, '') NOT IN ('GB002', 'GB009')

  )
  OR (ISNULL(@P_MGUBUN_CD, '') = '' AND 1 = 1)

  )

  AND (
    (ISNULL(@P_VIA, 'ALL') = 'ALL' AND ISNULL(EJ.VIA, '') IN ('WEB', 'MOBILE', ''))
  OR
    (ISNULL(@P_VIA, 'ALL') = EJ.VIA)
  )

  AND (ISNULL(@P_KEYWORD, '') <> ''
  AND ((@P_SCHTYPE = 'MEMBER_ID' AND M.MEMBER_ID LIKE '%' + @P_KEYWORD + '%')
  OR (@P_SCHTYPE = 'NAME' AND M.NAME LIKE '%' + @P_KEYWORD + '%')
  OR (@P_SCHTYPE = 'SCH_NAME' AND M.SCH_NAME LIKE '%' + @P_KEYWORD + '%'))
  OR (ISNULL(@P_KEYWORD, '') = '' AND 1 = 1))


SET @ROW_TOTAL = @@ROWCOUNT

    -- 총페이지 수
    IF @ROW_TOTAL % @P_PAGE_SIZE = 0
SET @PAGE_TOTAL = @ROW_TOTAL/@P_PAGE_SIZE
    ELSE
SET @PAGE_TOTAL = (@ROW_TOTAL/@P_PAGE_SIZE) + 1

SET @ROW_MIN = (@P_PAGE_NO-1) * @P_PAGE_SIZE + 1
SET @ROW_MAX = @P_PAGE_NO * @P_PAGE_SIZE ;

SELECT
  0 AS idx,
  CAST(@ROW_TOTAL as VARCHAR) AS member_id,
  CAST(@PAGE_TOTAL as NVARCHAR) AS name,
  CAST(@P_PAGE_SIZE as NVARCHAR) AS sch_name,
  NULL AS schArea1Nm,
  NULL AS schArea2Nm,
  NULL AS schLvlNm,
  NULL AS my_grade,
  NULL AS main_subject_name,
  NULL AS email,
  NULL AS age,
  NULL AS birth,
  NULL AS cellphone,
  NULL AS reg_date,
  NULL AS edit_date,
  NULL AS event_join_date,
  NULL AS zip,
  NULL AS addr1,
  NULL AS addr2,
  NULL AS event_answer_1,
  NULL AS event_answer_2,
  NULL AS visang_textbook_yn,
  NULL AS memberLvlNm,
  NULL AS memberTypeNm,
  NULL AS attenionResaon,
  NULL AS validDate,
  NULL AS validMtd,
  NULL AS visangTextbookYn,
  NULL AS smsYn,
  NULL AS mailingYn,
  NULL AS telYn,
  NULL AS expiryTermNnum,
  NULL AS via
UNION ALL
SELECT
  T.IDX
    , EJ.MEMBER_ID								AS member_id
    , M.NAME							        AS name
    , dbo.FN_SCHOOL_NM(M.SCH_CODE)				AS sch_name
    , SA.CODENAME								AS schArea1Nm
    , SA2.CODENAME								AS schArea2Nm
    , dbo.FN_SCHOOL_LVL_NM(S.TAB)				AS schLvlNm
    , M.MY_GRADE                                AS my_grade
    , ( SELECT NAME
        FROM VS_CODE
        WHERE CODE = M.MAIN_SUBJECT
  )											AS main_subject_name
    , M.EMAIL                                   AS email
    , dbo.FN_AGE_FROM_BIRTH(M.BIRTH)			AS age
    , M.BIRTH                                   AS birth
    , M.CELLPHONE                               AS cellphone
    , M.REG_DATE                                AS reg_date
    , CAST(M.UPDATE_DTTM AS DATE)               AS edit_date
    , CAST(EJ.EVENT_JOIN_DATE AS DATE)          AS event_join_date
    , M.ZIP                                     AS zip
    , M.ADDR1                                   AS addr1
    , M.ADDR2                                   AS addr2
    , ( SELECT TOP 1 EJA.EVENT_ANSWER_DESC
        FROM dbo.EVENT_JOIN_ANSWER AS EJA
        WHERE EJA.EVENT_ID = EJ.EVENT_ID
          AND EJA.MEMBER_ID = EJ.MEMBER_ID
        ORDER BY REG_DTTM ASC
  )											AS event_answer_1
    , ( SELECT TOP 1 EJA.EVENT_ANSWER_DESC
        FROM dbo.EVENT_JOIN_ANSWER AS EJA
        WHERE EJA.EVENT_ID = EJ.EVENT_ID
          AND EJA.MEMBER_ID = EJ.MEMBER_ID
        ORDER BY REG_DTTM DESC
  )											AS event_answer_2
    , M.VISANG_TEXTBOOK_YN						AS visang_textbook_yn
    , VC1.NAME									AS memberLvlNm
    , VC2.NAME									AS memberTypeNm
    , M.ATTENTION_REASON						AS attenionResaon
    , CAST(M.VAL_DATE AS DATE)					AS validDate
    , CASE WHEN M.VALID_YN = 'Y' THEN
             (CASE WHEN M.EPKI_CERTDN IS NOT NULL AND M.EPKI_CERTDN <> '' THEN 'EPKI/GPKI' ELSE '서류인증' END)
           ELSE '' END AS validMtd
    ,M.VISANG_TEXTBOOK_YN	AS visang_textbook_yn
    ,M.SMS_YN AS smsYn
    ,M.MAILING_YN AS mailingYn
    ,M.TEL_YN AS telYn
    ,M.EXPIRY_TERM_NUM AS expiryTermNnum
    ,EJ.VIA AS via
FROM @TEMPTABLE_DATA AS T
       JOIN dbo.EVENT_JOIN AS EJ ON T.MEMBER_ID = EJ.MEMBER_ID
       JOIN dbo.MEMBER AS M ON EJ.MEMBER_ID = M.MEMBER_ID
       LEFT JOIN dbo.V_SCHOOL_INFO AS S ON M.SCH_CODE = S.CODE
       LEFT JOIN dbo.SCHOOL_AREA AS SA ON S.FKCODE = SA.FKCODE AND SA.CODEFLAG = 'B'
       LEFT JOIN dbo.SCHOOL_AREA AS SA2 ON S.PKCODE = SA2.PKCODE AND S.FKCODE = SA2.FKCODE AND SA2.CODEFLAG = 'S'
       LEFT JOIN dbo.VS_CODE AS VC1 ON VC1.CODE = M.M_LEVEL
       LEFT JOIN dbo.VS_CODE AS VC2 ON VC2.CODE = M.M_GUBUN_CD
WHERE EJ.EVENT_ID = @P_EVENT_ID
  AND T.IDX BETWEEN (@P_PAGE_NO-1) * @P_PAGE_SIZE + 1 AND @P_PAGE_NO * @P_PAGE_SIZE

END



go

