USE master
GO
-- -------------------------------------------------- CREATE DATABASE --------------------------------------------------
-- Drop database if exist
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DB_SUPER')
   DROP DATABASE [DB_SUPER]
GO
-- Create database
CREATE DATABASE [DB_SUPER]
GO

-- -------------------------------------------------- CREATE TABLES --------------------------------------------------
USE [DB_SUPER]
GO

/*
   ------------------------------ USER AND AUTHORIZATIONS ------------------------------
   - CRM
   ├──[#TABLES]
   │  ├──[UACCESS]:one-many:[UACCOUNT]
   │  ├──[UPLATFORM]:many-many:[UACCOUNT] | login platform information
   │  ├──[UROLE]:many-many:[UACCOUNT] | role for user
   │  │
   │  ├──[UACCOUNT]:many-one:[UACCESS] | access range
   │  ├──[UIMAGE]:many-one:[UACCESS]| user's images
   │  │
   │  ├──[UACCOUNT]:[US_UP]:[UPLATFORM] | many-many | user references platform
   │  └──[UACCOUNT]:[US_UR]:[UROLE] | many-many | user has multiple roles | one-many
   │
   ├──[#VIEWS]
   │
   └──[#PROCEDURES]
*/
-- ---------------------------------------------------------------------------------------------------- #TABLES

-- Drop [UPLATFORM] table if already exist then create new [UPLATFORM] table
IF OBJECT_ID('UPLATFORM', 'U') IS NOT NULL DROP TABLE [UPLATFORM]
GO
CREATE TABLE [UPLATFORM] (
   [upid] tinyint primary key,
   [up_name] nvarchar(20) unique not null,
   [up_other] varchar(100) -- other info
);
GO

-- Drop [UACCESS] table if already exist and create new [UACCESS] table
IF OBJECT_ID('[UACCESS]', 'U') IS NOT NULL DROP TABLE [UACCESS]
GO
CREATE TABLE [UACCESS] (
   [uaid] tinyint primary key,
   [ua_name] nvarchar(10) unique not null
);
GO

-- Drop [ROLES] table if already exist and create new [ROLES] table
IF OBJECT_ID('UROLES', 'U') IS NOT NULL DROP TABLE [UROLES]
GO
CREATE TABLE [UROLES] (
   [urid] tinyint primary key,
   [role] varchar(20) unique not null
);
GO

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-- Drop [UACCOUNT] table if already exist then create new [UACCOUNT] table
IF OBJECT_ID('UACCOUNT', 'U') IS NOT NULL DROP TABLE [UACCOUNT]
GO
CREATE TABLE [UACCOUNT] (
   [uid] bigint identity primary key,
   [username] varchar(20) null unique, -- username for login
   [email] varchar(50) unique not null, -- email for contact
   [password] binary(70) not null, -- PWDENCRYPT(size:70)
   [fullname] nvarchar(50) not null,
   [regTime] smalldatetime default GETDATE(),
   [ua_id] tinyint foreign key references [UACCESS]([uaid]) default 0 not null
);
GO


-- Drop [UIMAGE] table if already exist then create new [UIMAGE] table
IF OBJECT_ID('UIMAGE', 'U') IS NOT NULL DROP TABLE [UIMAGE]
GO
CREATE TABLE [UIMAGE] (
   [image] varchar(256) primary key, -- (hash file's name to MD5) || embed link (EX: http...)
   [u_id] bigint foreign key references
   [UACCOUNT]([uid]) on delete cascade not null
);
GO

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-- Drop [US_UP] table if already exist and create new [US_UP] table
IF OBJECT_ID('US_UP', 'U') IS NOT NULL DROP TABLE [US_UP]
GO
CREATE TABLE [US_UP] ( -- USER PLATFORMS
   [u_id] bigint foreign key references [UACCOUNT]([uid]) on delete cascade not null,
   [up_id] tinyint foreign key references [UPLATFORM]([upid]) not null,
   primary key ([u_id], [up_id])
);
GO

-- Drop [US_UR] table if already exist and create new [US_UR] table
IF OBJECT_ID('US_UR', 'U') IS NOT NULL DROP TABLE [US_UR]
GO
CREATE TABLE [US_UR] ( -- USER ROLES (authorization)
   [u_id] bigint foreign key references [UACCOUNT]([uid]) on delete cascade not null,
   [ur_id] tinyint foreign key references [UROLES]([urid]) not null,
   primary key ([u_id], [ur_id])
);
GO
USE master