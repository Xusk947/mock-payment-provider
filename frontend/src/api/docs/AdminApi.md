# .AdminApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminCardsGet**](AdminApi.md#adminCardsGet) | **GET** /admin/cards | List cards
[**adminCardsIdGet**](AdminApi.md#adminCardsIdGet) | **GET** /admin/cards/{id} | Get card by ID
[**adminDashboardGet**](AdminApi.md#adminDashboardGet) | **GET** /admin/dashboard | Admin dashboard statistics
[**adminErrorScenariosGet**](AdminApi.md#adminErrorScenariosGet) | **GET** /admin/error-scenarios | List error scenarios
[**adminErrorScenariosIdGet**](AdminApi.md#adminErrorScenariosIdGet) | **GET** /admin/error-scenarios/{id} | Get error scenario by ID
[**adminMerchantsGet**](AdminApi.md#adminMerchantsGet) | **GET** /admin/merchants | List merchants
[**adminMerchantsIdGet**](AdminApi.md#adminMerchantsIdGet) | **GET** /admin/merchants/{id} | Get merchant by ID
[**adminMerchantsIdWebhooksGet**](AdminApi.md#adminMerchantsIdWebhooksGet) | **GET** /admin/merchants/{id}/webhooks | Get merchant webhooks


# **adminCardsGet**
> Array<ModelsCard> adminCardsGet()

Retrieve all test cards

### Example


```typescript
import { createConfiguration, AdminApi } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request = {};

const data = await apiInstance.adminCardsGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**Array<ModelsCard>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminCardsIdGet**
> ModelsCard adminCardsIdGet()

Retrieve a single test card

### Example


```typescript
import { createConfiguration, AdminApi } from '';
import type { AdminApiAdminCardsIdGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request: AdminApiAdminCardsIdGetRequest = {
    // Card ID
  id: 1,
};

const data = await apiInstance.adminCardsIdGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Card ID | defaults to undefined


### Return type

**ModelsCard**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**400** | Bad Request |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminDashboardGet**
> ModelsDashboardResponse adminDashboardGet()

Retrieve dashboard statistics for admin panel

### Example


```typescript
import { createConfiguration, AdminApi } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request = {};

const data = await apiInstance.adminDashboardGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**ModelsDashboardResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminErrorScenariosGet**
> Array<ModelsErrorScenario> adminErrorScenariosGet()

Retrieve active error scenarios

### Example


```typescript
import { createConfiguration, AdminApi } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request = {};

const data = await apiInstance.adminErrorScenariosGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**Array<ModelsErrorScenario>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminErrorScenariosIdGet**
> ModelsErrorScenario adminErrorScenariosIdGet()

Retrieve a single error scenario

### Example


```typescript
import { createConfiguration, AdminApi } from '';
import type { AdminApiAdminErrorScenariosIdGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request: AdminApiAdminErrorScenariosIdGetRequest = {
    // Scenario ID
  id: 1,
};

const data = await apiInstance.adminErrorScenariosIdGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Scenario ID | defaults to undefined


### Return type

**ModelsErrorScenario**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**400** | Bad Request |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminMerchantsGet**
> Array<ModelsMerchant> adminMerchantsGet()

Retrieve paginated list of merchants

### Example


```typescript
import { createConfiguration, AdminApi } from '';
import type { AdminApiAdminMerchantsGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request: AdminApiAdminMerchantsGetRequest = {
    // Limit (optional)
  limit: 1,
    // Offset (optional)
  offset: 1,
};

const data = await apiInstance.adminMerchantsGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | [**number**] | Limit | (optional) defaults to undefined
 **offset** | [**number**] | Offset | (optional) defaults to undefined


### Return type

**Array<ModelsMerchant>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminMerchantsIdGet**
> ModelsMerchant adminMerchantsIdGet()

Retrieve a single merchant details

### Example


```typescript
import { createConfiguration, AdminApi } from '';
import type { AdminApiAdminMerchantsIdGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request: AdminApiAdminMerchantsIdGetRequest = {
    // Merchant ID
  id: 1,
};

const data = await apiInstance.adminMerchantsIdGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Merchant ID | defaults to undefined


### Return type

**ModelsMerchant**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | OK |  -  |
**400** | Bad Request |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **adminMerchantsIdWebhooksGet**
> Array<ModelsWebhook> adminMerchantsIdWebhooksGet()

Retrieve webhooks for a merchant

### Example


```typescript
import { createConfiguration, AdminApi } from '';
import type { AdminApiAdminMerchantsIdWebhooksGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new AdminApi(configuration);

const request: AdminApiAdminMerchantsIdWebhooksGetRequest = {
    // Merchant ID
  id: 1,
};

const data = await apiInstance.adminMerchantsIdWebhooksGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Merchant ID | defaults to undefined


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
**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


