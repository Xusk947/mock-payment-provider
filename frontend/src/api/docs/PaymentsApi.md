# .PaymentsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apiV13dsChallengePost**](PaymentsApi.md#apiV13dsChallengePost) | **POST** /api/v1/3ds/challenge | Generate 3DS challenge
[**apiV1CapturesPost**](PaymentsApi.md#apiV1CapturesPost) | **POST** /api/v1/captures | Capture a hold
[**apiV1ChargesPost**](PaymentsApi.md#apiV1ChargesPost) | **POST** /api/v1/charges | Process a charge
[**apiV1HoldsPost**](PaymentsApi.md#apiV1HoldsPost) | **POST** /api/v1/holds | Place a hold
[**apiV1RefundsPost**](PaymentsApi.md#apiV1RefundsPost) | **POST** /api/v1/refunds | Process a refund
[**apiV1TransactionsGet**](PaymentsApi.md#apiV1TransactionsGet) | **GET** /api/v1/transactions | List transactions
[**apiV1TransactionsId3dsCompletePost**](PaymentsApi.md#apiV1TransactionsId3dsCompletePost) | **POST** /api/v1/transactions/{id}/3ds/complete | Complete 3D Secure authentication
[**apiV1TransactionsIdCapturePost**](PaymentsApi.md#apiV1TransactionsIdCapturePost) | **POST** /api/v1/transactions/{id}/capture | Capture a hold
[**apiV1TransactionsIdConfirmPost**](PaymentsApi.md#apiV1TransactionsIdConfirmPost) | **POST** /api/v1/transactions/{id}/confirm | Confirm a pending transaction
[**apiV1TransactionsIdGet**](PaymentsApi.md#apiV1TransactionsIdGet) | **GET** /api/v1/transactions/{id} | Get transaction by ID
[**apiV1TransactionsIdRefundPost**](PaymentsApi.md#apiV1TransactionsIdRefundPost) | **POST** /api/v1/transactions/{id}/refund | Refund a transaction
[**apiV1TransactionsIdRejectPost**](PaymentsApi.md#apiV1TransactionsIdRejectPost) | **POST** /api/v1/transactions/{id}/reject | Reject a transaction


# **apiV13dsChallengePost**
> ModelsThreeDSChallengeResponse apiV13dsChallengePost(request)

Generate a 3D Secure challenge for a card

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV13dsChallengePostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV13dsChallengePostRequest = {
    // 3DS Request
  request: {
    card_number: "card_number_example",
    merchant_id: 1,
  },
};

const data = await apiInstance.apiV13dsChallengePost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsThreeDSChallengeRequest**| 3DS Request |


### Return type

**ModelsThreeDSChallengeResponse**

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

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1CapturesPost**
> ModelsTransaction apiV1CapturesPost(request)

Capture an authorized hold transaction

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1CapturesPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1CapturesPostRequest = {
    // Capture Request
  request: {
    amount: 3.14,
    api_key: "api_key_example",
    hold_id: 1,
  },
};

const data = await apiInstance.apiV1CapturesPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **HandlersCaptureRequest**| Capture Request |


### Return type

**ModelsTransaction**

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
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1ChargesPost**
> ModelsTransaction apiV1ChargesPost(request)

Create a new charge transaction

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1ChargesPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1ChargesPostRequest = {
    // Charge Request
  request: {
    amount: 3.14,
    api_key: "api_key_example",
    card_number: "card_number_example",
    card_type: "card_type_example",
    cardholder_name: "cardholder_name_example",
    currency: "currency_example",
    cvv: "cvv_example",
    expiry_month: 1,
    expiry_year: 1,
    three_ds_authenticated: true,
  },
};

const data = await apiInstance.apiV1ChargesPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ServicesChargeRequest**| Charge Request |


### Return type

**ModelsTransaction**

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
**402** | Payment Required |  -  |
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1HoldsPost**
> ModelsTransaction apiV1HoldsPost(request)

Authorize a hold on a card

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1HoldsPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1HoldsPostRequest = {
    // Hold Request
  request: {
    amount: 3.14,
    api_key: "api_key_example",
    card_number: "card_number_example",
    card_type: "card_type_example",
    cardholder_name: "cardholder_name_example",
    currency: "currency_example",
    cvv: "cvv_example",
    expiry_month: 1,
    expiry_year: 1,
    three_ds_authenticated: true,
  },
};

const data = await apiInstance.apiV1HoldsPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ServicesChargeRequest**| Hold Request |


### Return type

**ModelsTransaction**

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
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1RefundsPost**
> ModelsTransaction apiV1RefundsPost(request)

Issue a refund for a completed transaction

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1RefundsPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1RefundsPostRequest = {
    // Refund Request
  request: {
    amount: 3.14,
    api_key: "api_key_example",
    transaction_id: 1,
  },
};

const data = await apiInstance.apiV1RefundsPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **HandlersRefundRequest**| Refund Request |


### Return type

**ModelsTransaction**

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
**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1TransactionsGet**
> Array<ModelsTransaction> apiV1TransactionsGet()

Retrieve paginated list of transactions

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsGetRequest = {
    // Limit (optional)
  limit: 1,
    // Offset (optional)
  offset: 1,
};

const data = await apiInstance.apiV1TransactionsGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | [**number**] | Limit | (optional) defaults to undefined
 **offset** | [**number**] | Offset | (optional) defaults to undefined


### Return type

**Array<ModelsTransaction>**

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

# **apiV1TransactionsId3dsCompletePost**
> ModelsThreeDSAuthenticateResponse apiV1TransactionsId3dsCompletePost()

Authenticate a transaction requiring 3DS

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsId3dsCompletePostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsId3dsCompletePostRequest = {
    // Transaction ID
  id: 1,
    // 3DS Authentication (optional)
  request: {
    authenticated: true,
  },
};

const data = await apiInstance.apiV1TransactionsId3dsCompletePost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsThreeDSAuthenticateRequest**| 3DS Authentication |
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsThreeDSAuthenticateResponse**

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

# **apiV1TransactionsIdCapturePost**
> ModelsTransaction apiV1TransactionsIdCapturePost(request)

Capture an authorized hold amount

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsIdCapturePostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsIdCapturePostRequest = {
    // Transaction ID
  id: 1,
    // Capture Request
  request: {
    amount: 3.14,
  },
};

const data = await apiInstance.apiV1TransactionsIdCapturePost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsCaptureTransactionRequest**| Capture Request |
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsTransaction**

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

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1TransactionsIdConfirmPost**
> ModelsTransaction apiV1TransactionsIdConfirmPost()

Mark a pending transaction as completed

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsIdConfirmPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsIdConfirmPostRequest = {
    // Transaction ID
  id: 1,
};

const data = await apiInstance.apiV1TransactionsIdConfirmPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsTransaction**

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

# **apiV1TransactionsIdGet**
> ModelsTransaction apiV1TransactionsIdGet()

Retrieve a single transaction details

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsIdGetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsIdGetRequest = {
    // Transaction ID
  id: 1,
};

const data = await apiInstance.apiV1TransactionsIdGet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsTransaction**

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

# **apiV1TransactionsIdRefundPost**
> ModelsTransaction apiV1TransactionsIdRefundPost(request)

Issue a refund for a completed or captured transaction

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsIdRefundPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsIdRefundPostRequest = {
    // Transaction ID
  id: 1,
    // Refund Request
  request: {
    amount: 3.14,
  },
};

const data = await apiInstance.apiV1TransactionsIdRefundPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | **ModelsRefundTransactionRequest**| Refund Request |
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsTransaction**

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

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **apiV1TransactionsIdRejectPost**
> ModelsTransaction apiV1TransactionsIdRejectPost()

Mark a transaction as failed

### Example


```typescript
import { createConfiguration, PaymentsApi } from '';
import type { PaymentsApiApiV1TransactionsIdRejectPostRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PaymentsApi(configuration);

const request: PaymentsApiApiV1TransactionsIdRejectPostRequest = {
    // Transaction ID
  id: 1,
};

const data = await apiInstance.apiV1TransactionsIdRejectPost(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**number**] | Transaction ID | defaults to undefined


### Return type

**ModelsTransaction**

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


