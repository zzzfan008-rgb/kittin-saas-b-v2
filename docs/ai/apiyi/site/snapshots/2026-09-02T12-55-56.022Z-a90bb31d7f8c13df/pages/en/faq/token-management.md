> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to create a KEY?

> APIYI token management guide, including complete instructions for obtaining default tokens and creating new KEYs

## Obtain Existing Default Token

1. Go to "Tokens" page in top navigation: [https://api.apiyi.com/token](https://api.apiyi.com/token)

2. Find the default token on the page, click the management menu on the far right

3. Find the copy icon in the management menu and click to copy

4. Copy the complete KEY, which has the format starting with `sk-`

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="Copy API Key" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="Copy API Key" width="1466" height="1006" data-path="images/key-manage.png" />

## Create New KEY

In addition to using the default token, you can also create new KEYs to precisely control usage permissions:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Add New API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Add New API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

### Advantages of Creating New KEYs

* **Balance Control**: Can set dedicated balance limits for each KEY
* **Expiration Management**: Can set KEY expiration time
* **Flexible Allocation**: Suitable for team use or project isolation

<Warning>
  **Important Note**: When creating a new KEY, **no need to set available models**.

  Whitelist mechanism is used here:

  * **If available models are set**: The KEY can only use specified models
  * **If no available models set**: The KEY can use all 400+ models on the site

  Recommended not to set available models, so you can enjoy access to all models.
</Warning>

## KEY Format Description

* All API KEYs start with `sk-`
* KEY length is usually 48-64 characters
* Please keep your KEY safe, do not share in public places

## Usage Recommendations

1. **Development Testing**: Use default token for quick development and testing
2. **Production Environment**: Create dedicated KEYs for production projects for easier management and monitoring
3. **Team Collaboration**: Create independent KEYs for different team members for convenient permission management
