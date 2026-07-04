import { Controller, Post, Body, Headers, BadRequestException } from "@nestjs/common";
import { OnboardingService } from "./onboarding.service";
import { Public } from "../auth/decorators";

@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  /** Onboard a new tenant and user */
  @Post()
  @Public() // Accessible to new users without database records yet
  async onboard(
    @Headers("authorization") authorization: string,
    @Body()
    body: {
      companyName: string;
      vertical: string;
      employees: number;
      country: string;
      domain?: string;
    }
  ) {
    if (!authorization) {
      throw new BadRequestException("No authorization header provided");
    }

    const token = authorization.replace("Bearer ", "");
    const result = await this.service.onboard(token, body);

    return {
      message: "Onboarding completed successfully",
      data: result,
    };
  }
}
