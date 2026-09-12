> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 비동기 이미지 API가 있나요? 결과를 태스크 ID로 조회할 수 있나요?

> APIYI의 이미지 생성은 동기식만 지원합니다 — task-ID 비동기 조회는 없습니다. 이 글에서는 그 이유와 권장되는 접근 방식을 설명합니다.

## 간단한 답변

APIYI는 현재 **이미지 생성에 대한 비동기 task-ID 조회 인터페이스를 제공하지 않습니다**. 모든 이미지 모델은 **동기식**입니다. 즉, 요청이 장시간 연결을 열고 → 생성이 완료되기를 기다린 뒤 → 이미지를 직접 반환합니다.

저희는 **업스트림 패스스루**로 동작하며 **사용자의 비즈니스 데이터를 저장하지 않기 때문에**, “ID로 재연결하여 이전에 생성된 결과를 조회”하는 기능을 제공할 수 없습니다. 클라이언트 측에서 적절한 타임아웃을 설정하고, 연결을 유지하며, 자체 백엔드에 요청/응답을 기록하는 방식을 권장합니다.

<Info>
  **쉽게 말하면**: 동기 호출 + 적절한 타임아웃 + 클라이언트 측 작업 기록 = 사실상 직접 제어하는 경량 비동기 큐입니다. 최종 사용자 경험도 거의 동일합니다.
</Info>

## 왜 작업 ID 비동기 조회가 없습니까?

<CardGroup cols={3}>
  <Card title="상위 단계 패스스루" icon="forward">
    저희 이미지 엔드포인트는 상위 공식 API의 동기 동작을 그대로 따르며, 불일치나 지연을 유발할 수 있는 추가 큐 계층은 없습니다
  </Card>

  <Card title="개인정보 및 보안을 우선합니다" icon="shield">
    사용자 개인정보와 데이터 보안을 위해, 저희는 **어떠한 비즈니스 내용도 기록하지 않으므로**(prompt, 생성된 이미지), ID로 과거 결과를 조회하는 것은 설계상 불가능합니다
  </Card>

  <Card title="동기 방식으로 대부분의 경우를 커버합니다" icon="check">
    적절히 조정된 타임아웃과 keep-alive 연결을 사용하면, 대부분의 이미지 생성 요청은 단일 호출로 성공적으로 완료됩니다
  </Card>
</CardGroup>

## 권장 접근 방식

<Steps>
  <Step title="클라이언트에서 장기 연결 + 적절한 timeout 사용">
    HTTP 클라이언트 timeout을 모델의 생성 시간에 맞는 안전한 상한(보통 모델에 따라 60\~300초)으로 설정하고, keep-alive를 활성화하여 중간 네트워크 계층이 연결을 너무 일찍 끊지 않도록 합니다.

    생성 시간은 모델마다 크게 다릅니다 — 지원팀에 **모델별 권장 timeout 표**를 문의하십시오.
  </Step>

  <Step title="자체 백엔드에 작업과 응답을 기록하십시오">
    비즈니스 데이터를 저장하지 않으므로, 각 요청마다 비즈니스 측 작업 ID를 생성하고 prompt, 매개변수, 최종 결과(또는 오류)를 데이터베이스에 저장하십시오. 프런트엔드가 연결을 끊더라도 백엔드에는 전체 기록이 남습니다.
  </Step>

  <Step title="자체 비동기 래퍼를 구현하십시오">
    제품이 반드시 비동기여야 한다면(예: 프런트엔드가 오래 걸리는 호출을 기다릴 수 없는 경우), 백엔드에 얇은 비동기 계층을 추가하십시오:

    * 프런트엔드가 작업을 POST하면 → 백엔드가 큐에 넣고 → 비즈니스 작업 ID를 반환합니다
    * 백엔드 워커가 APIYI를 동기적으로 호출하고 → 결과를 데이터베이스에 다시 기록합니다
    * 프런트엔드는 자신의 작업 ID를 사용해 폴링하거나 WebSocket으로 구독합니다

    이는 기능적으로 플랫폼 기본 제공 비동기 API와 동일하며, 모든 데이터는 계속 자체 통제하에 유지됩니다.
  </Step>
</Steps>

## 클라이언트 측 비동기 래퍼(참고)

