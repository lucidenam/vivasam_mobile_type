USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[MAIN_BANNER_LINE_INFO_MOBILE]    Script Date: 2019-01-08 오전 11:40:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MAIN_BANNER_LINE_INFO_MOBILE](
	[BANNER_ID] [int] IDENTITY(1,1) NOT NULL,
	[TITLE] [nvarchar](1000) NULL,
	[LINK_TYPE] [char](1) NULL,
	[URL] [nvarchar](4000) NULL,
	[OPEN_DATE] [datetime] NULL,
	[CLOSE_DATE] [datetime] NULL,
	[USE_YN] [char](1) NULL,
	[REG_DTTM] [datetime] NULL,
	[ADM_ID] [varchar](50) NULL
) ON [PRIMARY]
GO

