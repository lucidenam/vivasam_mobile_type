USE [vivasam_mobile]
GO

INSERT INTO [dbo].[ADM_MENU_INFO]
           ([IDX]
           ,[MENU_NAME]
           ,[MENU_LINK]
           ,[LINK_TYPE]
           ,[GROUP_NO]
           ,[DEPTH_NO]
           ,[ORDER_NO]
           ,[GROUP_IDX])
     VALUES
           (<IDX, int,>
           ,<MENU_NAME, nvarchar(100),>
           ,<MENU_LINK, nvarchar(2000),>
           ,<LINK_TYPE, char(1),>
           ,<GROUP_NO, int,>
           ,<DEPTH_NO, int,>
           ,<ORDER_NO, int,>
           ,<GROUP_IDX, int,>)
GO

