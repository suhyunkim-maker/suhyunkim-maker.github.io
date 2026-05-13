# 실전 크롤링: 사람인 채용 공고 데이터 분석 및 기술 스택 추출

오늘 파이썬의 `Requests`와 `BeautifulSoup` 라이브러리를 활용하여 국내 대표 채용 사이트인 **사람인(Saramin)**에서 실시간 채용 정보를 수집하고 분석하는 프로젝트를 진행했습니다.

---

## 1. 프로젝트 개요
단순히 웹페이지를 보는 것을 넘어, 파이썬 코드로 데이터를 자동 수집하고 분석하는 전체 과정을 실습했습니다.
- **대상 사이트**: 사람인 (Saramin)
- **검색 키워드**: "데이터 분석가"
- **사용 도구**: `Requests`, `BeautifulSoup`, `Pandas`

## 2. 주요 구현 내용

### 🛡️ User-Agent 설정
사람인과 같은 대형 사이트는 봇의 접근을 차단하기 때문에, 브라우저 정보를 담은 헤더를 추가하여 보안을 우회했습니다.

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
}
```

### 🔍 데이터 추출 및 저장
각 채용 공고의 **기업명**, **공고 제목**, **상세 링크**를 추출하여 CSV 파일로 저장했습니다.

```python
# 공고 상자 선택
jobs = soup.select('div.item_recruit')

# 데이터 수집 루프
for job in jobs:
    company = job.select_one('div.area_corp strong.corp_name a').text.strip()
    title = job.select_one('div.area_job h2.job_tit a').text.strip()
    # ... 데이터 저장
```

## 3. 기술 스택 분석 결과
수집된 공고 제목을 바탕으로 어떤 기술 스택이 가장 많이 요구되는지 분석해 보았습니다.

**요구 기술 스택 빈도수 (TOP 5):**
1. **Python**: 12건
2. **SQL**: 9건
3. **Tableau**: 5건
4. **Excel**: 4건
5. **R**: 3건

> *데이터 분석가 공고에서는 역시 Python과 SQL의 비중이 압도적으로 높음을 확인할 수 있었습니다.*

## 4. 마치며
이번 프로젝트를 통해 실제 상용 사이트의 데이터를 수집하고 분석하는 핵심 원리를 익혔습니다. 다음 단계로는 수집된 데이터를 바탕으로 한 시각화와 Selenium을 이용한 동적 크롤링을 시도해 볼 예정입니다.
