import { inject, injectable } from "inversify";
import { ServiceTypes } from "../services";
import ILoggingService from "../services/types/ILoggingService";
import ActionBase from "./actionBase";
import { IAction } from "./types/IAction";

import "cardinal-commerce-songbird-staging";
import IThreeDSService from "../services/types/IThreeDSService";
import { LogLevel } from "../domain/logLevel";
import IFramesService from "../services/types/IFramesService";

@injectable()
export default class ValidatePayment extends ActionBase implements IAction {
    constructor(
        @inject(ServiceTypes.FramesService) framesService: IFramesService,
        @inject(ServiceTypes.ThreeDSService) private threeDSService: IThreeDSService,
        @inject(ServiceTypes.LoggingService) logger: ILoggingService) {
            super(framesService, logger);
    }

    public createFramesControl(framesControlType: string, targetElement: string, options?: any): void {
        // There are no frames to setup so do nothing
    }

    public errors(): any[] {
        // TODO: Return any cardinal errors
        return [];
    }

    public async start() {
        try {
            if (!this.props.sessionId || this.props.sessionId.length <= 0 || typeof this.props.sessionId !== "string") throw new Error("Invalid sessionId");
            await this.threeDSService.initializeCardinal(this.props.sessionId);
            
        } catch (e) {
            this.logger.log(e, LogLevel.ERROR);
        }
    }

    public async complete() {
        // Validate the card initiating issuer vaidation if required
        return await this.threeDSService.verifyEnrollment(this.props.sessionId, this.props.paymentInstrumentId);
    }
}