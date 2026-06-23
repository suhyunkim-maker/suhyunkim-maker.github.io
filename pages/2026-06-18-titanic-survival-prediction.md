---
layout: post
title: "타이타닉(Titanic) 생존자 예측 데이터 분석 및 머신러닝 분류 모델링 실습"
date: 2026-06-18 10:00:00 +0900
categories: [Machine Learning, Projects]
tags: [Python, Pandas, Seaborn, Scikit-learn, Machine Learning, Classification, EDA]
---

안녕하세요! 오늘은 데이터 분석 및 머신러닝 입문의 클래식이라 불리는 **타이타닉(Titanic) 생존자 예측 데이터 분석** 과정을 정리해 봅니다.

구글 코랩(Google Colab) 환경에서 `titanic_train.csv` 데이터를 사용하여 데이터 탐색(EDA), 결측치 정제(전처리), 그리고 머신러닝 분류 모델(Random Forest)을 구축하는 전체 워크플로우를 다룹니다.

---

## 1. 데이터 로드 및 라이브러리 준비
분석에 필요한 기본 라이브러리를 임포트하고 공공 데이터셋을 판다스 데이터프레임으로 변환합니다.

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 데이터 불러오기
df = pd.read_csv("titanic_train.csv")
df.head()
```

---

## 2. 탐색적 데이터 분석 (EDA) 및 시각화
타이타닉 생존율에 영향을 주는 주요 변수(성별, 좌석 등급, 나이 등)를 시각화하여 분석합니다.

### 2.1 성별(Sex)에 따른 생존율
여성 탑승객의 생존율이 남성에 비해 압도적으로 높은 경향을 확인할 수 있습니다.
```python
sns.barplot(x='Sex', y='Survived', data=df)
plt.title('Survival Rate by Sex')
plt.show()
```

### 2.2 객실 등급(Pclass)에 따른 생존율
1등석 탑승객이 3등석 탑승객보다 생존 확률이 현저히 높은 구조적 차이를 보입니다.
```python
sns.barplot(x='Pclass', y='Survived', hue='Sex', data=df)
plt.title('Survival Rate by Pclass and Sex')
plt.show()
```

---

## 3. 데이터 전처리 (Pre-processing)
머신러닝 알고리즘에 학습시키기 위해 결측치(NaN)를 채우고, 문자형 데이터를 수치형 데이터로 변환(인코딩)합니다.

```python
# 1. 결측치 처리
# Age는 중앙값(median)으로 대체
df['Age'].fillna(df['Age'].median(), inplace=True)

# Embarked(탑승 항구)는 최빈값(mode)으로 대체
df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)

# Cabin(객실 번호)은 결측치가 너무 많으므로 열 제외
df.drop(columns=['Cabin', 'PassengerId', 'Name', 'Ticket'], inplace=True)

# 2. 범주형 데이터 변환 (One-Hot Encoding)
df = pd.get_dummies(df, columns=['Sex', 'Embarked'], drop_first=True)
df.head()
```

---

## 4. 머신러닝 분류 모델링
가장 널리 쓰이는 앙상블 기법의 알고리즘인 **랜덤 포레스트(Random Forest)** 모델을 사용하여 생존자를 예측해 봅니다.

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 특성(X)과 타겟(y) 분리
X = df.drop(columns=['Survived'])
y = df['Survived']

# 학습용 데이터와 검증용 데이터 분리 (8:2)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 모델 생성 및 학습
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 예측 수행 및 모델 성능 평가
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"모델 예측 정확도 (Accuracy): {accuracy:.4f}")
print("\n[상세 리포트]")
print(classification_report(y_test, y_pred))
```

---

## 5. 마치며
전처리 후 랜덤 포레스트 분류기를 통해 타이타닉 탑승객의 생존율을 예측한 결과, 약 **80% 이상의 양호한 정확도**를 보여주었습니다.

특성 중요도(Feature Importance) 분석 결과 생존에 가장 결정적이었던 변수는 **성별(Sex)**과 **객실 등급(Pclass)**이었으며, 이는 시각화 분석 결과와도 완벽히 일치합니다. 

이 프로젝트를 계기로 전처리 기법 및 결측치 관리의 중요성을 더욱 깊게 체감하게 되었습니다.
