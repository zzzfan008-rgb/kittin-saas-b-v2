> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Группа Nano Banana OSS

> Бета-группа Nano Banana OSS (NB-OSS): результат генерации изображений возвращается в виде URL вместо Base64, что снижает накладные расходы на передачу и улучшает опыт использования. Лучше всего подходит для сценариев, где вы используете URL напрямую.

## Контекст (Сначала прочтите)

<Info>
  **Что это**: Это бета-группа, в которой выходные изображения предоставляются в виде **URL**, а не Base64, что снижает накладные расходы на передачу Base64 и улучшает пользовательский опыт. **Лучше всего подходит для сценариев, где вы используете URL напрямую.** Если у вас нет особых требований и вы можете работать с выводом изображений в кодировке Base64, мы по-прежнему рекомендуем использовать «Normal Default Group» или «NanoBanana Enterprise Group».
</Info>

**Поддерживаемые модели** (Nano Banana Pro и Gen 1):

* `gemini-3-pro-image-preview`
* `gemini-3.1-flash-image-preview`
* `gemini-2.5-flash-image`

## Начало работы

<Steps>
  <Step title="Попросите администратора включить эту видимую группу">
    Обратитесь к администратору, чтобы он включил видимую группу NB-OSS для вашей учетной записи (добавьте NB-OSS в разделе «Редактировать сведения о пользователе → Дополнительные видимые группы»).

    <Frame caption="Edit User Info: add NB-OSS under Extra Visible Groups">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-contact-admin.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=d4975f7e75786ca3452e99659297f9dc" alt="Экран «Редактировать сведения о пользователе»: добавление группы NB-OSS в разделе Дополнительные видимые группы" width="736" height="310" data-path="images/nano-banana-oss-contact-admin.png" />
    </Frame>
  </Step>

  <Step title="Создайте token: выберите группу NB-OSS">
    При создании token установите модель тарификации на «тарификация за вызов» и выберите группу **NB-OSS** (Nano Banana PRO, вывод изображения как URL вместо Base64). Вы меняете только token; формат запроса остается прежним.

    <Frame caption="Create token: set billing model to per-call billing, select the NB-OSS group (1x) — image output as URL instead of Base64">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-create-token.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6ccac2359d775f8c0f9a185884bb6e4a" alt="Экран создания token: модель тарификации установлена на тарификацию за вызов, группа NB-OSS выбрана, вывод изображения как URL вместо Base64" width="1284" height="886" data-path="images/nano-banana-oss-create-token.png" />
    </Frame>
  </Step>

  <Step title="Замените token и протестируйте">
    Замените token и выполните тест. **Ваш код должен уметь обрабатывать вывод URL** — не просто заменяйте Base64; лучше поддерживать оба варианта.
  </Step>
</Steps>

## Пример кода

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Пример вывода

URL изображения находится в поле `text`, а `thoughtSignature` ниже него — это base64-код процесса рассуждения.

<Frame caption="Response JSON: candidates → content → parts, the image URL is in the text field; thoughtSignature is the base64 of the reasoning">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-output-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=7c466c969fc59d03a889f31c8b192bcb" alt="Пример JSON-ответа API: поле text содержит URL изображения, а поле thoughtSignature — это base64-код рассуждения" width="1200" height="637" data-path="images/nano-banana-oss-output-example.png" />
</Frame>

## Регион OSS Storage и скорость загрузки

### Где хранятся изображения?

URL выходных изображений размещены на **Alibaba Cloud OSS в Лос-Анджелесе (запад США, `us-west-1`, регион Северной Америки)**. URL выглядят так:

```
https://<bucket-name>.oss-us-west-1.aliyuncs.com/xxxx.png
```

<Warning>
  Поддоменная часть URL (`<bucket-name>`, например `mycdn-gg`) **может со временем измениться — не задавайте полный домен жестко** в вашем коде или правилах firewall. Если вам нужно сопоставлять домен или добавлять его в allowlist, сопоставляйте суффикс `oss-us-west-1.aliyuncs.com` (официальный OSS-домен Alibaba Cloud) или, в более широком варианте, разрешайте `*.aliyuncs.com`.
</Warning>

### Загрузки медленные?

Поскольку узел хранения находится в Северной Америке, прямые загрузки из некоторых регионов (например, из материкового Китая) могут быть медленными. Распространенные причины и рекомендации:

* **Ограничение трафика корпоративной сетью / блокировка allowlist для зарубежного трафика**: попросите администратора сети снять лимиты скорости и добавить в allowlist `*.oss-us-west-1.aliyuncs.com` (или `*.aliyuncs.com`).
* **Сразу переносите к себе**: скачайте изображение сразу после получения URL и заново загрузите его в свое хранилище / CDN, прежде чем отдавать конечным пользователям — не раскрывайте OSS URL конечным пользователям надолго.
* **Скачивайте через сервер**: если ваша локальная сеть медленная, сначала загрузите через зарубежный сервер (или сервер с хорошим сетевым маршрутом), а затем передайте дальше.

Дополнительные идеи по устранению сетевых проблем (DNS, маршрутизация, международная пропускная способность и т. д.) см. в FAQ: [Что делать, если загрузка изображений/видео через CDN медленная?](/ru/faq/cdn-download-slow)

### URL не открывается?

Ключевой момент — восстановить экранированную последовательность `\u0026` в выходном JSON обратно в обычный `&`, игнорируя base64-содержимое после `thoughtSignature`.

<Frame caption="The image link is in the text field; restore the JSON-escaped & back to the & in the URL, and ignore the base64 after thoughtSignature">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-url-unescape.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5998b89a3f6b0cf6448041e47db2d9dd" alt="Диаграмма: ссылка на изображение находится в текстовом поле, восстановите экранирование JSON обратно в символ &, и игнорируйте base64-содержимое после thoughtSignature" width="1200" height="723" data-path="images/nano-banana-oss-url-unescape.png" />
</Frame>
