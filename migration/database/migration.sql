
-- 회원 정보 테이블 컬럼 추가. 가입한 곳
alter table MEMBER add VIA VARCHAR(20);

exec sp_addextendedproperty 'MS_Description', '가입 출처. MOBILE, WEB', 'SCHEMA', 'dbo', 'TABLE', 'MEMBER', 'COLUMN', 'VIA'
go

UPDATE MEMBER SET VIA = 'WEB' WHERE VIA IS NULL;

-- 비바 샘터의 추천 수업 자료 배너 정보
create table RECO_EDU_MATERIAL_BANNER
(
  ID               int identity constraint PK_RECO_EDU_MATERIAL primary key,
  BANNER_NAME      nvarchar(50),
  LINK_TYPE        varchar(10),
  BANNER_URL       varchar(500),
  BANNER_FILE_ORG  nvarchar(200),
  BANNER_FILE_SAV  nvarchar(200),
  BANNER_FILE_PATH nvarchar(200),
  BANNER_REGDATE   datetime constraint DF_RECO_EDU_MATERIAL_BANNER_REGDATE default getdate(),
  BANNER_REGID     varchar(50),
  BANNER_MODDATE   datetime constraint DF_RECO_EDU_MATERIAL_BANNER_MODDATE default getdate(),
  BANNER_MODID     varchar(50),
  BANNER_USE_YN    char(1) constraint DF_RECO_EDU_MATERIAL_BANNER_USE_YN default 'Y',
)
go

exec sp_addextendedproperty 'MS_Description', '비바샘터 추천 수업 자료 배너 정보', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER'
go

exec sp_addextendedproperty 'MS_Description', '배너 이름', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_NAME'
go

  exec sp_addextendedproperty 'MS_Description', '링크 유형. CURRENT or NEW', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'LINK_TYPE'
go

exec sp_addextendedproperty 'MS_Description', '배너 클릭 시 이동할 URL', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_URL'
go

exec sp_addextendedproperty 'MS_Description', '업로드한 배너 이미지 원본 파일 명', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_FILE_ORG'
go

exec sp_addextendedproperty 'MS_Description', '업로드한 배너 이미지 저장 이름. 한글인 경우 ASCII 스타일로 변경', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_FILE_SAV'
go

exec sp_addextendedproperty 'MS_Description', '업로드한 배너를 저장하는 경로', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_FILE_PATH'
go

exec sp_addextendedproperty 'MS_Description', '배너 등록 일시', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_REGDATE'
go

exec sp_addextendedproperty 'MS_Description', '배너를 등록한 사용자의 아이디', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_REGID'
go

exec sp_addextendedproperty 'MS_Description', '배너 정보 수정 일시', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_MODDATE'
go

exec sp_addextendedproperty 'MS_Description', '배너 정보를 수정한 사용자의 아이디', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_MODID'
go

exec sp_addextendedproperty 'MS_Description', '공개 여부. Y or N', 'SCHEMA', 'dbo', 'TABLE', 'RECO_EDU_MATERIAL_BANNER', 'COLUMN', 'BANNER_USE_YN'
go


-- 푸시 메시지 용 토큰 정보 테이블
create table DEVICE_APP_TOKENS
(
  ID int identity constraint PK_DEVICE_APP_TOKENS primary key,
  TOKEN varchar(200) not null,
  MEMBER_ID varchar(30),
  OS varchar(100),
  REGDATE   datetime constraint DF_DEVICE_APP_TOKENS_REGDATE default getdate(),
  MODDATE   datetime constraint DF_DEVICE_APP_TOKENS_MODDATE default getdate()
)
go

create unique index UQ_DEVICE_APP_TOKENS_TOKEN
on DEVICE_APP_TOKENS (TOKEN)
go

exec sp_addextendedproperty 'MS_Description', '앱 사용자들의 푸시 메시지 전송을 위한 Token', 'SCHEMA', 'dbo', 'TABLE', 'DEVICE_APP_TOKENS'
go

exec sp_addextendedproperty 'MS_Description', 'Firebase App Token. Device 에서 전송하는 값.', 'SCHEMA', 'dbo', 'TABLE', 'DEVICE_APP_TOKENS', 'COLUMN', 'TOKEN'
go

