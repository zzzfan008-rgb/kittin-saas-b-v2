> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация видео с привязкой к asset в коде

> Пошаговое руководство по работе с asset-ссылками Seedance 2.0 в коде: загрузите локальное изображение, отправьте его на ingest, чтобы получить ID вида asset://, затем укажите его для генерации видео с сохранением персонажа, а также опрашивайте статус и скачивайте результат — готовые скрипты на Python / cURL / Node.js.

<Info>
  Эта страница посвящена **кодовый путь**: преобразуйте локальное изображение в идентификатор актива `asset://`, затем используйте его для генерации видео с единым образом персонажа — один скрипт, от начала до конца. Для документации по каждому эндпоинту и веб-интерфейса без кода см. [Библиотека активов](/ru/api-capabilities/seedance2/asset-library); для полной таблицы параметров эндпоинта генерации см. [API генерации видео](/ru/api-capabilities/seedance2/video-generation).

  Библиотека активов бесплатна в составе Seedance 2.0 API — без ежегодной платы (официально — это отдельно приобретаемая дополнительная опция: годовой контракт на шестизначную сумму в CNY для клиентов без рамочного соглашения).
</Info>

## Когда вам нужны ссылки на активы

При генерации видео с единым образом персонажа Seedance 2.0 **не принимает изображения-референсы с фотореалистичными человеческими лицами напрямую** (фильтрация против deepfake). Сначала вы должны загрузить портрет как доверенный asset, получить `asset://xxx` asset ID и указать его в запросе на генерацию — чтобы лицо и одежда персонажа оставались единообразными в разных эпизодах и кадрах. Сначала найдите свой случай:

| Тип материала                                                     | Примеры                                              | Как использовать                                                                                                                                                                                                            |
| ----------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Аниме / стилизованные персонажи                                   | Anime, cartoon, 3D-cartoon characters                | Фотореалистичного лица нет, обычно не блокируется: используйте public URL / Base64 изображение-референс напрямую — **ingest не нужен**; начните с шага 4 (generate) на этой странице                                        |
| Виртуальный аватар (фотореалистичный портрет, сгенерированный AI) | Сгенерировано моделью, такого человека не существует | Используйте virtual-avatar ingest (полный поток на этой странице) и укажите ID `asset://`                                                                                                                                   |
| Реальное лицо                                                     | Фотографии знаменитостей, моделей или вас самих      | Сначала запустите полностью автоматизированный API-поток проверки реального человека, чтобы получить группу asset реального человека, и передайте `groupId` при ingest — остальной код полностью совпадает с этой страницей |

## Предварительные требования

<Warning>
  **Два разных ключа — не перепутайте их**:

  * **КЛЮЧ библиотеки ресурсов** (создаётся в разделе Settings → КЛЮЧ библиотеки ресурсов на icover.ai, `sk-...`): для загрузки / добавления / запросов к ресурсам; см. [Шаг 0 на странице библиотеки ресурсов](/ru/api-capabilities/seedance2/asset-library).
  * **Видеотокен APIYI Seedance** (создаётся на api.apiyi.com, `sk-...`, с включённой группой `SeeDance2`, общей для версии 2.5 и семейства 2.0): для эндпоинта генерации видео.
</Warning>

## Пайплайн в общих чертах

Локальное изображение → 1) `presign` URL для прямой загрузки и `PUT` файл, чтобы получить публичный URL → 2) загрузите объект и получите ID объекта → 3) выполняйте опрос, пока `Active` (около 13 секунд на изображение) → 4) укажите `asset://<Id>` в запросе на генерацию, называя его «Image 1» в prompt → 5) выполняйте опрос задачи, пока `succeeded` → 6) скачайте `content.video_url` (подписанная ссылка **истекает через 24 часа** — сохраните ее сразу).

Если у вас уже есть публичный URL изображения, пропустите шаг 1. ID объектов постоянны — загрузите один раз, используйте в ссылках всегда.

## Полный код

