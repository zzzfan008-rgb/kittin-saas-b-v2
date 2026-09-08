> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Embedding 2 Preview: First Natively Multimodal Embedding Model

> Google's first natively multimodal embedding model Gemini Embedding 2 Preview is now on APIYI — unified vector space for text/image/video/audio/PDF, MTEB English #1 at 68.32, 3072-dim MRL, text at $0.20/M tokens.

## Key Highlights

* **First Natively Multimodal Embedding**: Unified vector space for text, image, video, audio, and PDF
* **MTEB English #1**: 68.32 score, leading in classification (+9.6), retrieval (+9.0), and clustering (+3.7)
* **Flexible Dimensions**: Default 3072, supports 128–3072 truncation via Matryoshka Representation Learning (MRL); 768-dim still achieves 67.99
* **Extended Input**: Up to 8192 text tokens, 6 images/request, 120-second video
* **100+ Languages**: Multilingual embeddings, MTEB Multilingual Top 5

## Background

On March 10, 2026, Google officially launched Gemini Embedding 2 Preview — the **first natively multimodal embedding model** in the Gemini series. Unlike the text-only text-embedding-004 and gemini-embedding-001, Gemini Embedding 2 maps text, images, video, audio, and PDF documents into a single unified vector space, enabling true cross-modal semantic retrieval.

This means you can search for relevant images using text, or retrieve matching documents using an image — all modalities share the same vector representation without separate processing.

APIYI has launched `gemini-embedding-2-preview`, accessible via the OpenAI-compatible `/v1/embeddings` endpoint.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Native Multimodal" icon="layers">
    Text, image, video, audio, and PDF in a unified vector space for cross-modal semantic search and similarity
  </Card>

  <Card title="MTEB #1" icon="trophy">
    English 68.32 tops the leaderboard, major leads in classification, retrieval, and clustering; Multilingual Top 5
  </Card>

  <Card title="Matryoshka Dimensions" icon="shrink">
    128–3072 flexible truncation, low dimensions retain high quality, balance performance vs. storage cost
  </Card>

  <Card title="Prompt-Based Tasks" icon="wand-sparkles">
    No more fixed task\_type enums — describe task types with natural language prompts for more flexible, precise control
  </Card>
</CardGroup>

### Performance Highlights

Gemini Embedding 2 Preview leads across MTEB benchmarks:

| Dimensions         | MTEB English Score | Notes                            |
| ------------------ | ------------------ | -------------------------------- |
| **3072** (default) | **68.32**          | #1 overall                       |
| **2048**           | **68.16**          | Near full-dimension performance  |
| **1536**           | **68.17**          | Suitable replacement for 3-large |
| **768**            | **67.99**          | Half storage, nearly no loss     |

**Category leads** (vs. second place):

| Task Type          | Lead        |
| ------------------ | ----------- |
| **Classification** | +9.6 points |
| **Retrieval**      | +9.0 points |
| **Clustering**     | +3.7 points |

<Info>
  Data sources: Google official blog (`blog.google`) and MTEB leaderboard. Gemini Embedding 2 Preview launched March 10, 2026.
</Info>

### Comparison with Previous Models

| Feature          | text-embedding-004 | gemini-embedding-001 | gemini-embedding-2-preview |
| ---------------- | ------------------ | -------------------- | -------------------------- |
| **Modality**     | Text only          | Text only            | Text/Image/Video/Audio/PDF |
| **Max Input**    | 2048 tokens        | 2048 tokens          | **8192 tokens**            |
| **Default Dims** | 768                | 3072                 | **3072**                   |
| **Dim Range**    | Limited            | MRL support          | **128–3072 (MRL)**         |
| **Task Config**  | task\_type enum    | task\_type enum      | **Prompt-based**           |
| **MTEB English** | Lower              | Moderate             | **68.32 (#1)**             |
| **Languages**    | Limited            | 100+                 | **100+**                   |

<Warning>
  Gemini Embedding 2's vector space is incompatible with previous versions. You cannot mix embeddings from different model versions — migration requires regenerating all embeddings.
</Warning>

### Multimodal Input Specifications

| Input Type | Limits                                    | Supported Formats    |
| ---------- | ----------------------------------------- | -------------------- |
| **Text**   | Max 8192 tokens                           | Plain text           |
| **Image**  | Up to 6 per request                       | PNG, JPEG            |
| **Video**  | Up to 120 seconds                         | MP4, MOV             |
| **Audio**  | Native audio embedding (no transcription) | Common audio formats |
| **PDF**    | Native support                            | PDF documents        |

### Supported Task Types

Gemini Embedding 2 uses prompt-based task descriptions:

| Task                     | Description                                    |
| ------------------------ | ---------------------------------------------- |
| **Semantic Similarity**  | Assess semantic similarity between texts       |
| **Classification**       | Classify texts by preset labels                |
| **Clustering**           | Group texts by similarity                      |
| **Retrieval (Document)** | Optimize document-side search embeddings       |
| **Retrieval (Query)**    | Optimize query-side search embeddings          |
| **Code Retrieval**       | Retrieve code snippets from natural language   |
| **Question Answering**   | Generate question embeddings for QA systems    |
| **Fact Verification**    | Generate statement embeddings for verification |

### Technical Specifications

| Parameter              | Gemini Embedding 2 Preview     |
| ---------------------- | ------------------------------ |
| **Model ID**           | gemini-embedding-2-preview     |
| **Release Date**       | March 10, 2026                 |
| **Developer**          | Google                         |
| **Input Types**        | Text, Image, Video, Audio, PDF |
| **Output**             | Float vector                   |
| **Default Dimensions** | 3072                           |
| **Dimension Range**    | 128–3072 (MRL)                 |
| **Max Text Input**     | 8192 tokens                    |
| **Languages**          | 100+                           |

## Practical Applications

### Recommended Use Cases

1. **Cross-Modal Semantic Search**: Search images with text, retrieve documents with images — unified vector space enables mixed retrieval
2. **Multilingual RAG**: 100+ languages for building global retrieval-augmented generation systems
3. **Document Intelligence**: Embed PDFs directly without preprocessing for document retrieval
4. **Video/Audio Content Retrieval**: Native video and audio embedding for media content management
5. **Clustering & Classification**: +9.6 classification and +3.7 clustering advantage for large-scale content organization
6. **Code Semantic Search**: Query code snippets with natural language to boost developer productivity

### Code Examples

#### Text Embedding

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input="What are the key features of Google's latest multimodal embedding model?",
    dimensions=768  # Optional: 128–3072
)

