// @ts-nocheck
import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions, mergeConfiguration } from '../configuration'
import type { Middleware } from '../middleware';
import { Observable, of, from } from '../rxjsStub';
import {mergeMap, map} from  '../rxjsStub';
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

import { AdminApiRequestFactory, AdminApiResponseProcessor} from "../apis/AdminApi";
export class ObservableAdminApi {
    private requestFactory: AdminApiRequestFactory;
    private responseProcessor: AdminApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: AdminApiRequestFactory,
        responseProcessor?: AdminApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new AdminApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new AdminApiResponseProcessor();
    }

    /**
     * Retrieve all test cards
     * List cards
     */
    public adminCardsGetWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsCard>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminCardsGet(_config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminCardsGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve all test cards
     * List cards
     */
    public adminCardsGet(_options?: ConfigurationOptions): Observable<Array<ModelsCard>> {
        return this.adminCardsGetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Array<ModelsCard>>) => apiResponse.data));
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param id Card ID
     */
    public adminCardsIdGetWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsCard>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminCardsIdGet(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminCardsIdGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a single test card
     * Get card by ID
     * @param id Card ID
     */
    public adminCardsIdGet(id: number, _options?: ConfigurationOptions): Observable<ModelsCard> {
        return this.adminCardsIdGetWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsCard>) => apiResponse.data));
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     */
    public adminDashboardGetWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<ModelsDashboardResponse>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminDashboardGet(_config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminDashboardGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve dashboard statistics for admin panel
     * Admin dashboard statistics
     */
    public adminDashboardGet(_options?: ConfigurationOptions): Observable<ModelsDashboardResponse> {
        return this.adminDashboardGetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<ModelsDashboardResponse>) => apiResponse.data));
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     */
    public adminErrorScenariosGetWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsErrorScenario>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminErrorScenariosGet(_config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminErrorScenariosGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve active error scenarios
     * List error scenarios
     */
    public adminErrorScenariosGet(_options?: ConfigurationOptions): Observable<Array<ModelsErrorScenario>> {
        return this.adminErrorScenariosGetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Array<ModelsErrorScenario>>) => apiResponse.data));
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param id Scenario ID
     */
    public adminErrorScenariosIdGetWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsErrorScenario>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminErrorScenariosIdGet(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminErrorScenariosIdGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a single error scenario
     * Get error scenario by ID
     * @param id Scenario ID
     */
    public adminErrorScenariosIdGet(id: number, _options?: ConfigurationOptions): Observable<ModelsErrorScenario> {
        return this.adminErrorScenariosIdGetWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsErrorScenario>) => apiResponse.data));
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public adminMerchantsGetWithHttpInfo(limit?: number, offset?: number, _options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsMerchant>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminMerchantsGet(limit, offset, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminMerchantsGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve paginated list of merchants
     * List merchants
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public adminMerchantsGet(limit?: number, offset?: number, _options?: ConfigurationOptions): Observable<Array<ModelsMerchant>> {
        return this.adminMerchantsGetWithHttpInfo(limit, offset, _options).pipe(map((apiResponse: HttpInfo<Array<ModelsMerchant>>) => apiResponse.data));
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param id Merchant ID
     */
    public adminMerchantsIdGetWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsMerchant>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminMerchantsIdGet(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminMerchantsIdGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a single merchant details
     * Get merchant by ID
     * @param id Merchant ID
     */
    public adminMerchantsIdGet(id: number, _options?: ConfigurationOptions): Observable<ModelsMerchant> {
        return this.adminMerchantsIdGetWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsMerchant>) => apiResponse.data));
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param id Merchant ID
     */
    public adminMerchantsIdWebhooksGetWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsWebhook>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminMerchantsIdWebhooksGet(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminMerchantsIdWebhooksGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve webhooks for a merchant
     * Get merchant webhooks
     * @param id Merchant ID
     */
    public adminMerchantsIdWebhooksGet(id: number, _options?: ConfigurationOptions): Observable<Array<ModelsWebhook>> {
        return this.adminMerchantsIdWebhooksGetWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<Array<ModelsWebhook>>) => apiResponse.data));
    }

}

