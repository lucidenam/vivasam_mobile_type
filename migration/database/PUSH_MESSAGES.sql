USE [vivasam_mobile]
GO

/****** Object:  Table [dbo].[PUSH_MESSAGES]    Script Date: 2019-01-15 오전 9:12:47 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PUSH_MESSAGES](
	[MSG_ID] [int] IDENTITY(1,1) NOT NULL,
	[SEND_TYPE] [varchar](100) NOT NULL,
	[RESEND_TYPE] [varchar](100) NULL,
	[SCHEDULED_AT] [datetime] NULL,
	[TARGET] [varchar](100) NOT NULL,
	[TARGET_AUTH] [char](1) NULL,
	[TARGET_MEMBER_ID] [nvarchar](30) NULL,
	[TARGET_SCHOOL_LVL] [nvarchar](50) NULL,
	[TARGET_SCHOOL_SUBJECT] [nvarchar](50) NULL,
	[MSG_TYPE] [nvarchar](100) NOT NULL,
	[MSG_TITLE] [nvarchar](50) NOT NULL,
	[MSG_BODY] [nvarchar](2000) NOT NULL,
	[IS_SENT] [char](1) NULL,
	[IS_RESENT] [char](1) NULL,
	[SENT_AT] [datetime] NULL,
	[REGDATE] [datetime] NULL,
	[REG_ID] [varchar](50) NULL,
	[MODDATE] [datetime] NULL,
	[MOD_ID] [varchar](50) NULL,
 CONSTRAINT [PK_PUSH_MESSAES] PRIMARY KEY CLUSTERED 
(
	[MSG_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PUSH_MESSAGES] ADD  CONSTRAINT [DF_PUSH_MESSAGES_REGDATE]  DEFAULT (getdate()) FOR [REGDATE]
GO

ALTER TABLE [dbo].[PUSH_MESSAGES] ADD  CONSTRAINT [DF_PUSH_MESSAGES_MODDATE]  DEFAULT (getdate()) FOR [MODDATE]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'NOW, SCHEDULED 중 하나. NOW 는 즉시, SCHEDULED 는 SCHEDULED_AT 컬럼에 지정된 시각에 발송합니다.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'SEND_TYPE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ALL, FAILED 중 하나. ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'RESEND_TYPE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'발송할 시각' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'SCHEDULED_AT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ALL, RULE 중 하나. ALL 이면 전체, RULE 이면 다른 조건을 조합해서 발송' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'TARGET'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Y, N, null 중 하나. Y 이면 교사 인증 사용자만, N 이면 교사 미인증 사용자만, null 이면 무시합니다.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'TARGET_AUTH'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'사용자 아이디. 사용자가 아이디가 있는 경우 이 사용자에게만 메시지를 전송합니다.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'TARGET_MEMBER_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'발송대상 학교 급 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'TARGET_SCHOOL_LVL'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'발송대상 학교 교과 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'TARGET_SCHOOL_SUBJECT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'EVENT,MATERIAL_UPDATE,NOTICE 중 하나입니다. 각각 이벤트, 교과자료 업데이트, 공지사항입니다.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'MSG_TYPE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'푸시 메시지 제목' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'MSG_TITLE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'푸시 메시지 본문.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'MSG_BODY'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'발송 유무. Y 이면 발송된 상태임. N 이면 전체 오류임. 만약 부분적으로 발송된 경우라도 Y 로 처리됨.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'IS_SENT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'메시지를 발송한 시각' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'SENT_AT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'등록일 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'REGDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'등록 유저 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'REG_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'수정일 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'MODDATE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'수정 유저 ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'MOD_ID'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'재발송 유무. Y 이면 발송된 상태임. N 이면 전체 오류임. 만약 부분적으로 발송된 경우라도 Y 로 처리됨.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES', @level2type=N'COLUMN',@level2name=N'IS_RESENT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'모바일 앱 푸시 메시지 관리 테이블' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PUSH_MESSAGES'
GO

/****** Object:  Index [IX_PUSH_MESSAGES_01]    Script Date: 2019-01-15 오전 9:13:25 ******/
CREATE NONCLUSTERED INDEX [IX_PUSH_MESSAGES_01] ON [dbo].[PUSH_MESSAGES]
(
	[MSG_TITLE] ASC,
	[MSG_BODY] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  Index [IX_PUSH_MESSAGES_02]    Script Date: 2019-01-15 오전 9:13:48 ******/
CREATE NONCLUSTERED INDEX [IX_PUSH_MESSAGES_02] ON [dbo].[PUSH_MESSAGES]
(
	[SENT_AT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO



