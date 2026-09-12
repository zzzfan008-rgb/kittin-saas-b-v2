> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트 생성 (Chat Completions)

> 대화형 AI에 대규모 언어 모델을 사용하며, 단일 턴 대화, 다중 턴 대화, 롤플레잉 등을 지원합니다

## 개요

텍스트 생성(Chat Completions)은 APIYi 플랫폼의 핵심 기능 중 하나로, 지능형 대화와 텍스트 생성을 위해 400개 이상의 인기 AI 모델을 지원합니다. 통합된 OpenAI 호환 인터페이스를 통해 다음을 쉽게 구현할 수 있습니다.

* **지능형 대화**: 챗봇과 가상 비서 구축
* **콘텐츠 생성**: 글 작성, 창작 생성, 카피라이팅
* **코드 지원**: 코드 생성, 디버깅, 리팩터링 제안
* **지식 Q\&A**: 질문 응답, 지식 검색, 정보 추출
* **역할극**: 맞춤형 AI 캐릭터와 시나리오 시뮬레이션

<Info>
  OpenAI GPT-4, Claude, Gemini, DeepSeek, Qwen 및 400개 이상의 주류 모델을 하나의 API 키로 지원합니다.
</Info>

## 빠른 시작

### 기본 대화 예시

Chat Completions API를 사용하는 간단한 단일 턴 대화:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Tell me about the history of artificial intelligence"}
    ]
)

print(response.choices[0].message.content)
```

### 다중 턴 대화 예시

컨텍스트 인식 대화를 위해 `messages` 배열을 통해 대화 기록을 유지합니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "You are a professional Python programming assistant"},
    {"role": "user", "content": "How do I read a CSV file?"},
    {"role": "assistant", "content": "You can use pandas library's read_csv() function..."},
    {"role": "user", "content": "How do I filter specific columns?"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## 핵심 파라미터

### model (필수)

모델 이름을 지정합니다. 자세한 내용은 [모델 정보](/ko/api-capabilities/model-info)를 참고하십시오.

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages (필수)

`role` 및 `content` 필드를 포함하는 대화 메시지 배열입니다:

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    AI의 동작과 역할을 정의하는 시스템 프롬프트
  </Card>

  <Card title="user" icon="user">
    사용자 입력을 나타내는 사용자 메시지
  </Card>

  <Card title="assistant" icon="bot">
    AI 응답을 나타내는 어시스턴트 메시지
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "You are a friendly customer service assistant"},
    {"role": "user", "content": "I want to inquire about refunds"},
    {"role": "assistant", "content": "Sure, what issue did you encounter?"},
    {"role": "user", "content": "The product has quality issues"}
]
```

### temperature (선택 사항)

출력의 무작위성을 제어하며, 범위는 `0.0 ~ 2.0`, 기본값은 `1.0`입니다:

* **0.0 \~ 0.3**: 더 결정론적이고 일관적이며, 사실 기반 작업(번역, 요약, 코드 생성)에 적합합니다
* **0.7 \~ 1.0**: 창의성과 정확성의 균형이 좋으며, 일상 대화에 적합합니다
* **1.0 \~ 2.0**: 더 창의적이고 다양하며, 창작 글쓰기와 브레인스토밍에 적합합니다

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about spring"}],
    temperature=1.2  # Increase creativity
)
```

### max\_tokens (선택 사항)

비용과 응답 길이를 제어하기 위해 생성되는 token의 최대 수를 제한합니다:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Describe AI in one sentence"}],
    max_tokens=50  # Limit output length
)
```

<Warning>
  모델마다 token 가격이 다릅니다. 자세한 내용은 [과금](/ko/pricing)을 참고하십시오.
</Warning>

### top\_p (선택 사항)

Nucleus sampling 매개변수이며, 범위는 `0.0 ~ 1.0`입니다. 출력 다양성을 제어합니다:

* 낮은 값(예: `0.5`): 더 집중되고 결정론적인 출력
* 높은 값(예: `0.9`): 더 다양하고 무작위적인 출력

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Recommend some sci-fi movies"}],
    top_p=0.8
)
```

<Info>
  `temperature` 또는 `top_p` 중 하나만 조정하고, 둘 다 동시에 조정하지 않는 것이 권장됩니다.
</Info>

### stream (선택 사항)

스트리밍 출력을 활성화하여 결과를 token 단위로 반환하고, 사용자 경험을 향상시킵니다:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write an article about artificial intelligence"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 고급 사용법

### 시스템 프롬프트

`system` 역할을 통해 AI의 동작, 역할, 지식 범위, 응답 스타일을 정의합니다:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """You are a professional legal advisor assistant.

Rules:
1. Provide accurate and professional legal advice
2. Use plain language to explain legal terms
3. Cite relevant laws when necessary
4. Avoid absolute conclusions, suggest consulting professional lawyers
5. Maintain a neutral and objective stance"""
    },
    {"role": "user", "content": "Can employment contracts be terminated at any time?"}
]
```

### 롤플레잉

