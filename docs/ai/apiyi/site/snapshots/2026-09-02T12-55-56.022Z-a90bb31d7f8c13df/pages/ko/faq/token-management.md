> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# KEY를 만드는 방법은 무엇입니까?

> APIYI token 관리 가이드로, 기본 token을 얻는 방법과 새 KEY를 만드는 방법에 대한 완전한 안내를 포함합니다

## 기존 기본 token 가져오기

1. 상단 내비게이션의 "Tokens" 페이지로 이동합니다: [https://api.apiyi.com/token](https://api.apiyi.com/token)

2. 페이지에서 기본 token을 찾고, 맨 오른쪽의 관리 메뉴를 클릭합니다

3. 관리 메뉴에서 복사 아이콘을 찾아 클릭하여 복사합니다

4. `sk-`로 시작하는 형식의 전체 키를 복사합니다

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="API 키 복사" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="API 키 복사" width="1466" height="1006" data-path="images/key-manage.png" />

## 새 KEY 만들기

기본 token 외에도 새 KEY를 만들어 사용 권한을 정확하게 제어할 수 있습니다:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="새 API Key 추가" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="새 API Key 추가" width="1284" height="1158" data-path="images/key-add-new.png" />

### 새 KEY 생성의 장점

* **잔액 제어**: 각 KEY마다 전용 잔액 한도를 설정할 수 있습니다
* **만료 관리**: KEY 만료 시간을 설정할 수 있습니다
* **유연한 할당**: 팀 사용이나 프로젝트 분리에 적합합니다

<Warning>
  **중요 참고**: 새 KEY를 만들 때는 **사용 가능한 모델을 설정할 필요가 없습니다**.

  여기에서는 화이트리스트 메커니즘을 사용합니다:

  * **사용 가능한 모델을 설정한 경우**: KEY는 지정한 모델만 사용할 수 있습니다
  * **사용 가능한 모델을 설정하지 않은 경우**: KEY는 사이트의 400개 이상의 모든 모델을 사용할 수 있습니다

  사용 가능한 모델은 설정하지 않는 것을 권장합니다. 그러면 모든 모델에 접근할 수 있습니다.
</Warning>

## KEY 형식 설명

* 모든 API KEY는 `sk-`으로 시작합니다
* KEY 길이는 보통 48-64자입니다
* KEY를 안전하게 보관하고, 공개된 장소에서 공유하지 마십시오

## 사용 권장 사항

1. **개발 테스트**: 빠른 개발 및 테스트를 위해 기본 token을 사용하십시오
2. **운영 환경**: 운영 프로젝트용 전용 KEY를 생성하여 관리와 모니터링을 더 쉽게 하십시오
3. **팀 협업**: 편리한 권한 관리를 위해 팀원별로 독립적인 KEY를 생성하십시오
