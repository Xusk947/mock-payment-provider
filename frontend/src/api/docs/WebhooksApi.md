# .WebhooksApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminWebhooksGet**](WebhooksApi.md#adminWebhooksGet) | **GET** /admin/webhooks | List webhooks
[**adminWebhooksIdDelete**](WebhooksApi.md#adminWebhooksIdDelete) | **DELETE** /admin/webhooks/{id} | Delete webhook
[**adminWebhooksIdPut**](WebhooksApi.md#adminWebhooksIdPut) | **PUT** /admin/webhooks/{id} | Update webhook
[**adminWebhooksPost**](WebhooksApi.md#adminWebhooksPost) | **POST** /admin/webhooks | Create webhook


# **adminWebhooksGet**
> Array<ModelsWebhook> adminWebhooksGet()

Retrieve webhooks for the authenticated merchant

### Example


```typescript
import { createConfiguration, WebhooksApi } from '';

const configuration = createConfiguration();
const apiInstance = new WebhooksApi(configuration);

const request = {};

const data = await apiInstance.adminWebhooksGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**Array<ModelsWebhook>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminWebhooksIdDelete**
> void adminWebhooksIdDelete()

Remove a webhook configuration

### Example


```typescript
import { createConfiguration, WebhooksApi } from '';
import type { WebhooksApiAdminWebhooksIdDeleteRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WebhooksApi(configuration);

const request: WebhooksApiAdminWebhooksIdDeleteRequest = {
    // Webhook ID
  id: 1,
};

const data = await apiInstance.adminWebhooksIdDelete(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Webhook ID | defaults to undefined


### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**204** | No Content |  -  |
**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminWebhooksIdPut**
> ModelsWebhook adminWebhooksIdPut(request)

Update an existing webhook configuration

### Example


```typescript
import { createConfiguration, WebhooksApi } from '';
import type { WebhooksApiAdminWebhooksIdPutRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WebhooksApi(configuration);

const request: WebhooksApiAdminWebhooksIdPutRequest = {
    // Webhook ID
  id: 1,
    // Webhook Request
  request: {
    active: true,
    events: [
      "events_example",
    ],
    url: "url_example",
  },
};

const data = await apiInstance.adminWebhooksIdPut(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsWebhookRequest**| Webhook Request |
 **id** | [**number**] | Webhook ID | defaults to undefined


### Return type

**ModelsWebhook**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**400** | Bad Request |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminWebhooksPost**
> ModelsWebhook adminWebhooksPost(request)

Register a new webhook endpoint

### Example


```typescript
import { createConfiguration, WebhooksApi } from '';
import type { WebhooksApiAdminWebhooksPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WebhooksApi(configuration);

const request: WebhooksApiAdminWebhooksPostRequest = {
    // Webhook Request
  request: {
    active: true,
    events: [
      "events_example",
    ],
    url: "url_example",
  },
};

const data = await apiInstance.adminWebhooksPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsWebhookRequest**| Webhook Request |


### Return type

**ModelsWebhook**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Created |  -  |
**400** | Bad Request |  -  |
**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


