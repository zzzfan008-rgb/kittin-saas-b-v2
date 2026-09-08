> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is There a Faster or Enterprise Route for Image Generation?

> Explains how the default and enterprise groups relate to image-generation speed, and which model to test when latency is the priority.

## Short Answer

The default group is already the recommended route for normal image generation and is generally fast enough. The enterprise group is primarily a fallback when the default route has an incident; it is not a dedicated acceleration route for reducing image-generation time.

## Why the Enterprise Group May Not Be Faster

APIYI already uses optimized return routes across China Telecom, China Unicom, and China Mobile. The main source of image-generation latency is usually upstream model inference rather than APIYI network routing. Switching to the enterprise group therefore generally cannot reduce the model's native generation time.

<Info>
  **The main difference between groups is routing and failover, not faster model inference.**

  * **Default group**: Recommended for normal requests, with optimized speed and stability
  * **Enterprise group**: Used as a fallback during default-route incidents, with a focus on availability
</Info>

## What If Generation Speed Is the Priority?

If your workload prioritizes faster image output, test the [Nano Banana image model](/en/api-capabilities/nano-banana-image/overview), then decide based on image quality, cost, and measured generation time.

<Warning>
  Model speed varies with image dimensions, output count, prompt complexity, and upstream load. No route or group can guarantee a fixed image-generation time. Test with your real request parameters and production-like concurrency.
</Warning>

## Related Documentation

* [How Can I Reduce Image API Latency?](/en/faq/image-api-network-latency-optimization)
* [Nano Banana Image Generation](/en/api-capabilities/nano-banana-image/overview)
