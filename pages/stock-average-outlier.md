---
layout: post
title: "주가 이동평균선(SMA, WMA, EMA) 분석과 통계적 평균의 함정"
date: 2026-06-05
tags: ["Python", "Pandas", "yfinance", "Matplotlib", "Data Analysis"]
category: "Projects"
description: "주식 차트에서 흔히 사용되는 21일 이동평균선(단순, 가중, 지수)을 직접 구하고 비교해 보며, 데이터 분석에서 무심코 사용하는 '산술평균'이 극단적인 이상치(Outlier)에 어떻게 왜곡되는지 수학적/시각적 사례를 통해 알아봅니다."
---

# 주가 이동평균선 분석과 통계적 평균의 한계 (이상치의 영향)

데이터 분석과 비즈니스 의사결정에서 가장 먼저 마주하는 기본 지표는 단연 **'평균(Mean)'**입니다. 주식 차트를 볼 때도 5일, 20일, 60일 이동평균선(Moving Average)을 필수 지표로 활용하곤 하죠. 

하지만 데이터 분석 실무나 통계 모델링을 할 때 **"단순 산술평균" 하나에만 의존하는 것은 매우 위험할 수 있습니다.** 

이번 포스팅에서는 파이썬을 이용해 SK하이닉스 주가의 다양한 이동평균선(SMA, WMA, EMA)을 계산하고 비교해 보고, 이어서 단순 산술평균이 극단적인 이상치(Outlier)를 만났을 때 대푯값으로서 어떻게 무너지는지 수학적 사례와 그래프 시각화를 통해 깊이 있게 다뤄보겠습니다.

---

## Part 1: 주가 데이터 수집 및 21일 이동평균선 비교 분석

주식 분석에서 '이동평균선(Moving Average)'은 주가의 변동을 매끄럽게 다듬어 추세를 쉽게 파악할 수 있도록 돕는 지표입니다. 이동평균선을 계산하는 방식에 따라 크게 세 가지로 나뉩니다.

* **단순이동평균(SMA, Simple Moving Average):** 대상 기간의 종가를 산술평균한 가장 전통적인 형태입니다.
* **가중이동평균(WMA, Weighted Moving Average):** 최근 가격에 더 큰 가중치를 부여하여 단순이동평균보다 최근 추세를 빠르게 반영합니다.
* **지수이동평균(EMA, Exponential Moving Average):** 최근 가격에 지수적인 가중치를 부여하여 가장 즉각적으로 주가 변동에 반응합니다.

파이썬의 `yfinance`와 기술적 지표 계산 라이브러리인 `pandas_ta`를 활용하여 SK하이닉스(000660.KS)의 21일 기준 SMA, WMA, EMA를 시각적으로 분석해 보겠습니다.

### 1. StockAnalyzer 클래스 구현

이동평균선을 계산하고 차트를 그리는 과정을 모듈화하여 `StockAnalyzer`라는 클래스를 정의했습니다.

