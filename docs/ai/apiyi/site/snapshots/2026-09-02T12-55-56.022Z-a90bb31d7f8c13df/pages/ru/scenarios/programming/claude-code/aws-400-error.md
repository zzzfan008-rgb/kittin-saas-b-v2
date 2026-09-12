> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Исправление ошибок 400 в Claude Code

> Почему Claude Code возвращает 400 / ValidationException на официальном релей APIYI AWS Claude (Bedrock) и как это исправить

## 📌 Проблема

Некоторые пользователи сталкиваются с такими ошибками при работе в Claude Code:

* `400 ValidationException`
* `Extra inputs are not permitted`
* Ошибки, содержащие `cache_control.scope`

Почти всегда это вызвано **экспериментальными beta-параметрами Claude Code**, которые **не поддерживаются** официальным каналом Amazon Claude API (AWS Claude / Bedrock), который предоставляет APIYI.

<Info>
  Это руководство применяется только к запросам, проходящим через **официальный канал AWS Claude (Bedrock)**. Родной канал Anthropic API поддерживает эти beta-параметры, поэтому никакие изменения ниже там не нужны.
</Info>

## ✅ Решение (рекомендуется)

Отключите экспериментальные beta-функции Claude Code.

### Вариант 1: Измените settings.json (рекомендуется)

Добавьте переменную среды в ваш Claude Code `settings.json`:

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### Вариант 2: Временно (текущий сеанс терминала)

Выполните это в терминале:

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

Затем снова запустите Claude Code.

<Tip>
  Вариант 2 действует только в текущем окне терминала и будет потерян после его закрытия. Для постоянного решения используйте Вариант 1 или Вариант 3.
</Tip>

### Вариант 3: Постоянно (рекомендуется)

Добавьте переменную в конфигурацию shell в зависимости от вашей среды.

#### Mac / Linux (bash)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac (zsh, по умолчанию)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

Затем перезапустите терминал.

## 🔍 Почему это происходит (для технически подкованных)

Claude Code по умолчанию включает ряд бета-функций, таких как:

* `cache_control`
* расширенные поля `tool`
* дополнительные параметры, такие как `scope`

Эти параметры:

* 👉 поддерживаются нативным Anthropic API
* 👉 но отклоняются как недопустимые поля в AWS Bedrock Claude → HTTP 400

После отключения этого переключателя:

* ✔ запросы возвращаются к стандартной структуре
* ✔ полная совместимость с AWS Claude

## 🚨 Когда это нужно

Если что-либо из нижеперечисленного относится к вам, **мы настоятельно рекомендуем задать эту переменную**:

* Вы используете Claude Code с AWS Bedrock Claude
* Вы проходите через сторонний proxy (шлюз API или сервис пересылки)
* Вы видите ошибки 400 / ValidationException

Ссылки:

* Официальная документация Claude — переменные окружения: `code.claude.com/docs/en/env-vars`
* Связанная проблема: `github.com/anthropics/claude-code/issues/21676`

## 🔎 Проверка, к каким группам относится модель

Не уверены, в каких группах доступна конкретная модель? Посмотрите это на странице цен моделей:

Откройте [страницу цен моделей APIYI](https://api.apiyi.com/modelPricing) и найдите название модели, чтобы увидеть доступные для нее группы.

Например, группа **ClaudeCode** поддерживает последние серии моделей Claude, а также отдельно настроенные `glm-5.1` и `qwen3.7-max`.

## 💡 Все еще не работает?

Если после применения исправления ошибка сохраняется, проверьте, что:

* Переменная окружения действительно вступила в силу (запустите `echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` и убедитесь, что выводится `1`)
* Вы действительно на канале AWS Claude (Bedrock)
* Вы перезапустили терминал или IDE после изменения конфигурации

## 📞 Поддержка

Если у вас все еще не получается, отправьте нам следующее, чтобы мы могли разобраться глубже:

* Скриншот ошибки
* Лог запроса (Request ID)
* Название модели, которую вы используете

Мы поможем вам найти причину.
