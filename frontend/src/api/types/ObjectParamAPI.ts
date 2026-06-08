// @ts-nocheck
import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions } from '../configuration'
import type { Middleware } from '../middleware';

import { HandlersCaptureRequest } from '../models/HandlersCaptureRequest';
import { HandlersRefundRequest } from '../models/HandlersRefundRequest';
import { ModelsCaptureTransactionRequest } from '../models/ModelsCaptureTransactionRequest';
import { ModelsCard } from '../models/ModelsCard';
import { ModelsDashboardResponse } from '../models/ModelsDashboardResponse';
import { ModelsErrorResponse } from '../models/ModelsErrorResponse';
import { ModelsErrorScenario } from '../models/ModelsErrorScenario';
import { ModelsMerchant } from '../models/ModelsMerchant';
import { ModelsRefundTransactionRequest } from '../models/ModelsRefundTransactionRequest';
import { ModelsThreeDSAuthenticateRequest } from '../models/ModelsThreeDSAuthenticateRequest';
import { ModelsThreeDSAuthenticateResponse } from '../models/ModelsThreeDSAuthenticateResponse';
import { ModelsThreeDSChallengeRequest } from '../models/ModelsThreeDSChallengeRequest';
import { ModelsThreeDSChallengeResponse } from '../models/ModelsThreeDSChallengeResponse';
import { ModelsThreeDSRequiredResponse } from '../models/ModelsThreeDSRequiredResponse';
import { ModelsTransaction } from '../models/ModelsTransaction';
import { ModelsWebhook } from '../models/ModelsWebhook';
import { ModelsWebhookRequest } from '../models/ModelsWebhookRequest';
import { ServicesChargeRequest } from '../models/ServicesChargeRequest';

import { ObservableAdminApi } from "./ObservableAPI";
import { AdminApiRequestFactory, AdminApiResponseProcessor} from "../apis/AdminApi";

export interface AdminApiAdminCardsGetRequest {
}

export interface AdminApiAdminCardsIdGetRequest {
    /**
     * Card ID
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminCardsIdGet
     */
    id: number
}

export interface AdminApiAdminDashboardGetRequest {
}

export interface AdminApiAdminErrorScenariosGetRequest {
}

export interface AdminApiAdminErrorScenariosIdGetRequest {
    /**
     * Scenario ID
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminErrorScenariosIdGet
     */
    id: number
}

export interface AdminApiAdminMerchantsGetRequest {
    /**
     * Limit
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminMerchantsGet
     */
    limit?: number
    /**
     * Offset
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminMerchantsGet
     */
    offset?: number
}

export interface AdminApiAdminMerchantsIdGetRequest {
    /**
     * Merchant ID
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminMerchantsIdGet
     */
    id: number
}

export interface AdminApiAdminMerchantsIdWebhooksGetRequest {
    /**
     * Merchant ID
     * Defaults to: undefined
     * @type number
     * @memberof AdminApiadminMerchantsIdWebhooksGet
     */
    id: number
}

export class ObjectAdminApi {
    private api: ObservableAdminApi