import { PaymentsApiRequestFactory, PaymentsApiResponseProcessor} from "../apis/PaymentsApi";
export class ObservablePaymentsApi {
    private requestFactory: PaymentsApiRequestFactory;
    private responseProcessor: PaymentsApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: PaymentsApiRequestFactory,
        responseProcessor?: PaymentsApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new PaymentsApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new PaymentsApiResponseProcessor();
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param request 3DS Request
     */
    public apiV13dsChallengePostWithHttpInfo(request: ModelsThreeDSChallengeRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsThreeDSChallengeResponse>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV13dsChallengePost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV13dsChallengePostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Generate a 3D Secure challenge for a card
     * Generate 3DS challenge
     * @param request 3DS Request
     */
    public apiV13dsChallengePost(request: ModelsThreeDSChallengeRequest, _options?: ConfigurationOptions): Observable<ModelsThreeDSChallengeResponse> {
        return this.apiV13dsChallengePostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsThreeDSChallengeResponse>) => apiResponse.data));
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param request Capture Request
     */
    public apiV1CapturesPostWithHttpInfo(request: HandlersCaptureRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1CapturesPost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1CapturesPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Capture an authorized hold transaction
     * Capture a hold
     * @param request Capture Request
     */
    public apiV1CapturesPost(request: HandlersCaptureRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1CapturesPostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param request Charge Request
     */
    public apiV1ChargesPostWithHttpInfo(request: ServicesChargeRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1ChargesPost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1ChargesPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Create a new charge transaction
     * Process a charge
     * @param request Charge Request
     */
    public apiV1ChargesPost(request: ServicesChargeRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1ChargesPostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param request Hold Request
     */
    public apiV1HoldsPostWithHttpInfo(request: ServicesChargeRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1HoldsPost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1HoldsPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Authorize a hold on a card
     * Place a hold
     * @param request Hold Request
     */
    public apiV1HoldsPost(request: ServicesChargeRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1HoldsPostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param request Refund Request
     */
    public apiV1RefundsPostWithHttpInfo(request: HandlersRefundRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1RefundsPost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1RefundsPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Issue a refund for a completed transaction
     * Process a refund
     * @param request Refund Request
     */
    public apiV1RefundsPost(request: HandlersRefundRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1RefundsPostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public apiV1TransactionsGetWithHttpInfo(limit?: number, offset?: number, _options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsTransaction>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsGet(limit, offset, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve paginated list of transactions
     * List transactions
     * @param [limit] Limit
     * @param [offset] Offset
     */
    public apiV1TransactionsGet(limit?: number, offset?: number, _options?: ConfigurationOptions): Observable<Array<ModelsTransaction>> {
        return this.apiV1TransactionsGetWithHttpInfo(limit, offset, _options).pipe(map((apiResponse: HttpInfo<Array<ModelsTransaction>>) => apiResponse.data));
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param id Transaction ID
     * @param [request] 3DS Authentication
     */
    public apiV1TransactionsId3dsCompletePostWithHttpInfo(id: number, request?: ModelsThreeDSAuthenticateRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsThreeDSAuthenticateResponse>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsId3dsCompletePost(id, request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsId3dsCompletePostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Authenticate a transaction requiring 3DS
     * Complete 3D Secure authentication
     * @param id Transaction ID
     * @param [request] 3DS Authentication
     */
    public apiV1TransactionsId3dsCompletePost(id: number, request?: ModelsThreeDSAuthenticateRequest, _options?: ConfigurationOptions): Observable<ModelsThreeDSAuthenticateResponse> {
        return this.apiV1TransactionsId3dsCompletePostWithHttpInfo(id, request, _options).pipe(map((apiResponse: HttpInfo<ModelsThreeDSAuthenticateResponse>) => apiResponse.data));
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param id Transaction ID
     * @param request Capture Request
     */
    public apiV1TransactionsIdCapturePostWithHttpInfo(id: number, request: ModelsCaptureTransactionRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsIdCapturePost(id, request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsIdCapturePostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Capture an authorized hold amount
     * Capture a hold
     * @param id Transaction ID
     * @param request Capture Request
     */
    public apiV1TransactionsIdCapturePost(id: number, request: ModelsCaptureTransactionRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1TransactionsIdCapturePostWithHttpInfo(id, request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdConfirmPostWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsIdConfirmPost(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsIdConfirmPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Mark a pending transaction as completed
     * Confirm a pending transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdConfirmPost(id: number, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1TransactionsIdConfirmPostWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param id Transaction ID
     */
    public apiV1TransactionsIdGetWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsIdGet(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsIdGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a single transaction details
     * Get transaction by ID
     * @param id Transaction ID
     */
    public apiV1TransactionsIdGet(id: number, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1TransactionsIdGetWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param id Transaction ID
     * @param request Refund Request
     */
    public apiV1TransactionsIdRefundPostWithHttpInfo(id: number, request: ModelsRefundTransactionRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsIdRefundPost(id, request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsIdRefundPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Issue a refund for a completed or captured transaction
     * Refund a transaction
     * @param id Transaction ID
     * @param request Refund Request
     */
    public apiV1TransactionsIdRefundPost(id: number, request: ModelsRefundTransactionRequest, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1TransactionsIdRefundPostWithHttpInfo(id, request, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdRejectPostWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsTransaction>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.apiV1TransactionsIdRejectPost(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.apiV1TransactionsIdRejectPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Mark a transaction as failed
     * Reject a transaction
     * @param id Transaction ID
     */
    public apiV1TransactionsIdRejectPost(id: number, _options?: ConfigurationOptions): Observable<ModelsTransaction> {
        return this.apiV1TransactionsIdRejectPostWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<ModelsTransaction>) => apiResponse.data));
    }

}

import { WebhooksApiRequestFactory, WebhooksApiResponseProcessor} from "../apis/WebhooksApi";
export class ObservableWebhooksApi {
    private requestFactory: WebhooksApiRequestFactory;
    private responseProcessor: WebhooksApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: WebhooksApiRequestFactory,
        responseProcessor?: WebhooksApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new WebhooksApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new WebhooksApiResponseProcessor();
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     */
    public adminWebhooksGetWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Array<ModelsWebhook>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminWebhooksGet(_config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminWebhooksGetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve webhooks for the authenticated merchant
     * List webhooks
     */
    public adminWebhooksGet(_options?: ConfigurationOptions): Observable<Array<ModelsWebhook>> {
        return this.adminWebhooksGetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Array<ModelsWebhook>>) => apiResponse.data));
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param id Webhook ID
     */
    public adminWebhooksIdDeleteWithHttpInfo(id: number, _options?: ConfigurationOptions): Observable<HttpInfo<void>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminWebhooksIdDelete(id, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminWebhooksIdDeleteWithHttpInfo(rsp)));
            }));
    }

    /**
     * Remove a webhook configuration
     * Delete webhook
     * @param id Webhook ID
     */
    public adminWebhooksIdDelete(id: number, _options?: ConfigurationOptions): Observable<void> {
        return this.adminWebhooksIdDeleteWithHttpInfo(id, _options).pipe(map((apiResponse: HttpInfo<void>) => apiResponse.data));
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param id Webhook ID
     * @param request Webhook Request
     */
    public adminWebhooksIdPutWithHttpInfo(id: number, request: ModelsWebhookRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsWebhook>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminWebhooksIdPut(id, request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminWebhooksIdPutWithHttpInfo(rsp)));
            }));
    }

    /**
     * Update an existing webhook configuration
     * Update webhook
     * @param id Webhook ID
     * @param request Webhook Request
     */
    public adminWebhooksIdPut(id: number, request: ModelsWebhookRequest, _options?: ConfigurationOptions): Observable<ModelsWebhook> {
        return this.adminWebhooksIdPutWithHttpInfo(id, request, _options).pipe(map((apiResponse: HttpInfo<ModelsWebhook>) => apiResponse.data));
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param request Webhook Request
     */
    public adminWebhooksPostWithHttpInfo(request: ModelsWebhookRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ModelsWebhook>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.adminWebhooksPost(request, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.adminWebhooksPostWithHttpInfo(rsp)));
            }));
    }

    /**
     * Register a new webhook endpoint
     * Create webhook
     * @param request Webhook Request
     */
    public adminWebhooksPost(request: ModelsWebhookRequest, _options?: ConfigurationOptions): Observable<ModelsWebhook> {
        return this.adminWebhooksPostWithHttpInfo(request, _options).pipe(map((apiResponse: HttpInfo<ModelsWebhook>) => apiResponse.data));
    }

}
