> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 參考生影片和影片編輯怎麼區分？

> 說明 Seedance 2.5 如何根據參考素材和提示詞判定參考生影片、影片編輯與影片延長，以及被誤判為編輯時的報錯原因和穩妥寫法。

## 簡短回答

Seedance 2.5 **沒有單獨的「參考生影片」開關**。只要 `content` 裡帶了參考影片，模型就會根據**提示詞意圖**判斷這是參考生影片、影片編輯還是影片延長：

* 提示詞是在**改原影片**（增加、刪除、修改、替換、保持某些東西不變）→ 判為**影片編輯**
* 提示詞是在**接著原影片往前或往後拍**（延長、續寫、延續）→ 判為**影片延長**
* 提示詞只是**借用素材的人物、動作、風格去拍一段新影片** → 判為**參考生影片**

被判成編輯後，`ratio` 必須是 `adaptive`、`duration` 必須是 `-1`，傳了具體畫幅或時長就會返回 400，報錯資訊裡通常帶 `TaskTypeConstraint`。

<Info>
  本頁只適用於 **Seedance 2.5**（`doubao-seedance-2-5-260628`）。Seedance 2.0 系列沒有影片編輯和影片延長這兩類任務，不存在這個問題。
</Info>

## 兩者的根本區別：素材會不會成為成片的一部分

|         | 參考生影片                        | 影片編輯                                |
| ------- | ---------------------------- | ----------------------------------- |
| 素材的作用   | 只做**語義參考**：借人物長相、動作、運鏡、風格、音色 | 原影片**就是成片的底子**，模型在它上面增刪改            |
| 輸出畫幅    | 可自己指定（`ratio` 七檔任選）          | **鎖定**為原影片畫幅，`ratio` 只能是 `adaptive` |
| 輸出時長    | 可自己指定（`duration` 取 4–30）     | **鎖定**為原影片時長，`duration` 只能是 `-1`    |
| 對原影片的要求 | 無特殊要求                        | 時長必須在 **4–30 秒**之間，20 秒以內效果較好       |
| 典型提示詞   | 「參考影片1的舞蹈動作，讓圖片1的角色在海邊跳」     | 「把影片1裡的人物換成圖片1」「刪掉影片1的背景音樂」         |

一句話判斷：**成片裡還能不能看到原影片本身？** 能看到就是編輯（或延長），看不到、只保留了某種「感覺」就是參考生影片。

影片延長與編輯類似，畫幅同樣鎖定為原影片的畫幅，但時長可以自己指定。

## 模型是怎麼判定的

判定分兩步：先看素材的 `role`，再看提示詞。

| 任務型別     | 素材條件                                                           | 提示詞觸發詞（原廠文件）                      | `ratio`           | `duration`  |
| -------- | -------------------------------------------------------------- | --------------------------------- | ----------------- | ----------- |
| 參考生影片    | 至少一個 `reference_image` / `reference_video` / `reference_audio` | 無編輯、延長意圖                          | 不限                | 不限          |
| 影片編輯     | 至少一個 `reference_video`                                         | 編輯影片、增加 / 加上、刪除 / 去掉、修改 / 替換 / 改成 | **必須 `adaptive`** | **必須 `-1`** |
| 影片延長     | 至少一個 `reference_video`                                         | 向前 / 向後延長、延續、續寫                   | **必須 `adaptive`** | 不限          |
| 首幀 / 首尾幀 | `role` 為 `first_frame` / `last_frame`                          | 與提示詞無關                            | **必須 `adaptive`** | 不限          |

<Warning>
  觸發詞列表**不是窮舉**。模型判斷的是語義，不是逐字匹配。「保持影片中的元素不變」「把影片1高畫質化」「人物服裝不變」這類說法雖然不在上表裡，但表達的都是「在原片基礎上處理」，同樣可能被判成影片編輯。
</Warning>

只傳參考圖、不傳參考影片時，不會被判成編輯或延長；只有帶了 `reference_video` 才需要留意這個問題。

## 一個真實案例

下面這個請求想做「影片高畫質化」，同時指定了 4:3 和 15 秒：

```json theme={null}
{
  "model": "doubao-seedance-2-5-260628",
  "ratio": "4:3",
  "duration": 15,
  "resolution": "1080p",
  "content": [
    { "type": "text", "text": "參考影片1高畫質化影片，保持影片中的元素不變，人物服裝不變" },
    { "type": "video_url", "role": "reference_video", "video_url": { "url": "asset://asset-xxxx" } }
  ]
}
```

提交後立即返回 400：

```text theme={null}
The parameters `ratio` and `duration` specified in the request are not valid.
Seedance identified your task as video editing based on your prompt. ...
Issues: [0] `ratio` must be `adaptive`. [1] `duration` must be -1.
```

原因是「高畫質化 + 保持不變」就是在原片上做處理，模型判為影片編輯，而編輯任務不允許指定畫幅和時長。這個需求本身就是編輯，正確改法是：

```json theme={null}
"ratio": "adaptive",
"duration": -1
```

改完後，輸出的畫幅和時長都跟隨原影片。

## 能不能用引數固定成參考生影片？

**不能。** 2.5 的 `omni_reference_task_type` 只有三個取值：

