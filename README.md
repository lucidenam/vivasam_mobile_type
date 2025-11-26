# README #

## Development Environment ##

* java 1.7
* spring 4.3.19
* tomcat 7.0.91
* create-react-app
* react 16.5.2

## Installation & Configuration ##
### 개발환경
#### frontend server
node.js, react.js로 만들어진 create-react-app을 사용합니다.
yarn 명령어로 server를 시작합니다.
#### backend server
java, spring, gradle, tomcat 기반으로 구성된 api server 입니다
frontend server에 proxy 기반으로 데이터를 전송합니다.
front 3000 port <-> api 8080 port

### 운영환경
#### backend server
webpack으로 production build된 main.js ,main.css파일을
gradle build시 war에 묶어 배포되어 tomcat기반 서버로 시작됩니다.
backend 8080 port

### 배포환경 정보
## 74(110.45.169.74)번 개발 환경 정보
- 아파치 하나에 톰캣 2개로 이중화 되어 있는 구조입니다.

1. 톰캣 위치 : C:\vivasam\tomcat\servers\M21

1.1 로그 파일 위치 : D:\logs\tomcat\Tomcat7_M21

2. 아파치 위치 : C:\vivasam\apache\Apache2.2.25

2.1 Virtual Hosts 설정 파일 : C:\vivasam\apache\Apache2.2.25\conf\extra\httpd-vhosts.conf
2.2 "httpd-vhosts.conf" 68라인 부터이며 DocumentRoot "//110.45.169.73/Storage/VIVASAM/M/vivasam.war"
     이렇게 설정돼 있습니다. "vivasam.war" 폴더 백업 후 이 폴더 하위에 신규 소스 반영하시면 될거 같습니다.
2.3 ssl 설정 파일 : C:\vivasam\apache\Apache2.2.25\conf\extra\httpd-ssl.conf
2.4 ssl 쪽은 DocumentRoot 위치가 기존 그대로 유지된다면 변경할께 없을 것으로 보입니다.

3. 톰캣 서비스 시작
3.1 74번 원격 접근 후 바탕화면에 "톰켓 서비스" 폴더 클릭하시면 "모바일 M2_1W_Tomcat7" 바로가기가
     있습니다. 해당 바로가기 통해 톰캣 서비스 윈도우 창을 확인하실 수 있습니다.

##FTP 정보
 - 192.168.11.174:5008 (계정 별도 안내)
 - 모바일 소스 위치 : /M/vivasam.war

### SOURCE
#### git
```
$ git clone https://{user}@bitbucket.org/rightstack/vivasam-mobile.git

```
### DEVELOPMENT
#### http://localhost:3000
#### frontend
```
$ cd ./vivasam-mobile/frontend  

# first install
$ yarn add all

$ yarn start  

```
#### backend
```
$ cd ./viva-mobile
$ ./gradlew clean build
$ cd {tomcatDir}  
$ ./start.sh

```

### PRODUCTION
#### http://localhost:8080
#### frontend
```
$ cd ./viva-mobile/frontend  
$ yarn build  

```
#### backend
```
$ cd ./viva-mobile
$ ./gradlew clean build
$ cd {tomcatDir}  
$ ./start.sh

```


## 데스크톱 웹 변경 요청 사항
1. 회원 가입 시 MEMBER.VIA 에 WEB 이라고 값을 넣어 주세요. 

## 마이그레이션

### 데이터베이스



설문조사 테이블에 추가


교사문화 프로그램 / 오프라인 세미나

```sql


ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_TITLE nvarchar(200) NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_THUM_PATH_URL nvarchar(300) NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_CONTENTS ntext NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_APPLY_CONTENTS ntext NULL;
ALTER TABLE CULTURE_ACT_INFO ADD MOBILE_TERM ntext NULL;
ALTER TABLE CULTURE_ACT_INFO ADD ADD_CHECKBOX_YN varchar(2) NULL;
ALTER TABLE CULTURE_ACT_INFO ADD ADD_CHECKBOX_TEXT ntext NULL;
```

교사문화 프로그램 / 오프라인 세미나

```sql
alter table CULTURE_ACT_APPLY_INFO add TARGET_PLATFORM VARCHAR(20);
alter table CULTURE_ACT_APPLY_INFO add VIA VARCHAR(20);
```





