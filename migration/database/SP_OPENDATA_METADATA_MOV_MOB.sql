CREATE PROCEDURE [dbo].[SP_OPENDATA_METADATA_MOV_MOB]
  @pageno	int = 1
  ,@pagesize	int = 20
  ,@ctype	varchar(10) = ''
  ,@code1	varchar(50) = ''
  ,@code2	varchar(50) = ''
  ,@code3	varchar(50) = ''
AS
BEGIN
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
  SET NOCOUNT ON;

  if @code1 = @code2 begin
    set @code2 = ''
  end

  set @code3 = REPLACE(@code3,' ','')
  set @code3 = REPLACE(@code3,',','')

  declare @temp table
    (
    num int primary key identity(1,1)
    ,id		varchar(50)
    ,gubun	varchar(50)
    ,edu	varchar(50)
    )


  declare @temp2 table
    (
    num int primary key identity(1,1)
    ,id		varchar(50)
    ,gubun	varchar(50)
    ,edu	varchar(50)
    )


  declare @totalcnt int

  if @code1 = '' and @code2 = '' and @code3 = '' begin

    insert @temp (id,gubun,edu)
    select a.CONTENT_ID,a.CONTENT_GUBUN,b.EDUCOURSE_ID from MASTER_CONTENT AS A
                                                              JOIN MASTER_CONTENT_EDUCOURSE as b
                                                                   on a.CONTENT_ID =  b.CONTENT_ID and a.CONTENT_GUBUN = b.CONTENT_GUBUN
                                                              join CODELIST as C
                                                                   on b.TYPE_2 = c.CODELIST_ID and c.USE_YN = 'Y'
                                                            --WHERE b.TYPE_1 like '261%'  AND  a.USE_YN = 'Y'
    WHERE b.TYPE_1 != '' and b.TYPE_2 != '' and LEFT(b.TYPE_1,3) = '304' and  a.USE_YN = 'Y' and FILE_TYPE = 'FT201'
    order by REG_DTTM DESC


  end else if @code3 = '' begin


    insert @temp (id,gubun,edu)
    select a.CONTENT_ID,a.CONTENT_GUBUN,b.EDUCOURSE_ID from MASTER_CONTENT AS A
                                                              JOIN MASTER_CONTENT_EDUCOURSE as b
                                                                   on a.CONTENT_ID =  b.CONTENT_ID and a.CONTENT_GUBUN = b.CONTENT_GUBUN
                                                            --WHERE b.TYPE_1 like '261%'  AND  a.USE_YN = 'Y'
    WHERE b.TYPE_1 =@code1  and isnull(b.TYPE_2,'') =@code2 AND  a.USE_YN = 'Y' and FILE_TYPE = 'FT201'
    order by REG_DTTM DESC

  end else begin

    --검색.

    --열린자료 - 라이브러리
    insert @temp (id,gubun,edu)
    select id , gubun ,a.educourseid From SearhFullText AS A
                                            JOIN MASTER_CONTENT_EDUCOURSE AS b
                                                 on a.id = b.CONTENT_ID and a.gubun = b.CONTENT_GUBUN and a.educourseid = b.EDUCOURSE_ID
                                            JOIN MASTER_CONTENT AS C
                                                 on a.id = c.CONTENT_ID and a.gubun = c.CONTENT_GUBUN
    WHERE CONTAINS (searchtext, @code3) and c.USE_YN = 'Y'
      AND FILE_TYPE='FT201'

    insert @temp  (id,gubun,edu)
    select k.CONTENT_ID,k.CONTENT_GUBUN, b.EDUCOURSE_ID From keyword AS k
                                                               join MASTER_CONTENT_EDUCOURSE as b
                                                                    on b.CONTENT_GUBUN = k.CONTENT_GUBUN and b.CONTENT_ID = k.CONTENT_ID
                                                               join MASTER_CONTENT as c
                                                                    on c.CONTENT_GUBUN = k.CONTENT_GUBUN and c.CONTENT_ID = k.CONTENT_ID
    where k.USE_YN = 'Y'  and c.USE_YN = 'Y'
      and  k.SEARCH_NAME like  @code3 + '%'
      and FILE_TYPE = 'FT201'


  end


  insert @temp2 (id,gubun,edu)
  select id,gubun,MAX(edu) From @temp
  group by id,gubun

  declare @ex1 int
  declare @ex2 int
  declare @ex3 int
  /*
    select @ex1 = COUNT(1) from MASTER_CONTENT AS A
    JOIN MASTER_CONTENT_EDUCOURSE as b
    on a.CONTENT_ID =  b.CONTENT_ID and a.CONTENT_GUBUN = b.CONTENT_GUBUN
    WHERE b.TYPE_1 like '261%'  AND  a.USE_YN = 'Y'

    select @ex2 = COUNT(1) from MASTER_CONTENT AS A
    JOIN MASTER_CONTENT_EDUCOURSE as b
    on a.CONTENT_ID =  b.CONTENT_ID and a.CONTENT_GUBUN = b.CONTENT_GUBUN
    WHERE b.TYPE_1 = @code1  AND  a.USE_YN = 'Y'


    select @ex3 = COUNT(1) from MASTER_CONTENT AS A
    JOIN MASTER_CONTENT_EDUCOURSE as b
    on a.CONTENT_ID =  b.CONTENT_ID and a.CONTENT_GUBUN = b.CONTENT_GUBUN
    WHERE b.TYPE_2 = @code2  AND  a.USE_YN = 'Y'

  */

  select @totalcnt = COUNT(1) From @temp2

  select
    /*
    @ex1 as ex1
    ,@ex2 as ex2
    ,@ex3 as ex3
    ,'전체' as ex1name
    ,(select top 1 code_name from CODELIST where CODELIST_ID = @code1) as ex2name
    ,(select top 1 code_name from CODELIST where CODELIST_ID = @code2) as ex3name
    ,
    */
    @totalcnt as totalCnt
      ,a.CONTENT_ID as contentId
      ,a.CONTENT_GUBUN as contentGubun
      ,b.EDUCOURSE_ID as educourseId

      ,b.TYPE_1 as type1
      ,b.TYPE_2 as type2

      ,a.FILE_TYPE as fileType
      ,a.SUBJECT as subject
      ,a.SUMMARY as summary
      ,b.SUMMARY as msummary
      ,a.CONTENT as content
      ,a.SOURCE_NAME as sourceName

      ,case when a.FILE_CDN_YN ='Y' then 'https://dn.vivasam.com' else 'https://www.vivasam.com' end + a.FILE_PATH as filePath
      ,a.SAVE_FILE_NAME as filename

      ,case when a.FILE_CDN_YN ='Y' then 'https://dn.vivasam.com' else 'https://www.vivasam.com' end + a.THUMBNAIL_PATH as thumbnail

      ,case when a.FILE_CDN_YN ='Y' then 'https://dn.vivasam.com' else 'https://www.vivasam.com' end + a.THUMBNAIL_PATH_L as thumbnailL
      ,a.FILE_CDN_YN as filecdnyn
      ,case when REG_DTTM > GETDATE()- 60 then '1' else '0' end as newIcon
      ,a.down_YN as downyn
      ,a.TN_YN as tnyn
  from @temp2 as Z
         join MASTER_CONTENT AS A
              on z.id = a.CONTENT_ID and z.gubun = a.CONTENT_GUBUN
         JOIN MASTER_CONTENT_EDUCOURSE as b
              on z.id =  b.CONTENT_ID and z.gubun = b.CONTENT_GUBUN and z.edu = b.EDUCOURSE_ID
  where 1=1
    and z.num between (@pageno-1) * @pagesize + 1  and @pageno*@pagesize
  order by num asc




END
go