exec sp_addextendedproperty 'MS_Description', '비바샘 회원 아이디. 로그인 하지 않고도 푸시 메시지를 받을 수 있으므로 이 값은 NULL 허용. 한 사용자 ID 는 여러 Token 을 가질 수 있음 (여러 디바이스를 가질 수 있으므로)', 'SCHEMA', 'dbo', 'TABLE', 'DEVICE_APP_TOKENS', 'COLUMN', 'MEMBER_ID'
go

exec sp_addextendedproperty 'MS_Description', 'iOS or Android', 'SCHEMA', 'dbo', 'TABLE', 'DEVICE_APP_TOKENS', 'COLUMN', 'OS'
go




-- 이벤트
alter table EVENT_INFO add EVENT_TARGET_PLATFORM VARCHAR(20);
ALTER TABLE EVENT_INFO ADD EVENT_MOB_BN_ORG NVARCHAR(200) NULL;
ALTER TABLE EVENT_INFO ADD EVENT_MOB_BN_SAV nvarchar(200) NULL;
ALTER TABLE EVENT_INFO ADD EVENT_MOB_BN_PATH nvarchar(200) NULL;
ALTER TABLE EVENT_INFO ADD MOBILE_APPLY_CONTENTS ntext NULL;
ALTER TABLE EVENT_INFO ADD MOBILE_THUM_PATH_URL nvarchar(300) NULL;
ALTER TABLE EVENT_INFO ADD MOBILE_TERM ntext NULL;


exec sp_addextendedproperty 'MS_Description', '대상 플랫폼. ALL or WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'EVENT_TARGET_PLATFORM'
go

exec sp_addextendedproperty 'MS_Description', '이벤트 모바일 배너 원본이미지명', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'EVENT_MOB_BN_ORG'
go

exec sp_addextendedproperty 'MS_Description', '이벤트 모바일 배너 저장이미지명', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'EVENT_MOB_BN_SAV'
go

exec sp_addextendedproperty 'MS_Description', '이벤트 모바일 배너', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'EVENT_MOB_BN_PATH'
go

exec sp_addextendedproperty 'MS_Description', '모바일 신청페이지 상세내용', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'MOBILE_APPLY_CONTENTS'
go

exec sp_addextendedproperty 'MS_Description', '모바일 약관', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_INFO', 'COLUMN', 'MOBILE_TERM'
go

UPDATE EVENT_INFO SET EVENT_TARGET_PLATFORM = 'WEB' WHERE EVENT_TARGET_PLATFORM IS NULL;




-- 이벤트 신청
alter table EVENT_JOIN add VIA VARCHAR(20);

exec sp_addextendedproperty 'MS_Description', '이벤트 참여한 곳. WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'EVENT_JOIN', 'COLUMN', 'VIA'
go

UPDATE EVENT_JOIN SET via = 'WEB' WHERE via IS NULL;



-- 교사문화 프로그램 / 오프라인 세미나
ALTER TABLE CULTURE_ACT_INFO ADD TARGET_PLATFORM VARCHAR(20);
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_THUM_PATH_URL NVARCHAR(300) NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_CONTENTS ntext NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_APPLY_CONTENTS ntext NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_TERM ntext NULL;

--CULTURE_ACT_INFO 테이블에
--밑에 2개 컬럼도 추가 부탁드립니다. 타입은 개발DB 확인 부탁드려요
ADD_CHECKBOX_YN  (추가 동의 YN)
ADD_CHECKBOX_TEXT (추가 동의 내용)
------------------

exec sp_addextendedproperty 'MS_Description', '대상 플랫폼. ALL or WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_INFO', 'COLUMN', 'TARGET_PLATFORM'
go

exec sp_addextendedproperty 'MS_Description', '모바일 썸네일 경로URL', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_INFO', 'COLUMN', 'MOBILE_THUM_PATH_URL'
go

exec sp_addextendedproperty 'MS_Description', '모바일 내용', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_INFO', 'COLUMN', 'MOBILE_CONTENTS'
go

exec sp_addextendedproperty 'MS_Description', '모바일 신청페이지 상세내용', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_INFO', 'COLUMN', 'MOBILE_APPLY_CONTENTS'
go

