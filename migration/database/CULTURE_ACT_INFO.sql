USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[CULTURE_ACT_INFO]    Script Date: 2019-01-10 오후 3:42:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CULTURE_ACT_INFO](
	[CULTURE_ACT_ID] [int] IDENTITY(1,1) NOT NULL,
	[TITLE] [nvarchar](200) NOT NULL,
	[ACT_START_DT] [datetime] NULL,
	[ACT_END_DT] [datetime] NULL,
	[THUM_PATH_URL] [nvarchar](300) NULL,
	[CTNT_GUBUN_CD] [char](1) NULL,
	[CONTENTS] [ntext] NOT NULL,
	[LINK_URL] [nvarchar](300) NULL,
	[POSTSCRIPT_GUBUN_CD] [char](1) NULL,
	[POSTSCRIPT] [ntext] NULL,
	[POSTSCRIPT_LINK_URL] [nvarchar](300) NULL,
	[DATA_STATE_CD] [char](1) NULL,
	[READ_CNT] [int] NULL,
	[RECOM_CNT] [int] NULL,
	[PUT_CNT] [int] NULL,
	[DOWN_CNT] [int] NULL,
	[REG_DTTM] [datetime] NULL,
	[REGR_ID] [varchar](30) NULL,
	[UPT_DTTM] [datetime] NULL,
	[UPTR_ID] [varchar](30) NULL,
	[SUMMARY_DESC] [nvarchar](1000) NULL,
	[PROGRAM_GUBUN_CD] [char](1) NULL,
	[TARGET_PLATFORM] [varchar](20) NULL,
	[MOBILE_TITLE] [nvarchar](200) NULL,
	[MOBILE_THUM_PATH_URL] [nvarchar](300) NULL,
	[MOBILE_CONTENTS] [ntext] NULL,
	[MOBILE_APPLY_CONTENTS] [ntext] NULL,
	[MOBILE_TERM] [ntext] NULL,
	[ADD_CHECKBOX_YN] [varchar](2) NULL,
	[ADD_CHECKBOX_TEXT] [ntext] NULL,
 CONSTRAINT [PK_CULTURE_ACT_INFO] PRIMARY KEY CLUSTERED 
(
	[CULTURE_ACT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [DF_CULTURE_ACT_INFO_CTNT_GUBUN_CD]  DEFAULT ('1') FOR [CTNT_GUBUN_CD]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [DF_CULTURE_ACT_INFO_POSTSCRIPT_GUBUN_CD]  DEFAULT ('1') FOR [POSTSCRIPT_GUBUN_CD]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [정보상태_1_1495732741]  DEFAULT ((1)) FOR [DATA_STATE_CD]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [zero_1327967850]  DEFAULT ((0)) FOR [READ_CNT]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [zero_1477997190]  DEFAULT ((0)) FOR [RECOM_CNT]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [zero_1008488260]  DEFAULT ((0)) FOR [PUT_CNT]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [zero_1093747828]  DEFAULT ((0)) FOR [DOWN_CNT]
GO

ALTER TABLE [dbo].[CULTURE_ACT_INFO] ADD  CONSTRAINT [DF_CULTURE_ACT_INFO_PROGRAM_GUBUN_CD]  DEFAULT ('1') FOR [PROGRAM_GUBUN_CD]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'교사문화활동ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'CULTURE_ACT_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'제목' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'TITLE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'활동시작일자' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'ACT_START_DT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'활동마감일자' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'ACT_END_DT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'썸네일경로URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'THUM_PATH_URL'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'내용구분코드(1:직접입력,2:URL)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'CTNT_GUBUN_CD'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'내용' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'CONTENTS'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'링크URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'LINK_URL'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'후기내용구분코드(1:직접입력,2:URL)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'POSTSCRIPT_GUBUN_CD'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'후기내용' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'POSTSCRIPT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'후기 링크URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'POSTSCRIPT_LINK_URL'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'정보상태코드' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'DATA_STATE_CD'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'조회수' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'READ_CNT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'추천수' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'RECOM_CNT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'담기수' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'PUT_CNT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'다운수' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'DOWN_CNT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'등록일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'REG_DTTM'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'등록자아이디' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'REGR_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'수정일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'UPT_DTTM'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'수정자아이디' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'UPTR_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'내용요약' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'SUMMARY_DESC'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'프로그램구분(1:교사문화프로그램,2:세미나)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO', @level2type=N'COLUMN',@level2name=N'PROGRAM_GUBUN_CD'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'교사문화활동정보' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CULTURE_ACT_INFO'
GO

