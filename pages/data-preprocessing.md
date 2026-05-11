# 인스타그램 인플루언서 데이터 전처리 (Data Preprocessing)

본 포스팅에서는 인스타그램 인플루언서 데이터 분석 프로젝트의 핵심 단계인 **데이터 전처리 과정**을 상세히 다룹니다. 원본 데이터를 분석 및 시각화(Tableau)에 적합한 형태로 변환하는 과정을 확인해 보세요.

---

## 1. 데이터 개요
- **대상 데이터:** Top Instagram Influencers
- **데이터 크기:** 200개 행
- **주요 컬럼:** rank, channel_info, influence_score, followers, avg_likes, country 등

## 2. 주요 전처리 단계

### ① 결측치 처리 (Handling Missing Values)
- `country` 컬럼의 결측치를 분석에 방해되지 않도록 `None` 또는 `Unknown`으로 대체하였습니다.

### ② 단위 변환 (Unit Conversion)
- 데이터의 `followers`, `avg_likes` 등은 `k(천)`, `m(백만)`, `b(십억)` 단위의 문자열로 되어 있었습니다.
- 이를 수치 계산이 가능하도록 실제 숫자형(float/int)으로 변환하였습니다.
  - 예: `1.2M` -> `1,200,000`

### ③ 퍼센트 데이터 처리
- `60_day_eng_rate`와 같은 퍼센트(%) 문자열 데이터를 숫자로 변환하여 산술 연산이 가능하게 했습니다.
  - 예: `0.5%` -> `0.005`

### ④ 파생 변수 생성 (Feature Engineering)
- **engagement_rate:** 팔로워 대비 평균 좋아요 수를 바탕으로 실제 참여율을 계산한 변수를 추가했습니다.
- **Tableau용 구간(Binning):** 시각화 시 그룹화를 용이하게 하기 위해 팔로워 규모별 구간 컬럼을 생성했습니다.

## 3. 전처리 결과
전처리가 완료된 데이터는 `insta_influencers_tableau_ready.csv`로 저장되었으며, 이를 활용해 Tableau 대시보드를 구축하고 심층 분석을 진행했습니다.

---

> **Tip:** 데이터 전처리는 전체 분석 과정의 80%를 차지할 만큼 중요합니다. 깨끗한 데이터가 정확한 인사이트를 만듭니다!
