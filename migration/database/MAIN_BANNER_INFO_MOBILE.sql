USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[MAIN_BANNER_INFO_MOBILE]    Script Date: 2019-01-08 오전 11:40:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MAIN_BANNER_INFO_MOBILE](
	[BANNER_ID] [int] IDENTITY(1,1) NOT NULL,
	[TITLE] [nvarchar](200) NULL,
	[OPEN_TITLE] [nvarchar](200) NULL,
	[BANNER_TYPE] [char](1) NOT NULL,
	[END_DTTM] [datetime] NULL,
	[IMAGE_CDN_YN] [char](1) NOT NULL,
	[IMAGE_PATH] [nvarchar](200) NOT NULL,
	[IMAGE_NAME] [nvarchar](100) NOT NULL,
	[ORDER_NO] [int] NULL,
	[LCOLOR] [nvarchar](200) NULL,
	[RCOLOR] [nvarchar](200) NULL,
	[LINK_TYPE] [char](1) NULL,
	[URL] [nvarchar](200) NULL,
	[USE_YN] [char](1) NULL,
	[POSITION_LEFT] [varchar](5) NULL,
	[POSITION_TOP] [varchar](5) NULL,
	[CLOSE_TYPE] [char](1) NULL,
	[REG_DTTM] [datetime] NULL,
	[ADM_ID] [varchar](50) NULL,
	[OPEN_DATE] [varchar](50) NULL,
	[CLOSE_DATE] [varchar](50) NULL,
	[END_DATE] [varchar](50) NULL
) ON [PRIMARY]
GO

