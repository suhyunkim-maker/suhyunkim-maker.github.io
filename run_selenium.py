from selenium import webdriver
from selenium.webdriver.common.by import By
import time

print("크롬 브라우저를 실행합니다...")
driver = webdriver.Chrome()

try:
    # 지마켓 로그인 페이지 URL
    target_url = "https://signin.gmarket.co.kr/LogIn/LogIn" 
    print(f"지마켓 로그인 페이지({target_url})로 이동합니다...")
    driver.get(target_url)
    
    # 1. 아이디 입력 필드 찾기
    print("아이디 입력 필드(typeMemberInputId)를 탐색합니다...")
    ele_id = driver.find_element(By.ID, 'typeMemberInputId')
    
    # 2. 비밀번호 입력 필드 찾기
    print("비밀번호 입력 필드(typeMemberInputPassword)를 탐색합니다...")
    ele_pw = driver.find_element(By.ID, 'typeMemberInputPassword')
    
    # (선택 사항) 로그인 버튼 찾기
    print("로그인 버튼(btn_memberLogin)을 탐색합니다...")
    btn_login = driver.find_element(By.ID, 'btn_memberLogin')
    
    print("지마켓 로그인 요소를 모두 성공적으로 찾았습니다!")
    
    # 아이디와 비밀번호를 입력하고 로그인 버튼을 클릭합니다.
    print("아이디와 비밀번호를 입력합니다...")
    ele_id.send_keys("your_actual_id")  # <-- 여기에 실제 지마켓 아이디를 입력하세요
    ele_pw.send_keys("your_actual_password")  # <-- 여기에 실제 지마켓 비밀번호를 입력하세요
    
    print("로그인 버튼을 클릭합니다...")
    btn_login.click()
    
    # [참고] 'by' 대신 By.XPATH를 사용해 특정 iframe 등을 찾는 예시입니다.
    # ele = driver.find_element(By.XPATH, '/html/body/iframe[1]')
    
    time.sleep(5)

except Exception as e:
    print(f"오류가 발생했습니다: {e}")
    
finally:
    print("브라우저를 종료합니다.")
    driver.quit()
