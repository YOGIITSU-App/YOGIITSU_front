<p align="center">
  <img width="1024" height="500" src="https://github.com/user-attachments/assets/5c781bcb-83db-4495-ac32-ad66e8609741" />
</p>

<h1 align="center">YOGIITSU · 요기있수</h1>

<p align="center">
📱 수원대학교 스마트 캠퍼스 모바일 애플리케이션
</p>

<p align="center">
수원대학교 학생들의 캠퍼스 생활을 더 편리하게 만들기 위해 개발된 서비스입니다.<br/>
지도 기반으로 건물 위치, 편의시설, 셔틀버스, 학식, 지름길 등을 한 곳에서 제공합니다.
</p>

<p align="center">
<a href="https://www.youtube.com/watch?v=uGwNB6_aN9s">🎬 Demo Video</a>
</p>

<p align="center">

<a href="https://play.google.com/store/apps/details?id=com.yogiitsuapp">
<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
width="180"/>
</a>

<a href="https://apps.apple.com/app/6751530444">
<img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
width="150"/>
</a>

</p>

---

# 📊 Service Metrics

- 현재 사용자 **약 1,100명**
- 평균 **DAU 약 300**
- **TMap 길찾기 API 하루 평균 약 500건 사용**
- **iOS / Android 동시 배포 서비스**

---

# 📖 Project Overview

요기있수는 수원대학교 학생들의 캠퍼스 생활 정보를  
**지도 기반으로 통합 제공하는 스마트 캠퍼스 앱**입니다.

기존 학교 시스템에서는

- 건물 위치
- 편의시설 위치
- 셔틀버스 정보
- 캠퍼스 내부 이동 경로

등을 한 번에 확인하기 어려워  
학생들이 커뮤니티나 게시판에 의존하는 경우가 많았습니다.

이 문제를 해결하기 위해

- 캠퍼스 지도
- 건물 및 편의시설 검색
- 도보 길찾기
- 지름길 경로
- 학식
- 셔틀버스

등을 하나의 모바일 앱에서 제공하도록 설계했습니다.

---

# 👨‍💻 My Role (Frontend)

React Native 기반 모바일 앱 **프론트엔드 전담 개발**

- React Native 기반 전체 모바일 UI 구조 설계 및 구현
- WebView + KakaoMap JavaScript SDK 기반 지도 렌더링 구조 설계
- React Native ↔ WebView **postMessage 기반 메시지 브릿지 구현**
- TMap 보행자 경로 API 기반 도보 길찾기 기능 구현
- Geolocation 기반 **현재 위치 반영 및 길찾기 출발지 설정 기능 구현**
- Firebase Analytics 이벤트 설계 및 사용자 행동 데이터 분석
- Firebase Cloud Messaging 기반 **공지 및 이벤트 푸시 알림 기능 구현**
- 서비스 배포 이후 사용자 지표 모니터링 및 기능 개선

---

# ⚙️ Key Implementation

## WebView 기반 지도 렌더링 구조

React Native 지도 라이브러리의 기능 제한으로 인해  
**WebView + KakaoMap JavaScript SDK 구조**로 지도 기능을 구현했습니다.

React Native와 WebView 간 **postMessage 기반 메시지 브릿지**를 구성하여  
지도 이벤트와 앱 상태를 양방향으로 동기화했습니다.

이를 통해

- 마커 표시
- 경로 Polyline 렌더링
- 현재 위치 반영
- 지도 이동 이벤트 전달

등의 지도 기능을 제어할 수 있도록 구현했습니다.

또한 지도 로직을 WebView 내부에서 독립적으로 관리하여  
지도 기능 수정 시 **앱 업데이트 없이 대응할 수 있는 구조**로 설계했습니다.

---

## 도보 길찾기 기능

TMap 보행자 경로 API를 활용해  
캠퍼스 내 **도보 길찾기 기능**을 구현했습니다.

또한 API 호출 비용을 관리하기 위해

- 동일 경로 요청 캐싱
- 일일 API 호출 횟수 제한

로직을 적용하여 불필요한 API 호출을 줄였습니다.

---

## 현재 위치 기반 길찾기

Geolocation API를 활용해  
사용자의 현재 위치를 지도에 반영하고  
길찾기 출발지로 사용할 수 있도록 구현했습니다.

iOS WebView 환경에서 길찾기 경로가 즉시 렌더링되지 않는 문제를  
`watchPosition`과 `distanceFilter` 설정을 통해 해결했습니다.