exec sp_addextendedproperty 'MS_Description', '모바일 약관', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_INFO', 'COLUMN', 'MOBILE_TERM'
go

UPDATE CULTURE_ACT_INFO SET TARGET_PLATFORM = 'WEB' WHERE TARGET_PLATFORM IS NULL;




-- 교사문화 프로그램 / 오프라인 세미나 신청
ALTER TABLE CULTURE_ACT_APPLY_INFO ADD VIA VARCHAR(20);

exec sp_addextendedproperty 'MS_Description', '교사문화 프로그램, 오프라인 세미나 참여한 곳. WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'CULTURE_ACT_APPLY_INFO', 'COLUMN', 'VIA'
go

UPDATE CULTURE_ACT_APPLY_INFO SET via = 'WEB' WHERE via IS NULL;



-- 설문조사
ALTER TABLE SURVEY_INFO ADD TARGET_PLATFORM VARCHAR(20);

exec sp_addextendedproperty 'MS_Description', '대상 플랫폼. ALL or WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'SURVEY_INFO', 'COLUMN', 'TARGET_PLATFORM'
go

UPDATE SURVEY_INFO SET TARGET_PLATFORM = 'WEB' WHERE TARGET_PLATFORM IS NULL;




-- 설문조사 신청
ALTER TABLE SURVEY_APPLY_INFO ADD VIA VARCHAR(20);

exec sp_addextendedproperty 'MS_Description', '설문조사 참여한 곳. WEB or MOBILE', 'SCHEMA', 'dbo', 'TABLE', 'SURVEY_APPLY_INFO', 'COLUMN', 'VIA'
go

UPDATE SURVEY_APPLY_INFO SET via = 'WEB' WHERE via IS NULL;

-- 공지사항
ALTER TABLE NOTICE_INFO ADD MOBILE_DISPLAY_YN CHAR(1);

exec sp_addextendedproperty 'MS_Description', '모바일 노출 여부. Y or N', 'SCHEMA', 'dbo', 'TABLE', 'NOTICE_INFO', 'COLUMN', 'MOBILE_DISPLAY_YN'
go

-- 푸시 알림 메시지
-- IS_RESENT 만약 재발송했으면 Y 입니다. 재발송으로 다시 설정하려면 이 값을 N 으로 해야 합니다.
create table PUSH_MESSAGES
(
  MSG_ID int identity(1, 1) constraint PK_PUSH_MESSAES primary key,
  SEND_TYPE varchar(100) not null,
  RESEND_TYPE varchar(100) NULL,
  SCHEDULED_AT datetime,
  TARGET varchar(100) not null,
  TARGET_AUTH char(1),
  TARGET_MEMBER_ID nvarchar(30),
  TARGET_SCHOOL_LVL nvarchar(50),
  TARGET_SCHOOL_SUBJECT nvarchar(50),
  MSG_TYPE varchar(100) not null,
  MSG_TITLE nvarchar(50) not null,
  MSG_BODY nvarchar(2000) not null,
  IS_SENT char(1) default 'N' not null,
  SENT_AT  datetime ,
  NUMBER_OF_MESSAGES int,
  IS_RESENT char(1) default 'N' not null,
  REGDATE  datetime constraint DF_PUSH_MESSAGES_REGDATE default getdate(),
  REG_ID NVARCHAR(50) NOT NULL,
  MODDATE  DATETIME constraint DF_PUSH_MESSAGES_REGDATE default getdate(),
  MOD_ID NVARCHAR(50) NULL
)
go

exec sp_addextendedproperty 'MS_Description', '모바일 앱 푸시 메시지 관리 테이블', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES'
go

exec sp_addextendedproperty 'MS_Description', 'NOW, SCHEDULED, RESEND 중 하나. NOW 는 즉시, SCHEDULED 는 SCHEDULED_AT 컬럼에 지정된 시각에 발송합니다. RESEND 는 재전송이며 스케줄되어 있어도 즉시 보냅니다.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'SEND_TYPE'
go

exec sp_addextendedproperty 'MS_Description', 'ALL, FAILED 중 하나. ', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'RESEND_TYPE'
go

exec sp_addextendedproperty 'MS_Description', '발송할 시각', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'SCHEDULED_AT'
go

