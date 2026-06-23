from selenium import webdriver
from selenium.webdriver.common.by import By
import time

print("크롬 브라우저를 실행합니다...")
driver = webdriver.Chrome()

try:
    # 예스24 도서 상세 페이지 URL
    target_url = "https://www.yes24.com/Product/Goods/188859332?WCode=033" 
    print(f"예스24 페이지({target_url})로 이동합니다...")
    driver.get(target_url)
    
    time.sleep(3) # 페이지가 로드될 때까지 충분히 대기
    
    print("페이지 내의 테이블(tr) 데이터를 추출합니다...")
    info = []
    
    # 페이지의 모든 tr 태그 탐색
    for tr in driver.find_elements(By.TAG_NAME, 'tr'):
        # 에러를 방지하기 위해 find_elements를 사용하여 th 태그를 안전하게 탐색합니다.
        # th가 존재하지 않는 행이 있을 때 find_element를 쓰면 NoSuchElementException 에러가 발생합니다.
        th_elements = tr.find_elements(By.TAG_NAME, 'th')
        th_text = th_elements[0].text if th_elements else ""
        
        # 한 행 안의 모든 열(td) 찾기
        cols = tr.find_elements(By.TAG_NAME, 'td')
        
        # 각 칸의 텍스트만 추출해서 리스트로 만들기
        row_data = [col.text for col in cols if col.text]
        
        # 데이터가 있는 행만 전체 데이터 리스트에 추가
        if th_text or row_data:
            info.append([th_text, row_data])

    print("\n[추출 완료된 데이터 리스트 (헤더 - 데이터)]")
    for item in info:
        if item[0] or item[1]:
            print(f"헤더: {item[0]} | 데이터: {item[1]}")
        
    time.sleep(5)

except Exception as e:
    print(f"오류가 발생했습니다: {e}")
    
finally:
    print("브라우저를 종료합니다.")
    driver.quit()
