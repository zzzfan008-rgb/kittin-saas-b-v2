> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5: Reference-to-Video vs. Video Editing

> How Seedance 2.5 decides between reference-to-video, video editing, and video extension from your assets and prompt, why a task gets misread as editing, and how to write requests that behave predictably.

## Short Answer

Seedance 2.5 **has no dedicated "reference-to-video" switch**. As soon as `content` contains a reference video, the model reads the **intent of your prompt** to decide whether the task is reference-to-video, video editing, or video extension:

* The prompt **changes the source video** (add, remove, modify, replace, keep something unchanged) → **video editing**
* The prompt **continues the source video** forwards or backwards (extend, continue) → **video extension**
* The prompt only **borrows a character, motion, or style from the assets to shoot a new clip** → **reference-to-video**

Once a task is classified as editing, `ratio` must be `adaptive` and `duration` must be `-1`. Passing a specific aspect ratio or duration returns a 400, usually mentioning `TaskTypeConstraint`.

<Info>
  This page applies to **Seedance 2.5** (`doubao-seedance-2-5-260628`) only. The Seedance 2.0 family has no video editing or video extension tasks, so the issue does not arise there.
</Info>

## The Core Difference: Does the Asset End Up in the Output?

|                           | Reference-to-video                                                                | Video editing                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Role of the asset         | **Semantic reference** only: appearance, motion, camera work, style, voice        | The source video **is the base of the output**; the model adds, removes, or changes things on top of it |
| Output aspect ratio       | Your choice (any of the seven `ratio` values)                                     | **Locked** to the source video; `ratio` must be `adaptive`                                              |
| Output duration           | Your choice (`duration` from 4 to 30)                                             | **Locked** to the source video; `duration` must be `-1`                                                 |
| Source video requirements | None                                                                              | Must be **4–30 seconds** long; under 20 seconds works best                                              |
| Typical prompt            | "A dancer on the beach, character from image 1, choreography referencing video 1" | "Replace the person in video 1 with image 1", "Remove the background music from video 1"                |

A quick test: **can you still see the source video itself in the output?** If yes, it is editing (or extension). If only its "feel" carries over, it is reference-to-video.

Video extension is similar to editing: the aspect ratio is locked to the source video, but you can still set the duration.

## How the Model Decides

The decision takes two steps: first the asset `role`, then the prompt.

| Task type                        | Asset condition                                                        | Prompt trigger words (provider docs)                           | `ratio`                | `duration`       |
| -------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------- | ---------------- |
| Reference-to-video               | At least one `reference_image` / `reference_video` / `reference_audio` | No editing or extension intent                                 | Any                    | Any              |
| Video editing                    | At least one `reference_video`                                         | edit video, add, remove / delete, modify / replace / change to | **Must be `adaptive`** | **Must be `-1`** |
| Video extension                  | At least one `reference_video`                                         | extend forwards / backwards, continue                          | **Must be `adaptive`** | Any              |
| First frame / first & last frame | `role` is `first_frame` / `last_frame`                                 | Independent of the prompt                                      | **Must be `adaptive`** | Any              |

<Warning>
  The trigger-word list is **not exhaustive**. The model judges meaning, not exact words. Phrases such as "keep everything in the video unchanged", "upscale video 1 to HD", or "keep the outfits the same" are not on the list, but they all describe processing the original footage, so they can be classified as video editing too.
</Warning>

A request with reference images but no reference video is never classified as editing or extension. You only need to watch for this when a `reference_video` is present.

## A Real Case

This request wanted to "upscale a video" while also setting 4:3 and 15 seconds:

```json theme={null}
{
  "model": "doubao-seedance-2-5-260628",
  "ratio": "4:3",
  "duration": 15,
  "resolution": "1080p",
  "content": [
    { "type": "text", "text": "Upscale reference video 1 to HD, keep all elements in the video unchanged, keep the outfits unchanged" },
    { "type": "video_url", "role": "reference_video", "video_url": { "url": "asset://asset-xxxx" } }
  ]
}
```

It was rejected immediately with a 400:

```text theme={null}
The parameters `ratio` and `duration` specified in the request are not valid.
Seedance identified your task as video editing based on your prompt. ...
Issues: [0] `ratio` must be `adaptive`. [1] `duration` must be -1.
```

"Upscale" plus "keep unchanged" means working on the original footage, so the model classified it as editing, and editing tasks do not accept a custom aspect ratio or duration. Since this request really is an edit, the correct fix is:

```json theme={null}
"ratio": "adaptive",
"duration": -1
```