exec sp_addextendedproperty 'MS_Description', 'ALL, RULE 중 하나. ALL 이면 전체, RULE 이면 다른 조건을 조합해서 발송', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'TARGET'
go

exec sp_addextendedproperty 'MS_Description', 'Y, N, null 중 하나. Y 이면 교사 인증 사용자만, N 이면 교사 미인증 사용자만, null 이면 무시합니다.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'TARGET_AUTH'
go

exec sp_addextendedproperty 'MS_Description', '사용자 아이디. 사용자가 아이디가 있는 경우 이 사용자에게만 메시지를 전송합니다.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'TARGET_MEMBER_ID'
go

exec sp_addextendedproperty 'MS_Description', 'EVENT,MATERIAL_UPDATE,NOTICE 중 하나입니다. 각각 이벤트, 교과자료 업데이트, 공지사항입니다.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'MSG_TYPE'
go

exec sp_addextendedproperty 'MS_Description', '푸시 메시지 제목', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'MSG_TITLE'
go

exec sp_addextendedproperty 'MS_Description', '푸시 메시지 본문.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'MSG_BODY'
go

exec sp_addextendedproperty 'MS_Description', '발송 유무. Y 이면 발송된 상태임. N 이면 전체 오류임. 만약 부분적으로 발송된 경우라도 Y 로 처리됨.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'IS_SENT'
go

exec sp_addextendedproperty 'MS_Description', '메시지를 발송한 시각', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'SENT_AT'
go

exec sp_addextendedproperty 'MS_Description', '메시지 전송 건수', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'NUMBER_OF_MESSAGES'
go

alter table PUSH_MESSAGES
add REG_TYPE varchar(20)
go

exec sp_addextendedproperty 'MS_Description', '등록 유형. MANUAL, TRIGGERED 중 하나입니다. MANUAL 은 직접 입력. TRIGGERED 는 다른 업무과 연계에서 등록된 메시지입니다.', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'REG_TYPE'
go

UPDATE PUSH_MESSAGES SET REG_TYPE = 'MANUAL';

alter table PUSH_MESSAGES alter column REG_TYPE varchar(20) not null
go

alter table PUSH_MESSAGES add default 'MANUAL' for REG_TYPE
go

exec sp_updateextendedproperty 'MS_Description', 'EVENT,MATERIAL_UPDATE,NOTICE,TEACHER_CERTIFICATE', 'SCHEMA', 'dbo', 'TABLE', 'PUSH_MESSAGES', 'COLUMN', 'MSG_TYPE'
go



--UPDATE PUSH_MESSAGES  SET IS_SENT = 'N' WHERE IS_SENT IS NULL;


-- 내 문의 답변에 대한 Push 관련 컬럼 추가.
alter table QNA_INFO
add IS_PUSH_SENT char(1) default 'N'
go

exec sp_addextendedproperty 'MS_Description', '푸시 메시지를 보냈으면 Y 보내지 못했으면 N 혹은 null 입니다.', 'SCHEMA', 'dbo', 'TABLE', 'QNA_INFO', 'COLUMN', 'IS_PUSH_SENT'
go

alter table QNA_INFO
add IS_ANSWER_CHECKED char(1) default 'N'
go

exec sp_addextendedproperty 'MS_Description', '답변을 보았으면 Y 아니면 N 이거나 null 입니다.', 'SCHEMA', 'dbo', 'TABLE', 'QNA_INFO', 'COLUMN', 'IS_ANSWER_CHECKED'
go

UPDATE QNA_INFO SET IS_PUSH_SENT = 'Y';
UPDATE QNA_INFO SET IS_ANSWER_CHECKED = 'Y';

-- 개인 알림 설정
create table APP_NOTIFICATION_SETTINGS
(
  SETTINGS_ID int identity(1, 1) constraint PK_APP_NOTIFICATION_SETTINGS primary key,
  MEMBER_ID varchar(30),
  ALARM_EVENT char(1) default 'N' not null,
  ALARM_MATERIAL_UPDATE char(1) default 'N' not null,
  ALARM_QNA_ANSWER char(1) default 'N' not null,
  ALARM_NOTI char(1) default 'N' not null,
  REGDATE  datetime constraint DF_APP_NOTIFICATION_SETTINGS_REGDATE default getdate(),
  MODDATE  DATETIME constraint DF_APP_NOTIFICATION_SETTINGS_MODDATE default getdate()
)
go

