// @ts-nocheck
import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, PromiseConfigurationOptions, wrapOptions } from '../configuration'
import { PromiseMiddleware, Middleware, PromiseMiddlewareWrapper } from '../middleware';

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
import { ObservableAdminApi } from './ObservableAPI';

import { AdminApiRequestFactory, AdminApiResponseProcessor} from "../apis/AdminApi";
export class PromiseAdminApi {
    private api: ObservableAdminApi

    public constructor(
        configuration: Configuration,
        requestFactory?: AdminApiRequestFactory,
        responseProcessor?: AdminApiResponseProcessor
    ) {
        this.api = new ObservableAdminApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve all test cards
     * List cards
     */
    public adminCardsGetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsCard>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminCardsGetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve all test cards
     * List cards
     */
    public adminCardsGet(_options?: PromiseConfigurationOptions): Promise<Array<ModelsCard>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminCardsGet(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param id Card ID
     */
    public adminCardsIdGetWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsCard>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminCardsIdGetWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param id Card ID
     */
    public adminCardsIdGet(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsCard> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminCardsIdGet(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     */
    public adminDashboardGetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsDashboardResponse>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminDashboardGetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     */
    public adminDashboardGet(_options?: PromiseConfigurationOptions): Promise<ModelsDashboardResponse> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminDashboardGet(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     */
    public adminErrorScenariosGetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsErrorScenario>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminErrorScenariosGetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     */
    public adminErrorScenariosGet(_options?: PromiseConfigurationOptions): Promise<Array<ModelsErrorScenario>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminErrorScenariosGet(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param id Scenario ID
     */
    public adminErrorScenariosIdGetWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsErrorScenario>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminErrorScenariosIdGetWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param id Scenario ID
     */
    public adminErrorScenariosIdGet(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsErrorScenario> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminErrorScenariosIdGet(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public adminMerchantsGetWithHttpInfo(limit?: number, offset?: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsMerchant>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsGetWithHttpInfo(limit, offset, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public adminMerchantsGet(limit?: number, offset?: number, _options?: PromiseConfigurationOptions): Promise<Array<ModelsMerchant>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsGet(limit, offset, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param id Merchant ID
     */
    public adminMerchantsIdGetWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsMerchant>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsIdGetWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param id Merchant ID
     */
    public adminMerchantsIdGet(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsMerchant> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsIdGet(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param id Merchant ID
     */
    public adminMerchantsIdWebhooksGetWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsWebhook>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsIdWebhooksGetWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param id Merchant ID
     */
    public adminMerchantsIdWebhooksGet(id: number, _options?: PromiseConfigurationOptions): Promise<Array<ModelsWebhook>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminMerchantsIdWebhooksGet(id, observableOptions);
        return result.toPromise();
    }


}



import { ObservablePaymentsApi } from './ObservableAPI';

import { PaymentsApiRequestFactory, PaymentsApiResponseProcessor} from "../apis/PaymentsApi";
export class PromisePaymentsApi {
    private api: ObservablePaymentsApi

    public constructor(
        configuration: Configuration,
        requestFactory?: PaymentsApiRequestFactory,
        responseProcessor?: PaymentsApiResponseProcessor
    ) {
        this.api = new ObservablePaymentsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param request 3DS Request
     */
    public apiV13dsChallengePostWithHttpInfo(request: ModelsThreeDSChallengeRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsThreeDSChallengeResponse>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV13dsChallengePostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param request 3DS Request
     */
    public apiV13dsChallengePost(request: ModelsThreeDSChallengeRequest, _options?: PromiseConfigurationOptions): Promise<ModelsThreeDSChallengeResponse> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV13dsChallengePost(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param request Capture Request
     */
    public apiV1CapturesPostWithHttpInfo(request: HandlersCaptureRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1CapturesPostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param request Capture Request
     */
    public apiV1CapturesPost(request: HandlersCaptureRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1CapturesPost(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param request Charge Request
     */
    public apiV1ChargesPostWithHttpInfo(request: ServicesChargeRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1ChargesPostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param request Charge Request
     */
    public apiV1ChargesPost(request: ServicesChargeRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1ChargesPost(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param request Hold Request
     */
    public apiV1HoldsPostWithHttpInfo(request: ServicesChargeRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1HoldsPostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param request Hold Request
     */
    public apiV1HoldsPost(request: ServicesChargeRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1HoldsPost(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param request Refund Request
     */
    public apiV1RefundsPostWithHttpInfo(request: HandlersRefundRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1RefundsPostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param request Refund Request
     */
    public apiV1RefundsPost(request: HandlersRefundRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1RefundsPost(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public apiV1TransactionsGetWithHttpInfo(limit?: number, offset?: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsTransaction>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsGetWithHttpInfo(limit, offset, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public apiV1TransactionsGet(limit?: number, offset?: number, _options?: PromiseConfigurationOptions): Promise<Array<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsGet(limit, offset, observableOptions);
        return result.toPromise();
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param id Transaction ID
     * @param [request] 3DS Authentication
     */
    public apiV1TransactionsId3dsCompletePostWithHttpInfo(id: number, request?: ModelsThreeDSAuthenticateRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsThreeDSAuthenticateResponse>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsId3dsCompletePostWithHttpInfo(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param id Transaction ID
     * @param [request] 3DS Authentication
     */
    public apiV1TransactionsId3dsCompletePost(id: number, request?: ModelsThreeDSAuthenticateRequest, _options?: PromiseConfigurationOptions): Promise<ModelsThreeDSAuthenticateResponse> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsId3dsCompletePost(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param id Transaction ID
     * @param request Capture Request
     */
    public apiV1TransactionsIdCapturePostWithHttpInfo(id: number, request: ModelsCaptureTransactionRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdCapturePostWithHttpInfo(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param id Transaction ID
     * @param request Capture Request
     */
    public apiV1TransactionsIdCapturePost(id: number, request: ModelsCaptureTransactionRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdCapturePost(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdConfirmPostWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdConfirmPostWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdConfirmPost(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdConfirmPost(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param id Transaction ID
     */
    public apiV1TransactionsIdGetWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdGetWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param id Transaction ID
     */
    public apiV1TransactionsIdGet(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdGet(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param id Transaction ID
     * @param request Refund Request
     */
    public apiV1TransactionsIdRefundPostWithHttpInfo(id: number, request: ModelsRefundTransactionRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdRefundPostWithHttpInfo(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param id Transaction ID
     * @param request Refund Request
     */
    public apiV1TransactionsIdRefundPost(id: number, request: ModelsRefundTransactionRequest, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdRefundPost(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdRejectPostWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsTransaction>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdRejectPostWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdRejectPost(id: number, _options?: PromiseConfigurationOptions): Promise<ModelsTransaction> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.apiV1TransactionsIdRejectPost(id, observableOptions);
        return result.toPromise();
    }


}



import { ObservableWebhooksApi } from './ObservableAPI';

import { WebhooksApiRequestFactory, WebhooksApiResponseProcessor} from "../apis/WebhooksApi";
export class PromiseWebhooksApi {
    private api: ObservableWebhooksApi

    public constructor(
        configuration: Configuration,
        requestFactory?: WebhooksApiRequestFactory,
        responseProcessor?: WebhooksApiResponseProcessor
    ) {
        this.api = new ObservableWebhooksApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     */
    public adminWebhooksGetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<ModelsWebhook>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksGetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     */
    public adminWebhooksGet(_options?: PromiseConfigurationOptions): Promise<Array<ModelsWebhook>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksGet(observableOptions);
        return result.toPromise();
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param id Webhook ID
     */
    public adminWebhooksIdDeleteWithHttpInfo(id: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<void>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksIdDeleteWithHttpInfo(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param id Webhook ID
     */
    public adminWebhooksIdDelete(id: number, _options?: PromiseConfigurationOptions): Promise<void> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksIdDelete(id, observableOptions);
        return result.toPromise();
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param id Webhook ID
     * @param request Webhook Request
     */
    public adminWebhooksIdPutWithHttpInfo(id: number, request: ModelsWebhookRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsWebhook>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksIdPutWithHttpInfo(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param id Webhook ID
     * @param request Webhook Request
     */
    public adminWebhooksIdPut(id: number, request: ModelsWebhookRequest, _options?: PromiseConfigurationOptions): Promise<ModelsWebhook> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksIdPut(id, request, observableOptions);
        return result.toPromise();
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param request Webhook Request
     */
    public adminWebhooksPostWithHttpInfo(request: ModelsWebhookRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ModelsWebhook>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksPostWithHttpInfo(request, observableOptions);
        return result.toPromise();
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param request Webhook Request
     */
    public adminWebhooksPost(request: ModelsWebhookRequest, _options?: PromiseConfigurationOptions): Promise<ModelsWebhook> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.adminWebhooksPost(request, observableOptions);
        return result.toPromise();
    }


}



