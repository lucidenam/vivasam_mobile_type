USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[MAIN_BOTTOM_BANNER_MOBILE]    Script Date: 2019-01-12 오전 11:00:56 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MAIN_BOTTOM_BANNER_MOBILE](
	[BANNER_ID] [int] IDENTITY(1,1) NOT NULL,
	[BANNER_NAME] [nvarchar](50) NULL,
	[BANNER_FILE_PATH] [nvarchar](200) NULL,
	[BANNER_FILE_SAV] [nvarchar](200) NULL,
	[BANNER_FILE_ORG] [nvarchar](200) NULL,
	[LINK_URL] [varchar](500) NULL,
	[LINK_TYPE] [varchar](10) NULL,
	[BANNER_OPENDATE] [datetime] NULL,
	[BANNER_CLOSEDATE] [datetime] NULL,
	[BANNER_REGDATE] [datetime] NULL,
	[BANNER_REGID] [varchar](50) NULL,
	[BANNER_MODDATE] [datetime] NULL,
	[BANNER_MODID] [varchar](50) NULL,
	[BANNER_USE_YN] [char](1) NULL,
 CONSTRAINT [PK_MAIN_BOTTOM_BANNER_MOBILE] PRIMARY KEY CLUSTERED 
(
	[BANNER_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[MAIN_BOTTOM_BANNER_MOBILE] ADD  CONSTRAINT [DF_MAIN_BOTTOM_BANNER_MOBILE_REGDATE]  DEFAULT (getdate()) FOR [BANNER_REGDATE]
GO

ALTER TABLE [dbo].[MAIN_BOTTOM_BANNER_MOBILE] ADD  CONSTRAINT [DF_MAIN_BOTTOM_BANNER_MOBILE_MODDATE]  DEFAULT (getdate()) FOR [BANNER_MODDATE]
GO

ALTER TABLE [dbo].[MAIN_BOTTOM_BANNER_MOBILE] ADD  CONSTRAINT [DF_MAIN_BOTTOM_BANNER_MOBILE_USE_YN]  DEFAULT ('N') FOR [BANNER_USE_YN]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너 이름' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_NAME'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'업로드한 배너를 저장하는 경로' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_FILE_PATH'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'업로드한 배너 이미지 저장 이름. 한글인 경우 ASCII 스타일로 변경' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_FILE_SAV'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'업로드한 배너 이미지 원본 파일 명' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_FILE_ORG'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너 클릭 시 이동할 URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'LINK_URL'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'링크 유형. CURRENT or NEW' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'LINK_TYPE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'오픈 일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_OPENDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'종료 일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_CLOSEDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너 등록 일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_REGDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너를 등록한 사용자의 아이디' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_REGID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너 정보 수정 일시' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_MODDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'배너 정보를 수정한 사용자의 아이디' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_MODID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'공개 여부. Y or N' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE', @level2type=N'COLUMN',@level2name=N'BANNER_USE_YN'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'비바샘터 추천 수업 자료 배너 정보' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MAIN_BOTTOM_BANNER_MOBILE'
GO