---

## 캠퍼스 지름길 경로 구현

공식 지도에 표시되지 않는 캠퍼스 내부 **지름길 경로 3개를 직접 조사하고 구축했습니다.**

- 캠퍼스 이동 동선을 직접 조사하여 좌표 수집
- DB에 경로 좌표 저장
- 지도에서 Polyline 형태로 렌더링

이를 통해 학생들이 실제 이동 시 활용할 수 있는 **캠퍼스 최단 이동 경로 기능**을 제공했습니다.

---

# 📱 App Screens
요기있수 앱의 주요 화면입니다.

<p align="center">
  <img width="220" src="https://github.com/user-attachments/assets/49de6615-6f7a-447e-a7bb-91492f2645cb" />
  <img width="220" src="https://github.com/user-attachments/assets/e39a9cb6-1a5c-4653-9b0f-70996dec906a" />
  <img width="220" src="https://github.com/user-attachments/assets/95eba56b-c1b4-4749-a237-92eb520d3a05" />
</p>

<p align="center">
  <img width="220" src="https://github.com/user-attachments/assets/eb2ca3c6-6214-473c-b4b0-0e19679eab30" />
  <img width="220" src="https://github.com/user-attachments/assets/c2f9987f-d313-4eb2-9e74-2f6008ae9cfd" />
  <img width="220" src="https://github.com/user-attachments/assets/d215f5df-baf9-4fcf-9a47-70b043818e81" />
</p>

---

# 🚀 Main Features

## 🗺️ 캠퍼스 지도 탐색
- KakaoMap 기반 캠퍼스 지도
- 건물 및 편의시설 위치 표시
- 셔틀버스 / 주차 / 식당 / 카페 등 시설 필터 제공

## 🚶 도보 길찾기
- TMap 보행자 경로 API 기반 길찾기
- 출발지 / 도착지 설정
- 경로 Polyline 지도 표시

## ⚡ 지름길 길찾기
- 공식 지도에 표시되지 않는 캠퍼스 지름길 경로 제공
- 학생 이동 동선을 고려한 최단 경로 탐색

## 🏫 건물 정보 제공
- 건물 내부 시설 정보
- 학과 사무실 위치
- 건물 내 편의시설 안내

## 🚌 셔틀버스 정보
- 셔틀버스 노선 정보
- 정류장 위치 및 도착 예정 시간 제공

## 🍽️ 학식 조회
- 학생식당 / 교직원 식당 메뉴 제공
- 일자별 학식 메뉴 조회

---

# 🛠 Tech Stack

### Frontend
- React Native
- TypeScript
- React Navigation
- Axios
- React Native Reanimated
- React Native Gesture Handler
- React Native WebView

### Map / Location
- Kakao Map JavaScript SDK
- TMap 보행자 경로 API
- Geolocation API

### Backend
- Spring Boot
- Spring Security
- JWT
- MySQL
- JPA

### Infrastructure
- AWS EC2
- AWS RDS
- AWS S3
- CloudFront
- Docker
- Nginx
- GitHub Actions

---

# 🏗 Architecture

<p align="center">
<img width="800" src="https://github.com/user-attachments/assets/6a38383c-fcbd-4f4a-af8d-0625c570ed70"/>
</p>

---

# 🗄 Database ERD

<p align="center">
<img width="900" src="https://github.com/user-attachments/assets/37c88bc3-90cc-4e11-a1f4-cbbd51fe7240"/>
</p>

---

# 👥 Team

### Frontend

| 김종민 |
|------|
| ![](https://github.com/jongmink0.png?size=120) |
| [@jongmink0](https://github.com/jongmink0) |

### Backend

| 박소미 | 이가영 | 조예성 |
|------|------|------|
| ![](https://github.com/parksomii.png?size=120) | ![](https://github.com/gayoung228.png?size=120) | ![](https://github.com/joyes0ng.png?size=120) |
| [@parksomii](https://github.com/parksomii) | [@gayoung228](https://github.com/gayoung228) | [@joyes0ng](https://github.com/joyes0ng) |

---

# 📅 Project Timeline

**2024.09 ~ 2024.12**

- 서비스 기획
- 캠퍼스 시설 데이터 수집
- 지름길 경로 조사

**2025.01 ~ 현재**

- React Native 앱 개발
- 지도 기능 구현
- 길찾기 기능 구현
- 서비스 배포 및 운영
