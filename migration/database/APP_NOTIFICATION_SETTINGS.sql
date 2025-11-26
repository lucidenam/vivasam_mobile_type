USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[APP_NOTIFICATION_SETTINGS]    Script Date: 2019-01-19 오후 1:26:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[APP_NOTIFICATION_SETTINGS](
	[SETTINGS_ID] [int] IDENTITY(1,1) NOT NULL,
	[MEMBER_ID] [varchar](30) NULL,
	[ALARM_EVENT] [char](1) NOT NULL,
	[ALARM_MATERIAL_UPDATE] [char](1) NOT NULL,
	[ALARM_QNA_ANSWER] [char](1) NOT NULL,
	[ALARM_NOTI] [char](1) NOT NULL,
	[REGDATE] [datetime] NULL,
	[MODDATE] [datetime] NULL,
 CONSTRAINT [PK_APP_NOTIFICATION_SETTINGS] PRIMARY KEY CLUSTERED 
(
	[SETTINGS_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  DEFAULT ('N') FOR [ALARM_EVENT]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  DEFAULT ('N') FOR [ALARM_MATERIAL_UPDATE]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  DEFAULT ('N') FOR [ALARM_QNA_ANSWER]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  DEFAULT ('N') FOR [ALARM_NOTI]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  CONSTRAINT [DF_APP_NOTIFICATION_SETTINGS_REGDATE]  DEFAULT (getdate()) FOR [REGDATE]
GO

ALTER TABLE [dbo].[APP_NOTIFICATION_SETTINGS] ADD  CONSTRAINT [DF_APP_NOTIFICATION_SETTINGS_MODDATE]  DEFAULT (getdate()) FOR [MODDATE]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'이벤트 알림. Y 이면 알려주고, N 이면 알려주지 않습니다.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'APP_NOTIFICATION_SETTINGS', @level2type=N'COLUMN',@level2name=N'ALARM_EVENT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'교과자료 업데이트 알림.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'APP_NOTIFICATION_SETTINGS', @level2type=N'COLUMN',@level2name=N'ALARM_MATERIAL_UPDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'내 문의 답변 알림' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'APP_NOTIFICATION_SETTINGS', @level2type=N'COLUMN',@level2name=N'ALARM_QNA_ANSWER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'공지사항 알림' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'APP_NOTIFICATION_SETTINGS', @level2type=N'COLUMN',@level2name=N'ALARM_NOTI'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'사용자 앱 알림 설정 테이블' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'APP_NOTIFICATION_SETTINGS'
GO