<CodeGroup>
  ```python Python (полный цикл: загрузка → приём → генерация → скачивание) theme={null}
  import time
  from pathlib import Path

  import requests

  ASSET_KEY = "sk-your-asset-library-KEY"  # icover.ai Settings → Asset Library KEY
  APIYI_KEY = "sk-your-APIYI-token"        # api.apiyi.com: token needs the SeeDance2 group
  IMAGE_PATH = "portrait.jpg"              # local reference image (virtual avatar)
  PROMPT = "The character in Image 1 smiles at the camera, slow push-in, natural light"

  ICOVER = "https://icover.ai/api"
  SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  ASSET_HEADERS = {"Authorization": f"Bearer {ASSET_KEY}"}
  APIYI_HEADERS = {
      "Authorization": f"Bearer {APIYI_KEY}",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",  # required: works around a gateway gzip header mismatch
  }


  def upload_image(path: str) -> str:
      """1) presign + PUT the local image; returns a public URL (skip if you have one)"""
      ext = Path(path).suffix.lstrip(".").lower() or "jpg"
      content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
      data = requests.post(
          f"{ICOVER}/storage/presign", headers=ASSET_HEADERS,
          json={"ext": ext, "contentType": content_type}, timeout=30,
      ).json()["data"]
      resp = requests.put(
          data["uploadUrl"], data=Path(path).read_bytes(),
          headers={"Content-Type": content_type}, timeout=120,  # must match the presign
      )
      resp.raise_for_status()
      return data["publicUrl"]


  def ingest_asset(image_url: str, label: str = "", group_id: str = None) -> str:
      """2) ingest the asset; returns the asset Id. Real-person assets: pass the verified group_id"""
      body = {"imageUrl": image_url, "label": label}
      if group_id:
          body["groupId"] = group_id
      r = requests.post(
          f"{ICOVER}/asset-library/assets", headers=ASSET_HEADERS,
          json=body, timeout=60,
      ).json()
      return r["Result"]["Id"]


  def wait_asset_active(asset_id: str, timeout: int = 90) -> None:
      """3) poll the ingest status until Active (about 13 seconds per image, no SLA)"""
      deadline = time.time() + timeout
      while time.time() < deadline:
          status = requests.get(
              f"{ICOVER}/asset-library/assets/{asset_id}",
              headers=ASSET_HEADERS, timeout=30,
          ).json()["Result"]["Status"]
          print("asset status:", status)
          if status == "Active":
              return
          if status == "Failed":
              raise RuntimeError("Ingest failed: check format / aspect ratio 0.4-2.5 / side 300-6000px, then re-upload")
          time.sleep(3)
      raise TimeoutError("Not Active after 90 seconds — investigate and retry")


  def create_video_task(asset_id: str) -> str:
      """4) create the generation task referencing asset://. Say "Image 1" in the prompt, never the raw asset ID"""
      body = {
          "model": "doubao-seedance-2-0-260128",
          "content": [
              {"type": "text", "text": PROMPT},
              {"type": "image_url",
               "image_url": {"url": f"asset://{asset_id}"},
               "role": "reference_image"},
          ],
          "resolution": "720p", "ratio": "16:9", "duration": 5,
      }
      return requests.post(SEEDANCE, headers=APIYI_HEADERS, json=body, timeout=60).json()["id"]


  def wait_video(task_id: str) -> dict:
      """5) poll the task until a terminal state (succeeded / failed / expired)"""
      while True:
          time.sleep(20)
          task = requests.get(f"{SEEDANCE}/{task_id}", headers=APIYI_HEADERS, timeout=30).json()
          print("task status:", task.get("status"))
          if task.get("status") in ("succeeded", "failed", "expired"):
              return task


  def download(task: dict, out: str) -> None:
      """6) download the video. The signed link expires in 24 hours; no Authorization header here"""
      with requests.get(task["content"]["video_url"], stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(out, "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print("saved", out)


  if __name__ == "__main__":
      public_url = upload_image(IMAGE_PATH)
      asset_id = ingest_asset(public_url, label="character-A-front")
      print("asset ID:", f"asset://{asset_id}")
      wait_asset_active(asset_id)

      task_id = create_video_task(asset_id)
      print("task_id:", task_id)
      task = wait_video(task_id)
      if task["status"] == "succeeded":
          print("billed tokens:", task["usage"]["completion_tokens"])
          download(task, f"{task_id}.mp4")
      else:
          print("task did not succeed:", task.get("error"))
  ```

  ```bash cURL (пошагово) theme={null}
  # 1) Request a presigned upload URL (skip 1-2 if you already have a public image URL)
  curl -X POST https://icover.ai/api/storage/presign \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"ext":"jpg","contentType":"image/jpeg"}'
  # → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

  # 2) PUT the file (Content-Type must match the presign); publicUrl is then your public address
  curl -X PUT "the-uploadUrl-you-just-received" \
    -H "Content-Type: image/jpeg" \
    --data-binary @portrait.jpg

  # 3) Ingest the asset (real-person assets: add "groupId":"the-verified-group-ID")
  curl -X POST https://icover.ai/api/asset-library/assets \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://cdn.icover.ai/uploads/seedance/xxx.jpg","label":"character-A-front"}'
  # → { ..., "Result": { "Id": "asset-2026xxxx-xxxxx" } }

  # 4) Poll every 3 seconds until Result.Status == "Active"
  curl https://icover.ai/api/asset-library/assets/asset-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-asset-library-KEY"

  # 5) Create the generation task referencing asset:// (switch to your APIYI token!
  #    Refer to the asset as "Image 1" in the prompt)
  curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
    -H "Authorization: Bearer sk-your-APIYI-token" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-260128",
      "content": [
        {"type":"text","text":"The character in Image 1 smiles at the camera, slow push-in, natural light"},
        {"type":"image_url","image_url":{"url":"asset://asset-2026xxxx-xxxxx"},"role":"reference_image"}
      ],
      "resolution":"720p","ratio":"16:9","duration":5
    }'
  # → {"id":"cgt-2026xxxx-xxxxx"}

  # 6) Poll every 20 seconds; once status=succeeded, download content.video_url (expires in 24h)
  curl https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-APIYI-token"
  ```

  ```javascript Node.js (полный цикл) theme={null}
  import { readFileSync, writeFileSync } from "node:fs";

  const ASSET_KEY = "sk-your-asset-library-KEY"; // icover.ai Settings → Asset Library KEY
  const APIYI_KEY = "sk-your-APIYI-token";       // api.apiyi.com: token needs the SeeDance2 group
  const IMAGE_PATH = "portrait.jpg";

  const ICOVER = "https://icover.ai/api";
  const SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const AH = { Authorization: `Bearer ${ASSET_KEY}`, "Content-Type": "application/json" };
  const VH = { Authorization: `Bearer ${APIYI_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1) presign + PUT the local image to get a public URL
  const { data } = await fetch(`${ICOVER}/storage/presign`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ ext: "jpg", contentType: "image/jpeg" }),
  }).then((r) => r.json());
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync(IMAGE_PATH),
  });

  // 2) Ingest the asset (real-person assets: add groupId to the body)
  const ingest = await fetch(`${ICOVER}/asset-library/assets`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ imageUrl: data.publicUrl, label: "character-A-front" }),
  }).then((r) => r.json());
  const assetId = ingest.Result.Id;
  console.log("asset ID:", `asset://${assetId}`);

  // 3) Poll until Active (about 13 seconds)
  let assetStatus;
  do {
    await sleep(3000);
    const info = await fetch(`${ICOVER}/asset-library/assets/${assetId}`, { headers: AH })
      .then((r) => r.json());
    assetStatus = info.Result.Status;
    console.log("asset status:", assetStatus);
  } while (assetStatus !== "Active" && assetStatus !== "Failed");
  if (assetStatus === "Failed") throw new Error("Ingest failed — check the image and re-upload");

  // 4) Create the generation task referencing asset://
  //    (say "Image 1" in the prompt, never the raw asset ID)
  const { id } = await fetch(SEEDANCE, {
    method: "POST", headers: VH,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-260128",
      content: [
        { type: "text", text: "The character in Image 1 smiles at the camera, slow push-in, natural light" },
        { type: "image_url", image_url: { url: `asset://${assetId}` }, role: "reference_image" },
      ],
      resolution: "720p", ratio: "16:9", duration: 5,
    }),
  }).then((r) => r.json());
  console.log("task_id:", id);

  // 5) Poll the task until a terminal state
  let task;
  do {
    await sleep(20000);
    task = await fetch(`${SEEDANCE}/${id}`, { headers: VH }).then((r) => r.json());
    console.log("task status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 6) Download (the signed link expires in 24 hours; no Authorization header here)
  if (task.status === "succeeded") {
    const buf = Buffer.from(await fetch(task.content.video_url).then((r) => r.arrayBuffer()));
    writeFileSync(`${id}.mp4`, buf);
    console.log(`saved ${id}.mp4`);
  } else {
    console.log("task did not succeed:", task.error);
  }
  ```
</CodeGroup>

<Warning>
  Ссылайтесь на ресурсы в prompt как на «Image 1», «Image 2» (в соответствии с их порядком в массиве `content`) — **никогда не указывайте в prompt необработанный ID ресурса**.
</Warning>

## Расширенное использование с несколькими ресурсами

* **Несколько изображений-референсов**: поместите несколько `image_url` элементов в `content` (0–9 изображений, каждое с `role: "reference_image"`) и указывайте на них как на «Изображение 1», «Изображение 2» по порядку. Для одного персонажа наилучшую согласованность дает совместное использование полного фронтального снимка в полный рост и нейтрального крупного плана лица анфас.
* **Смешивание источников**: `asset://` ID, публичные URL и Base64 (`data:image/png;base64,...`) можно смешивать в одном массиве `content` — только изображения с фотореалистичными лицами должны проходить через `asset://`.
* **Видео / аудио-референсы**: вы также можете добавить 0–3 `video_url` элемента (`role: "reference_video"`) и 0–3 `audio_url` элемента (`role: "reference_audio"`); требуется как минимум одно изображение или одно видео, а аудио должно отправляться вместе с изображением или видео.
* **Ресурсы реального человека**: сначала запустите [полностью автоматизированный поток проверки реального человека](/ru/api-capabilities/seedance2/asset-library) — актер проходит проверку на живость, и вы получаете отдельную группу ресурсов для реального человека `GroupId`; передавайте ее как `groupId` при загрузке. Код на стороне генерации идентичен коду на этой странице.

## Распространённые ошибки

| Ошибка / симптом                                                        | Причина                                                                                                                                               | Исправление                                                                                                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400 `The specified asset ... is not found`                              | Идентификатор `asset://` не относится к аккаунту канала APIYI (например, он был загружен через другого провайдера), либо идентификатор указан неверно | Повторно загрузите ресурс на icover.ai, следуя инструкциям на этой странице; перепроверьте идентификатор ресурса                                     |
| «Нет доступного канала для этой модели»                                 | В APIYI token отсутствует группа `SeeDance2`                                                                                                          | Включите её в настройках token на api.apiyi.com и повторите попытку                                                                                  |
| Ошибка декодирования gzip в Python / усечённое тело, не являющееся JSON | Заголовок ответа шлюза для gzip не соответствует фактическому кодированию                                                                             | Добавьте заголовок запроса `"Accept-Encoding": "identity"` (он уже есть в скрипте)                                                                   |
| Статус ресурса `Failed`                                                 | Формат изображения или его размеры не соответствуют требованиям                                                                                       | Соотношение сторон — 0.4–2.5, длина стороны — 300–6000 пикселей, размер — менее 30 МБ; исправьте параметры и загрузите ресурс повторно               |
| Прямое изображение лица отклонено                                       | Фотореалистичные лица нельзя использовать в качестве прямых эталонных изображений (фильтрация против дипфейков)                                       | Сначала загрузите изображение и используйте идентификатор `asset://`; для фотографий реальных людей сначала требуется верификация реального человека |
| Ошибки с префиксом `PUBLIC_`                                            | Заблокировано модерацией контента на стороне вышестоящего сервиса (эта попытка не тарифицируется)                                                     | Измените материал или prompt и просто повторите попытку                                                                                              |

## Связанные страницы

<CardGroup cols={3}>
  <Card title="Обзор Seedance 2.0" icon="sparkles" href="/ru/api-capabilities/seedance2/overview">
    Выбор модели, таблицы тарифов и разрешений, а также часто задаваемые вопросы
  </Card>

  <Card title="API генерации видео" icon="video" href="/ru/api-capabilities/seedance2/video-generation">
    Полная таблица параметров, четыре режима генерации и формат ответа
  </Card>

  <Card title="Библиотека ресурсов" icon="images" href="/ru/api-capabilities/seedance2/asset-library">
    Все эндпоинты библиотеки ресурсов, веб-интерфейс без кода и проверка личности реального человека
  </Card>

  <Card title="Рабочий процесс с приоритетом ресурсов" icon="gauge" href="/ru/api-capabilities/seedance2/asset-first-workflow">
    Почему ID ресурса превосходит встроенное изображение по скорости и надёжности, а также как обрабатывать тайм-ауты отправки
  </Card>
</CardGroup>
