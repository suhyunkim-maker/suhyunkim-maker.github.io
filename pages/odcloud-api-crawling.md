---
title: "공공데이터포털 API로 다중 페이지 데이터 수집 및 가공하기"
date: 2026-04-13
tags: ["Python", "Requests", "Pandas", "API"]
category: "Projects"
description: "odcloud.kr 공공데이터 API를 활용해 여러 페이지의 데이터를 한 번에 가져오고 Pandas로 가공하는 방법"
---

![API Data Crawling Cover](../images/cover_api.png)

# 공공데이터포털 API 연동 및 데이터 전처리

이번 포스팅에서는 **공공데이터포털(odcloud.kr)** 에서 제공하는 API를 활용하여 여러 페이지에 걸친 데이터를 반복문(`for`문)으로 한 번에 수집하고, 이를 `pandas`를 이용해 원하는 형태의 데이터프레임으로 전처리하는 과정을 공유합니다.

## 1. API 요청 준비하기

`requests` 라이브러리를 사용하여 API에 요청을 보냅니다. `api.odcloud.kr`은 일반적인 공공데이터 API(data.go.kr)와 파라미터 규격(`page`, `perPage`)이 약간 다릅니다.

```python
import requests
import pandas as pd
import time

base_url = "https://api.odcloud.kr/api/3076421/v1/uddi:78e189aa-a4ab-4848-93ac-ebe883a5b8a6_201909171012"
service_key = "발급받은_서비스키"
```

## 2. 여러 페이지 데이터 수집

반복문을 사용하여 지정된 페이지 수만큼 데이터를 가져오고, 모든 응답을 하나의 리스트에 모읍니다(`extend` 활용). 또한, 서버에 과도한 요청을 보내지 않도록 `time.sleep()`을 이용해 안전하게 호출합니다.

```python
all_items = []

for page in range(1, 6):
    params = {
        "serviceKey": service_key,
        "page": page,
        "perPage": 100,
        "returnType": "json"
    }

    res = requests.get(base_url, params=params, timeout=10)

    # 에러 방지 체킹
    if res.status_code != 200:
        print("HTTP 오류 발생")
        break

    data = res.json()

    if "data" in data:
        items = data["data"]
        all_items.extend(items)
    else:
        print("더 이상 데이터가 없습니다.")
        break

    time.sleep(0.5)
```

## 3. 데이터프레임 변환 및 형태 바꾸기 (Pivot)

수집된 데이터를 `pandas.DataFrame`으로 변환한 뒤, **특정 컬럼(예: 지역)을 열(Column)로, 다른 값들을 행(Row)으로 변환**하고 싶다면 `pivot_table`을 활용합니다.

```python
# 원본 데이터프레임
df = pd.DataFrame(all_items)

# 데이터 형태 변환 (Pivot)
df_pivot = df.pivot_table(
    index='측정일시',     # 행에 위치할 기준값
    columns='시군구명',   # 열로 올릴 지역 데이터
    values='미세먼지농도'  # 교차점에 들어갈 값
)

display(df_pivot)
```

이렇게 하면 여러 페이지에 흩어져 있던 방대한 데이터를 한 번에 수집하고, 한눈에 보기 쉬운 구조로 깔끔하게 정리할 수 있습니다.

---

**💡 팁:** URL과 Service Key를 바꿔서 다른 odcloud API에도 똑같은 방식을 적용할 수 있습니다.
