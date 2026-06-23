---
layout: post
title: "파이썬 셀레늄(Selenium) 웹 크롤링 기초: 지마켓 로그인 및 예스24 테이블 데이터 안전하게 추출하기"
date: 2026-06-23 13:15:00 +0900
categories: [Python, Selenium]
tags: [python, selenium, crawler, gmarket, yes24]
---

안녕하세요! 오늘은 파이썬의 대표적인 브라우저 자동화 라이브러리인 **셀레늄(Selenium)**을 사용하여 웹페이지 요소를 탐색하고 데이터를 추출하는 기초 가이드를 소개합니다.

본 가이드에서는 두 가지 실전 예제를 다룹니다.
1. **지마켓(Gmarket) 로그인 화면**에서 아이디/비밀번호 입력창 및 로그인 버튼 탐색
2. **예스24(YES24) 도서 상세 페이지**에서 표(Table)의 헤더(`th`)와 데이터(`td`)를 에러 없이 안전하게 매핑하여 수집하기

---

## 1. 셀레늄(Selenium) 설치 및 임포트
셀레늄을 사용하려면 터미널에 아래 명령어를 실행하여 설치합니다.

```bash
pip install selenium
```

설치가 완료되면 다음과 같이 필요한 모듈들을 불러옵니다. 요소 탐색을 위해 `By` 클래스를 사용하는 것이 핵심입니다.

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
```

---

## 2. 실전 예제 1: 지마켓 로그인 요소 탐색 (By.ID)
로그인 폼과 같이 명확한 고유 ID를 가진 요소는 `By.ID`를 사용해 쉽게 찾을 수 있습니다. 이때 ID 속성의 **대소문자 구분**에 주의해야 합니다.

```python
driver = webdriver.Chrome()
driver.get("https://signin.gmarket.co.kr/LogIn/LogIn")

# 아이디 및 비밀번호 입력창 찾기 (대소문자 유의: typeMemberInputId)
ele_id = driver.find_element(By.ID, 'typeMemberInputId')
ele_pw = driver.find_element(By.ID, 'typeMemberInputPassword')
btn_login = driver.find_element(By.ID, 'btn_memberLogin')

# 아이디/비밀번호 입력 후 로그인 클릭 예시
ele_id.send_keys("your_id")
ele_pw.send_keys("your_password")
btn_login.click()
```

---

## 3. 실전 예제 2: 예스24 테이블 데이터 안전하게 추출하기 (th - td)
표(`table`) 데이터를 추출할 때는 존재하지 않는 헤더(`th`)나 빈 셀로 인해 오류가 발생하기 쉽습니다. `find_elements`를 활용하면 에러 없이 안전하게 데이터를 수집할 수 있습니다.

### 💡 에러 방지 팁
* `find_element`는 요소를 찾지 못하면 `NoSuchElementException`을 던지며 스크립트를 정지시킵니다.
* 반면 `find_elements`는 요소를 찾지 못해도 에러를 내지 않고 **빈 리스트 `[]`**를 반환하므로 안전한 조건문 처리가 가능합니다.

```python
driver.get("https://www.yes24.com/Product/Goods/188859332?WCode=033")
time.sleep(3) # 로딩 대기

info = []
for tr in driver.find_elements(By.TAG_NAME, 'tr'):
    # 안전하게 th 태그(헤더) 가져오기
    th_elements = tr.find_elements(By.TAG_NAME, 'th')
    th_text = th_elements[0].text if th_elements else ""
    
    # td 태그(데이터) 가져오기
    cols = tr.find_elements(By.TAG_NAME, 'td')
    row_data = [col.text for col in cols if col.text]
    
    if th_text or row_data:
        info.append([th_text, row_data])

# 수집 결과 출력
for item in info:
    print(f"헤더: {item[0]} | 데이터: {item[1]}")
```

---

## 4. 마치며
셀레늄은 동적으로 렌더링되는 모던 웹 페이지를 크롤링하거나 자동화 테스트를 진행할 때 강력한 도구입니다. 요소를 탐색할 때는 항상 예외 상황(`NoSuchElementException`)을 대비하는 예외 처리나 `find_elements` 리스트 탐색 기법을 적용하는 것이 좋습니다.

코드는 전체 깃허브 저장소에 업로드되어 있으니 자유롭게 참고해 보세요!