After the change, the output follows the source video's aspect ratio and duration.

## Can a Parameter Force Reference-to-Video?

**No.** In 2.5, `omni_reference_task_type` accepts only three values:

| Value            | Effect                                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| `auto` (default) | The model decides from the assets and the prompt                            |
| `edit`           | Declares video editing; editing constraints are validated at submission     |
| `extend`         | Declares video extension; extension constraints are validated at submission |

There is no "reference-to-video" value. And `edit` / `extend` only **validate earlier**; they do not force the task type. If the declared type differs from what the model infers from the prompt, the task still fails with `InvalidParameter.TaskTypeMismatch`.

In short, the **prompt** decides the task type. Parameters can only go along with it.

## Three Reliable Approaches

<Tabs>
  <Tab title="Output size doesn't matter">
    The general-purpose setup recommended in the provider docs. Whenever reference assets are present, send the following. No matter which subtask the model picks, the request will not fail on parameter constraints.

    ```json theme={null}
    "omni_reference_task_type": "auto",
    "ratio": "adaptive",
    "duration": -1
    ```

    The trade-off: when the task is classified as reference-to-video, **the model chooses the duration** (10 seconds or more in our tests), and the cost varies with it. Not recommended for cost-sensitive workloads.
  </Tab>

  <Tab title="Fixed aspect ratio and duration">
    To set `ratio` and `duration` yourself, the model must classify the task as reference-to-video. That comes down to the prompt:

    * Describe the assets as something to **reference, borrow from, or imitate**, and say **what** is referenced (motion, camera work, style, character look)
    * Focus on **the new scene you want**, not on what to do to the source video
    * Avoid wording like add / remove / modify / replace / change to, "keep … unchanged", "upscale / restore", or "extend / continue"

    | Likely read as editing                                 | Rewritten as reference-to-video                                                        |
    | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
    | Replace the person in video 1 with the girl in image 1 | The girl from image 1 runs along the beach, motion and camera work referencing video 1 |
    | Keep the scene in video 1 and add a cat                | A cat walks past a street corner, in the street style of video 1                       |
    | Upscale video 1, keep the outfits unchanged            | A new runway shot featuring the character look and outfits from video 1                |
  </Tab>

  <Tab title="Retry in code">
    When prompts come from end users and you cannot control them, catch this 400 and resubmit once. The error is returned at submission, so no task is created, and 400 parameter errors are not billed.

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
            # Classified as edit / extend / first-frame: release ratio and duration, then resubmit
            payload = {**payload, "ratio": "adaptive", "duration": -1}
            resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["id"]
    ```

    After the retry you no longer control the aspect ratio or duration. If your product must guarantee output specs, return the error to the user and ask them to rephrase instead of retrying silently.
  </Tab>
</Tabs>

## When the Error Appears

| Scenario                                                                           | When it fails                                                                                                          | Error code                            |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `edit` / `extend` declared explicitly, parameters violate the constraints          | 400 at submission                                                                                                      | `InvalidParameter.TaskTypeConstraint` |
| Omitted or `auto`, model classifies as editing, parameters violate the constraints | Provider docs say the task fails asynchronously, but **it can also return a 400 at submission** (as in the case above) | `InvalidParameter.TaskTypeConstraint` |
| Declared type differs from the model's classification                              | Task fails after it starts running                                                                                     | `InvalidParameter.TaskTypeMismatch`   |

The two errors need different fixes: for `TaskTypeConstraint`, change the parameters; for `TaskTypeMismatch`, change the prompt (or set `omni_reference_task_type` back to `auto`).

## Cost Notes

* **A video-editing output is as long as the source video**, not as long as you wanted. A 25-second source is billed at roughly 25 seconds.
* **For tasks with a reference video, the input video's frames are also converted into billable tokens**. Longer, higher-resolution sources cost more.
* With `duration: -1` on a reference-to-video task, the model picks the length, which may be longer than expected.

Checking the source video's length before submitting avoids most surprises. To verify the actual charge of a task, see [How do I look up a Seedance video's real cost by task\_id?](/en/faq/seedance-task-cost-lookup).

## Related Docs

<CardGroup cols={2}>
  <Card title="Video Generation API" icon="video" href="/en/api-capabilities/seedance2/video-generation">
    Task types vs. parameter constraints, full request parameters
  </Card>

  <Card title="Seedance 2.0 / 2.5 Overview" icon="film" href="/en/api-capabilities/seedance2/overview">
    Differences between 2.5 and 2.0, full editing and extension usage
  </Card>
</CardGroup>
