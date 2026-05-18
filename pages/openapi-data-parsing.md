---
layout: post
title: "Open API JSON 데이터를 Pandas DataFrame으로 변환하기"
date: 2026-05-18
tags: ["Python", "Pandas", "API", "Data Analysis"]
category: "Projects"
description: "경기데이터드림 Open API를 활용하여 JSON 응답 데이터를 수집하고, pandas DataFrame으로 변환하는 과정을 단계별로 알아봅니다."
---

# Open API 실습: JSON/XML → DataFrame 변환하기

오늘의 목표는 **Open API에서 받은 JSON 응답을 pandas DataFrame으로 바꾸는 것**입니다.

JSON이든 XML이든 데이터를 수집하는 최종 목표는 결국 **DataFrame**으로 만들어 분석에 활용하는 것입니다. DataFrame으로 바꾸는 순간, 지금까지 배운 pandas 전처리, EDA, 시각화, 프로젝트 기획을 모두 이어갈 수 있습니다.

이번 실습에서는 **경기도 경력단절 여성 취업지원 교육훈련 프로그램 현황 (경기데이터드림)** API를 활용합니다.

## 1. 라이브러리 및 기본 설정

가장 먼저 API 호출과 DataFrame 변환에 필요한 라이브러리를 불러오고, API 요청 주소와 인증키를 변수로 설정합니다.

```python
import requests
import pandas as pd

BASE_URL = "https://openapi.gg.go.kr/CareerendFemaleEmpspor"
SERVICE_NAME = "CareerendFemaleEmpspor"
API_KEY = "본인의_인증키"
```

## 2. API에 첫 요청 보내기

처음부터 많은 데이터를 요청하면 구조를 파악하기 어려울 수 있으므로 `pSize=5` (또는 100) 등으로 작게 요청해 구조를 확인합니다.

```python
params = {
    "KEY": API_KEY,
    "Type": "json",
    "pIndex": 1,
    "pSize": 100
}

response = requests.get(BASE_URL, params=params, timeout=10)
response.raise_for_status() # 에러가 발생하면 여기서 멈춤
```

## 3. JSON 응답 분석하기

응답을 성공적으로 받았다면, `response.json()`을 이용해 Python 딕셔너리로 변환합니다. 보통 공공데이터의 JSON은 다음과 같은 구조를 가집니다.

```json
{
    "서비스명": [
        {"head": [응답코드, 총 데이터 수 등]},
        {"row": [실제 분석할 데이터 목록]}
    ]
}
```

Python 코드로 구조를 한 단계씩 벗겨냅니다.

```python
json_data = response.json()
service_data = json_data[SERVICE_NAME]
```
`service_data`의 0번째는 `head`(응답 정보), 1번째는 `row`(실제 데이터)가 들어있음을 확인할 수 있습니다.

## 4. DataFrame으로 변환하기

이제 데이터가 들어있는 `row` 부분만 추출하여 DataFrame으로 만듭니다.

```python
row_data = service_data[1]['row']
df = pd.DataFrame(row_data)
```

위의 과정을 통해 복잡한 JSON 데이터가 깔끔한 표(테이블) 형태의 pandas DataFrame으로 변환되었습니다. 이제 이 DataFrame을 바탕으로 결측치 처리, 데이터 요약, 그리고 시각화 등 본격적인 데이터 분석(EDA)을 진행할 수 있습니다.

### 마치며

이번 프로젝트를 통해 Open API 연동의 핵심 원리와 JSON 데이터 구조를 완벽하게 이해하고, 분석 가능한 형태로 가공하는 능력을 기를 수 있었습니다.