    public constructor(configuration: Configuration, requestFactory?: AdminApiRequestFactory, responseProcessor?: AdminApiResponseProcessor) {
        this.api = new ObservableAdminApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve all test cards
     * List cards
     * @param param the request object
     */
    public adminCardsGetWithHttpInfo(param: AdminApiAdminCardsGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsCard>>> {
        return this.api.adminCardsGetWithHttpInfo( options).toPromise();
    }

    /**
     * Retrieve all test cards
     * List cards
     * @param param the request object
     */
    public adminCardsGet(param: AdminApiAdminCardsGetRequest = {}, options?: ConfigurationOptions): Promise<Array<ModelsCard>> {
        return this.api.adminCardsGet( options).toPromise();
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param param the request object
     */
    public adminCardsIdGetWithHttpInfo(param: AdminApiAdminCardsIdGetRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsCard>> {
        return this.api.adminCardsIdGetWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param param the request object
     */
    public adminCardsIdGet(param: AdminApiAdminCardsIdGetRequest, options?: ConfigurationOptions): Promise<ModelsCard> {
        return this.api.adminCardsIdGet(param.id,  options).toPromise();
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     * @param param the request object
     */
    public adminDashboardGetWithHttpInfo(param: AdminApiAdminDashboardGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<ModelsDashboardResponse>> {
        return this.api.adminDashboardGetWithHttpInfo( options).toPromise();
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     * @param param the request object
     */
    public adminDashboardGet(param: AdminApiAdminDashboardGetRequest = {}, options?: ConfigurationOptions): Promise<ModelsDashboardResponse> {
        return this.api.adminDashboardGet( options).toPromise();
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     * @param param the request object
     */
    public adminErrorScenariosGetWithHttpInfo(param: AdminApiAdminErrorScenariosGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsErrorScenario>>> {
        return this.api.adminErrorScenariosGetWithHttpInfo( options).toPromise();
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     * @param param the request object
     */
    public adminErrorScenariosGet(param: AdminApiAdminErrorScenariosGetRequest = {}, options?: ConfigurationOptions): Promise<Array<ModelsErrorScenario>> {
        return this.api.adminErrorScenariosGet( options).toPromise();
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param param the request object
     */
    public adminErrorScenariosIdGetWithHttpInfo(param: AdminApiAdminErrorScenariosIdGetRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsErrorScenario>> {
        return this.api.adminErrorScenariosIdGetWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param param the request object
     */
    public adminErrorScenariosIdGet(param: AdminApiAdminErrorScenariosIdGetRequest, options?: ConfigurationOptions): Promise<ModelsErrorScenario> {
        return this.api.adminErrorScenariosIdGet(param.id,  options).toPromise();
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param param the request object
     */
    public adminMerchantsGetWithHttpInfo(param: AdminApiAdminMerchantsGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsMerchant>>> {
        return this.api.adminMerchantsGetWithHttpInfo(param.limit, param.offset,  options).toPromise();
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param param the request object
     */
    public adminMerchantsGet(param: AdminApiAdminMerchantsGetRequest = {}, options?: ConfigurationOptions): Promise<Array<ModelsMerchant>> {
        return this.api.adminMerchantsGet(param.limit, param.offset,  options).toPromise();
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param param the request object
     */
    public adminMerchantsIdGetWithHttpInfo(param: AdminApiAdminMerchantsIdGetRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsMerchant>> {
        return this.api.adminMerchantsIdGetWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param param the request object
     */
    public adminMerchantsIdGet(param: AdminApiAdminMerchantsIdGetRequest, options?: ConfigurationOptions): Promise<ModelsMerchant> {
        return this.api.adminMerchantsIdGet(param.id,  options).toPromise();
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param param the request object
     */
    public adminMerchantsIdWebhooksGetWithHttpInfo(param: AdminApiAdminMerchantsIdWebhooksGetRequest, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsWebhook>>> {
        return this.api.adminMerchantsIdWebhooksGetWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param param the request object
     */
    public adminMerchantsIdWebhooksGet(param: AdminApiAdminMerchantsIdWebhooksGetRequest, options?: ConfigurationOptions): Promise<Array<ModelsWebhook>> {
        return this.api.adminMerchantsIdWebhooksGet(param.id,  options).toPromise();
    }

}

import { ObservablePaymentsApi } from "./ObservableAPI";
import { PaymentsApiRequestFactory, PaymentsApiResponseProcessor} from "../apis/PaymentsApi";

export interface PaymentsApiApiV13dsChallengePostRequest {
    /**
     * 3DS Request
     * @type ModelsThreeDSChallengeRequest
     * @memberof PaymentsApiapiV13dsChallengePost
     */
    request: ModelsThreeDSChallengeRequest
}

export interface PaymentsApiApiV1CapturesPostRequest {
    /**
     * Capture Request
     * @type HandlersCaptureRequest
     * @memberof PaymentsApiapiV1CapturesPost
     */
    request: HandlersCaptureRequest
}

export interface PaymentsApiApiV1ChargesPostRequest {
    /**
     * Charge Request
     * @type ServicesChargeRequest
     * @memberof PaymentsApiapiV1ChargesPost
     */
    request: ServicesChargeRequest
}

export interface PaymentsApiApiV1HoldsPostRequest {
    /**
     * Hold Request
     * @type ServicesChargeRequest
     * @memberof PaymentsApiapiV1HoldsPost
     */
    request: ServicesChargeRequest
}

export interface PaymentsApiApiV1RefundsPostRequest {
    /**
     * Refund Request
     * @type HandlersRefundRequest
     * @memberof PaymentsApiapiV1RefundsPost
     */
    request: HandlersRefundRequest
}

export interface PaymentsApiApiV1TransactionsGetRequest {
    /**
     * Limit
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsGet
     */
    limit?: number
    /**
     * Offset
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsGet
     */
    offset?: number
}

export interface PaymentsApiApiV1TransactionsId3dsCompletePostRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsId3dsCompletePost
     */
    id: number
    /**
     * 3DS Authentication
     * @type ModelsThreeDSAuthenticateRequest
     * @memberof PaymentsApiapiV1TransactionsId3dsCompletePost
     */
    request?: ModelsThreeDSAuthenticateRequest
}

export interface PaymentsApiApiV1TransactionsIdCapturePostRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsIdCapturePost
     */
    id: number
    /**
     * Capture Request
     * @type ModelsCaptureTransactionRequest
     * @memberof PaymentsApiapiV1TransactionsIdCapturePost
     */
    request: ModelsCaptureTransactionRequest
}

export interface PaymentsApiApiV1TransactionsIdConfirmPostRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsIdConfirmPost
     */
    id: number
}

export interface PaymentsApiApiV1TransactionsIdGetRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsIdGet
     */
    id: number
}

export interface PaymentsApiApiV1TransactionsIdRefundPostRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsIdRefundPost
     */
    id: number
    /**
     * Refund Request
     * @type ModelsRefundTransactionRequest
     * @memberof PaymentsApiapiV1TransactionsIdRefundPost
     */
    request: ModelsRefundTransactionRequest
}

export interface PaymentsApiApiV1TransactionsIdRejectPostRequest {
    /**
     * Transaction ID
     * Defaults to: undefined
     * @type number
     * @memberof PaymentsApiapiV1TransactionsIdRejectPost
     */
    id: number
}

export class ObjectPaymentsApi {
    private api: ObservablePaymentsApi

    public constructor(configuration: Configuration, requestFactory?: PaymentsApiRequestFactory, responseProcessor?: PaymentsApiResponseProcessor) {
        this.api = new ObservablePaymentsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param param the request object
     */
    public apiV13dsChallengePostWithHttpInfo(param: PaymentsApiApiV13dsChallengePostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsThreeDSChallengeResponse>> {
        return this.api.apiV13dsChallengePostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param param the request object
     */
    public apiV13dsChallengePost(param: PaymentsApiApiV13dsChallengePostRequest, options?: ConfigurationOptions): Promise<ModelsThreeDSChallengeResponse> {
        return this.api.apiV13dsChallengePost(param.request,  options).toPromise();
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param param the request object
     */
    public apiV1CapturesPostWithHttpInfo(param: PaymentsApiApiV1CapturesPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1CapturesPostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param param the request object
     */
    public apiV1CapturesPost(param: PaymentsApiApiV1CapturesPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1CapturesPost(param.request,  options).toPromise();
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param param the request object
     */
    public apiV1ChargesPostWithHttpInfo(param: PaymentsApiApiV1ChargesPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1ChargesPostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param param the request object
     */
    public apiV1ChargesPost(param: PaymentsApiApiV1ChargesPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1ChargesPost(param.request,  options).toPromise();
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param param the request object
     */
    public apiV1HoldsPostWithHttpInfo(param: PaymentsApiApiV1HoldsPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1HoldsPostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param param the request object
     */
    public apiV1HoldsPost(param: PaymentsApiApiV1HoldsPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1HoldsPost(param.request,  options).toPromise();
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param param the request object
     */
    public apiV1RefundsPostWithHttpInfo(param: PaymentsApiApiV1RefundsPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1RefundsPostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param param the request object
     */
    public apiV1RefundsPost(param: PaymentsApiApiV1RefundsPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1RefundsPost(param.request,  options).toPromise();
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param param the request object
     */
    public apiV1TransactionsGetWithHttpInfo(param: PaymentsApiApiV1TransactionsGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsTransaction>>> {
        return this.api.apiV1TransactionsGetWithHttpInfo(param.limit, param.offset,  options).toPromise();
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param param the request object
     */
    public apiV1TransactionsGet(param: PaymentsApiApiV1TransactionsGetRequest = {}, options?: ConfigurationOptions): Promise<Array<ModelsTransaction>> {
        return this.api.apiV1TransactionsGet(param.limit, param.offset,  options).toPromise();
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param param the request object
     */
    public apiV1TransactionsId3dsCompletePostWithHttpInfo(param: PaymentsApiApiV1TransactionsId3dsCompletePostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsThreeDSAuthenticateResponse>> {
        return this.api.apiV1TransactionsId3dsCompletePostWithHttpInfo(param.id, param.request,  options).toPromise();
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param param the request object
     */
    public apiV1TransactionsId3dsCompletePost(param: PaymentsApiApiV1TransactionsId3dsCompletePostRequest, options?: ConfigurationOptions): Promise<ModelsThreeDSAuthenticateResponse> {
        return this.api.apiV1TransactionsId3dsCompletePost(param.id, param.request,  options).toPromise();
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param param the request object
     */
    public apiV1TransactionsIdCapturePostWithHttpInfo(param: PaymentsApiApiV1TransactionsIdCapturePostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1TransactionsIdCapturePostWithHttpInfo(param.id, param.request,  options).toPromise();
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param param the request object
     */
    public apiV1TransactionsIdCapturePost(param: PaymentsApiApiV1TransactionsIdCapturePostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1TransactionsIdCapturePost(param.id, param.request,  options).toPromise();
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param param the request object
     */
    public apiV1TransactionsIdConfirmPostWithHttpInfo(param: PaymentsApiApiV1TransactionsIdConfirmPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1TransactionsIdConfirmPostWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param param the request object
     */
    public apiV1TransactionsIdConfirmPost(param: PaymentsApiApiV1TransactionsIdConfirmPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1TransactionsIdConfirmPost(param.id,  options).toPromise();
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param param the request object
     */
    public apiV1TransactionsIdGetWithHttpInfo(param: PaymentsApiApiV1TransactionsIdGetRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1TransactionsIdGetWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param param the request object
     */
    public apiV1TransactionsIdGet(param: PaymentsApiApiV1TransactionsIdGetRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1TransactionsIdGet(param.id,  options).toPromise();
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param param the request object
     */
    public apiV1TransactionsIdRefundPostWithHttpInfo(param: PaymentsApiApiV1TransactionsIdRefundPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1TransactionsIdRefundPostWithHttpInfo(param.id, param.request,  options).toPromise();
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param param the request object
     */
    public apiV1TransactionsIdRefundPost(param: PaymentsApiApiV1TransactionsIdRefundPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1TransactionsIdRefundPost(param.id, param.request,  options).toPromise();
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param param the request object
     */
    public apiV1TransactionsIdRejectPostWithHttpInfo(param: PaymentsApiApiV1TransactionsIdRejectPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        return this.api.apiV1TransactionsIdRejectPostWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param param the request object
     */
    public apiV1TransactionsIdRejectPost(param: PaymentsApiApiV1TransactionsIdRejectPostRequest, options?: ConfigurationOptions): Promise<ModelsTransaction> {
        return this.api.apiV1TransactionsIdRejectPost(param.id,  options).toPromise();
    }

}

import { ObservableWebhooksApi } from "./ObservableAPI";
import { WebhooksApiRequestFactory, WebhooksApiResponseProcessor} from "../apis/WebhooksApi";

export interface WebhooksApiAdminWebhooksGetRequest {
}

export interface WebhooksApiAdminWebhooksIdDeleteRequest {
    /**
     * Webhook ID
     * Defaults to: undefined
     * @type number
     * @memberof WebhooksApiadminWebhooksIdDelete
     */
    id: number
}

export interface WebhooksApiAdminWebhooksIdPutRequest {
    /**
     * Webhook ID
     * Defaults to: undefined
     * @type number
     * @memberof WebhooksApiadminWebhooksIdPut
     */
    id: number
    /**
     * Webhook Request
     * @type ModelsWebhookRequest
     * @memberof WebhooksApiadminWebhooksIdPut
     */
    request: ModelsWebhookRequest
}

export interface WebhooksApiAdminWebhooksPostRequest {
    /**
     * Webhook Request
     * @type ModelsWebhookRequest
     * @memberof WebhooksApiadminWebhooksPost
     */
    request: ModelsWebhookRequest
}

export class ObjectWebhooksApi {
    private api: ObservableWebhooksApi

    public constructor(configuration: Configuration, requestFactory?: WebhooksApiRequestFactory, responseProcessor?: WebhooksApiResponseProcessor) {
        this.api = new ObservableWebhooksApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     * @param param the request object
     */
    public adminWebhooksGetWithHttpInfo(param: WebhooksApiAdminWebhooksGetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Array<ModelsWebhook>>> {
        return this.api.adminWebhooksGetWithHttpInfo( options).toPromise();
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     * @param param the request object
     */
    public adminWebhooksGet(param: WebhooksApiAdminWebhooksGetRequest = {}, options?: ConfigurationOptions): Promise<Array<ModelsWebhook>> {
        return this.api.adminWebhooksGet( options).toPromise();
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param param the request object
     */
    public adminWebhooksIdDeleteWithHttpInfo(param: WebhooksApiAdminWebhooksIdDeleteRequest, options?: ConfigurationOptions): Promise<HttpInfo<void>> {
        return this.api.adminWebhooksIdDeleteWithHttpInfo(param.id,  options).toPromise();
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param param the request object
     */
    public adminWebhooksIdDelete(param: WebhooksApiAdminWebhooksIdDeleteRequest, options?: ConfigurationOptions): Promise<void> {
        return this.api.adminWebhooksIdDelete(param.id,  options).toPromise();
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param param the request object
     */
    public adminWebhooksIdPutWithHttpInfo(param: WebhooksApiAdminWebhooksIdPutRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsWebhook>> {
        return this.api.adminWebhooksIdPutWithHttpInfo(param.id, param.request,  options).toPromise();
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param param the request object
     */
    public adminWebhooksIdPut(param: WebhooksApiAdminWebhooksIdPutRequest, options?: ConfigurationOptions): Promise<ModelsWebhook> {
        return this.api.adminWebhooksIdPut(param.id, param.request,  options).toPromise();
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param param the request object
     */
    public adminWebhooksPostWithHttpInfo(param: WebhooksApiAdminWebhooksPostRequest, options?: ConfigurationOptions): Promise<HttpInfo<ModelsWebhook>> {
        return this.api.adminWebhooksPostWithHttpInfo(param.request,  options).toPromise();
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param param the request object
     */
    public adminWebhooksPost(param: WebhooksApiAdminWebhooksPostRequest, options?: ConfigurationOptions): Promise<ModelsWebhook> {
        return this.api.adminWebhooksPost(param.request,  options).toPromise();
    }

}