embedding = response.data[0].embedding
print(f"Dimensions: {len(embedding)}")
```

#### Batch Text Embedding

```python theme={null}
texts = [
    "Latest trends in artificial intelligence",
    "Machine learning applications in healthcare",
    "How large language models work"
]

response = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input=texts,
    dimensions=1536
)

for i, data in enumerate(response.data):
    print(f"Text {i}: {len(data.embedding)} dimensions")
```

#### Semantic Search Example

```python theme={null}
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Build document embeddings
docs = ["Quantum computing principles", "Deep learning intro", "Blockchain overview"]
doc_resp = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input=docs,
    dimensions=768
)
doc_embeddings = [d.embedding for d in doc_resp.data]

# Query
query_resp = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input="How do neural networks work?",
    dimensions=768
)
query_embedding = query_resp.data[0].embedding

# Calculate similarity
for i, doc_emb in enumerate(doc_embeddings):
    sim = cosine_similarity(query_embedding, doc_emb)
    print(f"{docs[i]}: {sim:.4f}")
```

### Best Practices

1. **Choose the right dimensions**: 768-dim offers the best value (67.99 score, half storage), 3072-dim for maximum precision
2. **Normalize after truncation**: 3072-dim vectors are pre-normalized; smaller dimensions require manual normalization
3. **Use prompt instructions**: Differentiate query vs. document side for retrieval to significantly improve results
4. **Don't mix versions**: Incompatible with text-embedding-004 or gemini-embedding-001 vectors — migration requires full rebuild

## Pricing and Availability

### Pricing

| Input Type | Price (per million tokens)  |
| ---------- | --------------------------- |
| **Text**   | \$0.20                      |
| **Image**  | \$0.45 (\~\$0.00012/image)  |
| **Audio**  | \$6.50 (\~\$0.00016/second) |
| **Video**  | \$12.00 (\~\$0.00079/frame) |

### Price Comparison

| Model                          | Text Price/M Tokens | Dimensions | Multimodal     |
| ------------------------------ | ------------------- | ---------- | -------------- |
| **gemini-embedding-2-preview** | **\$0.20**          | 3072       | ✅ 5 modalities |
| text-embedding-3-large         | \$0.13              | 3072       | ❌ Text only    |
| text-embedding-3-small         | \$0.02              | 1536       | ❌ Text only    |

<Info>
  Text pricing is slightly higher than OpenAI's text-embedding-3 series, but Gemini Embedding 2 is the only model supporting unified 5-modality embeddings — no additional models needed for cross-modal retrieval.
</Info>

### Deposit Bonus

<Card title="View Latest Deposit Promotions" icon="gift" href="/en/faq/recharge-promotions">
  APIYI offers deposit bonuses — the more you deposit, the bigger the bonus. Combined with the model's competitive pricing, your effective cost is even lower.
</Card>

### Available Models

| Model Name                   | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `gemini-embedding-2-preview` | Native multimodal embedding, supports text/image/video/audio/PDF |

### How to Access

**APIYI Platform**:

* Website: `apiyi.com`
* API Endpoint: `https://api.apiyi.com/v1`
* Interface: `/v1/embeddings` (OpenAI-compatible)
* Works with all OpenAI SDKs

## Summary and Recommendations

Gemini Embedding 2 Preview is the most powerful embedding model available today and the industry's first natively multimodal embedding model. It tops the MTEB English leaderboard while supporting unified vector representations across five modalities, opening entirely new possibilities for cross-modal retrieval.

**Core Advantages**:

* **Multimodal Unity**: Text/image/video/audio/PDF share one vector space — one model for all retrieval
* **Performance Leader**: MTEB 68.32 #1, major leads in classification, retrieval, and clustering
* **Flexible Dimensions**: MRL supports 128–3072, balance precision vs. cost as needed
* **Extended Input**: 8192 tokens, 4x the previous generation

**Usage Recommendations**:

1. **Cross-modal retrieval**: Gemini Embedding 2 is the only choice — and the best one
2. **Text-only + lowest cost**: text-embedding-3-small remains the cheapest option
3. **Text-only + high accuracy**: Gemini Embedding 2 at 768-dim already surpasses text-embedding-3-large
4. **RAG scenarios**: 8192 token input + flexible dimensions, ideal for large document chunking and retrieval

**Who Should Use Gemini Embedding 2**:

* Applications requiring cross-modal search (image-to-text, text-to-image, etc.)
* Developers building multilingual RAG systems
* Enterprise scenarios processing PDF/video/audio content
* Retrieval systems seeking the highest embedding quality

<Info>
  Sources: Google official blog (`blog.google`), Google AI Developer docs (`ai.google.dev`), MTEB leaderboard. Gemini Embedding 2 Preview launched March 10, 2026. Data retrieved: March 31, 2026.
</Info>