| 取值         | 作用                      |
| ---------- | ----------------------- |
| `auto`（預設） | 由模型根據素材和提示詞自行判定         |
| `edit`     | 宣告為影片編輯，提交時就校驗編輯任務的引數限制 |
| `extend`   | 宣告為影片延長，提交時就校驗延長任務的引數限制 |

沒有「參考生影片」這個取值。而且 `edit` / `extend` 只是**提前校驗**，並不能強制任務型別：如果宣告的型別與模型按提示詞判定的不一致，任務仍會失敗，錯誤碼為 `InvalidParameter.TaskTypeMismatch`。

所以，任務型別最終由**提示詞**決定，引數只能配合它。

## 三種穩妥寫法

<Tabs>
  <Tab title="不在乎畫幅和時長">
    原廠文件推薦的通用配置：只要帶了參考素材，就一律這樣傳，無論模型判成哪個子任務都不會因引數限制報錯。

    ```json theme={null}
    "omni_reference_task_type": "auto",
    "ratio": "adaptive",
    "duration": -1
    ```

    代價是：判為參考生影片時，**時長由模型自己決定**（實測會選到 10 秒以上），費用會隨時長變化。對成本敏感的業務不建議用這套。
  </Tab>

  <Tab title="要固定畫幅和時長">
    想指定 `ratio` 和 `duration`，就必須讓模型判為參考生影片，關鍵在提示詞：

    * 用「參考」「借鑑」「模仿」來描述素材的作用，並說清楚**參考的是什麼**（動作、運鏡、風格、人物形象）
    * 著重描述**要拍的新畫面**，而不是對原影片做什麼
    * 避免「增加 / 刪除 / 修改 / 替換 / 改成 / 去掉」「保持……不變」「高畫質化 / 修復」「延長 / 續寫」這類說法

    | 容易被判成編輯         | 改寫成參考生影片                 |
    | --------------- | ------------------------ |
    | 把影片1裡的人換成圖片1的女孩 | 圖片1的女孩在海邊奔跑，動作和運鏡參考影片1   |
    | 保持影片1的場景不變，加一隻貓 | 參考影片1的街景風格，拍一隻貓走過街角      |
    | 影片1高畫質化，人物服裝不變  | 參考影片1的人物造型與服裝，生成一段新的走秀鏡頭 |
  </Tab>

  <Tab title="程式碼裡兜底重試">
    提示詞來自終端使用者、無法控制時，在程式碼裡接住這類 400 再重提一次。這個錯誤在提交時就返回，不會建立任務，400 引數錯誤也不扣費。

    ```python theme={null}
    import os
    import requests

    URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
    HEADERS = {
        "Authorization": f"Bearer {os.environ['APIYI_API_KEY']}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }

    def submit(payload: dict) -> str:
        resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        if resp.status_code == 400 and "TaskTypeConstraint" in resp.text:
            # 被判為編輯 / 延長 / 首幀任務：放開畫幅和時長後重提
            payload = {**payload, "ratio": "adaptive", "duration": -1}
            resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["id"]
    ```

    重試後畫幅和時長就不再由你控制了。如果業務必須保證輸出規格，建議把報錯返回給使用者、提示改寫提示詞，而不是靜默重試。
  </Tab>
</Tabs>

## 報錯時機

| 場景                             | 何時報錯                                         | 錯誤碼                                   |
| ------------------------------ | -------------------------------------------- | ------------------------------------- |
| 顯式傳 `edit` / `extend`，但引數不符合限制 | 提交時立即返回 400                                  | `InvalidParameter.TaskTypeConstraint` |
| 未傳或傳 `auto`，模型判為編輯，引數不符合限制     | 原廠文件寫的是任務非同步失敗；但**實際也會在提交時就返回 400**（上面的案例即是） | `InvalidParameter.TaskTypeConstraint` |
| 顯式宣告的型別與模型判定不一致                | 任務執行後失敗                                      | `InvalidParameter.TaskTypeMismatch`   |

兩類錯誤的處理方式不同：`TaskTypeConstraint` 改引數，`TaskTypeMismatch` 改提示詞（或把 `omni_reference_task_type` 改回 `auto`）。

## 費用提醒

* **影片編輯的輸出時長等於原影片時長**，不是你想要的時長。原影片 25 秒，就按 25 秒左右計費。
* **帶參考影片的任務，輸入影片的幀數也會折算成 tokens 一起計費**，原影片越長、解析度越高，費用越高。
* `duration: -1` 用在參考生影片上時，時長由模型決定，可能比預期長。

提交前先確認原影片時長，能明顯減少意外開銷。按任務核對實際扣費見 [如何按 task\_id 查一條 Seedance 影片的真實消費？](/zh-Hant/faq/seedance-task-cost-lookup)。

## 相關文件

<CardGroup cols={2}>
  <Card title="影片生成介面" icon="video" href="/zh-Hant/api-capabilities/seedance2/video-generation">
    任務型別與引數約束對照表、全部請求引數
  </Card>

  <Card title="Seedance 2.0 / 2.5 概覽" icon="film" href="/zh-Hant/api-capabilities/seedance2/overview">
    2.5 與 2.0 的差異、編輯和延長的完整用法
  </Card>
</CardGroup>