```python
!pip install pandas_ta

import datetime
import matplotlib.pyplot as plt
import pandas as pd
import pandas_ta as ta
import yfinance as yf

# 한글 깨짐 방지 설정
plt.rcParams["font.family"] = "NanumGothic"
plt.rcParams["axes.unicode_minus"] = False

class StockAnalyzer:
    """주가 데이터 수집 및 이동평균선 분석을 위한 모듈 클래스"""

    def __init__(self, ticker):
        self.ticker = ticker
        self.df = None

    def fetch_data(self, months=6):
        """지정한 개월 수만큼의 데이터를 야후 파이낸스에서 가져옴 (앞뒤 여유 기간 포함)"""
        end_date = datetime.datetime.today()
        # 21일 이동평균선 계산을 위해 시작일을 1개월 더 여유있게 잡습니다.
        start_date = end_date - pd.DateOffset(months=months + 1)

        print(f"[{self.ticker}] 데이터 다운로드 중... ({start_date.date()} ~ {end_date.date()})")
        self.df = yf.download(self.ticker, start=start_date, end=end_date)
        return self.df

    def add_moving_averages(self, period=21):
        """21일 기준 SMA, WMA, EMA를 계산하여 데이터프레임에 추가"""
        if self.df is None or self.df.empty:
            raise ValueError("데이터가 없습니다. fetch_data()를 먼저 실행하세요.")

        # 2차원 MultiIndex 데이터일 경우를 위해 Squeeze 처리하여 1차원 Series로 변환
        close_prices = self.df["Close"].squeeze()

        self.df["SMA_21"] = ta.sma(close_prices, length=period)
        self.df["WMA_21"] = ta.wma(close_prices, length=period)
        self.df["EMA_21"] = ta.ema(close_prices, length=period)
        return self.df

    def plot_chart(self, months=6):
        """최근 n개월 동안의 주가와 이동평균선을 시각화"""
        if self.df is None or "SMA_21" not in self.df.columns:
            raise ValueError("이동평균선 계산이 완료되지 않았습니다.")

        # 시각화할 타겟 기간만 필터링
        cutoff_date = datetime.datetime.today() - pd.DateOffset(months=months)
        plot_df = self.df.loc[cutoff_date:]

        plt.figure(figsize=(14, 7))

        # 그래프 플로팅
        plt.plot(plot_df.index, plot_df["Close"], label="종가 (Close)", color="#2c3e50", linewidth=2)
        plt.plot(plot_df.index, plot_df["SMA_21"], label="21일 SMA (단순)", color="#2980b9", linestyle="--")
        plt.plot(plot_df.index, plot_df["WMA_21"], label="21일 WMA (가중)", color="#e67e22", linestyle="-.")
        plt.plot(plot_df.index, plot_df["EMA_21"], label="21일 EMA (지수)", color="#e74c3c", linestyle="-")

        # 차트 스타일링
        plt.title(f"SK하이닉스({self.ticker}) 최근 {months}개월 21일 이동평균선 비교", fontsize=16, fontweight="bold", pad=15)
        plt.xlabel("날짜", fontsize=12)
        plt.ylabel("주가 (원)", fontsize=12)
        plt.grid(True, linestyle=":", alpha=0.5)
        plt.legend(loc="upper left", fontsize=11, frameon=True, shadow=True)

        # x축 날짜 가독성 개선
        plt.gcf().autofmt_xdate()
        plt.tight_layout()
        plt.show()

# --- 실행 코드 ---
if __name__ == "__main__":
    hynix_ticker = "000660.KS"
    analyzer = StockAnalyzer(hynix_ticker)
    analyzer.fetch_data(months=6)
    analyzer.add_moving_averages(period=21)
    analyzer.plot_chart(months=6)
```

### 2. 분석 결과 해석
차트를 그려보면, **EMA(지수이동평균)가 주가 변동에 가장 빠르게 밀착하여 반응**하며, 단순 산술평균인 **SMA가 가장 느리게 반응**하는 특징을 보입니다. 주가가 급등하거나 급락하는 시점에는 가중치 부여 방식의 차이로 인해 세 평균선이 엇갈리는 현상이 발생하는데, 이를 분석하면 현재 주가의 모멘텀(Momentum) 세기를 짚어볼 수 있습니다.

---

## Part 2: 데이터 분석에서 '산술평균'이 가지는 치명적인 함정

위의 주식 차트 분석에서 우리는 '산술평균(SMA)'을 사용했습니다. 주식 차트에서는 기간 내 모든 날의 가격이 고르게 중요하게 작용할 수 있으나, 일반적으로 데이터의 변동성이 크거나 극단적인 값이 섞여 있을 때 **단순 산술평균은 완전히 왜곡된 정보를 전달할 수 있습니다.**

대표적인 예로 **"이상치(Outlier)의 영향"**입니다. 

실제 어떤 학생 8명의 과제 수행 시간을 측정했다고 가정해 봅시다.

$$Times = [42, 45, 47, 48, 50, 51, 55, 180]$$

8명 중 7명의 학생은 40~50분대(최대 55분) 안에 과제를 완료했지만, 단 1명의 학생만이 180분이라는 극단적인 시간을 소요했습니다.

이 데이터를 바탕으로 통계 지표를 계산해 보겠습니다.