```python theme={null}
# Pseudocode: implement an async shell in your own backend
def submit_image_task(prompt):
    task_id = uuid4()
    db.save(task_id, status="pending", prompt=prompt)
    queue.push({"task_id": task_id, "prompt": prompt})
    return task_id

def worker(job):
    try:
        # Synchronous call to APIYI, timeout sized for the model
        result = apiyi_client.images.generate(
            prompt=job["prompt"],
            timeout=180,
        )
        db.update(job["task_id"], status="done", url=result.url)
    except TimeoutError:
        db.update(job["task_id"], status="failed", error="timeout")

def query_image_task(task_id):
    return db.get(task_id)  # frontend polls your own backend by task_id
```

<Tip>
  **핵심 개념**: 비즈니스 작업 ID는 **사용자 코드**에서 생성되어 **사용자 데이터베이스**에 저장됩니다. APIYI는 “동기적으로 생성” 단계만 담당합니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="동기 호출이 계속 시간 초과됩니다. 어떻게 해야 합니까?">
    대부분의 시간 초과는 **클라이언트 타임아웃이 너무 짧거나** **중간 네트워크 계층(reverse proxy, gateway 등)이 긴 연결을 너무 일찍 종료하기 때문입니다**.

    점검 순서:

    1. HTTP 클라이언트의 읽기 타임아웃을 60\~300초로 늘렸는지 확인합니다
    2. 중간 계층(nginx, API gateway, CDN)도 타임아웃이 늘어났는지 확인합니다
    3. 강제 연결 종료를 막기 위해 keep-alive를 활성화합니다
    4. 특정 모델에 대한 권장 타임아웃은 지원팀에 문의합니다
  </Accordion>

  <Accordion title="호출이 시간 초과되었지만 이미지가 실제로 생성되었을 수도 있습니다. 복구할 수 있습니까?">
    안타깝지만 불가능합니다. 저희는 상위단 패스스루이며 생성 결과를 저장하지 않습니다. 동기 호출이 시간 초과로 중단되면 **결과는 유실**되며 클라이언트가 다시 시도해야 합니다.

    해결 방법은 요청이 성공 직전에 끊기지 않도록 처음부터 타임아웃을 충분히 크게 설정하는 것입니다.
  </Accordion>

  <Accordion title="향후 비동기 task-ID 엔드포인트가 추가됩니까?">
    일부 상위 플랫폼이 느리다는 점과, 그런 경우 비동기가 더 적합하다는 점을 알고 있습니다. 저희도 **향후 비동기 기능을 추가할 수는 있지만**, 아직 일정은 없습니다. 약속드릴 수 없습니다. 그때까지는 위의 “클라이언트 측 비동기 래퍼” 방식을 따라 주십시오.
  </Accordion>

  <Accordion title="동영상 생성 엔드포인트(Sora / VEO 등)는 비동기입니까?">
    **예 — 동영상 생성은 본질적으로 비동기입니다**(상위 설계상). task\_id를 반환하며, 클라이언트가 task 상태를 폴링하여 최종 동영상을 가져옵니다. 이는 동기 이미지 엔드포인트와 다릅니다. 모델별 문서를 따라 주십시오.
  </Accordion>

  <Accordion title="서로 다른 이미지 모델에 권장되는 타임아웃은 얼마입니까?">
    생성 시간은 모델마다 크게 다릅니다(몇 초밖에 걸리지 않는 것도 있고, 30초 이상 또는 3\~5분이 걸리는 것도 있습니다). [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)의 **모델별 타임아웃 빠른 참고 표**를 보시거나, 특별한 경우에는 지원팀에 문의하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="이미지 API 핵심 사항 및 모범 사례" icon="book-check" href="/ko/api-capabilities/image-api-best-practices">
    모델별 타임아웃 표, base64 처리, 그리고 URL 출력 참고 자료
  </Card>

  <Card title="자체 비동기 큐 구축" icon="list-checks" href="/ko/api-capabilities/image-async-queue">
    동기 API를 작업 큐로 감싸는 엔지니어링 가이드
  </Card>

  <Card title="모델 선택 가이드" icon="cpu" href="/ko/faq/model-selection-guide">
    각 이미지 모델의 기능과 사용 사례
  </Card>

  <Card title="API 동시 실행 수 및 요청 제한" icon="gauge" href="/ko/faq/api-concurrency">
    동시 실행 수 제한, 요청 제한, 그리고 모범 사례
  </Card>

  <Card title="호출 로그 및 데이터" icon="file-text" href="/ko/faq/user-logs-control">
    데이터 보존 정책과 로그 제어
  </Card>

  <Card title="지원팀에 문의" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    모델별 타임아웃 표 또는 추가 상담을 받으십시오
  </Card>
</CardGroup>