create unique index UQ_APP_NOTIFICATION_SETTINGS_MEMBER
on APP_NOTIFICATION_SETTINGS (MEMBER_ID)
go

exec sp_addextendedproperty 'MS_Description', '사용자 앱 알림 설정 테이블', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_SETTINGS'
go

exec sp_addextendedproperty 'MS_Description', '이벤트 알림. Y 이면 알려주고, N 이면 알려주지 않습니다.', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_SETTINGS', 'COLUMN', 'ALARM_EVENT'
go

exec sp_addextendedproperty 'MS_Description', '교과자료 업데이트 알림.', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_SETTINGS', 'COLUMN', 'ALARM_MATERIAL_UPDATE'
go

exec sp_addextendedproperty 'MS_Description', '내 문의 답변 알림', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_SETTINGS', 'COLUMN', 'ALARM_QNA_ANSWER'
go

exec sp_addextendedproperty 'MS_Description', '공지사항 알림', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_SETTINGS', 'COLUMN', 'ALARM_NOTI'
go


-- 푸시 메시지 전송 실패 시 여기에 기록합니다. 만약 재전송해서 성공하면 제거합니다.
create table APP_NOTIFICATION_LOGS
(
  ID int identity(1, 1) constraint PK_APP_NOTIFICATION_FAILED_LOG primary key,
  MEMBER_ID varchar(30) not null,
  MESSAGE_ID int not null,
  STATUS varchar(20) not null,
  REGDATE  datetime constraint DF_APP_NOTIFICATION_FAILED_LOG_REGDATE default getdate()
)
go

exec sp_addextendedproperty 'MS_Description', '푸시 메시지 전송 로그를 여기에 기록합니다. 만약 재전송해서 성공하면 제거합니다.', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_LOGS'
go

exec sp_addextendedproperty 'MS_Description', '전송 상태. SUCCESS, FAILED 중 하나.', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_LOGS', 'COLUMN', 'STATUS'
go


SELECT COUNT(1) FROM APP_NOTIFICATION_LOGS A, PUSH_MESSAGES P WHERE A.MESSAGE_ID = P.MSG_ID AND A.STATUS = 'FAILED'
;


-- 열람자료 로그 테이블
CREATE TABLE MEMBER_MATERIALS_VIEW_LOG
(
  [ID] int identity(1, 1) NOT NULL,
  [MEMBER_ID] [varchar](30) NOT NULL,
  CONTENT_ID varchar(20) not null,
  [REGDATE] [datetime] NULL,
CONSTRAINT [PK_MEMBER_MATERIALS_VIEW_LOG] PRIMARY KEY CLUSTERED
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].MEMBER_MATERIALS_VIEW_LOG ADD  CONSTRAINT [DF_MEMBER_MATERIALS_VIEW_LOG_REGDATE]  DEFAULT (getdate()) FOR [REGDATE]
GO
;

//로그인 로그 SID 컬럼 사이즈 500으로 변경
USE [vivasam_mobile]
GO

ALTER TABLE [MEMBER_LOGINFO] ALTER COLUMN [SID] VARCHAR(500);
ALTER TABLE [MEMBER_LOGINFO_LOG] ALTER COLUMN [SID] VARCHAR(500);


alter table QNA_INFO
add VIA varchar(10) default 'WEB'
go

update QNA_INFO SET VIA = 'WEB';

alter table APP_NOTIFICATION_LOGS
add IS_READ char(1)
go

exec sp_addextendedproperty 'MS_Description', '읽었으면 Y, 아니면 N 입니다.', 'SCHEMA', 'dbo', 'TABLE', 'APP_NOTIFICATION_LOGS', 'COLUMN', 'IS_READ'
go

UPDATE APP_NOTIFICATION_LOGS SET IS_READ = 'Y';

alter table APP_NOTIFICATION_LOGS alter column IS_READ char(1) not null
go

alter table APP_NOTIFICATION_LOGS add default 'N' for IS_READ
go

