> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 동영상 에이전트 스킬

> HappyHorse-1.1(품질 지향 Alibaba 동영상 모델)를 에이전트 내에서 사용합니다 — Wan2.7과 wan 스킬을 공유하므로, --model happyhorse로 설정하면 됩니다.

<Note>
  **HappyHorse는 자체 스킬이 필요하지 않습니다**. Wan2.7과 **wan 동영상 스킬**을 공유하며 — 두 시리즈는 동일한 엔드포인트, 동일한 요청 구조, 그리고 동일한 `Wan&HappyHorse` token 그룹을 사용합니다. 모델 ID만 다릅니다. 전체 설정, `SKILL.md`, 그리고 스크립트는 [**Wan2.7 / HappyHorse 동영상 에이전트 스킬**](/ko/api-capabilities/wan/skills)을 참조하십시오.
</Note>

## 이 모델이 적합한 용도

<CardGroup cols={3}>
  <Card title="품질 지향" icon="sparkles">
    Wan2.7과 동일한 엔드포인트와 사용 방식에 더 강한 시각적 완성도를 더해, 이미지 품질이 가장 중요한 장면에 적합합니다.
  </Card>

  <Card title="최대 9장의 참조 이미지" icon="images">
    참조 이미지 기반 동영상 생성은 최대 9장의 참조 이미지를 지원합니다(Wan2.7은 결합된 참조 이미지를 5장으로 제한합니다).
  </Card>

  <Card title="하나의 공유 token" icon="key-round">
    `Wan&HappyHorse` 그룹 token 하나로 두 시리즈를 모두 사용할 수 있으며 — 전환 비용은 없습니다.
  </Card>
</CardGroup>

## 스킬 내부에서 사용하기

[Wan 동영상 스킬](/ko/api-capabilities/wan/skills)이 설치되면, `--model happyhorse`만 설정하면 됩니다:

```bash theme={null}
python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, golden forest, cinematic" --model happyhorse -o valley.mp4
```

스크립트는 전달한 자산(`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`)에서 올바른 모델 ID를 선택하므로 이름을 외울 필요가 없습니다.

<Warning>
  **주의 사항**: HappyHorse는 **참조 동영상이나 오디오 드라이빙을 지원하지 않습니다** —

  * `--ref-video`은 Wan2.7 전용이며, 스크립트가 이를 happyhorse에 대해 미리 거부합니다;
  * image-to-video는 첫 프레임 이미지만 사용하며, Wan2.7 스타일의 `driving_audio`은 없습니다;
  * 가격은 대략 Wan2.7의 1.5배입니다(720P \$0.126/s, 1080P \$0.224/s — 5초 720P 클립 기준 약 \$0.63)이므로, 대량 워크로드에서는 기본 `wan`를 사용하는 것이 좋습니다.

  스킬 스크립트가 이러한 차이를 모두 자동으로 차단하므로, 일반적인 `--model happyhorse` 사용에서는 문제가 발생하지 않습니다.
</Warning>

## 관련 문서

* [Wan2.7 / HappyHorse 동영상 에이전트 스킬 (전체 스크립트가 포함된 메인 페이지)](/ko/api-capabilities/wan/skills)
* [HappyHorse 동영상 생성 개요](/ko/api-capabilities/happyhorse/overview)
* [Seedance 2.0 동영상 에이전트 스킬](/ko/api-capabilities/seedance2/skills)
