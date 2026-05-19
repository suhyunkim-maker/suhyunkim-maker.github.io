---
layout: post
title: "Playwright MCP 크롤링부터 최저가 알림 봇 만들기 (카드뉴스 포함)"
date: 2026-04-24
tags: ["Python", "Playwright", "Automation", "Bot"]
category: "Projects"
description: "AI 에이전트와 Playwright MCP를 활용한 번개장터 크롤링 경험과, 이를 활용한 최저가 알림 봇 파이썬 코드를 공유합니다."
---

# Playwright MCP를 활용한 번개장터 크롤링 자동화 🚀

![Playwright MCP 크롤링](../images/card_news_crawling_1779159179531.png)

최근 AI 에이전트와 **MCP(Model Context Protocol)**를 활용해 브라우저를 제어하고 데이터를 수집하는 과정이 매우 편리해졌습니다. 이번 포스팅에서는 Playwright MCP를 연동하여 번개장터에서 '물티슈' 상품 데이터를 자동으로 스크래핑(크롤링)해 본 경험을 공유합니다.

## 🛠 왜 Playwright MCP인가요?
기존에 파이썬 스크립트를 작성해서 Selenium이나 BeautifulSoup을 돌리는 과정과 달리, Playwright MCP를 사용하면 AI 어시스턴트(AI 에이전트)가 브라우저를 직접 띄우고:
- 페이지를 이동하고
- 동적 로딩(무한 스크롤)을 처리하며
- 원하는 형태의 데이터로 가공해서 전달해 줍니다.

개발자는 단순히 *"번개장터에서 물티슈 40개 상품의 가격과 링크를 스크래핑해줘"*라고 요청하기만 하면 됩니다!

## 🔍 크롤링 과정
1. **페이지 접속**: 번개장터 검색 페이지(https://m.bunjang.co.kr/search/products?q=물티슈)로 접속합니다.
2. **동적 스크롤**: 번개장터는 스크롤을 내릴 때마다 상품이 추가로 로드됩니다. Playwright의 `evaluate` 함수를 통해 자바스크립트로 스크롤을 내리고 요소를 기다리는 작업을 수행했습니다.
3. **데이터 추출**: 각 상품 카드에서 상품명, 가격, 그리고 상세 링크를 추출해 내어 구조화된 데이터로 저장했습니다.

## 📊 크롤링 결과 (요약)
아래는 성공적으로 수집한 40개의 물티슈 상품 중 일부 데이터입니다.

| 번호 | 상품명 | 가격 | 링크 |
| --- | --- | --- | --- |
| 1 | 산리오 물티슈 | 6,500원 | [상품 링크](#) |
| 2 | 베베숲 시그니처 그린 물티슈 20개 | 29,000원 | [상품 링크](#) |
| 3 | 애터미 물티슈(70매 x 8개) | 19,000원 | [상품 링크](#) |
| 4 | 컴비 combi 물티슈 온열기 | 25,000원 | [상품 링크](#) |
| 5 | 캠핑 물티슈 키친타올 파우치 | 28,000원 | [상품 링크](#) |
| ... | ... | ... | ... |
| 40 | 리멘트 뽑아쓰는 물티슈 낱개 식완 | 3,500원 | [상품 링크](#) |

---

# 🔔 실전 응용: 번개장터 꿀매 알림 봇 만들기

![최저가 필터링 과정](../images/card_news_filtering_1779159192634.png)

💡 **느낀점**: AI 에이전트와 MCP의 결합은 단순 반복 작업과 데이터 수집 프로세스를 혁신적으로 단축시켜 줍니다. 복잡한 파서(Parser)를 짤 필요 없이, 원하는 데이터의 형태만 지정해주면 브라우저 상호작용부터 데이터 정제까지 한번에 해결할 수 있어 강력합니다.

여기서 멈추지 않고, **수집한 데이터를 바탕으로 원하는 예산 이하의 '꿀매' 상품이 올라왔을 때 즉각 알려주는 '최저가 알림 봇' 파이썬 코드**를 작성해 보았습니다!

![알림 봇 작동 화면](../images/card_news_alert_1779159210907.png)

### 💻 파이썬 최저가 알림 봇 코드

아래 코드는 크롤링된 데이터를 `pandas` DataFrame으로 읽어들인 뒤, 내가 설정한 예산(예: 10,000원) 이하의 상품이 있으면 즉시 알림 메시지를 생성하는 로직입니다. 이 코드를 Crontab이나 스케줄러에 등록하면 나만의 모니터링 봇이 완성됩니다!

```python
import pandas as pd
import requests

# 1. 크롤링된 데이터 예시 (Playwright MCP 등을 통해 수집)
data = [
    {"상품명": "산리오 물티슈", "가격": 6500, "링크": "https://m.bunjang.co.kr/1"},
    {"상품명": "베베숲 시그니처 그린 물티슈 20개", "가격": 29000, "링크": "https://m.bunjang.co.kr/2"},
    {"상품명": "애터미 물티슈(70매 x 8개)", "가격": 19000, "링크": "https://m.bunjang.co.kr/3"},
    {"상품명": "리멘트 뽑아쓰는 물티슈 낱개 식완", "가격": 3500, "링크": "https://m.bunjang.co.kr/40"}
]
df = pd.DataFrame(data)

# 2. 목표 예산 설정 (예: 10,000원 이하 꿀매 찾기)
TARGET_PRICE = 10000

def find_lowest_price(df, target_price):
    """가격 기준으로 오름차순 정렬 후 목표 가격 이하인 상품만 필터링"""
    sorted_df = df.sort_values(by="가격", ascending=True)
    filtered_df = sorted_df[sorted_df["가격"] <= target_price]
    return filtered_df

def send_alert(message):
    """실제 텔레그램, 슬랙 등으로 알림을 보내는 함수"""
    print("🔔 [알림 봇 작동 중]")
    print(message)
    # 텔레그램 API 연동 예시
    # token = "YOUR_BOT_TOKEN"
    # chat_id = "YOUR_CHAT_ID"
    # requests.get(f"https://api.telegram.org/bot{token}/sendMessage?chat_id={chat_id}&text={message}")

def run_alert_bot():
    print("🔍 번개장터 물티슈 최저가 모니터링 시작...")
    deal_items = find_lowest_price(df, TARGET_PRICE)
    
    if not deal_items.empty:
        # 가장 저렴한 꿀매 상품(최상단) 추출
        best_deal = deal_items.iloc[0]
        msg = f"🔥 [최저가 발견!]\n상품명: {best_deal['상품명']}\n가격: {best_deal['가격']:,}원\n링크: {best_deal['링크']}"
        send_alert(msg)
    else:
        print(f"현재 {TARGET_PRICE:,}원 이하의 상품이 없습니다.")

if __name__ == "__main__":
    run_alert_bot()
```

AI와 MCP를 활용한 자동화는 무궁무진합니다. 여러분도 크롤링과 파이썬 코드를 결합하여 득템의 기회를 놓치지 마세요!