```python
import numpy as np

times = [42, 45, 47, 48, 50, 51, 55, 180]

# 1. 전체 데이터 산술평균
arithmetic_mean = np.mean(times)
print(f"전체 데이터의 산술 평균: {arithmetic_mean}분") # 결과: 64.75분

# 2. 180을 제외한 데이터 산술평균
times_filtered = [t for t in times if t != 180]
arithmetic_mean_filtered = np.mean(times_filtered)
print(f"180을 제외한 데이터의 산술 평균: {arithmetic_mean_filtered:.2f}분") # 결과: 48.29분

# 3. 전체 데이터 중앙값
median_val = np.median(times)
print(f"전체 데이터의 중앙값: {median_val}분") # 결과: 49.0분
```

### 왜 단순 평균만 보면 왜곡될까요?

* **전체 산술평균 (64.75분)**: 8명의 학생이 과제를 수행하는 데 걸린 평균 시간은 약 65분이라고 요약하게 됩니다. 하지만 실제 데이터 분포를 보면 **85% 이상의 학생이 55분 이하로 과제를 끝냈습니다.** 평균인 65분보다 오래 걸린 학생은 단 1명(180분) 뿐입니다. 즉, 이 평균은 대다수 학생들의 수행 능력을 대표하지 못합니다.
* **이상치를 제외한 평균 (48.29분)**: 혼자 유독 많은 시간이 걸린 특이 데이터(이상치)를 제외했더니 평균이 무려 16.5분가량 줄어들어 대다수 학생들이 분포한 40~50분 영역을 훌륭하게 대변하게 됩니다.
* **중앙값 (49.0분)**: 데이터를 순서대로 나열했을 때 가운데에 위치하는 값입니다. 중앙값은 극단적인 값(180분)의 크기에 직접적인 영향을 받지 않기 때문에 이상치가 포함되어 있더라도 여전히 집단의 일반적인 성향을 잘 나타냅니다.

이를 아래와 같이 바 차트로 시각화하여 한눈에 비교할 수 있습니다.

```python
import matplotlib.pyplot as plt
import pandas as pd

mean_data = {
    'Mean Type': ['전체 산술 평균\n(이상치 포함)', '180 제외 산술 평균\n(이상치 제외)'],
    'Value': [arithmetic_mean, arithmetic_mean_filtered]
}
mean_df = pd.DataFrame(mean_data)

plt.figure(figsize=(8, 5))
plt.bar(mean_df['Mean Type'], mean_df['Value'], color=['skyblue', 'lightcoral'])
plt.title('Outlier 포함/제외 산술 평균 비교', fontsize=14, fontweight='bold')
plt.ylabel('평균 시간 (분)', fontsize=12)
plt.ylim(0, max(arithmetic_mean, arithmetic_mean_filtered) * 1.2)

for index, row in mean_df.iterrows():
    plt.text(row['Mean Type'], row['Value'] + 1, f"{row['Value']:.2f}분", color='black', ha='center', fontsize=12, fontweight='bold')

plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()
```

---

## 💡 결론 및 데이터 분석가로서의 교훈

이 포스팅에서 다룬 주가 이동평균선과 평균의 왜곡 사례는 우리에게 중요한 통계적 교훈을 줍니다.

1. **평균의 한계를 인지할 것**: 산술평균은 모든 데이터를 동등하게 수치로 반영하므로, 비정상적이거나 극단적인 값(주가 폭등, 일시적 특이 데이터 등)이 존재할 때 전체 통계를 심하게 왜곡시킵니다.
2. **이동평균선의 적용**: 주가 분석을 할 때 가중치나 지수를 이용해 최근 데이터의 영향력을 키우는 WMA나 EMA를 적용하는 이유도, 과거 데이터의 비중을 유기적으로 통제하여 현재의 추세를 왜곡 없이 파악하려는 시도 중 하나입니다.
3. **대안 지표와 시각화 병행**: 현업에서 데이터를 정량화하여 보고할 때는 산술평균에만 매몰되지 말고 **중앙값(Median)**이나 **사분위수(IQR)**를 함께 살피고, **상자 그림(Box Plot)**이나 **산점도(Scatter Plot)**를 통해 데이터의 실제 분포를 직접 눈으로 확인하는 습관을 가져야 합니다.