특정 개성과 전문성을 가진 AI 어시스턴트를 생성합니다:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "You are an experienced Python developer with 10 years of experience. You excel at solving problems with concise code, prefer Pythonic approaches, and proactively identify potential issues in code."
    },
    {"role": "user", "content": "Help me write a quicksort algorithm"}
]
```

### 컨텍스트 관리

긴 대화에서는 모델 token 한도를 초과하지 않도록 컨텍스트 길이를 적절히 관리합니다:

```python theme={null}
def manage_context(messages, max_history=10):
    """Keep recent conversation history"""
    # Preserve system messages
    system_messages = [m for m in messages if m["role"] == "system"]
    # Keep recent N messages
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# Usage example
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### JSON 모드 출력

일부 모델은 JSON 형식 출력을 강제로 지정하는 것을 지원합니다:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a data extraction assistant. Always return results in JSON format"},
        {"role": "user", "content": "Extract key information from this text: Zhang San, male, 30 years old, software engineer"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## 모범 사례

### 1. 적절한 모델 선택

작업 요구사항에 따라 가장 비용 효율적인 모델을 선택합니다:

| 작업 유형  | 권장 모델                                           | 참고                 |
| ------ | ----------------------------------------------- | ------------------ |
| 일상 대화  | gpt-4o-mini, deepseek-chat                      | 비용이 낮고 응답이 빠릅니다    |
| 복잡한 추론 | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | 성능이 뛰어나고 정확도가 높습니다 |
| 코드 생성  | gpt-4o, deepseek-coder, claude-sonnet-4.5       | 전문성이 높습니다          |
| 창작 글쓰기 | claude-sonnet-4.5, gpt-4o                       | 자연스러운 문장 작성        |
| 다국어 번역 | gemini-3-pro-preview, gpt-4o                    | 다양한 언어를 지원합니다      |

### 2. prompt 최적화

좋은 prompt는 출력 품질을 크게 향상시킵니다:

<CardGroup cols={2}>
  <Card title="명확한 작업" icon="check">
    필요한 맥락과 함께 AI가 무엇을 해야 하는지 명확히 명시합니다
  </Card>

  <Card title="형식 지정" icon="list">
    출력 형식, 길이, 톤 등을 정의합니다
  </Card>

  <Card title="예시 제공" icon="lightbulb">
    AI가 기대치를 이해할 수 있도록 입력-출력 예시를 제공합니다
  </Card>

  <Card title="단계별" icon="list-ordered">
    복잡한 작업을 여러 단계로 나눕니다
  </Card>
</CardGroup>

```python theme={null}
# ❌ Poor prompt
"Write an article"

# ✅ Good prompt
"""Write a popular science article about AI applications in healthcare.

Requirements:
- Length: 800-1000 words
- Audience: General readers
- Structure: Introduction, Application Scenarios, Case Analysis, Future Outlook
- Tone: Professional but accessible
- Include 2-3 real-world cases"""
```

### 3. 비용 관리

API 비용을 줄이기 위해 매개변수를 현명하게 사용합니다:

```python theme={null}
# Set max_tokens to limit output length
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Use more cost-effective model
    messages=messages,
    max_tokens=500,  # Limit maximum output
    temperature=0.7
)

{/* Regularly clean conversation history */}
if len(messages) > 20:
    messages = messages[-10:]  # Keep only recent 10 messages
```

### 4. 오류 처리

애플리케이션 안정성을 높이기 위해 예외 처리를 추가합니다:

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """Chat function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise

# Usage example
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API call failed: {e}")
```

### 5. 스트리밍 출력 사용

긴 텍스트 생성의 경우 streaming 출력은 사용자 경험을 향상시킵니다:

```python theme={null}
def stream_chat(messages):
    """Streaming output example"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    full_response = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full_response += content

    return full_response
```

## 자주 묻는 질문

### token 수를 어떻게 계산합니까?

모델마다 서로 다른 토크나이저를 사용합니다. 추정을 위해 `tiktoken` 라이브러리를 사용하십시오:

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """Estimate token count for text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# Usage example
text = "Hello, world!"
tokens = count_tokens(text)
print(f"Token count: {tokens}")
```

### 출력이 잘리는 이유는 무엇입니까?

가능한 이유는 다음과 같습니다:

1. `max_tokens` 한도에 도달함
2. 모델의 컨텍스트 윈도우가 충분하지 않음
3. 콘텐츠 안전 정책이 작동함

해결 방법은 다음과 같습니다:

* `max_tokens` 매개변수를 늘리십시오
* 더 긴 컨텍스트 지원을 제공하는 모델을 선택하십시오
* 원인을 확인하려면 `finish_reason` 필드를 확인하십시오

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # Increase output length limit
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("Output truncated due to length limit")
elif finish_reason == "content_filter":
    print("Output filtered due to content safety")
```

### 대화 메모리를 어떻게 구현합니까?

애플리케이션 레이어에서 대화 기록을 유지하십시오:

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """Send message and record conversation"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# Usage example
session = ChatSession(system_prompt="You are a friendly assistant")
print(session.chat("Hello"))
print(session.chat("What did I just say?"))  # AI can remember context
```

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 정보" icon="database" href="/ko/api-capabilities/model-info">
    지원되는 모든 모델과 과금을 확인합니다
  </Card>

  <Card title="텍스트 임베딩" icon="vector-square" href="/ko/api-capabilities/text-embedding">
    텍스트를 벡터 표현으로 변환합니다
  </Card>
</CardGroup>
