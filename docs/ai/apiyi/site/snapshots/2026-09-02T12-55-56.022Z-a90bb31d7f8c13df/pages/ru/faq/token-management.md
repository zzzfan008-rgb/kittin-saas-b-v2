> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Как создать KEY?

> Руководство по управлению token в APIYI, включая полные инструкции по получению токенов по умолчанию и созданию новых KEYs

## Получение существующего токена по умолчанию

1. Перейдите на страницу «Токены» в верхней навигации: [https://api.apiyi.com/token](https://api.apiyi.com/token)

2. Найдите на странице токен по умолчанию, нажмите меню управления в правой части

3. Найдите в меню управления значок копирования и нажмите его, чтобы скопировать

4. Скопируйте полный KEY, формат которого начинается с `sk-`

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="Скопировать API-ключ" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="Скопировать API-ключ" width="1466" height="1006" data-path="images/key-manage.png" />

## Создать новый ключ

В дополнение к использованию token по умолчанию вы также можете создавать новые ключи, чтобы точно управлять правами на использование:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Добавить новый API-ключ" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Добавить новый API-ключ" width="1284" height="1158" data-path="images/key-add-new.png" />

### Преимущества создания новых ключей

* **Контроль баланса**: можно задать отдельные лимиты баланса для каждого ключа
* **Управление сроком действия**: можно задать время истечения ключа
* **Гибкое распределение**: подходит для командного использования или изоляции проектов

<Warning>
  **Важное примечание**: при создании нового ключа **не нужно задавать доступные модели**.

  Здесь используется механизм белого списка:

  * **Если заданы доступные модели**: ключ сможет использовать только указанные модели
  * **Если доступные модели не заданы**: ключ сможет использовать все 400+ моделей на сайте

  Рекомендуется не задавать доступные модели, чтобы вы могли пользоваться всеми моделями.
</Warning>

## Описание формата KEY

* Все API-ключи начинаются с `sk-`
* Длина KEY обычно составляет 48-64 символа
* Пожалуйста, храните ваш KEY в безопасности, не публикуйте его в открытых местах

## Рекомендации по использованию

1. **Тестирование разработки**: Используйте токен по умолчанию для быстрой разработки и тестирования
2. **Производственная среда**: Создавайте отдельные KEYs для производственных проектов, чтобы упростить управление и мониторинг
3. **Совместная работа в команде**: Создавайте независимые KEYs для разных участников команды для удобного управления правами доступа
