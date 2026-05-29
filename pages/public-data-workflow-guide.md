---
layout: post
title: "공공데이터 분석 및 블로그 자동 배포 워크플로우"
date: 2026-05-05
tags: ["Python", "Automation", "API", "Data Analysis"]
category: "Projects"
description: "공공데이터포털 API 연동부터 데이터 분석, GitHub Pages 블로그 자동 배포까지의 전체 워크플로우 가이드입니다."
---

# 🚀 공공데이터 분석 및 블로그 자동 배포 워크플로우

본 문서는 **공공데이터포털(data.go.kr) Open API**를 활용하여 데이터를 수집·분석하고, 그 결과를 **GitHub Pages 블로그**에 자동으로 포스팅하는 전체 작업 흐름을 정리한 가이드입니다.

---

## 1. 사전 준비 (Prerequisites)

- **API 인증키 발급**: 공공데이터포털에서 활용할 API(예: 전국문화축제표준데이터)의 활용 신청을 완료하고 `서비스 키(Decoding)`를 확보합니다.
- **Python 환경 준비**: `requests`, `pandas`, `matplotlib` 라이브러리가 설치되어 있어야 합니다.
- **블로그 저장소**: GitHub Pages로 호스팅되는 개인 블로그 저장소(Repository)가 로컬에 Clone 되어 있어야 합니다.

---

## 2. 1단계: Open API 데이터 수집 (Jupyter Notebook / Python)

### API 호출 및 반복 수집 (Pagination)

API의 한 페이지에 보여지는 데이터 수(`numOfRows`)의 한계가 있으므로, 전체 개수(`totalCount`)를 기반으로 전체 페이지 수를 계산하여 모든 데이터를 수집합니다.

```python
import requests
import pandas as pd
import math

BASE_URL = "https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api"
SERVICE_KEY = "본인의_인증키_입력"
PAGE_SIZE = 1000

# 1. 첫 페이지 호출로 전체 데이터 수 파악
params = {"serviceKey": SERVICE_KEY, "pageNo": 1, "numOfRows": PAGE_SIZE, "type": "json"}
response = requests.get(BASE_URL, params=params).json()
total_count = response['response']['body']['totalCount']
total_pages = math.ceil(total_count / PAGE_SIZE)

# 2. 전체 페이지 순회
all_rows = []
for page in range(1, total_pages + 1):
    params["pageNo"] = page
    res = requests.get(BASE_URL, params=params).json()
    items = res['response']['body']['items']
    all_rows.extend(items)

# 3. 원본 DataFrame 생성
df_raw = pd.DataFrame(all_rows)
```

---

## 3. 2단계: 데이터 전처리 및 탐색적 데이터 분석(EDA)

수집된 데이터는 영문 키값이나 문자열 형식의 날짜 등으로 되어 있으므로, 분석하기 좋은 형태로 변환합니다.

### 2-1. 데이터 전처리

```python
# 컬럼명 한글화
rename_dict = {"fstvlNm": "축제명", "fstvlStartDate": "시작일", "fstvlEndDate": "종료일", "rdnmadr": "도로명주소"}
df = df_raw.rename(columns=rename_dict)

# 날짜형 변환 및 파생변수 생성
df["시작일"] = pd.to_datetime(df["시작일"], errors="coerce")
df["종료일"] = pd.to_datetime(df["종료일"], errors="coerce")
df["축제기간(일)"] = (df["종료일"] - df["시작일"]).dt.days + 1
df["개최월"] = df["시작일"].dt.month

# 주소에서 '시도명' 추출
df["시도명"] = df["도로명주소"].astype(str).str.split().str[0]
```

### 2-2. EDA (탐색적 데이터 분석) 시각화

```python
import matplotlib.pyplot as plt
plt.rcParams["font.family"] = "Malgun Gothic" # Windows 폰트 설정

# 시도별 축제 수 집계 및 시각화
region_count = df.groupby("시도명").size().sort_values(ascending=False).head(10)
region_count.plot(kind="bar", title="지역별 축제 수 Top 10", figsize=(10,5))
plt.show()
```

---

## 4. 3단계: 분석 결과 블로그 자동 포스팅

분석된 인사이트와 코드를 바탕으로 Markdown 문서를 작성하고, GitHub 블로그에 배포합니다.

### 3-1. 포스팅 Markdown 작성 (`pages/` 폴더)

분석 과정, 코드 블록, 인사이트를 담아 `.md` 파일로 블로그 `pages/` 폴더 내에 저장합니다.

### 3-2. 블로그 메인 인덱스 등록 (`posts.json` 업데이트)

블로그 메인 화면에 글이 노출되도록 메타데이터를 `posts.json` 최상단에 삽입합니다.

### 3-3. GitHub 배포 (Git 커밋 및 푸시)

터미널(또는 CMD)을 열고 블로그 폴더로 이동한 뒤 변경사항을 Git에 반영합니다.

```bash
# 블로그 폴더로 이동
cd suhyunkim-maker.github.io

# 변경사항 추가 및 커밋
git add .
git commit -m "Add new post: 공공데이터 분석 EDA 가이드"

# GitHub 원격 저장소에 반영 (배포)
git push origin main
```
